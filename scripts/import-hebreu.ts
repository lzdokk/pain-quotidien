/**
 * BIBLE HEBRAIQUE COMPLETE (code HEB, langue he, lue de droite a gauche)
 *
 *   npx tsx scripts/import-hebreu.ts                 (Bible MHB 2010 complete)
 *   npx tsx scripts/import-hebreu.ts --nt delitzsch  (NT de Delitzsch 1885)
 *
 * Source principale : bibles/MHB 2010 (Hebrew Bible), toute la Bible avec
 * voyelles. Pour que la comparaison avec le francais reste alignee, chaque
 * chapitre de l'Ancien Testament dont le nombre de versets differe de la S21
 * (numerotation hebraique, ex. titres des Psaumes) est remplace par le texte
 * du mot-a-mot deja en base (verse_words), qui suit la numerotation francaise.
 *
 * Re-executable sans risque : la version HEB est effacee puis reimportee
 * seulement si les deux Testaments ont ete lus correctement.
 */
import './load-env';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const CODE = 'HEB';
const USE_DELITZSCH = process.argv.includes('delitzsch');
const NAME = 'Hébreu (Bible hébraïque)';
const NOTICE = 'Ancien Testament : texte massorétique (Westminster Leningrad Codex ; données STEPBible.org, CC BY 4.0). '
  + (USE_DELITZSCH
    ? 'Nouveau Testament : traduction hébraïque de Franz Delitzsch (1885), domaine public.'
    : 'Nouveau Testament : hébreu moderne (MHB 2010).');
const MHB_FILE = path.join(process.cwd(), 'bibles', 'MHB 2010 (Hebrew Bible)');
const NT_FILE = path.join(process.cwd(), 'bibles', 'DHNT 1885 (Hebrew Bible)');

type Row = { translation: string; book: number; chapter: number; verse: number; text: string };

const decode = (s: string) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/* ── Lecture d'un fichier XML (livres from..to) ────────────────────── */
function readXml(file: string, from: number, to: number): Row[] {
  if (!existsSync(file)) throw new Error(`Fichier introuvable : ${file}`);
  const xml = readFileSync(file, 'utf8');
  const rows: Row[] = [];
  const bookRe = /<book\s+number="(\d+)"[^>]*>([\s\S]*?)<\/book>/g;
  const chapRe = /<chapter\s+number="(\d+)"[^>]*>([\s\S]*?)<\/chapter>/g;
  const verseRe = /<verse\s+number="(\d+)"[^>]*>([\s\S]*?)<\/verse>/g;
  let bm: RegExpExecArray | null;
  while ((bm = bookRe.exec(xml))) {
    const book = +bm[1];
    if (book < from || book > to) continue;
    let cm: RegExpExecArray | null;
    while ((cm = chapRe.exec(bm[2]))) {
      let vm: RegExpExecArray | null;
      while ((vm = verseRe.exec(cm[2]))) {
        const text = decode(vm[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
        if (text) rows.push({ translation: CODE, book, chapter: +cm[1], verse: +vm[1], text });
      }
    }
  }
  return rows;
}

/* ── Ancien Testament (mot-a-mot hebreu deja en base) ──────────────── */
async function readWordsOT(): Promise<Row[]> {
  const rows: Row[] = [];
  for (let book = 1; book <= 39; book++) {
    const words: Array<{ chapter: number; verse: number; position: number; word: string }> = [];
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await admin.from('verse_words')
        .select('chapter, verse, position, word')
        .eq('book', book).eq('lang', 'hebreu')
        .order('chapter').order('verse').order('position')
        .range(from, from + PAGE - 1);
      if (error) throw new Error(`verse_words livre ${book} : ${error.message}`);
      words.push(...(data ?? []) as any[]);
      if (!data || data.length < PAGE) break;
    }
    const byVerse = new Map<string, string[]>();
    for (const w of words) {
      const k = `${w.chapter}:${w.verse}`;
      if (!byVerse.has(k)) byVerse.set(k, []);
      byVerse.get(k)!.push(w.word);
    }
    for (const [k, ws] of byVerse) {
      const [chapter, verse] = k.split(':').map(Number);
      rows.push({ translation: CODE, book, chapter, verse, text: ws.join(' ').replace(/\s+/g, ' ').trim() });
    }
    process.stdout.write(`  AT livre ${book}/39 · ${byVerse.size} versets\r`);
  }
  console.log('');
  return rows;
}

/* Nombre de versets par chapitre dans la S21 (numerotation francaise). */
async function frenchCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (let book = 1; book <= 39; book++) {
    const PAGE = 1000;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await admin.from('verses').select('chapter')
        .eq('translation', 'S21').eq('book', book).order('chapter').order('verse')
        .range(from, from + PAGE - 1);
      if (error) throw new Error(`S21 livre ${book} : ${error.message}`);
      for (const r of (data ?? []) as any[]) counts.set(`${book}:${r.chapter}`, (counts.get(`${book}:${r.chapter}`) ?? 0) + 1);
      if (!data || data.length < PAGE) break;
    }
  }
  return counts;
}

