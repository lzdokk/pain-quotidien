import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';

export const revalidate = 3600;
export const metadata = { title: 'Les jours passes' };

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export default async function Jours() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: days } = await sb.from('daily_bread')
    .select('date, theme_title')
    .eq('published', true).order('date', { ascending: false }).limit(400);

  const groups = new Map<string, any[]>();
  for (const d of days ?? []) {
    const key = d.date.slice(0, 7);
    const arr = groups.get(key) ?? [];
    arr.push(d);
    groups.set(key, arr);
  }

  return (
    <>
      <Nav user={user} />
      <main className="wrap">
        <header className="hero">
          <div className="eyebrow">Archive</div>
          <h1>Les jours passés</h1>
          <p className="lede">Chaque pain quotidien déjà publie, jour après jour.</p>
        </header>

        <Link href="/pain" className="back">‹ Revenir à aujourd&rsquo;hui</Link>

        {(!days || days.length === 0) && (
          <div className="card pad"><p className="empty">Aucun jour publié pour l&rsquo;instant.</p></div>
        )}

        {[...groups.entries()].map(([ym, list]) => {
          const [y, m] = ym.split('-');
          return (
            <section key={ym} style={{ marginTop: 30 }}>
              <h2 className="sect" style={{ margin: '0 0 14px' }}>{MOIS[+m - 1]} {y}</h2>
              <div className="agenda">
                {list.map((d: any) => (
                  <Link key={d.date} href={`/jour/${d.date}`} className="agenda-day" title={d.theme_title}>
                    <span className="ad-n">{+d.date.slice(8, 10)}</span>
                    <span className="ad-t" dangerouslySetInnerHTML={{ __html: d.theme_title }} />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
