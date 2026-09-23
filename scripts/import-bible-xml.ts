/**
 * Import LOCAL et GENERIQUE d'une Bible au format XML (le meme que la S21) :
 *   <bible ...><testament ...><book number="1"><chapter number="1">
 *     <verse number="1">Au commencement, Dieu créa le ciel et la terre.</verse>
 *
 * Toute version importee ici est stockee dans la table `verses` (source = local),
 * donc lisible HORS LIGNE et sans aucune API. Reserve aux versions du DOMAINE
 * PUBLIC ou pour lesquelles tu as une AUTORISATION ecrite.
 *
 * Usage :
 *   npx tsx scripts/import-bible-xml.ts --file "darby.xml" --code FRDBY --name "Darby (1890)" --public
 *   npx tsx scripts/import-bible-xml.ts --file "s21.xml"   --code S21   --name "Segond 21" \
 *       --notice "Segond 21 © 2007 Société Biblique de Genève. Reproduit avec aimable autorisation."
 *
 * Options :
 *   --file <chemin>   le fichier XML (obligatoire ; le ~ et les guillemets sont geres)
 *   --code <CODE>     identifiant unique dans l'app, ex. FRDBY, S21 (obligatoire)
 *   --name "<Nom>"    nom affiche, ex. "Darby (1890)" (obligatoire)
 *   --public          marque la version comme domaine public (public_domain = true)
 *   --notice "<...>"  mention de copyright affichee sous le texte (versions sous licence)
 *   --lang <fr>       langue (defaut fr)
 */
import './load-env';
import { readFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Livres 1..66, ordre canonique protestant = numeros du fichier XML = table books.
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
function cleanVerse(raw: string): string {
  return decodeEntities(raw.replace(/<[^>]+>/g, ''))
    .replace(/\*/g, ' ').replace(/\s+/g, ' ').trim();
}

// Petit parseur d'arguments : --flag valeur, et --public sans valeur.
function args(argv: string[]) {
  const o: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (key === 'public') { o.public = true; continue; }
    if (next && !next.startsWith('--')) { o[key] = next; i++; } else { o[key] = true; }
  }
  return o;
}

async function main() {
  const o = args(process.argv.slice(2));
  let file = String(o.file ?? '').trim().replace(/^['"]|['"]$/g, '');
  if (file.startsWith('~')) file = os.homedir() + file.slice(1);
  const code = String(o.code ?? '').trim();
  const name = String(o.name ?? '').trim();
  const lang = String(o.lang ?? 'fr').trim();
  const isPublic = o.public === true;
  const notice = typeof o.notice === 'string' ? o.notice : (isPublic ? `${name}, domaine public` : null);

  if (!file || !existsSync(file) || !code || !name) {
    console.error('\n  Arguments manquants. Usage :');
    console.error('    npx tsx scripts/import-bible-xml.ts --file "version.xml" --code CODE --name "Nom" [--public] [--notice "..."]');
    console.error('  --file doit pointer sur un XML existant, --code et --name sont obligatoires.\n');
    if (file && !existsSync(file)) console.error('  Fichier introuvable :', file, '\n');
    process.exit(1);
  }
  if (!isPublic && !o.notice) {
    console.warn(`\n  ⚠ ${code} n'est pas marquee --public et n'a pas de --notice.`);
    console.warn('    Verifie que tu as le droit de l\'heberger (domaine public ou autorisation ecrite).\n');
  }

  const xml = readFileSync(file, 'utf8');

  await admin.from('books').upsert(
    BOOKS.map((b, i) => ({ id: i + 1, name: b[0], chapters: b[1], testament: b[2] })),
  );

  const bookRe = /<book\s+number="(\d+)"[^>]*>([\s\S]*?)<\/book>/g;
  const chapRe = /<chapter\s+number="(\d+)"[^>]*>([\s\S]*?)<\/chapter>/g;
  const verseRe = /<verse\s+number="(\d+)"[^>]*>([\s\S]*?)<\/verse>/g;

  const rows: Array<{ translation: string; book: number; chapter: number; verse: number; text: string }> = [];
  const booksSeen = new Set<number>();
  let bm: RegExpExecArray | null;
  while ((bm = bookRe.exec(xml))) {
    const book = +bm[1];
    if (book < 1 || book > 66) continue;
    booksSeen.add(book);
    let cm: RegExpExecArray | null;
    while ((cm = chapRe.exec(bm[2]))) {
      const chapter = +cm[1];
      let vm: RegExpExecArray | null;
      while ((vm = verseRe.exec(cm[2]))) {
        const text = cleanVerse(vm[2]);
        if (text) rows.push({ translation: code, book, chapter, verse: +vm[1], text });
      }
    }
  }

  console.log(`  ${code} — livres ${booksSeen.size}/66 · versets a inserer : ${rows.length}`);
  // Securite : on n'efface la version existante QUE si le fichier est complet.
  if (rows.length < 25000) {
    console.error("  ⛔ Fichier incomplet (< 25000 versets). Rien n'a ete modifie en base.\n");
    process.exit(1);
  }

  // Declare / met a jour la traduction, puis reimporte proprement.
  const { error: tErr } = await admin.from('translations').upsert({
    code, name, language: lang, enabled: true,
    source: 'local', api_id: null, public_domain: isPublic, notice,
  }, { onConflict: 'code' });
  if (tErr) { console.error('  translations:', tErr.message); process.exit(1); }

  await admin.from('verses').delete().eq('translation', code);

  const CHUNK = 800;
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await admin.from('verses').insert(slice);
    if (error) { console.error(`  insert ${i}:`, error.message); process.exit(1); }
    done += slice.length;
    if (i % (CHUNK * 10) === 0) console.log(`  … ${done}/${rows.length}`);
  }

  console.log(`\n  Termine. ${done} versets importes pour ${code} (${name}).`);
  console.log('  Disponible en local dans le lecteur et le comparateur — lisible hors ligne.');
}

main();
