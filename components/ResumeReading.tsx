'use client';
import { useEffect, useState } from 'react';

/**
 * Banniere « Reprendre votre lecture » affichee sur la page d'accueil
 * (priere / soir). L'app se rouvre la ou l'utilisateur s'etait arrete :
 * on lit la derniere position memorisee par le lecteur (pq-pos-ref) et on
 * propose un lien direct pour y retourner.
 */
export default function ResumeReading() {
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    try {
      const r = localStorage.getItem('pq-pos-ref');
      if (r && r.trim()) setRef(r.trim());
    } catch {}
  }, []);

  if (!ref) return null;

  return (
    <a className="resume" href="/lire">
      <span className="resume-k">Reprendre votre lecture</span>
      <span className="resume-ref">{ref} ›</span>
    </a>
  );
}
