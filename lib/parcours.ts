/**
 * PARCOURS D'ÉTUDE : quels livres méditer, et dans quel ordre.
 * Données statiques (aucune base, aucun crédit IA). Chaque étape est un texte
 * court (« Jean », « Matthieu 5-7 ») résolu vers un livre de lib/refs.ts.
 */
import { BOOKS } from './refs';

export type Groupe = 'fondations' | 'livres' | 'themes';
export type Parcours = { id: string; titre: string; pour: string; groupe: Groupe; etapes: string[] };

export const GROUPES: Array<{ id: Groupe; label: string }> = [
  { id: 'fondations', label: 'Fondations' },
  { id: 'livres', label: 'Par livres' },
  { id: 'themes', label: 'Thèmes d’actualité' }
];

const TOUS_LES_LIVRES = BOOKS.map(b => b[1]);

export const PARCOURS: Parcours[] = [
  { id: 'premiers-pas', groupe: 'fondations', titre: 'Premiers pas avec Jésus', pour: 'Pour commencer ou recommencer',
    etapes: ['Jean', '1 Jean', 'Marc', 'Actes', 'Éphésiens', 'Philippiens', 'Psaumes', 'Proverbes', 'Romains', 'Genèse'] },
  { id: 'fil-rouge', groupe: 'fondations', titre: 'Le fil rouge du salut', pour: 'Comprendre l’histoire d’ensemble',
    etapes: ['Genèse', 'Exode', 'Deutéronome', 'Josué', '1 Samuel', '2 Samuel', 'Ésaïe', 'Luc', 'Romains', 'Apocalypse'] },
  { id: 'bible-dans-lordre', groupe: 'fondations', titre: 'La Bible dans l’ordre', pour: 'Lecture continue, livre après livre',
    etapes: TOUS_LES_LIVRES },
  { id: 'connaitre-jesus', groupe: 'livres', titre: 'Connaître Jésus', pour: 'Sa vie, sa mission, sa gloire',
    etapes: ['Marc', 'Matthieu', 'Luc', 'Jean', 'Actes', 'Hébreux', 'Apocalypse'] },
  { id: 'paul', groupe: 'livres', titre: 'Paul, dans l’ordre d’écriture', pour: 'Suivre l’apôtre et sa doctrine',
    etapes: ['Galates', '1 Thessaloniciens', '2 Thessaloniciens', '1 Corinthiens', '2 Corinthiens', 'Romains', 'Colossiens', 'Philémon', 'Éphésiens', 'Philippiens', '1 Timothée', 'Tite', '2 Timothée'] },
  { id: 'priere-sagesse', groupe: 'livres', titre: 'Prière et sagesse', pour: 'Prier, souffrir, bien vivre',
    etapes: ['Psaumes', 'Proverbes', 'Job', 'Ecclésiaste', 'Lamentations', 'Cantique des cantiques', 'Jacques'] },
  { id: 'prophetes', groupe: 'livres', titre: 'Les prophètes', pour: 'La voix de Dieu à Israël',
    etapes: ['Ésaïe', 'Jérémie', 'Ézéchiel', 'Daniel', 'Osée', 'Joël', 'Amos', 'Jonas', 'Michée', 'Habacuc', 'Malachie'] },
  { id: 'loi-alliance', groupe: 'livres', titre: 'Loi et alliance', pour: 'L’Ancien Testament à la lumière du Christ',
    etapes: ['Genèse', 'Exode', 'Lévitique', 'Nombres', 'Deutéronome', 'Galates', 'Romains', 'Hébreux'] },
  { id: 'foi-quotidien', groupe: 'livres', titre: 'Foi vécue au quotidien', pour: 'Marcher avec Dieu concrètement',
    etapes: ['Matthieu 5-7', 'Jacques', '1 Pierre', 'Philippiens', 'Colossiens', 'Ruth', 'Néhémie', 'Esther'] },
  { id: 'esperance', groupe: 'livres', titre: 'Espérance et retour du Christ', pour: 'Tenir ferme dans l’attente',
    etapes: ['Daniel', 'Zacharie', 'Matthieu 24-25', '1 Thessaloniciens', '2 Thessaloniciens', '2 Pierre', 'Jude', 'Apocalypse'] },
  { id: 'couple', groupe: 'themes', titre: 'Couple et mariage', pour: 'Fonder, nourrir, réparer',
    etapes: ['Genèse 1-2', 'Proverbes 5 et 31', 'Cantique des cantiques', 'Ruth', '1 Corinthiens 7 et 13', 'Éphésiens 5', '1 Pierre 3', 'Malachie 2'] },
  { id: 'famille', groupe: 'themes', titre: 'Famille et enfants', pour: 'Transmettre la foi',
    etapes: ['Deutéronome 6', '1 Samuel 1-3', 'Psaumes 127-128', 'Proverbes 22', 'Luc 2', 'Éphésiens 6', 'Colossiens 3', '2 Timothée 1'] },
  { id: 'israel', groupe: 'themes', titre: 'Israël et l’Église', pour: 'Les promesses et le plan de Dieu',
    etapes: ['Genèse 12', 'Exode 19', 'Ésaïe 49', 'Jérémie 31', 'Ézéchiel 36-37', 'Romains 9-11', 'Éphésiens 2', 'Zacharie 12-14'] },
  { id: 'amour', groupe: 'themes', titre: 'L’amour', pour: 'Aimer comme Dieu aime',
    etapes: ['Jean 13-15', '1 Jean 3-4', '1 Corinthiens 13', 'Luc 10', 'Matthieu 5', 'Romains 12', 'Osée'] },
  { id: 'pardon', groupe: 'themes', titre: 'Pardon et réconciliation', pour: 'Recevoir et donner le pardon',
    etapes: ['Genèse 45', 'Psaumes 32', 'Psaumes 51', 'Luc 15', 'Matthieu 18', 'Éphésiens 4', 'Colossiens 3', 'Philémon'] },
  { id: 'combat', groupe: 'themes', titre: 'Combat spirituel et protection', pour: 'Tenir bon dans l’épreuve',
    etapes: ['Job 1-2', 'Luc 4', 'Psaumes 91', 'Éphésiens 6', 'Jacques 4', '1 Pierre 5', 'Apocalypse 12'] },
  { id: 'esprit', groupe: 'themes', titre: 'Le Saint-Esprit', pour: 'Sa personne, son œuvre',
    etapes: ['Jean 14-16', 'Actes 1-2', 'Romains 8', '1 Corinthiens 12-14', 'Galates 5', 'Éphésiens 5'] },
  { id: 'temoigner', groupe: 'themes', titre: 'Témoigner et évangéliser', pour: 'Parler de Jésus autour de soi',
    etapes: ['Jean 4', 'Actes 8-10', 'Actes 17', 'Romains 10', '1 Pierre 3', 'Jonas', 'Matthieu 28'] },
  { id: 'travail-argent', groupe: 'themes', titre: 'Travail, argent, intégrité', pour: 'Vivre sa foi au travail',
    etapes: ['Genèse 39', 'Proverbes', 'Ecclésiaste 5', 'Néhémie', 'Matthieu 6', 'Luc 16', 'Colossiens 3', '1 Timothée 6'] },
  { id: 'epreuve-confiance', groupe: 'themes', titre: 'Épreuve, peur, confiance', pour: 'Tenir quand tout vacille',
    etapes: ['Psaumes 23', 'Psaumes 27', 'Psaumes 46', 'Psaumes 121', 'Ésaïe 40-43', 'Habacuc', '2 Corinthiens 1 et 4', 'Philippiens 4', 'Matthieu 6:25-34'] }
];

