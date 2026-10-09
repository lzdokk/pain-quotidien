import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { parseShortRef } from '@/lib/refs';

export const revalidate = 86400;

/**
 * Texte d'un passage cite par reference abregee, pour la lecture rapide
 * depuis l'index d'etude :  /api/passage?ref=Gn%2012.1-3
 * Segond 21 si importee, sinon Segond 1910.
 */
export async function GET(req: NextRequest) {
  const raw = new URL(req.url).searchParams.get('ref') ?? '';
  const r = parseShortRef(raw);
  if (!r) return NextResponse.json({ error: 'Référence inconnue' }, { status: 400 });

  const read = (t: string) => {
    let q = admin.from('verses').select('verse, text')
      .eq('translation', t).eq('book', r.book).eq('chapter', r.chapter).order('verse');
    if (r.vStart !== null) q = q.gte('verse', r.vStart).lte('verse', r.vEnd ?? r.vStart);
    return q;
  };
  let translation = 'S21';
  let { data } = await read('S21');
  if (!data?.length) { translation = 'FRLSG'; ({ data } = await read('FRLSG')); }

  return NextResponse.json({
    ref: r.label, bookName: r.bookName, chapter: r.chapter, vStart: r.vStart, vEnd: r.vEnd,
    translation: translation === 'S21' ? 'Segond 21' : 'Segond 1910',
    verses: data ?? []
  });
}
