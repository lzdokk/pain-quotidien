'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SignIn from './SignIn';
import Brand from './Brand';

const TABS = [
  { href: '/',          label: 'Matin' },
  { href: '/priere',    label: 'Prière' },
  { href: '/soir',      label: 'Soir' },
  { href: '/lire',      label: 'Lire' },
  { href: '/paraboles', label: 'Apprendre', match: ['/paraboles', '/mots', '/versets', '/questions'] },
  // Lexique masque tant que la mise en francais n'est pas complete.
  // Pour le reactiver : remettre la ligne ci-dessous.
  // { href: '/lexique',   label: 'Lexique' },
  { href: '/cursus',    label: 'Cursus' }
  // Temoigner masque de la navigation (l'objection du jour a rejoint le pain
  // quotidien, en bas de la page d'accueil). La page /temoigner reste
  // accessible directement si besoin de la reactiver.
];

/* Icones de la barre mobile, une par onglet. */
const ICONS: Record<string, JSX.Element> = {
  '/': <path d="M12 3v2M5 12H3m18 0h-2M6 6 4.5 4.5M18 6l1.5-1.5M12 8a4 4 0 100 8 4 4 0 000-8zM4 20h16" />,
  '/priere': <path d="M12 3c-1.6 2.8-4.2 4.7-4.2 8a4.2 4.2 0 008.4 0c0-3.3-2.6-5.2-4.2-8z" />,
  '/temoigner': <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.4A8 8 0 1121 12z" />,
  '/soir': <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
  '/lire': <path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5zM12 6.5V19" />,
  '/mots': <path d="M7 8h10M7 12h6M5 4h14a1 1 0 011 1v11a1 1 0 01-1 1H9l-4 3V5a1 1 0 011-1z" />,
  '/versets': <path d="M12 3l2.09 4.26 4.7.68-3.4 3.32.8 4.68L12 13.9l-4.19 2.2.8-4.68-3.4-3.32 4.7-.68L12 3z" />,
  '/paraboles': <path d="M6 4h9a3 3 0 013 3v10a3 3 0 01-3 3H6a2 2 0 01-2-2V6a2 2 0 012-2zM9 9h6M9 13h6M9 17h3" />,
  '/lexique': <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2zM9 7h7M9 11h5" />,
  '/questions': <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  '/cursus': <path d="M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
};

export default function Nav({ user }: { user: any }) {
  const [sheet, setSheet] = useState(false);
  const path = usePathname();
  const initial = user?.user_metadata?.full_name?.[0] ?? user?.email?.[0] ?? '';
  const isActive = (t: { href: string; match?: string[] }) => {
    if (t.match) return t.match.some(m => path === m || path.startsWith(m + '/') || path.startsWith(m));
    return t.href === '/' ? path === '/' : path.startsWith(t.href);
  };

  const toggleMode = () => {
    const el = document.documentElement;
    const next = el.dataset.mode === 'soir' ? 'matin' : 'soir';
    el.dataset.mode = next;
    try { localStorage.setItem('pq-mode', next); } catch {}
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <Link href="/" className="brandmark">
            <Brand />
            <span>Le Pain quotidien</span>
          </Link>

          <div className="tabs" role="tablist">
            {TABS.map(t => (
              <Link key={t.href} href={t.href} className="tab" aria-selected={isActive(t)}>{t.label}</Link>
            ))}
          </div>

          <button className="icon-btn" onClick={toggleMode} aria-label="Matin ou soir">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.7" strokeLinecap="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></svg>
          </button>

          {user ? (
            <Link href="/compte" className="icon-btn avatar" aria-label="Mon compte">
              {initial.toUpperCase()}
            </Link>
          ) : (
            <button className="icon-btn" onClick={() => setSheet(true)} aria-label="Mon compte">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0115 0" />
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Barre d'onglets mobile, en bas comme une application */}
      <nav className="tabbar">
        {TABS.map(t => (
          <Link key={t.href} href={t.href} aria-current={isActive(t)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
                 strokeLinecap="round" strokeLinejoin="round">{ICONS[t.href]}</svg>
            <span>{t.label}</span>
          </Link>
        ))}
      </nav>

      {sheet && !user && (
        <div className="sheet on" onClick={e => { if (e.target === e.currentTarget) setSheet(false); }}>
          <div className="sheet-in"><SignIn /></div>
        </div>
      )}
    </>
  );
}
