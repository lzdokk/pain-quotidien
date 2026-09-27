'use client';
import { ReactNode, useEffect, useState } from 'react';

/**
 * Onglets internes d'une page (Prière : Prier / Notre Père).
 * Le contenu de chaque onglet est rendu cote serveur et passe en enfant ;
 * on memorise le dernier onglet ouvert sur l'appareil.
 */
export default function PageTabs({ id, tabs }: {
  id: string;
  tabs: Array<{ key: string; label: string; content: ReactNode }>;
}) {
  const [cur, setCur] = useState(tabs[0]?.key);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`pq-tab-${id}`);
      if (saved && tabs.some(t => t.key === saved)) setCur(saved);
    } catch {}
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (k: string) => {
    setCur(k);
    try { localStorage.setItem(`pq-tab-${id}`, k); } catch {}
  };

  return (
    <>
      <div className="page-tabs" role="tablist">
        {tabs.map(t => (
          <button key={t.key} role="tab" className="page-tab"
                  aria-selected={t.key === cur} onClick={() => pick(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map(t => (
        <div key={t.key} role="tabpanel" hidden={t.key !== cur}>{t.content}</div>
      ))}
    </>
  );
}
