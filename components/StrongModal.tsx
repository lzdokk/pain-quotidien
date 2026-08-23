'use client';
import { useEffect, useState } from 'react';

export type StrongData = {
  code: string;
  lang: string;
  lemma: string | null;
  translit: string | null;
  pronunciation: string | null;
  definition_fr: string | null;
  definition_en: string | null;
  derivation: string | null;
  kjv_def: string | null;
};

/**
 * Modale lexique Strong : mot original, translittération et définition.
 * La définition française est produite à la demande via /api/strongs.
 */
export default function StrongModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [entry, setEntry] = useState<StrongData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/strongs?code=${encodeURIComponent(code)}`);
        if (r.ok && alive) setEntry(await r.json());
      } catch { /* ignore */ }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [code]);

  const rtl = entry?.lang === 'hebreu';

  return (
    <div className="strong-backdrop" onClick={onClose} role="presentation">
      <div className="strong-modal" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="strong-title">
        <button className="mclose" onClick={onClose} aria-label="Fermer">✕</button>

        {loading ? <p className="empty">Chargement du lexique…</p> :
         !entry ? <p className="empty">Entrée Strong introuvable ({code}).</p> :
         <>
           <div className="msub">{entry.lang} · {entry.code}</div>
           <h3 id="strong-title" dir={rtl ? 'rtl' : 'ltr'}>{entry.lemma ?? code}</h3>
           {entry.translit && <p className="muted" style={{ fontSize: 15 }}>{entry.translit}</p>}

           {entry.definition_fr ? (
             <>
               <h4>Le sens</h4>
               <p>{entry.definition_fr}</p>
             </>
           ) : (
             <p className="fine" style={{ marginTop: 12 }}>
               Définition française en préparation…
             </p>
           )}

           {entry.derivation && (
             <>
               <h4>Étymologie</h4>
               <p style={{ color: 'var(--ink-2)' }}>{entry.derivation}</p>
             </>
           )}

           {entry.definition_en && (
             <>
               <h4>Définition de Strong</h4>
               <p style={{ color: 'var(--ink-3)', fontSize: 14.5 }}>{entry.definition_en}</p>
             </>
           )}

           {entry.kjv_def && (
             <p className="fine" style={{ marginTop: 12 }}>Traduit par : {entry.kjv_def}</p>
           )}
         </>}
      </div>
    </div>
  );
}
