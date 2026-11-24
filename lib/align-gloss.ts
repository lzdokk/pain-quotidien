/**
 * MOT À MOT : garantir que chaque traduction française est bien rangée sous
 * SON mot grec ou hébreu.
 *
 * L'IA renvoie, pour chaque mot, { n: numéro, g: le mot d'origine recopié, fr }.
 * On range chaque traduction d'après le mot recopié (pas seulement d'après sa
 * place dans la liste), puis on contrôle quelques mots repères dont le sens
 * est connu (καί = « et », θεός = « Dieu », l'article…). Au moindre doute, le
 * verset est refusé : il sera retraduit plus tard plutôt qu'affiché décalé.
 */
export type GlossItem = { n?: number; g?: string; fr: string };
type W = { word: string; strong?: string | null };

export const GLOSS_ITEM_SCHEMA = {
  type: 'OBJECT',
  properties: { n: { type: 'INTEGER' }, g: { type: 'STRING' }, fr: { type: 'STRING' } },
  required: ['n', 'g', 'fr']
};

/** Mot d'origine sans accents, voyelles, ponctuation ni majuscules. */
export function normWord(s: string) {
  return (s || '').normalize('NFD')
    .replace(/[̀-֑ͯ-ׇ]/g, '')      // accents grecs, points-voyelles et cantillation hébreux
    .replace(/[^\p{L}]/gu, '')                          // ponctuation, maqaf, chiffres
    .toLowerCase().replace(/ς/g, 'σ');
}

const RE = (s: string) => new RegExp(`^(?:${s})`, 'i');
/** Mots repères : leur traduction doit ressembler à ceci. */
const ANCHORS: Record<string, RegExp> = {
  G2532: RE('et|aussi|même|mais|or|alors|puis|ainsi|ni|donc|car|c[’\']est|[·—-]'),
  G2316: RE('dieu|de dieu|à dieu|divin'),
  G2424: RE('jésus|de jésus|à jésus'),
  G5547: RE('christ|du christ|de christ|messie|oint'),
  G2962: RE('seigneur|du seigneur|au seigneur|maître|monsieur'),
  G3756: RE('ne|n[’\']|pas|non|point|aucun|nul|jamais|ni|sans'),
  G3361: RE('ne|n[’\']|pas|non|point|aucun|nul|jamais|ni|sans|de peur|que'),
  H3808: RE('ne|n[’\']|pas|non|point|aucun|nul|rien|jamais|ni|sans'),
  H408: RE('ne|n[’\']|pas|non|point|aucun|nul|rien|jamais|ni|sans'),
  G3588: RE('le|la|les|l[’\']|du|de|des|au|aux|à|ce|cet|cette|ces|celui|celle|ceux|celles|qui|que|lui|eux|son|sa|ses|leur|\\[|·|—|-|$'),
  H3068: RE('l[’\']?éternel|éternel|seigneur|yhwh|yahvé|adonaï|de l|à l|par l|du seigneur'),
  H430: RE('dieu|dieux|de dieu|à dieu|élohim|divin|juges|anges'),
  H853: RE('\\[|·|—|-|$|lui|les|le|la|eux|elle|celui|ce|moi|toi|nous|vous|avec')
};

// Noms (Dieu, Jésus, Seigneur…) et négations : une erreur suffit. Petits mots (et, le…) : il en faut deux.
const HEAVY = new Set(['G2316', 'G2424', 'G5547', 'G2962', 'H3068', 'H430', 'G3756', 'G3361', 'H3808', 'H408']);

/** Poids des mots repères dont la traduction ne colle pas. */
export function anchorMisses(words: W[], fr: (string | null | undefined)[]) {
  let miss = 0, seen = 0;
  words.forEach((w, i) => {
    const code = (w.strong || '').toUpperCase().replace(/^([GH])0*(\d+).*$/, '$1$2');
    const re = ANCHORS[code];
    if (!re || fr[i] == null) return;
    seen++;
    if (!re.test(String(fr[i]).trim())) miss += HEAVY.has(code) ? 2 : 1;
  });
  return { miss, seen };
}

/** Range les traductions sous leurs mots. null si le résultat n'est pas sûr. */
export function alignGloss(words: W[], items: GlossItem[]): string[] | null {
  if (!Array.isArray(items) || !items.length) return null;
  const out: (string | null)[] = words.map(() => null);
  const norms = words.map(w => normWord(w.word));
  const clean = (s: string) => String(s ?? '').replace(/\*/g, '').trim().slice(0, 40) || '·';

  items.forEach((it, k) => {
    const g = normWord(it.g ?? '');
    const n = Number.isInteger(it.n) ? (it.n as number) - 1 : k;
    // 1. le mot recopié correspond à la place annoncée
    if (g && norms[n] === g && out[n] == null) { out[n] = clean(it.fr); return; }
    // 2. sinon, le même mot libre le plus proche de la place annoncée
    if (g) {
      let best = -1;
      norms.forEach((x, i) => { if (x === g && out[i] == null && (best < 0 || Math.abs(i - n) < Math.abs(best - n))) best = i; });
      if (best >= 0) { out[best] = clean(it.fr); return; }
    }
    // 3. mot recopié un peu différent (élision, hébreu abîmé…) : la place annoncée,
    //    si elle est libre et que le début du mot concorde (ou s'il n'a pas été recopié)
    if (n >= 0 && n < words.length && out[n] == null && (!g || norms[n].slice(0, 3) === g.slice(0, 3))) out[n] = clean(it.fr);
  });

  if (out.some(x => x == null)) return null;
  const { miss } = anchorMisses(words, out);
  if (miss >= 2) return null;
  return out as string[];
}

/** Consigne commune aux deux traductions (tâche de fond, à la demande). */
export const GLOSS_RULES = `RÈGLE D'OR : la traduction d'un mot rend le sens de CE mot-là, jamais celui d'un mot voisin.
Ne réordonne pas selon la phrase française : si le français dit « je ne manquerai de rien »,
לֹא (négation) reçoit « ne… pas » et אֶחְסָר reçoit « je manquerai ». Un article reçoit « le », « la »…,
καί reçoit « et », θεός reçoit « Dieu ».
Pour chaque mot, recopie son numéro (n) et le mot d'origine tel quel (g), puis sa traduction (fr).
Ne saute aucun mot, n'en fusionne aucun, n'en ajoute aucun.`;
