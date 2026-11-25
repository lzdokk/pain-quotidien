/**
 * PAYSAGES DE L'ACCUEIL : sept scènes dessinées (SVG), nettes sur tout écran,
 * légères et sans droits d'image. Une par jour, ou au choix (Personnaliser).
 */
export const SCENES = [
  { id: 'aube', label: 'Aube' },
  { id: 'nuages', label: 'Nuages' },
  { id: 'mer', label: 'Mer' },
  { id: 'nuit', label: 'Nuit étoilée' },
  { id: 'foret', label: 'Forêt' },
  { id: 'dunes', label: 'Dunes' },
  { id: 'lac', label: 'Lac' }
] as const;
export type SceneId = typeof SCENES[number]['id'];

/** Scène du jour (même résultat côté serveur et téléphone). */
export function sceneOfDay(date: string): SceneId {
  const [y, m, d] = date.split('-').map(Number);
  const n = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  return SCENES[n % SCENES.length].id;
}

const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const lin = (id: string, stops: Array<[number, string, number?]>, vertical = true) => (
  <linearGradient id={id} x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
    {stops.map(([o, c, a], i) => <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />)}
  </linearGradient>
);
const glow = (id: string, c: string, a = 0.7) => (
  <radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity={a} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>
);
/** Ligne de crêtes douce. */
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
function pines(r: () => number, base: number, h: number, count: number, color: string, op = 1) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = (i / count) * 420 - 10 + r() * 12, hh = h * (0.7 + r() * 0.6), w = hh * 0.34, y = base + r() * 18;
    out.push(<path key={i} d={`M${x} ${y - hh} L${x + w} ${y} L${x - w} ${y} Z`} fill={color} opacity={op} />);
  }
  return out;
}

