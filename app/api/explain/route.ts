import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';
import { VerseNoteSchema, VERSE_SYSTEM } from '@/lib/prompts/verse';

export const maxDuration = 60;

/**
 * Explication d'un verset, générée UNE SEULE FOIS puis mise en cache
 * pour tous les lecteurs suivants. Le premier qui la demande declenche
 * l'appel, les autres la lisent gratuitement.
 */
export async function POST(req: NextRequest) {
  const { book, chapter, verse } = await req.json();
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });

  const { data: cached } = await admin.from('verse_notes')
    .select('*').eq('book', book).eq('chapter', chapter).eq('verse', verse).maybeSingle();
  if (cached) return NextResponse.json(cached);

  const { data: allowed } = await admin.rpc('consume_ai_quota', { p_user: user.id, p_limit: 8 });
  if (!allowed) return NextResponse.json({ error: 'Quota du jour atteint' }, { status: 429 });

  const [{ data: b }, { data: ctx }] = await Promise.all([
    admin.from('books').select('name').eq('id', book).single(),
    admin.from('verses').select('verse, text')
      .eq('translation', 'FRLSG').eq('book', book).eq('chapter', chapter)
      .gte('verse', Math.max(1, verse - 3)).lte('verse', verse + 3).order('verse')
  ]);

  const { data } = await callJSON(VerseNoteSchema, {
    system: VERSE_SYSTEM,
    user: `Verset a expliquer : ${b?.name} ${chapter}.${verse}

Contexte immediat, Segond 1910 :
${(ctx ?? []).map(v => `${v.verse}. ${v.text}`).join('\n')}`,
    maxTokens: 2000
  });

  const row = {
    book, chapter, verse,
    word_term: data.word_term, word_lang: data.word_lang, word_sense: data.word_sense,
    says: data.says, parable: data.parable, development: data.development,
    cross_refs: data.cross_refs
  };
  await admin.from('verse_notes').upsert(row);
  return NextResponse.json(row);
}
