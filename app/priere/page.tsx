import Link from 'next/link';
import { contentDate } from '@/lib/date';
import ResumeReading from '@/components/ResumeReading';
import RefChip from '@/components/RefChip';

export const revalidate = 300;
export const metadata = { title: 'Prière' };

/* Les phrases du Notre Père (Matthieu 6.9-13, Segond 1910), dans l'ordre. */
const NP: Record<string, string> = {
  pere: 'Notre Père qui es aux cieux !',
  nom: 'Que ton nom soit sanctifié ;',
  regne: 'Que ton règne vienne ;',
  volonte: 'Que ta volonté soit faite sur la terre comme au ciel.',
  pain: 'Donne-nous aujourd’hui notre pain quotidien ;',
  pardon: 'Pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés ;',
  mal: 'Ne nous induis pas en tentation, mais délivre-nous du malin.',
  gloire: 'Car c’est à toi qu’appartiennent, dans tous les siècles, le règne, la puissance et la gloire.',
  amen: 'Amen.'
};

/* Une proclamation : le verset (Segond 1910, domaine public) et ce que
   je proclame pour moi, à la première personne. Une par moment, qui
   change chaque jour. */
type Proc = { t: string; r: string; a: string };

type Moment = {
  id: string; cls: string; t: string; s: string; np?: string[];
  avant: string[]; apres: string[]; parole: Proc[]; fin?: string;
};

