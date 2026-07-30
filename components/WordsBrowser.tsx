'use client';
import { useMemo, useState } from 'react';

/**
 * Base des mots importants (hebreu / arameen / grec), tiree des livrets de
 * Mickael A. Recherche + filtre par theme, chaque mot depliable pour lire le
 * sens profond et son accomplissement en Christ.
 */
export default function WordsBrowser({ words }: { words: any[] }) {
  const [theme, setTheme] = useState('Tout');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const themes = useMemo(
    () => ['Tout', ...Array.from(new Set(words.map(w => w.theme)))],
    [words]
  );

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const list = words.filter(w =>
    (theme === 'Tout' || w.theme === theme) &&
    (!q || norm(`${w.translit} ${w.gloss} ${w.sense} ${w.theme}`).includes(norm(q)))
  );

  const langClass = (l: string) =>
    /grec/i.test(l) ? 'gr' : /aram/i.test(l) ? 'ar' : 'he';

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Les mots</div>
        <h1>Le sens profond<br />des mots d&rsquo;origine</h1>
        <p className="lede">
          Les mots hébreu, araméen et grec qui portent le cœur du texte. Ce que le
          français ne rend pas toujours, et comment chacun trouve son sommet en Christ.
        </p>
      </header>

      <div className="card pad">
        <input className="field" type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Chercher un mot (agapè, hesed, grâce, alliance…)" />
        <div className="chips" style={{ marginTop: 16 }}>
          {themes.map(t => (
            <button key={t} className="chip" aria-selected={t === theme} onClick={() => setTheme(t)}>{t}</button>
          ))}
        </div>
      </div>

      <p className="sub" style={{ marginTop: 18 }}>
        {list.length} mot{list.length > 1 ? 's' : ''}{theme !== 'Tout' ? ` · ${theme}` : ''}
      </p>

      <div className="card">
        {list.length === 0 && <p className="empty" style={{ padding: 24 }}>Aucun mot ne correspond.</p>}
        {list.map(w => {
          const on = open === w.slug;
          return (
            <article className={`word${on ? ' open' : ''}`} key={w.slug}>
              <button className="word-head" onClick={() => setOpen(on ? null : w.slug)}>
                <span className={`wterm ${langClass(w.lang)}`}>{w.term || w.translit}</span>
                <span className="word-id">
                  <span className="word-tr">{w.translit}</span>
                  <span className="word-gl">{w.gloss}</span>
                </span>
                <span className={`wlang ${langClass(w.lang)}`}>{w.lang}</span>
              </button>

              {on && (
                <div className="word-body">
                  <p>{w.sense}</p>
                  {w.christ && (
                    <div className="word-christ">
                      <span className="kicker">Accompli en Christ</span>
                      <p>{w.christ}</p>
                    </div>
                  )}
                  {(w.refs as string[])?.length > 0 && (
                    <div className="word-refs">
                      {(w.refs as string[]).map(r => <span key={r}>{r}</span>)}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
