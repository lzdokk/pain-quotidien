import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Reçoit les fiches du lexique Strong français (levangile.com, avec l'accord
 * de son propriétaire) envoyées par le workflow d'import, et les enregistre.
 * La définition (liste) n'accepte que <ol>, <ul>, <li> sans attribut.
 */
const safeList = (h: unknown) => typeof h === 'string'
  ? h.replace(/<(?!\/?(?:ol|ul|li)>)[^>]*>/gi, '').slice(0, 6000) : null;
const s = (x: unknown, n = 2000) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, n) : null);

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 300) : [];
  const clean = rows
    .filter((r: any) => /^[GH]\d{1,5}$/.test(r?.code ?? '') && Number.isInteger(r?.num))
    .map((r: any) => ({
      code: r.code, lang: r.code[0] === 'G' ? 'grec' : 'hebreu', num: r.num,
      fr_def: safeList(r.fr_def), fr_lsg: s(r.fr_lsg), fr_origine: s(r.fr_origine, 500), fr_type: s(r.fr_type, 120),
      ...(s(r.definition_fr) ? { definition_fr: s(r.definition_fr) } : {})
    }));
  if (!clean.length) return NextResponse.json({ ok: true, saved: 0 });
  const { error } = await admin.from('strongs').upsert(clean, { onConflict: 'code' });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, saved: clean.length });
}