const MOMENTS: Moment[] = [
  {
    id: 'inviter', cls: 'ph-seuil', t: 'Inviter l’Esprit', s: 'Me tourner vers lui avant de parler',
    avant: [
      'Saint-Esprit, viens. Sois là.',
      'Je me tourne vers toi, et je laisse derrière moi le bruit de ma journée.',
      'Remplis ce moment de ta présence.',
      'Ouvre mes yeux, mon cœur et mon intelligence.'
    ],
    apres: [
      'Quand je ne sais pas quoi dire, prie en moi.',
      'Apprends-moi à prier, comme Jésus l’a appris à ses disciples.'
    ],
    parole: [
      { t: 'L’Esprit nous aide dans notre faiblesse, car nous ne savons pas ce qu’il nous convient de demander dans nos prières.', r: 'Rm 8.26', a: 'Je ne prie pas seul : ton Esprit prie en moi.' },
      { t: '… à combien plus forte raison le Père céleste donnera-t-il le Saint-Esprit à ceux qui le lui demandent.', r: 'Lc 11.13', a: 'Je te le demande, Père, et je le reçois.' },
      { t: 'Le consolateur, l’Esprit-Saint, que le Père enverra en mon nom, vous enseignera toutes choses, et vous rappellera tout ce que je vous ai dit.', r: 'Jn 14.26', a: 'Esprit Saint, enseigne-moi, et rappelle-moi les paroles de Jésus.' },
      { t: 'Quand le consolateur sera venu, l’Esprit de vérité, il vous conduira dans toute la vérité.', r: 'Jn 16.13', a: 'Conduis-moi dans toute la vérité.' },
      { t: 'Ouvre mes yeux, pour que je contemple les merveilles de ta loi !', r: 'Ps 119.18', a: 'Ouvre mes yeux : je veux te voir dans ta Parole.' },
      { t: 'Si nous vivons par l’Esprit, marchons aussi selon l’Esprit.', r: 'Ga 5.25', a: 'Je vis par l’Esprit : aujourd’hui, je veux marcher selon l’Esprit.' },
      { t: 'Vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins.', r: 'Ac 1.8', a: 'Je reçois ta puissance, pour être ton témoin aujourd’hui.' }
    ]
  },
  {
    id: 'adorer', cls: 'ph-adoration', t: 'Adorer', s: 'Dire à Dieu qui il est',
    np: ['pere', 'nom'],
    avant: [
      'Père, tu es le Dieu vivant, saint et fidèle.',
      'Tu es le rocher sur qui je peux toujours compter.',
      'Tu étais là avant toutes choses, et tu règnes pour toujours.'
    ],
    apres: [
      'Ton nom est au-dessus de tout nom.',
      'Je t’adore, non pour ce que tu donnes, mais pour ce que tu es.'
    ],
    parole: [
      { t: 'Tu es digne, notre Seigneur et notre Dieu, de recevoir la gloire et l’honneur et la puissance ; car tu as créé toutes choses.', r: 'Ap 4.11', a: 'Tu es digne, et je te donne la première place.' },
      { t: 'Éternel, mon rocher, ma forteresse, mon libérateur ! Mon Dieu, mon rocher, où je trouve un abri !', r: 'Ps 18.3', a: 'Tu es mon rocher et ma forteresse : en toi, je suis à l’abri.' },
      { t: 'Saint, saint, saint est l’Éternel des armées ! toute la terre est pleine de sa gloire !', r: 'Es 6.3', a: 'Avec les anges, je le proclame : tu es saint.' },
      { t: 'Venez, prosternons-nous et humilions-nous, fléchissons le genou devant l’Éternel, notre créateur !', r: 'Ps 95.6', a: 'Je fléchis le genou devant toi, mon Créateur.' },
      { t: 'Dieu est Esprit, et il faut que ceux qui l’adorent l’adorent en esprit et en vérité.', r: 'Jn 4.24', a: 'Je veux t’adorer en esprit et en vérité.' },
      { t: 'L’Éternel est grand et très digne de louange, et sa grandeur est insondable.', r: 'Ps 145.3', a: 'Ta grandeur me dépasse, et je m’y abandonne.' },
      { t: 'L’Éternel, l’Éternel, Dieu miséricordieux et compatissant, lent à la colère, riche en bonté et en fidélité.', r: 'Ex 34.6', a: 'Tu es riche en bonté et en fidélité envers moi.' }
    ]
  },
  {
    id: 'louer', cls: 'ph-louange', t: 'Louer', s: 'Le remercier pour ce qu’il a fait',
    np: ['regne', 'volonte'],
    avant: [
      'Merci pour cette journée, et pour ce nouveau matin.',
      'Merci pour la santé, pour un toit, pour les visages que j’aime.',
      'Merci pour la grâce de respirer, de voir le soleil se lever.'
    ],
    apres: [
      'Merci de m’avoir donné de te connaître.',
      'Merci pour Yéchoua (Jésus), mon Sauveur, et pour ta fidélité qui ne s’arrête jamais.'
    ],
    parole: [
      { t: 'Les bontés de l’Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin. Oh ! que ta fidélité est grande !', r: 'Lm 3.22-23', a: 'Ce matin encore, ta bonté est nouvelle pour moi.' },
      { t: 'Mon âme, bénis l’Éternel, et n’oublie aucun de ses bienfaits !', r: 'Ps 103.2', a: 'Je n’oublie aucun de tes bienfaits.' },
      { t: 'C’est ici la journée que l’Éternel a faite : qu’elle soit pour nous un sujet d’allégresse et de joie !', r: 'Ps 118.24', a: 'Cette journée vient de toi : je choisis de m’en réjouir.' },
      { t: 'Louez l’Éternel, car il est bon, car sa miséricorde dure à toujours !', r: 'Ps 136.1', a: 'Tu es bon, et ta miséricorde dure pour moi à toujours.' },
      { t: 'Rendez grâces en toutes choses, car c’est à votre égard la volonté de Dieu en Jésus-Christ.', r: '1 Th 5.18', a: 'Je te rends grâces en toutes choses, même dans ce que je ne comprends pas.' },
      { t: 'Toute grâce excellente et tout don parfait descendent d’en haut, du Père des lumières.', r: 'Jc 1.17', a: 'Tout ce que j’ai de bon vient de toi.' },
      { t: 'Je bénirai l’Éternel en tout temps ; sa louange sera toujours dans ma bouche.', r: 'Ps 34.2', a: 'Ta louange sera toujours dans ma bouche.' }
    ]
  },
  {
    id: 'demander', cls: 'ph-intercession', t: 'Demander', s: 'Pour moi, et pour les autres',
    np: ['pain'],
    avant: [
      'Père, je te confie mon pain de ce jour : mon travail, mon foyer, la santé des miens.',
      'Donne-moi aussi ce dont mon âme a besoin : la force pour aujourd’hui, la patience qui me manque, la paix quand tout s’agite.'
    ],
    apres: [
      'Je te présente ceux que j’aime, ceux qui souffrent, et même ceux qui me font du tort.',
      'Viens secourir ceux qui traversent l’épreuve.'
    ],
    parole: [
      { t: 'Mon Dieu pourvoira à tous vos besoins selon sa richesse, avec gloire, en Jésus-Christ.', r: 'Ph 4.19', a: 'Tu pourvois à tous mes besoins : je te fais confiance.' },
      { t: 'L’homme ne vivra pas de pain seulement, mais de toute parole qui sort de la bouche de Dieu.', r: 'Mt 4.4', a: 'Nourris mon corps, et nourris mon âme de ta Parole.' },
      { t: 'Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.', r: 'Ph 4.6', a: 'Je ne m’inquiète de rien : je te confie tout, avec reconnaissance.' },
      { t: 'Demandez, et l’on vous donnera ; cherchez, et vous trouverez ; frappez, et l’on vous ouvrira.', r: 'Mt 7.7', a: 'Je demande, je cherche, je frappe : tu m’ouvriras.' },
      { t: 'L’Éternel est mon berger : je ne manquerai de rien.', r: 'Ps 23.1', a: 'Tu es mon berger : je ne manquerai de rien.' },
      { t: 'Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.', r: '1 P 5.7', a: 'Je décharge sur toi tous mes soucis, car tu prends soin de moi.' },
      { t: 'Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus.', r: 'Mt 6.33', a: 'Je cherche d’abord ton royaume ; le reste, je te le confie.' }
    ]
  },
  {
    id: 'confesser', cls: 'ph-confesser', t: 'Confesser', s: 'Déposer mes fautes, recevoir son pardon',
    np: ['pardon', 'mal'],
    avant: [
      'Seigneur, je viens à toi tel que je suis.',
      'Pardonne-moi ce qui n’a pas été juste : mes paroles, mes pensées, mes silences.',
      'Pardonne-moi ma colère d’hier.',
      'Et moi aussi, je pardonne à ceux qui m’ont blessé : je dépose ma rancune devant toi.'
    ],
    apres: [
      'Garde-moi de la tentation, délivre-moi du malin.',
      'Merci, Jésus, de me relever et de me rendre léger.'
    ],
    parole: [
      { t: 'Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.', r: '1 Jn 1.9', a: 'Je confesse mes fautes, et je reçois ton pardon.' },
      { t: 'Autant l’orient est éloigné de l’occident, autant il éloigne de nous nos transgressions.', r: 'Ps 103.12', a: 'Mes fautes sont loin de moi : tu les as éloignées.' },
      { t: 'Ô Dieu ! crée en moi un cœur pur, renouvelle en moi un esprit bien disposé.', r: 'Ps 51.12', a: 'Crée en moi un cœur pur.' },
      { t: 'Il n’y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ.', r: 'Rm 8.1', a: 'En Jésus, je ne suis plus condamné.' },
      { t: 'Dieu, qui est fidèle, ne permettra pas que vous soyez tentés au delà de vos forces ; mais avec la tentation il préparera aussi le moyen d’en sortir.', r: '1 Co 10.13', a: 'Tu es fidèle : dans la tentation, tu me donnes une issue.' },
      { t: 'Si vos péchés sont comme le cramoisi, ils deviendront blancs comme la neige.', r: 'Es 1.18', a: 'Tu me rends blanc comme la neige.' },
      { t: 'Le Seigneur est fidèle, il vous affermira et vous préservera du malin.', r: '2 Th 3.3', a: 'Tu m’affermis, et tu me gardes du malin.' }
    ]
  },
  {
    id: 'ecouter', cls: 'ph-ecouter', t: 'Écouter', s: 'Lâcher prise, et me taire devant lui',
    avant: [
      'Seigneur, je lâche le contrôle.',
      'Je te remets mes projets, mes peurs et mes attentes.'
    ],
    apres: [
      'Je me tais devant toi.',
      'Parle, Seigneur, ton serviteur écoute.'
    ],
    parole: [
      { t: 'Arrêtez, et sachez que je suis Dieu.', r: 'Ps 46.11', a: 'Je m’arrête, et je sais que tu es Dieu.' },
      { t: 'Mes brebis entendent ma voix ; je les connais, et elles me suivent.', r: 'Jn 10.27', a: 'Je suis ta brebis : j’entends ta voix, et je te suis.' },
      { t: 'C’est dans la tranquillité et le repos que sera votre salut, c’est dans le calme et la confiance que sera votre force.', r: 'Es 30.15', a: 'Dans le calme et la confiance, je trouve ma force.' },
      { t: 'Oui, c’est en Dieu que mon âme se confie ; de lui vient mon salut.', r: 'Ps 62.2', a: 'Mon âme se confie en toi seul.' },
      { t: 'Père, si tu voulais éloigner de moi cette coupe ! Toutefois, que ma volonté ne se fasse pas, mais la tienne.', r: 'Lc 22.42', a: 'Comme Jésus, je te dis : que ta volonté se fasse, et non la mienne.' },
      { t: 'Garde le silence devant l’Éternel, et espère en lui.', r: 'Ps 37.7', a: 'Je garde le silence devant toi, et j’espère en toi.' }
    ],
    fin: 'Puis le silence.'
  }
];

