import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * MOT À MOT EN FRANÇAIS, EN CONTEXTE — EN ARRIÈRE-PLAN (pool de clés du site)
 * Traduit, verset par verset, chaque mot grec/hébreu (verse_words.gloss_fr)
 * comme dans une Bible interlinéaire. Nouveau Testament (grec) d'abord, puis
 * l'Ancien. Ne traite que les versets encore incomplets : relançable sans risque.
 *   GET /api/cron/glosses?n=10   (n versets par appel IA, défaut 10, max 15)
 */
const Batch = z.object({ versets: z.array(z.object({ ref: z.string(), mots: z.array(z.string()) })) });
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    versets: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { ref: { type: 'STRING' }, mots: { type: 'ARRAY', items: { type: 'STRING' } } },
        required: ['ref', 'mots']
      }
    }
  },
  required: ['versets']
};
const SYSTEM = `Tu es un traducteur biblique. Pour chaque verset, on te donne les mots d'origine
(grec ou hébreu), dans l'ordre, avec une glose anglaise indicative, et la traduction française du verset.
Pour CHAQUE mot, donne sa traduction française EN CONTEXTE, comme dans une Bible interlinéaire :
un à quatre mots français simples (ex. « beaucoup », « diront », « à moi », « en ce jour-là »,
« Seigneur », « ne… pas », « ton », « nom », « nous avons prophétisé »). Un vocatif comme kyrie se
traduit « Seigneur », jamais « monsieur », quand il s'adresse à Jésus ou à Dieu. Pour une particule
sans équivalent (marque de l'objet direct), écris « [objet] ». Accents obligatoires.
Réponds uniquement en JSON : { "versets": [ { "ref": "...", "mots": [ ... ] } ] }, exactement un élément
par mot, dans l'ordre donné.`;

type W = { book: number; chapter: number; verse: number; position: number; word: string; strong: string | null; gloss: string | null; lang: string };

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const n = Math.min(Math.max(1, Number(new URL(req.url).searchParams.get('n') ?? 10)), 15);
  const started = Date.now(), BUDGET = 200_000;
  let done = 0, batches = 0, fails = 0;
  const errors: string[] = [];
  const skip = new Set<string>(); // lots refusés pendant cet appel (nombre de mots faux)

  while (Date.now() - started < BUDGET) {
    // Versets encore incomplets : Nouveau Testament d'abord.
    let { data: missing } = await admin.from('verse_words').select('book, chapter, verse')
      .is('gloss_fr', null).gte('book', 40).order('book').order('chapter').order('verse').limit(600);
    if (!missing?.length) {
      ({ data: missing } = await admin.from('verse_words').select('book, chapter, verse')
        .is('gloss_fr', null).order('book').order('chapter').order('verse').limit(600));
    }
    if (!missing?.length) return NextResponse.json({ ok: true, finished: true, done, batches });

    // Un lot = jusqu'à n versets d'un même chapitre.
    const keys: string[] = [];
    for (const m of missing) {
      const k = `${m.book}:${m.chapter}:${m.verse}`;
      if (skip.has(k) || keys.includes(k)) continue;
      if (keys.length && !k.startsWith(keys[0].split(':').slice(0, 2).join(':') + ':')) break;
      keys.push(k);
      if (keys.length >= n) break;
    }
    if (!keys.length) break;
    const [b0, c0] = keys[0].split(':').map(Number);
    const verses = keys.map(k => Number(k.split(':')[2]));

    const [{ data: words }, { data: frS21 }, { data: frLsg }] = await Promise.all([
      admin.from('verse_words').select('book, chapter, verse, position, word, strong, gloss, lang')
        .eq('book', b0).eq('chapter', c0).in('verse', verses).order('verse').order('position'),
      admin.from('verses').select('verse, text').eq('translation', 'S21').eq('book', b0).eq('chapter', c0).in('verse', verses),
      admin.from('verses').select('verse, text').eq('translation', 'FRLSG').eq('book', b0).eq('chapter', c0).in('verse', verses)
    ]);
    const fr = new Map<number, string>();
    for (const v of (frLsg ?? []) as any[]) fr.set(v.verse, v.text);
    for (const v of (frS21 ?? []) as any[]) fr.set(v.verse, v.text);
    const byVerse = new Map<number, W[]>();
    for (const w of (words ?? []) as W[]) {
      if (!byVerse.has(w.verse)) byVerse.set(w.verse, []);
      byVerse.get(w.verse)!.push(w);
    }

    const user = verses.map(v => {
      const ws = byVerse.get(v) ?? [];
      return `### ref ${b0}:${c0}:${v}\nFrançais : ${fr.get(v) ?? '(indisponible)'}\nMots (${ws.length}) :\n` +
        ws.map((w, i) => `${i + 1}. ${w.word}${w.gloss ? ` — ${w.gloss}` : ''}`).join('\n');
    }).join('\n\n');

    batches++;
    try {
      const { data } = await callJSON(Batch, {
        system: SYSTEM, user, responseSchema: SCHEMA, maxTokens: 6000, temperature: 0.2, gloss: false, timeoutMs: 90_000
      });
      const rows: any[] = [];
      const ok = new Set<number>();
      for (const it of data.versets) {
        const v = Number(String(it.ref).split(':').pop());
        const ws = byVerse.get(v);
        if (!ws || ok.has(v) || it.mots.length !== ws.length) continue;
        ws.forEach((w, i) => rows.push({ ...w, gloss_fr: it.mots[i].replace(/\*/g, '').trim().slice(0, 40) || '·' }));
        ok.add(v); done++;
      }
      for (const k of keys) if (!ok.has(Number(k.split(':')[2]))) skip.add(k);
      if (rows.length) {
        const { error } = await admin.from('verse_words').upsert(rows, { onConflict: 'book,chapter,verse,position' });
        if (error) { errors.push(error.message.slice(0, 120)); break; }
      }
    } catch (e: any) {
      errors.push(String(e?.message ?? e).slice(0, 160));
      // Surcharge passagère : on patiente et on retente (3 fois max par appel).
      if (/\b(429|500|503|504)\b|timeout/.test(String(e?.message ?? '')) && ++fails < 3) {
        await new Promise(r => setTimeout(r, 15_000));
        continue;
      }
      break; // quota épuisé ou panne durable : on reprendra au prochain passage
    }
  }
  return NextResponse.json({ ok: done > 0 || errors.length === 0, done, batches, errors: errors.length ? errors : undefined });
}
