/**
 * Import LOCAL de la Segond 21 dans Supabase, depuis le fichier XML officiel
 * fourni par la Société Biblique de Genève (avec autorisation écrite).
 *
 *   npx tsx scripts/import-s21.ts "chemin/vers/bible s21.xml"
 *
 * Le fichier attendu a cette forme (66 livres numérotés 1..66, ordre canonique
 * protestant, identique à la table `books`) :
 *   <bible translation="..." status="© ... Société Biblique de Genève ...">
 *     <testament name="Old"><book number="1"><chapter number="1">
 *       <verse number="1">Au commencement, Dieu créa le ciel et la terre.</verse>
 *
 * Le texte est stocké dans la table `verses` (source = local), avec la mention
 * de copyright dans `translations.notice`. Réexécutable : on efface d'abord les
 * versets S21 existants, puis on réimporte proprement.
 */
import './load-env';
import { readFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const CODE = 'S21';
const NOTICE = 'Segond 21 © 2007 Société Biblique de Genève. '
  + 'Reproduit avec aimable autorisation. Tous droits réservés.';

// Livres, dans l'ordre EXACT des numéros 1..66 du fichier et de la table books.
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

/** Décode les entités XML/HTML courantes. */
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Nettoie le texte d'un verset : pas de balises, pas de marqueur de renvoi (*),
 *  espaces normalisés. On garde les guillemets « », apostrophes et accents. */
function cleanVerse(raw: string): string {
  return decodeEntities(raw.replace(/<[^>]+>/g, ''))
    .replace(/\*/g, ' ')       // les * signalent un renvoi dans la S21
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  // Nettoie l'argument : enleve d'eventuels guillemets colles et etend le ~.
  let file = (process.argv[2] ?? '').trim().replace(/^['"]|['"]$/g, '');
  if (file.startsWith('~')) file = os.homedir() + file.slice(1);

  if (!file || !existsSync(file)) {
    console.error('\n  Fichier introuvable :', file || '(aucun chemin donne)');
    console.error('\n  Usage — le plus simple : tape la commande sans le chemin,');
    console.error('  puis GLISSE le fichier XML dans la fenetre du Terminal :');
    console.error('    npx tsx scripts/import-s21.ts <glisse le fichier ici>\n');
    console.error('  Ou indique le chemin complet, ex :');
    console.error('    npx tsx scripts/import-s21.ts ~/Downloads/"bible s21.xml"\n');
    process.exit(1);
  }
  console.log('  Fichier :', file);

  const xml = readFileSync(file, 'utf8');

  // 1. S'assurer que la table books est peuplée (idempotent).
  await admin.from('books').upsert(
    BOOKS.map((b, i) => ({ id: i + 1, name: b[0], chapters: b[1], testament: b[2] })),
  );

  // 2. Déclarer / mettre à jour la traduction S21 (source locale + copyright).
  const { error: tErr } = await admin.from('translations').upsert({
    code: CODE, name: 'Segond 21', language: 'fr', enabled: true,
    source: 'local', api_id: null, public_domain: false, notice: NOTICE,
  }, { onConflict: 'code' });
  if (tErr) { console.error('translations:', tErr.message); process.exit(1); }

  // 3. Parcourir livres → chapitres → versets et collecter les lignes.
  //    (On NE touche PAS encore a la base : on efface seulement plus bas, une
  //    fois qu'on est SUR que le fichier est complet.)
  const bookRe = /<book\s+number="(\d+)"[^>]*>([\s\S]*?)<\/book>/g;
  const chapRe = /<chapter\s+number="(\d+)"[^>]*>([\s\S]*?)<\/chapter>/g;
  const verseRe = /<verse\s+number="(\d+)"[^>]*>([\s\S]*?)<\/verse>/g;

  const rows: Array<{ translation: string; book: number; chapter: number; verse: number; text: string }> = [];
  let bm: RegExpExecArray | null;
  const booksSeen = new Set<number>();

  while ((bm = bookRe.exec(xml))) {
    const book = +bm[1];
    if (book < 1 || book > 66) continue;
    booksSeen.add(book);
    const bookBody = bm[2];
    let cm: RegExpExecArray | null;
    while ((cm = chapRe.exec(bookBody))) {
      const chapter = +cm[1];
      const chapBody = cm[2];
      let vm: RegExpExecArray | null;
      while ((vm = verseRe.exec(chapBody))) {
        const verse = +vm[1];
        const text = cleanVerse(vm[2]);
        if (text) rows.push({ translation: CODE, book, chapter, verse, text });
      }
    }
  }

  console.log(`  Livres trouvés : ${booksSeen.size}/66 · versets à insérer : ${rows.length}`);

  // SECURITE : on n'efface la S21 existante QUE si le nouveau fichier est
  // complet. Ainsi, passer par erreur un mauvais fichier (0 verset) ne detruit
  // JAMAIS un import deja en place.
  if (rows.length < 25000) {
    console.error("  ⛔ Fichier incomplet (moins de 25000 versets). Rien n'a été modifié en base.");
    console.error('     Vérifie que tu passes bien le fichier XML de la S21 (et non le script).');
    process.exit(1);
  }

  // 4. On repart propre : on efface les versets S21 existants, puis on réinsère.
  await admin.from('verses').delete().eq('translation', CODE);

  // 5. Insertion par paquets (plus rapide et sous la limite de payload).
  const CHUNK = 800;
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error } = await admin.from('verses').insert(slice);
    if (error) { console.error(`  insert ${i}:`, error.message); process.exit(1); }
    done += slice.length;
    if (i % (CHUNK * 10) === 0) console.log(`  … ${done}/${rows.length}`);
  }

  console.log(`\n  Terminé. ${done} versets importés pour ${CODE}.`);
  console.log('  La S21 est maintenant disponible en local dans le lecteur et le comparateur.');
}

main();
