import Nav from './Nav';
import Readings from './Readings';
import DayNav from './DayNav';
import ShareButton from './ShareButton';
import DayLoadButton from './DayLoadButton';
import { rich } from '@/lib/rich';

type Props = {
  day: any; readings: any[]; user: any; archive?: boolean;
  recentDays?: string[]; translationName?: string;
  missingDays?: string[]; isAdmin?: boolean; todayDate?: string;
  verseText?: string; verseName?: string;
};

const fdate = (d: string) => {
  const [y, m, j] = d.split('-').map(Number);
  const s = new Intl.DateTimeFormat('fr-FR',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, j));
  return s[0].toUpperCase() + s.slice(1);
};

export default function Shell({ day, readings, user, archive, recentDays, translationName,
  missingDays = [], isAdmin = false, todayDate, verseText, verseName }: Props) {
  // Verset du jour cite dans la traduction par defaut du site (S21 si importee).
  const vText = verseText ?? day.verse_text;
  const vName = (verseName ?? 'Segond').toUpperCase();
  // Aujourd'hui n'est pas encore genere : on affiche un repli (archive) mais,
  // en admin, on propose de charger le pain du jour d'un seul geste.
  const showLoadToday = isAdmin && archive && !!todayDate && day.date !== todayDate;
  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        {showLoadToday && (
          <div className="admin-bar">
            <div>
              <b>Le pain d&rsquo;aujourd&rsquo;hui n&rsquo;est pas encore généré.</b>
              <span> Vous lisez le dernier jour publié.</span>
            </div>
            <DayLoadButton date={todayDate!} label="Charger le pain d’aujourd’hui" className="btn" />
          </div>
        )}
        <header className="hero">
          <div className="eyebrow">Le pain du matin{archive ? ' · archive' : ''}</div>
          <div className="date">{fdate(day.date)}</div>
          <h1 dangerouslySetInnerHTML={{ __html: rich(day.theme_title) }} />
          <p className="lede" dangerouslySetInnerHTML={{ __html: rich(day.theme_lede) }} />
        </header>

        {recentDays && recentDays.length > 0 && (
          <DayNav days={recentDays} current={day.date}
                  missingDays={missingDays} isAdmin={isAdmin} />
        )}

        {isAdmin && (
          <div className="admin-regen">
            <span className="ar-tag">Admin</span>
            <span className="ar-txt">Ce jour est déjà généré. Le régénérer écrase le contenu actuel.</span>
            <DayLoadButton date={day.date} label="Régénérer ce jour" className="btn sm" />
          </div>
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
          <blockquote>{vText}</blockquote>
          <cite>{day.verse_ref.toUpperCase()} · {vName}</cite>
          <div className="verse-share">
            <ShareButton title={day.verse_ref}
                         text={`« ${vText} »\n${day.verse_ref}\n\n— Pain de Vie, le pain quotidien`}
                         label="Partager ce verset" className="btn sm" />
          </div>
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

        {day.bread_close && (
          <div className="card pad bread-close">
            <span className="kicker">À retenir aujourd&rsquo;hui</span>
            <p dangerouslySetInnerHTML={{ __html: rich(day.bread_close) }} />
          </div>
        )}

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
