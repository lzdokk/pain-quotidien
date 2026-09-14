import { supabaseServer } from '@/lib/supabase/server';
import Shell from '@/components/Shell';
import { contentDate } from '@/lib/date';
import { bdsTranslation, readingsWithTranslation } from '@/lib/bible';

// Toujours frais : le jour affiche depend de l'heure (contentDate), donc on
// ne met jamais cette page en cache — sinon elle peut montrer la veille.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Le pain du matin' };

const ADMINS = (process.env.CURSUS_ADMINS ?? 'lzdokk@gmail.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

// Dates attendues sur les N derniers jours (jusqu'a aujourd'hui inclus).
function lastDates(today: string, n: number): string[] {
  const [y, m, d] = today.split('-').map(Number);
  const base = Date.UTC(y, m - 1, d);
  return Array.from({ length: n }, (_, i) => {
    const t = new Date(base - i * 86400000);
    return t.toISOString().slice(0, 10);
  });
}

export default async function Pain() {
  const sb = await supabaseServer();
  const today = contentDate();

  // Le pain du jour ; s'il n'est pas encore genere, on retombe sur le DERNIER
  // pain publie plutot que d'afficher une page vide.
  let { data: day } = await sb.from('daily_bread')
    .select('*').eq('date', today).eq('published', true).maybeSingle();
  if (!day) {
    const { data: last } = await sb.from('daily_bread')
      .select('*').eq('published', true).lte('date', today)
      .order('date', { ascending: false }).limit(1).maybeSingle();
    day = last ?? null;
  }
  const shownDate = day?.date ?? today;

  const { data: readings } = await sb.from('readings')
    .select('*').eq('date', shownDate).order('position');

  const bds = await bdsTranslation();
  const readingsBds = await readingsWithTranslation(readings ?? [], bds.code);

  const { data: { user } } = await sb.auth.getUser();
  const isAdmin = !!user?.email && ADMINS.includes(user.email.toLowerCase());

  const { data: recent } = await sb.from('daily_bread')
    .select('date').eq('published', true).lte('date', today)
    .order('date', { ascending: false }).limit(62);
  const recentDays = (recent ?? []).map(d => d.date).reverse();

  // Jours attendus (14 derniers) non publies : affiches en admin comme
  // pastilles a charger. On calcule cote serveur pour eviter tout ecart.
  const publishedSet = new Set(recentDays);
  const missingDays = isAdmin
    ? lastDates(today, 14).filter(d => !publishedSet.has(d))
    : [];

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
                translationName={bds.name} archive={day.date !== today}
                missingDays={missingDays} isAdmin={isAdmin} todayDate={today} />;
}
