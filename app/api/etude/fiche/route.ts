import { NextRequest, NextResponse } from 'next/server';
import { supabasePublic } from '@/lib/supabase/public';
import { polishDeep } from '@/lib/accents';

/** Une fiche de la Bible d'étude (?slug=abraham). */
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug') ?? '';
  const sb = await supabasePublic();
  const { data } = await sb.from('bible_index').select('*').eq('slug', slug).maybeSingle();
  if (!data) return NextResponse.json({ error: 'Fiche en préparation' }, { status: 404 });
  return NextResponse.json(polishDeep(data),
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=604800' } });
}
