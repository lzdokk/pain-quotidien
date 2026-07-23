/* ══════════════════════════════════════════════════════════════════
   COUCHE MODELE, INTERCHANGEABLE
   Le fournisseur se choisit dans .env avec LLM_PROVIDER.
     gemini    → Google AI Studio, palier gratuit, 1500 requetes/jour
     groq      → Groq, gratuit, 1000 requetes/jour
     mistral   → Mistral, gratuit, environ 1 milliard de tokens/mois
     cerebras  → Cerebras, gratuit, environ 1 million de tokens/jour
     anthropic → Claude, payant, la meilleure qualite
     none      → aucun appel, le contenu vient d'un import manuel
   ══════════════════════════════════════════════════════════════════ */
import { z } from 'zod';

export type Provider = 'gemini' | 'groq' | 'mistral' | 'cerebras' | 'anthropic' | 'none';
export const PROVIDER = (process.env.LLM_PROVIDER ?? 'gemini') as Provider;

type Call = { system: string; user: string; maxTokens?: number; temperature?: number; responseSchema?: any };
type Raw = { text: string; input: number; output: number };

/* Tarifs en dollars par million de tokens. Zero pour les paliers gratuits. */
const PRICING: Record<Provider, [number, number]> = {
  gemini: [0, 0], groq: [0, 0], mistral: [0, 0], cerebras: [0, 0],
  anthropic: [3, 15], none: [0, 0]
};

const MODELS: Record<Provider, string> = {
  gemini:   process.env.LLM_MODEL ?? 'gemini-2.5-flash',
  groq:     process.env.LLM_MODEL ?? 'llama-3.3-70b-versatile',
  mistral:  process.env.LLM_MODEL ?? 'mistral-large-latest',
  cerebras: process.env.LLM_MODEL ?? 'llama-3.3-70b',
  anthropic: process.env.LLM_MODEL ?? 'claude-sonnet-5',
  none: 'aucun'
};

export const modelName = () => MODELS[PROVIDER];
export const cost = (i: number, o: number) => {
  const [pi, po] = PRICING[PROVIDER];
  return (i / 1e6) * pi + (o / 1e6) * po;
};

/* ── Google AI Studio, palier gratuit ─────────────────────────────
   1 500 requetes par jour, aucune carte bancaire.
   Depuis l'Union europeenne, les donnees ne servent pas a l'entrainement. */
async function gemini(c: Call): Promise<Raw> {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:generateContent?key=${process.env.GOOGLE_AI_KEY}`,
    {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: c.system }] },
        contents: [{ role: 'user', parts: [{ text: c.user }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          ...(c.responseSchema ? { responseSchema: c.responseSchema } : {}),
          maxOutputTokens: c.maxTokens ?? 32000,
          temperature: c.temperature ?? 0.7
        }
      })
    });
  if (!r.ok) throw new Error(`Gemini ${r.status} : ${await r.text()}`);
  const j = await r.json();
  return {
    text: j.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '',
    input: j.usageMetadata?.promptTokenCount ?? 0,
    output: j.usageMetadata?.candidatesTokenCount ?? 0
  };
}

/* ── Groq, Mistral, Cerebras : API compatible OpenAI ─────────────── */
const OPENAI_LIKE: Partial<Record<Provider, { url: string; key: string }>> = {
  groq:     { url: 'https://api.groq.com/openai/v1/chat/completions',   key: 'GROQ_API_KEY' },
  mistral:  { url: 'https://api.mistral.ai/v1/chat/completions',        key: 'MISTRAL_API_KEY' },
  cerebras: { url: 'https://api.cerebras.ai/v1/chat/completions',       key: 'CEREBRAS_API_KEY' }
};

async function openaiLike(p: Provider, c: Call): Promise<Raw> {
  const cfg = OPENAI_LIKE[p]!;
  const r = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env[cfg.key]}` },
    body: JSON.stringify({
      model: MODELS[p],
      response_format: { type: 'json_object' },
      max_tokens: c.maxTokens ?? 16000,
      temperature: c.temperature ?? 0.7,
      messages: [{ role: 'system', content: c.system }, { role: 'user', content: c.user }]
    })
  });
  if (!r.ok) throw new Error(`${p} ${r.status} : ${await r.text()}`);
  const j = await r.json();
  return {
    text: j.choices?.[0]?.message?.content ?? '',
    input: j.usage?.prompt_tokens ?? 0,
    output: j.usage?.completion_tokens ?? 0
  };
}

/* ── Claude, payant ───────────────────────────────────────────────── */
async function anthropic(c: Call): Promise<Raw> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const res = await client.messages.create({
    model: MODELS.anthropic, max_tokens: c.maxTokens ?? 8000,
    temperature: c.temperature ?? 0.7, system: c.system,
    messages: [{ role: 'user', content: c.user }]
  });
  const b = res.content.find(x => x.type === 'text');
  return {
    text: b && b.type === 'text' ? b.text : '',
    input: res.usage.input_tokens, output: res.usage.output_tokens
  };
}

async function raw(c: Call): Promise<Raw> {
  switch (PROVIDER) {
    case 'gemini': return gemini(c);
    case 'groq': case 'mistral': case 'cerebras': return openaiLike(PROVIDER, c);
    case 'anthropic': return anthropic(c);
    case 'none':
      throw new Error(
        "LLM_PROVIDER vaut 'none'. Aucun appel automatique n'est fait. " +
        "Utilise npm run prompt:week puis npm run import:week."
      );
  }
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
