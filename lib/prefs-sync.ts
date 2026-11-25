'use client';
import { getRemote, putRemote } from './etude-sync';
import { applyTheme, readTheme } from './theme';

/**
 * PERSONNALISATION SYNCHRONISÉE entre appareils (même compte) :
 * couleur, fonds jour/nuit, police, taille, fond de l'accueil, apparence de lecture.
 * Les photos personnelles restent sur l'appareil (trop lourdes).
 * Le réglage le plus récent gagne.
 */
const KEYS = { theme: 'pq-theme', homeBg: 'pq-home-bg', look: 'pq-look' } as const;
const T = 'pq-prefs-t';
let timer: any = null;

const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

/** À appeler après chaque changement de réglage. */
export function prefsChanged() {
  const t = Date.now();
  set(T, String(t));
  clearTimeout(timer);
  timer = setTimeout(() => {
    const body: any = { t };
    for (const [n, k] of Object.entries(KEYS)) { const v = get(k); if (v) body[n] = JSON.parse(v); }
    putRemote('prefs', JSON.stringify(body));
  }, 1200);
}

/** Récupère les réglages du compte s'ils sont plus récents que ceux de l'appareil. */
export async function pullPrefs() {
  const r = await getRemote('prefs');
  if (!r) return;
  try {
    const p = JSON.parse(r.body);
    const local = Number(get(T)) || 0;
    if (!p?.t || p.t <= local) {
      // L'appareil est plus récent (ou réglé avant la synchro) : on envoie ses réglages.
      if (local > (p?.t ?? 0)) prefsChanged();
      return;
    }
    if (p.theme) { set(KEYS.theme, JSON.stringify(p.theme)); applyTheme(readTheme()); }
    if (p.homeBg) {
      // Photo personnelle : elle n'existe que sur l'appareil où elle a été choisie.
      const bg = p.homeBg.mode === 'photo' && !get('pq-home-photo') ? { ...p.homeBg, mode: 'auto' } : p.homeBg;
      set(KEYS.homeBg, JSON.stringify(bg));
      window.dispatchEvent(new Event('pq-home-bg'));
    }
    if (p.look) {
      const lk = p.look.fond === 'photo' && !get('pq-look-photo') ? { ...p.look, fond: 'defaut' } : p.look;
      set(KEYS.look, JSON.stringify(lk));
      window.dispatchEvent(new Event('pq-look'));
    }
    set(T, String(p.t));
  } catch {}
}
