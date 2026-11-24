import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * LE DICTIONNAIRE AUTOUR D'UN CHAPITRE (Westphal) :
 *   • cites : les articles qui citent ce chapitre (avec les versets cités) ;
 *   • mots  : les articles dont le sujet apparaît dans le texte du chapitre.
 *   GET /api/aside/dico?b=66&c=14&name=Apocalypse
 * Les articles écrivent les livres sans accents ni espaces : « Esaie 7.14 », « 2Rois 16.7 ».
 */
const nz = (s: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// Mots trop courants pour éclairer un chapitre précis (ou ambigus, comme « or »).
const STOP = new Set(['or', 'dieu', 'seigneur', 'eternel', 'fils', 'pere', 'mere', 'jour', 'jours', 'homme', 'hommes', 'femme',
  'terre', 'ciel', 'cieux', 'roi', 'main', 'mains', 'nom', 'fin', 'fois', 'vie', 'mort', 'voix', 'peuple', 'parole', 'bien', 'mal',
  'tout', 'grand', 'saint', 'saints', 'esprit', 'cœur', 'coeur', 'ame', 'chair', 'temps', 'heure', 'an', 'ans', 'lieu', 'face',
  'oeil', 'yeux', 'pied', 'pieds', 'bouche', 'tete', 'eau', 'eaux', 'feu', 'chose', 'fait', 'frere', 'freres', 'maison', 'ville',
  'loi', 'gloire', 'grace', 'foi', 'amour', 'paix', 'vrai', 'force', 'jesus', 'christ', 'israel', 'aaron', 'moise', 'david', 'ange', 'anges']);

let TITLES: Array<{ id: number; titre: string; keys: string[] }> | null = null;
async function titles() {
  if (TITLES) return TITLES;
  const all: any[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data } = await admin.from('dictionnaire').select('id, titre').eq('source', 'westphal').order('id').range(from, from + 999);
    all.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  TITLES = all.map(t => ({
    id: t.id, titre: t.titre,
    keys: nz(t.titre.replace(/\(.*?\)/g, '')).split(/\s+ou\s+|\s+et\s+|,/).map(k => k.replace(/[’']/g, ' ').trim()).filter(k => k.length >= 3 && !STOP.has(k))
  }));
  return TITLES;
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const b = Number(sp.get('b')), c = Number(sp.get('c'));
  const name = sp.get('name') ?? '';
  if (!b || !c || !name) return NextResponse.json({ cites: [], mots: [] });

  // 1. Articles qui citent ce chapitre.
  const base = nz(name).replace(/\s+/g, '');
  const words0 = nz(name).split(' ');
  // « 1 Jean » ne doit pas attraper « Jean » : pas de variante d'un seul mot pour les livres numérotés.
  const variants = [...new Set([base, base.replace(/s$/, ''), ...(/^\d/.test(name.trim()) ? [] : [words0[0], words0[words0.length - 1]])])]
    .filter(v => v.length >= 3).map(v => v.charAt(0).toUpperCase() + v.slice(1));
  const cap = (v: string) => v.replace(/^(\d)(\w)/, (_, d, l) => d + l.toUpperCase());
  const pats = variants.flatMap(v => [`%data-ref="${cap(v)} ${c}.%`, `%data-ref="${cap(v)} ${c}"%`]);
  const res = await Promise.all(pats.map(p =>
    admin.from('dictionnaire').select('id, titre, html').eq('source', 'westphal').ilike('html', p).limit(80)));
  const seen = new Map<number, { id: number; titre: string; verses: Set<number>; n: number }>();
  const reRef = new RegExp(`data-ref="(?:${variants.map(cap).join('|')}) ${c}(?:\\.(\\d+))?`, 'gi');
  for (const r of res) for (const a of (r.data ?? []) as any[]) {
    if (!seen.has(a.id)) seen.set(a.id, { id: a.id, titre: a.titre, verses: new Set(), n: 0 });
    const s = seen.get(a.id)!;
    if (s.n) continue;
    for (const m of String(a.html).matchAll(reRef)) { s.n++; if (m[1]) s.verses.add(+m[1]); }
  }
  const cites = [...seen.values()].filter(x => x.n > 0)
    .sort((x, y) => y.n - x.n).slice(0, 40)
    .map(x => ({ id: x.id, titre: x.titre, verses: [...x.verses].sort((p, q) => p - q) }));

  // 2. Articles dont le sujet apparaît dans le chapitre.
  let { data: vs } = await admin.from('verses').select('verse, text').eq('translation', 'S21').eq('book', b).eq('chapter', c);
  if (!vs?.length) ({ data: vs } = await admin.from('verses').select('verse, text').eq('translation', 'FRLSG').eq('book', b).eq('chapter', c));
  const words = new Map<string, Set<number>>();
  const texts: Array<[number, string]> = [];
  for (const v of (vs ?? []) as any[]) {
    const t = ' ' + nz(v.text).replace(/[^a-z0-9æœ]+/g, ' ') + ' ';
    texts.push([v.verse, t]);
    for (const w of t.split(' ')) if (w.length >= 3) {
      for (const k of [w, w.replace(/s$/, '')]) { if (!words.has(k)) words.set(k, new Set()); words.get(k)!.add(v.verse); }
    }
  }
  const cited = new Set(cites.map(x => x.id));
  const mots: Array<{ id: number; titre: string; verses: number[] }> = [];
  for (const t of await titles()) {
    if (cited.has(t.id)) continue;
    let hit: Set<number> | null = null;
    for (const k of t.keys) {
      if (k.includes(' ')) {
        const vv = texts.filter(([, s]) => s.includes(` ${k} `)).map(([v]) => v);
        if (vv.length) { hit = new Set(vv); break; }
      } else if (words.has(k)) { hit = words.get(k)!; break; }
    }
    if (hit) mots.push({ id: t.id, titre: t.titre, verses: [...hit].sort((p, q) => p - q) });
  }
  mots.sort((x, y) => x.verses[0] - y.verses[0]);

  return NextResponse.json({ cites, mots: mots.slice(0, 40) },
    { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000' } });
}
