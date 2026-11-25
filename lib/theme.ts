/**
 * PERSONNALISER L'APP : couleur principale, ambiance (fond clair), police.
 * Gardé sur le téléphone ; appliqué avant l'affichage (script dans layout)
 * grâce aux attributs data-accent / data-ambiance / data-font sur <html>.
 */
export type Theme = { accent: string; ambiance: string; font: string; size?: number; nuit?: string; perso?: string };
export const THEME_DEFAULT: Theme = { accent: 'ardoise', ambiance: 'clair', font: 'systeme', size: 1, nuit: 'auto', perso: '#7A5BA8' };

export const ACCENTS = [
  { id: 'ardoise', label: 'Ardoise', c: '#4E6A85' },
  { id: 'or', label: 'Or', c: '#A07C3F' },
  { id: 'olivier', label: 'Olivier', c: '#667A4C' },
  { id: 'ocean', label: 'Océan', c: '#2F7480' },
  { id: 'lavande', label: 'Lavande', c: '#6D639F' },
  { id: 'bordeaux', label: 'Bordeaux', c: '#8A3A4C' },
  { id: 'terre', label: 'Terre', c: '#A0583A' },
  { id: 'graphite', label: 'Graphite', c: '#4B5058' },
  { id: 'saphir', label: 'Saphir', c: '#2D58A6' },
  { id: 'ciel', label: 'Ciel', c: '#3A86BE' },
  { id: 'emeraude', label: 'Émeraude', c: '#23876A' },
  { id: 'sauge', label: 'Sauge', c: '#6F8F78' },
  { id: 'moutarde', label: 'Moutarde', c: '#B08423' },
  { id: 'corail', label: 'Corail', c: '#CC604F' },
  { id: 'rose', label: 'Rose', c: '#B35A7A' },
  { id: 'prune', label: 'Prune', c: '#783D6C' },
  { id: 'indigo', label: 'Indigo', c: '#46479A' },
  { id: 'chocolat', label: 'Chocolat', c: '#7A5038' }
];
export const NUITS = [
  { id: 'auto', label: 'Assortie', bg: 'color-mix(in srgb,var(--brand) 18%,#0B0E12)' },
  { id: 'noir', label: 'Noir pur', bg: '#000000' },
  { id: 'ardoise', label: 'Ardoise', bg: '#0E141A' },
  { id: 'bleue', label: 'Nuit bleue', bg: '#0A1224' },
  { id: 'chaude', label: 'Chaude', bg: '#16110C' },
  { id: 'foret', label: 'Forêt', bg: '#0C1510' },
  { id: 'prune', label: 'Prune', bg: '#150D16' },
  { id: 'graphite', label: 'Graphite', bg: '#18191C' }
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
  { id: 'epuree', label: 'Épurée', family: '"Source Serif 4",Georgia,serif' },
  { id: 'livre', label: 'Livre', family: 'Lora,Georgia,serif' },
  { id: 'baskerville', label: 'Baskerville', family: '"Libre Baskerville",Georgia,serif' },
  { id: 'elegante', label: 'Élégante', family: '"Cormorant Garamond",Georgia,serif' },
  { id: 'affiche', label: 'Affiche', family: '"Playfair Display",Georgia,serif' }
];
export const FONT_LINKS: Record<string, string> = {
  chaleureuse: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&display=swap',
  litteraire: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap',
  epuree: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap',
  livre: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap',
  baskerville: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap',
  elegante: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap',
  affiche: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap'
};

export function readTheme(): Theme {
  try { return { ...THEME_DEFAULT, ...JSON.parse(localStorage.getItem('pq-theme') ?? '{}') }; } catch { return THEME_DEFAULT; }
}
/** Taille du texte de toute l'app (iPhone : texte seul ; ailleurs : zoom de la page). */
export function applySize(scale = 1) {
  const h = document.documentElement as any;
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios) { h.style.webkitTextSizeAdjust = `${Math.round(scale * 100)}%`; h.style.textSizeAdjust = `${Math.round(scale * 100)}%`; }
  else document.body.style.setProperty('zoom', scale === 1 ? '' : String(scale));
}
export function applyTheme(t: Theme) {
  const h = document.documentElement;
  h.dataset.accent = t.accent; h.dataset.ambiance = t.ambiance; h.dataset.font = t.font; h.dataset.nuit = t.nuit || 'auto';
  if (t.accent === 'perso' && t.perso) h.style.setProperty('--perso', t.perso); else h.style.removeProperty('--perso');
  applySize(t.size ?? 1);
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
h.dataset.accent=t.accent||'ardoise';h.dataset.ambiance=t.ambiance||'clair';h.dataset.font=t.font||'systeme';h.dataset.nuit=t.nuit||'auto';
if(t.accent==='perso'&&t.perso)h.style.setProperty('--perso',t.perso);
var z=+t.size||1;if(z!==1){var ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(ios){h.style.webkitTextSizeAdjust=Math.round(z*100)+'%';h.style.textSizeAdjust=Math.round(z*100)+'%'}else{document.body.style.zoom=z}}
var L=${JSON.stringify(FONT_LINKS)};if(L[t.font]){var l=document.createElement('link');l.rel='stylesheet';l.href=L[t.font];l.setAttribute('data-pq-font',t.font);document.head.appendChild(l);}}catch(e){}})();`;
