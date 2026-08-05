'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import LearnTabs from './LearnTabs';
import ShareButton from './ShareButton';

/**
 * Les versets les plus connus et importants du christianisme. Recherche +
 * filtre par theme, chaque verset depliable pour lire le texte, sa fiche et
 * un lien direct vers le lecteur.
 */
export default function VersesBrowser({ verses }: { verses: any[] }) {
  const [theme, setTheme] = useState('Tout');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const themes = useMemo(
    () => ['Tout', ...Array.from(new Set(verses.map(v => v.theme)))],
    [verses]
  );

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const list = verses.filter(v =>
    (theme === 'Tout' || v.theme === theme) &&
    (!q || norm(`${v.reference} ${v.title} ${v.blurb} ${v.verse_text} ${v.theme}`).includes(norm(q)))
  );

  return (
    <main className="wrap">
      <LearnTabs />
      <header className="hero">
        <div className="eyebrow">Les versets</div>
        <h1>Les versets<br />à connaître</h1>
        <p className="lede">
          Les versets les plus aimés, les plus cités, ceux qu&rsquo;on garde au cœur. Chacun
          avec ce qu&rsquo;il dit, pourquoi il compte, et un lien pour l&rsquo;ouvrir dans la Bible.
        </p>
      </header>

      <div className="card pad">
        <input className="field" type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Chercher un verset, un thème, un mot (paix, amour, courage…)" />
        <div className="chips" style={{ marginTop: 16 }}>
          {themes.map(t => (
            <button key={t} className="chip" aria-selected={t === theme} onClick={() => setTheme(t)}>{t}</button>
          ))}
        </div>
      </div>

      <p className="sub" style={{ marginTop: 18 }}>
        {list.length} verset{list.length > 1 ? 's' : ''}{theme !== 'Tout' ? ` · ${theme}` : ''}
      </p>

      <div className="card">
        {list.length === 0 && <p className="empty" style={{ padding: 24 }}>Aucun verset ne correspond.</p>}
        {list.map(v => {
          const on = open === v.slug;
          return (
            <article className={`fverse${on ? ' open' : ''}`} key={v.slug}>
              <button className="fv-head" onClick={() => setOpen(on ? null : v.slug)}>
                <span className="fv-star">★</span>
                <span className="fv-id">
                  <span className="fv-ref">{v.reference}</span>
                  <span className="fv-title">{v.title}</span>
                </span>
                <span className="fv-theme">{v.theme}</span>
              </button>

              {on && (
                <div className="fv-body">
                  <blockquote className="fv-text">{v.verse_text}</blockquote>
                  <p className="fv-blurb">{v.blurb}</p>
                  <div className="fv-actions">
                    <Link className="btn sm" href={`/lire?ref=${encodeURIComponent(v.reference)}`}>
                      Ouvrir dans le lecteur ›
                    </Link>
                    <ShareButton title={v.reference}
                      text={`« ${v.verse_text} »\n${v.reference}`} />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
