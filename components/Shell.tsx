import Nav from './Nav';
import Readings from './Readings';
import DayActions from './DayActions';
import DayNav from './DayNav';
import { rich } from '@/lib/rich';

type Props = {
  day: any; readings: any[]; user: any; archive?: boolean;
  recentDays?: string[]; translationName?: string;
};

const fdate = (d: string) => {
  const [y, m, j] = d.split('-').map(Number);
  const s = new Intl.DateTimeFormat('fr-FR',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, j));
  return s[0].toUpperCase() + s.slice(1);
};

export default function Shell({ day, readings, user, archive, recentDays, translationName }: Props) {
  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Le pain du matin{archive ? ' · archive' : ''}</div>
          <div className="date">{fdate(day.date)}</div>
          <h1 dangerouslySetInnerHTML={{ __html: rich(day.theme_title) }} />
          <p className="lede" dangerouslySetInnerHTML={{ __html: rich(day.theme_lede) }} />
        </header>

        {recentDays && recentDays.length > 0 && (
          <DayNav days={recentDays} current={day.date} />
        )}

        <div className="prayer opening">
          <span className="kicker">Prière d&rsquo;ouverture</span>
          <p dangerouslySetInnerHTML={{ __html: rich(day.prayer_open) }} />
        </div>

        <div className="card pad">
          <span className="kicker">Le centre du message</span>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 21, lineHeight: 1.55, color: 'var(--ink)' }}
             dangerouslySetInnerHTML={{ __html: rich(day.central_message) }} />
        </div>

        <h2 className="sect">Les lectures du jour</h2>
        <p className="sub">Touchez une lecture pour déplier le texte intégral et son résumé.</p>
        <Readings readings={readings} user={user} translationName={translationName} />

        <div className="card verse">
          <blockquote>{day.verse_text}</blockquote>
          <cite>{day.verse_ref.toUpperCase()} · SEGOND</cite>
        </div>

        <h2 className="sect">Le pain quotidien</h2>
        <p className="sub">Ce que ce texte vient dire à votre journée.</p>
        <div className="card pad pq">
          <p className="lead" dangerouslySetInnerHTML={{ __html: rich(day.bread_lead) }} />
          <h3>Ce que dit le texte</h3>
          {(day.bread_says as string[]).map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: rich(p) }} />)}
          <h3>Ce que ça touche en nous</h3>
          {(day.bread_touches as string[]).map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: rich(p) }} />)}
        </div>

        <DayActions date={day.date} actions={day.actions} user={user} />

        <div className="prayer">
          <span className="kicker">Prière de fermeture</span>
          <p dangerouslySetInnerHTML={{ __html: rich(day.prayer_close) }} />
        </div>

        {day.objection_q && (
          <div className="card pad" style={{ marginTop: 12 }}>
            <span className="kicker">L&rsquo;objection du jour</span>
            <h3 style={{ marginTop: 6 }}>{day.objection_q}</h3>
            {(day.objection_a as string[]).map((p, i) =>
              <p key={i} style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: rich(p) }} />)}
          </div>
        )}
      </main>
    </>
  );
}
