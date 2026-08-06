#!/usr/bin/env node
/**
 * Importateur STEPBible → table `verse_words`.
 *
 * Lit les fichiers TAHOT (hébreu) / TAGNT (grec) de STEPBible (licence CC BY)
 * et remplit `verse_words` : chaque mot de chaque verset avec sa forme
 * d'origine, sa glose courte et son numéro Strong canonique (pour joindre la
 * table `strongs` et afficher le sens français au clic).
 *
 * Usage (depuis la racine du projet) :
 *   export NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
 *   export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *   node scripts/import-stepbible.mjs stepbible/TAHOT*.txt stepbible/TAGNT*.txt
 *
 * Ré-exécutable sans risque (upsert sur book/chapter/verse/position).
 */
import fs from 'node:fs';
import readline from 'node:readline';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('❌ Définis NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('❌ Donne au moins un fichier : node scripts/import-stepbible.mjs <fichier...>');
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { persistSession: false } });

// Abréviations STEPBible → id de livre (1..66), avec variantes d'orthographe.
const BOOKS = {
  Gen:1,Exo:2,Lev:3,Num:4,Deu:5,Jos:6,Jdg:7,Rut:8,'1Sa':9,'2Sa':10,'1Ki':11,'2Ki':12,
  '1Ch':13,'2Ch':14,Ezr:15,Neh:16,Est:17,Job:18,Psa:19,Pro:20,Ecc:21,Sng:22,Isa:23,Jer:24,
  Lam:25,Eze:26,Ezk:26,Dan:27,Hos:28,Joe:29,Jol:29,Amo:30,Oba:31,Jon:32,Mic:33,Nah:34,Nam:34,
  Hab:35,Zep:36,Hag:37,Zec:38,Mal:39,Mat:40,Mar:41,Mrk:41,Luk:42,Jhn:43,Act:44,Rom:45,
  '1Co':46,'2Co':47,Gal:48,Eph:49,Php:50,Col:51,'1Th':52,'2Th':53,'1Ti':54,'2Ti':55,Tit:56,
  Phm:57,Heb:58,Jas:59,'1Pe':60,'2Pe':61,'1Jn':62,'2Jn':63,'3Jn':64,Jud:65,Rev:66
};

const REF_RE = /^([0-9A-Za-z]+)\.(\d+)\.(\d+)#(\d+)/;   // Gen.1.1#01=L / Act.1.1#01=NKO
const HEB = /[֐-׿]/;                          // caractères hébreux
const GRC = /[Ͱ-Ͽἀ-῿]/;             // caractères grecs

function canonStrong(code) {
  if (!code) return null;
  const c = code.replace(/[{}]/g, '').trim();
  const m = c.match(/^([HG])0*(\d+)[A-Za-z]?$/i);   // enlève zéros initiaux + suffixe (A/G/J…)
  return m ? m[1].toUpperCase() + m[2] : null;
}
function cleanGloss(raw) {
  let g = (raw || '').trim().replace(/^:\s*/, '');
  g = g.split('»')[0].split('§')[0].split('@')[0].split('|')[0]; // garde le sens principal
  g = g.replace(/:\d.*$/, '');                                    // coupe une annotation ":1_xxx"
  return g.replace(/_/g, ' ').trim();
}

let rows = [];
let totalParsed = 0, totalUp = 0;
const skippedNoBook = new Set();

async function flush(force = false) {
  if (rows.length === 0 || (!force && rows.length < 2000)) return;
  const batch = rows; rows = [];
  // Dédoublonne sur la clé : STEPBible a parfois deux entrées au même
  // emplacement (variantes textuelles), et Postgres refuse la même clé
  // deux fois dans un seul upsert. On garde la dernière occurrence.
  const uniq = new Map();
  for (const r of batch) uniq.set(`${r.book}-${r.chapter}-${r.verse}-${r.position}`, r);
  const dedup = [...uniq.values()];
  const { error } = await sb.from('verse_words')
    .upsert(dedup, { onConflict: 'book,chapter,verse,position' });
  if (error) { console.error('\n❌ Upsert:', error.message); process.exit(1); }
  totalUp += dedup.length;
  process.stdout.write(`\r  ${totalUp.toLocaleString('fr-FR')} mots importés…`);
}

async function importFile(path) {
  console.log(`\n📖 ${path}`);
  const rl = readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity });
  for await (const line of rl) {
    const cols = line.split('\t');
    const raw0 = (cols[0] || '').trim();
    if (!raw0 || raw0.startsWith('#')) continue;      // commentaires / blocs interlinéaires
    const rm = raw0.match(REF_RE);
    if (!rm) continue;                                 // en-têtes / lignes non-donnée
    const bookId = BOOKS[rm[1]];
    if (!bookId) { skippedNoBook.add(rm[1]); continue; }
    const chapter = +rm[2], verse = +rm[3], position = +rm[4];

    const w1 = cols[1] || '';
    let word, strong = null, gloss = null, lang;

    if (HEB.test(w1)) {
      lang = 'hebreu';
      word = w1.replace(/[/\\]/g, '').trim();          // enlève les séparateurs de morphèmes
      // strong + glose depuis la colonne « Expanded Strong tags » : {Hxxxx=mot=glose}
      const exp = cols.find(c => /\{[HG]\d{1,4}[A-Za-z]?=[^=]*=/.test(c));
      const em = exp && exp.match(/\{([HG]\d{1,4}[A-Za-z]?)=[^=]*=([^}]*)\}/);
      if (em) { strong = canonStrong(em[1]); gloss = cleanGloss(em[2]); }
      else {
        const ds = cols.find(c => /\{[HG]\d/.test(c));
        const dm = ds && ds.match(/\{([HG]\d{1,4}[A-Za-z]?)\}/);
        if (dm) strong = canonStrong(dm[1]);
      }
    } else if (GRC.test(w1)) {
      lang = 'grec';
      word = w1.replace(/\s*\([^)]*\)\s*$/, '').trim(); // enlève « (translittération) »
      const dsi = cols.findIndex(c => /^[HG]\d{1,4}[A-Za-z]?=/.test(c)); // "G3588=T-ASM"
      if (dsi >= 0) {
        strong = canonStrong(cols[dsi].split('=')[0]);
        const gc = cols[dsi + 1] || '';                 // "ὁ=the/this/who"
        gloss = cleanGloss(gc.includes('=') ? gc.split('=').slice(1).join('=') : gc);
      }
    } else {
      continue;
    }
    if (!word) continue;

    rows.push({ book: bookId, chapter, verse, position, lang, word, strong, gloss });
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
if (skippedNoBook.size) console.log('⚠️  Abréviations non reconnues (ignorées) :', [...skippedNoBook].join(', '));
