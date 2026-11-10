import Link from 'next/link';
import { supabasePublic } from '@/lib/supabase/public';
import { ParableReadMarks } from '@/components/ParableRead';
import LearnTabs from '@/components/LearnTabs';
import { THEMES } from '@/lib/prompts/parable';

export const revalidate = 3600;
export const metadata = { title: 'Théologie racontée' };

export default async function Paraboles() {
  const sb = await supabasePublic();
  const user: any = null; // lu dans le navigateur (useUser)
  const { data: rows } = await sb.from('parables')
    .select('slug, theme, theme_order, episode, title, hook, published_at')
    .order('theme_order').order('episode');

  const parTheme = new Map<string, typeof rows>();
  for (const t of THEMES) parTheme.set(t, []);
  // Trois histoires par thème, pas plus.
  for (const r of rows ?? []) { const l = parTheme.get(r.theme); if (l && l.length < 3) l.push(r as any); }

  const total = [...parTheme.values()].reduce((n, l) => n + (l?.length ?? 0), 0);

  return (
    <>
      <main className="wrap">
        <ParableReadMarks />
        <LearnTabs />
        <header className="hero">
          <div className="eyebrow">Récits</div>
          <h1>Théologie<br />racontée</h1>
          <p className="lede">
            Une histoire pour sentir une vérité avant de l&rsquo;expliquer. Trois récits par thème,
            à lire dans l&rsquo;ordre.
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
            <p className="sub">Touchez un thème pour aller directement à ses trois récits.</p>
            <div className="card">
              {THEMES.map((t, i) => {
                const n = parTheme.get(t)?.length ?? 0;
                return (
                  <a key={t} href={`#${slugTheme(t)}`} className="pth" aria-disabled={n === 0}>
                    <span className="pth-n">{i + 1}</span>
                    <span className="pth-t">{t}</span>
                    <span className="pth-c">{n > 0 ? `${n} récit${n > 1 ? 's' : ''}` : '—'}</span>
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
                      <Link key={p.slug} href={`/paraboles/${p.slug}`} className="pep" data-parable={p.slug}>
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
