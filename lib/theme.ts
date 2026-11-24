/**
 * PERSONNALISER L'APP : couleur principale, ambiance (fond clair), police.
 * Gardé sur le téléphone ; appliqué avant l'affichage (script dans layout)
 * grâce aux attributs data-accent / data-ambiance / data-font sur <html>.
 */
export type Theme = { accent: string; ambiance: string; font: string };
export const THEME_DEFAULT: Theme = { accent: 'ardoise', ambiance: 'clair', font: 'systeme' };

export const ACCENTS = [
  { id: 'ardoise', label: 'Ardoise', c: '#4E6A85' },
  { id: 'or', label: 'Or', c: '#A07C3F' },
  { id: 'olivier', label: 'Olivier', c: '#667A4C' },
  { id: 'ocean', label: 'Océan', c: '#2F7480' },
  { id: 'lavande', label: 'Lavande', c: '#6D639F' },
  { id: 'bordeaux', label: 'Bordeaux', c: '#8A3A4C' },
  { id: 'terre', label: 'Terre', c: '#A0583A' },
  { id: 'graphite', label: 'Graphite', c: '#4B5058' }
];
export const AMBIANCES = [
  { id: 'clair', label: 'Clair', bg: '#FBFBFC', card: '#FFFFFF' },
  { id: 'creme', label: 'Crème', bg: '#F5F0E6', card: '#FFFDF8' },
  { id: 'pierre', label: 'Pierre', bg: '#EFEEEA', card: '#FAF9F6' },
  { id: 'brume', label: 'Brume', bg: '#EDF1F4', card: '#FAFCFD' }
];
export const FONTS = [
  { id: 'systeme', label: 'Classique', family: '"New York","Iowan Old Style",Georgia,serif' },
  { id: 'chaleureuse', label: 'Chaleureuse', family: 'Fraunces,Georgia,serif' },
  { id: 'litteraire', label: 'Littéraire', family: '"EB Garamond",Georgia,serif' },
  { id: 'epuree', label: 'Épurée', family: '"Source Serif 4",Georgia,serif' }
];
export const FONT_LINKS: Record<string, string> = {
  chaleureuse: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&display=swap',
  litteraire: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap',
  epuree: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap'
};

export function readTheme(): Theme {
  try { return { ...THEME_DEFAULT, ...JSON.parse(localStorage.getItem('pq-theme') ?? '{}') }; } catch { return THEME_DEFAULT; }
}
export function applyTheme(t: Theme) {
  const h = document.documentElement;
  h.dataset.accent = t.accent; h.dataset.ambiance = t.ambiance; h.dataset.font = t.font;
  const href = FONT_LINKS[t.font];
  if (href && !document.querySelector(`link[data-pq-font="${t.font}"]`)) {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.dataset.pqFont = t.font; document.head.appendChild(l);
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && h.dataset.mode !== 'soir') meta.setAttribute('content', AMBIANCES.find(a => a.id === t.ambiance)?.bg ?? '#FBFBFC');
}
export function saveTheme(t: Theme) {
  try { localStorage.setItem('pq-theme', JSON.stringify(t)); } catch {}
  applyTheme(t);
}
/** Script à exécuter avant l'affichage (dans <body>), sans dépendance. */
export const THEME_BOOT = `(function(){try{var t=JSON.parse(localStorage.getItem('pq-theme')||'{}');var h=document.documentElement;
h.dataset.accent=t.accent||'ardoise';h.dataset.ambiance=t.ambiance||'clair';h.dataset.font=t.font||'systeme';
var L=${JSON.stringify(FONT_LINKS)};if(L[t.font]){var l=document.createElement('link');l.rel='stylesheet';l.href=L[t.font];l.setAttribute('data-pq-font',t.font);document.head.appendChild(l);}}catch(e){}})();`;
