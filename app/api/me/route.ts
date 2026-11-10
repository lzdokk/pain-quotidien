import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import { isCursusAdmin } from '@/lib/cursus-admins';

export const dynamic = 'force-dynamic';

/** Droits de l'utilisateur connecté : responsable ? membre du cursus ? */
export async function GET() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ user: false, isAdmin: false, isMember: false });
  const isAdmin = isCursusAdmin(user.email);
  const { data: member } = !isAdmin && user.email
    ? await admin.from('cursus_members').select('email').eq('email', user.email.toLowerCase()).maybeSingle()
    : { data: null };
  return NextResponse.json({ user: true, isAdmin, isMember: !!member }, { headers: { 'Cache-Control': 'private, no-store' } });
}
