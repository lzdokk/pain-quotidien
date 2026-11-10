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
  const cols = 'date, theme_title, prayer_notre_pere';
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
  const duJour = np.some(l => l.length > 0);

  return (
    <>
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Prière</div>
          <h1>Notre Père</h1>
          <p className="lede">La prière que Yéchoua (Jésus) nous a donnée, phrase par phrase, avec des mots simples pour aujourd’hui.</p>
        </header>

        <ResumeReading />

        <div className="card np-full np-apple">
          {NOTRE_PERE.map(([phrase, k], i) => (
            <div className={`npf${k < 0 ? ' edge' : ''}`} key={i}>
              <h3>{phrase}</h3>
              {k >= 0 && np[k]?.length ? <Lignes l={np[k]} /> : null}
            </div>
          ))}
        </div>
        {!duJour && (
          <p className="ix-note">Les phrases du jour se préparent avec la lecture du jour.</p>
        )}
        <p className="np-ref">Matthieu 6.9-13</p>

        <Link href="/pain" className="to-pain">
          <span className="tp-k">Le pain quotidien</span>
          <span className="tp-t">Lire la méditation du jour ›</span>
        </Link>
      </main>
    </>
  );
}
