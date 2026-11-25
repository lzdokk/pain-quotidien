'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';
import AiKeyButton from './AiKeyButton';
import { openTheme, ThemeButton } from './ThemeSheet';
import SignIn from './SignIn';
import Brand from './Brand';

const TABS = [
  { href: '/',          label: 'Accueil', c: 'c-slate' },
  { href: '/pain',      label: 'Pain',      c: 'c-sand', match: ['/pain', '/jour'] },
  { href: '/priere',    label: 'Prière',  c: 'c-teal' },
  { href: '/sagesse',   label: 'Sagesse', c: 'c-sage' },
  { href: '/lire',      label: 'Lire',    c: 'c-slate', match: ['/lire', '/etude', '/mots', '/versets'] }
];

/* Icones de la barre mobile, une par onglet. */
const ICONS: Record<string, JSX.Element> = {
  '/': <path d="M4 11.5 12 5l8 6.5V19a1 1 0 01-1 1h-4.5v-5h-5v5H5a1 1 0 01-1-1v-7.5z" />,
  '/pain': <path d="M12 3v2M5 12H3m18 0h-2M6 6 4.5 4.5M18 6l1.5-1.5M12 8a4 4 0 100 8 4 4 0 000-8zM4 20h16" />,
  '/priere': <path d="M12 3c-1.6 2.8-4.2 4.7-4.2 8a4.2 4.2 0 008.4 0c0-3.3-2.6-5.2-4.2-8z" />,
  '/temoigner': <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.4A8 8 0 1121 12z" />,
  '/soir': <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
  '/sagesse': <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z" />,
  '/lire': <path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5zM12 6.5V19" />,
  '/mots': <path d="M7 8h10M7 12h6M5 4h14a1 1 0 011 1v11a1 1 0 01-1 1H9l-4 3V5a1 1 0 011-1z" />,
  '/versets': <path d="M12 3l2.09 4.26 4.7.68-3.4 3.32.8 4.68L12 13.9l-4.19 2.2.8-4.68-3.4-3.32 4.7-.68L12 3z" />,
  '/paraboles': <path d="M6 4h9a3 3 0 013 3v10a3 3 0 01-3 3H6a2 2 0 01-2-2V6a2 2 0 012-2zM9 9h6M9 13h6M9 17h3" />,
  '/lexique': <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2zM9 7h7M9 11h5" />,
  '/questions': <path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  '/cursus': <path d="M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
};

/* Titre affiché au centre de la barre, selon la page. */
const TITLES: Array<[string, string]> = [
  ['/pain', 'Pain du jour'], ['/jour', 'Pain du jour'], ['/jours', 'Les jours'], ['/priere', 'Prière'],
  ['/sagesse', 'Sagesse'], ['/lire', ''], ['/etude', 'Bible d’étude'], ['/paraboles', 'Récits'],
  ['/fondements', 'Récits'], ['/questions', 'Récits'], ['/cursus', 'Cursus'], ['/compte', 'Mon profil'],
  ['/surlignes', 'Mes versets'], ['/temoigner', 'Témoigner'], ['/installer', 'Installer']
];

export default function Nav(_props: { user?: any }) {
  const user = useUser();
  const [sheet, setSheet] = useState(false);
  const path = usePathname();

  // Jour choisi (Pain ou Prière d'un autre jour) : les onglets Pain et Prière
  // restent sur CE jour, pour prier avec le thème du jour sélectionné.
  const [selDay, setSelDay] = useState<string | null>(null);
  useEffect(() => {
    const m = path.match(/^\/(jour|priere)\/(\d{4}-\d{2}-\d{2})$/);
    try {
      if (m) { sessionStorage.setItem('pq-day', m[2]); setSelDay(m[2]); }
      else if (path === '/pain' || path === '/priere') { sessionStorage.removeItem('pq-day'); setSelDay(null); }
      else setSelDay(sessionStorage.getItem('pq-day'));
    } catch { setSelDay(m ? m[2] : null); }
  }, [path]);
  // Bouton retour : revient à la page précédente de l'app (sinon à l'accueil).
  const router = useRouter();
  const [canBack, setCanBack] = useState(false);
  // Accueil : barre transparente tant que le grand verset du jour est à l'écran.
  const [over, setOver] = useState(false);
  useEffect(() => {
    if (path !== '/') { setOver(false); return; }
    const on = () => setOver(window.scrollY < window.innerHeight * 0.72);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [path]);
  useEffect(() => {
    try {
      const st: string[] = JSON.parse(sessionStorage.getItem('pq-hist') || '[]');
      if (st[st.length - 2] === path) st.pop();          // on vient de revenir en arrière
      else if (st[st.length - 1] !== path) st.push(path); // nouvelle page
      sessionStorage.setItem('pq-hist', JSON.stringify(st.slice(-30)));
      setCanBack(st.length > 1);
    } catch { setCanBack(false); }
  }, [path]);
  const goBack = (e: React.MouseEvent) => {
    if (!canBack) return;           // pas d'historique : le lien mène à l'accueil
    e.preventDefault();
    router.back();
  };
  const tabHref = (h: string) => !selDay ? h : h === '/pain' ? `/jour/${selDay}` : h === '/priere' ? `/priere/${selDay}` : h;
  const initial = user?.user_metadata?.full_name?.[0] ?? user?.email?.[0] ?? '';
  const isActive = (t: { href: string; match?: string[] }) => {
    if (t.match) return t.match.some(m => path === m || path.startsWith(m + '/'));
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
      <nav className={`nav${over ? ' over' : ''}`}>
        <div className="nav-in">
          {path === '/' ? (
            <Link href="/" className="brandmark">
              <Brand />
              <span>Pain de Vie</span>
            </Link>
          ) : (
            <Link href="/" className="nav-back" onClick={goBack} aria-label={canBack ? 'Revenir à la page précédente' : 'Retour à l’accueil'}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
              <span>{canBack ? 'Retour' : 'Accueil'}</span>
            </Link>
          )}

          <span className="nav-title">{TITLES.find(([p]) => path === p || path.startsWith(p + '/'))?.[1] ?? ''}</span>

          {path === '/' && (
            <button className="icon-btn th-open" onClick={openTheme} aria-label="Personnaliser l’app">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a9 9 0 100 18c1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.9.7-1.6 1.6-1.6H16a5 5 0 005-5C21 6.6 17 3 12 3z" />
                <circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7.5" r="1" /><circle cx="14.5" cy="7.5" r="1" />
              </svg>
            </button>
          )}
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

          {/* Emplacement reserve a la page (ex. Lire : livre · version · v.),
              rempli par un portail React ; invisible quand il est vide. */}
          <div id="nav-slot" className="nav-slot" />

        </div>
      </nav>

      {/* Barre d'onglets en bas : îlot de verre flottant */}
      <nav className="tabbar" aria-label="Navigation">
        {TABS.map(t => (
          <Link key={t.href} href={tabHref(t.href)} prefetch className={t.c} aria-current={isActive(t)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                 strokeLinecap="round" strokeLinejoin="round">{ICONS[t.href]}</svg>
            <span>{t.label}</span>
          </Link>
        ))}
      </nav>

      {sheet && !user && (
        <div className="sheet on" onClick={e => { if (e.target === e.currentTarget) setSheet(false); }}>
          <div className="sheet-in"><SignIn /><div style={{ marginTop: 14 }}><AiKeyButton compact /></div><div style={{ marginTop: 10 }}><ThemeButton /></div></div>
        </div>
      )}
    </>
  );
}
