'use client';
import { useEffect, useState } from 'react';

type W = {
  position: number; word: string; strong: string | null; gloss: string | null;
  lang: string; translit: string | null; definition_fr: string | null;
};

/**
 * Mot-à-mot intuitif : le verset en francais, puis chaque mot d'origine avec sa
 * traduction francaise en avant (l'hebreu/grec + translitteration en dessous).
 * Un clic sur un mot ouvre son explication (lexique Strong).
 */
export default function WordByWord({ book, chapter, verse, frText, onClose }:
  { book: number; chapter: number; verse: number; frText?: string; onClose: () => void }) {
  const [words, setWords] = useState<W[] | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [fr, setFr] = useState<Record<string, string>>({}); // code -> definition_fr

  useEffect(() => {
    let alive = true;
    (async () => {
      const r = await fetch(`/api/verse-words?book=${book}&chapter=${chapter}&verse=${verse}`);
      const j = await r.json();
      if (alive) setWords(j.words ?? []);
    })();
    return () => { alive = false; };
  }, [book, chapter, verse]);

  const rtl = (words?.[0]?.lang) === 'hebreu';

  const openWord = async (w: W) => {
    if (open === w.position) { setOpen(null); return; }
    setOpen(w.position);
    if (w.strong && fr[w.strong] === undefined) {
      if (w.definition_fr) {
        setFr(m => ({ ...m, [w.strong!]: w.definition_fr! }));
      } else {
        try {
          const r = await fetch(`/api/strongs?code=${w.strong}`);
          if (r.ok) { const d = await r.json(); setFr(m => ({ ...m, [w.strong!]: d.definition_fr || '' })); }
        } catch { /* ignore */ }
      }
    }
  };

  const active = open !== null ? words?.find(w => w.position === open) : null;

  return (
    <div className="modal-in vexplain wbw">
      <button className="mclose" onClick={onClose} aria-label="Fermer">✕</button>
      <div className="msub">Mot à mot</div>

      {frText && <p className="wbw-verse">« {frText} »</p>}

      {words === null ? <p className="empty">Chargement…</p> :
       words.length === 0 ? <p className="empty">Ce verset n&rsquo;a pas encore de données mot-à-mot.</p> :
       <>
         <p className="wbw-hint">Touchez un mot pour voir son explication.</p>
         <div className={`wbw-line${rtl ? ' rtl' : ''}`}>
           {words.map(w => (
             <button key={w.position} className={`wbw-tok${open === w.position ? ' on' : ''}`}
                     onClick={() => openWord(w)}>
               <span className="wbw-fr">{w.gloss || w.translit || w.word}</span>
               <span className="wbw-src" dir={rtl ? 'rtl' : 'ltr'}>{w.word}</span>
             </button>
           ))}
         </div>

         {active && (
           <div className="wbw-detail">
             <span className="wbw-code">{active.strong ?? '—'} · {active.lang}</span>
             <div className="wbw-lemma" dir={rtl ? 'rtl' : 'ltr'}>
               {active.word}{active.translit ? ` — ${active.translit}` : ''}
             </div>
             {active.gloss && <div className="wbw-gloss-big">{active.gloss}</div>}
             {active.strong && (fr[active.strong] ?? active.definition_fr)
               ? <p>{fr[active.strong] || active.definition_fr}</p>
               : <p className="fine">Sens français en préparation…</p>}
           </div>
         )}
       </>}
    </div>
  );
}
