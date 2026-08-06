#!/usr/bin/env node
/**
 * Importateur STEPBible → table `verse_words`.
 *
 * Lit un ou plusieurs fichiers TAHOT (hébreu) / TAGNT (grec) de STEPBible
 * (licence CC BY) et remplit `verse_words` : chaque mot de chaque verset avec
 * sa forme d'origine, sa glose courte et son numéro Strong canonique (pour
 * joindre la table `strongs` et afficher le sens français au clic).
 *
 * Usage (depuis la racine du projet) :
 *   NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
 *   node scripts/import-stepbible.mjs "TAHOT Gen-Deu ... .txt" "TAGNT Mat-Jhn ... .txt"
 *
 * Ré-exécutable sans risque (upsert sur la clé book/chapter/verse/position).
 */
import fs from 'node:fs';
import readline from 'node:readline';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('❌ Définis NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans l’environnement.');
  process.exit(1);
}
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('❌ Donne au moins un fichier : node scripts/import-stepbible.mjs <fichier...>');
  process.exit(1);
}

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// Abréviations STEPBible → id de livre (ordre protestant 1..66).
const BOOKS = {
  Gen:1,Exo:2,Lev:3,Num:4,Deu:5,Jos:6,Jdg:7,Rut:8,'1Sa':9,'2Sa':10,'1Ki':11,'2Ki':12,
  '1Ch':13,'2Ch':14,Ezr:15,Neh:16,Est:17,Job:18,Psa:19,Pro:20,Ecc:21,Sng:22,Isa:23,Jer:24,
  Lam:25,Eze:26,Dan:27,Hos:28,Joe:29,Amo:30,Oba:31,Jon:32,Mic:33,Nah:34,Hab:35,Zep:36,
  Hag:37,Zec:38,Mal:39,Mat:40,Mar:41,Luk:42,Jhn:43,Act:44,Rom:45,'1Co':46,'2Co':47,Gal:48,
  Eph:49,Php:50,Col:51,'1Th':52,'2Th':53,'1Ti':54,'2Ti':55,Tit:56,Phm:57,Heb:58,Jas:59,
  '1Pe':60,'2Pe':61,'1Jn':62,'2Jn':63,'3Jn':64,Jud:65,Rev:66
};

const REF_RE = /^([0-9A-Za-z]+)\.(\d+)\.(\d+)/;                 // Gen.1.1(-01)
const HEB = /[֐-׿]/;                                  // caractères hébreux
const GRC = /[Ͱ-Ͽἀ-῿]/;                     // caractères grecs
const STRONGS_FIELD = /[HG]\d{1,4}[A-Za-z]?=/;                  // champ contenant les codes
const GRAMMATICAL = /^[HG]9\d{3}/;                              // morphèmes grammaticaux STEPBible

function canonStrong(code) {
  const m = code.match(/^([HGhg])0*(\d+)[a-z]?$/);
  return m ? m[1].toUpperCase() + m[2] : null;
}
function cleanGloss(raw) {
  return (raw || '').split('_§')[0].split('§')[0].split('@')[0].split('|')[0].replace(/_/g, ' ').trim();
}
// Extrait { strong, gloss, lang } du champ "extended strongs".
function parseStrongs(field) {
  for (const morph of field.split('/')) {
    const eq = morph.indexOf('=');
    if (eq < 0) continue;
    const code = morph.slice(0, eq).trim();
    if (!/^[HG]\d/i.test(code) || GRAMMATICAL.test(code)) continue; // saute prefixes/articles
    const parts = morph.split('=');
    const gloss = cleanGloss(parts.slice(2).join('='));
    const strong = canonStrong(code);
    if (!strong) continue;
    return { strong, gloss, lang: strong[0] === 'H' ? 'hebreu' : 'grec' };
  }
  return null;
}

let rows = [];
const counters = new Map(); // "book.chapter.verse" -> position courant
let totalParsed = 0, totalUp = 0, skippedNoBook = new Set();

async function flush(force = false) {
  if (rows.length === 0 || (!force && rows.length < 2000)) return;
  const batch = rows; rows = [];
  const { error } = await sb.from('verse_words')
    .upsert(batch, { onConflict: 'book,chapter,verse,position' });
  if (error) { console.error('❌ Upsert:', error.message); process.exit(1); }
  totalUp += batch.length;
  process.stdout.write(`\r  ${totalUp.toLocaleString('fr-FR')} mots importés…`);
}

async function importFile(path) {
  console.log(`\n📖 ${path}`);
  const rl = readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity });
  for await (const line of rl) {
    const cols = line.split('\t');
    if (cols.length < 3) continue;
    const raw0 = cols[0].trim();
    // Ignore en-têtes, licences, séparateurs, blocs interlinéaires « # … ».
    if (!raw0 || raw0.startsWith('#') || raw0.startsWith('=')) continue;
    // Grec : la réf est préfixée du numéro de livre (« 45_Act.001.001 »).
    const refStr = raw0.replace(/^\d+_/, '');
    const m = refStr.match(REF_RE);
    if (!m) continue;
    const bookId = BOOKS[m[1]];
    if (!bookId) { skippedNoBook.add(m[1]); continue; }
    const chapter = +m[2], verse = +m[3];

    let word, strong = null, gloss = null, lang;

    // Hébreu (TAHOT) : strong + glose embarqués « Hxxxx=mot=glose » dans un champ.
    const embedded = cols.find(c => STRONGS_FIELD.test(c));
    if (embedded) {
      const info = parseStrongs(embedded);
      strong = info?.strong ?? null; gloss = info?.gloss ?? null; lang = info?.lang ?? 'hebreu';
      word = cols.find(c => c !== embedded && (HEB.test(c) || GRC.test(c)) && !c.includes('/'))
          || cols.find(c => c !== embedded && (HEB.test(c) || GRC.test(c)));
    } else {
      // Grec (TAGNT) : colonne Strong autonome « Gxxxx » ; glose = 3 colonnes après.
      const si = cols.findIndex(c => /^[HG]\d{1,4}[a-z]?$/.test(c.trim()));
      if (si < 0) continue;
      strong = canonStrong(cols[si].trim());
      lang = strong && strong[0] === 'H' ? 'hebreu' : 'grec';
      gloss = si + 3 < cols.length ? cleanGloss(cols[si + 3]) : null;
      word = cols.find(c => (HEB.test(c) || GRC.test(c)) && !c.includes('/'))
          || cols.find(c => (HEB.test(c) || GRC.test(c)));
    }
    if (!word) continue;

    const k = `${bookId}.${chapter}.${verse}`;
    const position = (counters.get(k) ?? 0) + 1;
    counters.set(k, position);

    rows.push({
      book: bookId, chapter, verse, position,
      lang: lang ?? (HEB.test(word) ? 'hebreu' : 'grec'),
      word: word.trim(), strong, gloss
    });
    totalParsed++;
    await flush(false);
  }
  await flush(true);
}

for (const f of files) {
  if (!fs.existsSync(f)) { console.error(`❌ Introuvable : ${f}`); continue; }
  await importFile(f);
}
await flush(true);

console.log(`\n\n✅ Terminé : ${totalParsed.toLocaleString('fr-FR')} mots analysés, ${totalUp.toLocaleString('fr-FR')} en base.`);
if (skippedNoBook.size) console.log('⚠️  Abréviations de livre non reconnues (ignorées) :', [...skippedNoBook].join(', '));
