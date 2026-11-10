import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { allRows } from '@/lib/supabase/all-rows';
import { parseShortRef } from '@/lib/refs';

export const maxDuration = 30;

/**
 * Bible d'étude en lisant : les fiches qui citent CE chapitre.
 *   /api/etude/chapter?b=43&c=3  ->  { items: [{ slug, title, kind, verses: [16, 17] }] }
 * L'index inverse (chapitre -> fiches) est construit une fois puis gardé
 * en mémoire ; chaque réponse est mise en cache une journée.
 */
type Hit = { slug: string; title: string; kind: string; verses: Set<number> };
let built: { at: number; map: Map<string, Map<string, Hit>> } | null = null;

async function build() {
  if (built && Date.now() - built.at < 3600_000) return built.map;
  const rows = await allRows(from => admin.from('bible_index').select('slug, title, kind, sections').order('slug').range(from, from + 999));
  const map = new Map<string, Map<string, Hit>>();
  for (const r of rows as any[]) {
    for (const s of (r.sections ?? [])) for (const it of (s.items ?? [])) for (const ref of (it.refs ?? [])) {
      const p = parseShortRef(ref);
      if (!p) continue;
      const k = `${p.book}-${p.chapter}`;
      if (!map.has(k)) map.set(k, new Map());
      const m = map.get(k)!;
      if (!m.has(r.slug)) m.set(r.slug, { slug: r.slug, title: r.title, kind: r.kind, verses: new Set() });
      const h = m.get(r.slug)!;
      if (p.vStart) for (let v = p.vStart; v <= (p.vEnd ?? p.vStart) && v < p.vStart + 40; v++) h.verses.add(v);
    }
  }
  built = { at: Date.now(), map };
  return map;
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const b = Number(sp.get('b')), c = Number(sp.get('c'));
  if (!b || !c) return NextResponse.json({ items: [] });
  const map = await build();
  const hits = [...(map.get(`${b}-${c}`)?.values() ?? [])]
    .map(h => ({ slug: h.slug, title: h.title, kind: h.kind, verses: [...h.verses].sort((x, y) => x - y) }))
    .sort((x, y) => (y.verses.length - x.verses.length) || x.title.localeCompare(y.title, 'fr'))
    .slice(0, 40);
  return NextResponse.json({ items: hits },
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } });
}
