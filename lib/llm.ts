/* ══════════════════════════════════════════════════════════════════
   COUCHE MODELE, INTERCHANGEABLE + POOL MULTI-CLES
   -----------------------------------------------------------------
   Mode simple  : LLM_PROVIDER = mistral|gemini|groq|cerebras|anthropic
   Mode pool    : LLM_POOL = "mistral, gemini, groq, cerebras"
                  Chaque appel pioche a tour de role (round-robin) ; si une
                  cle renvoie 429/erreur, on bascule AUTOMATIQUEMENT sur la
                  suivante. Chaque fournisseur a son propre quota gratuit :
                  on additionne les reserves et on n'est quasi jamais bloque.

   Plusieurs cles d'un meme fournisseur : "gemini, gemini:GOOGLE_AI_KEY2"
   (la 2e utilise la variable d'env GOOGLE_AI_KEY2).
   ══════════════════════════════════════════════════════════════════ */
import { z } from 'zod';

export type Provider = 'gemini' | 'groq' | 'mistral' | 'cerebras'
  | 'nvidia' | 'openrouter' | 'anthropic' | 'none';
export const PROVIDER = (process.env.LLM_PROVIDER ?? 'gemini') as Provider;

type Call = { system: string; user: string; maxTokens?: number; temperature?: number; responseSchema?: any; json?: boolean; timeoutMs?: number };
type Raw = { text: string; input: number; output: number };

/* Variable d'env de la cle, par fournisseur (valeur par defaut). */
const KEY_ENV: Record<Provider, string> = {
  gemini: 'GOOGLE_AI_KEY', groq: 'GROQ_API_KEY', mistral: 'MISTRAL_API_KEY',
  cerebras: 'CEREBRAS_API_KEY', nvidia: 'NVIDIA_API_KEY', openrouter: 'OPENROUTER_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY', none: ''
};

/* Modele par fournisseur : rapide et compatible palier gratuit / Vercel Hobby.
   Surchageable par variable d'env dediee (ex. MISTRAL_MODEL). */
const MODEL_ENV: Record<Provider, string> = {
  gemini: 'GEMINI_MODEL', groq: 'GROQ_MODEL', mistral: 'MISTRAL_MODEL',
  cerebras: 'CEREBRAS_MODEL', nvidia: 'NVIDIA_MODEL', openrouter: 'OPENROUTER_MODEL',
  anthropic: 'ANTHROPIC_MODEL', none: ''
};
const MODEL_DEFAULT: Record<Provider, string> = {
  gemini: 'gemini-flash-latest',
  groq: 'llama-3.3-70b-versatile',
  mistral: 'mistral-small-latest',
  cerebras: 'llama3.1-8b',
  nvidia: 'meta/llama-3.3-70b-instruct',
  openrouter: 'meta-llama/llama-3.1-8b-instruct:free',
  anthropic: 'claude-sonnet-5',
  none: 'aucun'
};
const modelFor = (p: Provider) => process.env[MODEL_ENV[p]] || MODEL_DEFAULT[p];

/* Tarifs $/million de tokens. Zero pour les paliers gratuits. */
const PRICING: Record<Provider, [number, number]> = {
  gemini: [0, 0], groq: [0, 0], mistral: [0, 0], cerebras: [0, 0],
  nvidia: [0, 0], openrouter: [0, 0], anthropic: [3, 15], none: [0, 0]
};

/* ── Le pool ──────────────────────────────────────────────────────── */
type PoolEntry = { provider: Provider; keyEnv: string };

function parsePool(): PoolEntry[] {
  const raw = process.env.LLM_POOL;
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean).map(tok => {
    const [prov, keyEnv] = tok.split(':').map(x => x.trim());
    const provider = prov as Provider;
    return { provider, keyEnv: keyEnv || KEY_ENV[provider] };
  }).filter(e => KEY_ENV[e.provider] && process.env[e.keyEnv]); // n'garde que les cles reellement presentes
}
const POOL = parsePool();

export const modelName = () =>
  POOL.length ? `pool(${POOL.map(e => e.provider).join('+')})` : modelFor(PROVIDER);
export const cost = (i: number, o: number) => {
  // Cout base sur le fournisseur primaire (les paliers gratuits sont a 0).
  const [pi, po] = PRICING[POOL[0]?.provider ?? PROVIDER];
  return (i / 1e6) * pi + (o / 1e6) * po;
};

