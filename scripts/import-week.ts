/**
 * MODE ZERO EURO, etape 2 sur 2.
 * Importe le JSON produit a la main et cree les sept journees.
 *   npx tsx scripts/import-week.ts out/semaine-2026-07-27.json
 */
import './load-env';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { WeekSchema } from '../lib/prompts/week';
import { fetchAelf, parseReadings, liturgicalInfo } from '../lib/aelf';

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const SUBS: Record<string, string> = {
  'Sg 12': 'Esaie 55.6-9', 'Sg 2': 'Psaume 22.7-9', 'Sg 7': 'Proverbes 8.22-31',
  'Si 3': 'Proverbes 23.22-25', 'Si 27': 'Proverbes 16.27-33', 'Tb 8': 'Genese 2.18-24',
  'Ba 5': 'Esaie 40.3-5', '2 M 7': 'Daniel 3.16-28'
};

async function versesOf(ref: string) {
  const m = ref.match(/^(.+?)\s+(\d+)[.:]?\s*(.*)$/); if (!m) return [];
  const { data: books } = await admin.from('books').select('id,name');
  const norm = m[1].trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const b = books?.find(x => x.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').startsWith(norm));
  if (!b) return [];
  const only: number[] = [];
  m[3].split(/[,;]/).forEach(part => {
    const r = part.trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (r) { for (let v = +r[1]; v <= +r[2]; v++) only.push(v); }
    else if (/^\d+$/.test(part.trim())) only.push(+part.trim());
  });
  let q = admin.from('verses').select('verse,text')
    .eq('translation', 'FRLSG').eq('book', b.id).eq('chapter', +m[2]).order('verse');
  if (only.length) q = q.in('verse', only);
  const { data } = await q;
  return (data ?? []).map(v => [v.verse, v.text] as [number, string]);
}

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('Usage : npx tsx scripts/import-week.ts <fichier.json>'); process.exit(1); }

  const parsed = WeekSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')));
  if (!parsed.success) {
    console.error('JSON invalide :');
    parsed.error.issues.forEach(i => console.error(`  ${i.path.join('.')} : ${i.message}`));
    process.exit(1);
  }

  const { data: run } = await admin.from('generation_runs').insert({
    kind: 'week', period_start: parsed.data.days[0].date,
    period_end: parsed.data.days.at(-1)!.date, status: 'running'
  }).select('id').single();

  let created = 0;
  for (const day of parsed.data.days) {
    const payload = await fetchAelf(day.date);
    const { season, week } = liturgicalInfo(payload);
    const raw = parseReadings(payload);

    await admin.from('daily_bread').upsert({
      date: day.date, week_id: run!.id,
      liturgical_season: season, liturgical_week: week,
      theme_title: day.theme_title, theme_lede: day.theme_lede,
      central_message: day.central_message,
      verse_text: day.verse.text, verse_ref: day.verse.ref,
      bread_lead: day.bread_lead, bread_says: day.bread_says, bread_touches: day.bread_touches,
      actions: day.actions, prayer_open: day.prayer_open, prayer_close: day.prayer_close,
      evening_verse: day.evening.verse, evening_verse_ref: day.evening.verse_ref,
      evening_title: day.evening.title, evening_meditation: day.evening.meditation,
      evening_review: day.evening.review, prayer_night: day.evening.prayer,
      witness_thread: day.witness.thread, witness_openers: day.witness.openers,
      objection_q: day.witness.objection_q, objection_a: day.witness.objection_a,
      model: 'import manuel', published: false
    });

    await admin.from('readings').delete().eq('date', day.date);
    const rows = [];
    for (let i = 0; i < raw.length; i++) {
      const r = raw[i];
      const key = r.reference.split(',')[0].trim();
      const reference = r.deuterocanonical ? (SUBS[key] ?? 'Esaie 55.6-9') : r.reference;
      const verses = await versesOf(reference);
      if (!verses.length) continue;
      const sum = day.reading_summaries.find(s => s.position === i + 1);
      rows.push({
        date: day.date, position: i + 1, reference,
        title: sum?.title ?? r.title, tag: sum?.tag ?? '',
        verses, summary: sum?.summary ?? '', canon_note: r.deuterocanonical
      });
    }
    await admin.from('readings').insert(rows);
    created++;
    console.log(`${day.date} : ${day.theme_title}`);
  }

  await admin.from('generation_runs').update({
    status: created === parsed.data.days.length ? 'ok' : 'partial',
    days_created: created, cost_usd: 0, ended_at: new Date().toISOString()
  }).eq('id', run!.id);

  console.log(`\n${created} journees importees, cout zero.`);
}
main();
