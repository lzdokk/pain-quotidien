import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import Reader from '@/components/Reader';
import { getReaderStatic } from '@/lib/cache';

export const metadata = { title: 'Lire la Bible' };
export const dynamic = 'force-dynamic';

export default async function Lire() {
  const sb = await supabaseServer();
  // Contenus publics (cache serveur) et utilisateur, en même temps.
  const [stat, { data: { user } }] = await Promise.all([getReaderStatic(), sb.auth.getUser()]);
  const { books, translations: trans, plans, steps, intros } = stat;

  const [{ data: plan }, { data: notes }, { data: hls }] = user
    ? await Promise.all([
        sb.from('user_plan').select('*').maybeSingle(),
        sb.from('notes').select('*').order('created_at', { ascending: false }).limit(60),
        sb.from('highlights').select('*')
      ])
    : [{ data: null }, { data: [] }, { data: [] }] as any[];

  return (
    <>
      <Nav user={user} />
      <Reader books={books ?? []} translations={trans ?? []} plans={plans ?? []}
              steps={steps ?? []} plan={plan} notes={notes ?? []} highlights={hls ?? []}
              intros={intros ?? []} user={user} />
    </>
  );
}
