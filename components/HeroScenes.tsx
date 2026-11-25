/**
 * PAYSAGES : 12 décors × 9 lumières = 108 fonds dessinés (SVG), nets sur tout
 * écran, légers, sans droits d'image. Chaque fond porte des thèmes ; l'accueil
 * choisit chaque jour un fond accordé au thème du Pain du jour.
 *   id d'un fond : « décor-lumière », ex. « mer-couchant », « croix-aube ».
 */

/* ── Les lumières (moment du jour) ─────────────────────────────────── */
type Light = {
  label: string; themes: string[];
  sky: [string, string, string, string];
  sun?: string; glow: string; glowA: number; moon?: boolean; stars?: boolean;
  far: string; mid: string; near: string; front: string;
  mist: string; mistA: number; water: [string, string]; refl: string; clouds: [string, string];
};
const LIGHTS: Record<string, Light> = {
  aube: { label: 'Aube', themes: ['esperance', 'renouveau', 'resurrection'], sky: ['#262C55', '#7E6497', '#DE8F86', '#F5C78F'], sun: '#FFF0CF', glow: '#FFE2AE', glowA: 0.85,
    far: '#A07FA0', mid: '#6C5784', near: '#3A3153', front: '#231E36', mist: '#FBE3D2', mistA: 0.35, water: ['#5E5582', '#2A2546'], refl: '#FFD9A3', clouds: ['#F3A792', '#FBD0B5'] },
  matin: { label: 'Matin', themes: ['fidelite', 'renouveau', 'paix'], sky: ['#6E9BC7', '#A7C6E0', '#D9E6EE', '#F3EBDD'], sun: '#FFFBEA', glow: '#FFF4D0', glowA: 0.7,
    far: '#8EA6BF', mid: '#6A859F', near: '#4B6278', front: '#33465A', mist: '#EEF3F6', mistA: 0.45, water: ['#7FA0BD', '#2F4A66'], refl: '#FFFFFF', clouds: ['#FFFFFF', '#E8EEF5'] },
  midi: { label: 'Plein jour', themes: ['joie', 'lumiere', 'creation'], sky: ['#2F6DB0', '#4C8ACB', '#86B6E0', '#C7DEEF'], sun: '#FFFFFF', glow: '#FFFFFF', glowA: 0.6,
    far: '#8AA9C0', mid: '#6F9470', near: '#4F7350', front: '#355238', mist: '#E9F1F6', mistA: 0.35, water: ['#3F7FB5', '#1E4A73'], refl: '#FFFFFF', clouds: ['#FFFFFF', '#EAF2FA'] },
  or: { label: 'Heure dorée', themes: ['gloire', 'louange', 'reconnaissance'], sky: ['#3E5A8C', '#C98E6A', '#F0B66E', '#FBD99A'], sun: '#FFF3C8', glow: '#FFD58A', glowA: 0.85,
    far: '#B98A64', mid: '#8C6447', near: '#5E412E', front: '#3A281C', mist: '#FCE3B8', mistA: 0.35, water: ['#7A5B5E', '#2D2230'], refl: '#FFE0A0', clouds: ['#F6C27E', '#FDE2B0'] },
  couchant: { label: 'Couchant', themes: ['amour', 'reconnaissance', 'repos'], sky: ['#1F2B57', '#6B4F7E', '#D0717A', '#F4A766'], sun: '#FFE6BB', glow: '#FFC98A', glowA: 0.85,
    far: '#8E5C78', mid: '#5E3E62', near: '#36263F', front: '#1D1526', mist: '#F6B9A0', mistA: 0.3, water: ['#3B3F6E', '#0F1430'], refl: '#FFD6A0', clouds: ['#F3A792', '#FBD0B5'] },
  crepuscule: { label: 'Crépuscule', themes: ['priere', 'attente', 'mystere'], sky: ['#141A3A', '#3B3A70', '#7E5E9A', '#C88AA8'], glow: '#E7A6C3', glowA: 0.6,
    far: '#5C4F82', mid: '#3F3866', near: '#28244A', front: '#16142E', mist: '#B9A1C8', mistA: 0.3, water: ['#38386A', '#121230'], refl: '#F0B8D0', clouds: ['#B98AB3', '#E3B1C8'] },
  nuit: { label: 'Nuit étoilée', themes: ['promesse', 'presence', 'gloire'], sky: ['#03060F', '#0C1631', '#1B2547', '#26305A'], glow: '#F4EEDA', glowA: 0.45, moon: true, stars: true,
    far: '#1B2440', mid: '#121A33', near: '#0B1226', front: '#060A16', mist: '#3A4670', mistA: 0.25, water: ['#18224A', '#060A1A'], refl: '#F4EEDA', clouds: ['#3B4572', '#55608F'] },
  brume: { label: 'Brume', themes: ['humilite', 'recherche', 'paix'], sky: ['#6F8A80', '#A8B9A9', '#C9D3C4', '#DCE3D8'], sun: '#FFF8E4', glow: '#FFF4D6', glowA: 0.55,
    far: '#9DB1A2', mid: '#7C9583', near: '#56705F', front: '#2F4637', mist: '#E3EADF', mistA: 0.7, water: ['#8FA79B', '#3D5446'], refl: '#FFFFFF', clouds: ['#E9EEE6', '#FFFFFF'] },
  orage: { label: 'Orage', themes: ['epreuve', 'combat', 'confiance'], sky: ['#22282F', '#363E48', '#56606C', '#7A8490'], glow: '#C9D2DC', glowA: 0.35,
    far: '#4A525C', mid: '#363D46', near: '#242A31', front: '#15191E', mist: '#9AA4AE', mistA: 0.35, water: ['#3A4450', '#12171D'], refl: '#C9D2DC', clouds: ['#5A626D', '#7F8893'] }
};

