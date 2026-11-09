'use client';
import { useEffect, useMemo, useState } from 'react';
import RefChip from './RefChip';
import { bookAbbr } from '@/lib/bible-books';

type W = {
  position: number; word: string; strong: string | null; gloss: string | null;
  gloss_fr: string | null; lang: string; translit: string | null; definition_fr: string | null;
};
type Usage = { count: number; refs: Array<{ b: number; c: number; v: number }>; renderings: Array<{ fr: string; n: number }> };
type Entry = { code: string; lang: string; lemma?: string | null; translit?: string | null; pronunciation?: string | null; definition_fr?: string | null; usage?: Usage };

// Mots francais trop courants pour etre relies a un mot d'origine.
const STOP = new Set(('le la les un une des de du d l a au aux et ou en dans par pour sur avec sans ce cet cette ces se sa son ses ' +
  'mon ma mes ton ta tes leur leurs nous vous ils elles il elle on qui que quoi dont ne pas plus est sont etait ete etre ' +
  'y lui eux me te tu je j m t s n c qu si car mais donc or ni').split(' '));
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const stem = (s: string) => norm(s).slice(0, Math.min(5, Math.max(3, s.length - 1)));

// Fiches Strong deja ouvertes (gardees pendant la visite : reouverture instantanee).
const entryCache = new Map<string, Entry>();

/**
 * STRONG · MOT A MOT
 * 1. Le verset en français : chaque mot relié au texte d'origine est souligné ;
 *    on le touche, et sa fiche Strong s'ouvre.
 * 2. Le texte d'origine (hébreu / grec), mot par mot, avec sa traduction.
 * 3. La fiche du mot : forme d'origine, prononciation, sens, comment il est
 *    traduit ailleurs, et les autres passages où il apparaît (un toucher les lit).
 */
