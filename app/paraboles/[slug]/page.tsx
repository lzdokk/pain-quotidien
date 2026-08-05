import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import { rich } from '@/lib/rich';
import ReadingLinks from '@/components/ReadingLinks';

export const revalidate = 86400;

export default async function Episode({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: p } = await sb.from('parables').select('*').eq('slug', slug).maybeSingle();
  if (!p) notFound();
  const { data: { user } } = await sb.auth.getUser();

  const { data: siblings } = await sb.from('parables')
    .select('slug, episode').eq('theme', p.theme).order('episode');
  const idx = (siblings ?? []).findIndex(s => s.slug === slug);
  const prev = idx > 0 ? siblings![idx - 1] : null;
  const next = idx >= 0 && idx < (siblings?.length ?? 0) - 1 ? siblings![idx + 1] : null;

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">{p.theme} · épisode {p.episode}</div>
          <h1>{p.title}</h1>
          <p className="lede" dangerouslySetInnerHTML={{ __html: rich(p.hook) }} />
        </header>

        <Link href="/paraboles" className="back">‹ Tous les épisodes</Link>

        <div className="card pad pq">
          <span className="kicker">La parabole</span>
          {(p.story as string[]).map((par, i) => (
            <p key={i} className={i === 0 ? 'lead' : ''} dangerouslySetInnerHTML={{ __html: rich(par) }} />
          ))}
        </div>

        {(p.unpacking as Array<{ h: string; p: string[] }>).map((sec, i) => (
          <div className="card pad pq" key={i}>
            <span className="kicker">{sec.h}</span>
            {sec.p.map((x, j) => <p key={j} dangerouslySetInnerHTML={{ __html: rich(x) }} />)}
          </div>
        ))}

        <div className="card verse">
          <blockquote>{p.key_verse}</blockquote>
          <cite>{p.key_verse_ref?.toUpperCase()} · SEGOND</cite>
        </div>

        <div className="card pad">
          <span className="kicker">Pour se situer</span>
          <ul className="steps">
            {(p.questions as string[]).map((q, i) => (
              <li key={i}><span className="st-txt" dangerouslySetInnerHTML={{ __html: rich(q) }} /></li>
            ))}
          </ul>
        </div>

        <div className="card pad">
          <span className="kicker">Pour aller plus loin</span>
          <ul className="mlist">
            {(p.refs as string[]).map((r, i) => <li key={i}><ReadingLinks text={r} /></li>)}
          </ul>
        </div>

        <div className="pnav">
          {prev ? (
            <Link href={`/paraboles/${prev.slug}`} className="btn">‹ Épisode précédent</Link>
          ) : <span />}
          {next && (
            <Link href={`/paraboles/${next.slug}`} className="btn primary">Épisode suivant ›</Link>
          )}
        </div>
      </main>
    </>
  );
}
