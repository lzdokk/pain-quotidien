/**
 * Charge .env.local pour les scripts lances a la main.
 *
 * Next.js lit .env.local tout seul, mais un script execute avec tsx ne le fait
 * pas. Ce fichier doit donc etre importe EN PREMIER dans chaque script.
 * Aucune dependance, lecture directe du fichier.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

let loaded: string | null = null;

for (const file of ['.env.local', '.env']) {
  const full = path.join(process.cwd(), file);
  if (!existsSync(full)) continue;
  loaded = file;

  for (const raw of readFileSync(full, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
  break;
}

/* ── Controle avant de continuer ──────────────────────────────────── */
const REQUIRED = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = REQUIRED.filter(k => !process.env[k]);

if (missing.length) {
  console.error('\n  Configuration incomplete.\n');
  if (!loaded) {
    console.error('  Aucun fichier .env.local trouve dans ' + process.cwd());
    console.error('\n  Corrige avec :');
    console.error('    cp .env.example .env.local');
    console.error('    open -e .env.local\n');
    console.error('  Puis colle tes trois valeurs Supabase et enregistre.\n');
  } else {
    console.error(`  Le fichier ${loaded} existe mais il manque :`);
    missing.forEach(k => console.error(`    ${k}`));
    console.error('\n  Ces valeurs se trouvent dans Supabase :');
    console.error('    Project Settings, engrenage en bas du menu, puis API.');
    console.error('    Attention, la cle service_role est masquee, clique Reveal.\n');
  }
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) {
  console.error(`\n  NEXT_PUBLIC_SUPABASE_URL a une forme inattendue :\n    ${url}`);
  console.error('  Elle doit ressembler a https://abcdefgh.supabase.co\n');
  process.exit(1);
}

console.log(`  Configuration chargee depuis ${loaded}`);
