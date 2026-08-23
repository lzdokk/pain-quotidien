'use client';
import { useEffect, useState } from 'react';
import { getTwoTranslations, type Verse } from '@/lib/study';

/**
 * Comparateur : un même chapitre dans DEUX traductions, côte à côte
 * (empilé sur mobile). Gère local et distant via lib/study. Style CSS maison.
 */
export default function VerseCompare({
  book, chapter, transA, transB, nameA, nameB
}: {
  book: number; chapter: number; transA: string; transB: string;
  nameA?: string; nameB?: string;
}) {
  const [rows, setRows] = useState<{ a: Verse[]; b: Verse[] } | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    setRows(null); setErr(false);
    (async () => {
      try {
        const r = await getTwoTranslations(book, chapter, transA, transB);
        if (alive) setRows(r);
      } catch { if (alive) setErr(true); }
    })();
    return () => { alive = false; };
  }, [book, chapter, transA, transB]);

  if (err) return <p className="muted">Comparaison indisponible pour ce passage.</p>;
  if (!rows) return <p className="muted">Chargement…</p>;

  const byVerse = new Map<number, { a?: string; b?: string }>();
  for (const v of rows.a) byVerse.set(v.verse, { ...(byVerse.get(v.verse) ?? {}), a: v.text });
  for (const v of rows.b) byVerse.set(v.verse, { ...(byVerse.get(v.verse) ?? {}), b: v.text });
  const verses = [...byVerse.keys()].sort((x, y) => x - y);

  return (
    <div className="vc">
      <div className="vc-head">
        <span>{nameA ?? transA}</span>
        <span>{nameB ?? transB}</span>
      </div>
      {verses.map(n => {
        const r = byVerse.get(n)!;
        return (
          <div className="vc-row" key={n}>
            <div className="vc-cell"><span className="vc-n">{n}</span>{r.a ?? '—'}</div>
            <div className="vc-cell"><span className="vc-n">{n}</span>{r.b ?? '—'}</div>
          </div>
        );
      })}
    </div>
  );
}
