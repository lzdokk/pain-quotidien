import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import CursusBrowser from '@/components/CursusBrowser';
import { admin } from '@/lib/supabase/admin';
import { isCursusAdmin } from '@/lib/cursus-admins';
import { getCursusStatic } from '@/lib/cache';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cursus theologique' };


export default async function Cursus() {
  const sb = await supabaseServer();
  const [{ data: { user } }, stat] = await Promise.all([sb.auth.getUser(), getCursusStatic()]);
  const { cursus, levels, groups, courses } = stat;

  const { data: progress } = user
    ? await sb.from('course_progress').select('code')
    : { data: [] };


  const isAdmin = isCursusAdmin(user?.email);
  // Frère ou sœur à qui le responsable a donné l'accès par email.
  const { data: member } = user?.email && !isAdmin
    ? await admin.from('cursus_members').select('email').eq('email', user.email.toLowerCase()).maybeSingle()
    : { data: null };

  return (
    <>
      <Nav user={user} />
      <CursusBrowser
        cursus={cursus}
        levels={levels ?? []}
        groups={groups ?? []}
        courses={courses ?? []}
        done={(progress ?? []).map(p => p.code)}
        user={user}
        isAdmin={isAdmin}
        isMember={!!member}
      />
    </>
  );
}
