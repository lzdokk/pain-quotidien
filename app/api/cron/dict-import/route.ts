import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Reçoit les articles du dictionnaire biblique Westphal (levangile.com, avec
 * l'accord de son propriétaire) envoyés par le workflow d'import.
 * Balises permises : p, br, em, i, b, strong, ul, ol, li, sup, sub, blockquote,
 * h3, h4 (sans attribut) et <a data-ref="…"> / <a data-w="…"> uniquement.
 */
const TAGS = /<(?!\/?(?:p|br|em|i|b|strong|ul|ol|li|sup|sub|blockquote|h3|h4)>|a data-(?:ref|w)="[^"<>]*">|\/a>)[^>]*>/gi;
const s = (x: unknown, n: number) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, n) : null);

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const rows = (Array.isArray(body?.rows) ? body.rows.slice(0, 300) : [])
    .filter((r: any) => Number.isInteger(r?.id) && s(r?.titre, 200))
    .map((r: any) => ({
      source: r.source === 'westphal' ? 'westphal' : 'westphal', id: r.id, titre: s(r.titre, 200),
      html: typeof r.html === 'string' ? r.html.replace(TAGS, '').slice(0, 200_000) : null,
      texte: s(r.texte, 200_000)
    }));
  if (!rows.length) return NextResponse.json({ ok: true, saved: 0 });
  const { error } = await admin.from('dictionnaire').upsert(rows, { onConflict: 'source,id' });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, saved: rows.length });
}
