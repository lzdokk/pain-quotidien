#!/usr/bin/env node
/**
 * IMPORT DES RÉFÉRENCES CROISÉES (openbible.info, licence CC BY)
 * ─────────────────────────────────────────────────────────────
 * 1. Télécharge le jeu de données : https://www.openbible.info/labs/cross-references/
 *    (fichier « cross_references.zip » → décompresse → cross_references.txt)
 * 2. Lance :  node scripts/import-crossrefs.mjs --file ./cross_references.txt
 *    Options : --min-votes 1  (ne garder que les liens votés au moins N fois)
 *
 * Le fichier est un TSV : « From Verse \t To Verse \t Votes »
 * Références au format OSIS : Gen.1.1  ·  plage : Gen.1.2-Gen.1.5
 *
 * PRÉREQUIS : .env.local avec NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * PRÉREQUIS SQL : migration 0027 (table cross_references) déjà exécutée.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// ── args ──────────────────────────────────────────────────────────────
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) { const n = process.argv[i + 1]; if (!n || n.startsWith('--')) args[a.slice(2)] = true; else { args[a.slice(2)] = n; i++; } }
}
if (!args.file) { console.error('Usage : node scripts/import-crossrefs.mjs --file ./cross_references.txt [--min-votes 1]'); process.exit(1); }
const MIN_VOTES = Number(args['min-votes'] ?? 0);

// ── .env.local ────────────────────────────────────────────────────────
for (const f of ['.env.local', '.env']) {
  const full = path.join(process.cwd(), f);
  if (!existsSync(full)) continue;
  for (const raw of readFileSync(full, 'utf8').split('\n')) {
    const l = raw.trim(); if (!l || l.startsWith('#')) continue;
    const eq = l.indexOf('='); if (eq === -1) continue;
    const k = l.slice(0, eq).trim(); const v = l.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(k in process.env)) process.env[k] = v;
  }
}
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error('✗ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis'); process.exit(1); }
const admin = createClient(URL, KEY);

// ── OSIS (openbible) → id de livre (1..66) ────────────────────────────
const OSIS_ID = {
  Gen:1,Exod:2,Lev:3,Num:4,Deut:5,Josh:6,Judg:7,Ruth:8,'1Sam':9,'2Sam':10,
  '1Kgs':11,'2Kgs':12,'1Chr':13,'2Chr':14,Ezra:15,Neh:16,Esth:17,Job:18,Ps:19,Prov:20,
  Eccl:21,Song:22,Isa:23,Jer:24,Lam:25,Ezek:26,Dan:27,Hos:28,Joel:29,Amos:30,
  Obad:31,Jonah:32,Mic:33,Nah:34,Hab:35,Zeph:36,Hag:37,Zech:38,Mal:39,Matt:40,
  Mark:41,Luke:42,John:43,Acts:44,Rom:45,'1Cor':46,'2Cor':47,Gal:48,Eph:49,Phil:50,
  Col:51,'1Thess':52,'2Thess':53,'1Tim':54,'2Tim':55,Titus:56,Phlm:57,Heb:58,Jas:59,'1Pet':60,
  '2Pet':61,'1John':62,'2John':63,'3John':64,Jude:65,Rev:66
};
const parseRef = (s) => { // "Gen.1.1" → {book,chapter,verse}
  const [b, c, v] = s.split('.');
  const book = OSIS_ID[b]; if (!book) return null;
  return { book, chapter: +c, verse: +v };
};

function main() {
  const lines = readFileSync(path.resolve(args.file), 'utf8').split('\n');
  const rows = [];
  let skipped = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('From Verse')) continue;          // en-tête
    const [from, to, votesStr] = t.split('\t');
    if (!from || !to) continue;
    const votes = Number(votesStr ?? 0) || 0;
    if (votes < MIN_VOTES) continue;

    const f = parseRef(from);
    const [toStart, toEnd] = to.split('-');
    const ts = parseRef(toStart);
    if (!f || !ts) { skipped++; continue; }
    // fin de plage : même livre/chapitre → on garde le verset de fin
    let toVerseEnd = null;
    if (toEnd) { const te = parseRef(toEnd); if (te && te.book === ts.book && te.chapter === ts.chapter) toVerseEnd = te.verse; }

    rows.push({
      from_book: f.book, from_chapter: f.chapter, from_verse: f.verse,
      to_book: ts.book, to_chapter: ts.chapter, to_verse_start: ts.verse,
      to_verse_end: toVerseEnd, votes
    });
  }
  console.log(`→ ${rows.length} références à insérer (${skipped} ignorées).`);
  return insert(rows);
}

async function insert(rows) {
  const CHUNK = 1000;
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK);
    const { error } = await admin.from('cross_references')
      .upsert(batch, { onConflict: 'from_book,from_chapter,from_verse,to_book,to_chapter,to_verse_start,to_verse_end', ignoreDuplicates: true });
    if (error) throw error;
    done += batch.length;
    process.stdout.write(`\r→ ${done}/${rows.length}`);
  }
  process.stdout.write('\n');
  console.log('✓ Références croisées importées.');
}

main().catch(e => { console.error('\n✗', e.message ?? e); process.exit(1); });
