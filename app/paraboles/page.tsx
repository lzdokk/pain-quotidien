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
          <div className="rc-list">
            {THEMES.map((t, i) => {
              const list = parTheme.get(t) ?? [];
              if (list.length === 0) return null;
              return (
                <details key={t} id={slugTheme(t)} className="card rc-volet">
                  <summary>
                    <span className="rc-n">{i + 1}</span>
                    <span className="rc-t">{t}</span>
                    <span className="rc-c">{list.length} récit{list.length > 1 ? 's' : ''}</span>
                    <span className="rc-chev" aria-hidden="true">›</span>
                  </summary>
                  <div className="rc-body">
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
                </details>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

function slugTheme(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
