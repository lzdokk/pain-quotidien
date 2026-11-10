'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Les tuiles du jour, façon écran d'accueil d'iPhone : un toucher et l'on
 * est dans la bonne pièce. Les infos (chapitre des Proverbes, dernière
 * lecture) sont calculées dans le navigateur, toujours justes.
 */
const I = {
  priere: <path d="M12 3c-1.6 2.8-4.2 4.7-4.2 8a4.2 4.2 0 008.4 0c0-3.3-2.6-5.2-4.2-8z" />,
  sagesse: <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z" />,
  lire: <path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5zM12 6.5V19" />,
  etude: <path d="M4 5h11a3 3 0 013 3v11H7a3 3 0 01-3-3V5zM8 9h6M8 13h4M18 8h2v13H8" />,
  recits: <path d="M6 4h9a3 3 0 013 3v10a3 3 0 01-3 3H6a2 2 0 01-2-2V6a2 2 0 012-2zM9 9h6M9 13h6M9 17h3" />,
  cursus: <path d="M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
};

export default function TodayTiles() {
  const [ch, setCh] = useState<number | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  useEffect(() => {
    // Jour du mois, heure de Paris (bascule à 3 h comme le reste de l'app)
    const d = new Date(Date.now() - 3 * 3600_000);
    setCh(Number(new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric' }).format(d)));
    try { setResume(localStorage.getItem('pq-pos-ref')); } catch {}
  }, []);

  const tiles = [
    { href: '/priere', cls: 't-priere', ic: I.priere, t: 'Notre Père', s: 'Prier avec les mots du jour' },
    { href: '/sagesse', cls: 't-sagesse', ic: I.sagesse, t: 'Sagesse', s: ch ? `Proverbes ${ch}` : 'Proverbes du jour' },
    { href: '/lire', cls: 't-lire', ic: I.lire, t: 'Lire', s: resume ? `Reprendre ${resume}` : 'Ouvrir la Bible' },
    { href: '/lire?tab=etude', cls: 't-pain', ic: I.etude, t: 'Bible d’étude', s: 'Thèmes, personnages, mots' },
    { href: '/paraboles', cls: 't-recits', ic: I.recits, t: 'Récits', s: 'Théologie racontée' },
    { href: '/cursus', cls: 't-cursus', ic: I.cursus, t: 'Cursus', s: 'Se former' }
  ];

  return (
    <nav className="tiles" aria-label="Aujourd’hui">
      {tiles.map(x => (
        <Link key={x.href} href={x.href} prefetch className={`tile ${x.cls}`}>
          <span className="tile-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{x.ic}</svg>
          </span>
          <span>
            <span className="tile-t">{x.t}</span>
            <span className="tile-s" style={{ display: 'block' }}>{x.s}</span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
