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
