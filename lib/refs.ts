/**
 * REFERENCES ABREGEES (« Gn 12.1-3 », « 1 Co 13.4-7 », « Ps 23 »)
 * Utilisable cote serveur ET navigateur (aucune base de donnees) : sert a
 * valider les references de l'index d'etude et a les rendre cliquables.
 */

// [abreviation, nom complet, nombre de chapitres] dans l'ordre canonique (id = index + 1)
export const BOOKS: Array<[string, string, number]> = [
  ['Gn', 'Genèse', 50], ['Ex', 'Exode', 40], ['Lv', 'Lévitique', 27], ['Nb', 'Nombres', 36], ['Dt', 'Deutéronome', 34],
  ['Jos', 'Josué', 24], ['Jg', 'Juges', 21], ['Rt', 'Ruth', 4], ['1 S', '1 Samuel', 31], ['2 S', '2 Samuel', 24],
  ['1 R', '1 Rois', 22], ['2 R', '2 Rois', 25], ['1 Ch', '1 Chroniques', 29], ['2 Ch', '2 Chroniques', 36], ['Esd', 'Esdras', 10],
  ['Ne', 'Néhémie', 13], ['Est', 'Esther', 10], ['Jb', 'Job', 42], ['Ps', 'Psaumes', 150], ['Pr', 'Proverbes', 31],
  ['Ec', 'Ecclésiaste', 12], ['Ct', 'Cantique des cantiques', 8], ['Es', 'Ésaïe', 66], ['Jr', 'Jérémie', 52], ['Lm', 'Lamentations', 5],
  ['Ez', 'Ézéchiel', 48], ['Dn', 'Daniel', 12], ['Os', 'Osée', 14], ['Jl', 'Joël', 3], ['Am', 'Amos', 9],
  ['Ab', 'Abdias', 1], ['Jon', 'Jonas', 4], ['Mi', 'Michée', 7], ['Na', 'Nahum', 3], ['Ha', 'Habacuc', 3],
  ['So', 'Sophonie', 3], ['Ag', 'Aggée', 2], ['Za', 'Zacharie', 14], ['Ml', 'Malachie', 4],
  ['Mt', 'Matthieu', 28], ['Mc', 'Marc', 16], ['Lc', 'Luc', 24], ['Jn', 'Jean', 21], ['Ac', 'Actes', 28],
  ['Rm', 'Romains', 16], ['1 Co', '1 Corinthiens', 16], ['2 Co', '2 Corinthiens', 13], ['Ga', 'Galates', 6], ['Ep', 'Éphésiens', 6],
  ['Ph', 'Philippiens', 4], ['Col', 'Colossiens', 4], ['1 Th', '1 Thessaloniciens', 5], ['2 Th', '2 Thessaloniciens', 3], ['1 Tm', '1 Timothée', 6],
  ['2 Tm', '2 Timothée', 4], ['Tt', 'Tite', 3], ['Phm', 'Philémon', 1], ['He', 'Hébreux', 13], ['Jc', 'Jacques', 5],
  ['1 P', '1 Pierre', 5], ['2 P', '2 Pierre', 3], ['1 Jn', '1 Jean', 5], ['2 Jn', '2 Jean', 1], ['3 Jn', '3 Jean', 1],
  ['Jude', 'Jude', 1], ['Ap', 'Apocalypse', 22]
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\s+/g, ' ').trim();

// Abreviations, variantes courantes et noms complets -> id du livre.
const LOOKUP = new Map<string, number>();
BOOKS.forEach(([ab, name], i) => {
  LOOKUP.set(norm(ab), i + 1);
  LOOKUP.set(norm(ab).replace(' ', ''), i + 1);
  LOOKUP.set(norm(name), i + 1);
});
for (const [k, v] of Object.entries({
  'is': 23, 'esa': 23, 'qo': 21, 'ec': 21, 'jb': 18, 'job': 18, 'he': 58, 'heb': 58, 'jud': 65, 'jude': 65,
  'ps': 19, 'psaume': 19, 'apoc': 66, 'phil': 50, 'tite': 56, 'ct': 22, 'cantique': 22, 'nb': 4, 'ne': 16,
  'ez': 26, 'ezk': 26, 'za': 38, 'zc': 38, 'ml': 39, 'mal': 39, 'jl': 29, 'ap': 66
})) LOOKUP.set(k, v);

export type ShortRef = {
  raw: string; label: string; book: number; bookName: string;
  chapter: number; vStart: number | null; vEnd: number | null;
};

/** « 1 Co 13.4-7 » -> { book: 46, chapter: 13, vStart: 4, vEnd: 7 }. Null si invalide. */
export function parseShortRef(raw: string): ShortRef | null {
  const s = raw.replace(/ /g, ' ').replace(/[–—]/g, '-').trim();
  const m = s.match(/^((?:[123]\s?)?[A-Za-zÀ-ÿ]+(?:\s+des\s+cantiques)?)\s*(\d+)(?:[.:,]\s*(\d+)(?:\s*-\s*(\d+))?)?/);
  if (!m) return null;
  const book = LOOKUP.get(norm(m[1])) ?? LOOKUP.get(norm(m[1]).replace(' ', ''));
  if (!book) return null;
  const [ab, name, chapters] = BOOKS[book - 1];
  let chapter = +m[2];
  let vStart = m[3] ? +m[3] : null;
  let vEnd = m[4] ? +m[4] : vStart;
  // Livre d'un seul chapitre : « Jude 3 » ou « Phm 10-12 » designent des versets.
  if (chapters === 1 && vStart === null && chapter > 1) {
    vStart = chapter; vEnd = m[4] ? +m[4] : chapter;
    const r2 = s.match(/^\S+(?:\s\S+)?\s*\d+\s*-\s*(\d+)/);
    if (r2) vEnd = +r2[1];
    chapter = 1;
  }
  if (chapter < 1 || chapter > chapters) return null;
  if (vStart !== null && vEnd !== null && vEnd < vStart) vEnd = vStart;
  if (vStart !== null && (vStart < 1 || vStart > 176)) return null;
  const label = `${ab} ${chapter}${vStart ? `.${vStart}${vEnd && vEnd !== vStart ? `-${vEnd}` : ''}` : ''}`;
  return { raw, label, book, bookName: name, chapter, vStart, vEnd };
}

/** Lien vers le lecteur du site (chapitre entier). */
export const readerHref = (r: ShortRef, from?: string) =>
  `/lire?ref=${encodeURIComponent(`${r.bookName} ${r.chapter}`)}${from ? `&from=${encodeURIComponent(from)}` : ''}`;
