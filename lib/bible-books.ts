/**
 * LES 66 LIVRES CLASSES PAR GRANDES FAMILLES
 * Ancienne Alliance (Tanakh) puis Nouvelle Alliance (Brit Hadachah).
 * Sert a la feuille « Livres » du lecteur, aux filtres des versets colories
 * et a la recherche rapide d'un livre (« gen » -> Genèse).
 * Aucun acces base de donnees : utilisable cote serveur ET navigateur.
 */
import { BOOKS } from './refs';

export type Alliance = 'ancienne' | 'nouvelle';
export type BookGroup = { id: string; label: string; he?: string; alliance: Alliance; from: number; to: number };

export const ALLIANCES: Array<{ id: Alliance; label: string; he: string; sub: string }> = [
  { id: 'ancienne', label: 'Ancienne Alliance', he: 'Tanakh', sub: '39 livres · de la Genèse à Malachie' },
  { id: 'nouvelle', label: 'Nouvelle Alliance', he: 'Brit Hadachah', sub: '27 livres · de Matthieu à l’Apocalypse' }
];

export const BOOK_GROUPS: BookGroup[] = [
  { id: 'torah',      label: 'La Torah (la Loi)',              he: 'Pentateuque',      alliance: 'ancienne', from: 1,  to: 5 },
  { id: 'histoire',   label: 'Livres historiques',             he: 'De Josué à Esther', alliance: 'ancienne', from: 6,  to: 17 },
  { id: 'sagesse',    label: 'Poésie et sagesse',              he: 'Ketouvim (Écrits)', alliance: 'ancienne', from: 18, to: 22 },
  { id: 'grands',     label: 'Grands prophètes',               he: 'Neviim (Prophètes)', alliance: 'ancienne', from: 23, to: 27 },
  { id: 'petits',     label: 'Petits prophètes',               he: 'Les Douze',        alliance: 'ancienne', from: 28, to: 39 },
  { id: 'evangiles',  label: 'Les Évangiles',                  he: 'La Bonne Nouvelle', alliance: 'nouvelle', from: 40, to: 43 },
  { id: 'actes',      label: 'Les Actes des apôtres',          he: 'L’Église naissante', alliance: 'nouvelle', from: 44, to: 44 },
  { id: 'paul',       label: 'Lettres de Paul',                he: 'Chaoul (Paul)',    alliance: 'nouvelle', from: 45, to: 57 },
  { id: 'generales',  label: 'Hébreux et lettres universelles', he: 'Jacques, Pierre, Jean, Jude', alliance: 'nouvelle', from: 58, to: 65 },
  { id: 'apocalypse', label: 'L’Apocalypse',                   he: 'La Révélation',    alliance: 'nouvelle', from: 66, to: 66 }
];

/** Nom du livre AVEC accents (la table « books » n'en a pas toujours). */
export const bookName = (id: number, fallback = '') => BOOKS[id - 1]?.[1] ?? fallback;
export const bookAbbr = (id: number) => BOOKS[id - 1]?.[0] ?? '';
export const groupOf = (id: number) => BOOK_GROUPS.find(g => id >= g.from && id <= g.to);
export const allianceOf = (id: number): Alliance => (id <= 39 ? 'ancienne' : 'nouvelle');

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Quelques noms courants en plus (« psaume », « apo », « cantique »…)
const EXTRA: Record<number, string[]> = {
  19: ['psaume'], 21: ['qohelet', 'qo'], 22: ['cantique', 'ct'], 23: ['isaie', 'is'], 66: ['revelation', 'apo'],
  40: ['mat'], 43: ['jn'], 44: ['actes des apotres'], 58: ['heb']
};

/**
 * Recherche d'un livre en tapant les premieres lettres :
 *   « gen » -> Genèse ; « 1 co » ou « 1co » -> 1 Corinthiens ; « jean 3 » -> Jean + chapitre 3.
 * Renvoie les livres trouves (les meilleurs d'abord) et le chapitre tape s'il y en a un.
 */
export function searchBooks(raw: string): { ids: number[]; chapter: number | null } {
  const q0 = norm(raw);
  if (!q0) return { ids: [], chapter: null };
  // Un chiffre a la fin = chapitre (« gen 3 », « 1 jn 4 »), sauf si c'est tout ce qu'on a tape.
  const m = q0.match(/^(.*?[a-z].*?)\s*(\d+)$/);
  const q = m ? m[1].trim() : q0;
  const chapter = m ? +m[2] : null;
  const compact = q.replace(/ /g, '');

  const scored: Array<[number, number]> = [];
  BOOKS.forEach(([ab, name], i) => {
    const id = i + 1;
    const n = norm(name), a = norm(ab);
    const keys = [n, a, ...(EXTRA[id] ?? [])];
    let score = 0;
    for (const k of keys) {
      const kc = k.replace(/ /g, '');
      if (k === q || kc === compact) score = Math.max(score, 4);
      else if (k.startsWith(q) || kc.startsWith(compact)) score = Math.max(score, 3);
      else if (k.split(' ').some(w => w.startsWith(q))) score = Math.max(score, 2);
      else if (q.length >= 3 && k.includes(q)) score = Math.max(score, 1);
    }
    if (score) scored.push([id, score]);
  });
  scored.sort((x, y) => y[1] - x[1] || x[0] - y[0]);
  return { ids: scored.map(s => s[0]), chapter };
}
