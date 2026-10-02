'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import LearnTabs from './LearnTabs';
import ShareButton from './ShareButton';
import VerseActions from './VerseActions';
import { supabase } from '@/lib/supabase/client';

/**
 * Les versets les plus connus et importants du christianisme. Recherche +
 * filtre par theme, chaque verset depliable pour lire le texte, sa fiche et
 * un lien direct vers le lecteur.
 */
export default function VersesBrowser({ verses, user }: { verses: any[]; user?: any }) {
  const [theme, setTheme] = useState('Tout');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  // Texte verset par verset du verset ouvert (pour la fenetre d'actions,
  // la meme que dans Lire et le pain quotidien).
  const [vv, setVv] = useState<Record<string, Array<[number, string]>>>({});

  useEffect(() => {
    const v = verses.find(x => x.slug === open);
    if (!v || !v.book || !v.chapter || !v.verse_start || vv[v.slug]) return;
    let alive = true;
    (async () => {
      const end = v.verse_end ?? v.verse_start;
      const read = (t: string) => supabase.from('verses').select('verse, text')
        .eq('translation', t).eq('book', v.book).eq('chapter', v.chapter)
        .gte('verse', v.verse_start).lte('verse', end).order('verse');
      let { data } = await read('S21');
      if (!data?.length) ({ data } = await read('FRLSG'));
      if (alive && data?.length) {
        setVv(m => ({ ...m, [v.slug]: (data as any[]).map(r => [r.verse, r.text] as [number, string]) }));
      }
    })();
    return () => { alive = false; };
  }, [open, verses]); // eslint-disable-line react-hooks/exhaustive-deps

  const bookNameOf = (ref: string) => ref.replace(/\s+\d+[.:,].*$/, '').replace(/\s+\d+$/, '').trim();

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
                  {vv[v.slug]?.length ? (
                    <div className="fv-text fv-actions-text">
                      <VerseActions book={v.book} chapter={v.chapter} bookName={bookNameOf(v.reference)}
                                    verses={vv[v.slug]} user={user} />
                      <p className="fv-hint">Touchez le verset pour l&rsquo;expliquer, le comparer, le classer ou l&rsquo;annoter.</p>
                    </div>
                  ) : (
                    <blockquote className="fv-text">{v.verse_text}</blockquote>
                  )}
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
