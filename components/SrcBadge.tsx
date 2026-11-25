/**
 * Logos de source de l'Étude : 📖 Dictionnaire (Westphal, livre de référence)
 * et ✦ Fiche (Pain de Vie). Plus la comparaison de titres entre les deux.
 */
/* Comparer les titres : sans accents, sans parenthèses, au singulier. */
const STOP = new Set(['et', 'de', 'du', 'des', 'la', 'le', 'les', 'l', 'd', 'en', 'a', 'au', 'aux', 'un', 'une', 'dans', 'sur']);
const words = (t: string) => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\(.*?\)/g, ' ').split(/[^a-z]+/).filter(Boolean).map(w => w.length > 3 ? w.replace(/[sx]$/, '') : w);
export const titleKey = (t: string) => words(t).join(' ');
export const stems = (t: string) => words(t).filter(w => !STOP.has(w));

/* Logos de source (reconnaissables d'un coup d'œil). */
export const IcoDico = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM5 17a3 3 0 013-3h11" />
  </svg>
);
export const SrcDico = ({ long }: { long?: boolean }) => <span className="src-b src-dico"><IcoDico />{long ? 'Dictionnaire Westphal' : 'Dictionnaire'}</span>;
export const SrcFiche = ({ long }: { long?: boolean }) => <span className="src-b src-fiche"><b>✦</b>{long ? 'Fiche Pain de Vie' : 'Fiche'}</span>;

