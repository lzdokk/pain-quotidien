import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import LearnTabs from '@/components/LearnTabs';

export const revalidate = 86400;
export const metadata = { title: 'Les cinq fondements' };

/**
 * Les cinq « solae » de la Réforme : les cinq priorités qui résument
 * la foi protestante. Chacune avec sa formule latine, sa description
 * courte, une petite parabole pour la faire sentir, et un verset d'appui.
 * Contenu statique, à se remémorer chaque jour.
 */
type Sola = {
  n: number; latin: string; fr: string; role: string;
  desc: string; parable: string; verse: string; ref: string;
};

const SOLAE: Sola[] = [
  {
    n: 1,
    latin: 'Sola Scriptura',
    fr: 'L’Écriture seule',
    role: 'L’autorité',
    desc: "La Bible est l’autorité dernière pour la foi et la vie, au-dessus des traditions, des conciles et des opinions des hommes. Ceux-ci peuvent éclairer, jamais régner : c’est l’Écriture qui juge l’Église, et non l’inverse.",
    parable: "Un capitaine tient sa route de nuit grâce à l’étoile fixe, pas aux lumières des autres bateaux. Les autres bateaux bougent, l’étoile non. Qui règle son cap sur le navire d’à côté finit sur les mêmes récifs que lui.",
    verse: "Toute Écriture est inspirée de Dieu, et utile pour enseigner, pour convaincre, pour corriger, pour instruire dans la justice.",
    ref: '2 Timothée 3.16'
  },
  {
    n: 2,
    latin: 'Solus Christus',
    fr: 'Christ seul',
    role: 'Le médiateur',
    desc: "Le salut ne vient que par Christ, unique médiateur entre Dieu et les hommes. Nul saint, nul prêtre, nul mérite ne s’ajoute à son œuvre : sa croix suffit, une fois pour toutes.",
    parable: "Au-dessus d’un gouffre, un seul pont tient. On peut l’admirer, le photographier, en discuter des heures : on ne passe de l’autre côté qu’en marchant dessus. Chercher un semi-pont à côté, c’est tomber.",
    verse: "Il y a un seul Dieu, et aussi un seul médiateur entre Dieu et les hommes, Jésus-Christ homme.",
    ref: '1 Timothée 2.5'
  },
  {
    n: 3,
    latin: 'Sola Gratia',
    fr: 'La grâce seule',
    role: 'Le moyen',
    desc: "Le salut est un don gratuit de Dieu, non une récompense. On ne l’achète pas, on ne le gagne pas : Dieu sauve par pure faveur, avant que nous ayons rien fait pour le mériter.",
    parable: "Un condamné insolvable reçoit sa dette payée par un inconnu. Il peut la refuser par orgueil, il ne peut pas la rembourser. Sortir libre en prétendant avoir payé soi-même, c’est se mentir à la porte de la prison.",
    verse: "C’est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c’est le don de Dieu.",
    ref: 'Éphésiens 2.8'
  },
  {
    n: 4,
    latin: 'Sola Fide',
    fr: 'La foi seule',
    role: 'L’instrument',
    desc: "On reçoit cette grâce par la foi seule, non par les œuvres. La foi n’est pas un mérite de plus : c’est la main vide qui saisit ce que Christ a déjà accompli. Les œuvres suivent la foi, elles ne la fabriquent pas.",
    parable: "Le malade ne se guérit pas en fabriquant le remède, mais en le buvant. Sa confiance ne crée pas la médecine, elle la reçoit. Admirer le flacon sans l’ouvrir n’a jamais sauvé personne.",
    verse: "Nous pensons que l’homme est justifié par la foi, sans les œuvres de la loi.",
    ref: 'Romains 3.28'
  },
  {
    n: 5,
    latin: 'Soli Deo Gloria',
    fr: 'À Dieu seul la gloire',
    role: 'Le but',
    desc: "Tout existe pour la gloire de Dieu seul, et non celle de l’homme. Puisque le salut est entièrement son œuvre, l’honneur lui revient entièrement. C’est la conclusion des quatre autres : rien pour nous, tout pour Lui.",
    parable: "Après le concert, on n’applaudit pas l’archet ni la partition, mais celui qui a joué. L’instrument a bien servi ; il serait absurde qu’il réclame la lumière. Toute la beauté remonte au musicien.",
    verse: "C’est de lui, par lui et pour lui que sont toutes choses. À lui la gloire dans tous les siècles !",
    ref: 'Romains 11.36'
  }
];

export default async function Fondements() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <LearnTabs />
        <header className="hero">
          <div className="eyebrow">Apprendre · Fondements</div>
          <h1>Les cinq<br />fondements</h1>
          <p className="lede">
            Cinq formules latines nées de la Réforme, cinq priorités qui résument
            la foi protestante. À se remettre en mémoire chaque jour : elles tiennent
            ensemble comme une seule chaîne. L’Écriture seule le dit, Christ seul le fait,
            la grâce seule le donne, la foi seule le reçoit, et à Dieu seul la gloire.
          </p>
        </header>

        <div className="sola-list">
          {SOLAE.map(s => (
            <article className="card pad sola" key={s.n}>
              <div className="sola-top">
                <span className="sola-n">{s.n}</span>
                <div>
                  <div className="sola-latin">{s.latin}</div>
                  <div className="sola-fr">{s.fr} · <span className="sola-role">{s.role}</span></div>
                </div>
              </div>
              <p className="sola-desc">{s.desc}</p>
              <div className="sola-parable">
                <span className="kicker">Pour le sentir</span>
                <p>{s.parable}</p>
              </div>
              <blockquote className="sola-verse">
                {s.verse}
                <cite>{s.ref}</cite>
              </blockquote>
            </article>
          ))}
        </div>

        <div className="card pad" style={{ marginTop: 18 }}>
          <span className="kicker">En une phrase</span>
          <p style={{ marginTop: 8, fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.6 }}>
            Dieu seul sauve, par Christ seul, offert par grâce seule, reçu par la foi seule,
            selon l’Écriture seule, pour la gloire de Dieu seul.
          </p>
        </div>
      </main>
    </>
  );
}
