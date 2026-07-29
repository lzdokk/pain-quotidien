import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import { parisDate } from '@/lib/date';

export const revalidate = 3600;
export const metadata = { title: 'Prière' };

type Moment = {
  theme: string; prayer: string; tip: string;
  word: string; word_lang: string; word_meaning: string;
};

const paragraphs = (t: string) => t.split(/\n+/).map(s => s.trim()).filter(Boolean);

export default async function Priere() {
  const sb = await supabaseServer();
  const today = parisDate();
  const { data: day } = await sb.from('daily_bread')
    .select('date, theme_title, prayer_intro, prayer_moments, spirit_invitation')
    .eq('date', today).eq('published', true).maybeSingle();
  const { data: { user } } = await sb.auth.getUser();

  if (!day || !day.prayer_moments) {
    return (
      <>
        <Nav user={user} />
        <main className="wrap">
          <header className="hero">
            <div className="eyebrow">Prière · chaque jour</div>
            <h1>Le temps de prière<br />arrive bientôt</h1>
            <p className="lede">Revenez un peu plus tard, il se prépare avec la lecture du jour.</p>
          </header>
        </main>
      </>
    );
  }

  const moments = day.prayer_moments as Moment[];

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Prière · chaque jour</div>
          <h1>Entrer en<br />communion avec Dieu</h1>
          <p className="lede">Cinq temps pour prier, en lien avec le pain quotidien de {day.theme_title ? 'ce jour' : "aujourd'hui"}.</p>
        </header>

        <div className="prayer opening">
          <span className="kicker">Avant de commencer</span>
          <p>{day.prayer_intro}</p>
        </div>

        {moments.map((m, i) => (
          <div className="card pad" key={i}>
            <span className="moment-n">Temps {i + 1} sur 5</span>
            <span className="kicker">{m.theme}</span>
            {paragraphs(m.prayer).map((p, j) => (
              <p key={j} style={{ fontFamily: 'var(--serif)', fontSize: 17.5, lineHeight: 1.74, fontStyle: 'italic', color: 'var(--ink-2)' }}>
                {p}
              </p>
            ))}

            <div className="pray-tip">
              <b>Pour prier ce moment avec le texte du jour</b><br />{m.tip}
            </div>

            <div className="pray-word">
              <div className="wlabel">
                <span className="wterm">{m.word}</span>
                <span className="wlang">{m.word_lang}</span>
              </div>
              <p>{m.word_meaning}</p>
            </div>
          </div>
        ))}

        <div className="breathe"><div className="orb"><span>Silence</span></div></div>

        <div className="prayer">
          <span className="kicker">Communion avec le Saint-Esprit</span>
          <p>{day.spirit_invitation}</p>
        </div>
      </main>
    </>
  );
}
