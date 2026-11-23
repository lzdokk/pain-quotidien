'use client';
import { useCallback, useEffect, useState } from 'react';

/**
 * Progression des parcours d'étude, gardée sur l'appareil (aucune base).
 * { [idParcours]: [index d'étapes terminées] }
 */
const KEY = 'pq-etudier';

export function useProgression() {
  const [done, setDone] = useState<Record<string, number[]>>({});
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(KEY) ?? '{}')); } catch {}
  }, []);
  const toggle = useCallback((id: string, i: number) => {
    setDone(prev => {
      const cur = new Set(prev[id] ?? []);
      cur.has(i) ? cur.delete(i) : cur.add(i);
      const next = { ...prev, [id]: [...cur].sort((a, b) => a - b) };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);
  return { done, toggle };
}
