'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Memorise la derniere page consultee pour que l'accueil puisse « reprendre la
 * ou on s'etait arrete ». On n'enregistre que les pages de contenu (pas
 * l'accueil, ni le compte ou l'installation), avec un horodatage : au-dela de
 * 12 h, l'accueil retombe sur le pain du jour.
 */
const SKIP = ['/', '/compte', '/installer'];

export default function RouteMemory() {
  const path = usePathname();
  useEffect(() => {
    try {
      if (!path || SKIP.includes(path)) return;
      localStorage.setItem('pq-resume', JSON.stringify({ path, at: Date.now() }));
    } catch {}
  }, [path]);
  return null;
}
