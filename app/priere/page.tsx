import Link from 'next/link';
import { supabasePublic } from '@/lib/supabase/public';
import { contentDate } from '@/lib/date';
import ResumeReading from '@/components/ResumeReading';
import { rich } from '@/lib/rich';
import { polishDeep } from '@/lib/accents';

export const revalidate = 300;
export const metadata = { title: 'Prière' };

type Demande = { demande: string; lines?: string[]; prayer?: string };

/* Le Notre Pere complet (Matthieu 6.9-13), phrase par phrase. L'indice
   renvoie a la demande priee du jour (0 a 6), -1 = pas de phrase du jour. */
const NOTRE_PERE: Array<[string, number]> = [
  ['Notre Père qui es aux cieux,', -1],
  ['Que ton nom soit sanctifié,', 0],
  ['Que ton règne vienne,', 1],
  ['Que ta volonté soit faite sur la terre comme au ciel.', 2],
  ['Donne-nous aujourd’hui notre pain quotidien,', 3],
  ['Pardonne-nous nos offenses, comme nous aussi nous pardonnons à ceux qui nous ont offensés,', 4],
  ['Ne nous induis pas en tentation, mais délivre-nous du malin.', 5],
  ['Car c’est à toi qu’appartiennent, dans tous les siècles, le règne, la puissance et la gloire.', 6],
  ['Amen.', -1]
];

/* Louange par défaut, si les prières du jour ne sont pas encore prêtes. */
const LOUANGE = [
  'Merci, Père, pour tout ce que tu as fait pour moi hier.',
  'Merci pour ta présence aujourd’hui, pour le souffle, la paix et ta Parole.',
  'Merci pour ce que tu feras demain : tes promesses ne passent pas.',
  'Merci pour Yéchoua (Jésus), mon Sauveur, et pour le Saint-Esprit qui m’accompagne.'
];

/* Decoupe un texte en lignes courtes (une phrase par ligne). */
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
    // Repli sur la derniere priere publiee plutot qu'une page vide.
    const { data: last } = await sb.from('daily_bread')
      .select(cols).eq('published', true).lte('date', today)
      .order('date', { ascending: false }).limit(1).maybeSingle();
    day = last ?? null;
  }
  // Les journees deja ecrites sans accents sont reparees a l'affichage.
  if (day) day = polishDeep(day);
  const user: any = null; // lu dans le navigateur (useUser)

  const np = ((day?.prayer_notre_pere ?? []) as Demande[])
    .map(d => d.lines ?? toLines(d.prayer));
  // Louange du jour (étape « Louer » des prières du jour), sinon des phrases simples.
  const axes = (day?.prayer_axes ?? []) as Array<{ axis: string; lines?: string[]; prayer?: string }>;
  const louerJour = (() => {
    const a = axes.find(x => /^lou/i.test(x.axis ?? ''));
    return a ? (a.lines ?? toLines(a.prayer)) : [];
  })();
  const louange = louerJour.length ? louerJour : LOUANGE;
  const duJour = np.some(l => l.length > 0);

  // Une phrase du Notre Père et ses mots du jour.
  const Phrase = ({ k }: { k: number }) => {
    const [phrase, i] = NOTRE_PERE[k];
    return (
      <div className="npf">
        <h3>{phrase}</h3>
        {i >= 0 && np[i]?.length ? <Lignes l={np[i]} /> : null}
      </div>
    );
  };

  return (
    <>
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Prière</div>
          <h1>Notre Père</h1>
          <p className="lede">Le modèle que Yéchoua (Jésus) nous a donné, prié en trois temps.</p>
        </header>

        <ResumeReading />

        {/* Les trois temps de la prière, et la part de chacun */}
        <div className="card pad pr-guide">
          <span className="kicker">Trois temps pour prier</span>
          <div className="pr-bar" aria-hidden="true">
            <i className="ph-louange" style={{ width: '43%' }} />
            <i className="ph-adoration" style={{ width: '44%' }} />
            <i className="ph-intercession" style={{ width: '13%' }} />
          </div>
          <ul className="pr-legend">
            <li><span className="ph-dot ph-louange" /><b>Louange</b> remercier Dieu pour ce qu’il a fait, fait et fera</li>
            <li><span className="ph-dot ph-adoration" /><b>Adoration</b> le glorifier pour ce qu’il est</li>
            <li><span className="ph-dot ph-intercession" /><b>Intercession</b> lui présenter nos besoins et ceux des autres</li>
          </ul>
          <p className="fine">Louange et adoration prennent presque tout le temps : sur une heure, environ 52 minutes, et 8 minutes pour l’intercession.</p>
        </div>

        <section className="card np-phase ph-louange">
          <div className="ph-head"><span className="ph-num">1</span><div><h2>Louange</h2><p>Merci pour ce que tu as fait, ce que tu fais, ce que tu feras.</p></div></div>
          <div className="npf"><Lignes l={louange} /></div>
        </section>

        <section className="card np-phase ph-adoration">
          <div className="ph-head"><span className="ph-num">2</span><div><h2>Adoration</h2><p>Tu es mon Père, tu es saint, tu règnes.</p></div></div>
          <Phrase k={0} /><Phrase k={1} /><Phrase k={2} /><Phrase k={3} />
        </section>

        <section className="card np-phase ph-intercession">
          <div className="ph-head"><span className="ph-num">3</span><div><h2>Intercession</h2><p>Pour moi, les miens, l’Église et ceux que Dieu met sur mon cœur.</p></div></div>
          <Phrase k={4} /><Phrase k={5} /><Phrase k={6} />
        </section>

        <section className="card np-phase ph-adoration np-end">
          <div className="ph-head"><span className="ph-num">✦</span><div><h2>Finir en adorant</h2></div></div>
          <Phrase k={7} /><Phrase k={8} />
        </section>

        {!duJour && (
          <p className="ix-note">Les mots du jour se préparent avec la lecture du jour.</p>
        )}
        <p className="np-ref">Matthieu 6.9-13 · trois temps d’après les enseignements de <a href="https://theonoptie.org/" target="_blank" rel="noreferrer">Theonoptie</a></p>

        <Link href="/pain" className="to-pain">
          <span className="tp-k">Le pain quotidien</span>
          <span className="tp-t">Lire la méditation du jour ›</span>
        </Link>
      </main>
    </>
  );
}
