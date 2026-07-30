import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { callJSON, cost, PROVIDER, modelName } from '@/lib/llm';
import { ParableSchema, PARABLE_SYSTEM, parableUserPrompt, PARABLE_GEMINI_SCHEMA, THEMES } from '@/lib/prompts/parable';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * GENERATION DES PARABOLES, PAR PAQUETS, A LA DEMANDE
 * Independant de l'hebdomadaire. A chaque appel, avance sur le theme qui a
 * le moins d'episodes publies (parcours par vagues plutot qu'en profondeur
 * immediate sur un seul theme), pour qu'un lecteur assidu voie l'ensemble
 * des themes progresser au meme rythme.
 *
 *   ?batch=1        nombre d'episodes a generer dans cet appel (defaut 1)
 *   ?theme=Qui...   force le theme au lieu de choisir automatiquement
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = new URL(req.url);
  const batch = Math.min(Math.max(1, Number(url.searchParams.get('batch') ?? 1)), 5);
  const forcedTheme = url.searchParams.get('theme');

  const { data: existing } = await admin.from('parables').select('theme, title, episode');

  let created = 0, totalIn = 0, totalOut = 0;
  const errors: string[] = [];
  const done: string[] = [];

  for (let i = 0; i < batch; i++) {
    try {
      const counts = new Map<string, number>();
      for (const t of THEMES) counts.set(t, 0);
      for (const row of existing ?? []) counts.set(row.theme, (counts.get(row.theme) ?? 0) + 1);

      const theme = forcedTheme && THEMES.includes(forcedTheme as any)
        ? forcedTheme
        : THEMES.reduce((min, t) =>
            (counts.get(t) ?? 0) < (counts.get(min) ?? 0) ? t : min, THEMES[0]);

      const themeOrder = THEMES.indexOf(theme as any);
      const episode = (counts.get(theme) ?? 0) + 1;
      const previousTitles = (existing ?? [])
        .filter(r => r.theme === theme).map(r => r.title);

      const { data, usage } = await callJSON(ParableSchema, {
        system: PARABLE_SYSTEM,
        user: parableUserPrompt({ theme, episode, previousTitles }),
        responseSchema: PARABLE_GEMINI_SCHEMA,
        maxTokens: 12000
      });
      totalIn += usage.input; totalOut += usage.output;

      const slug = `${theme}-${episode}`
        .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const { error } = await admin.from('parables').insert({
        slug, theme, theme_order: themeOrder, episode,
        title: data.title, hook: data.hook, story: data.story,
        unpacking: data.unpacking, key_verse: data.key_verse,
        key_verse_ref: data.key_verse_ref, questions: data.questions, refs: data.refs
      });
      if (error) throw new Error(error.message);

      existing?.push({ theme, title: data.title, episode });
      created++;
      done.push(`${theme} #${episode} : ${data.title}`);
    } catch (e: any) {
      errors.push(String(e?.message ?? e));
      break; // inutile d'insister dans ce batch si un appel echoue (ex. quota)
    }
  }

  revalidatePath('/paraboles');
  return NextResponse.json({
    ok: created > 0, created, done,
    model: `${PROVIDER}/${modelName()}`,
    errors: errors.length ? errors : undefined,
    cost_usd: +cost(totalIn, totalOut).toFixed(4)
  });
}
