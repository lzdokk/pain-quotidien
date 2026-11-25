import { supabasePublic } from '@/lib/supabase/public';
import { contentDate } from '@/lib/date';
import { citedVerse } from '@/lib/bible';
import { polishDeep } from '@/lib/accents';
import HomeTiles from '@/components/HomeTiles';
import HomeHero from '@/components/HomeHero';

export const revalidate = 3600; // rafraîchi aussi à la publication du jour (cron daily)
export const metadata = { title: 'Accueil' };

/** ACCUEIL : le verset du jour et les tuiles pour aller partout d'un toucher. */
export default async function Accueil() {
  const sb = await supabasePublic();
  const today = contentDate();
  let { data: day } = await sb.from('daily_bread')
    .select('date, theme_title, verse_ref, verse_text').eq('published', true).lte('date', today)
    .order('date', { ascending: false }).limit(1).maybeSingle();
  if (day) day = polishDeep(day);
  const v = day ? await citedVerse(day.verse_ref, day.verse_text) : null;

  return (
    <main className="wrap home home-v2">
      <HomeHero date={today} dateLabel={fdate(today)} text={v?.text ?? null} refLabel={day?.verse_ref ?? null} theme={day?.theme_title ?? null} />
      <div id="home-suite" className="home-suite">
        <HomeTiles theme={day?.theme_title ?? null} />
      </div>
    </main>
  );
}

function fdate(d: string) {
  const [y, m, j] = d.split('-').map(Number);
  const s = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(y, m - 1, j));
  return s[0].toUpperCase() + s.slice(1);
}
