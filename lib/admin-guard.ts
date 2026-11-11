import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { isCursusAdmin } from '@/lib/cursus-admins';

/** Pages réservées au responsable : les autres repartent vers l'accueil. */
export async function requireAdmin() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!isCursusAdmin(user?.email)) redirect('/');
  return user!;
}
