/** Identifiant d'une fiche à partir de son titre (« Amour de Dieu » -> « amour-de-dieu »). */
export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
