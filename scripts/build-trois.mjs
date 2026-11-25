/**
 * Construit lib/trois-lectures-data.ts depuis data/trois-lectures.txt et vérifie :
 *  - l'Ancien Testament suit l'ordre (Genèse 1 → Malachie 4, sans les livres poétiques) ;
 *  - la 2e lecture est poétique (Job, Psaumes, Proverbes, Ecclésiaste, Cantique) ;
 *  - la 3e lecture est dans le Nouveau Testament ;
 *  - affiche les chapitres poétiques et du NT pas encore lus.
 * Ligne : « Gn 1 | Ps 8 | Jn 1 | Thème | Le fil | Question »  (# = commentaire)
 */
import fs from 'fs';
const src = fs.readFileSync('lib/refs.ts', 'utf8');
const BOOKS = [...src.matchAll(/\['([^']+)', '([^']+)', (\d+)\]/g)].map(m => [m[1], m[2], +m[3]]);
const ab = new Map(BOOKS.map(([a], i) => [a.replace(/\s/g, '').toLowerCase(), i + 1]));
const POE = new Set([18, 19, 20, 21, 22]);
const AT = [];
for (let b = 1; b <= 39; b++) if (!POE.has(b)) for (let c = 1; c <= BOOKS[b - 1][2]; c++) AT.push([b, c]);

const ref = (s, n) => {
  const m = s.trim().match(/^(\d?\s?[A-Za-zéèÉ]+)\s+(\d+)$/);
  if (!m) throw new Error(`ligne ${n} : référence illisible « ${s} »`);
  const b = ab.get(m[1].replace(/\s/g, '').toLowerCase());
  if (!b) throw new Error(`ligne ${n} : livre inconnu « ${m[1]} »`);
  const c = +m[2];
  if (c < 1 || c > BOOKS[b - 1][2]) throw new Error(`ligne ${n} : ${s} n'existe pas`);
  return [b, c];
};

const days = [];
fs.readFileSync('data/trois-lectures.txt', 'utf8').split('\n').forEach((l, i) => {
  if (!l.trim() || l.startsWith('#')) return;
  const p = l.split('|').map(x => x.trim());
  if (p.length !== 6 || p.some(x => !x)) throw new Error(`ligne ${i + 1} : il faut 6 champs\n${l}`);
  const a = ref(p[0], i + 1), po = ref(p[1], i + 1), nt = ref(p[2], i + 1);
  const exp = AT[days.length];
  if (!exp || a[0] !== exp[0] || a[1] !== exp[1]) throw new Error(`ligne ${i + 1} : jour ${days.length + 1}, attendu ${BOOKS[exp[0] - 1][0]} ${exp[1]}, trouvé ${p[0]}`);
  if (!POE.has(po[0])) throw new Error(`ligne ${i + 1} : ${p[1]} n'est pas un livre poétique`);
  if (nt[0] < 40) throw new Error(`ligne ${i + 1} : ${p[2]} n'est pas dans le NT`);
  days.push([...a, ...po, ...nt, p[3], p[4], p[5]]);
});

const seenP = new Set(days.map(d => `${d[2]}.${d[3]}`)), seenN = new Set(days.map(d => `${d[4]}.${d[5]}`));
const missing = (from, to) => { const out = []; for (let b = from; b <= to; b++) if (b < 40 ? POE.has(b) : true) { const miss = []; for (let c = 1; c <= BOOKS[b - 1][2]; c++) if (!(b < 40 ? seenP : seenN).has(`${b}.${c}`)) miss.push(c); if (miss.length) out.push(`${BOOKS[b - 1][0]} ${miss.join(',')}`); } return out; };
const mp = missing(18, 22), mn = missing(40, 66);
const cnt = (arr) => arr.reduce((n, s) => n + s.split(' ').pop().split(',').length, 0);
console.log(`${days.length} jours écrits sur ${AT.length}. Reste ${AT.length - days.length} jours ; prochain AT : ${AT[days.length] ? BOOKS[AT[days.length][0] - 1][0] + ' ' + AT[days.length][1] : 'fini'}`);
console.log(`Poétiques pas encore lus (${cnt(mp)}) : ${mp.join(' · ')}`);
console.log(`NT pas encore lus (${cnt(mn)}) : ${mn.join(' · ')}`);
if (process.argv.includes('--strict') && (mp.length || mn.length || days.length !== AT.length)) { console.error('Incomplet'); process.exit(1); }

fs.writeFileSync('lib/trois-lectures-data.ts', `/* Généré par scripts/build-trois.mjs depuis data/trois-lectures.txt : ne pas modifier à la main. */
/** [livreAT, chap, livrePoétique, chap, livreNT, chap, thème, fil, question] */
export type TroisJour = [number, number, number, number, number, number, string, string, string];
export const TOTAL_PREVU = ${AT.length};
export const TROIS: TroisJour[] = ${JSON.stringify(days).replace(/\],\[/g, '],\n[')};
`);
