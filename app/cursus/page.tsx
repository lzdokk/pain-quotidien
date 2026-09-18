import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import CursusBrowser from '@/components/CursusBrowser';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cursus theologique' };

// Emails ayant accès à TOUT (bypass des codes). Réglable via CURSUS_ADMINS
// (liste séparée par des virgules) ; par défaut, le compte du propriétaire.
const ADMINS = (process.env.CURSUS_ADMINS ?? 'lzdokk@gmail.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export default async function Cursus() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  const [{ data: cursusRows }, { data: levels }, { data: groups }, { data: courses }] = await Promise.all([
    sb.from('cursus').select('id, name, subtitle, source_url, password, order_index').order('order_index'),
    sb.from('cursus_levels').select('*').order('order_index'),
    sb.from('cursus_groups').select('*').order('order_index'),
    sb.from('courses').select('code, group_id, title, kind, hook, hours, order_index, status').order('order_index')
  ]);

  const { data: progress } = user
    ? await sb.from('course_progress').select('code')
    : { data: [] };

  // On n'envoie JAMAIS le mot de passe au navigateur : juste « verrouillé ou non ».
  const cursus = (cursusRows ?? []).map(c => ({
    id: c.id, name: c.name, subtitle: c.subtitle, source_url: c.source_url,
    order_index: c.order_index, locked: !!c.password
  }));

  const isAdmin = !!user?.email && ADMINS.includes(user.email.toLowerCase());

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
      />
    </>
  );
}
