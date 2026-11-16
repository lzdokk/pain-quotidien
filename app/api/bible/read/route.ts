import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Un chapitre, ses versets célèbres (★) et les paroles de Jésus, en UNE
 * réponse mise en cache par le CDN de Vercel :
 *   /api/bible/read?t=FRLSG&b=43&c=3
 * Supabase n'est interrogé qu'une fois par chapitre et par version pour
 * TOUS les lecteurs ; ensuite le CDN (puis le téléphone) répond seul.
 * Économise la bande passante gratuite de Supabase.
 */
const CACHE = 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=31536000';

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const t = (sp.get('t') ?? 'FRLSG').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 16);
  const b = Number(sp.get('b')), c = Number(sp.get('c'));
  if (!t || !(b >= 1 && b <= 66) || !(c >= 1 && c <= 150)) {
    return NextResponse.json({ verses: [], famous: [], jesus: [] }, { status: 400 });
  }
  const [{ data: verses, error }, { data: famous }, { data: jesus }] = await Promise.all([
    admin.from('verses').select('verse, text').eq('translation', t).eq('book', b).eq('chapter', c).order('verse'),
    admin.from('famous_verses').select('verse_start, verse_end, title').eq('book', b).eq('chapter', c),
    admin.from('jesus_verses').select('verse').eq('book', b).eq('chapter', c)
  ]);
  if (error) return NextResponse.json({ verses: [], famous: [], jesus: [], error: error.message }, { status: 502 });
  const body = { verses: verses ?? [], famous: famous ?? [], jesus: (jesus ?? []).map((r: any) => r.verse) };
  // Chapitre vide (version absente) : on ne le garde pas longtemps en cache.
  return NextResponse.json(body, { headers: { 'Cache-Control': body.verses.length ? CACHE : 'public, s-maxage=300' } });
}
