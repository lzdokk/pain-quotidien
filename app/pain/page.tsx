import { supabaseServer } from '@/lib/supabase/server';
import Shell from '@/components/Shell';
import { contentDate } from '@/lib/date';
import { bdsTranslation, readingsWithTranslation } from '@/lib/bible';

// Toujours frais : le jour affiche depend de l'heure (contentDate), donc on
// ne met jamais cette page en cache — sinon elle peut montrer la veille.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Le pain du matin' };

export default async function Pain() {
  const sb = await supabaseServer();
  const today = contentDate();

  const { data: day } = await sb.from('daily_bread')
    .select('*').eq('date', today).eq('published', true).maybeSingle();

  const { data: readings } = await sb.from('readings')
    .select('*').eq('date', today).order('position');

  const bds = await bdsTranslation();
  const readingsBds = await readingsWithTranslation(readings ?? [], bds.code);

  const { data: { user } } = await sb.auth.getUser();

  const { data: recent } = await sb.from('daily_bread')
    .select('date').eq('published', true).lte('date', today)
    .order('date', { ascending: false }).limit(62);
  const recentDays = (recent ?? []).map(d => d.date).reverse();

  if (!day) {
    return (
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Le Pain quotidien</div>
          <h1>Le pain du jour<br />arrive bientôt</h1>
          <p className="lede">La génération hebdomadaire n&rsquo;a pas encore tourné. Revenez dans un instant.</p>
        </header>
      </main>
    );
  }
  return <Shell day={day} readings={readingsBds} user={user} recentDays={recentDays}
                translationName={bds.name} />;
}
