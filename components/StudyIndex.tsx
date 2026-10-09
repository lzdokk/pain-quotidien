'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import LearnTabs from './LearnTabs';

type Entry = { slug: string; kind: 'theme' | 'personne' | 'lieu'; title: string; category: string; subcategory: string | null };

/**
 * INDEX D'ETUDE : comme l'annexe d'une Bible d'etude. Recherche, classement
 * par grands sujets, personnages et lieux. Un toucher ouvre la fiche, ou
 * chaque reference se lit d'un clic.
 */
export default function StudyIndex({ plan, ready, sujets, renvois }: {
  plan: Entry[]; ready: Record<string, string>;
  sujets: Array<{ id: string; title: string; groups: string[] }>;
  renvois: Array<{ from: string; to: string; slug: string }>;
}) {
  const [tab, setTab] = useState<'theme' | 'personne' | 'lieu'>('theme');
  const [view, setView] = useState<'az' | 'sujets'>('az');
  const [q, setQ] = useState('');
  useEffect(() => {
    const p = new URLSearchParams(location.search).get('q');
    if (p) setQ(p);
  }, []);

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const count = Object.keys(ready).length;

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (n.length < 2) return null;
    return plan
      .filter(e => ready[e.slug] !== undefined)
      .map(e => {
        const inTitle = norm(e.title).includes(n);
        const inDef = norm(ready[e.slug] ?? '').includes(n);
        return { e, score: inTitle ? (norm(e.title).startsWith(n) ? 3 : 2) : inDef ? 1 : 0 };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title))
      .slice(0, 40);
  }, [q, plan, ready]);

  // Renvois (« Affection : voir Amour du prochain »)
  const seeRefs = useMemo(() => {
    const n = norm(q.trim());
    if (n.length < 2) return [];
    return renvois.filter(r => norm(r.from).includes(n)).slice(0, 8);
  }, [q, renvois]);

  // Themes de A a Z, groupes par lettre (accents ignores)
  const letters = useMemo(() => {
    const m = new Map<string, Entry[]>();
    for (const e of plan.filter(x => x.kind === 'theme').sort((a, b) => a.title.localeCompare(b.title, 'fr'))) {
      const l = norm(e.title)[0]?.toUpperCase() ?? '#';
      if (!m.has(l)) m.set(l, []);
      m.get(l)!.push(e);
    }
    return [...m.entries()];
  }, [plan]);

  const chip = (e: Entry) => ready[e.slug] !== undefined
    ? <Link key={e.slug} href={`/etude/${e.slug}`} className="ix-chip">{e.title}</Link>
    : <span key={e.slug} className="ix-chip soon" title="Fiche en préparation">{e.title}</span>;

  const kindLabel = (k: Entry['kind']) => k === 'personne' ? 'Personnage' : k === 'lieu' ? 'Lieu' : 'Thème';

  return (
    <main className="wrap">
      <LearnTabs />
      <header className="hero">
        <div className="eyebrow">Index d&rsquo;étude</div>
        <h1>Toute la Bible<br />par thèmes</h1>
        <p className="lede">Cherche un thème, un personnage ou un lieu : tout est classé, et chaque passage se lit d&rsquo;un toucher.</p>
      </header>

      <Link href="/etude/comment-lire" className="card pad ix-guide">
        <span className="kicker">Guide</span>
        <b>Comment lire la Bible chaque jour ?</b>
        <span className="ix-guide-go">La méthode, les questions à se poser, et comment en faire une prière ›</span>
      </Link>

      <div className="card pad">
        <input className="field" type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Chercher : alliance, prière, Abraham, Jérusalem…" />
        <p className="ix-count">{count} fiche{count > 1 ? 's' : ''} disponible{count > 1 ? 's' : ''} sur {plan.length}</p>
      </div>

      {results ? (
        <div className="card">
          {results.length === 0 && seeRefs.length === 0 && <p className="empty" style={{ padding: 22 }}>Aucune fiche ne correspond pour l&rsquo;instant.</p>}
          {seeRefs.map(r => (
            <Link key={r.from} href={`/etude/${r.slug}`} className="ix-res">
              <span className="ix-res-k">Renvoi</span>
              <span className="ix-res-t">{r.from} <i className="ix-voir">voir</i> {r.to}</span>
            </Link>
          ))}
          {results.map(({ e }) => (
            <Link key={e.slug} href={`/etude/${e.slug}`} className="ix-res">
              <span className="ix-res-k">{kindLabel(e.kind)}{e.kind === 'theme' ? ` · ${e.category}` : ''}</span>
              <span className="ix-res-t">{e.title}</span>
              {ready[e.slug] && <span className="ix-res-d">{ready[e.slug].slice(0, 150)}{ready[e.slug].length > 150 ? '…' : ''}</span>}
            </Link>
          ))}
        </div>
      ) : (
        <>
          <div className="page-tabs" role="tablist">
            {([['theme', 'Thèmes'], ['personne', 'Personnages'], ['lieu', 'Lieux']] as const).map(([k, l]) => (
              <button key={k} role="tab" className="page-tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === 'theme' && (
            <div className="ix-view">
              <button className={`cmp-chip${view === 'az' ? ' on' : ''}`} onClick={() => setView('az')}>De A à Z</button>
              <button className={`cmp-chip${view === 'sujets' ? ' on' : ''}`} onClick={() => setView('sujets')}>Par grands sujets</button>
            </div>
          )}

          {tab === 'theme' && view === 'az' && (
            <>
              <div className="ix-letters">
                {letters.map(([l]) => <a key={l} href={`#l-${l}`}>{l}</a>)}
              </div>
              {letters.map(([l, list]) => (
                <section className="card pad ix-sujet" key={l} id={`l-${l}`} style={{ scrollMarginTop: 70 }}>
                  <h2 className="ix-sujet-t">{l}</h2>
                  <div className="ix-chips">{list.map(chip)}</div>
                </section>
              ))}
            </>
          )}

          {tab === 'theme' && view === 'sujets' && sujets.map(s => (
            <section className="card pad ix-sujet" key={s.id}>
              <h2 className="ix-sujet-t">{s.title}</h2>
              {s.groups.map(g => (
                <div key={g} className="ix-group">
                  <h3>{g}</h3>
                  <div className="ix-chips">
                    {plan.filter(e => e.kind === 'theme' && e.category === s.title && e.subcategory === g).map(chip)}
                  </div>
                </div>
              ))}
            </section>
          ))}

          {tab !== 'theme' && (
            <div className="card pad">
              <div className="ix-chips">
                {plan.filter(e => e.kind === tab).sort((a, b) => a.title.localeCompare(b.title, 'fr')).map(chip)}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
