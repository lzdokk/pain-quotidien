import { NextRequest, NextResponse } from 'next/server';
import { TROIS, TOTAL_PREVU, TROIS_BLOCS } from '@/lib/trois-lectures-data';

/**
 * Les 3 lectures (données fixes, aucune IA).
 *   /api/trois?d=12        → le jour 12 (et le suivant, pour annoncer la suite)
 *   /api/trois?list=1      → tout le programme : références + thème (pour choisir un jour)
 */
const CACHE = { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' };
const partie = (i: number) => { let p = ''; for (const [j, t] of TROIS_BLOCS) if (j <= i) p = t; return p; };
const day = (i: number) => {
  const d = TROIS[i - 1];
  return d && { n: i, partie: partie(i), at: [d[0], d[1]], po: [d[2], d[3]], nt: [d[4], d[5]], theme: d[6], fil: d[7], question: d[8] };
};

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  if (sp.get('list')) {
    return NextResponse.json({ total: TROIS.length, prevu: TOTAL_PREVU,
      days: TROIS.map((d, i) => [i + 1, d[0], d[1], d[2], d[3], d[4], d[5], d[6]]), blocs: TROIS_BLOCS }, { headers: CACHE });
  }
  const n = Math.max(1, Math.min(TROIS.length, Number(sp.get('d')) || 1));
  return NextResponse.json({ total: TROIS.length, prevu: TOTAL_PREVU, day: day(n), next: day(n + 1) ?? null }, { headers: CACHE });
}
