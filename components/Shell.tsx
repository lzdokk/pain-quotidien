import Link from 'next/link';
import Nav from './Nav';
import Reading from './Reading';
import DayActions from './DayActions';

type Props = { day: any; readings: any[]; user: any; archive?: boolean };

const fdate = (d: string) => {
  const [y, m, j] = d.split('-').map(Number);
  const s = new Intl.DateTimeFormat('fr-FR',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, j));
  return s[0].toUpperCase() + s.slice(1);
};

export default function Shell({ day, readings, user, archive }: Props) {
  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Le pain du matin</div>
          <div className="date">{fdate(day.date)}</div>
          <h1 dangerouslySetInnerHTML={{ __html: day.theme_title }} />
          <p className="lede">{day.theme_lede}</p>
          <div className="liturgy">
            <span className="dot" /> {day.liturgical_week ?? 'Plan de lecture'} · Bible Segond
            {archive ? ' · archive' : ''}
          </div>
        </header>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Link href="/jours" className="back" style={{ display: 'inline-block' }}>
            Parcourir les jours passes ›
          </Link>
        </div>

        <div className="prayer opening">
          <span className="kicker">Priere d&rsquo;ouverture</span>
          <p>{day.prayer_open}</p>
        </div>

        <div className="card pad">
          <span className="kicker">Le centre du message</span>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 21, lineHeight: 1.55, color: 'var(--ink)' }}>
            {day.central_message}
          </p>
        </div>

        <h2 className="sect">Les lectures du jour</h2>
        <p className="sub">Touchez une lecture pour deplier le texte integral et son resume.</p>
        <div className="card">
          {readings.map((r, i) => <Reading key={r.id} r={r} index={i} open={i === 0} />)}
        </div>

        <div className="card verse">
          <blockquote>{day.verse_text}</blockquote>
          <cite>{day.verse_ref.toUpperCase()} · SEGOND</cite>
        </div>

        <h2 className="sect">Le pain quotidien</h2>
        <p className="sub">Ce que ce texte vient dire a votre journee.</p>
        <div className="card pad pq">
          <p className="lead">{day.bread_lead}</p>
          <h3>Ce que dit le texte</h3>
          {(day.bread_says as string[]).map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
          <h3>Ce que ca touche en nous</h3>
          {(day.bread_touches as string[]).map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />)}
        </div>

        <DayActions date={day.date} actions={day.actions} user={user} />

        <div className="prayer">
          <span className="kicker">Priere de fermeture</span>
          <p>{day.prayer_close}</p>
        </div>
      </main>
    </>
  );
}