/* ── Les décors ────────────────────────────────────────────────────── */
const DECORS: Array<{ id: string; label: string; themes: string[] }> = [
  { id: 'montagnes', label: 'Montagnes', themes: ['force', 'majeste', 'fidelite'] },
  { id: 'nuages', label: 'Nuages', themes: ['paix', 'ciel', 'presence'] },
  { id: 'mer', label: 'Mer', themes: ['confiance', 'immensite', 'amour'] },
  { id: 'foret', label: 'Forêt', themes: ['creation', 'croissance', 'humilite'] },
  { id: 'dunes', label: 'Désert', themes: ['epreuve', 'perseverance', 'attente'] },
  { id: 'lac', label: 'Lac', themes: ['paix', 'repos', 'priere'] },
  { id: 'collines', label: 'Collines', themes: ['repos', 'berger', 'paix'] },
  { id: 'champs', label: 'Moisson', themes: ['provision', 'pain', 'reconnaissance'] },
  { id: 'croix', label: 'La croix', themes: ['salut', 'grace', 'foi', 'resurrection'] },
  { id: 'phare', label: 'Le phare', themes: ['esperance', 'lumiere', 'guide'] },
  { id: 'chemin', label: 'Le chemin', themes: ['marche', 'perseverance', 'foi'] },
  { id: 'olivier', label: 'L’olivier', themes: ['paix', 'priere', 'onction'] }
];

export const SCENES = DECORS.flatMap(d => Object.entries(LIGHTS).map(([lid, l]) => ({
  id: `${d.id}-${lid}`, label: `${d.label} · ${l.label}`, decor: d.id, light: lid,
  themes: [...new Set([...d.themes, ...l.themes])]
})));
export type SceneId = string;

