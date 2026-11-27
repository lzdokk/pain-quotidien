'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { StudyEntry } from '@/lib/study-client';
import { kindLabel } from '@/lib/study-client';

type Kind = StudyEntry['kind'];

/**
 * BIBLE D'ÉTUDE : recherche, thèmes (de A à Z ou par grands sujets),
 * personnages, lieux et mots hébreux. Un toucher ouvre la fiche
 * (dans une feuille quand c'est intégré au lecteur, sinon sur sa page).
 */
export default function StudyIndex({ plan, ready, sujets, renvois, embedded = false, onOpen, initialQuery = '' }: {
  plan: StudyEntry[]; ready: Record<string, string>;
  sujets: Array<{ id: string; title: string; groups: string[] }>;
  renvois: Array<{ from: string; to: string; slug: string }>;
  embedded?: boolean; onOpen?: (slug: string) => void; initialQuery?: string;
}) {
  const [tab, setTab] = useState<Kind>('theme');
  const [view, setView] = useState<'az' | 'sujets'>('az');
  const [q, setQ] = useState(initialQuery);
  useEffect(() => {
    if (embedded) return;
    const p = new URLSearchParams(location.search).get('q');
    if (p) setQ(p);
  }, [embedded]);

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const count = Object.keys(ready).length;

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (n.length < 2) return null;
    return plan
      .filter(e => ready[e.slug] !== undefined)
      .map(e => {
        const t = norm(e.title);
        const inTitle = t.includes(n);
        const inDef = norm(ready[e.slug] ?? '').includes(n);
        return { e, score: inTitle ? (t.startsWith(n) ? 3 : 2) : inDef ? 1 : 0 };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title))
      .slice(0, 50);
  }, [q, plan, ready]);

  const seeRefs = useMemo(() => {
    const n = norm(q.trim());
    if (n.length < 2) return [];
    return renvois.filter(r => norm(r.from).includes(n)).slice(0, 8);
  }, [q, renvois]);

  const letters = useMemo(() => {
    const m = new Map<string, StudyEntry[]>();
    for (const e of plan.filter(x => x.kind === tab).sort((a, b) => a.title.localeCompare(b.title, 'fr'))) {
      const l = norm(e.title)[0]?.toUpperCase() ?? '#';
      if (!m.has(l)) m.set(l, []);
      m.get(l)!.push(e);
    }
    return [...m.entries()];
  }, [plan, tab]);

  const open = (slug: string) => onOpen?.(slug);
  const chip = (e: StudyEntry) => ready[e.slug] === undefined
    ? <span key={e.slug} className="ix-chip soon" title="Fiche en préparation">{e.title}</span>
    : onOpen
      ? <button key={e.slug} className="ix-chip" onClick={() => open(e.slug)}>{e.title}</button>
      : <Link key={e.slug} href={`/etude/${e.slug}`} className="ix-chip">{e.title}</Link>;

  const result = (key: string, slug: string, children: React.ReactNode) => onOpen
    ? <button key={key} className="ix-res" onClick={() => open(slug)}>{children}</button>
    : <Link key={key} href={`/etude/${slug}`} className="ix-res">{children}</Link>;

  const TABS: Array<[Kind, string]> = [['theme', 'Thèmes'], ['personne', 'Personnages'], ['lieu', 'Lieux'], ['mot', 'Mots hébreux']];

  return (
    <div className={embedded ? 'study-embedded' : 'wrap'}>
      {!embedded && (
        <header className="hero">
          <div className="eyebrow">Bible d&rsquo;étude</div>
          <h1>Toute la Bible<br />par thèmes</h1>
          <p className="lede">Cherche un thème, un personnage, un lieu ou un mot hébreu : chaque passage se lit d&rsquo;un toucher.</p>
        </header>
      )}

      <div className="card pad study-search">
        <input className="field" type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Chercher : alliance, prière, Abraham, Jérusalem, hessed…" />
        <div className="study-meta">
          <span>{count} fiche{count > 1 ? 's' : ''} prête{count > 1 ? 's' : ''}</span>
          <span className="study-bar"><i style={{ width: `${Math.min(100, Math.round(count / Math.max(1, plan.length) * 100))}%` }} /></span>
          <span>{plan.length} prévues</span>
        </div>
        {!embedded && (
          <Link href="/etude/comment-lire" className="study-guide-link">Comment lire la Bible chaque jour ›</Link>
        )}
      </div>

      {results ? (
        <div className="card">
          {results.length === 0 && seeRefs.length === 0 && <p className="empty" style={{ padding: 22 }}>Aucune fiche ne correspond pour l&rsquo;instant.</p>}
          {seeRefs.map(r => result(`r-${r.from}`, r.slug, (
            <>
              <span className="ix-res-k">Renvoi</span>
              <span className="ix-res-t">{r.from} <i className="ix-voir">voir</i> {r.to}</span>
            </>
          )))}
          {results.map(({ e }) => result(e.slug, e.slug, (
            <>
              <span className="ix-res-k">{kindLabel(e.kind)}{e.kind === 'theme' ? ` · ${e.category}` : ''}</span>
              <span className="ix-res-t">{e.title}</span>
              {ready[e.slug] && <span className="ix-res-d">{ready[e.slug].slice(0, 150)}{ready[e.slug].length > 150 ? '…' : ''}</span>}
            </>
          )))}
        </div>
      ) : (
        <>
          <div className="page-tabs four study-tabs" role="tablist">
            {TABS.map(([k, l]) => (
              <button key={k} role="tab" className="page-tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === 'theme' && (
            <div className="ix-view">
              <button className={`cmp-chip${view === 'az' ? ' on' : ''}`} onClick={() => setView('az')}>De A à Z</button>
              <button className={`cmp-chip${view === 'sujets' ? ' on' : ''}`} onClick={() => setView('sujets')}>Par grands sujets</button>
            </div>
          )}

          {(tab !== 'theme' || view === 'az') && (
            <>
              <div className="ix-letters">
                {letters.map(([l]) => (
                  <a key={l} href={`#l-${tab}-${l}`} onClick={e => {
                    e.preventDefault();
                    document.getElementById(`l-${tab}-${l}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}>{l}</a>
                ))}
              </div>
              {letters.map(([l, list]) => (
                <section className="card pad ix-sujet" key={l} id={`l-${tab}-${l}`} style={{ scrollMarginTop: 80 }}>
                  <h2 className="ix-sujet-t">{l}</h2>
                  <div className="ix-chips">{list.map(chip)}</div>
                </section>
              ))}
            </>
          )}

          {tab === 'theme' && view === 'sujets' && sujets.map(s => (
            <details className="card pad ix-sujet ix-fold" key={s.id}>
              <summary className="ix-sujet-t">{s.title}</summary>
              {s.groups.map(g => (
                <div key={g} className="ix-group">
                  <h3>{g}</h3>
                  <div className="ix-chips">
                    {plan.filter(e => e.kind === 'theme' && e.category === s.title && e.subcategory === g).map(chip)}
                  </div>
                </div>
              ))}
            </details>
          ))}
        </>
      )}
    </div>
  );
}
