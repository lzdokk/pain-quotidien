/**
 * MODE ZERO EURO, etape 1 sur 2.
 * Prepare le prompt complet de la semaine et l'ecrit dans /out.
 * Tu le colles ensuite dans Claude, ChatGPT ou Gemini, cote interface,
 * donc sur ton abonnement existant et sans le moindre credit API.
 *
 *   npx tsx scripts/prompt-week.ts            # la semaine prochaine
 *   npx tsx scripts/prompt-week.ts 2026-08-03 # a partir d'une date
 */
import './load-env';
import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fetchAelf, parseReadings, liturgicalInfo } from '../lib/aelf';
import { WEEK_SYSTEM, weekUserPrompt } from '../lib/prompts/week';

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const iso = (d: Date) => d.toISOString().slice(0, 10);

const SUBS: Record<string, string> = {
  'Sg 12': 'Esaie 55.6-9', 'Sg 2': 'Psaume 22.7-9', 'Sg 7': 'Proverbes 8.22-31',
  'Si 3': 'Proverbes 23.22-25', 'Si 27': 'Proverbes 16.27-33', 'Tb 8': 'Genese 2.18-24',
  'Ba 5': 'Esaie 40.3-5', '2 M 7': 'Daniel 3.16-28'
};

async function passage(ref: string) {
  const m = ref.match(/^(.+?)\s+(\d+)[.:]?\s*(.*)$/);
  if (!m) return [];
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
  return data ?? [];
}

async function main() {
  const from = process.argv[2] ? new Date(process.argv[2]) : (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })();
  const dates = Array.from({ length: 7 }, (_, i) => { const d = new Date(from); d.setDate(d.getDate() + i); return iso(d); });

  const prepared = [];
  for (const date of dates) {
    const payload = await fetchAelf(date);
    const { season, week } = liturgicalInfo(payload);
    const raw = parseReadings(payload);
    const readings = [];
    for (let i = 0; i < raw.length; i++) {
      const r = raw[i];
      const key = r.reference.split(',')[0].trim();
      const reference = r.deuterocanonical ? (SUBS[key] ?? 'Esaie 55.6-9') : r.reference;
      const verses = await passage(reference);
      if (!verses.length) continue;
      readings.push({
        position: i + 1, reference, title: r.title,
        text: verses.map(v => `${v.verse}. ${v.text}`).join('\n'),
        substituted: r.deuterocanonical ? r.reference : undefined
      });
    }
    prepared.push({ date, season, week, readings });
    console.log(`${date} : ${readings.length} lectures`);
  }

  mkdirSync('out', { recursive: true });
  const file = `out/semaine-${dates[0]}.txt`;
  writeFileSync(file, `${WEEK_SYSTEM}\n\n${'═'.repeat(70)}\n\n${weekUserPrompt(prepared)}\n`);

  console.log(`\nPrompt ecrit dans ${file}`);
  console.log('Colle-le dans Claude, enregistre la reponse JSON dans');
  console.log(`out/semaine-${dates[0]}.json, puis lance :`);
  console.log(`  npx tsx scripts/import-week.ts out/semaine-${dates[0]}.json`);
}
main();
