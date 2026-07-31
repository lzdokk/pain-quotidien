import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import Openers from '@/components/Openers';
import Intercession from '@/components/Intercession';
import ShareBar from '@/components/ShareBar';
import { parisDate } from '@/lib/date';

export const revalidate = 3600;
export const metadata = { title: 'Temoigner' };

const GOSPEL = [
  ['Dieu', "Il n'est pas une force floue. Il est une personne, il créé, et il créé bon. Nous sommes voulus, pas produits par accident.", 'Genese 1.27 · Psaume 139.13-14'],
  ['La rupture', "Quelque chose est casse, dans le monde et en nous. Ce n'est pas un defaut d'education, c'est une séparation. Et personne ne s'en sort par ses propres moyens.", 'Romains 3.23 · Ésaïe 59.2'],
  ['La croix', "Dieu n'a pas envoye un mode d'emploi, il est venu lui-même. Jésus prend la place, meurt, et ressuscite. La dette n'est pas allegee : elle est payee.", 'Romains 5.8 · 1 Corinthiens 15.3-4'],
  ['La reponse', "Rien a meriter, tout a recevoir. Se detourner de ce qui nous tenait, faire confiance a Christ. C'est la que commencé la vie nouvelle, et l'entree dans la famille.", 'Ephesiens 2.8-9 · Jean 1.12']
];

export default async function Témoigner() {
  const sb = await supabaseServer();
  const today = parisDate();
  const { data: day } = await sb.from('daily_bread')
    .select('*').eq('date', today).eq('published', true).maybeSingle();
  const { data: { user } } = await sb.auth.getUser();
  const { data: profile } = user
    ? await sb.from('profiles').select('intercession_name').eq('id', user.id).maybeSingle()
    : { data: null };

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Témoigner · chaque jour</div>
          <h1>Ce texte est<br />pour quelqu&rsquo;un<br />d&rsquo;autre aussi</h1>
          <p className="lede">Pas une technique. Une phrase juste, au bon moment, a la bonne personne.</p>
        </header>

        {day && (
          <>
            <div className="card pad">
              <span className="kicker">Le fil du jour</span>
              <h3 style={{ marginTop: 6 }}>Ce que le texte d&rsquo;aujourd&rsquo;hui vous donne a dire</h3>
              {(day.witness_thread as string[]).map((p, i) =>
                <p key={i} style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: p }} />)}
            </div>

            <Openers items={day.witness_openers as string[]} />
          </>
        )}

        <div className="card pad">
          <span className="kicker">L&rsquo;Évangile en quatre mouvements</span>
          <h3 style={{ marginTop: 6 }}>A savoir par coeur, a sortir en deux minutes</h3>
          <div className="gospel">
            {GOSPEL.map(([t, p, v], i) => (
              <div className="mv" key={i}>
                <span className="mv-n">{i + 1}</span>
                <div><h4>{t}</h4><p>{p}</p><span className="vv">{v}</span></div>
              </div>
            ))}
          </div>
        </div>

        <p className="fine" style={{ marginTop: 4 }}>
          L&rsquo;objection du jour a rejoint le pain quotidien, tout en bas de la page d&rsquo;accueil.
        </p>

        <Intercession user={user} initial={profile?.intercession_name ?? ''} />

        {day && (
          <>
            <h2 className="sect">Partager le pain du jour</h2>
            <p className="sub">Un lien, un message pret, une image pour les stories.</p>
            <ShareBar verse={day.verse_text} ref_={day.verse_ref}
                      title={day.theme_title} lede={day.theme_lede} date={day.date} />
          </>
        )}
      </main>
    </>
  );
}
