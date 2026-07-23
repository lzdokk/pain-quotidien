'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Apparition douce au defilement. Observe les blocs principaux et les revele
 * quand ils entrent dans le champ. Se relance a chaque changement de page.
 * Respecte prefers-reduced-motion via le CSS.
 */
const SELECTOR = '.card, .hero, h2.sect, .prayer, .agenda-day, .step, .entry';

export default function Reveal() {
  const path = usePathname();

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll(SELECTOR)) as HTMLElement[];
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

      const h = window.innerHeight;
      els.forEach(el => {
        if (el.classList.contains('reveal')) return;
        const rect = el.getBoundingClientRect();
        const alreadyVisible = rect.top < h * 0.92 && rect.bottom > 0;
        if (alreadyVisible) {
          // Deja a l'ecran au chargement : on l'affiche sans flash.
          el.classList.add('reveal', 'in');
        } else {
          el.classList.add('reveal');
          io.observe(el);
        }
      });
      (window as any).__pqReveal = io;
    });

    return () => {
      cancelAnimationFrame(raf);
      (window as any).__pqReveal?.disconnect?.();
    };
  }, [path]);

  return null;
}