/* Erreur avec code HTTP (utile pour le journal). En mode pool, on bascule
   sur la cle suivante quelle que soit l'erreur : quota (429), panne (5xx),
   mauvaise cle (401/403), modele absent (404), requete refusee (400)… Une
   cle qui echoue ne doit jamais bloquer tout le pool. */
class LLMError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

/* Delai maximum d'UN appel a un fournisseur. Sans plafond, un fournisseur qui
   ne repond pas fait tourner la fonction jusqu'a la coupure de Vercel (timeout).
   Avec ce plafond, on abandonne vite ce fournisseur et le pool bascule sur le
   suivant. Reglable par LLM_TIMEOUT_MS (defaut 30 s). */
const CALL_TIMEOUT_MS = Math.max(5000, Number(process.env.LLM_TIMEOUT_MS ?? 30_000));

/** fetch avec abandon automatique passe le delai imparti (ms surchargeable par appel). */
async function fetchT(url: string, init: RequestInit, ms = CALL_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new LLMError(504, `timeout ${ms} ms`);
    throw e;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Convertit un schema Gemini (types MAJUSCULES) en JSON Schema standard, pour
 * les fournisseurs compatibles OpenAI qui savent contraindre la sortie.
 */
function geminiToJsonSchema(s: any): any {
  if (!s || typeof s !== 'object') return s;
  const type = typeof s.type === 'string' ? s.type.toLowerCase() : undefined;
  const out: any = {};
  if (type) out.type = type;
  if (s.enum) out.enum = s.enum;
  if (s.properties) {
    out.properties = {};
    for (const k of Object.keys(s.properties)) out.properties[k] = geminiToJsonSchema(s.properties[k]);
    out.required = Array.isArray(s.required) ? [...s.required] : Object.keys(s.properties);
    out.additionalProperties = false;
  }
  if (s.items) out.items = geminiToJsonSchema(s.items);
  return out;
}

/* ── Google AI Studio ─────────────────────────────────────────────── */
async function gemini(c: Call, key: string, model: string): Promise<Raw> {
  const r = await fetchT(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: c.system }] },
        contents: [{ role: 'user', parts: [{ text: c.user }] }],
        generationConfig: {
          // JSON force uniquement quand on attend du JSON (callJSON). Le texte
          // libre (assistant, callText) reste en texte naturel.
          ...(c.json ? { responseMimeType: 'application/json' } : {}),
          ...(c.json && c.responseSchema ? { responseSchema: c.responseSchema } : {}),
          maxOutputTokens: c.maxTokens ?? 32000,
          temperature: c.temperature ?? 0.7
        }
      })
    }, c.timeoutMs);
  if (!r.ok) throw new LLMError(r.status, `gemini ${r.status} : ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return {
    text: j.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '',
    input: j.usageMetadata?.promptTokenCount ?? 0,
    output: j.usageMetadata?.candidatesTokenCount ?? 0
  };
}

/* ── Groq, Mistral, Cerebras : API compatible OpenAI ─────────────── */
const OPENAI_URL: Partial<Record<Provider, string>> = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  cerebras: 'https://api.cerebras.ai/v1/chat/completions',
  nvidia: 'https://integrate.api.nvidia.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions'
};

async function openaiLike(p: Provider, c: Call, key: string, model: string): Promise<Raw> {
  // Seul Mistral applique de facon fiable un json_schema strict ; pour Groq et
  // Cerebras on reste en json_object (le schema est decrit dans le prompt).
  const useSchema = p === 'mistral' && c.responseSchema;
  const responseFormat = useSchema
    ? { type: 'json_schema', json_schema: { name: 'result', schema: geminiToJsonSchema(c.responseSchema), strict: true } }
    : { type: 'json_object' };
  const r = await fetchT(OPENAI_URL[p]!, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      // response_format seulement quand on attend du JSON (callJSON) ; le texte
      // libre (assistant) reste du texte naturel.
      ...(c.json ? { response_format: responseFormat } : {}),
      max_tokens: c.maxTokens ?? 16000,
      temperature: c.temperature ?? 0.7,
      messages: [{ role: 'system', content: c.system }, { role: 'user', content: c.user }]
    })
  }, c.timeoutMs);
  if (!r.ok) throw new LLMError(r.status, `${p} ${r.status} : ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  return {
    text: j.choices?.[0]?.message?.content ?? '',
    input: j.usage?.prompt_tokens ?? 0,
    output: j.usage?.completion_tokens ?? 0
  };
}

