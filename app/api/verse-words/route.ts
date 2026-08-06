import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Mot-à-mot d'un verset : chaque mot d'origine (STEPBible) enrichi de sa
 * translittération et de sa définition française via le lexique Strong.
 *   /api/verse-words?book=1&chapter=1&verse=1
 */
const norm = (c: string) => {
  const m = (c || '').match(/^([HG])0*(\d+)/i);
  return m ? m[1].toUpperCase() + m[2] : c;
};

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const book = +(sp.get('book') ?? 0), chapter = +(sp.get('chapter') ?? 0), verse = +(sp.get('verse') ?? 0);
  if (!book || !chapter || !verse) return NextResponse.json({ words: [] });

  const { data: words } = await admin.from('verse_words')
    .select('position, word, strong, gloss, lang')
    .eq('book', book).eq('chapter', chapter).eq('verse', verse)
    .order('position');
  if (!words || words.length === 0) return NextResponse.json({ words: [] });

  // Récupère les entrées Strong correspondantes (formats paddé / non paddé).
  const codes = [...new Set(words.map(w => w.strong).filter(Boolean) as string[])];
  const cand = new Set<string>();
  for (const c of codes) {
    cand.add(c);
    const m = c.match(/^([HG])(\d+)$/i);
    if (m) cand.add(m[1].toUpperCase() + m[2].padStart(4, '0'));
  }
  const { data: strongs } = cand.size
    ? await admin.from('strongs').select('code, translit, definition_fr').in('code', [...cand])
    : { data: [] as any[] };
  const map = new Map<string, any>();
  for (const s of (strongs ?? [])) map.set(norm(s.code), s);

  const out = words.map(w => {
    const s = w.strong ? map.get(norm(w.strong)) : null;
    return {
      position: w.position, word: w.word, strong: w.strong, gloss: w.gloss, lang: w.lang,
      translit: s?.translit ?? null,
      definition_fr: s?.definition_fr ?? null
    };
  });
  return NextResponse.json({ lang: words[0].lang, words: out });
}