/* Numéro du jour : la proclamation change chaque jour, et pas la même
   « place » dans chaque liste pour varier les combinaisons. */
const dayNumber = (iso: string) => Math.floor(Date.parse(`${iso}T12:00:00Z`) / 86400000);

export default function Priere_() {
  const d = dayNumber(contentDate());

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Prière</div>
        <h1>Prière</h1>
        <p className="lede">Six moments, inspirés du Notre Père.</p>
      </header>

      <ResumeReading />

      {MOMENTS.map((m, i) => {
        const p = m.parole[(d + i * 3) % m.parole.length];
        return (
          <section key={m.id} className={`card np-phase ${m.cls}`} id={m.id}>
            <div className="ph-head"><span className="ph-num">{i + 1}</span><div><h2>{m.t}</h2><p>{m.s}</p></div></div>
            {m.np?.map(k => <div className="npf" key={k}><h3>{NP[k]}</h3></div>)}
            <div className="npf">
              <div className="mo-pri">
                {m.avant.map((l, j) => <p key={`a${j}`}>{l}</p>)}
                <div className="mo-proc">
                  <p className="mo-verset">Ta Parole dit&nbsp;: «&nbsp;{p.t}&nbsp;» <RefChip r={p.r} /></p>
                  <p className="mo-ancre">{p.a}</p>
                </div>
                {m.apres.map((l, j) => <p key={`b${j}`}>{l}</p>)}
              </div>
            </div>
            {m.fin && <div className="npf"><p className="mo-silence">{m.fin}</p></div>}
          </section>
        );
      })}

      <section className="card np-phase ph-adoration np-end">
        <div className="ph-head"><span className="ph-num">✦</span><div><h2>Finir en adorant</h2></div></div>
        <div className="npf"><h3>{NP.gloire}</h3></div>
        <div className="npf"><h3>{NP.amen}</h3></div>
      </section>

      <Link href="/pain" className="to-pain">
        <span className="tp-k">Le pain quotidien</span>
        <span className="tp-t">Lire la méditation du jour ›</span>
      </Link>
    </main>
  );
}