/* ── Claude, payant ───────────────────────────────────────────────── */
async function anthropic(c: Call, key: string, model: string): Promise<Raw> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: key, timeout: c.timeoutMs ?? CALL_TIMEOUT_MS, maxRetries: 0 });
  const res = await client.messages.create({
    model, max_tokens: c.maxTokens ?? 8000,
    temperature: c.temperature ?? 0.7, system: c.system,
    messages: [{ role: 'user', content: c.user }]
  });
  const b = res.content.find(x => x.type === 'text');
  return {
    text: b && b.type === 'text' ? b.text : '',
    input: res.usage.input_tokens, output: res.usage.output_tokens
  };
}

function callProvider(provider: Provider, c: Call, keyEnv: string): Promise<Raw> {
  const key = process.env[keyEnv] ?? '';
  const model = modelFor(provider);
  switch (provider) {
    case 'gemini': return gemini(c, key, model);
    case 'groq': case 'mistral': case 'cerebras': case 'nvidia': case 'openrouter':
      return openaiLike(provider, c, key, model);
    case 'anthropic': return anthropic(c, key, model);
    default: throw new Error("Aucun fournisseur configure (LLM_PROVIDER='none').");
  }
}

/* Round-robin persistant dans l'instance serverless (repart a 0 au cold start). */
let cursor = 0;

/* Plafond global d'UN appel logique (avec toutes les bascules du pool). Meme si
   plusieurs cles rament, on ne depasse jamais ce budget : la fonction Vercel
   (300 s) n'est jamais bloquee par une seule generation. Reglable via
   LLM_OVERALL_MS (defaut 120 s). */
const OVERALL_MS = Math.max(CALL_TIMEOUT_MS, Number(process.env.LLM_OVERALL_MS ?? 120_000));

async function raw(c: Call): Promise<Raw> {
  // Mode simple : un seul fournisseur.
  if (POOL.length === 0) {
    if (PROVIDER === 'none') {
      throw new Error("LLM_PROVIDER vaut 'none'. Configure un fournisseur ou LLM_POOL.");
    }
    return callProvider(PROVIDER, c, KEY_ENV[PROVIDER]);
  }
  // Mode pool : on part de la position courante puis on bascule en cas d'echec.
  const n = POOL.length;
  const start = cursor % n;
  cursor = (cursor + 1) % n;
  // Le budget global s'adapte au delai d'appel : une generation longue (ex. le
  // pain du jour, timeoutMs eleve) doit pouvoir aboutir, avec au moins une bascule.
  const deadline = Date.now() + Math.max(OVERALL_MS, (c.timeoutMs ?? CALL_TIMEOUT_MS) * 2 + 10_000);
  let lastErr: any;
  for (let i = 0; i < n; i++) {
    if (Date.now() > deadline) break; // on n'enchaine pas les bascules a l'infini
    const entry = POOL[(start + i) % n];
    try {
      return await callProvider(entry.provider, c, entry.keyEnv);
    } catch (e: any) {
      lastErr = e;
      // on tente toujours la cle suivante : une cle KO ne bloque pas le pool
    }
  }
  throw lastErr ?? new LLMError(504, `budget global depasse (${OVERALL_MS} ms)`);
}

/** Texte libre. */
export async function callText(c: Call) {
  const r = await raw(c);
  return { text: r.text, usage: { input: r.input, output: r.output } };
}

/** Sortie JSON validee, une relance automatique si le schema echoue. */
export async function callJSON<T>(schema: z.ZodType<T>, c: Call): Promise<{
  data: T; usage: { input: number; output: number };
}> {
  let last = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await raw({
      ...c,
      json: true,
      user: attempt === 0 ? c.user
        : `${c.user}\n\nTa reponse precedente etait invalide : ${last}\nRenvoie uniquement le JSON, sans texte autour.`
    });
    const s = r.text;
    const json = s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1);
    try {
      const parsed = schema.safeParse(JSON.parse(json || '{}'));
      if (parsed.success) return { data: parsed.data, usage: { input: r.input, output: r.output } };
      last = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(' | ');
    } catch (e: any) { last = `JSON illisible : ${e.message}`; }
  }
  throw new Error(`Sortie invalide apres relance : ${last}`);
}
