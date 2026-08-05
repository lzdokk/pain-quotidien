'use client';
import { useState } from 'react';

/**
 * Partage natif (Web Share API) : sur mobile/app, ouvre la feuille de partage
 * système (WhatsApp, SMS, mail…). Sur desktop sans partage natif, copie le lien.
 * Partage le texte + le lien. (Le partage image viendra dans un second temps.)
 */
export default function ShareButton({ title, text, url, label = 'Partager', className = 'btn sm' }:
  { title?: string; text?: string; url?: string; label?: string; className?: string }) {
  const [done, setDone] = useState<'' | 'copied'>('');

  const share = async () => {
    const link = url || (typeof window !== 'undefined' ? window.location.href : '');
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    if (nav?.share) {
      try {
        await nav.share({ title: title || 'Le Pain quotidien', text: text || undefined, url: link });
        return;
      } catch { /* annulé ou indisponible → repli copie */ }
    }
    try {
      await nav?.clipboard?.writeText(text ? `${text}\n${link}` : link);
      setDone('copied'); setTimeout(() => setDone(''), 1800);
    } catch { /* ignore */ }
  };

  return (
    <button className={className} onClick={share} aria-label="Partager">
      {done === 'copied' ? 'Lien copié ✓' : label}
    </button>
  );
}
