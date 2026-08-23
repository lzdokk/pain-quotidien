'use client';
import { useEffect, useState } from 'react';

/**
 * Fenêtre de définition d'un code Strong (G26, H2617…).
 * Appelle /api/strongs?code=… qui renvoie l'entrée et génère la définition
 * française à la demande (puis la met en cache). Style CSS maison du projet.
 */
type Entry = {
  code: string; lang: string; lemma?: string | null; translit?: string | null;
  pronunciation?: string | null; definition_fr?: string | null; definition_en?: string | null;
};

export default function StrongModal({ code, onClose }: { code: string | null; onClose: () => void }) {
  const [data, setData] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code) { setData(null); return; }
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const r = await fetch(`/api/strongs?code=${encodeURIComponent(code)}`);
        const j = r.ok ? await r.json() : null;
        if (alive) setData(j);
      } catch { if (alive) setData(null); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [code]);

  if (!code) return null;

  return (
    <div className="sw-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sw-modal" role="dialog" aria-modal="true" aria-label={`Strong ${code}`}>
        <button className="sw-close" onClick={onClose} aria-label="Fermer">×</button>
        <div className="sw-code">{code} <span className="sw-lang">· {data?.lang ?? ''}</span></div>

        {loading && <p className="muted">Chargement…</p>}

        {data && !loading && (
          <>
            {(data.lemma || data.translit) && (
              <div className="sw-lemma">
                {data.lemma}
                {data.translit ? <span className="sw-translit"> · {data.translit}</span> : null}
              </div>
            )}
            {data.pronunciation && <div className="sw-pron">/{data.pronunciation}/</div>}
            <p className="sw-def">{data.definition_fr || data.definition_en || 'Définition indisponible.'}</p>
          </>
        )}

        {!data && !loading && <p className="muted">Entrée introuvable pour {code}.</p>}
      </div>
    </div>
  );
}
