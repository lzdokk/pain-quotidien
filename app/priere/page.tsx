import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import PageTabs from '@/components/PageTabs';
import { contentDate } from '@/lib/date';
import ResumeReading from '@/components/ResumeReading';
import { rich } from '@/lib/rich';
import { fixAccentsDeep } from '@/lib/accents';

export const dynamic = 'force-dynamic'; // toujours le jour courant, jamais du cache
export const metadata = { title: 'Prière' };

type Axe = {
  axis: string; lines?: string[]; prayer?: string;
  word?: string; word_lang?: string; word_meaning?: string;
};
type Demande = { demande: string; lines?: string[]; prayer?: string };

/* Les cinq etapes, toujours dans cet ordre. */
const ETAPES = [
  { nom: 'Adorer', aide: 'Dire à Dieu qui il est.', ex: 'Tu es bon, tu es fidèle…' },
  { nom: 'Louer', aide: 'Le remercier pour ce qu’il a fait.', ex: 'Merci pour…' },
  { nom: 'Confesser', aide: 'Reconnaître ce qui n’a pas été juste, et recevoir son pardon.' },
  { nom: 'Demander', aide: 'Lui confier mes besoins et ceux des autres.' },
  { nom: 'Écouter', aide: 'Rester un moment en silence devant lui.' }
] as const;

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

/* Construit les cinq etapes, format nouveau ou ancien (repli). */
function etapesDuJour(day: any): Record<string, string[]> {
  const axes = (day?.prayer_axes ?? []) as Axe[];
  const out: Record<string, string[]> = {};
  if (axes.some(a => a.axis === 'Adorer')) {
    for (const a of axes) out[a.axis] = a.lines ?? toLines(a.prayer);
    return out;
  }
  // Ancien format (Adoration / Louange / Intercession + confession + supplication)
  const find = (n: string) => axes.find(a => a.axis?.toLowerCase() === n);
  const clean = (a?: Axe) => {
    if (!a) return [];
    const t = a.prayer ?? '';
    return toLines(a.word ? t.replace(a.word, `**${a.word}**`) : t);
  };
  out['Adorer'] = clean(find('adoration'));
  out['Louer'] = clean(find('louange'));
  out['Confesser'] = toLines(day?.prayer_confession);
  out['Demander'] = [...toLines(day?.prayer_supplication), ...clean(find('intercession'))];
  out['Écouter'] = ['Parle, Seigneur, je t’écoute.'];
  return out;
}

function Lignes({ l }: { l: string[] }) {
  if (!l.length) return null;
  return (
    <div className="pl-lines">
      {l.map((x, i) => <p key={i} dangerouslySetInnerHTML={{ __html: rich(x) }} />)}
    </div>
  );
}

export default async function Priere_() {
  const sb = await supabaseServer();
  const today = contentDate();
  const cols = 'date, theme_title, prayer_axes, prayer_notre_pere, prayer_confession, prayer_supplication, spirit_invitation';
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
  if (day) day = fixAccentsDeep(day);
  const { data: { user } } = await sb.auth.getUser();

  const duJour = !!day && ((day.prayer_axes ?? []) as Axe[]).length > 0;
  const etapes = duJour ? etapesDuJour(day) : {};
  const esprit = toLines(day?.spirit_invitation);
  const np = ((day?.prayer_notre_pere ?? []) as Demande[])
    .map(d => d.lines ?? toLines(d.prayer));

  const prier = (
    <>
      <div className="card pray-steps">
        {ETAPES.map((e, i) => (
          <section className="pstep" key={e.nom}>
            <div className="pstep-h">
              <span className="pstep-n">{i + 1}</span>
              <div>
                <h3>{e.nom}</h3>
                <p className="pstep-aide">
                  {e.aide}{'ex' in e && e.ex ? <> <i>« {e.ex} »</i></> : null}
                </p>
              </div>
            </div>
            {e.nom === 'Écouter' ? (
              <>
                <Lignes l={etapes['Écouter'] ?? []} />
                <div className="breathe sm"><div className="orb"><span>Silence</span></div></div>
              </>
            ) : <Lignes l={etapes[e.nom] ?? []} />}
          </section>
        ))}
      </div>

      {esprit.length > 0 && (
        <div className="prayer spirit">
          <span className="kicker">Viens, Saint-Esprit</span>
          {esprit.map((x, i) => <p key={i} dangerouslySetInnerHTML={{ __html: rich(x) }} />)}
        </div>
      )}
    </>
  );

  const notrePere = (
    <div className="card np-full">
      {NOTRE_PERE.map(([phrase, k], i) => (
        <div className={`npf${k < 0 ? ' edge' : ''}`} key={i}>
          <h3>{phrase}</h3>
          {k >= 0 && np[k]?.length ? <Lignes l={np[k]} /> : null}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Prière</div>
          <h1>Parler<br />avec Dieu</h1>
          <p className="lede">Des mots simples, pour être avec lui.</p>
        </header>

        <ResumeReading />

        {!duJour ? (
          <div className="card pad">
            <span className="kicker">La prière du jour</span>
            <p className="empty" style={{ marginTop: 8 }}>
              Elle se prépare avec la lecture du jour. Revenez dans un instant.
            </p>
          </div>
        ) : (
          <PageTabs id="priere" tabs={[
            { key: 'prier', label: 'Prier', content: prier },
            { key: 'notre-pere', label: 'Notre Père', content: notrePere }
          ]} />
        )}

        <Link href="/pain" className="to-pain">
          <span className="tp-k">Le pain quotidien</span>
          <span className="tp-t">Lire la méditation du jour ›</span>
        </Link>
      </main>
    </>
  );
}
