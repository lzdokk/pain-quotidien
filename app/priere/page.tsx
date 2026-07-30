import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import { parisDate } from '@/lib/date';
import {
  POURQUOI, COMMENT, AXES, AXES_NOTE,
  NOTRE_PERE_INTRO, NOTRE_PERE_DEMANDES, THEMES, SOURCE_NOTE
} from '@/lib/prayer-teaching';

export const revalidate = 3600;
export const metadata = { title: 'Prière' };

type Axe = {
  axis: string; prayer: string; tip: string;
  word: string; word_lang: string; word_meaning: string;
};
type Demande = { demande: string; prayer: string };

const paragraphs = (t?: string | null) =>
  (t ?? '').split(/\n+/).map(s => s.trim()).filter(Boolean);

/* Une priere du jour, en serif italique, comme une voix qu'on reprend. */
function Priere({ texte }: { texte?: string | null }) {
  return (
    <>
      {paragraphs(texte).map((p, i) => (
        <p key={i} style={{
          fontFamily: 'var(--serif)', fontSize: 17.5, lineHeight: 1.76,
          fontStyle: 'italic', color: 'var(--ink-2)'
        }}>{p}</p>
      ))}
    </>
  );
}

export default async function Priere_() {
  const sb = await supabaseServer();
  const today = parisDate();
  const { data: day } = await sb.from('daily_bread')
    .select('date, theme_title, prayer_intro, prayer_axes, prayer_notre_pere, prayer_confession, prayer_supplication, spirit_invitation')
    .eq('date', today).eq('published', true).maybeSingle();
  const { data: { user } } = await sb.auth.getUser();

  const axes = (day?.prayer_axes ?? []) as Axe[];
  const notrePere = (day?.prayer_notre_pere ?? []) as Demande[];
  const duJour = axes.length > 0;

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Prière · chaque jour</div>
          <h1>Entrer en<br />communion avec Dieu</h1>
          <p className="lede">
            La prière est à l&rsquo;esprit ce que le souffle est à la poitrine.
            Trois axes, une prière-modèle, et le texte du jour pour la nourrir.
          </p>
        </header>

        {/* ── L'enseignement, replie par defaut ─────────────────────── */}
        <details className="card pad volet">
          <summary>
            <span className="kicker" style={{ marginBottom: 0 }}>Comprendre la prière</span>
            <h3 style={{ marginTop: 6 }}>Pourquoi prier, comment prier, et selon quelle structure</h3>
          </summary>

          <div className="teach">
            <h4 className="teach-h">Pourquoi prier</h4>
            {POURQUOI.map((b, i) => (
              <section key={i}>
                <h5>{b.titre}</h5>
                {b.corps.map((p, j) => <p key={j}>{p}</p>)}
                {b.verset && (
                  <blockquote className="tq">
                    {b.verset}<cite>{b.ref}</cite>
                  </blockquote>
                )}
              </section>
            ))}

            <h4 className="teach-h">Comment prier</h4>
            {COMMENT.map((b, i) => (
              <section key={i}>
                <h5>{b.titre}</h5>
                {b.corps.map((p, j) => <p key={j}>{p}</p>)}
                {b.verset && (
                  <blockquote className="tq">
                    {b.verset}<cite>{b.ref}</cite>
                  </blockquote>
                )}
              </section>
            ))}

            <h4 className="teach-h">Les trois axes</h4>
            <div className="axgrid">
              {AXES.map((a, i) => (
                <div className="axcard" key={i}>
                  <span className="axn">{i + 1}</span>
                  <h5>{a.nom}</h5>
                  <div className="axgk"><i>{a.grec}</i> · {a.grec_sens}</div>
                  <div className="axobj">{a.objet}</div>
                  <p>{a.texte}</p>
                  <blockquote className="tq">{a.verset}<cite>{a.ref}</cite></blockquote>
                </div>
              ))}
            </div>
            {AXES_NOTE.map((p, i) => <p key={i}>{p}</p>)}

            <h4 className="teach-h">Le Notre Père, prière-modèle</h4>
            {NOTRE_PERE_INTRO.map((p, i) => <p key={i}>{p}</p>)}
            <ul className="npl">
              {NOTRE_PERE_DEMANDES.map(([d, v], i) => (
                <li key={i}><b>{d}</b><span>{v}</span></li>
              ))}
            </ul>

            <h4 className="teach-h">Les autres registres</h4>
            {THEMES.map((b, i) => (
              <section key={i}>
                <h5>{b.titre}</h5>
                {b.corps.map((p, j) => <p key={j}>{p}</p>)}
                {b.verset && (
                  <blockquote className="tq">{b.verset}<cite>{b.ref}</cite></blockquote>
                )}
              </section>
            ))}

            <p className="fine" style={{ marginTop: 22 }}>{SOURCE_NOTE}</p>
          </div>
        </details>

        {!duJour && (
          <div className="card pad">
            <span className="kicker">La prière du jour</span>
            <p className="empty" style={{ marginTop: 8 }}>
              Elle se prépare avec la lecture du jour. Revenez dans un instant.
            </p>
          </div>
        )}

        {duJour && (
          <>
            <div className="prayer opening">
              <span className="kicker">Entrer en prière</span>
              <p>{day!.prayer_intro}</p>
            </div>

            <h2 className="sect">Les trois axes, aujourd&rsquo;hui</h2>
            <p className="sub">
              On adore Dieu pour ce qu&rsquo;il est, on le loue pour ce qu&rsquo;il fait,
              et c&rsquo;est seulement alors qu&rsquo;on intercède.
            </p>

            {axes.map((a, i) => {
              const ref = AXES.find(x => x.nom.toLowerCase() === a.axis?.toLowerCase());
              return (
                <div className="card pad" key={i}>
                  <span className="moment-n">Axe {i + 1} sur 3</span>
                  <span className="kicker">{a.axis}</span>
                  {ref && (
                    <div className="axline">
                      <i>{ref.grec}</i> · {ref.grec_sens} · <b>{ref.objet}</b>
                    </div>
                  )}
                  <Priere texte={a.prayer} />

                  <div className="pray-tip">
                    <b>Prier cet axe avec le texte du jour</b><br />{a.tip}
                  </div>

                  <div className="pray-word">
                    <div className="wlabel">
                      <span className="wterm">{a.word}</span>
                      <span className="wlang">{a.word_lang}</span>
                    </div>
                    <p>{a.word_meaning}</p>
                  </div>
                </div>
              );
            })}

            {notrePere.length > 0 && (
              <>
                <h2 className="sect">Le Notre Père, prié aujourd&rsquo;hui</h2>
                <p className="sub">
                  Non pas récité, mais repris demande après demande, à la lumière du texte du jour.
                </p>
                <div className="card">
                  {notrePere.map((d, i) => (
                    <div className="npd" key={i}>
                      <span className="npn">{i + 1}</span>
                      <div>
                        <h4>{d.demande}</h4>
                        <p>{d.prayer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <h2 className="sect">Se remettre devant Dieu</h2>
            <p className="sub">La confession, puis les besoins déposés avec actions de grâces.</p>

            <div className="card pad">
              <span className="kicker">Confession</span>
              <Priere texte={day!.prayer_confession} />
              <blockquote className="tq" style={{ marginTop: 16 }}>
                Ô Dieu, crée en moi un cœur pur, et renouvelle en moi un esprit bien disposé.
                <cite>Psaume 51.12</cite>
              </blockquote>
            </div>

            <div className="card pad">
              <span className="kicker">Supplication</span>
              <Priere texte={day!.prayer_supplication} />
              <blockquote className="tq" style={{ marginTop: 16 }}>
                Ne vous inquiétez de rien, mais en toute chose faites connaître vos besoins à Dieu
                par des prières et des supplications, avec des actions de grâces.
                <cite>Philippiens 4.6</cite>
              </blockquote>
            </div>

            <div className="breathe"><div className="orb"><span>Silence</span></div></div>

            <div className="prayer">
              <span className="kicker">Communion avec le Saint-Esprit</span>
              <p>{day!.spirit_invitation}</p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