export const parcoursById = (id: string) => PARCOURS.find(p => p.id === id);

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const NOMS = BOOKS.map(([, nom], i) => ({ id: i + 1, n: norm(nom), nom }))
  .concat([{ id: 19, n: 'psaume', nom: 'Psaumes' }, { id: 22, n: 'cantique', nom: 'Cantique des cantiques' }])
  .sort((a, b) => b.n.length - a.n.length);

export type Etape = { label: string; book: number; chapter: number | null; href: string };

/** « Matthieu 5-7 » -> { book: 40, chapter: 5, href: '/lire?ref=Matthieu 5' } */
export function resoudreEtape(label: string): Etape | null {
  const n = norm(label);
  const hit = NOMS.find(b => n === b.n || n.startsWith(b.n + ' '));
  if (!hit) return null;
  const rest = n.slice(hit.n.length);
  const m = rest.match(/\d+/);
  const chapter = m ? +m[0] : null;
  const nom = BOOKS[hit.id - 1][1];
  return { label, book: hit.id, chapter, href: `/lire?ref=${encodeURIComponent(`${nom} ${chapter ?? 1}`)}` };
}

/**
 * Chapitres couverts par une étape : « Matthieu 5-7 » -> [5,6,7], « 2 Corinthiens 1 et 4 » -> [1,4],
 * « Jean » -> tous les chapitres. Liste vide si l'étape est une sélection (« Psaumes choisis »).
 */
