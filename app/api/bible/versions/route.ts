import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Liste des Bibles connues (activées ou non) : code, nom, langue, source,
 * et présence du texte (Jean 3). Lecture seule, métadonnées publiques.
 *   /api/bible/versions
 */
export async function GET() {
  const { data: t } = await admin.from('translations').select('code, name, language, enabled, source').order('code');
  const list = t ?? [];
  const n = await Promise.all(list.map(async x => {
    const { count } = await admin.from('verses').select('verse', { count: 'exact', head: true })
      .eq('translation', x.code).eq('book', 43).eq('chapter', 3);
    return count ?? 0;
  }));
  return NextResponse.json({ versions: list.map((x, i) => ({ ...x, jean3: n[i] })) },
    { headers: { 'Cache-Control': 'public, s-maxage=600' } });
}
