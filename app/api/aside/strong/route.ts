import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * LES MOTS CLÉS D'UN CHAPITRE (Strong) : les mots grecs ou hébreux du chapitre,
 * sans les petits mots (articles, conjonctions, prépositions, pronoms…),
 * les plus présents d'abord, puis les plus rares dans la Bible.
 *   GET /api/aside/strong?b=66&c=14
 */
const SMALL = /article|conjonction|pr[ée]position|particule|pronom|interjection/i;
const code = (s: string) => (s || '').toUpperCase().replace(/^([GH])0*(\d+).*$/, '$1$2');

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const b = Number(sp.get('b')), c = Number(sp.get('c'));
  if (!b || !c) return NextResponse.json({ items: [] });

  const { data: ws } = await admin.from('verse_words').select('verse, strong')
    .eq('book', b).eq('chapter', c).not('strong', 'is', null).limit(6000);
  const map = new Map<string, Set<number>>(), count = new Map<string, number>();
  for (const w of (ws ?? []) as any[]) {
    const k = code(w.strong); if (!/^[GH]\d+$/.test(k)) continue;
    if (!map.has(k)) map.set(k, new Set());
    map.get(k)!.add(w.verse);
    count.set(k, (count.get(k) ?? 0) + 1);
  }
  const codes = [...map.keys()];
  if (!codes.length) return NextResponse.json({ items: [] });
  const ents: any[] = [];
  for (let i = 0; i < codes.length; i += 300) {
    const { data } = await admin.from('strongs')
      .select('code, lemma, translit, fr_lsg, definition_fr, fr_type').in('code', codes.slice(i, i + 300));
    ents.push(...(data ?? []));
  }
  const items = ents
    .filter(e => !SMALL.test(e.fr_type ?? ''))
    .map(e => {
      const total = Number((e.fr_lsg ?? '').match(/;\s*(\d+)\s*$/)?.[1] ?? 0) || 99999;
      const sens = (e.fr_lsg ?? '').replace(/\s*;\s*\d+\s*$/, '').split(',').slice(0, 3)
        .map((x: string) => x.replace(/\s*\d+\s*$/, '').trim()).filter(Boolean).join(', ')
        || (e.definition_fr ?? '').split(/[;,]/)[0];
      return { code: e.code, lemma: e.lemma, translit: e.translit, type: e.fr_type, sens,
        n: count.get(e.code) ?? 0, total, verses: [...(map.get(e.code) ?? [])].sort((x, y) => x - y) };
    })
    .sort((x, y) => (y.n - x.n) || (x.total - y.total))
    .slice(0, 60);
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000' } });
}