export default function WordByWord({ book, chapter, verse, frText, prefer, onClose }:
  { book: number; chapter: number; verse: number; frText?: string; prefer?: 'he' | 'grec'; onClose: () => void }) {
  const nt = book >= 40;
  const [words, setWords] = useState<W[] | null>(null);
  const [line, setLine] = useState('');
  const [complete, setComplete] = useState(true);
  // Nouveau Testament : les numéros Strong existent sur le grec original.
  const [src, setSrc] = useState<'he' | 'grec'>(prefer ?? 'he');
  const [open, setOpen] = useState<number | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [allRefs, setAllRefs] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setWords(null); setOpen(null); setEntry(null);
      try {
        const r = await fetch(`/api/verse-words?book=${book}&chapter=${chapter}&verse=${verse}${nt && src === 'grec' ? '&src=grec' : ''}`);
        const j = await r.json();
        if (alive) { setWords(j.words ?? []); setLine(j.line ?? ''); setComplete(j.complete !== false); }
      } catch { if (alive) setWords([]); }
    })();
    return () => { alive = false; };
  }, [book, chapter, verse, src]); // eslint-disable-line react-hooks/exhaustive-deps

  const rtl = (words?.[0]?.lang) === 'hebreu';
  const active = open !== null ? words?.find(w => w.position === open) ?? null : null;

  // Le verset français découpé en mots, chacun relié (si possible) au mot d'origine.
  const frTokens = useMemo(() => {
    if (!frText) return [];
    const parts = frText.split(/([\s,.;:!?«»"()\-–—]+|['’])/);
    const glosses = (words ?? []).map(w => ({
      pos: w.position,
      stems: norm(`${w.gloss_fr ?? ''}`).split(/[^a-z0-9]+/).filter(t => t.length >= 3 && !STOP.has(t)).map(t => stem(t))
    }));
    return parts.map(p => {
      const n = norm(p);
      if (!/[a-z]/.test(n) || n.length < 3 || STOP.has(n)) return { t: p, pos: null as number | null };
      const st = stem(p);
      const hit = glosses.find(g => g.stems.some(s => s === st || (s.length >= 4 && st.startsWith(s)) || (st.length >= 4 && s.startsWith(st))));
      return { t: p, pos: hit ? hit.pos : null };
    });
  }, [frText, words]);
  const linked = frTokens.filter(t => t.pos !== null).length;

  const openWord = async (pos: number) => {
    if (open === pos) { setOpen(null); setEntry(null); return; }
    setOpen(pos); setAllRefs(false);
    const w = words?.find(x => x.position === pos);
    if (!w?.strong) { setEntry(null); return; }
    const hit = entryCache.get(w.strong);
    if (hit) { setEntry(hit); return; }
    setEntry(null); setLoadingEntry(true);
    try {
      const r = await fetch(`/api/strongs?code=${encodeURIComponent(w.strong)}&usage=1`);
      if (r.ok) { const d = await r.json(); entryCache.set(w.strong, d); setEntry(d); }
    } catch { /* fiche indisponible */ }
    setLoadingEntry(false);
  };

  const refLabel = (r: { b: number; c: number; v: number }) => `${bookAbbr(r.b)} ${r.c}.${r.v}`;
  const shownRefs = entry?.usage?.refs.filter(r => !(r.b === book && r.c === chapter && r.v === verse)) ?? [];

  return (
    <div className="modal-in vexplain wbw">
      <button className="mclose" onClick={onClose} aria-label="Fermer">✕</button>
      <div className="msub">Strong · mot à mot</div>

      {nt && (
        <div className="wbw-src-pick">
          <button className={`cmp-chip${src === 'grec' ? ' on' : ''}`} onClick={() => setSrc('grec')}>Grec original · Strong</button>
          <button className={`cmp-chip${src === 'he' ? ' on' : ''}`} onClick={() => setSrc('he')}>Hébreu (Delitzsch)</button>
        </div>
      )}

      {words === null ? <p className="empty">Chargement…</p> :
       words.length === 0 ? <p className="empty">Ce verset n&rsquo;a pas encore de données mot à mot.</p> :
       <>
         {/* 1. Le verset français : toucher un mot souligné */}
         {frText && (
           <p className="wbw-verse sx-verse">
             {frTokens.map((t, i) => t.pos !== null
               ? <button key={i} className={`sx-w${open === t.pos ? ' on' : ''}`} onClick={() => openWord(t.pos!)}>{t.t}</button>
               : <span key={i}>{t.t}</span>)}
           </p>
         )}
         <p className="wbw-hint">
           {frText && linked > 0 ? 'Touchez un mot souligné, ou un mot d’origine ci-dessous. '
             : 'Touchez un mot d’origine pour ouvrir sa fiche. '}
           {rtl ? 'L’hébreu se lit de droite à gauche.' : ''}
           {!complete && ' Connectez-vous pour la traduction française complète.'}
         </p>

         {/* 2. Le texte d'origine, mot par mot */}
         {line && <p className="wbw-orig" dir={rtl ? 'rtl' : 'ltr'} lang={rtl ? 'he' : 'el'}>{line}</p>}
         <div className={`wbw-line${rtl ? ' rtl' : ''}`}>
           {words.map(w => (
             <button key={w.position} className={`wbw-tok${open === w.position ? ' on' : ''}${w.strong ? ' has' : ''}`}
                     onClick={() => openWord(w.position)}>
               <span className="wbw-fr">{w.gloss_fr || w.translit || w.gloss || w.word}</span>
               <span className="wbw-src" dir={rtl ? 'rtl' : 'ltr'}>{w.word}</span>
             </button>
           ))}
         </div>

         {/* 3. La fiche du mot */}
         {active && (
           <div className="sx-card">
             <div className="sx-top">
               <div className="sx-word" dir={rtl ? 'rtl' : 'ltr'} lang={rtl ? 'he' : 'el'}>{entry?.lemma || active.word}</div>
               <div className="sx-sub">
                 {(entry?.translit || active.translit) && <span className="sx-tr">{entry?.translit || active.translit}</span>}
                 {entry?.pronunciation && <span className="sx-pr">/{entry.pronunciation}/</span>}
               </div>
               {(active.gloss_fr || active.gloss) && <div className="sx-gloss">« {active.gloss_fr || active.gloss} » <small>ici</small></div>}
               <span className="sx-code">{active.strong ? `Strong ${active.strong}` : 'sans numéro Strong'} · {active.lang === 'hebreu' ? 'hébreu' : 'grec'}</span>
             </div>

             {!active.strong && nt && src === 'he' && (
               <p className="fine">La traduction hébraïque du Nouveau Testament n&rsquo;a pas de numéros Strong.{' '}
                 <a className="sx-link" onClick={() => setSrc('grec')}>Voir le grec original ›</a></p>
             )}
             {active.strong && loadingEntry && <p className="fine">Ouverture de la fiche…</p>}

             {entry && (
               <>
                 <div className="sx-k">Le sens</div>
                 <p className="sx-def">{entry.definition_fr || active.definition_fr || 'Sens français en préparation…'}</p>

                 {entry.usage && entry.usage.renderings.length > 1 && (
                   <>
                     <div className="sx-k">Aussi traduit par</div>
                     <div className="sx-rend">
                       {entry.usage.renderings.map(r => <span key={r.fr}>{r.fr}<small>{r.n}</small></span>)}
                     </div>
                   </>
                 )}

                 {entry.usage && entry.usage.count > 0 && (
                   <>
                     <div className="sx-k">Ce mot dans la Bible · {entry.usage.count} fois</div>
                     <div className="sx-refs">
                       {(allRefs ? shownRefs : shownRefs.slice(0, 12)).map(r =>
                         <RefChip key={`${r.b}-${r.c}-${r.v}`} r={refLabel(r)} />)}
                       {!allRefs && shownRefs.length > 12 && (
                         <button className="refchip sx-more" onClick={() => setAllRefs(true)}>+ {shownRefs.length - 12}</button>
                       )}
                     </div>
                   </>
                 )}
               </>
             )}
           </div>
         )}
       </>}
    </div>
  );
}
