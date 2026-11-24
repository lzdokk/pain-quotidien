/**
 * APPARENCE DE LECTURE (Lire) : fond, taille et police du texte.
 * Gardée sur le téléphone (localStorage). La photo personnelle est réduite
 * avant d'être gardée ; si le téléphone refuse, elle reste le temps de la visite.
 */
export type Look = { fond: string; taille: number; police: 'serif' | 'sans'; voile: number };
export const LOOK_DEFAULT: Look = { fond: 'defaut', taille: 1, police: 'serif', voile: 0.55 };

export const FONDS: Array<{ id: string; label: string; swatch: string }> = [
  { id: 'defaut', label: 'Par défaut', swatch: 'linear-gradient(135deg,#fff 50%,#1d232b 50%)' },
  { id: 'papier', label: 'Papier', swatch: '#FFFCF5' },
  { id: 'sepia', label: 'Sépia', swatch: '#F1E4C8' },
  { id: 'lin', label: 'Lin', swatch: '#ECE7DD' },
  { id: 'brume', label: 'Brume', swatch: '#E6ECF1' },
  { id: 'aube', label: 'Aube', swatch: 'linear-gradient(160deg,#FBEAD6,#F3D3C2)' },
  { id: 'ardoise', label: 'Ardoise', swatch: '#25303A' },
  { id: 'foret', label: 'Forêt', swatch: '#18261E' },
  { id: 'nuit', label: 'Nuit', swatch: '#0A0C0F' }
];

export function readLook(): Look {
  try { return { ...LOOK_DEFAULT, ...JSON.parse(localStorage.getItem('pq-look') ?? '{}') }; } catch { return LOOK_DEFAULT; }
}
export function saveLook(l: Look) { try { localStorage.setItem('pq-look', JSON.stringify(l)); } catch {} }
export function readLookPhoto(): string | null { try { return localStorage.getItem('pq-look-photo'); } catch { return null; } }
export function saveLookPhoto(url: string | null) {
  try { url ? localStorage.setItem('pq-look-photo', url) : localStorage.removeItem('pq-look-photo'); return true; } catch { return false; }
}
