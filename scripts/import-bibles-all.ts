/**
 * Import GROUPE de toutes les Bibles listees dans bibles/manifest.json.
 *   npx tsx scripts/import-bibles-all.ts
 *
 * Chaque entree du manifeste :
 *   { "file": "nom-du-fichier", "code": "FRBBB", "name": "...",
 *     "public": true }              // domaine public
 *   { "file": "...", "code": "...", "name": "...",
 *     "notice": "© ... (mention)" } // version sous licence (autorisation requise)
 *
 * Tout est importe en source=local (lisible hors ligne, sans API). Le script
 * n'ecrase une version existante QUE si le fichier est complet (>= 25000 versets).
 */
import './load-env';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BOOKS: Array<[string, number, 'AT' | 'NT']> = [
  ['Genese', 50, 'AT'], ['Exode', 40, 'AT'], ['Levitique', 27, 'AT'], ['Nombres', 36, 'AT'], ['Deuteronome', 34, 'AT'],
  ['Josue', 24, 'AT'], ['Juges', 21, 'AT'], ['Ruth', 4, 'AT'], ['1 Samuel', 31, 'AT'], ['2 Samuel', 24, 'AT'],
  ['1 Rois', 22, 'AT'], ['2 Rois', 25, 'AT'], ['1 Chroniques', 29, 'AT'], ['2 Chroniques', 36, 'AT'], ['Esdras', 10, 'AT'],
  ['Nehemie', 13, 'AT'], ['Esther', 10, 'AT'], ['Job', 42, 'AT'], ['Psaumes', 150, 'AT'], ['Proverbes', 31, 'AT'],
  ['Ecclesiaste', 12, 'AT'], ['Cantique des cantiques', 8, 'AT'], ['Esaie', 66, 'AT'], ['Jeremie', 52, 'AT'], ['Lamentations', 5, 'AT'],
  ['Ezechiel', 48, 'AT'], ['Daniel', 12, 'AT'], ['Osee', 14, 'AT'], ['Joel', 3, 'AT'], ['Amos', 9, 'AT'],
  ['Abdias', 1, 'AT'], ['Jonas', 4, 'AT'], ['Michee', 7, 'AT'], ['Nahum', 3, 'AT'], ['Habacuc', 3, 'AT'],
  ['Sophonie', 3, 'AT'], ['Aggee', 2, 'AT'], ['Zacharie', 14, 'AT'], ['Malachie', 4, 'AT'],
  ['Matthieu', 28, 'NT'], ['Marc', 16, 'NT'], ['Luc', 24, 'NT'], ['Jean', 21, 'NT'], ['Actes', 28, 'NT'],
  ['Romains', 16, 'NT'], ['1 Corinthiens', 16, 'NT'], ['2 Corinthiens', 13, 'NT'], ['Galates', 6, 'NT'], ['Ephesiens', 6, 'NT'],
  ['Philippiens', 4, 'NT'], ['Colossiens', 4, 'NT'], ['1 Thessaloniciens', 5, 'NT'], ['2 Thessaloniciens', 3, 'NT'], ['1 Timothee', 6, 'NT'],
  ['2 Timothee', 4, 'NT'], ['Tite', 3, 'NT'], ['Philemon', 1, 'NT'], ['Hebreux', 13, 'NT'], ['Jacques', 5, 'NT'],
  ['1 Pierre', 5, 'NT'], ['2 Pierre', 3, 'NT'], ['1 Jean', 5, 'NT'], ['2 Jean', 1, 'NT'], ['3 Jean', 1, 'NT'],
  ['Jude', 1, 'NT'], ['Apocalypse', 22, 'NT'],
];

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
const cleanVerse = (raw: string) =>
  decodeEntities(raw.replace(/<[^>]+>/g, '')).replace(/\*/g, ' ').replace(/\s+/g, ' ').trim();

type Entry = { file: string; code: string; name: string; public?: boolean; notice?: string; lang?: string };

async function importOne(dir: string, e: Entry): Promise<boolean> {
  const full = path.join(dir, e.file);
  if (!existsSync(full)) { console.error(`  ✗ ${e.code} : fichier introuvable (${e.file})`); return false; }
  const xml = readFileSync(full, 'utf8');

  const bookRe = /<book\s+number="(\d+)"[^>]*>([\s\S]*?)<\/book>/g;
  const chapRe = /<chapter\s+number="(\d+)"[^>]*>([\s\S]*?)<\/chapter>/g;
  const verseRe = /<verse\s+number="(\d+)"[^>]*>([\s\S]*?)<\/verse>/g;
  const rows: Array<{ translation: string; book: number; chapter: number; verse: number; text: string }> = [];
  const seen = new Set<number>();
  let bm: RegExpExecArray | null;
  while ((bm = bookRe.exec(xml))) {
    const book = +bm[1]; if (book < 1 || book > 66) continue; seen.add(book);
    let cm: RegExpExecArray | null;
    while ((cm = chapRe.exec(bm[2]))) {
      const chapter = +cm[1];
      let vm: RegExpExecArray | null;
      while ((vm = verseRe.exec(cm[2]))) {
        const text = cleanVerse(vm[2]);
        if (text) rows.push({ translation: e.code, book, chapter, verse: +vm[1], text });
      }
    }
  }
  if (rows.length < 25000) {
    console.error(`  ⛔ ${e.code} : seulement ${rows.length} versets (< 25000) — ignoree, rien de modifie.`);
    return false;
  }

  const isPublic = e.public === true;
  const notice = e.notice ?? (isPublic ? `${e.name}, domaine public` : null);
  const { error: tErr } = await admin.from('translations').upsert({
    code: e.code, name: e.name, language: e.lang ?? 'fr', enabled: true,
    source: 'local', api_id: null, public_domain: isPublic, notice,
  }, { onConflict: 'code' });
  if (tErr) { console.error(`  ✗ ${e.code} translations:`, tErr.message); return false; }

  await admin.from('verses').delete().eq('translation', e.code);
  const CHUNK = 800;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await admin.from('verses').insert(rows.slice(i, i + CHUNK));
    if (error) { console.error(`  ✗ ${e.code} insert ${i}:`, error.message); return false; }
  }
  console.log(`  ✓ ${e.code} — ${e.name} : ${rows.length} versets (${seen.size}/66 livres)${isPublic ? ' · domaine public' : ' · sous licence'}`);
  return true;
}

async function main() {
  const dir = path.join(process.cwd(), 'bibles');
  const manifestPath = path.join(dir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error('\n  bibles/manifest.json introuvable. Cree-le (ou demande-moi de le remplir).\n');
    process.exit(1);
  }
  const entries: Entry[] = JSON.parse(readFileSync(manifestPath, 'utf8'));
  console.log(`\n  ${entries.length} version(s) a importer depuis bibles/ :\n`);

  await admin.from('books').upsert(
    BOOKS.map((b, i) => ({ id: i + 1, name: b[0], chapters: b[1], testament: b[2] })),
  );

  let ok = 0;
  for (const e of entries) if (await importOne(dir, e)) ok++;

  console.log(`\n  Termine. ${ok}/${entries.length} version(s) importee(s) en local (lisibles hors ligne).\n`);
}

main();
