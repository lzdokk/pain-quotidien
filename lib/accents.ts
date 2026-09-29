/**
 * REMISE DES ACCENTS
 * Certains modeles rendent parfois un francais sans accents (« eternelle »,
 * « verite »). On repare mot par mot avec une table tiree du vocabulaire
 * des Bibles francaises (lib/accents-fr.json, construite par
 * scripts/build-accents.py). Seuls les mots dont la forme sans accent
 * n'existe pas en francais sont corriges : « a », « la », « ou »… restent
 * intacts. Un mot qui porte deja un accent n'est jamais touche.
 * A utiliser cote serveur uniquement (la table pese ~260 ko).
 */
import TABLE from './accents-fr.json';

const T = TABLE as Record<string, string>;
const WORD = /[A-Za-zÀ-ÖØ-öø-ÿœŒæÆ]+/g;
const HAS_ACCENT = /[À-ÖØ-öø-ÿœŒæÆ]/;

export function fixAccents(s: string): string {
  if (!s) return s;
  return s.replace(WORD, w => {
    if (HAS_ACCENT.test(w)) return w;
    const rep = T[w.toLowerCase()];
    if (!rep) return w;
    if (w.length > 1 && w === w.toUpperCase()) return rep.toUpperCase();
    if (w[0] === w[0].toUpperCase()) return rep[0].toUpperCase() + rep.slice(1);
    return rep;
  });
}

/** Applique fixAccents a toutes les chaines d'un objet (JSON genere). */
export function fixAccentsDeep<T>(v: T): T {
  if (typeof v === 'string') return fixAccents(v) as unknown as T;
  if (Array.isArray(v)) return v.map(x => fixAccentsDeep(x)) as unknown as T;
  if (v && typeof v === 'object') {
    const o: any = {};
    for (const [k, x] of Object.entries(v as any)) o[k] = fixAccentsDeep(x);
    return o;
  }
  return v;
}
