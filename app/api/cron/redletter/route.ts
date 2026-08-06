import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { callJSON, cost, PROVIDER, modelName } from '@/lib/llm';
import { RedLetterSchema, REDLETTER_SYSTEM, redLetterUserPrompt, REDLETTER_GEMINI_SCHEMA } from '@/lib/prompts/redletter';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * TAGGING DES PAROLES DE JÉSUS, chapitre par chapitre, dans les 4 Évangiles
 * (Matthieu 40, Marc 41, Luc 42, Jean 43). Progression memorisee dans
 * jesus_progress. Relancable sans risque. Appele par le workflow GitHub.
 *
 *   ?c=4   nombre de chapitres traites par appel (defaut 4, max 8)
 */
const GOSPELS = [40, 41, 42, 43];

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const chapters = Math.min(Math.max(1, Number(new URL(req.url).searchParams.get('c') ?? 4)), 8);
  // Budget-temps : on s'arrete AVANT la coupure de Vercel (~55 s) en
  // sauvegardant la progression, plutot que de timeouter (erreur 504/22).
  const started = Date.now();
  const BUDGET_MS = 50_000;

  const { data: prog } = await admin.from('jesus_progress').select('*').eq('id', 1).maybeSingle();
  if (prog?.done) {
    return NextResponse.json({ ok: true, done: true, message: 'Les 4 Évangiles sont deja traites.' });
  }
  const p = prog ?? { book: 40, chapter: 0 };

  // Prochains chapitres (book, chapter) des Évangiles, apres le curseur.
  const { data: probe } = await admin.from('verses')
    .select('book, chapter')
    .eq('translation', 'FRLSG')
    .in('book', GOSPELS)
    .or(`book.gt.${p.book},and(book.eq.${p.book},chapter.gt.${p.chapter})`)
    .order('book').order('chapter')
    .limit(3000);

  if (!probe || probe.length === 0) {
    await admin.from('jesus_progress')
      .upsert({ id: 1, book: p.book, chapter: p.chapter, done: true, updated_at: new Date().toISOString() });
    return NextResponse.json({ ok: true, done: true, message: 'Tagging termine.' });
  }

  const seen = new Set<string>();
  const todo: { book: number; chapter: number }[] = [];
  for (const r of probe) {
    const k = `${r.book}-${r.chapter}`;
    if (seen.has(k)) continue;
    seen.add(k);
    todo.push({ book: r.book, chapter: r.chapter });
    if (todo.length >= chapters) break;
  }

  const booksCache = new Map<number, string>();
  let tagged = 0, totalIn = 0, totalOut = 0;
  let last = { book: p.book, chapter: p.chapter };
  const errors: string[] = [];
  const done: string[] = [];

  for (const ch of todo) {
    if (Date.now() - started > BUDGET_MS) break; // on rend la main avant le timeout
    try {
      if (!booksCache.has(ch.book)) {
        const { data: b } = await admin.from('books').select('name').eq('id', ch.book).single();
        booksCache.set(ch.book, b?.name ?? '');
      }
      const { data: verses } = await admin.from('verses')
        .select('verse, text').eq('translation', 'FRLSG')
        .eq('book', ch.book).eq('chapter', ch.chapter).order('verse');
      if (!verses || verses.length === 0) { last = ch; continue; }

      const maxVerse = verses[verses.length - 1].verse;
      const { data, usage } = await callJSON(RedLetterSchema, {
        system: REDLETTER_SYSTEM,
        user: redLetterUserPrompt({ bookName: booksCache.get(ch.book)!, chapter: ch.chapter, verses }),
        responseSchema: REDLETTER_GEMINI_SCHEMA,
        maxTokens: 2000,
        temperature: 0.2
      });
      totalIn += usage.input; totalOut += usage.output;

      const rows = [...new Set(data.verses)]
        .filter(v => v >= 1 && v <= maxVerse)
        .map(v => ({ book: ch.book, chapter: ch.chapter, verse: v }));
      if (rows.length) {
        const { error } = await admin.from('jesus_verses')
          .upsert(rows, { onConflict: 'book,chapter,verse', ignoreDuplicates: true });
        if (error) throw new Error(error.message);
        tagged += rows.length;
      }
      done.push(`${booksCache.get(ch.book)} ${ch.chapter} : ${rows.length}`);
      last = ch;
    } catch (e: any) {
      errors.push(`${ch.book}.${ch.chapter} : ${String(e?.message ?? e).slice(0, 120)}`);
      break;
    }
  }

  await admin.from('jesus_progress').upsert({
    id: 1, book: last.book, chapter: last.chapter, done: false, updated_at: new Date().toISOString()
  });

  revalidatePath('/lire');
  return NextResponse.json({
    ok: true, done: false, tagged, chapters: done, curseur: last,
    model: `${PROVIDER}/${modelName()}`,
    cost_usd: +cost(totalIn, totalOut).toFixed(4),
    errors: errors.length ? errors : undefined
  });
}
