import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { callJSON, cost, PROVIDER, modelName } from '@/lib/llm';
import { WordsBatchSchema, WORDS_SYSTEM, wordsUserPrompt, WORDS_GEMINI_SCHEMA, WORD_THEMES } from '@/lib/prompts/words';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * ENRICHISSEMENT QUOTIDIEN DE LA PAGE MOTS
 * Ajoute quelques mots bibliques (hébreu/grec/araméen) par appel, en evitant
 * les doublons de la base. Appele par le workflow GitHub .github/workflows/words.yml.
 *
 *   ?n=5   nombre de mots vises par appel (defaut 5, max 8)
 */
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const n = Math.min(Math.max(1, Number(new URL(req.url).searchParams.get('n') ?? 5)), 8);

  const { data: existing } = await admin.from('bible_words').select('slug, translit');
  const existingSlugs = new Set((existing ?? []).map(w => w.slug));
  const avoid = (existing ?? []).map(w => w.translit).filter(Boolean);
  const themeSet = new Set<string>(WORD_THEMES as readonly string[]);

  let created = 0, totalIn = 0, totalOut = 0;
  const errors: string[] = [];
  const done: string[] = [];

  try {
    const { data, usage } = await callJSON(WordsBatchSchema, {
      system: WORDS_SYSTEM,
      user: wordsUserPrompt({ n, avoid }),
      responseSchema: WORDS_GEMINI_SCHEMA,
      maxTokens: 8000,
      temperature: 0.6
    });
    totalIn += usage.input; totalOut += usage.output;

    const rows = data.words
      .map(w => ({
        slug: slugify(w.translit || w.term),
        term: w.term, translit: w.translit, lang: w.lang, gloss: w.gloss,
        theme: themeSet.has(w.theme) ? w.theme : 'Le salut et la grâce',
        sense: w.sense, christ: w.christ, refs: w.refs
      }))
      .filter(r => r.slug && !existingSlugs.has(r.slug));

    // dedoublonne au sein du lot
    const seen = new Set<string>();
    const unique = rows.filter(r => (seen.has(r.slug) ? false : (seen.add(r.slug), true)));

    if (unique.length) {
      const { error, count } = await admin.from('bible_words')
        .upsert(unique, { onConflict: 'slug', ignoreDuplicates: true, count: 'exact' });
      if (error) throw new Error(error.message);
      created = count ?? unique.length;
      done.push(...unique.map(r => `${r.translit} (${r.lang})`));
    }
  } catch (e: any) {
    errors.push(String(e?.message ?? e).slice(0, 160));
  }

  revalidatePath('/mots');
  return NextResponse.json({
    ok: created > 0, created, done,
    model: `${PROVIDER}/${modelName()}`,
    cost_usd: +cost(totalIn, totalOut).toFixed(4),
    errors: errors.length ? errors : undefined
  });
}
