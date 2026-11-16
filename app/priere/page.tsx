import Link from 'next/link';
import { supabasePublic } from '@/lib/supabase/public';
import { contentDate } from '@/lib/date';
import ResumeReading from '@/components/ResumeReading';
import RefChip from '@/components/RefChip';
import { rich } from '@/lib/rich';
import { polishDeep } from '@/lib/accents';

export const revalidate = 300;
export const metadata = { title: 'Prière' };

type Demande = { demande: string; lines?: string[]; prayer?: string };

/* Les phrases du Notre Père (Matthieu 6.9-13, Segond 1910). L'indice renvoie
   à la demande priée du jour (0 à 6), -1 = pas de phrase du jour. */
const NP: Record<string, [string, number]> = {
  pere: ['Notre Père qui es aux cieux !', -1],
  nom: ['Que ton nom soit sanctifié ;', 0],
  regne: ['Que ton règne vienne ;', 1],
  volonte: ['Que ta volonté soit faite sur la terre comme au ciel.', 2],
  pain: ['Donne-nous aujourd’hui notre pain quotidien ;', 3],
  pardon: ['Pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés ;', 4],
  mal: ['Ne nous induis pas en tentation, mais délivre-nous du malin.', 5],
  gloire: ['Car c’est à toi qu’appartiennent, dans tous les siècles, le règne, la puissance et la gloire.', 6],
  amen: ['Amen.', -1]
};

/* Versets proclamés (Segond 1910, domaine public). */
type Verset = { t: string; r: string };

type Moment = { id: string; cls: string; t: string; s: string; np?: string[]; pri: string[]; parole: Verset[]; fin?: string };
const MOMENTS: Moment[] = [
  {
    id: 'inviter', cls: 'ph-seuil', t: 'Inviter l’Esprit', s: 'Se tourner vers lui avant de parler',
    pri: [
      'Saint-Esprit, viens. Sois là.',
      'Je me tourne vers toi, et je laisse derrière moi le bruit de ma journée.',
      'Remplis ce moment de ta présence.',
      'Ouvre mes yeux, mon cœur et mon intelligence.',
      'Quand je ne sais pas quoi dire, prie en moi.',
      'Apprends-moi à prier, comme Jésus l’a appris à ses disciples.'
    ],
    parole: [
      { t: 'L’Esprit nous aide dans notre faiblesse, car nous ne savons pas ce qu’il nous convient de demander dans nos prières. Mais l’Esprit lui-même intercède par des soupirs inexprimables.', r: 'Rm 8.26' },
      { t: 'Le Père céleste donnera le Saint-Esprit à ceux qui le lui demandent.', r: 'Lc 11.13' }
    ]
  },
  {
    id: 'adorer', cls: 'ph-adoration', t: 'Adorer', s: 'Dire à Dieu qui il est',
    np: ['pere', 'nom'],
    pri: [
      'Père, tu es le Dieu vivant, saint et fidèle.',
      'Tu es le rocher sur qui je peux toujours compter.',
      'Tu étais là avant toutes choses, et tu règnes pour toujours.',
      'Ton nom est au-dessus de tout nom.',
      'Je t’adore, non pour ce que tu donnes, mais pour ce que tu es.'
    ],
    parole: [
      { t: 'Tu es digne, notre Seigneur et notre Dieu, de recevoir la gloire et l’honneur et la puissance ; car tu as créé toutes choses.', r: 'Ap 4.11' }
    ]
  },
  {
    id: 'louer', cls: 'ph-louange', t: 'Louer', s: 'Le remercier pour ce qu’il a fait',
    np: ['regne', 'volonte'],
    pri: [
      'Merci pour cette journée, et pour ce nouveau matin.',
      'Merci pour la santé, pour un toit, pour les visages que j’aime.',
      'Merci pour la grâce de respirer, de voir le soleil se lever.',
      'Merci de m’avoir donné de te connaître.',
      'Merci pour Yéchoua (Jésus), mon Sauveur, et pour ta fidélité qui ne s’arrête jamais.'
    ],
    parole: [
      { t: 'Les bontés de l’Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin. Oh ! que ta fidélité est grande !', r: 'Lm 3.22-23' },
      { t: 'Mon âme, bénis l’Éternel, et n’oublie aucun de ses bienfaits !', r: 'Ps 103.2' }
    ]
  },
  {
    id: 'confesser', cls: 'ph-confesser', t: 'Confesser', s: 'Déposer ses fautes, recevoir son pardon',
    np: ['pardon'],
    pri: [
      'Seigneur, je viens à toi tel que je suis.',
      'Pardonne-moi ce qui n’a pas été juste : mes paroles, mes pensées, mes silences.',
      'Pardonne-moi ma colère d’hier.',
      'Et moi aussi, je pardonne à ceux qui m’ont blessé : je dépose ma rancune devant toi.',
      'Merci, Jésus, de me relever et de me rendre léger.'
    ],
    parole: [
      { t: 'Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner, et pour nous purifier de toute iniquité.', r: '1 Jn 1.9' },
      { t: 'Autant l’orient est éloigné de l’occident, autant il éloigne de nous nos transgressions.', r: 'Ps 103.12' }
    ]
  },
  {
    id: 'demander', cls: 'ph-intercession', t: 'Demander', s: 'Pour moi, et pour les autres',
    np: ['pain', 'mal'],
    pri: [
      'Père, je te confie mon pain de ce jour : mon travail, mon foyer, la santé des miens.',
      'Donne-moi aussi ce dont mon âme a besoin : la force pour aujourd’hui, la patience qui me manque, la paix quand tout s’agite.',
      'Garde-moi du mal et de la tentation.',
      'Je te présente ceux que j’aime, ceux qui souffrent, et même ceux qui me font du tort.',
      'Viens secourir ceux qui traversent l’épreuve.'
    ],
    parole: [
      { t: 'Mon Dieu pourvoira à tous vos besoins selon sa richesse, avec gloire, en Jésus-Christ.', r: 'Ph 4.19' },
      { t: 'L’homme ne vivra pas de pain seulement, mais de toute parole qui sort de la bouche de Dieu.', r: 'Mt 4.4' }
    ]
  },
  {
    id: 'ecouter', cls: 'ph-ecouter', t: 'Écouter', s: 'Lâcher prise, et se taire devant lui',
    pri: [
      'Seigneur, je lâche le contrôle.',
      'Que ta volonté soit faite, et non la mienne.',
      'Je me tais devant toi.',
      'Parle, Seigneur, ton serviteur écoute.'
    ],
    parole: [
      { t: 'Arrêtez, et sachez que je suis Dieu.', r: 'Ps 46.11' },
      { t: 'Mes brebis entendent ma voix ; je les connais, et elles me suivent.', r: 'Jn 10.27' }
    ],
    fin: 'Puis le silence.'
  }
];

