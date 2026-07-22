import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { fetchAelf, parseReadings, liturgicalInfo } from '@/lib/aelf';
import { getPassage, parseRef, bookIdByName } from '@/lib/bible';
import { callJSON, cost, modelName, PROVIDER } from '@/lib/llm';
import { WeekSchema, WEEK_SYSTEM, weekUserPrompt } from '@/lib/prompts/week';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const iso = (d: Date) => d.toISOString().slice(0, 10);

/**
 * GENERATION HEBDOMADAIRE
 * Tourne le dimanche a 02h00 Paris. Produit les sept jours de la semaine
 * suivante, en une seule passe, et les enregistre en base non publies.
 * La publication se fait ensuite jour par jour par le cron quotidien,
 * ce qui laisse une semaine entiere pour relire ou corriger.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 1);          // demain
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setUTCDate(d.getUTCDate() + i); return iso(d);
  });

  const { data: run } = await admin.from('generation_runs')
    .insert({ kind: 'week', period_start: dates[0], period_end: dates[6] })
    .select('id').single();
  const runId = run!.id;

  try {
    // ── 1. Calendrier de lectures, avec substitution du canon ────────
    const prepared = [];
    for (const date of dates) {
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
          verses: passage.verses.map(v => [v.verse, v.text] as [number, string])
        });
      }
      prepared.push({ date, season, week, readings });
    }

    // ── 2. Une seule generation pour les sept jours ──────────────────
    const { data, usage } = await callJSON(WeekSchema, {
      system: WEEK_SYSTEM,
      user: weekUserPrompt(prepared.map(p => ({
        date: p.date, season: p.season, week: p.week,
        readings: p.readings.map(r => ({
          position: r.position, reference: r.reference, title: r.title,
          text: r.text, substituted: r.substituted
        }))
      }))),
      maxTokens: 32000
    });

    // ── 3. Sauvegarde ───────────────────────────────────────────────
    let created = 0;
    for (const day of data.days) {
      const src = prepared.find(p => p.date === day.date);
      if (!src) continue;

      const { error } = await admin.from('daily_bread').upsert({
        date: day.date,
        week_id: runId,
        liturgical_season: src.season,
        liturgical_week: src.week,
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
        model: `${PROVIDER}/${modelName()}`,
        published: false
      });
      if (error) throw new Error(`${day.date} : ${error.message}`);

      await admin.from('readings').delete().eq('date', day.date);
      await admin.from('readings').insert(src.readings.map(r => {
        const sum = day.reading_summaries.find(s => s.position === r.position);
        return {
          date: day.date, position: r.position, reference: r.reference,
          title: sum?.title ?? r.title, tag: sum?.tag ?? '',
          verses: r.verses, summary: sum?.summary ?? '', canon_note: r.canonNote
        };
      }));
      created++;
    }

    await admin.from('generation_runs').update({
      status: created === 7 ? 'ok' : 'partial',
      days_created: created,
      input_tokens: usage.input, output_tokens: usage.output,
      cost_usd: cost(usage.input, usage.output),
      ended_at: new Date().toISOString()
    }).eq('id', runId);

    return NextResponse.json({
      ok: true, run: runId, days: created,
      range: [dates[0], dates[6]],
      cost_usd: +cost(usage.input, usage.output).toFixed(4)
    });

  } catch (e: any) {
    await admin.from('generation_runs').update({
      status: 'failed', error: String(e?.message ?? e), ended_at: new Date().toISOString()
    }).eq('id', runId);
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
