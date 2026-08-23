import { NextRequest, NextResponse } from 'next/server';
import { searchVerses } from '@/lib/study';

export const dynamic = 'force-dynamic';

/** Recherche plein texte dans les traductions locales (RPC search_verses). */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const q = (sp.get('q') ?? '').trim();
  const translation = sp.get('trans') || undefined;
  const limit = Math.min(+(sp.get('limit') ?? 400), 400);

  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const results = await searchVerses(q, { translation, limit });
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ results: [], error: String(e?.message ?? e) }, { status: 500 });
  }
}
