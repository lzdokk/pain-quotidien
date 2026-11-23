import Link from 'next/link';
import { notFound } from 'next/navigation';
import RefChip from '@/components/RefChip';
import { BOOKS } from '@/lib/refs';
import { FICHES_LIVRES } from '@/lib/fiches-livres';
import { FICHES_CHAPITRES } from '@/lib/fiches-chapitres';

export const generateStaticParams = () => BOOKS.map((_, i) => ({ n: String(i + 1) }));
export async function generateMetadata({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const b = BOOKS[+n - 1];
  return { title: b ? `${b[1]} · Fiche du livre` : 'Fiche du livre' };
}

export default async function FicheLivrePage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const id = +n;
  const b = BOOKS[id - 1];
  const f = FICHES_LIVRES[id];
  if (!b || !f) notFound();
  const [ab, nom, chapitres] = b;
  const lire = `/lire?ref=${encodeURIComponent(`${nom} 1`)}`;
  const row = (k: string, v: React.ReactNode) => (
    <div className="pe-row"><dt>{k}</dt><dd>{v}</dd></div>
  );
  return (
    <main className="wrap">
      <Link href="/etudier" className="back-parable">‹ Parcours d&rsquo;étude</Link>
      <header className="hero compact">
        <div className="eyebrow">Fiche du livre</div>
        <h1>{nom}</h1>
        <p className="lede">{f.t}</p>
      </header>

      <section className="card pad">
        <span className="kicker">Carte d&rsquo;identité</span>
        <dl className="pe-dl">
          {row('Auteur', f.a)}
          {row('Date', f.d)}
          {row('À qui', f.p)}
          {row('Genre', f.g)}
        </dl>
      </section>

      <section className="card pad">
        <span className="kicker">Le plan</span>
        <ul className="pe-plan">{f.pl.map((x, i) => <li key={i}>{x}</li>)}</ul>
      </section>

      <section className="card pad">
        <span className="kicker">Où est Jésus ?</span>
        <p className="pe-big" style={{ fontSize: 16.5 }}>{f.j}</p>
        <span className="kicker" style={{ marginTop: 14, display: 'block' }}>Comment Dieu me parle</span>
        <p className="pe-big" style={{ fontSize: 16.5 }}>{f.dg}</p>
      </section>

      <section className="card pad">
        <span className="kicker">Versets clés</span>
        <div className="ix-chips">
          {f.v.map(r => /^\d/.test(r) ? <RefChip key={r} r={`${ab} ${r.replace(':', '.')}`} /> : <span key={r} className="ix-chip soon">{r}</span>)}
        </div>
        {f.x && <div className="pe-warn">{f.x}</div>}
      </section>

      <section className="card pad">
        <span className="kicker">À lire avec</span>
        <div className="ix-chips">{f.l.map(r => <RefChip key={r} r={r.replace(':', '.')} />)}</div>
      </section>

      <section className="card pad">
        <span className="kicker">Étudier chapitre par chapitre</span>
        <div className="pe-chaps">
          {Array.from({ length: chapitres }, (_, i) => i + 1).map(c => (
            <Link key={c} href={`/etudier/livre/${id}/${c}`} className={`pe-chap${FICHES_CHAPITRES[`${id}-${c}`] ? ' has' : ''}`}>{c}</Link>
          ))}
        </div>
        <p className="pe-prog">Les chapitres en couleur ont leur fiche détaillée ; les autres ont les questions de méditation et le carnet.</p>
      </section>

      <div className="share-grid" style={{ marginTop: 18 }}>
        <Link href={lire} className="btn primary">Lire {nom} ›</Link>
      </div>
      <p className="ix-note">Fiche rédigée pour Pain de Vie à partir de sources évangéliques de référence. Les dates et auteurs suivent la tradition ; vérifie avec ta Bible d&rsquo;étude.</p>
    </main>
  );
}
