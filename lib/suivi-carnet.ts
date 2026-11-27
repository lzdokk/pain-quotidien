'use client';
import { listRemote, putRemote, delRemote } from '@/lib/etude-sync';

/**
 * CARNET DE SUIVI : une entrée par méditation validée (bouton « Valider » de Méditer).
 * Gardé sur l'appareil, et synchronisé avec le compte (table notes, clé « ~etude:suivi:<id> »).
 */
export type EntreeSuivi = {
  id: string;
  t: number;                                  // date de validation (ms)
  parcours: { id: string; label: string };    // parcours suivi ce jour-là
  book: number; chapter: number; ref: string;  // « Romains 1 »
  versets: Array<[number, string]>;           // versets choisis, avec leur texte
  questions: string[];                        // réponses aux 6 questions
  etapes: { paraphraser: string; personnaliser: string; confesser: string; confesse: boolean; examiner: string; pratiquer: string };
};

const KEY = 'pq-suivi-carnet';
const DEL = 'pq-suivi-del';
const subs = new Set<() => void>();
const lireLocal = (): EntreeSuivi[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const ecrire = (l: EntreeSuivi[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(l.sort((a, b) => b.t - a.t))); } catch {}
  subs.forEach(f => f());
};
const supprimes = (): string[] => { try { return JSON.parse(localStorage.getItem(DEL) || '[]'); } catch { return []; } };

export const entrees = () => lireLocal().sort((a, b) => b.t - a.t);
export function abonner(f: () => void) { subs.add(f); return () => { subs.delete(f); }; }

export function ajouter(e: EntreeSuivi) {
  ecrire([e, ...lireLocal().filter(x => x.id !== e.id)]);
  putRemote('suivi:' + e.id, JSON.stringify(e));
}

export function supprimer(id: string) {
  ecrire(lireLocal().filter(x => x.id !== id));
  try { localStorage.setItem(DEL, JSON.stringify([...supprimes(), id].slice(-500))); } catch {}
  delRemote('suivi:' + id);
}

/** Fusion appareil ⇄ compte : on garde l'union, les entrées locales manquantes partent au compte. */
let enCours: Promise<void> | null = null;
export function synchroniser(): Promise<void> {
  if (enCours) return enCours;
  enCours = (async () => {
    const dist = await listRemote('suivi:');
    const del = new Set(supprimes());
    const parId = new Map<string, EntreeSuivi>();
    for (const r of dist) { try { const e = JSON.parse(r.body); if (e?.id && !del.has(e.id)) parId.set(e.id, e); } catch {} }
    const loc = lireLocal();
    const aEnvoyer = loc.filter(e => !parId.has(e.id));
    for (const e of loc) if (!del.has(e.id)) parId.set(e.id, e);
    ecrire([...parId.values()]);
    // Une entrée locale absente du compte y est envoyée (sans compte : rien ne part, tout reste ici).
    for (const e of aEnvoyer) await putRemote('suivi:' + e.id, JSON.stringify(e));
  })().finally(() => { enCours = null; });
  return enCours;
}

export const etiquetteVersets = (v: Array<[number, string]>) => {
  const n = v.map(x => x[0]).sort((a, b) => a - b);
  const out: string[] = [];
  for (let i = 0; i < n.length; i++) {
    let j = i; while (j + 1 < n.length && n[j + 1] === n[j] + 1) j++;
    out.push(j > i ? `${n[i]}-${n[j]}` : `${n[i]}`); i = j;
  }
  return out.join(', ');
};
