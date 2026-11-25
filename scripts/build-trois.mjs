/**
 * Construit lib/trois-lectures-data.ts depuis data/trois-lectures.txt et vérifie :
 *  - 1re lecture : Nouveau Testament (les jours suivent les grands thèmes du NT) ;
 *  - 2e lecture : livre poétique (Job, Psaumes, Proverbes, Ecclésiaste, Cantique) ;
 *  - 3e lecture : Ancien Testament (hors poétiques), choisie en reflet du NT ;
 *  - affiche les chapitres du NT et poétiques pas encore lus, et les doublons de l'AT.
 * Ligne : « Jn 1 | Ps 8 | Gn 1 | Thème | Le fil | Question »  (# = commentaire, ## Bloc = titre de partie)
 */
import fs from 'fs';
const TOTAL = 365;
const src = fs.readFileSync('lib/refs.ts', 'utf8');
const BOOKS = [...src.matchAll(/\['([^']+)', '([^']+)', (\d+)\]/g)].map(m => [m[1], m[2], +m[3]]);
const ab = new Map(BOOKS.map(([a], i) => [a.replace(/\s/g, '').toLowerCase(), i + 1]));
const POE = new Set([18, 19, 20, 21, 22]);

const ref = (s, n) => {
  const m = s.trim().match(/^(\d?\s?[A-Za-zéèÉ]+)\s+(\d+)$/);
  if (!m) throw new Error(`ligne ${n} : référence illisible « ${s} »`);
  const b = ab.get(m[1].replace(/\s/g, '').toLowerCase());
  if (!b) throw new Error(`ligne ${n} : livre inconnu « ${m[1]} »`);
  const c = +m[2];
  if (c < 1 || c > BOOKS[b - 1][2]) throw new Error(`ligne ${n} : ${s} n'existe pas`);
  return [b, c];
};

const days = [], blocs = [];
fs.readFileSync('data/trois-lectures.txt', 'utf8').split('\n').forEach((l, i) => {
  if (l.startsWith('## ')) { blocs.push([days.length + 1, l.slice(3).trim()]); return; }
  if (!l.trim() || l.startsWith('#')) return;
  const p = l.split('|').map(x => x.trim());
  if (p.length !== 6 || p.some(x => !x)) throw new Error(`ligne ${i + 1} : il faut 6 champs\n${l}`);
  const nt = ref(p[0], i + 1), po = ref(p[1], i + 1), a = ref(p[2], i + 1);
  if (nt[0] < 40) throw new Error(`ligne ${i + 1} : ${p[0]} n'est pas dans le NT`);
  if (!POE.has(po[0])) throw new Error(`ligne ${i + 1} : ${p[1]} n'est pas un livre poétique`);
  if (a[0] > 39 || POE.has(a[0])) throw new Error(`ligne ${i + 1} : ${p[2]} doit être un livre de l'AT non poétique`);
  days.push([...a, ...po, ...nt, p[3], p[4], p[5]]);
});

const seenP = new Set(days.map(d => `${d[2]}.${d[3]}`)), seenN = new Set(days.map(d => `${d[4]}.${d[5]}`));
const missing = (from, to, seen, ok) => { const out = []; for (let b = from; b <= to; b++) if (ok(b)) { const miss = []; for (let c = 1; c <= BOOKS[b - 1][2]; c++) if (!seen.has(`${b}.${c}`)) miss.push(c); if (miss.length) out.push(`${BOOKS[b - 1][0]} ${miss.join(',')}`); } return out; };
const mp = missing(18, 22, seenP, b => POE.has(b)), mn = missing(40, 66, seenN, () => true);
const cnt = (arr) => arr.reduce((n, s) => n + s.split(' ').pop().split(',').length, 0);
const atCount = {}; days.forEach(d => { const k = `${BOOKS[d[0] - 1][0]} ${d[1]}`; atCount[k] = (atCount[k] || 0) + 1; });
const dupAT = Object.entries(atCount).filter(([, v]) => v > 1).map(([k, v]) => `${k}×${v}`);
console.log(`${days.length} jours écrits sur ${TOTAL}.`);
console.log(`NT pas encore lus (${cnt(mn)}) : ${mn.join(' · ')}`);
console.log(`Poétiques pas encore lus (${cnt(mp)}) : ${mp.join(' · ')}`);
console.log(`AT en double (${dupAT.length}) : ${dupAT.join(' · ')}`);
if (process.argv.includes('--strict') && (mp.length || mn.length || days.length !== TOTAL)) { console.error('Incomplet'); process.exit(1); }

fs.writeFileSync('lib/trois-lectures-data.ts', `/* Généré par scripts/build-trois.mjs depuis data/trois-lectures.txt : ne pas modifier à la main. */
/** [livreAT, chap, livrePoétique, chap, livreNT, chap, thème, fil, question] */
export type TroisJour = [number, number, number, number, number, number, string, string, string];
export const TOTAL_PREVU = ${TOTAL};
/** Les grandes parties : [premier jour, titre] */
export const TROIS_BLOCS: Array<[number, string]> = ${JSON.stringify(blocs)};
export const TROIS: TroisJour[] = ${JSON.stringify(days).replace(/\],\[/g, '],\n[')};
`);
