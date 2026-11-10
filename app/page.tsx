import { supabasePublic } from '@/lib/supabase/public';
import { contentDate } from '@/lib/date';
import { citedVerse } from '@/lib/bible';
import { polishDeep } from '@/lib/accents';
import HomeTiles from '@/components/HomeTiles';

export const revalidate = 300;
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
    <main className="wrap home">
      <header className="home-head">
        <p className="home-date">{fdate(today)}</p>
        <h1>Pain de Vie</h1>
      </header>

      {day && v && (
        <a href="/pain" className="home-verse">
          <blockquote>{v.text}</blockquote>
          <cite>{day.verse_ref}</cite>
        </a>
      )}

      <HomeTiles theme={day?.theme_title ?? null} />
    </main>
  );
}

function fdate(d: string) {
  const [y, m, j] = d.split('-').map(Number);
  const s = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(y, m - 1, j));
  return s[0].toUpperCase() + s.slice(1);
}
