'use client';
import { useEffect, useState } from 'react';
import InstallGuide from './InstallGuide';

/**
 * Popup d'installation affiché automatiquement à la première visite sur
 * mobile (iPhone / Android), si l'app n'est pas déjà installée et n'a pas
 * été refusée. Rejet mémorisé dans localStorage.
 */
export default function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const ua = navigator.userAgent || '';
      const isMobile = /iphone|ipad|ipod|android/i.test(ua);
      const standalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      if (!isMobile || standalone) return;
      if (localStorage.getItem('pq-install-dismissed')) return;
      const t = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(t);
    } catch { /* ignore */ }
  }, []);

  if (!show) return null;

  const close = (remember: boolean) => {
    setShow(false);
    if (remember) { try { localStorage.setItem('pq-install-dismissed', '1'); } catch { /* ignore */ } }
  };

  return (
    <div className="install-ov" onClick={() => close(false)}>
      <div className="install-modal" onClick={(e) => e.stopPropagation()}>
        <button className="install-x" onClick={() => close(true)} aria-label="Fermer">×</button>
        <div className="install-title">Installer Pain de Vie</div>
        <p className="install-lead">Ajoute l'app à ton téléphone pour la retrouver en un geste et recevoir les rappels.</p>
        <InstallGuide compact />
        <button className="install-later" onClick={() => close(true)}>Plus tard</button>
      </div>
    </div>
  );
}
