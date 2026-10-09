import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import RefChip from '@/components/RefChip';
import { rich } from '@/lib/rich';
import { polishDeep } from '@/lib/accents';
import { slugify } from '@/lib/prompts/study-index';

export const revalidate = 3600;

type Section = { title: string; items: Array<{ label: string; refs: string[] }> };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data } = await sb.from('bible_index').select('title').eq('slug', slug).maybeSingle();
  return { title: data?.title ? `${data.title} · Index d’étude` : 'Index d’étude' };
}

export default async function Fiche({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  let { data: e } = await sb.from('bible_index').select('*').eq('slug', slug).maybeSingle();
  if (!e) notFound();
  e = polishDeep(e);

  const sections = (e.sections ?? []) as Section[];
  const total = sections.reduce((n, s) => n + s.items.reduce((m, it) => m + it.refs.length, 0), 0);
  const kind = e.kind === 'personne' ? 'Personnage' : e.kind === 'lieu' ? 'Lieu' : 'Thème';
  const from = `/etude/${slug}`;

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <Link href="/etude" className="back-parable">‹ Index d&rsquo;étude</Link>

        <header className="ix-head">
          <span className="kicker">{kind}{e.kind === 'theme' && e.category ? ` · ${e.category}` : ''}{e.subcategory ? ` › ${e.subcategory}` : ''}</span>
          <h1>{e.title}</h1>
          {e.definition && <p className="ix-def" dangerouslySetInnerHTML={{ __html: rich(e.definition) }} />}
          <p className="ix-meta">{total} passage{total > 1 ? 's' : ''} · touche une référence pour la lire</p>
        </header>

        {sections.map((s, i) => (
          <section className="card pad ix-sec" key={i}>
            <h2>{s.title}</h2>
            <ul className="ix-items">
              {s.items.map((it, j) => (
                <li key={j}>
                  <span className="ix-label" dangerouslySetInnerHTML={{ __html: rich(it.label) }} />
                  <span className="ix-refs">{it.refs.map(r => <RefChip key={r} r={r} from={from} />)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {(e.see_also ?? []).length > 0 && (
          <div className="card pad">
            <span className="kicker">Voir aussi</span>
            <div className="ix-chips">
              {(e.see_also as string[]).map(t => (
                <Link key={t} href={`/etude/${slugify(t)}`} className="ix-chip">{t}</Link>
              ))}
            </div>
          </div>
        )}

        <p className="ix-note">
          Fiches rédigées pour Pain de Vie et vérifiées automatiquement (chaque référence existe bien).
          Lis toujours le passage dans son contexte.
        </p>
      </main>
    </>
  );
}
