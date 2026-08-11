'use client';
import { useEffect, useState } from 'react';

type Row = { code: string; name: string; language: string; text: string };

/** Compare un verset dans toutes les traductions libres de droits activées. */
export default function Compare({ book, chapter, verse, refLabel, onClose }:
  { book: number; chapter: number; verse: number; refLabel: string; onClose: () => void }) {
  const [items, setItems] = useState<Row[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await fetch(`/api/verse-compare?book=${book}&chapter=${chapter}&verse=${verse}`);
      const j = await r.json();
      if (alive) setItems(j.items ?? []);
    })();
    return () => { alive = false; };
  }, [book, chapter, verse]);

  return (
    <div className="modal-in vexplain">
      <button className="mclose" onClick={onClose} aria-label="Fermer">✕</button>
      <div className="msub">Comparer les traductions — {refLabel}</div>

      {items === null ? <p className="empty">Chargement des traductions…</p> :
       items.length === 0 ? <p className="empty">Aucune traduction disponible pour ce verset.</p> :
       <div className="cmp-list">
         {items.map(it => (
           <div className="cmp-row" key={it.code}>
             <span className="cmp-name">{it.name}</span>
             <p className="cmp-text" dir={/^(he|ar)$/.test(it.language) ? 'rtl' : 'ltr'}>{it.text}</p>
           </div>
         ))}
       </div>}
    </div>
  );
}
