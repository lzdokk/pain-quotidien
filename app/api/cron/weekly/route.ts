import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { fetchAelf, parseReadings, liturgicalInfo } from '@/lib/aelf';
import { getPassage } from '@/lib/bible';
import { callJSON, cost, modelName, PROVIDER } from '@/lib/llm';
import { DaySchema, WEEK_SYSTEM, dayUserPrompt, DAY_GEMINI_SCHEMA } from '@/lib/prompts/week';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const iso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * GENERATION HEBDOMADAIRE
 * Tourne le dimanche a 02h00 Paris. Produit les sept jours de la semaine
 * suivante, generes UN PAR UN pour garantir un JSON valide et court, et les
 * enregistre en base non publies. Un jour qui échoué n'annule pas les autres.
 * La publication se fait ensuite jour par jour par le cron quotidien.
 * Avec ?from=today, la génération commencé aujourd'hui au lieu de demain.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const start = new Date();
  if (params.get('from') !== 'today') start.setUTCDate(start.getUTCDate() + 1);
  const all = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setUTCDate(d.getUTCDate() + i); return iso(d);
  });
  // On genere par petits paquets pour tenir sous la limite de 60 s de Vercel.
  // ?days=3 (defaut) et ?skip=0, on rappelle en avancant skip de 3 en 3.
  const perRun = Math.min(Math.max(1, Number(params.get('days') ?? 3)), 7);
  const skip = Math.max(0, Number(params.get('skip') ?? 0));
  const dates = all.slice(skip, skip + perRun);

  const { data: run } = await admin.from('generation_runs')
    .insert({ kind: 'week', period_start: dates[0], period_end: dates[dates.length - 1] })
    .select('id').single();
  const runId = run!.id;

  let created = 0;
  let totalIn = 0, totalOut = 0;
  const errors: string[] = [];

  try {
    for (const date of dates) {
      try {
        // ── 1. Lectures du jour, avec substitution du canon ──────────
        const payload = await fetchAelf(date);
        const { season, week } = liturgicalInfo(payload);
        const raw = parseReadings(payload);

        const readings = [];
        for (let i = 0; i < raw.length; i++) {
          const r = raw[i];
          const reference = r.deuterocanonical ? r.substitute! : r.reference;
          const passage = await getPassage(reference, 'FRLSG');
          if (!passage) continue;
          readings.push({
            position: i + 1,
            reference,
            title: r.title,
            text: passage.verses.map(v => `${v.verse}. ${v.text}`).join('\n'),
            substituted: r.deuterocanonical ? r.reference : undefined,
            canonNote: r.deuterocanonical,
            verses: passage.verses.map(v => [v.verse, v.text] as [number, string]),
            book: passage.book,
            chapter: passage.chapter
          });
        }
        if (readings.length === 0) { errors.push(`${date} : aucune lecture exploitable`); continue; }

        // ── 2. Generation du seul jour ───────────────────────────────
        const { data: day, usage } = await callJSON(DaySchema, {
          system: WEEK_SYSTEM,
          user: dayUserPrompt({
            date, season, week,
            readings: readings.map(r => ({
              position: r.position, reference: r.reference, title: r.title,
              text: r.text, substituted: r.substituted
            }))
          }),
          responseSchema: DAY_GEMINI_SCHEMA,
          maxTokens: 24000
        });
        totalIn += usage.input; totalOut += usage.output;

        // ── 3. Sauvegarde ────────────────────────────────────────────
        const { error } = await admin.from('daily_bread').upsert({
          date,
          week_id: runId,
          liturgical_season: season,
          liturgical_week: week,
          theme_title: day.theme_title,
          theme_lede: day.theme_lede,
          central_message: day.central_message,
          verse_text: day.verse.text,
          verse_ref: day.verse.ref,
          bread_lead: day.bread_lead,
          bread_says: day.bread_says,
          bread_touches: day.bread_touches,
          actions: day.actions,
          prayer_open: day.prayer_open,
          prayer_close: day.prayer_close,
          evening_verse: day.evening.verse,
          evening_verse_ref: day.evening.verse_ref,
          evening_title: day.evening.title,
          evening_meditation: day.evening.meditation,
          evening_review: day.evening.review,
          prayer_night: day.evening.prayer,
          witness_thread: day.witness.thread,
          witness_openers: day.witness.openers,
          objection_q: day.witness.objection_q,
          objection_a: day.witness.objection_a,
          prayer_intro: day.prayers.intro,
          prayer_axes: day.prayers.axes,
          prayer_notre_pere: day.prayers.notre_pere,
          prayer_confession: day.prayers.confession,
          prayer_supplication: day.prayers.supplication,
          spirit_invitation: day.prayers.spirit_invitation,
          model: `${PROVIDER}/${modelName()}`,
          published: false
        });
        if (error) throw new Error(error.message);

        await admin.from('readings').delete().eq('date', date);
        await admin.from('readings').insert(readings.map(r => {
          const sum = day.reading_summaries.find(s => s.position === r.position);
          return {
            date, position: r.position, reference: r.reference,
            title: sum?.title ?? r.title, tag: sum?.tag ?? '',
            verses: r.verses, summary: sum?.summary ?? '', canon_note: r.canonNote,
            book: r.book, chapter: r.chapter
          };
        }));
        created++;
      } catch (dayErr: any) {
        errors.push(`${date} : ${String(dayErr?.message ?? dayErr)}`);
      }
    }

    await admin.from('generation_runs').update({
      status: created === dates.length ? 'ok' : created > 0 ? 'partial' : 'failed',
      days_created: created,
      input_tokens: totalIn, output_tokens: totalOut,
      cost_usd: cost(totalIn, totalOut),
      error: errors.length ? errors.join(' ; ') : null,
      ended_at: new Date().toISOString()
    }).eq('id', runId);

    revalidatePath('/');
    return NextResponse.json({
      ok: created > 0, run: runId, days: created,
      range: [dates[0], dates[dates.length - 1]],
      errors: errors.length ? errors : undefined,
      cost_usd: +cost(totalIn, totalOut).toFixed(4)
    });

  } catch (e: any) {
    await admin.from('generation_runs').update({
      status: 'failed', error: String(e?.message ?? e), ended_at: new Date().toISOString()
    }).eq('id', runId);
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
