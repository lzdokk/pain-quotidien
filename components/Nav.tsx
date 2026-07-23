'use client';
import { useState } from 'react';
import Link from 'next/link';
import SignIn from './SignIn';
import Brand from './Brand';

const TABS = [
  { href: '/',          label: 'Matin' },
  { href: '/temoigner', label: 'Temoigner' },
  { href: '/soir',      label: 'Soir' },
  { href: '/lire',      label: 'Lire' },
  { href: '/questions', label: 'Questions' },
  { href: '/cursus',    label: 'Cursus' }
];

export default function Nav({ user }: { user: any }) {
  const [sheet, setSheet] = useState(false);

  const toggleMode = () => {
    const el = document.documentElement;
    const next = el.dataset.mode === 'soir' ? 'matin' : 'soir';
    el.dataset.mode = next;
    try { localStorage.setItem('pq-mode', next); } catch {}
  };

  const initial = user?.user_metadata?.full_name?.[0] ?? user?.email?.[0] ?? '';

  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <Link href="/" className="brandmark">
            <Brand />
            <span>Le Pain quotidien</span>
          </Link>

          <div className="tabs" role="tablist">
            {TABS.map(t => <Link key={t.href} href={t.href} className="tab">{t.label}</Link>)}
          </div>

          <button className="icon-btn" onClick={toggleMode} aria-label="Matin ou soir">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.7" strokeLinecap="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></svg>
          </button>

          <button className={`icon-btn${user ? ' avatar' : ''}`} onClick={() => setSheet(true)} aria-label="Mon compte">
            {user ? initial.toUpperCase() : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0115 0" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {sheet && (
        <div className="sheet on" onClick={e => { if (e.target === e.currentTarget) setSheet(false); }}>
          <div className="sheet-in"><SignIn user={user} /></div>
        </div>
      )}
    </>
  );
}
