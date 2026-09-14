import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/* Emails admin (bypass) — meme reglage que le cursus. */
const ADMINS = (process.env.CURSUS_ADMINS ?? 'lzdokk@gmail.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

/* ══════════════════════════════════════════════════════════════════
   DIAGNOSTIC DU POOL LLM
   -----------------------------------------------------------------
   Ouvre simplement :  /api/diag   (en etant CONNECTE avec ton email
   admin) — aucun secret a taper. Sinon : /api/diag?key=TON_CRON_SECRET
   -> Montre, SANS jamais reveler les cles :
      • ce que le serveur lit vraiment dans LLM_POOL / LLM_PROVIDER
      • pour chaque entree : le fournisseur, le nom de la variable
        d'env attendue, si la cle est PRESENTE, le modele utilise
      • un PING reel de chaque fournisseur (une requete minuscule),
        avec le code HTTP exact (429 = quota, 503 = surcharge,
        401/403 = mauvaise cle, 404 = modele absent, 200 = OK)
   C'est l'outil pour savoir en 5 secondes POURQUOI la generation
   echoue, au lieu de deviner.
   ══════════════════════════════════════════════════════════════════ */

type Provider = 'gemini' | 'groq' | 'mistral' | 'cerebras'
  | 'nvidia' | 'openrouter' | 'anthropic';

const KEY_ENV: Record<string, string> = {
  gemini: 'GOOGLE_AI_KEY', groq: 'GROQ_API_KEY', mistral: 'MISTRAL_API_KEY',
  cerebras: 'CEREBRAS_API_KEY', nvidia: 'NVIDIA_API_KEY',
  openrouter: 'OPENROUTER_API_KEY', anthropic: 'ANTHROPIC_API_KEY',
};
const MODEL_ENV: Record<string, string> = {
  gemini: 'GEMINI_MODEL', groq: 'GROQ_MODEL', mistral: 'MISTRAL_MODEL',
  cerebras: 'CEREBRAS_MODEL', nvidia: 'NVIDIA_MODEL',
  openrouter: 'OPENROUTER_MODEL', anthropic: 'ANTHROPIC_MODEL',
};
const MODEL_DEFAULT: Record<string, string> = {
  gemini: 'gemini-flash-latest', groq: 'llama-3.3-70b-versatile',
  mistral: 'mistral-small-latest', cerebras: 'llama3.1-8b',
  nvidia: 'meta/llama-3.3-70b-instruct',
  openrouter: 'meta-llama/llama-3.1-8b-instruct:free',
  anthropic: 'claude-sonnet-5',
};
const modelFor = (p: string) => process.env[MODEL_ENV[p]] || MODEL_DEFAULT[p];

const OPENAI_URL: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  cerebras: 'https://api.cerebras.ai/v1/chat/completions',
  nvidia: 'https://integrate.api.nvidia.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

const mask = (v?: string) =>
  !v ? null : v.length <= 8 ? '••••' : `${v.slice(0, 4)}…${v.slice(-4)} (${v.length})`;

/** Ping minimal : un seul mot demande, delai court. Renvoie {ok, status, ms, detail}. */
async function ping(provider: string, keyEnv: string): Promise<any> {
  const key = process.env[keyEnv] ?? '';
  const model = modelFor(provider);
  if (!key) return { ok: false, status: 0, detail: `cle absente (${keyEnv})` };
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    if (provider === 'gemini') {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST', headers: { 'content-type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
            generationConfig: { maxOutputTokens: 4 },
          }),
        });
      const body = await r.text();
      return { ok: r.ok, status: r.status, ms: Date.now() - t0, model,
        detail: r.ok ? 'OK' : body.slice(0, 180) };
    }
    if (provider === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal: ctrl.signal,
        headers: { 'content-type': 'application/json', 'x-api-key': key,
          'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: 4,
          messages: [{ role: 'user', content: 'ping' }] }),
      });
      const body = await r.text();
      return { ok: r.ok, status: r.status, ms: Date.now() - t0, model,
        detail: r.ok ? 'OK' : body.slice(0, 180) };
    }
    // groq / mistral / cerebras / nvidia / openrouter (compatibles OpenAI)
    const r = await fetch(OPENAI_URL[provider], {
      method: 'POST', signal: ctrl.signal,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, max_tokens: 4,
        messages: [{ role: 'user', content: 'ping' }] }),
    });
    const body = await r.text();
    return { ok: r.ok, status: r.status, ms: Date.now() - t0, model,
      detail: r.ok ? 'OK' : body.slice(0, 180) };
  } catch (e: any) {
    return { ok: false, status: e?.name === 'AbortError' ? 504 : -1,
      ms: Date.now() - t0, model, detail: e?.message?.slice(0, 180) ?? 'erreur reseau' };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const key = url.searchParams.get('key') ?? '';
  const auth = req.headers.get('authorization');

  // Acces autorise si : (1) tu es connecte avec ton email admin, OU
  // (2) tu fournis le CRON_SECRET (?key=... ou en-tete Bearer).
  let admin = false;
  try {
    const sb = await supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    admin = !!user?.email && ADMINS.includes(user.email.toLowerCase());
  } catch { /* pas connecte : on retombe sur le secret */ }

  const bySecret = !!process.env.CRON_SECRET &&
    (key === process.env.CRON_SECRET || auth === `Bearer ${process.env.CRON_SECRET}`);

  if (!admin && !bySecret) {
    return new NextResponse(
      'Non autorise. Connecte-toi avec ton email admin puis ouvre /api/diag, ' +
      'ou ajoute ?key=TON_CRON_SECRET.', { status: 401 });
  }

  const rawPool = process.env.LLM_POOL ?? '';
  const provider = process.env.LLM_PROVIDER ?? 'gemini';

  // Reconstitue le pool exactement comme lib/llm.ts.
  const parsed = rawPool.split(',').map(s => s.trim()).filter(Boolean).map(tok => {
    const [prov, keyEnv] = tok.split(':').map(x => x.trim());
    return { token: tok, provider: prov, keyEnv: keyEnv || KEY_ENV[prov] };
  });
  const active = parsed.filter(e => KEY_ENV[e.provider] && process.env[e.keyEnv]);
  const dropped = parsed.filter(e => !(KEY_ENV[e.provider] && process.env[e.keyEnv]));

  const doPing = url.searchParams.get('ping') !== '0'; // ?ping=0 pour ne pas consommer de quota
  const entries = active.length ? active : (
    // mode simple : un seul fournisseur
    KEY_ENV[provider] ? [{ token: provider, provider, keyEnv: KEY_ENV[provider] }] : []
  );

  const results = doPing
    ? await Promise.all(entries.map(async e => ({
        token: e.token, provider: e.provider, keyEnv: e.keyEnv,
        keySample: mask(process.env[e.keyEnv]), ...(await ping(e.provider, e.keyEnv)),
      })))
    : entries.map(e => ({
        token: e.token, provider: e.provider, keyEnv: e.keyEnv,
        keySample: mask(process.env[e.keyEnv]), pinged: false,
      }));

  // Variables Google frequemment utilisees, pour reperer un decalage de nom.
  const googleVars = ['GOOGLE_AI_KEY', 'GOOGLE_AI_KEY2', 'GOOGLE_AI_KEY3',
    'GOOGLE_AI_KEY4', 'GEMINI_API_KEY'];
  const googlePresence = Object.fromEntries(
    googleVars.map(v => [v, mask(process.env[v])]));

  const nbOk = results.filter((r: any) => r.ok).length;

  return NextResponse.json({
    resume: nbOk > 0
      ? `${nbOk} cle(s) fonctionnelle(s) sur ${results.length} — la generation DOIT passer.`
      : `AUCUNE cle fonctionnelle sur ${results.length}. Regarde 'status' de chaque ligne ci-dessous.`,
    mode: active.length ? 'pool' : 'simple',
    LLM_POOL_brut: rawPool || '(vide)',
    LLM_PROVIDER: provider,
    GEMINI_MODEL: process.env.GEMINI_MODEL || `(non defini → defaut ${MODEL_DEFAULT.gemini})`,
    entrees_actives: active.map(e => e.token),
    entrees_ignorees_cle_absente: dropped.map(e => `${e.token} (cherche ${e.keyEnv})`),
    cles_google_vues: googlePresence,
    tests: results,
    aide: {
      '200': 'OK — cette cle marche',
      '429': 'quota epuise (Google : ~50 req/jour/projet en gratuit ; 2 cles du MEME projet Google partagent le quota — il faut des PROJETS/COMPTES differents)',
      '503': 'surcharge Google — patiente, ou mets GEMINI_MODEL=gemini-flash-latest',
      '401/403': 'cle invalide ou API non activee sur ce projet Google',
      '404': 'modele retire/introuvable — mets GEMINI_MODEL=gemini-flash-latest (suit le dernier Flash stable)',
      '0': 'variable d\'env absente : le nom dans LLM_POOL ne correspond a aucune cle definie dans Vercel',
    },
  }, { headers: { 'cache-control': 'no-store' } });
}
