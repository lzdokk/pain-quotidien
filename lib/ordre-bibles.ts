/**
 * Ordre des Bibles (liste des versions et comparaisons) : Segond 1910 d'abord,
 * puis la Nouvelle Français courant, puis La Bible expliquée, puis les autres.
 * L'hébreu (WLC, Delitzsch) reste en base pour le mot à mot mais n'est plus proposé.
 */
type T = { code: string; name?: string | null; language?: string | null };
export const estNFC = (t: T) => /NFC/i.test(t.code) || /fran[cç]ais courant/i.test(t.name ?? '');
const rang = (t: T) => t.code === 'FRLSG' ? 0 : estNFC(t) ? 1 : t.code === 'BEX2004' ? 2 : 3;
export const ordreBibles = <X extends T>(a: X, b: X) => rang(a) - rang(b) || (a.name ?? a.code).localeCompare(b.name ?? b.code, 'fr');
export const bibleMasquee = (t: T) => (t.language ?? 'fr') === 'he';
