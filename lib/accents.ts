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

/* ──────────────────────────────────────────────────────────────────
   FILET DE SECURITE : jamais un mot hebreu seul
   Si un nom hebreu du glossaire (Bible Juive Complete) apparait sans son
   francais entre parentheses, on l'ajoute : « Yéchoua » -> « Yéchoua (Jésus) ».
   Rien n'est ajoute s'il est deja suivi d'une parenthese, ou s'il est
   lui-meme entre parentheses (« Jésus (Yéchoua) »).
   ────────────────────────────────────────────────────────────────── */
const GLOSS: Array<[string, string]> = [
  ['Yéchoua le Messie', 'Jésus-Christ'], ['Chim\'on Kéfa', 'Simon Pierre'],
  ['Ruah HaKodech', 'Saint-Esprit'], ['Brit Hadachah', 'Nouvelle Alliance'],
  ['Yohanan l\'Immergeur', 'Jean-Baptiste'], ['Yom Kippour', 'Grand Pardon'],
  ['Yéchoua', 'Jésus'], ['Yeshoua', 'Jésus'], ['Yeshua', 'Jésus'],
  ['ADONAÏ', 'l\'Éternel'], ['Adonaï', 'Seigneur'], ['Elohim', 'Dieu'],
  ['Abba', 'Papa'], ['Avraham', 'Abraham'], ['Yits\'hak', 'Isaac'],
  ['Yossef', 'Joseph'], ['Moché', 'Moïse'], ['Aharon', 'Aaron'],
  ['Yéhochoua', 'Josué'], ['Chlomo', 'Salomon'], ['Éliyahou', 'Élie'],
  ['Yécha\'yahou', 'Ésaïe'], ['Yirmeyahou', 'Jérémie'], ['Yonah', 'Jonas'],
  ['Miryam', 'Marie'], ['Yohanan', 'Jean'], ['Kéfa', 'Pierre'],
  ['Chaoul', 'Paul'], ['Mattityahou', 'Matthieu'], ['El\'azar', 'Lazare'],
  ['Yeroushalayim', 'Jérusalem'], ['Tsion', 'Sion'], ['Beit-Lé\'hem', 'Bethléem'],
  ['Natseret', 'Nazareth'], ['Galil', 'Galilée'], ['Yarden', 'Jourdain'],
  ['Mitsraïm', 'Égypte'], ['Chabbat', 'sabbat'], ['Pessa\'h', 'Pâque'],
  ['Chavouot', 'Pentecôte'], ['Soukkot', 'fête des Cabanes'], ['Torah', 'Loi'],
  ['Tanakh', 'Ancien Testament'], ['talmidim', 'disciples'], ['talmid', 'disciple'],
  ['Machia\'h', 'Messie'], ['Mashiah', 'Messie'], ['Shalom', 'paix'], ['Chalom', 'paix']
];
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, '[\'’]');
const keyOf = (s: string) => s.replace(/’/g, '\'');
const GLOSS_MAP = new Map(GLOSS.map(([he, fr]) => [keyOf(he), fr]));
// Une seule expression, formes longues d'abord : chaque position n'est traitee qu'une fois.
const SORTED = [...GLOSS].sort((x, y) => y[0].length - x[0].length);
const GLOSS_RE = new RegExp(
  `(?<![\\p{L}(])(\\*{0,2})(${SORTED.map(([he]) => esc(he)).join('|')})(\\*{0,2})(?![\\p{L}'’-])`, 'gu');
// Forme longue deja traduite juste apres (« Yéchoua le Messie (Jésus-Christ) »).
const LONG_GLOSSED = new RegExp(
  `^(${SORTED.filter(([he]) => he.includes(' ')).map(([he]) => esc(he)).join('|')})\\*{0,2}\\s*\\(`, 'u');

export function addFrench(s: string): string {
  if (!s) return s;
  return s.replace(GLOSS_RE, (m: string, a: string, he: string, b: string, offset: number, full: string) => {
    const after = full.slice(offset + m.length);
    if (/^\s*\(/.test(after)) return m;                       // deja suivi de sa parenthese
    if (/\(\s*$/.test(full.slice(Math.max(0, offset - 3), offset))) return m; // « Jésus (Yéchoua) »
    if (LONG_GLOSSED.test(full.slice(offset + a.length))) return m;
    const fr = GLOSS_MAP.get(keyOf(he));
    return fr ? `${a}${he}${b} (${fr})` : m;
  });
}

/** Accents + francais entre parentheses, sur toutes les chaines d'un objet. */
export function polishDeep<T>(v: T, opts: { gloss?: boolean } = {}): T {
  const gloss = opts.gloss !== false;
  if (typeof v === 'string') {
    const a = fixAccents(v);
    return (gloss ? addFrench(a) : a) as unknown as T;
  }
  if (Array.isArray(v)) return v.map(x => polishDeep(x, opts)) as unknown as T;
  if (v && typeof v === 'object') {
    const o: any = {};
    for (const [k, x] of Object.entries(v as any)) o[k] = polishDeep(x, opts);
    return o;
  }
  return v;
}
