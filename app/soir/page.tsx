import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import Checklist from '@/components/Checklist';
import { contentDate } from '@/lib/date';
import { rich } from '@/lib/rich';

export const dynamic = 'force-dynamic'; // toujours le jour courant, jamais du cache
export const metadata = { title: 'La veillée du soir' };

const fdate = (d: string) => {
  const [y, m, j] = d.split('-').map(Number);
  const s = new Intl.DateTimeFormat('fr-FR',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, j));
  return s[0].toUpperCase() + s.slice(1);
};

export default async function Soir() {
  const sb = await supabaseServer();
  const today = contentDate();
  const { data: day } = await sb.from('daily_bread')
    .select('*').eq('date', today).eq('published', true).maybeSingle();
  const { data: { user } } = await sb.auth.getUser();

  if (!day) return <><Nav user={user} /><main className="wrap"><header className="hero"><h1>La veillée arrive</h1></header></main></>;

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">La veillée du soir</div>
          <div className="date">{fdate(day.date)} · 21h00</div>
          <h1>Poser<br />la journée</h1>
          <p className="lede">Cinq minutes avant de dormir. Un verset, un silence, une relecture, une paix.</p>
        </header>

        <div className="card verse">
          <div className="breathe"><div className="orb"><span>Respirez</span></div></div>
          <blockquote>{day.evening_verse}</blockquote>
          <cite>{day.evening_verse_ref?.toUpperCase()} · SEGOND</cite>
        </div>

        <div className="card pad pq">
          <span className="kicker">Meditation du soir</span>
          <h3 style={{ marginTop: 6 }}>{day.evening_title}</h3>
          {(day.evening_meditation as string[]).map((p, i) =>
            <p key={i} dangerouslySetInnerHTML={{ __html: rich(p) }} />)}
        </div>

        <Checklist title="Relecture, trois questions"
                   items={(day.evening_review as Array<{ title: string; body: string }>)} />

        <div className="prayer">
          <span className="kicker">Prière avant le sommeil</span>
          <p dangerouslySetInnerHTML={{ __html: rich(day.prayer_night) }} />
        </div>
      </main>
    </>
  );
}
