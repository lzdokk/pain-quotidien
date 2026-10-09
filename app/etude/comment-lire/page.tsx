import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import RefChip from '@/components/RefChip';
import { METHODE, QUESTIONS, POUR_PRIER } from '@/lib/reading-guide';

export const metadata = { title: 'Comment lire la Bible chaque jour' };

export default async function CommentLire() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <Link href="/etude" className="back-parable">‹ Index d&rsquo;étude</Link>
        <header className="hero">
          <div className="eyebrow">Guide</div>
          <h1>Comment lire<br />la Bible chaque jour ?</h1>
          <p className="lede">Le plus important n&rsquo;est pas de lire beaucoup, mais de lire chaque jour, avec un cœur ouvert.</p>
        </header>

        <section className="card pad">
          <span className="kicker">La méthode</span>
          <ol className="guide-steps">
            {METHODE.map((m, i) => (
              <li key={i}>
                <b>{m.t}</b>
                <span>{m.d}{m.ref && <> <RefChip r={m.ref} /></>}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card pad">
          <span className="kicker">Questions à se poser</span>
          <p className="guide-sub">Réponds au moins à une d&rsquo;entre elles.</p>
          <ul className="guide-q">{QUESTIONS.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </section>

        <section className="card pad">
          <span className="kicker">Chaque jour, pour ta prière</span>
          <ul className="guide-pray">
            {POUR_PRIER.map((p, i) => <li key={i}><b>{p.t}</b><span>{p.q}</span></li>)}
          </ul>
        </section>

        <div className="share-grid" style={{ marginTop: 18 }}>
          <Link href="/lire" className="btn primary">Ouvrir la Bible ›</Link>
          <Link href="/etude" className="btn">Chercher un thème ›</Link>
        </div>
      </main>
    </>
  );
}
