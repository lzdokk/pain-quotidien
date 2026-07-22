import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import CursusBrowser from '@/components/CursusBrowser';

export const revalidate = 3600;
export const metadata = { title: 'Cursus theologique' };

export default async function Cursus() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  const { data: levels } = await sb.from('cursus_levels').select('*').order('order_index');
  const { data: groups } = await sb.from('cursus_groups').select('*').order('order_index');
  const { data: courses } = await sb.from('courses')
    .select('code, group_id, title, kind, hook, hours, order_index, status').order('order_index');
  const { data: progress } = user
    ? await sb.from('course_progress').select('code')
    : { data: [] };

  return (
    <>
      <Nav user={user} />
      <CursusBrowser levels={levels ?? []} groups={groups ?? []} courses={courses ?? []}
                     done={(progress ?? []).map(p => p.code)} user={user} />
    </>
  );
}
