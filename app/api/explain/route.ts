import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { callJSON } from '@/lib/llm';
import { aiAccess, needKey, keyError } from '@/lib/ai-access';
import { VerseNoteSchema, VERSE_SYSTEM } from '@/lib/prompts/verse';

export const maxDuration = 60;

/**
 * Explication d'un verset, générée UNE SEULE FOIS puis mise en cache
 * pour tous les lecteurs suivants. Le premier qui la demande declenche
 * l'appel (avec SA clé Gemini), les autres la lisent gratuitement.
 */
/** Lecture seule d'une explication déjà écrite, mise en cache par le CDN.
 *  /api/explain?b=43&c=3&v=16  (404 si elle n'existe pas encore) */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const book = Number(sp.get('b')), chapter = Number(sp.get('c')), verse = Number(sp.get('v'));
  if (!book || !chapter || !verse) return NextResponse.json(null, { status: 400 });
  const { data } = await admin.from('verse_notes')
    .select('*').eq('book', book).eq('chapter', chapter).eq('verse', verse).maybeSingle();
  if (!data) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(data,
    { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=31536000' } });
}

export async function POST(req: NextRequest) {
  const { book, chapter, verse } = await req.json();

  const { data: cached } = await admin.from('verse_notes')
    .select('*').eq('book', book).eq('chapter', chapter).eq('verse', verse).maybeSingle();
  if (cached) return NextResponse.json(cached);

  // Pas encore écrite : il faut la clé Gemini du lecteur (ou l'admin).
  const access = await aiAccess(req);
  if (!access) return needKey();

  const [{ data: b }, { data: ctx }] = await Promise.all([
    admin.from('books').select('name').eq('id', book).single(),
    admin.from('verses').select('verse, text')
      .eq('translation', 'FRLSG').eq('book', book).eq('chapter', chapter)
      .gte('verse', Math.max(1, verse - 3)).lte('verse', verse + 3).order('verse')
  ]);

  let data: any;
  try {
    ({ data } = await callJSON(VerseNoteSchema, {
    system: VERSE_SYSTEM,
    user: `Verset a expliquer : ${b?.name} ${chapter}.${verse}

Contexte immediat, Segond 1910 :
${(ctx ?? []).map(v => `${v.verse}. ${v.text}`).join('\n')}`,
      maxTokens: 2000,
      userKey: access.userKey
    }));
  } catch (e) { return keyError(e); }

  const row = {
    book, chapter, verse,
    word_term: data.word_term, word_lang: data.word_lang, word_sense: data.word_sense,
    says: data.says, parable: data.parable, development: data.development,
    cross_refs: data.cross_refs
  };
  await admin.from('verse_notes').upsert(row);
  return NextResponse.json(row);
}
