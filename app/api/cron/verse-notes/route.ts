import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';
import { VerseNoteSchema, VERSE_SYSTEM } from '@/lib/prompts/verse';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * BASE SYSTEMATIQUE DES FICHES DE VERSETS
 *
 * Contrairement a /api/cron/prefetch (qui ne couvre que les lectures du
 * jour), ce cron avance verset apres verset dans TOUTE la Bible, dans
 * l'ordre canonique de la table `verses` (traduction FRLSG), pour qu'a
 * terme chaque verset ait deja sa fiche en base : plus jamais de
 * "Fiche en preparation" pour le lecteur.
 *
 * La progression est memorisee dans verse_notes_progress (une seule ligne),
 * donc chaque appel reprend exactement ou le precedent s'est arrete, sans
 * jamais repasser sur ce qui est deja fait. Relancable sans risque.
 *
 *   ?n=40     nombre de versets traites par appel (defaut 40, max 80)
 *
 * Appele par le workflow GitHub .github/workflows/verse-notes.yml (plusieurs
 * fois par jour), Vercel Hobby limitant les crons natifs a une fois par jour.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(1, Number(params.get('n') ?? 40)), 80);
  // Budget-temps : on s'arrete AVANT la coupure de Vercel (300 s), en
  // sauvegardant la progression, plutot que de timeouter.
  const started = Date.now();
  const BUDGET_MS = 200_000;

  const { data: progress } = await admin.from('verse_notes_progress')
    .select('*').eq('id', 1).maybeSingle();

  if (progress?.done) {
    return NextResponse.json({ ok: true, done: true, message: 'Toute la Bible est deja couverte.' });
  }

  const p = progress ?? { book: 0, chapter: 0, verse: 0 };

  // Prochain lot de versets, dans l'ordre canonique, juste apres le curseur.
  const { data: batch } = await admin.from('verses')
    .select('book, chapter, verse, text')
    .eq('translation', 'FRLSG')
    .or(`book.gt.${p.book},and(book.eq.${p.book},chapter.gt.${p.chapter}),and(book.eq.${p.book},chapter.eq.${p.chapter},verse.gt.${p.verse})`)
    .order('book').order('chapter').order('verse')
    .limit(limit);

  if (!batch || batch.length === 0) {
    await admin.from('verse_notes_progress').upsert({ id: 1, ...p, done: true, updated_at: new Date().toISOString() });
    return NextResponse.json({ ok: true, done: true, message: 'Toute la Bible est desormais couverte.' });
  }

  // Deja en cache (genere via /api/explain ou /api/cron/prefetch) : on saute
  // la generation mais on avance quand meme le curseur.
  const { data: cached } = await admin.from('verse_notes')
    .select('book, chapter, verse')
    .in('book', [...new Set(batch.map(b => b.book))]);
  const has = new Set((cached ?? []).map(c => `${c.book}-${c.chapter}-${c.verse}`));

  const booksCache = new Map<number, string>();
  let created = 0, skipped = 0;
  let last = { book: p.book, chapter: p.chapter, verse: p.verse };
  const errors: string[] = [];
  let stopped = false;

  for (const w of batch) {
    if (Date.now() - started > BUDGET_MS) { stopped = true; break; } // on rend la main avant le timeout
    const wk = `${w.book}-${w.chapter}-${w.verse}`;
    if (has.has(wk)) { skipped++; last = { book: w.book, chapter: w.chapter, verse: w.verse }; continue; }

    try {
      if (!booksCache.has(w.book)) {
        const { data: b } = await admin.from('books').select('name').eq('id', w.book).single();
        booksCache.set(w.book, b?.name ?? '');
      }
      const { data: ctx } = await admin.from('verses').select('verse, text')
        .eq('translation', 'FRLSG').eq('book', w.book).eq('chapter', w.chapter)
        .gte('verse', Math.max(1, w.verse - 3)).lte('verse', w.verse + 3).order('verse');

      const { data } = await callJSON(VerseNoteSchema, {
        system: VERSE_SYSTEM,
        user: `Verset a expliquer : ${booksCache.get(w.book)} ${w.chapter}.${w.verse}

Contexte immediat, Segond 1910 :
${(ctx ?? []).map(v => `${v.verse}. ${v.text}`).join('\n')}`,
        maxTokens: 2000
      });

      await admin.from('verse_notes').upsert({
        book: w.book, chapter: w.chapter, verse: w.verse,
        word_term: data.word_term, word_lang: data.word_lang, word_sense: data.word_sense,
        says: data.says, parable: data.parable, development: data.development,
        cross_refs: data.cross_refs
      });
      created++;
      last = { book: w.book, chapter: w.chapter, verse: w.verse };
    } catch (e: any) {
      errors.push(`${w.book}.${w.chapter}.${w.verse} : ${String(e?.message ?? e).slice(0, 120)}`);
      // Quota ou panne : on s'arrete la, le curseur ne bouge pas plus loin
      // que le dernier verset reellement traite, on reprendra au prochain appel.
      stopped = true;
      break;
    }
  }

  await admin.from('verse_notes_progress').upsert({
    id: 1, book: last.book, chapter: last.chapter, verse: last.verse,
    done: false, updated_at: new Date().toISOString()
  });

  return NextResponse.json({
    ok: true, done: false, created, skipped,
    processed: created + skipped,
    curseur: last, stopped,
    errors: errors.length ? errors : undefined
  });
}