/* Découpe un texte en lignes courtes (une phrase par ligne). */
const toLines = (t?: string | null): string[] =>
  (t ?? '')
    .split(/\n+|(?<=[.!?…])\s+(?=[A-ZÀÂÉÈÊÎÔÛÇ«])/)
    .map(s => s.trim()).filter(Boolean);

function Lignes({ l }: { l: string[] }) {
  if (!l.length) return null;
  return (
    <div className="pl-lines">
      {l.map((x, i) => <p key={i} dangerouslySetInnerHTML={{ __html: rich(x) }} />)}
    </div>
  );
}

export default async function Priere_() {
  const sb = await supabasePublic();
  const today = contentDate();
  const cols = 'date, theme_title, prayer_notre_pere';
  let { data: day } = await sb.from('daily_bread')
    .select(cols).eq('date', today).eq('published', true).maybeSingle();
  if (!day) {
    // Repli sur la dernière prière publiée plutôt qu'une page vide.
    const { data: last } = await sb.from('daily_bread')
      .select(cols).eq('published', true).lte('date', today)
      .order('date', { ascending: false }).limit(1).maybeSingle();
    day = last ?? null;
  }
  // Les journées déjà écrites sans accents sont réparées à l'affichage.
  if (day) day = polishDeep(day);

  const np = ((day?.prayer_notre_pere ?? []) as Demande[])
    .map(d => d.lines ?? toLines(d.prayer));

  // Une phrase du Notre Père et la prière du jour qui l'accompagne.
  const Phrase = ({ k }: { k: string }) => {
    const [phrase, i] = NP[k];
    return (
      <div className="npf">
        <h3>{phrase}</h3>
        {i >= 0 && np[i]?.length ? <Lignes l={np[i]} /> : null}
      </div>
    );
  };

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Prière</div>
        <h1>Prière</h1>
        <p className="lede">Six moments, inspirés du Notre Père.</p>
      </header>

      <ResumeReading />

      {MOMENTS.map((m, i) => (
        <section key={m.id} className={`card np-phase ${m.cls}`} id={m.id}>
          <div className="ph-head"><span className="ph-num">{i + 1}</span><div><h2>{m.t}</h2><p>{m.s}</p></div></div>
          {m.np?.map(k => <Phrase key={k} k={k} />)}
          <div className="npf">
            <div className="mo-pri">{m.pri.map((l, j) => <p key={j}>{l}</p>)}</div>
          </div>
          <div className="npf mo-parole">
            <span className="mo-k">Je proclame ta Parole</span>
            {m.parole.map(v => (
              <blockquote key={v.r}>
                <p>«&nbsp;{v.t}&nbsp;»</p>
                <RefChip r={v.r} />
              </blockquote>
            ))}
          </div>
          {m.fin && <div className="npf"><p className="mo-silence">{m.fin}</p></div>}
        </section>
      ))}

      <section className="card np-phase ph-adoration np-end">
        <div className="ph-head"><span className="ph-num">✦</span><div><h2>Finir en adorant</h2></div></div>
        <Phrase k="gloire" /><Phrase k="amen" />
      </section>

      <Link href="/pain" className="to-pain">
        <span className="tp-k">Le pain quotidien</span>
        <span className="tp-t">Lire la méditation du jour ›</span>
      </Link>
    </main>
  );
}
