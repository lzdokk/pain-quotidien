import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Dictionnaire biblique Westphal.
 *   GET /api/dict?t=Assuérus   → un article (par titre exact, sinon le plus proche)
 *   GET /api/dict?id=334       → un article
 *   GET /api/dict?q=alliance   → titres qui commencent par / contiennent, puis articles qui en parlent
 *   GET /api/dict?l=A          → les titres d'une lettre
 * Contenu figé : mis en cache par le CDN.
 */
const CACHE = { 'Cache-Control': 'public, max-age=3600, s-maxage=604800, stale-while-revalidate=2592000' };
const esc = (s: string) => s.replace(/[%_,()]/g, ' ').trim();

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const t = sp.get('t'), id = sp.get('id'), q = (sp.get('q') ?? '').trim(), l = sp.get('l');
  const db = admin.from('dictionnaire');

  if (id || t) {
    let row: any = null;
    if (id) ({ data: row } = await db.select('id, titre, html').eq('source', 'westphal').eq('id', Number(id)).maybeSingle());
    else {
      ({ data: row } = await db.select('id, titre, html').eq('source', 'westphal').ilike('titre', esc(t!)).limit(1).maybeSingle());
      if (!row) ({ data: row } = await admin.from('dictionnaire').select('id, titre, html').eq('source', 'westphal')
        .ilike('titre', `${esc(t!)}%`).order('titre').limit(1).maybeSingle());
    }
    if (!row) return NextResponse.json({ error: 'Article introuvable' }, { status: 404 });
    return NextResponse.json(row, { headers: CACHE });
  }

  if (l) {
    const { data } = await db.select('id, titre').eq('source', 'westphal').ilike('titre', `${esc(l).slice(0, 2)}%`).order('titre').limit(1000);
    return NextResponse.json({ items: data ?? [] }, { headers: CACHE });
  }

  if (q.length < 2) return NextResponse.json({ items: [] });
  const k = esc(q);
  const [{ data: a }, { data: b }] = await Promise.all([
    admin.from('dictionnaire').select('id, titre').eq('source', 'westphal').ilike('titre', `%${k}%`).order('titre').limit(40),
    admin.from('dictionnaire').select('id, titre').eq('source', 'westphal').ilike('texte', `%${k}%`).order('titre').limit(40)
  ]);
  const seen = new Set<number>();
  const starts = (x: any) => x.titre.toLowerCase().startsWith(k.toLowerCase()) ? 0 : 1;
  const titles = (a ?? []).sort((x: any, y: any) => starts(x) - starts(y));
  const items = [...titles.map((x: any) => ({ ...x, m: 't' })), ...(b ?? []).map((x: any) => ({ ...x, m: 'x' }))]
    .filter((x: any) => !seen.has(x.id) && seen.add(x.id));
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
}
