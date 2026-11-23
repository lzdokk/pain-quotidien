'use client';
import { useCallback, useEffect, useState } from 'react';
import { getRemote, putRemote } from '@/lib/etude-sync';
import { chapitresEtape, parcoursById, resoudreEtape, type Parcours } from '@/lib/parcours';

/**
 * SUIVI UNIQUE (gardé sur l'appareil, aucune base) :
 *  - actif : le parcours d'étude suivi (affiché en haut de Lire > Parcours)
 *  - lus   : chapitres lus par livre   { "43": [1,2,3] }
 *  - done  : étapes cochées à la main  { "premiers-pas": [0,2] }
 */
type S = { actif: string | null; done: Record<string, number[]>; lus: Record<string, number[]>; t?: number };
const KEY = 'pq-suivi', OLD = 'pq-etudier';
const VIDE: S = { actif: null, done: {}, lus: {} };
let cache: S | null = null;
const subs = new Set<() => void>();

function load(): S {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    const old = JSON.parse(localStorage.getItem(OLD) ?? '{}');
    cache = { actif: raw?.actif ?? null, done: raw?.done ?? old, lus: raw?.lus ?? {}, t: raw?.t ?? 0 };
  } catch { cache = { ...VIDE }; }
  return cache!;
}
let pushTimer: ReturnType<typeof setTimeout> | null = null;
const persist = (n: S) => { try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} };
const vide = (n: S) => !n.actif && !Object.values(n.done).some(a => a.length) && !Object.values(n.lus).some(a => a.length);

function save(n: S) {
  cache = { ...n, t: Date.now() };
  persist(cache);
  subs.forEach(f => f());
  // envoi groupé vers le compte (synchro entre appareils)
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => { if (cache) putRemote('suivi', JSON.stringify(cache)); }, 700);
}

let lastSync = 0;
/** Récupère le suivi du compte : le plus récent gagne (appareil ou serveur). */
export async function syncSuivi(force = false) {
  if (!force && Date.now() - lastSync < 15000) return;
  lastSync = Date.now();
  const r = await getRemote('suivi');
  const cur = load();
  if (r) {
    try {
      const rs = JSON.parse(r.body) as S;
      const rt = rs.t ?? r.t;
      if (rt > (cur.t ?? 0)) {
        cache = { actif: rs.actif ?? null, done: rs.done ?? {}, lus: rs.lus ?? {}, t: rt };
        persist(cache);
        subs.forEach(f => f());
        return;
      }
      if ((cur.t ?? 0) > rt) putRemote('suivi', JSON.stringify(cur));
    } catch {}
  } else if (!vide(cur)) {
    putRemote('suivi', JSON.stringify({ ...cur, t: cur.t || Date.now() }));
  }
}

export type EtapeEtat = {
  i: number; label: string; book: number; chapters: number[];
  lus: number; complete: boolean; prochain: number;
};

/** État des étapes d'un parcours d'étude d'après les chapitres lus et les cases cochées. */
export function etatParcours(p: Parcours, s: S): { etapes: EtapeEtat[]; courant: number; faites: number } {
  const etapes: EtapeEtat[] = [];
  p.etapes.forEach((label, i) => {
    const r = resoudreEtape(label);
    if (!r) return;
    const ci = chapitresEtape(label);
    const chapters = ci && ci.chapters.length ? ci.chapters : [r.chapter ?? 1];
    const lusLivre = new Set(s.lus[String(r.book)] ?? []);
    const lus = chapters.filter(c => lusLivre.has(c)).length;
    const manuel = (s.done[p.id] ?? []).includes(i);
    const complete = manuel || lus === chapters.length;
    const prochain = chapters.find(c => !lusLivre.has(c)) ?? chapters[0];
    etapes.push({ i, label, book: r.book, chapters, lus, complete, prochain });
  });
  const courant = etapes.findIndex(e => !e.complete);
  return { etapes, courant, faites: etapes.filter(e => e.complete).length };
}

export function useSuivi() {
  const [s, setS] = useState<S>(VIDE);
  useEffect(() => {
    const f = () => setS(load());
    f();
    subs.add(f);
    syncSuivi();
    const vis = () => { if (document.visibilityState === 'visible') syncSuivi(); };
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('focus', vis);
    const st = (e: StorageEvent) => { if (e.key === KEY) { cache = null; f(); } };
    window.addEventListener('storage', st);
    return () => { subs.delete(f); window.removeEventListener('storage', st); document.removeEventListener('visibilitychange', vis); window.removeEventListener('focus', vis); };
  }, []);

  const setActif = useCallback((id: string | null) => save({ ...load(), actif: id }), []);
  const lire = useCallback((book: number, ch: number, lu = true) => {
    const cur = load(); const k = String(book);
    const set = new Set(cur.lus[k] ?? []);
    lu ? set.add(ch) : set.delete(ch);
    save({ ...cur, lus: { ...cur.lus, [k]: [...set].sort((a, b) => a - b) } });
  }, []);
  const toggleEtape = useCallback((id: string, i: number) => {
    const cur = load(); const p = parcoursById(id);
    const set = new Set(cur.done[id] ?? []);
    const e = p ? etatParcours(p, cur).etapes.find(x => x.i === i) : undefined;
    if (e?.complete) {
      // décocher : on retire aussi les chapitres lus de cette étape
      set.delete(i);
      const k = String(e.book);
      const lus = new Set(cur.lus[k] ?? []);
      e.chapters.forEach(c => lus.delete(c));
      save({ ...cur, done: { ...cur.done, [id]: [...set] }, lus: { ...cur.lus, [k]: [...lus].sort((a, b) => a - b) } });
    } else {
      set.add(i);
      save({ ...cur, done: { ...cur.done, [id]: [...set].sort((a, b) => a - b) } });
    }
  }, []);
  /** Remet à zéro les étapes d'un parcours à partir de l'étape `from` (0 = tout le parcours). */
  const reprendre = useCallback((id: string, from = 0) => {
    const cur = load(); const p = parcoursById(id);
    if (!p) return;
    const { etapes } = etatParcours(p, cur);
    const aReset = etapes.filter(e => e.i >= from);
    const done = new Set((cur.done[id] ?? []).filter(i => i < from));
    const lus = { ...cur.lus };
    aReset.forEach(e => {
      const k = String(e.book);
      const set = new Set(lus[k] ?? []);
      e.chapters.forEach(c => set.delete(c));
      lus[k] = [...set].sort((a, b) => a - b);
    });
    save({ ...cur, done: { ...cur.done, [id]: [...done].sort((a, b) => a - b) }, lus });
  }, []);
  /** Remet un livre à zéro : plus aucun chapitre lu. */
  const resetLivre = useCallback((book: number) => {
    const cur = load();
    save({ ...cur, lus: { ...cur.lus, [String(book)]: [] } });
  }, []);
  const estLu = useCallback((book: number, ch: number) => (s.lus[String(book)] ?? []).includes(ch), [s]);
  return { ...s, setActif, lire, toggleEtape, reprendre, resetLivre, estLu };
}
