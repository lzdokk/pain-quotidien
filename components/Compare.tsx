'use client';
import { useEffect, useMemo, useState } from 'react';

type Row = { code: string; name: string; language: string; text: string };

const LANG_LABELS: Record<string, string> = {
  fr: 'Français', en: 'English', he: 'Hébreu', el: 'Grec', la: 'Latin',
  de: 'Deutsch', ru: 'Русский', pl: 'Polski', ar: 'العربية', zh: '中文'
};
const LANG_ORDER = ['fr', 'en', 'he', 'el', 'la', 'de', 'ru', 'pl', 'ar', 'zh'];

/** Compare un verset dans toutes les traductions libres de droits activées,
 *  groupées et filtrables par langue. */
export default function Compare({ book, chapter, verse, refLabel, onClose }:
  { book: number; chapter: number; verse: number; refLabel: string; onClose: () => void }) {
  const [items, setItems] = useState<Row[] | null>(null);
  const [only, setOnly] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await fetch(`/api/verse-compare?book=${book}&chapter=${chapter}&verse=${verse}`);
      const j = await r.json();
      if (alive) setItems(j.items ?? []);
    })();
    return () => { alive = false; };
  }, [book, chapter, verse]);

  const langs = useMemo(() => {
    const set = new Set((items ?? []).map(i => i.language));
    return [...LANG_ORDER.filter(l => set.has(l)), ...[...set].filter(l => !LANG_ORDER.includes(l))];
  }, [items]);

  const shown = (items ?? []).filter(i => !only || i.language === only);

  return (
    <div className="modal-in vexplain">
      <button className="mclose" onClick={onClose} aria-label="Fermer">✕</button>
      <div className="msub">Comparer les traductions — {refLabel}</div>

      {items === null ? <p className="empty">Chargement des traductions…</p> :
       items.length === 0 ? <p className="empty">Aucune traduction disponible pour ce verset.</p> :
       <>
         {langs.length > 1 && (
           <div className="cmp-filter">
             <button className={`cmp-chip${!only ? ' on' : ''}`} onClick={() => setOnly(null)}>Toutes</button>
             {langs.map(l => (
               <button key={l} className={`cmp-chip${only === l ? ' on' : ''}`} onClick={() => setOnly(l)}>
                 {LANG_LABELS[l] ?? l}
               </button>
             ))}
           </div>
         )}
         <div className="cmp-list">
           {shown.map(it => (
             <div className="cmp-row" key={it.code}>
               <span className="cmp-name">{it.name}</span>
               <p className="cmp-text" dir={/^(he|ar)$/.test(it.language) ? 'rtl' : 'ltr'}>{it.text}</p>
             </div>
           ))}
         </div>
       </>}
    </div>
  );
}
