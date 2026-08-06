import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';
import { VerseNoteSchema, VERSE_SYSTEM } from '@/lib/prompts/verse';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * FICHES DES VERSETS CONNUS (★) — EN PRIORITE
 *
 * Contrairement a /api/cron/verse-notes (qui balaie toute la Bible dans
 * l'ordre) et /api/cron/prefetch (lectures du jour), ce cron pre-genere les
 * fiches des versets marques d'une etoile (table famous_verses) — les
 * "fameux 10%" que le lecteur ouvre le plus. Une fois en base, un clic sur
 * un verset connu est INSTANTANE, sans aucun appel IA a la lecture.
 *
 * Curseur simple (verse_notes_famous_progress.pos) : index de depart dans la
 * liste ordonnee des versets connus. En fin de liste, on repart a 0 pour
 * couvrir les nouveaux ★ ajoutes entre-temps (les fiches deja faites sont
 * ignorees). Relancable sans risque.
 *
 *   ?n=25   nombre de fiches generees par appel (defaut 25, max 60)
 */
const WINDOW = 60; // plages ★ scannees par appel

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const params = new URL(req.url).searchParams;
  const limit = Math.min(Math.max(1, Number(params.get('n') ?? 25)), 60);

  const { data: prog } = await admin.from('verse_notes_famous_progress')
    .select('*').eq('id', 1).maybeSingle();
  const pos = prog?.pos ?? 0;

  const { data: fam } = await admin.from('famous_verses')
    .select('book, chapter, verse_start, verse_end')
    .order('book').order('chapter').order('verse_start')
    .range(pos, pos + WINDOW - 1);

  if (!fam || fam.length === 0) {
    // Fin du cycle : on repart du debut au prochain passage.
    await admin.from('verse_notes_famous_progress')
      .upsert({ id: 1, pos: 0, updated_at: new Date().toISOString() });
    return NextResponse.json({ ok: true, cycle: 'termine', reset: true });
  }

  // Fiches deja en base pour ces livres : on saute sans regenerer.
  const books = [...new Set(fam.map(f => f.book))];
  const { data: existing } = await admin.from('verse_notes')
    .select('book, chapter, verse').in('book', books);
  const has = new Set((existing ?? []).map(c => `${c.book}-${c.chapter}-${c.verse}`));

  const bookName = new Map<number, string>();
  let created = 0, skipped = 0, rowsDone = 0;
  const errors: string[] = [];
  let stopped = false;

  for (const f of fam) {
    let rowComplete = true;
    for (let vn = f.verse_start; vn <= f.verse_end; vn++) {
      const wk = `${f.book}-${f.chapter}-${vn}`;
      if (has.has(wk)) { skipped++; continue; }
      if (created >= limit) { rowComplete = false; stopped = true; break; }
      try {
        if (!bookName.has(f.book)) {
          const { data: b } = await admin.from('books').select('name').eq('id', f.book).single();
          bookName.set(f.book, b?.name ?? '');
        }
        const { data: ctx } = await admin.from('verses').select('verse, text')
          .eq('translation', 'FRLSG').eq('book', f.book).eq('chapter', f.chapter)
          .gte('verse', Math.max(1, vn - 3)).lte('verse', vn + 3).order('verse');

        const { data } = await callJSON(VerseNoteSchema, {
          system: VERSE_SYSTEM,
          user: `Verset a expliquer : ${bookName.get(f.book)} ${f.chapter}.${vn}

Contexte immediat, Segond 1910 :
${(ctx ?? []).map(v => `${v.verse}. ${v.text}`).join('\n')}`,
          maxTokens: 2000
        });

        await admin.from('verse_notes').upsert({
          book: f.book, chapter: f.chapter, verse: vn,
          word_term: data.word_term, word_lang: data.word_lang, word_sense: data.word_sense,
          says: data.says, parable: data.parable, development: data.development,
          cross_refs: data.cross_refs
        });
        has.add(wk);
        created++;
      } catch (e: any) {
        errors.push(`${f.book}.${f.chapter}.${vn} : ${String(e?.message ?? e).slice(0, 120)}`);
        rowComplete = false; stopped = true; break;
      }
    }
    if (!rowComplete) break;
    rowsDone++;
  }

  // On n'avance le curseur que sur les plages ENTIEREMENT traitees ; une plage
  // interrompue sera reprise au prochain appel (les fiches faites sont sautees).
  const newPos = stopped ? pos + rowsDone : pos + fam.length;
  await admin.from('verse_notes_famous_progress')
    .upsert({ id: 1, pos: newPos, updated_at: new Date().toISOString() });

  return NextResponse.json({
    ok: true, created, skipped, rowsDone,
    from: pos, to: newPos, stopped,
    errors: errors.length ? errors : undefined
  });
}