async function main() {
  console.log(`\n  Bible hébraïque complète (${CODE})\n`);

  // Ancien Testament : MHB 2010, chapitre par chapitre, sauf numerotation differente.
  const mhbOT = readXml(MHB_FILE, 1, 39);
  const words = await readWordsOT();
  const fr = await frenchCounts();
  const byChap = (rows: Row[]) => {
    const m = new Map<string, Row[]>();
    for (const r of rows) { const k = `${r.book}:${r.chapter}`; if (!m.has(k)) m.set(k, []); m.get(k)!.push(r); }
    return m;
  };
  const mhbC = byChap(mhbOT), wordsC = byChap(words);
  const ot: Row[] = [];
  let kept = 0, replaced = 0;
  const keys = new Set([...fr.keys(), ...mhbC.keys()]);
  for (const k of keys) {
    const m = mhbC.get(k), w = wordsC.get(k), n = fr.get(k);
    if (m && (!n || m.length === n)) { ot.push(...m); kept++; }
    else if (w) { ot.push(...w); replaced++; }
    else if (m) { ot.push(...m); kept++; }
  }
  console.log(`  AT : ${ot.length} versets (${kept} chapitres MHB, ${replaced} chapitres réalignés sur la numérotation française)`);

  // Nouveau Testament : MHB 2010 (voyelles) ou Delitzsch 1885.
  const nt = USE_DELITZSCH ? readXml(NT_FILE, 40, 66) : readXml(MHB_FILE, 40, 66);
  console.log(`  NT ${USE_DELITZSCH ? 'Delitzsch' : 'MHB 2010'} : ${nt.length} versets`);

  if (nt.length < 7000 || ot.length < 20000) {
    console.error('\n  ⛔ Un des deux Testaments est incomplet. Rien n\'a été modifié en base.');
    console.error('     (AT attendu ≈ 23 000 versets, NT attendu ≈ 7 900.)\n');
    process.exit(1);
  }

  const { error: tErr } = await admin.from('translations').upsert({
    code: CODE, name: NAME, language: 'he', enabled: true,
    source: 'local', api_id: null, public_domain: true, notice: NOTICE,
  }, { onConflict: 'code' });
  if (tErr) { console.error('  translations :', tErr.message); process.exit(1); }

  await admin.from('verses').delete().eq('translation', CODE);
  // Ancienne tentative eventuelle (Codex de Leningrad seul) : on la retire.
  await admin.from('verses').delete().eq('translation', 'WLC');
  await admin.from('translations').delete().eq('code', 'WLC');

  const all = [...ot, ...nt];
  const CHUNK = 800;
  for (let i = 0; i < all.length; i += CHUNK) {
    const { error } = await admin.from('verses').insert(all.slice(i, i + CHUNK));
    if (error) { console.error(`  insert ${i} :`, error.message); process.exit(1); }
    if (i % (CHUNK * 10) === 0) process.stdout.write(`  … ${Math.min(i + CHUNK, all.length)}/${all.length}\r`);
  }
  console.log(`\n\n  ✅ Terminé : ${all.length} versets hébreux (AT ${ot.length} + NT ${nt.length}).`);
  console.log('  Disponible dans Lire → Versions → Hébreu, et dans Comparer.\n');
}

main().catch(e => { console.error('\n  ⛔', e.message ?? e, '\n'); process.exit(1); });
