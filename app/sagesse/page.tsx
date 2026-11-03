import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import VerseActions from '@/components/VerseActions';
import { contentDate } from '@/lib/date';
import { rich } from '@/lib/rich';
import { polishDeep } from '@/lib/accents';

export const dynamic = 'force-dynamic'; // toujours le chapitre du jour
export const metadata = { title: 'Sagesse du jour · Proverbes' };

// Si la fiche du chapitre n'est pas encore redigee : prieres simples.
const BEFORE = [
  'Père, je viens devant toi avec un cœur ouvert.',
  'Toi qui donnes la sagesse à celui qui la demande, parle-moi par ta Parole.',
  'Ruah HaKodech (Saint-Esprit), éclaire ce que je vais lire et grave-le en moi.'
];
const AFTER = [
  'Merci, Seigneur, pour ta Parole qui éclaire mon chemin.',
  'Donne-moi de vivre aujourd’hui ce que j’ai lu, dans mes paroles et dans mes choix.',
  'Que ta sagesse guide mon travail, ma famille et mes relations.',
  'Au nom de Yéchoua (Jésus), amen.'
];

const fdate = (d: string) => {
  const [y, m, j] = d.split('-').map(Number);
  const s = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .format(new Date(y, m - 1, j));
  return s[0].toUpperCase() + s.slice(1);
};

export default async function Sagesse({ searchParams }: { searchParams: Promise<{ ch?: string }> }) {
  const sp = await searchParams;
  const today = contentDate();
  const todayCh = Number(today.slice(8, 10)); // le jour du mois = le chapitre
  const asked = Number(sp.ch);
  const ch = asked >= 1 && asked <= 31 ? asked : todayCh;

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  let { data: vs } = await sb.from('verses').select('verse, text')
    .eq('translation', 'S21').eq('book', 20).eq('chapter', ch).order('verse');
  let trName = 'Segond 21';
  if (!vs?.length) {
    ({ data: vs } = await sb.from('verses').select('verse, text')
      .eq('translation', 'FRLSG').eq('book', 20).eq('chapter', ch).order('verse'));
    trName = 'Segond 1910';
  }
  const { data: rawFiche } = await sb.from('proverbes_daily').select('*').eq('chapter', ch).maybeSingle();
  const f: any = rawFiche ? polishDeep(rawFiche) : null;

  const verses = (vs ?? []).map((v: any) => [v.verse, v.text] as [number, string]);
  const key = f ? verses.find(([n]) => n === f.key_verse) : null;
  const before: string[] = f?.prayer_before?.length ? f.prayer_before : BEFORE;
  const after: string[] = f?.prayer_after?.length ? f.prayer_after : AFTER;

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Sagesse du jour · Michlé (Proverbes)</div>
          <div className="date">{ch === todayCh ? fdate(today) : `Chapitre choisi · aujourd’hui c’est le ${todayCh}`}</div>
          <h1>Proverbes {ch}</h1>
          <p className="lede">{f?.title ?? 'Un chapitre par jour : le chapitre du jour du mois. Prier, lire, méditer, prier.'}</p>
        </header>

        {/* Les 31 chapitres : le jour du mois en surbrillance */}
        <nav className="pv-days" aria-label="Chapitres des Proverbes">
          {Array.from({ length: 31 }, (_, i) => i + 1).map(n => (
            <Link key={n} href={n === todayCh ? '/sagesse' : `/sagesse?ch=${n}`}
                  className={`pv-day${n === ch ? ' on' : ''}${n === todayCh ? ' today' : ''}`}
                  aria-current={n === ch ? 'page' : undefined}>{n}</Link>
          ))}
        </nav>

        <div className="prayer pv-prayer">
          <span className="kicker">1 · Avant de lire</span>
          {before.map((l, i) => <p key={i} dangerouslySetInnerHTML={{ __html: rich(l) }} />)}
        </div>

        <div className="card pad pv-read">
          <span className="kicker">2 · Lire Proverbes {ch}</span>
          <p className="pv-hint">Touchez un verset pour le classer, le noter, l&rsquo;expliquer, le lire mot à mot…</p>
          {verses.length
            ? <VerseActions book={20} chapter={ch} bookName="Proverbes" verses={verses} user={user} />
            : <p className="empty">Texte indisponible pour le moment.</p>}
          <span className="refsheet-tr">{trName}</span>
        </div>

        {f && (
          <div className="card pad pq">
            <span className="kicker">3 · Méditer</span>
            {key && (
              <div className="keyv" style={{ marginTop: 6 }}>
                <p>{key[1]}<br /><span className="ref-inline">Proverbes {ch}.{key[0]}</span></p>
              </div>
            )}
            {(f.meditation as string[]).map((p, i) =>
              <p key={i} className={i === 0 ? 'lead' : ''} dangerouslySetInnerHTML={{ __html: rich(p) }} />)}
            {f.retenir && (
              <div className="pv-retenir">
                <span>À garder aujourd&rsquo;hui</span>
                <b dangerouslySetInnerHTML={{ __html: rich(f.retenir) }} />
              </div>
            )}
          </div>
        )}

        <div className="prayer pv-prayer">
          <span className="kicker">{f ? '4' : '3'} · Après la lecture</span>
          {after.map((l, i) => <p key={i} dangerouslySetInnerHTML={{ __html: rich(l) }} />)}
        </div>

        <div className="pv-nav">
          {ch > 1 && <Link className="btn sm" href={`/sagesse?ch=${ch - 1}`}>‹ Proverbes {ch - 1}</Link>}
          {ch !== todayCh && <Link className="btn sm primary" href="/sagesse">Le chapitre du jour</Link>}
          {ch < 31 && <Link className="btn sm" href={`/sagesse?ch=${ch + 1}`}>Proverbes {ch + 1} ›</Link>}
        </div>
      </main>
    </>
  );
}
