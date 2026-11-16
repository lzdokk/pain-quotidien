import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Concordance : un mot dans toute la Bible (version donnée), mise en cache
 * par le CDN : la même recherche n'interroge Supabase qu'une fois par jour.
 *   /api/bible/find?t=FRLSG&q=esprit
 */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const t = (sp.get('t') ?? 'FRLSG').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 16);
  const q = (sp.get('q') ?? '').trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const safe = q.replace(/[%_,()]/g, ' ');
  const { data, error } = await admin.from('verses')
    .select('book, chapter, verse, text')
    .eq('translation', t).ilike('text', `%${safe}%`)
    .order('book').order('chapter').order('verse').limit(400);
  if (error) return NextResponse.json({ results: [], error: error.message }, { status: 502 });
  return NextResponse.json({ results: data ?? [] },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' } });
}