export default function HeroScene({ id, className }: { id: SceneId; className?: string }) {
  const r = rng(id.length * 97 + 13);
  const P = `s-${id}`;
  let body: JSX.Element;

  switch (id) {
    case 'aube':
      body = (<>
        <defs>
          {lin(`${P}-sky`, [[0, '#262C55'], [0.42, '#7E6497'], [0.68, '#DE8F86'], [0.84, '#F5C78F']])}
          {glow(`${P}-sun`, '#FFE2AE', 0.85)}
          {lin(`${P}-mist`, [[0, '#fff', 0], [0.5, '#FBE3D2', 0.35], [1, '#fff', 0]])}
        </defs>
        <rect width="400" height="800" fill={`url(#${P}-sky)`} />
        <circle cx="210" cy="575" r="260" fill={`url(#${P}-sun)`} />
        <circle cx="210" cy="575" r="40" fill="#FFF0CF" />
        <path d={ridge(r, 600, 60, 8)} fill="#A07FA0" opacity=".78" />
        <rect y="590" width="400" height="70" fill={`url(#${P}-mist)`} />
        <path d={ridge(r, 655, 55, 7)} fill="#6C5784" />
        <path d={ridge(r, 715, 45, 6)} fill="#3A3153" />
        <path d={ridge(r, 770, 30, 5)} fill="#231E36" />
      </>);
      break;
    case 'nuages': {
      const clouds = [];
      for (let i = 0; i < 26; i++) {
        const x = r() * 440 - 20, y = 560 + r() * 240, rx = 50 + r() * 90, ry = 22 + r() * 34;
        clouds.push(<ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 3 ? '#F3A792' : '#FBD0B5'} opacity={0.55 + r() * 0.4} />);
      }
      body = (<>
        <defs>
          {lin(`${P}-sky`, [[0, '#3F4F6B'], [0.45, '#6E6C8C'], [0.75, '#A88498'], [1, '#C99AA0']])}
          <filter id={`${P}-blur`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
          {glow(`${P}-l`, '#FFD9C2', 0.45)}
        </defs>
        <rect width="400" height="800" fill={`url(#${P}-sky)`} />
        <circle cx="120" cy="620" r="300" fill={`url(#${P}-l)`} />
        <g filter={`url(#${P}-blur)`}>{clouds}</g>
      </>);
      break;
    }
    case 'mer': {
      const refl = [];
      for (let i = 0; i < 46; i++) {
        const t = i / 46, y = 534 + t * 250 + r() * 6, w = (16 + r() * 60) * (1 - t * 0.5);
        refl.push(<ellipse key={i} cx={205 + (r() - 0.5) * (30 + t * 120)} cy={y} rx={w / 2} ry={1 + r() * 1.4} fill="#FFD6A0" opacity={(0.8 - t * 0.7) * (0.5 + r() * 0.5)} />);
      }
      body = (<>
        <defs>
          {lin(`${P}-sky`, [[0, '#1F2B57'], [0.4, '#6B4F7E'], [0.58, '#D0717A'], [0.66, '#F4A766']])}
          {lin(`${P}-sea`, [[0, '#3B3F6E'], [0.4, '#252B52'], [1, '#0F1430']])}
          {glow(`${P}-sun`, '#FFC98A', 0.8)}
          <filter id={`${P}-soft`} x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="1.3" /></filter>
        </defs>
        <rect width="400" height="800" fill={`url(#${P}-sky)`} />
        <circle cx="205" cy="528" r="230" fill={`url(#${P}-sun)`} />
        <circle cx="205" cy="528" r="36" fill="#FFE6BB" />
        <rect y="528" width="400" height="272" fill={`url(#${P}-sea)`} />
        <rect y="526" width="400" height="5" fill="#FFC98A" opacity=".35" filter={`url(#${P}-soft)`} />
        <g filter={`url(#${P}-soft)`}>{refl}</g>
      </>);
      break;
    }
    case 'nuit': {
      const stars = [];
      for (let i = 0; i < 230; i++) {
        stars.push(<circle key={i} cx={r() * 400} cy={r() * 640} r={r() < 0.92 ? r() * 0.9 + 0.25 : r() * 1.6 + 0.9} fill="#fff" opacity={0.25 + r() * 0.75} />);
      }
      body = (<>
        <defs>
          {lin(`${P}-sky`, [[0, '#03060F'], [0.55, '#0C1631'], [1, '#26305A']])}
          <filter id={`${P}-b`}><feGaussianBlur stdDeviation="22" /></filter>
          {glow(`${P}-moon`, '#F4EEDA', 0.5)}
        </defs>
        <rect width="400" height="800" fill={`url(#${P}-sky)`} />
        <ellipse cx="200" cy="330" rx="70" ry="460" transform="rotate(32 200 330)" fill="#B9C3F0" opacity=".16" filter={`url(#${P}-b)`} />
        {stars}
        <circle cx="305" cy="150" r="70" fill={`url(#${P}-moon)`} />
        <circle cx="305" cy="150" r="17" fill="#F6F2E2" />
        <path d={ridge(r, 700, 50, 6)} fill="#0E1528" />
        <path d={ridge(r, 750, 35, 5)} fill="#060A16" />
      </>);
      break;
    }
    case 'foret':
      body = (<>
        <defs>
          {lin(`${P}-sky`, [[0, '#6F8A80'], [0.5, '#A8B9A9'], [1, '#C9D3C4']])}
          {lin(`${P}-mist`, [[0, '#DDE5DA', 0], [1, '#DDE5DA', 0.85]])}
          {glow(`${P}-sun`, '#FFF4D6', 0.55)}
        </defs>
        <rect width="400" height="800" fill={`url(#${P}-sky)`} />
        <circle cx="270" cy="300" r="220" fill={`url(#${P}-sun)`} />
        {pines(r, 560, 90, 22, '#8FA493', 0.65)}
        <rect y="470" width="400" height="120" fill={`url(#${P}-mist)`} opacity=".7" />
        {pines(r, 640, 130, 16, '#5D7764')}
        <rect y="560" width="400" height="110" fill={`url(#${P}-mist)`} opacity=".45" />
        {pines(r, 740, 190, 11, '#2C4234')}
        <rect y="740" width="400" height="60" fill="#22352A" />
      </>);
      break;
    case 'dunes':
      body = (<>
        <defs>
          {lin(`${P}-sky`, [[0, '#7B8FB0'], [0.45, '#E3B996'], [0.7, '#F2CFA4']])}
          {lin(`${P}-d1`, [[0, '#E2A970'], [1, '#C2824F']])}
          {lin(`${P}-d2`, [[0, '#C98854'], [1, '#9E5F35']])}
          {lin(`${P}-d3`, [[0, '#A9673A'], [1, '#6E3C1F']])}
          {glow(`${P}-sun`, '#FFF0D2', 0.7)}
        </defs>
        <rect width="400" height="800" fill={`url(#${P}-sky)`} />
        <circle cx="120" cy="470" r="200" fill={`url(#${P}-sun)`} />
        <circle cx="120" cy="470" r="26" fill="#FFF6E2" />
        <path d="M0 580 Q90 520 190 560 T400 540 V800 H0 Z" fill={`url(#${P}-d1)`} />
        <path d="M0 650 Q120 590 230 640 T400 620 V800 H0 Z" fill={`url(#${P}-d2)`} />
        <path d="M0 720 Q140 660 260 710 T400 690 V800 H0 Z" fill={`url(#${P}-d3)`} />
        <path d="M0 650 Q120 590 230 640" stroke="#F3C08B" strokeWidth="1.4" fill="none" opacity=".6" />
      </>);
      break;
    case 'lac':
    default: {
      const far = ridge(r, 470, 110, 6, false), near = ridge(r, 470, 60, 8, false);
      body = (<>
        <defs>
          {lin(`${P}-sky`, [[0, '#7E9DBE'], [0.45, '#C2D2E0'], [0.59, '#EBD9CB']])}
          {lin(`${P}-water`, [[0, '#8EA6BE'], [1, '#2C4560']])}
          <clipPath id={`${P}-top`}><rect width="400" height="470" /></clipPath>
        </defs>
        <rect width="400" height="800" fill={`url(#${P}-sky)`} />
        <g clipPath={`url(#${P}-top)`}>
          <path d={far} fill="#7A8FA8" />
          <path d={near} fill="#4C6178" />
        </g>
        <rect y="470" width="400" height="330" fill={`url(#${P}-water)`} />
        <g transform="translate(0 940) scale(1 -1)" opacity=".35" clipPath={`url(#${P}-top)`}>
          <path d={far} fill="#7A8FA8" />
          <path d={near} fill="#4C6178" />
        </g>
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={40 + r() * 300} y={490 + i * 20} width={30 + r() * 80} height="1.2" fill="#fff" opacity={0.25 - i * 0.012} />
        ))}
      </>);
    }
  }
  return (
    <svg className={className} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">{body}</svg>
  );
}