/** Grands thèmes proposés dans la galerie. */
export const THEMES: Array<{ id: string; label: string; words: RegExp }> = [
  { id: 'esperance', label: 'Espérance', words: /esp[ée]r|avenir|promess|attente/i },
  { id: 'paix', label: 'Paix', words: /paix|calme|repos|sérén|serein|apais/i },
  { id: 'force', label: 'Force', words: /force|fort|puissan|courage|rocher|forteresse/i },
  { id: 'gloire', label: 'Gloire et louange', words: /gloire|louange|lou[ée]|adorat|majest|saint/i },
  { id: 'amour', label: 'Amour', words: /amour|aim|compassion|tendresse|miséricorde|misericorde/i },
  { id: 'foi', label: 'Foi et grâce', words: /\bfoi\b|croire|grâce|grace|salut|sauv|croix|pardon|rédemp/i },
  { id: 'epreuve', label: 'Épreuve', words: /épreuve|epreuve|souffr|tempête|tempete|combat|larme|deuil|persév|persev|endur/i },
  { id: 'lumiere', label: 'Lumière', words: /lumi[eè]re|éclair|briller|ténèbres|tenebres|guide/i },
  { id: 'priere', label: 'Prière', words: /pri[eè]re|prier|intercess|silence|écoute|ecoute/i },
  { id: 'creation', label: 'Création', words: /créa|crea|cr[ée]ation|nature|semence|fruit|moisson|pain/i },
  { id: 'marche', label: 'Marche', words: /chemin|marche|voie|pas\b|sentier|suivre|direction/i },
  { id: 'resurrection', label: 'Vie nouvelle', words: /résurr|resurr|vie nouvelle|renouv|naître|naitre|nouveau/i }
];

/** Fond du jour : accordé au thème du jour s'il y en a un, sinon tournant. */
export function sceneOfDay(date: string, theme?: string | null): SceneId {
  const [y, m, d] = date.split('-').map(Number);
  const n = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  const hit = theme ? THEMES.filter(t => t.words.test(theme)).map(t => t.id) : [];
  const pool = hit.length ? SCENES.filter(s => s.themes.some(t => hit.includes(t))) : SCENES;
  return pool[(n * 37) % pool.length].id;
}
/** Ancien identifiant (« aube », « mer »…) → nouveau. */
const LEGACY: Record<string, string> = { aube: 'montagnes-aube', nuages: 'nuages-crepuscule', mer: 'mer-couchant', nuit: 'montagnes-nuit', foret: 'foret-brume', dunes: 'dunes-or', lac: 'lac-matin' };
export const normScene = (id?: string | null) => (id && (SCENES.some(s => s.id === id) ? id : LEGACY[id])) || null;

