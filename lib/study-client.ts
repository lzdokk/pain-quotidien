'use client';
/**
 * Bible d'étude côté navigateur : les données sont demandées UNE fois puis
 * gardées en mémoire pendant la visite (ouverture instantanée ensuite).
 */
export type StudyEntry = { slug: string; kind: 'theme' | 'personne' | 'lieu' | 'mot'; title: string; category: string; subcategory: string | null };
export type StudyList = {
  plan: StudyEntry[]; ready: Record<string, string>;
  sujets: Array<{ id: string; title: string; groups: string[] }>;
  renvois: Array<{ from: string; to: string; slug: string }>;
};

let listP: Promise<StudyList> | null = null;
export function getStudyList(): Promise<StudyList> {
  listP ??= fetch('/api/etude/list').then(r => r.json()).catch(() => { listP = null; return { plan: [], ready: {}, sujets: [], renvois: [] }; });
  return listP;
}

const ficheCache = new Map<string, Promise<any>>();
export function getFiche(slug: string): Promise<any> {
  if (!ficheCache.has(slug)) {
    ficheCache.set(slug, fetch(`/api/etude/fiche?slug=${encodeURIComponent(slug)}`)
      .then(r => (r.ok ? r.json() : null)).catch(() => null));
  }
  return ficheCache.get(slug)!;
}

const chapCache = new Map<string, Promise<Array<{ slug: string; title: string; kind: string; verses: number[] }>>>();
export function getChapterStudy(b: number, c: number) {
  const k = `${b}-${c}`;
  if (!chapCache.has(k)) {
    chapCache.set(k, fetch(`/api/etude/chapter?b=${b}&c=${c}`).then(r => r.json()).then(j => j.items ?? []).catch(() => []));
  }
  return chapCache.get(k)!;
}

export const kindLabel = (k: string) =>
  k === 'personne' ? 'Personnage' : k === 'lieu' ? 'Lieu' : k === 'mot' ? 'Mot hébreu' : 'Thème';
