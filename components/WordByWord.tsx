'use client';
import { useEffect, useState } from 'react';

type W = {
  position: number; word: string; strong: string | null; gloss: string | null;
  lang: string; translit: string | null; definition_fr: string | null;
};

/**
 * Mot-à-mot d'un verset : chaque mot d'origine (hébreu/grec) cliquable ->
 * son sens français (lexique Strong). Affiché sous le verset dans le lecteur.
 */
export default function WordByWord({ book, chapter, verse, onClose }:
  { book: number; chapter: number; verse: number; onClose: () => void }) {
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
    if (w.strong && fr[w.strong] === undefined && w.definition_fr) {
      setFr(m => ({ ...m, [w.strong!]: w.definition_fr! }));
    } else if (w.strong && fr[w.strong] === undefined) {
      // Génère/charge le sens français à la demande (lexique Strong).
      try {
        const r = await fetch(`/api/strongs?code=${w.strong}`);
        if (r.ok) { const d = await r.json(); setFr(m => ({ ...m, [w.strong!]: d.definition_fr || '' })); }
      } catch { /* ignore */ }
    }
  };

  const active = open !== null ? words?.find(w => w.position === open) : null;

  return (
    <div className="modal-in vexplain wbw">
      <button className="mclose" onClick={onClose} aria-label="Fermer">✕</button>
      <div className="msub">Mot à mot</div>

      {words === null ? <p className="empty">Chargement…</p> :
       words.length === 0 ? <p className="empty">Ce verset n&rsquo;a pas encore de données mot-à-mot.</p> :
       <>
         <div className={`wbw-list${rtl ? ' rtl' : ''}`}>
           {words.map(w => (
             <button key={w.position} className={`wbw-chip${open === w.position ? ' on' : ''}`}
                     onClick={() => openWord(w)} dir={rtl ? 'rtl' : 'ltr'}>
               <span className="wbw-w">{w.word}</span>
               {w.translit && <span className="wbw-t">{w.translit}</span>}
               {w.gloss && <span className="wbw-g">{w.gloss}</span>}
             </button>
           ))}
         </div>

         {active && (
           <div className="wbw-detail">
             <span className="wbw-code">{active.strong ?? '—'} · {active.lang}</span>
             <div className="wbw-lemma" dir={rtl ? 'rtl' : 'ltr'}>
               {active.word}{active.translit ? ` — ${active.translit}` : ''}
             </div>
             {active.strong && (fr[active.strong] ?? active.definition_fr)
               ? <p>{fr[active.strong] || active.definition_fr}</p>
               : <p className="fine">
                   {active.gloss ? `« ${active.gloss} » — ` : ''}sens français en préparation…
                 </p>}
           </div>
         )}
       </>}
    </div>
  );
}
