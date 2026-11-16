import Link from 'next/link';
import { supabasePublic } from '@/lib/supabase/public';
import { contentDate } from '@/lib/date';
import ResumeReading from '@/components/ResumeReading';
import { rich } from '@/lib/rich';
import { polishDeep } from '@/lib/accents';

export const revalidate = 300;
export const metadata = { title: 'Prière' };

type Demande = { demande: string; lines?: string[]; prayer?: string };

/* Les phrases du Notre Père (Matthieu 6.9-13, Segond 1910). L'indice renvoie
   à la demande priée du jour (0 à 6), -1 = pas de phrase du jour. */
const NP: Record<string, [string, number]> = {
  pere: ['Notre Père qui es aux cieux,', -1],
  nom: ['Que ton nom soit sanctifié,', 0],
  regne: ['Que ton règne vienne,', 1],
  volonte: ['Que ta volonté soit faite sur la terre comme au ciel.', 2],
  pain: ['Donne-nous aujourd’hui notre pain quotidien,', 3],
  pardon: ['Pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés,', 4],
  mal: ['Ne nous induis pas en tentation, mais délivre-nous du malin.', 5],
  gloire: ['Car c’est à toi qu’appartiennent, dans tous les siècles, le règne, la puissance et la gloire.', 6],
  amen: ['Amen.', -1]
};

/* Louange par défaut, si les prières du jour ne sont pas encore prêtes. */
const LOUANGE = [
  'Merci, Père, pour tout ce que tu as fait pour moi hier.',
  'Merci pour ta présence aujourd’hui, pour le souffle, la paix et ta Parole.',
  'Merci pour ce que tu feras demain : tes promesses ne passent pas.'
];

/* Les six moments (prières tirées du livre de Mickaël). */
type Moment = { id: string; cls: string; t: string; s: string; pri: string[]; np?: string[]; jour?: 'louange'; fin?: string };
const MOMENTS: Moment[] = [
  { id: 'inviter', cls: 'ph-seuil', t: 'Inviter l’Esprit', s: 'Se tourner vers lui',
    pri: ['Viens, Saint-Esprit. Sois là.', 'Remplis ce moment, et apprends-moi à prier.'] },
  { id: 'adorer', cls: 'ph-adoration', t: 'Adorer', s: 'Dire à Dieu qui il est',
    np: ['pere', 'nom'],
    pri: ['Tu es le Dieu vivant.', 'Tu es le rocher sur qui je peux toujours compter.'] },
  { id: 'louer', cls: 'ph-louange', t: 'Louer', s: 'Le remercier pour ce qu’il a fait',
    pri: ['Merci pour cette journée.', 'Merci de m’avoir donné de te connaître.'], jour: 'louange' },
  { id: 'confesser', cls: 'ph-confesser', t: 'Confesser', s: 'Déposer ses fautes, recevoir son pardon',
    np: ['pardon'],
    pri: ['Pardonne-moi ma colère d’hier.', 'Merci, Jésus, de me relever.'] },
  { id: 'demander', cls: 'ph-intercession', t: 'Demander', s: 'Pour moi, et pour les autres',
    np: ['pain', 'mal'],
    pri: ['Donne-moi la force pour aujourd’hui.', 'Garde-moi du mal.', 'Viens secourir ceux qui traversent l’épreuve.'] },
  { id: 'ecouter', cls: 'ph-ecouter', t: 'Écouter', s: 'Lâcher prise, et se taire devant lui',
    np: ['regne', 'volonte'],
    pri: ['Parle, Seigneur, ton serviteur écoute.'], fin: 'Puis le silence.' }
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
  const cols = 'date, theme_title, prayer_notre_pere, prayer_axes';
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
  const axes = (day?.prayer_axes ?? []) as Array<{ axis: string; lines?: string[]; prayer?: string }>;
  const louerJour = (() => {
    const a = axes.find(x => /^lou/i.test(x.axis ?? ''));
    return a ? (a.lines ?? toLines(a.prayer)) : [];
  })();
  const louange = louerJour.length ? louerJour : LOUANGE;

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

      <nav className="mo-nav" aria-label="Les six moments">
        {MOMENTS.map((m, i) => (
          <a key={m.id} href={`#${m.id}`} className={m.cls}><span className="ph-dot" />{i + 1}. {m.t}</a>
        ))}
      </nav>

      {MOMENTS.map((m, i) => (
        <section key={m.id} className={`card np-phase ${m.cls}`} id={m.id}>
          <div className="ph-head"><span className="ph-num">{i + 1}</span><div><h2>{m.t}</h2><p>{m.s}</p></div></div>
          <div className="npf"><div className="mo-pri">{m.pri.map((l, j) => <p key={j}>{l}</p>)}</div></div>
          {m.np?.map(k => <Phrase key={k} k={k} />)}
          {m.jour === 'louange' && <div className="npf"><Lignes l={louange} /></div>}
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