export function chapitresEtape(label: string): { book: number; chapters: number[] } | null {
  const n = norm(label);
  const hit = NOMS.find(b => n === b.n || n.startsWith(b.n + ' '));
  if (!hit) return null;
  const total = BOOKS[hit.id - 1][2];
  const rest = n.slice(hit.n.length).replace(/[:.]\d+(?:\s*[-–]\s*\d+)?/g, '');
  if (/choisi/.test(rest)) return { book: hit.id, chapters: [] };
  const out = new Set<number>();
  for (const m of rest.matchAll(/(\d+)(?:\s*(?:-|–|a)\s*(\d+))?/g)) {
    const a = +m[1], b = m[2] ? +m[2] : a;
    for (let c = a; c <= Math.min(b, total); c++) if (c >= 1) out.add(c);
  }
  const chapters = out.size ? [...out].sort((x, y) => x - y) : Array.from({ length: total }, (_, i) => i + 1);
  return { book: hit.id, chapters };
}

/** Chapitre à lire un jour donné d'une étape de plan quotidien (répartition régulière). */
export function chapitreDuJour(step: { book: number; label: string; chapters: number; key_passages?: string[] }, jour: number): { book: number; chapter: number } {
  let info = chapitresEtape(step.label);
  let liste = info?.chapters ?? [];
  if (!info || liste.length === 0) {
    const kp = (step.key_passages ?? []).map(k => resoudreEtape(k.split(',')[0])).filter((e): e is Etape => !!e);
    if (kp.length) {
      const e = kp[Math.min(kp.length - 1, Math.floor((jour - 1) * kp.length / Math.max(1, step.chapters)))];
      return { book: e.book, chapter: e.chapter ?? 1 };
    }
    return { book: step.book, chapter: 1 };
  }
  const idx = Math.min(liste.length - 1, Math.floor((jour - 1) * liste.length / Math.max(1, step.chapters)));
  return { book: info.book, chapter: liste[idx] };
}

/** Section du plan d'un livre où se trouve un chapitre (« 5-8 : la vie nouvelle… »). */
export function sectionDuChapitre(pl: string[], c: number): string | null {
  let found: string | null = null;
  for (const it of pl) {
    let a: number, b: number, m: RegExpMatchArray | null;
    if ((m = it.match(/^(\d+):\d+\s*-\s*(\d+):\d+/))) { a = +m[1]; b = +m[2]; }
    else if ((m = it.match(/^(\d+):\d+\s*-\s*\d+/))) { a = b = +m[1]; }
    else if ((m = it.match(/^(\d+)\s*-\s*(\d+)/))) { a = +m[1]; b = +m[2]; }
    else if ((m = it.match(/^(\d+)/))) { a = b = +m[1]; }
    else continue;
    if (c >= a && c <= b) found = it;
  }
  return found;
}
