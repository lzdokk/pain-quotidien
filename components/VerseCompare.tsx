'use client';
import { useEffect, useMemo, useState } from 'react';

type Verse = { verse: number; text: string };
type Chapter = { translation: string; name: string; verses: Verse[] };

/**
 * Affichage côte à côte ou empilé de deux traductions pour un chapitre entier.
 */
export default function VerseCompare({
  book,
  chapter,
  bookName,
  translationA,
  translationB,
  translations,
  onClose
}: {
  book: number;
  chapter: number;
  bookName: string;
  translationA: string;
  translationB: string;
  translations: Array<{ code: string; name: string }>;
  onClose: () => void;
}) {
  const [chapters, setChapters] = useState<Chapter[] | null>(null);
  const [layout, setLayout] = useState<'side' | 'stack'>('stack');
  const [b, setB] = useState(translationB);

  useEffect(() => { setB(translationB); }, [translationB]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await fetch(
        `/api/bible/chapter-compare?book=${book}&chapter=${chapter}&a=${translationA}&b=${b}`
      );
      const j = await r.json();
      if (alive) setChapters(j.chapters ?? []);
    })();
    return () => { alive = false; };
  }, [book, chapter, translationA, b]);

  const [left, right] = chapters ?? [];
  const verseNums = useMemo(() => {
    const set = new Set<number>();
    for (const ch of chapters ?? []) for (const v of ch.verses) set.add(v.verse);
    return [...set].sort((a, b) => a - b);
  }, [chapters]);

  const textOf = (ch: Chapter | undefined, n: number) =>
    ch?.verses.find(v => v.verse === n)?.text ?? '';

  const others = translations.filter(t => t.code !== translationA);

  return (
    <div className="modal-in vexplain vcompare">
      <button className="mclose" onClick={onClose} aria-label="Fermer">✕</button>
      <div className="msub">Comparer les traductions — {bookName} {chapter}</div>

      <div className="vcompare-bar">
        <select className="field sm" value={b} onChange={e => setB(e.target.value)} aria-label="Deuxième traduction">
          {others.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
        </select>
        <div className="cmp-filter">
          <button className={`cmp-chip${layout === 'stack' ? ' on' : ''}`} onClick={() => setLayout('stack')}>
            Empilé
          </button>
          <button className={`cmp-chip${layout === 'side' ? ' on' : ''}`} onClick={() => setLayout('side')}>
            Côte à côte
          </button>
        </div>
      </div>

      {chapters === null ? <p className="empty">Chargement…</p> :
       !left?.verses.length && !right?.verses.length ? (
         <p className="empty">Ce chapitre n&rsquo;est pas disponible dans ces traductions.</p>
       ) : layout === 'side' ? (
         <div className="vcompare-grid">
           <div className="vcompare-col">
             <span className="cmp-name">{left?.name ?? translationA}</span>
             {verseNums.map(n => (
               <p key={n} className="vcompare-verse">
                 <span className="vn">{n}</span>{textOf(left, n) || '—'}
               </p>
             ))}
           </div>
           <div className="vcompare-col">
             <span className="cmp-name">{right?.name ?? b}</span>
             {verseNums.map(n => (
               <p key={n} className="vcompare-verse">
                 <span className="vn">{n}</span>{textOf(right, n) || '—'}
               </p>
             ))}
           </div>
         </div>
       ) : (
         <div className="vcompare-stack">
           {verseNums.map(n => (
             <div key={n} className="vcompare-block">
               <span className="vcompare-num">{n}</span>
               <div className="cmp-row">
                 <span className="cmp-name">{left?.name ?? translationA}</span>
                 <p className="cmp-text">{textOf(left, n) || '—'}</p>
               </div>
               <div className="cmp-row">
                 <span className="cmp-name">{right?.name ?? b}</span>
                 <p className="cmp-text">{textOf(right, n) || '—'}</p>
               </div>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}
