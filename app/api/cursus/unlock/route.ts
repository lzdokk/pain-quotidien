import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Vérifie le code d'accès d'un cursus, côté serveur (le mot de passe n'est
 * jamais envoyé au navigateur). Renvoie { ok: true } si le code correspond.
 *   body : { cursusId, code }
 */
export async function POST(req: NextRequest) {
  const { cursusId, code } = await req.json().catch(() => ({}));
  if (!cursusId) return NextResponse.json({ ok: false }, { status: 400 });

  const { data } = await admin.from('cursus').select('password').eq('id', cursusId).maybeSingle();
  const pw = data?.password ?? null;
  // Pas de mot de passe = accès libre.
  if (!pw) return NextResponse.json({ ok: true });

  const ok = String(code ?? '').trim() === String(pw).trim();
  return NextResponse.json({ ok });
}