/* ── Dessin ────────────────────────────────────────────────────────── */
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const lin = (id: string, stops: Array<[number, string, number?]>) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    {stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
  </linearGradient>
);
const glowG = (id: string, c: string, a: number) => (
  <radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity={a} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>
);
function ridge(r: () => number, base: number, amp: number, n: number, smooth = true) {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) pts.push([i * (400 / n), base - r() * amp]);
  let d = `M0 800 L0 ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i], [px, py] = pts[i - 1];
    d += smooth ? ` Q${px + (x - px) / 2} ${py - amp * 0.15} ${x} ${y}` : ` L${x} ${y}`;
  }
  return d + ' L400 800 Z';
}
function hills(r: () => number, base: number, amp: number) {
  const a = base - r() * amp, b = base - r() * amp, c = base - r() * amp;
  return `M0 800 L0 ${a} C 90 ${a - amp * 0.8}, 150 ${b + amp * 0.3}, 220 ${b} S 340 ${c - amp * 0.7}, 400 ${c} L400 800 Z`;
}
function pines(r: () => number, base: number, h: number, count: number, color: string, op = 1) {
  return Array.from({ length: count }, (_, i) => {
    const x = (i / count) * 420 - 10 + r() * 12, hh = h * (0.7 + r() * 0.6), w = hh * 0.34, y = base + r() * 18;
    return <path key={i} d={`M${x} ${y - hh} L${x + w} ${y} L${x - w} ${y} Z`} fill={color} opacity={op} />;
  });
}

export default function HeroScene({ id, className }: { id: SceneId; className?: string }) {
  const sid = normScene(id) ?? SCENES[0].id;
  const [decor, lid] = sid.split('-');
  const L = LIGHTS[lid] ?? LIGHTS.aube;
  const r = rng(decor.length * 131 + lid.length * 17 + 7);
  const P = `hs-${sid}`;
  const sunY = decor === 'mer' || decor === 'phare' ? 528 : decor === 'lac' ? 455 : 560;
  const lowSun = lid === 'aube' || lid === 'couchant' || lid === 'or';
  // Soleil bas sur l'horizon à l'aube et au couchant ; sinon en haut à droite, loin du texte.
  const sunX = !lowSun ? 305 : decor === 'dunes' || decor === 'phare' ? 120 : decor === 'olivier' ? 280 : 210;
  const low = lid === 'aube' || lid === 'couchant' || lid === 'or';
  const sy = low ? sunY : lid === 'nuit' ? 150 : 120;

  const defs = (
    <defs>
      {lin(`${P}-sky`, [[0, L.sky[0]], [0.42, L.sky[1]], [0.66, L.sky[2]], [0.84, L.sky[3]]])}
      {glowG(`${P}-glow`, L.glow, L.glowA)}
      {lin(`${P}-mist`, [[0, L.mist, 0], [0.5, L.mist, L.mistA], [1, L.mist, 0]])}
      {lin(`${P}-water`, [[0, L.water[0]], [1, L.water[1]]])}
      <filter id={`${P}-blur`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
      <filter id={`${P}-soft`} x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="1.3" /></filter>
      <filter id={`${P}-b22`}><feGaussianBlur stdDeviation="22" /></filter>
      <clipPath id={`${P}-top`}><rect width="400" height="470" /></clipPath>
    </defs>
  );

  // Ciel commun
  const sky: JSX.Element[] = [<rect key="sky" width="400" height="800" fill={`url(#${P}-sky)`} />];
  if (L.stars) {
    sky.push(<ellipse key="mw" cx="200" cy="330" rx="70" ry="460" transform="rotate(32 200 330)" fill="#B9C3F0" opacity=".14" filter={`url(#${P}-b22)`} />);
    for (let i = 0; i < 200; i++) sky.push(<circle key={`st${i}`} cx={r() * 400} cy={r() * 600} r={r() < 0.92 ? r() * 0.9 + 0.25 : r() * 1.6 + 0.9} fill="#fff" opacity={0.25 + r() * 0.75} />);
  }
  if (lid === 'orage' || lid === 'crepuscule' || lid === 'matin' || lid === 'midi') {
    const cl = [];
    for (let i = 0; i < 14; i++) cl.push(<ellipse key={i} cx={r() * 440 - 20} cy={70 + r() * 260} rx={50 + r() * 80} ry={14 + r() * 22} fill={i % 2 ? L.clouds[0] : L.clouds[1]} opacity={lid === 'orage' ? 0.85 : 0.5} />);
    sky.push(<g key="hc" filter={`url(#${P}-blur)`}>{cl}</g>);
  }
  sky.push(<circle key="glow" cx={L.moon ? 300 : sunX} cy={sy} r={lid === 'nuit' ? 70 : low ? 250 : 180} fill={`url(#${P}-glow)`} />);
  if (L.moon) sky.push(<circle key="moon" cx={300} cy={150} r={17} fill="#F6F2E2" />);
  else if (L.sun) sky.push(<circle key="sun" cx={sunX} cy={sy} r={low ? 38 : 30} fill={L.sun} opacity={lid === 'brume' ? 0.8 : 1} />);

  let land: JSX.Element;
  switch (decor) {
    case 'montagnes':
      land = (<>
        <path d={ridge(r, 600, 70, 8)} fill={L.far} opacity=".8" />
        <rect y="590" width="400" height="70" fill={`url(#${P}-mist)`} />
        <path d={ridge(r, 655, 60, 7)} fill={L.mid} />
        <path d={ridge(r, 715, 45, 6)} fill={L.near} />
        <path d={ridge(r, 770, 30, 5)} fill={L.front} />
      </>); break;
    case 'nuages': {
      const clouds = [];
      for (let i = 0; i < 26; i++) clouds.push(<ellipse key={i} cx={r() * 440 - 20} cy={560 + r() * 240} rx={50 + r() * 90} ry={22 + r() * 34} fill={i % 3 ? L.clouds[0] : L.clouds[1]} opacity={0.55 + r() * 0.4} />);
      land = <g filter={`url(#${P}-blur)`}>{clouds}</g>; break;
    }
    case 'mer': case 'phare': {
      const refl = [];
      for (let i = 0; i < 46; i++) {
        const t = i / 46, w = (16 + r() * 60) * (1 - t * 0.5);
        refl.push(<ellipse key={i} cx={sunX + (r() - 0.5) * (30 + t * 120)} cy={532 + t * 250 + r() * 6} rx={w / 2} ry={1 + r() * 1.4} fill={L.refl} opacity={(0.8 - t * 0.7) * (0.4 + r() * 0.5) * (low || L.moon ? 1 : 0.5)} />);
      }
      land = (<>
        <rect y="528" width="400" height="272" fill={`url(#${P}-water)`} />
        <g filter={`url(#${P}-soft)`}>{refl}</g>
        {decor === 'phare' && (<>
          <path d="M240 800 L250 600 Q300 560 400 575 L400 800 Z" fill={L.front} />
          <path d="M318 572 L324 470 L340 470 L346 572 Z" fill={L.near} />
          <rect x="320" y="456" width="24" height="16" rx="3" fill={L.near} />
          <circle cx="332" cy="462" r="6" fill="#FFF3C4" />
          <path d="M332 462 L40 400 L40 440 Z" fill="#FFF3C4" opacity=".18" />
          <circle cx="332" cy="462" r="40" fill={`url(#${P}-glow)`} />
        </>)}
      </>); break;
    }
    case 'foret':
      land = (<>
        {pines(r, 560, 90, 22, L.far, 0.7)}
        <rect y="470" width="400" height="120" fill={`url(#${P}-mist)`} />
        {pines(r, 640, 130, 16, L.mid)}
        <rect y="560" width="400" height="110" fill={`url(#${P}-mist)`} opacity=".7" />
        {pines(r, 740, 190, 11, L.near)}
        <rect y="740" width="400" height="60" fill={L.front} />
      </>); break;
    case 'dunes':
      land = (<>
        <path d="M0 580 Q90 520 190 560 T400 540 V800 H0 Z" fill={L.far} />
        <path d="M0 650 Q120 590 230 640 T400 620 V800 H0 Z" fill={L.mid} />
        <path d="M0 720 Q140 660 260 710 T400 690 V800 H0 Z" fill={L.near} />
        <path d="M0 650 Q120 590 230 640" stroke={L.sky[3]} strokeWidth="1.4" fill="none" opacity=".5" />
      </>); break;
    case 'lac': {
      const far = ridge(r, 470, 110, 6, false), near = ridge(r, 470, 60, 8, false);
      land = (<>
        <g clipPath={`url(#${P}-top)`}><path d={far} fill={L.far} /><path d={near} fill={L.mid} /></g>
        <rect y="470" width="400" height="330" fill={`url(#${P}-water)`} />
        <g transform="translate(0 940) scale(1 -1)" opacity=".35" clipPath={`url(#${P}-top)`}><path d={far} fill={L.far} /><path d={near} fill={L.mid} /></g>
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={40 + r() * 300} y={490 + i * 20} width={30 + r() * 80} height="1.2" fill={L.refl} opacity={0.22 - i * 0.012} />)}
      </>); break;
    }
    case 'collines':
      land = (<>
        <path d={hills(r, 590, 50)} fill={L.far} opacity=".85" />
        <rect y="560" width="400" height="80" fill={`url(#${P}-mist)`} />
        <path d={hills(r, 650, 50)} fill={L.mid} />
        <path d={hills(r, 720, 40)} fill={L.near} />
        <g fill={L.front}><rect x="296" y="648" width="4" height="30" /><circle cx="298" cy="640" r="16" /><circle cx="288" cy="648" r="11" /><circle cx="308" cy="648" r="11" /></g>
        <path d={hills(r, 775, 25)} fill={L.front} />
      </>); break;
    case 'champs': {
      const blades = [];
      for (let i = 0; i < 160; i++) { const x = r() * 400, y = 690 + r() * 110, h = 18 + r() * 34; blades.push(<path key={i} d={`M${x} ${y} q ${2 + r() * 4} ${-h / 2} ${r() * 8 - 2} ${-h}`} stroke={i % 3 ? L.near : L.mid} strokeWidth="1.6" fill="none" opacity=".9" />); }
      land = (<>
        <path d={hills(r, 600, 25)} fill={L.far} opacity=".8" />
        <rect y="580" width="400" height="60" fill={`url(#${P}-mist)`} />
        <path d="M0 640 Q200 615 400 640 L400 800 L0 800 Z" fill={L.mid} />
        <path d="M0 690 Q200 670 400 690 L400 800 L0 800 Z" fill={L.near} opacity=".9" />
        {blades}
      </>); break;
    }
    case 'croix':
      land = (<>
        <path d={ridge(r, 640, 40, 6)} fill={L.far} opacity=".8" />
        <rect y="600" width="400" height="70" fill={`url(#${P}-mist)`} />
        <path d="M0 800 L0 720 Q120 690 200 615 Q280 690 400 720 L400 800 Z" fill={L.near} />
        <g fill={L.front}><rect x="196" y="500" width="9" height="120" rx="1" /><rect x="168" y="528" width="65" height="8" rx="1" /></g>
        <path d="M0 800 L0 760 Q200 735 400 760 L400 800 Z" fill={L.front} />
      </>); break;
    case 'chemin':
      land = (<>
        <path d={hills(r, 600, 30)} fill={L.far} opacity=".85" />
        <rect y="580" width="400" height="60" fill={`url(#${P}-mist)`} />
        <path d="M0 630 Q200 610 400 630 L400 800 L0 800 Z" fill={L.mid} />
        <path d="M196 620 Q190 680 140 740 Q110 775 60 800 L230 800 Q232 760 214 720 Q202 680 204 620 Z" fill={L.sky[3]} opacity=".55" />
        <path d="M0 700 Q60 690 120 700 L120 800 L0 800 Z M280 700 Q340 690 400 700 L400 800 L280 800 Z" fill={L.near} />
      </>); break;
    case 'olivier':
    default:
      land = (<>
        <path d={ridge(r, 640, 40, 6)} fill={L.far} opacity=".8" />
        <rect y="600" width="400" height="70" fill={`url(#${P}-mist)`} />
        <path d="M0 800 L0 700 Q150 650 260 690 Q340 715 400 705 L400 800 Z" fill={L.near} />
        <g fill={L.front}>
          <path d="M120 700 Q126 640 112 600 Q130 610 136 640 Q140 610 160 590 Q150 630 146 700 Z" />
          {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={95 + r() * 90} cy={555 + r() * 55} rx={20 + r() * 18} ry={10 + r() * 8} opacity=".95" />)}
        </g>
        <path d="M0 800 L0 760 Q200 740 400 760 L400 800 Z" fill={L.front} />
      </>);
  }

  return (
    <svg className={className} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {defs}{sky}{land}
      {lid === 'orage' && <rect width="400" height="800" fill="#1A2028" opacity=".12" />}
    </svg>
  );
}
