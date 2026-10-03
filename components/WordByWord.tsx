'use client';
import { useEffect, useState } from 'react';

type W = {
  position: number; word: string; strong: string | null; gloss: string | null;
  gloss_fr: string | null; lang: string; translit: string | null; definition_fr: string | null;
};

/**
 * Mot-à-mot intuitif : le verset en francais, puis chaque mot d'origine avec sa
 * traduction francaise en avant (l'hebreu/grec + translitteration en dessous).
 * Un clic sur un mot ouvre son explication (lexique Strong).
 */
export default function WordByWord({ book, chapter, verse, frText, onClose }:
  { book: number; chapter: number; verse: number; frText?: string; onClose: () => void }) {
  const [words, setWords] = useState<W[] | null>(null);
  const [line, setLine] = useState('');
  const [complete, setComplete] = useState(true);
  // Nouveau Testament : hebreu (Delitzsch) par defaut, ou grec original.
  const [src, setSrc] = useState<'he' | 'grec'>('he');
  const nt = book >= 40;
  const [open, setOpen] = useState<number | null>(null);
  const [fr, setFr] = useState<Record<string, string>>({}); // code -> definition_fr

  useEffect(() => {
    let alive = true;
    (async () => {
      setWords(null); setOpen(null);
      const r = await fetch(`/api/verse-words?book=${book}&chapter=${chapter}&verse=${verse}${nt && src === 'grec' ? '&src=grec' : ''}`);
      const j = await r.json();
      if (alive) { setWords(j.words ?? []); setLine(j.line ?? ''); setComplete(j.complete !== false); }
    })();
    return () => { alive = false; };
  }, [book, chapter, verse, src]); // eslint-disable-line react-hooks/exhaustive-deps

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

      {nt && (
        <div className="wbw-src-pick">
          <button className={`cmp-chip${src === 'he' ? ' on' : ''}`} onClick={() => setSrc('he')}>Hébreu</button>
          <button className={`cmp-chip${src === 'grec' ? ' on' : ''}`} onClick={() => setSrc('grec')}>Grec (texte original)</button>
        </div>
      )}

      {frText && <p className="wbw-verse">« {frText} »</p>}
      {line && <p className="wbw-orig" dir={rtl ? 'rtl' : 'ltr'} lang={rtl ? 'he' : 'el'}>{line}</p>}

      {words === null ? <p className="empty">Chargement…</p> :
       words.length === 0 ? <p className="empty">Ce verset n&rsquo;a pas encore de données mot-à-mot.</p> :
       <>
         <p className="wbw-hint">
           {rtl ? 'Lecture de droite à gauche. ' : ''}Touchez un mot pour voir son explication.
           {!complete && ' Connectez-vous pour la traduction française complète mot à mot.'}
         </p>
         <div className={`wbw-line${rtl ? ' rtl' : ''}`}>
           {words.map(w => (
             <button key={w.position} className={`wbw-tok${open === w.position ? ' on' : ''}`}
                     onClick={() => openWord(w)}>
               <span className="wbw-fr">{w.gloss_fr || w.translit || w.gloss || w.word}</span>
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
             {(active.gloss_fr || active.gloss) &&
               <div className="wbw-gloss-big">{active.gloss_fr || active.gloss}</div>}
             {active.strong && (fr[active.strong] ?? active.definition_fr)
               ? <p>{fr[active.strong] || active.definition_fr}</p>
               : active.strong ? <p className="fine">Sens français en préparation…</p> : null}
           </div>
         )}
       </>}
    </div>
  );
}
