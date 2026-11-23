import Link from 'next/link';
import { notFound } from 'next/navigation';
import CarnetChapitre from '@/components/CarnetChapitre';
import { BOOKS } from '@/lib/refs';
import { ficheChapitre } from '@/lib/fiches-chapitres';

export async function generateMetadata({ params }: { params: Promise<{ n: string; ch: string }> }) {
  const { n, ch } = await params;
  const b = BOOKS[+n - 1];
  return { title: b ? `${b[1]} ${ch} · Étude` : 'Étude du chapitre' };
}

const QUESTIONS_MEDITATION = [
  'Qui parle ? À qui s’adresse-t-on ?',
  'Que se passe-t-il ? Quel est le contexte ?',
  'Que m’apprend ce passage sur Dieu, sur Jésus ?',
  'Comment aurais-je réagi dans la même situation ?',
  'Comment devrais-je réagir aujourd’hui ?',
  'Ce passage est-il d’actualité ? Quel équivalent aujourd’hui ?',
  'Y a-t-il un péché à confesser, une promesse à saisir, un ordre à suivre, un exemple à imiter ?',
  'À qui puis-je en parler cette semaine ?'
];

export default async function ChapitrePage({ params }: { params: Promise<{ n: string; ch: string }> }) {
  const { n, ch } = await params;
  const id = +n, c = +ch;
  const b = BOOKS[id - 1];
  if (!b || !Number.isInteger(c) || c < 1 || c > b[2]) notFound();
  const nom = b[1];
  const f = ficheChapitre(id, c);
  const lire = `/lire?ref=${encodeURIComponent(`${nom} ${c}`)}`;
  return (
    <main className="wrap">
      <Link href={`/etudier/livre/${id}`} className="back-parable">‹ {nom}</Link>
      <header className="hero compact">
        <div className="eyebrow">Étude du chapitre</div>
        <h1>{nom} {c}</h1>
      </header>

      <div className="share-grid" style={{ marginBottom: 12 }}>
        <Link href={lire} className="btn primary">Lire {nom} {c} ›</Link>
      </div>

      <section className="card pad">
        <span className="kicker">① Avant de lire</span>
        <p>Prie : « Ouvre mes yeux, que je voie les merveilles de ta loi » (Ps 119.18). Lis le chapitre trois fois : d&rsquo;une traite, à voix haute, crayon en main.</p>
      </section>

      {f && (
        <>
          <section className="card pad">
            <span className="kicker">② Le chapitre en bref</span>
            <p>{f.resume}</p>
            <dl className="pe-dl" style={{ marginTop: 8 }}>
              {f.blocs.map(([v, i]) => <div className="pe-row" key={v}><dt>v. {v}</dt><dd>{i}</dd></div>)}
            </dl>
          </section>
          <section className="card pad">
            <span className="kicker">③ Observer</span>
            <ul className="pe-q">{f.observation.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </section>
          <section className="card pad">
            <span className="kicker">④ Comprendre</span>
            <ul className="pe-q">{f.interpretation.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </section>
          <section className="card pad">
            <span className="kicker">⑤ Me mettre dans la scène</span>
            <ul className="pe-q">{f.scene.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </section>
          <section className="card pad">
            <span className="kicker">⑥ Méditer et agir</span>
            <ul className="pe-q">
              <li><b>Verset à ruminer :</b> {f.mediter.verset}</li>
              <li><b>Question :</b> {f.mediter.question}</li>
              <li><b>Action :</b> {f.mediter.action}</li>
            </ul>
          </section>
          <section className="card pad">
            <span className="kicker">⑦ Pour en parler autour de moi</span>
            <p className="pe-big">{f.parler.phrase}</p>
            <p><b>Question à poser :</b> {f.parler.question}</p>
          </section>
        </>
      )}

      {!f && (
        <section className="card pad">
          <span className="kicker">Questions pour méditer ce chapitre</span>
          <ul className="pe-q">{QUESTIONS_MEDITATION.map((q, i) => <li key={i}>{q}</li>)}</ul>
          <p className="pe-prog">La fiche détaillée de ce chapitre arrive peu à peu. En attendant, la fiche du livre te donne le cadre.</p>
          <div className="share-grid" style={{ marginTop: 10 }}>
            <Link href={`/etudier/livre/${id}`} className="btn">Fiche du livre ›</Link>
          </div>
        </section>
      )}

      <section className="card pad">
        <span className="kicker">Mon carnet</span>
        <p className="pe-prog" style={{ marginTop: 0, marginBottom: 8 }}>Ce que Dieu me dit, ce que je fais, ce que je veux dire à quelqu&rsquo;un.</p>
        <CarnetChapitre cle={`${id}-${c}`} placeholder="Mes notes sur ce chapitre…" />
      </section>

      <div className="pe-nav">
        {c > 1 ? <Link className="btn" href={`/etudier/livre/${id}/${c - 1}`}>‹ Chapitre {c - 1}</Link> : <span />}
        {c < b[2] ? <Link className="btn" href={`/etudier/livre/${id}/${c + 1}`}>Chapitre {c + 1} ›</Link> : <span />}
      </div>
    </main>
  );
}
