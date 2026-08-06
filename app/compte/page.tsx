import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import Profile from '@/components/Profile';
import NotifyButton from '@/components/NotifyButton';

export const metadata = { title: 'Mon profil' };
export const dynamic = 'force-dynamic';

export default async function Compte() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/');

  const [{ data: profile }, { data: plan }, { data: notes }, { data: highlights }, { data: conversations }] =
    await Promise.all([
      sb.from('profiles').select('*').eq('id', user.id).single(),
      sb.from('user_plan').select('*, reading_plans(name)').eq('user_id', user.id).maybeSingle(),
      sb.from('notes').select('*').order('created_at', { ascending: false }),
      sb.from('highlights').select('*'),
      sb.from('conversations').select('*').order('created_at', { ascending: false }).limit(50)
    ]);

  return (
    <>
      <Nav user={user} />
      <div className="wrap" style={{ marginTop: 20 }}>
        <NotifyButton />
        <p style={{ marginTop: 12, fontSize: 13 }}>
          <a href="/surlignes">Versets surlignés{(highlights?.length ?? 0) ? ` (${highlights!.length})` : ''} — classés par thème ›</a>
        </p>
        <p style={{ marginTop: 8, fontSize: 13 }}>
          <a href="/installer">Installer l'app / la partager à un proche ›</a>
        </p>
      </div>
      <Profile
        user={user}
        profile={profile}
        plan={plan}
        notes={notes ?? []}
        highlights={highlights ?? []}
        conversations={conversations ?? []}
      />
    </>
  );
}
