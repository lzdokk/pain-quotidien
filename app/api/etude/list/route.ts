import { NextResponse } from 'next/server';
import { getIndexList } from '@/lib/cache';
import { allEntries, ALL_SUJETS, RENVOIS, slugify } from '@/lib/prompts/study-index';

export const revalidate = 600;

/** Bible d'étude : le plan complet, les fiches prêtes et les renvois (mis en cache). */
export async function GET() {
  const list = await getIndexList();
  const ready = Object.fromEntries(list);
  const plan = allEntries().map(e => ({ slug: e.slug, kind: e.kind, title: e.title, category: e.category, subcategory: e.subcategory }));
  const sujets = ALL_SUJETS().map(g => ({ id: g.id, title: g.title, groups: g.groups.map(x => x.title) }));
  const renvois = Object.entries(RENVOIS).map(([from, to]) => ({ from, to, slug: slugify(to) }));
  return NextResponse.json({ plan, ready, sujets, renvois },
    { headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400' } });
}
