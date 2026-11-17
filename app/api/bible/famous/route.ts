import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/** Versets importants d'un livre (bulle ★), mis en cache par le CDN.  /api/bible/famous?b=43 */
export async function GET(req: NextRequest) {
  const b = Number(new URL(req.url).searchParams.get('b'));
  if (!(b >= 1 && b <= 66)) return NextResponse.json({ items: [] }, { status: 400 });
  const { data } = await admin.from('famous_verses')
    .select('chapter, verse_start, title').eq('book', b).order('chapter').order('verse_start');
  return NextResponse.json({ items: data ?? [] },
    { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000' } });
}
