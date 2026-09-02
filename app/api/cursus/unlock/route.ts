import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Vérifie le code d'accès de la section Cursus, côté serveur (les mots de passe
 * ne sont jamais envoyés au navigateur). Le code est valide s'il correspond au
 * mot de passe d'AU MOINS un cursus : un seul code ouvre alors toute la section.
 *   body : { code }
 */
export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({}));
  const entered = String(code ?? '').trim();
  if (!entered) return NextResponse.json({ ok: false });

  const { data } = await admin.from('cursus').select('password');
  const passwords = (data ?? []).map(c => (c.password ?? '').trim()).filter(Boolean);

  const ok = passwords.some(p => p === entered);
  return NextResponse.json({ ok });
}
