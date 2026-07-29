import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import { THEMES } from '@/lib/prompts/parable';

export const revalidate = 3600;
export const metadata = { title: 'Paraboles' };

export default async function Paraboles() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: rows } = await sb.from('parables')
    .select('slug, theme, theme_order, episode, title, hook, published_at')
    .order('theme_order').order('episode');

  const parTheme = new Map<string, typeof rows>();
  for (const t of THEMES) parTheme.set(t, []);
  for (const r of rows ?? []) parTheme.get(r.theme)?.push(r as any);

  const total = rows?.length ?? 0;

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Paraboles</div>
          <h1>La théologie<br />racontée</h1>
          <p className="lede">
            Un point à la fois, une histoire pour le faire sentir avant de l&rsquo;expliquer.
            Un ou deux épisodes par semaine, classés par thème pour ne jamais s&rsquo;y perdre.
          </p>
        </header>

        {total === 0 && (
          <div className="card pad">
            <p className="empty">Le premier épisode arrive bientôt.</p>
          </div>
        )}

        {total > 0 && (
          <>
            <h2 className="sect">Le parcours</h2>
            <p className="sub">Les quatorze thèmes du parcours, dans l&rsquo;ordre. Touchez-en un pour aller directement à ses épisodes.</p>
            <div className="card">
              {THEMES.map((t, i) => {
                const n = parTheme.get(t)?.length ?? 0;
                return (
                  <a key={t} href={`#${slugTheme(t)}`} className="pth" aria-disabled={n === 0}>
                    <span className="pth-n">{i + 1}</span>
                    <span className="pth-t">{t}</span>
                    <span className="pth-c">{n > 0 ? `${n} épisode${n > 1 ? 's' : ''}` : 'à venir'}</span>
                  </a>
                );
              })}
            </div>

            {THEMES.map(t => {
              const list = parTheme.get(t) ?? [];
              if (list.length === 0) return null;
              return (
                <section key={t} id={slugTheme(t)} style={{ marginTop: 34 }}>
                  <h2 className="sect" style={{ margin: '0 0 14px' }}>{t}</h2>
                  <div className="card">
                    {list.map(p => (
                      <Link key={p.slug} href={`/paraboles/${p.slug}`} className="pep">
                        <span className="pep-n">{p.episode}</span>
                        <div>
                          <span className="pep-t">{p.title}</span>
                          <span className="pep-h">{p.hook}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </main>
    </>
  );
}

function slugTheme(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
