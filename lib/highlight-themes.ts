/**
 * Thèmes de surlignage, associés aux 4 couleurs du lecteur.
 * Chaque couleur = un thème essentiel pour l'apprentissage de la Bible.
 * (Tu peux renommer les libellés ici sans rien casser.)
 *   1 = jaune/or · 2 = vert · 3 = bleu · 4 = rose
 */
export const HL_THEMES = [
  { color: 1, label: 'Promesses & fidélité', hint: "Les promesses de Dieu, ce qu'Il s'engage à faire." },
  { color: 2, label: 'Sagesse & obéissance', hint: 'Comment vivre, grandir et marcher avec Dieu.' },
  { color: 3, label: 'Foi & prière', hint: 'La confiance en Dieu et la vie de prière.' },
  { color: 4, label: 'Amour, grâce & salut', hint: "Le cœur de l'Évangile : la croix, l'amour et la grâce." },
  { color: 5, label: 'Prophétie & Messie', hint: 'Les annonces prophétiques et leur accomplissement en Christ.' },
  { color: 6, label: 'Péché & repentance', hint: 'Le diagnostic du cœur et le retour à Dieu.' },
  { color: 7, label: 'Identité en Christ', hint: 'Qui je suis en Christ, la vie nouvelle par l’Esprit.' }
] as const;

export const themeOf = (color: number) => HL_THEMES.find(t => t.color === color);

// Mots-clés (sans accents) par thème, pour suggérer un classement instantané.
const THEME_KEYWORDS: Record<number, string[]> = {
  1: ['promesse', 'promet', 'alliance', 'fidel', 'fidelite', 'jure', 'serment', 'beni', 'benir',
      'benediction', 'heritage', 'accompli', 'tiendra', 'abandonnera', 'garde', 'eternel amour', 'certain',
      'presence', 'refuge', 'protege', 'protection', 'rocher', 'secours', 'delivr', 'soutien', 'main',
      'ne crains', 'crainte', 'tenebres', 'lumiere', 'entoure', 'sonde', 'veille'],
  2: ['sagesse', 'sage', 'obeir', 'obeis', 'commandement', 'loi', 'instruit', 'discipline', 'ecoute',
      'pratiqu', 'chemin', 'march', 'oeuvre', 'fruit', 'prudent', 'conseil', 'craint'],
  3: ['foi', 'croi', 'confiance', 'priere', 'prie', 'demandez', 'invoqu', 'esperance', 'espere', 'attend'],
  4: ['amour', 'aime', 'grace', 'salut', 'sauv', 'croix', 'sang', 'sacrifice', 'pardon', 'misericorde',
      'compassion', 'don', 'gratuit', 'redempt', 'rachet'],
  5: ['prophet', 'prophetie', 'accompli', 'annonc', 'messie', 'christ', 'oint', 'viendra', 'signe',
      'vision', 'jour du seigneur', 'venir'],
  6: ['peche', 'pecheur', 'iniquite', 'faute', 'transgress', 'repent', 'converti', 'detourn', 'confess',
      'coupable', 'egare', 'mal', 'impie'],
  7: ['en christ', 'nouvelle creature', 'ne de nouveau', 'enfant de dieu', 'esprit', 'temple', 'membre',
      'corps de christ', 'heritier', 'adoption', 'demeure en moi', 'nouvelle vie', 'regenere']
};

const strip = (s: string) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Devine le thème (couleur 1..7) le plus adapté au texte du verset, ou null. */
export function suggestTheme(text: string): { color: number; label: string } | null {
  const t = strip(text);
  if (!t) return null;
  let best = 0, bestScore = 0;
  for (const [color, kws] of Object.entries(THEME_KEYWORDS)) {
    let score = 0;
    for (const kw of kws) if (t.includes(kw)) score++;
    if (score > bestScore) { bestScore = score; best = +color; }
  }
  if (!best) best = 1; // repli : on suggère toujours un thème (modifiable au clic)
  const th = themeOf(best);
  return th ? { color: best, label: th.label } : null;
}

// Recherche par couleur ou par nom de thème (barre du lecteur).
const COLOR_WORDS: Record<string, number> = {
  jaune: 1, or: 1, dore: 1, vert: 2, verte: 2, bleu: 3, bleue: 3, rose: 4,
  violet: 5, violette: 5, mauve: 5, rouge: 6, turquoise: 7, cyan: 7
};

/** Renvoie la couleur (1..7) si la requête désigne une couleur ou un thème. */
export function matchThemeQuery(q: string): number | null {
  const s = strip(q).trim();
  if (s.length < 3) return null;
  if (COLOR_WORDS[s] != null) return COLOR_WORDS[s];
  for (const t of HL_THEMES) {
    const lab = strip(t.label).replace(/[^a-z ]/g, ' ');
    const words = lab.split(/\s+/).filter(w => w.length > 2);
    if (words.includes(s) || lab.includes(s)) return t.color;
  }
  return null;
}
