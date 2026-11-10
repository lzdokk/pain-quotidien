'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/** Les tuiles de l'accueil : une seule couleur, du verre, un toucher. */
const I: Record<string, JSX.Element> = {
  pain: <path d="M12 3v2M5 12H3m18 0h-2M6 6 4.5 4.5M18 6l1.5-1.5M12 8a4 4 0 100 8 4 4 0 000-8zM4 20h16" />,
  priere: <path d="M12 3c-1.6 2.8-4.2 4.7-4.2 8a4.2 4.2 0 008.4 0c0-3.3-2.6-5.2-4.2-8z" />,
  sagesse: <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z" />,
  lire: <path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5zM12 6.5V19" />,
  recits: <path d="M6 4h9a3 3 0 013 3v10a3 3 0 01-3 3H6a2 2 0 01-2-2V6a2 2 0 012-2zM9 9h6M9 13h6M9 17h3" />,
  cursus: <path d="M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
};

export default function HomeTiles({ theme }: { theme: string | null }) {
  const [ch, setCh] = useState<number | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date(Date.now() - 3 * 3600_000); // le jour bascule à 3 h, heure de Paris
    setCh(Number(new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric' }).format(d)));
    try { setResume(localStorage.getItem('pq-pos-ref')); } catch {}
  }, []);

  const tiles = [
    { href: '/pain', c: 'c-sand wide', ic: I.pain, t: 'Pain du jour', s: theme ?? 'La méditation du matin' },
    { href: '/priere', c: 'c-teal', ic: I.priere, t: 'Notre Père', s: 'Louange, adoration, intercession' },
    { href: '/sagesse', c: 'c-sage', ic: I.sagesse, t: 'Sagesse', s: ch ? `Proverbes ${ch}` : 'Proverbes du jour' },
    { href: '/lire', c: 'c-slate', ic: I.lire, t: 'Lire', s: resume ? `Reprendre ${resume}` : 'Bible et Bible d’étude' },
    { href: '/paraboles', c: 'c-rose', ic: I.recits, t: 'Récits', s: 'Théologie racontée' },
    { href: '/cursus', c: 'c-lav wide slim', ic: I.cursus, t: 'Cursus', s: 'Se former, pas à pas' }
  ];

  return (
    <nav className="tiles" aria-label="Menu">
      {tiles.map(x => (
        <Link key={x.href} href={x.href} prefetch className={`tile ${x.c}`}>
          <span className="tile-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{x.ic}</svg>
          </span>
          <span className="tile-txt">
            <span className="tile-t">{x.t}</span>
            <span className="tile-s">{x.s}</span>
          </span>
          <span className="tile-go" aria-hidden="true">›</span>
        </Link>
      ))}
    </nav>
  );
}
