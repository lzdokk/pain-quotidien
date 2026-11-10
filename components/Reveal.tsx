'use client';
import { useEffect } from 'react';

/**
 * Les blocs (tuiles, encadrés, volets, cartes) glissent en place quand ils
 * arrivent à l'écran, en légère cascade quand plusieurs arrivent ensemble.
 *
 * Un SEUL observateur pour toute la visite (jamais coupé en changeant de
 * page) : aucun bloc ne peut rester invisible. Les blocs ajoutés plus tard
 * (changement de page, lecteur, volets) sont suivis automatiquement.
 * Respecte « réduire les animations » (CSS).
 */
const SELECTOR = '.card, .hero, .home-head, .home-verse, .tile, h2.sect, .prayer, .rc-volet, .np-phase, .agenda-day, .cstudy, .page-tabs, .mode-switch, .to-pain';
const SKIP = '.rsheet, .rbubble, .vbar-inline, .sheet, .modal, .skel-page';

let started = false;

function start() {
  if (started || typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  started = true;

  const io = new IntersectionObserver(entries => {
    // Les blocs qui arrivent ensemble entrent l'un après l'autre.
    let i = 0;
    entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      .forEach(e => {
        const el = e.target as HTMLElement;
        el.style.setProperty('--rd', `${Math.min(i++, 6) * 70}ms`);
        el.classList.add('in');
        io.unobserve(el);
      });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });

  const prepare = (root: Element | Document) => {
    const list = Array.from(root.querySelectorAll(SELECTOR)) as HTMLElement[];
    if (root instanceof HTMLElement && root.matches(SELECTOR)) list.unshift(root);
    for (const el of list) {
      if (el.classList.contains('in') || el.closest(SKIP)) continue;
      el.classList.add('reveal');
      io.observe(el); // sans effet si déjà suivi
    }
  };

  prepare(document);
  new MutationObserver(muts => {
    for (const m of muts) m.addedNodes.forEach(n => { if (n.nodeType === 1) prepare(n as Element); });
  }).observe(document.body, { childList: true, subtree: true });

  // Filet de sécurité : rien ne reste caché plus de 2 secondes à l'écran.
  window.addEventListener('scroll', () => {
    const h = window.innerHeight;
    document.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < h && r.bottom > 0) setTimeout(() => el.classList.add('in'), 600);
    });
  }, { passive: true });
}

export default function Reveal() {
  useEffect(() => { start(); }, []);
  return null;
}
