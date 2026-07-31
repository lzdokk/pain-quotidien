import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import Reader from '@/components/Reader';

export const metadata = { title: 'Lire la Bible' };
export const dynamic = 'force-dynamic';

export default async function Lire() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  const [{ data: books }, { data: trans }, { data: plans }, { data: steps }, { data: intros }] = await Promise.all([
    sb.from('books').select('id, name, chapters').order('id'),
    sb.from('translations').select('code, name, notice, enabled, source, api_id').eq('enabled', true).order('code'),
    sb.from('reading_plans').select('*').order('order_index'),
    sb.from('plan_steps').select('*').order('position'),
    sb.from('book_intros').select('book, name, testament, section, title, situ, who, why, christ, key_verse')
  ]);

  const { data: plan } = user ? await sb.from('user_plan').select('*').single() : { data: null };
  const { data: notes } = user
    ? await sb.from('notes').select('*').order('created_at', { ascending: false }).limit(60)
    : { data: [] };
  const { data: hls } = user ? await sb.from('highlights').select('*') : { data: [] };

  return (
    <>
      <Nav user={user} />
      <Reader books={books ?? []} translations={trans ?? []} plans={plans ?? []}
              steps={steps ?? []} plan={plan} notes={notes ?? []} highlights={hls ?? []}
              intros={intros ?? []} user={user} />
    </>
  );
}
