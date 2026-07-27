import './load-env';
import { admin } from '../lib/supabase/admin';

/**
 * Import du lexique Strong, hebreu et grec.
 *
 * Source : Strong's Exhaustive Concordance (James Strong, 1890), domaine public.
 * Version JSON du projet openscriptures/strongs (Ulrik Petersen).
 * Environ 14 000 entrees, importees une seule fois, ensuite gratuites a vie.
 *
 *   npm run seed:strongs
 */

const SOURCES = [
  {
    lang: 'grec',
    prefix: 'G',
    url: 'https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js',
    varName: 'strongsGreekDictionary'
  },
  {
    lang: 'hebreu',
    prefix: 'H',
    url: 'https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js',
    varName: 'strongsHebrewDictionary'
  }
];

const clean = (s?: string) => (s ?? '').replace(/\s+/g, ' ').trim() || null;

async function importOne(src: typeof SOURCES[number]) {
  console.log(`\nTelechargement du lexique ${src.lang}...`);
  const r = await fetch(src.url);
  if (!r.ok) throw new Error(`${src.lang} : HTTP ${r.status}`);
  const js = await r.text();

  // Le fichier est du JavaScript : "var strongsXDictionary = { ... };"
  const start = js.indexOf('{', js.indexOf(src.varName));
  const end = js.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error(`${src.lang} : format inattendu`);
  const dict = JSON.parse(js.slice(start, end + 1)) as Record<string, any>;

  const rows = Object.entries(dict).map(([code, v]) => ({
    code,
    lang: src.lang,
    num: Number(code.replace(/^\D+/, '')) || 0,
    lemma: clean(v.lemma),
    translit: clean(v.translit),
    pronunciation: clean(v.pron),
    definition_en: clean(v.strongs_def),
    derivation: clean(v.derivation),
    kjv_def: clean(v.kjv_def)
  }));

  console.log(`${rows.length} entrees a importer.`);
  let done = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const slice = rows.slice(i, i + 500);
    const { error } = await admin.from('strongs').upsert(slice, { onConflict: 'code' });
    if (error) { console.error(error.message); continue; }
    done += slice.length;
    process.stdout.write(`\r  ${done}/${rows.length}`);
  }
  console.log(`\n${src.lang} : ${done} entrees importees.`);
}

async function main() {
  for (const s of SOURCES) await importOne(s);
  const { count } = await admin.from('strongs').select('code', { count: 'exact', head: true });
  console.log(`\nLexique Strong complet : ${count} entrees en base. Cout zero.`);
}

main().catch(e => { console.error(e); process.exit(1); });
