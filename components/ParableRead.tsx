'use client';
import { useEffect } from 'react';

const KEY = 'pq-parables-read';

const readSet = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); }
  catch { return new Set(); }
};

/** Sur la fiche d'une parabole : marque cet episode comme lu (local, par appareil). */
export function MarkParableRead({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const s = readSet();
      if (!s.has(slug)) { s.add(slug); localStorage.setItem(KEY, JSON.stringify([...s])); }
    } catch { /* ignore */ }
  }, [slug]);
  return null;
}

/** Sur la liste des paraboles : surligne (classe .read) les episodes deja lus. */
export function ParableReadMarks() {
  useEffect(() => {
    try {
      const s = readSet();
      document.querySelectorAll<HTMLElement>('[data-parable]').forEach(el => {
        if (s.has(el.getAttribute('data-parable') || '')) el.classList.add('read');
      });
    } catch { /* ignore */ }
  }, []);
  return null;
}
