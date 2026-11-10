'use client';
import { useEffect, useState } from 'react';
import { getChapterStudy, kindLabel } from '@/lib/study-client';

/**
 * Bible d'étude pendant la lecture : les fiches qui parlent de CE chapitre
 * (thèmes, personnages, lieux, mots), avec les versets concernés.
 */
type Item = { slug: string; title: string; kind: string; verses: number[] };
export default function ChapterStudy({ book, chapter, label, onOpen, onList }: {
  book: number; chapter: number; label: string;
  onOpen: (slug: string) => void; onList?: (list: Item[]) => void;
}) {
  const [items, setItems] = useState<Array<{ slug: string; title: string; kind: string; verses: number[] }> | null>(null);
  const [all, setAll] = useState(false);

  useEffect(() => {
    let alive = true;
    setItems(null); setAll(false);
    getChapterStudy(book, chapter).then(list => {
      if (!alive) return;
      setItems(list);
      onList?.(list);
    });
    return () => { alive = false; };
  }, [book, chapter]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = items ? (all ? items : items.slice(0, 10)) : [];
  return (
    <div className="card pad cstudy">
      <div className="cstudy-h">
        <span className="kicker">Bible d&rsquo;étude · {label}</span>
      </div>
      {items === null ? <p className="fine">Recherche des fiches liées à ce chapitre…</p>
        : items.length === 0 ? <p className="fine">Pas encore de fiche qui cite ce chapitre : la Bible d&rsquo;étude se remplit chaque nuit.</p>
        : (
          <>
            <div className="cstudy-list">
              {shown.map(it => (
                <button key={it.slug} className={`cstudy-it k-${it.kind}`} onClick={() => onOpen(it.slug)}>
                  <span className="cstudy-k">{kindLabel(it.kind)}</span>
                  <span className="cstudy-t">{it.title}</span>
                  {it.verses.length > 0 && <span className="cstudy-v">v. {it.verses.slice(0, 4).join(', ')}{it.verses.length > 4 ? '…' : ''}</span>}
                </button>
              ))}
            </div>
            {items.length > 10 && !all && (
              <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setAll(true)}>Voir les {items.length} fiches</button>
            )}
          </>
        )}
      <p className="cstudy-hint">Touchez ✦ à côté d&rsquo;un verset pour ouvrir sa fiche.</p>
    </div>
  );
}
