'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Les blocs s'ouvrent et se déroulent quand on arrive dessus : à l'ouverture
 * de la page (en cascade) puis au fil du défilement. Les blocs ajoutés plus
 * tard (lecteur, volets) sont pris en compte aussi.
 * Respecte « réduire les animations » (CSS).
 */
const SELECTOR = '.card, .hero, .home-head, .home-verse, .tile, h2.sect, .prayer, .rc-volet, .np-phase, .agenda-day, .step, .cstudy, .imp-it, .page-tabs, .mode-switch';

export default function Reveal() {
  const path = usePathname();

  useEffect(() => {
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    const prepare = (root: ParentNode) => {
      const els = Array.from(root.querySelectorAll(SELECTOR)) as HTMLElement[];
      if ((root as HTMLElement).matches?.(SELECTOR)) els.unshift(root as HTMLElement);
      const h = window.innerHeight;
      let i = 0;
      els.forEach(el => {
        if (el.classList.contains('reveal')) return;
        // Pas d'animation dans les feuilles et bulles (elles ont la leur).
        if (el.closest('.rsheet, .rbubble, .vbar-inline, .sheet, .modal')) return;
        el.classList.add('reveal');
        const r = el.getBoundingClientRect();
        if (r.top < h && r.bottom > 0) {
          // Déjà à l'écran : arrivée en cascade, très courte.
          el.style.setProperty('--rd', `${Math.min(i++, 8) * 55}ms`);
          requestAnimationFrame(() => el.classList.add('in'));
        } else {
          io.observe(el);
        }
      });
    };

    raf = requestAnimationFrame(() => prepare(document));
    const mo = new MutationObserver(muts => {
      for (const m of muts) m.addedNodes.forEach(n => { if (n.nodeType === 1) prepare(n as HTMLElement); });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { cancelAnimationFrame(raf); io.disconnect(); mo.disconnect(); };
  }, [path]);

  return null;
}
