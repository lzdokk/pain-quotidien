import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';
import {
  ProverbeSchema, PROVERBE_GEMINI_SCHEMA, PROVERBE_SYSTEM, proverbeUserPrompt
} from '@/lib/prompts/proverbes';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * PROVERBES DU JOUR : redige les chapitres manquants (1 a 31), quelques-uns par appel.
 *   /api/cron/proverbes?n=2        chapitres manquants suivants
 *   /api/cron/proverbes?ch=3       (re)redige le chapitre 3
 * Appele par le workflow GitHub .github/workflows/proverbes.yml.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const sp = new URL(req.url).searchParams;
  const n = Math.min(Math.max(1, Number(sp.get('n') ?? 2)), 4);
  const only = sp.get('ch') ? Number(sp.get('ch')) : null;

  const { data: existing } = await admin.from('proverbes_daily').select('chapter');
  const have = new Set((existing ?? []).map((e: any) => e.chapter));
  const all = Array.from({ length: 31 }, (_, i) => i + 1);
  const todo = only ? [only] : all.filter(c => !have.has(c)).slice(0, n);

  const started = Date.now();
  const done: string[] = [];
  const errors: string[] = [];

  for (const ch of todo) {
    if (Date.now() - started > 240_000) { errors.push(`Proverbes ${ch} : temps écoulé, au prochain passage`); break; }
    try {
      let { data: vs } = await admin.from('verses').select('verse, text')
        .eq('translation', 'S21').eq('book', 20).eq('chapter', ch).order('verse');
      if (!vs?.length) ({ data: vs } = await admin.from('verses').select('verse, text')
        .eq('translation', 'FRLSG').eq('book', 20).eq('chapter', ch).order('verse'));
      if (!vs?.length) throw new Error('texte introuvable');
      const text = vs.map((v: any) => `${v.verse}. ${v.text}`).join('\n');

      const { data } = await callJSON(ProverbeSchema, {
        system: PROVERBE_SYSTEM,
        user: proverbeUserPrompt(ch, text),
        responseSchema: PROVERBE_GEMINI_SCHEMA,
        maxTokens: 6000, temperature: 0.5, timeoutMs: 120_000
      });

      const key = vs.some((v: any) => v.verse === data.key_verse) ? data.key_verse : vs[0].verse;
      const { error } = await admin.from('proverbes_daily').upsert({
        chapter: ch, title: data.title.trim(), key_verse: key,
        prayer_before: data.prayer_before, meditation: data.meditation,
        retenir: data.retenir.trim(), prayer_after: data.prayer_after,
        updated_at: new Date().toISOString()
      });
      if (error) throw new Error(error.message);
      done.push(`Proverbes ${ch}`);
    } catch (err: any) {
      errors.push(`Proverbes ${ch} : ${String(err?.message ?? err)}`);
    }
  }

  if (done.length) revalidatePath('/sagesse');
  return NextResponse.json({
    ok: done.length > 0 || todo.length === 0,
    done, errors: errors.length ? errors : undefined,
    progress: `${Math.min(have.size + (only ? 0 : done.length), 31)}/31`
  });
}
