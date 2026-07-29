import { supabaseServer } from '@/lib/supabase/server';
import Shell from '@/components/Shell';
import { parisDate } from '@/lib/date';

export const revalidate = 3600;

export default async function Home() {
  const sb = await supabaseServer();
  const today = parisDate();

  const { data: day } = await sb.from('daily_bread')
    .select('*').eq('date', today).eq('published', true).maybeSingle();

  const { data: readings } = await sb.from('readings')
    .select('*').eq('date', today).order('position');

  const { data: { user } } = await sb.auth.getUser();

  if (!day) {
    return (
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Le Pain quotidien</div>
          <h1>Le pain du jour<br />arrive bientot</h1>
          <p className="lede">La génération hebdomadaire n'a pas encore tourne. Revenez dans un instant.</p>
        </header>
      </main>
    );
  }
  return <Shell day={day} readings={readings ?? []} user={user} />;
}
