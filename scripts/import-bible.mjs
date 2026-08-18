#!/usr/bin/env node
/**
 * IMPORT D'UNE BIBLE FRANÇAISE LIBRE, EN LOCAL
 * ────────────────────────────────────────────
 * Télécharge une Bible au format JSON « livres → chapitres → versets » (le
 * format le plus répandu, dit « thiagobodruk »), et la range dans ta table
 * Supabase `verses`, puis l'enregistre dans `translations` (source='local').
 * Une fois importée, elle apparaît dans le lecteur et le comparateur, hors
 * ligne et sans limite.
 *
 * FORMAT JSON attendu (tableau de 66 livres, ordre canonique protestant) :
 *   [ { "abbrev":"gn", "chapters":[ ["v1","v2",...], ["..."] ] }, ... ]
 *
 * USAGE :
 *   node scripts/import-bible.mjs \
 *     --url "https://raw.githubusercontent.com/.../fr_xxx.json" \
 *     --code OST --name "Ostervald 1881" [--public] [--replace]
 *
 *   --url / --file   source distante (URL) OU fichier local
 *   --code           code unique dans l'app (ex. OST, BCC, LAU)
 *   --name           nom affiché
 *   --public         marque la version comme domaine public (défaut: oui)
 *   --replace        réimporte proprement (efface d'abord les versets du code)
 *
 * PRÉREQUIS : .env.local avec NEXT_PUBLIC_SUPABASE_URL et
 *             SUPABASE_SERVICE_ROLE_KEY (les mêmes que le reste du projet).
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// ── mini-parseur d'arguments ──────────────────────────────────────────
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) {
    const key = a.slice(2);
    const next = process.argv[i + 1];
    if (!next || next.startsWith('--')) { args[key] = true; }
    else { args[key] = next; i++; }
  }
}

// ── chargement .env.local (sans dépendance) ───────────────────────────
for (const file of ['.env.local', '.env']) {
  const full = path.join(process.cwd(), file);
  if (!existsSync(full)) continue;
  for (const raw of readFileSync(full, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(k in process.env)) process.env[k] = v;
  }
}

const URL_SUPA = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_SUPA || !KEY) {
  console.error('✗ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env.local');
  process.exit(1);
}
if (!args.code || !args.name || (!args.url && !args.file)) {
  console.error('Usage : node scripts/import-bible.mjs --url <URL> --code <CODE> --name "<Nom>" [--public] [--replace]');
  process.exit(1);
}

const admin = createClient(URL_SUPA, KEY);
const code = String(args.code).toUpperCase();
const clean = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function loadSource() {
  if (args.file) return JSON.parse(readFileSync(path.resolve(String(args.file)), 'utf8'));
  console.log(`→ Téléchargement ${args.url}`);
  const r = await fetch(String(args.url));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function toRows(data) {
  // Format « livres → chapitres → versets » : tableau de 66 livres.
  if (!Array.isArray(data)) throw new Error('Format inattendu : un tableau de livres est attendu.');
  const rows = [];
  data.forEach((bk, bi) => {
    const book = bi + 1;                       // ordre canonique 1..66
    const chapters = bk.chapters ?? bk.chapitres ?? [];
    chapters.forEach((verses, ci) => {
      verses.forEach((txt, vi) => {
        const text = clean(txt);
        if (text) rows.push({ translation: code, book, chapter: ci + 1, verse: vi + 1, text });
      });
    });
  });
  return rows;
}

async function main() {
  const data = await loadSource();
  const rows = toRows(data);
  if (rows.length < 20000) {
    console.warn(`⚠ Seulement ${rows.length} versets trouvés (une Bible complète en compte ~31 000). Vérifie la source.`);
  }
  console.log(`→ ${rows.length} versets préparés pour « ${args.name} » (${code}).`);

  // 1) Enregistrer / mettre à jour la traduction.
  const isPublic = args.public !== false;     // domaine public par défaut
  const { error: te } = await admin.from('translations').upsert({
    code, name: String(args.name), language: 'fr',
    public_domain: isPublic, enabled: true, source: 'local'
  });
  if (te) throw te;

  // 2) Réimport propre si demandé.
  if (args.replace) {
    console.log('→ Suppression des versets existants pour ce code…');
    await admin.from('verses').delete().eq('translation', code);
  }

  // 3) Insertion par lots.
  const CHUNK = 2000;
  let done = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = rows.slice(i, i + CHUNK);
    const { error } = await admin.from('verses').upsert(batch, { onConflict: 'translation,book,chapter,verse' });
    if (error) throw error;
    done += batch.length;
    process.stdout.write(`\r→ Insérés ${done}/${rows.length}`);
  }
  process.stdout.write('\n');
  console.log(`✓ « ${args.name} » (${code}) importée. Elle apparaît dans le lecteur et le comparateur.`);
}

main().catch(e => { console.error('\n✗', e.message ?? e); process.exit(1); });
