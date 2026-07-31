import { admin } from '@/lib/supabase/admin';

export type Verse = { verse: number; text: string };

const denorm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/**
 * Abreviations AELF vers noms complets du canon protestant.
 * Sans cette table, les evangiles (Mt, Mc, Lc, Jn) et la plupart des
 * epitres ne correspondent a aucun livre et sont perdus silencieusement.
 * Les livres deuterocanoniques (Tb, Jdt, 1 M, 2 M, Sg, Si, Ba) sont
 * remplaces en amont dans lib/aelf.ts, ils n'ont pas besoin d'entree ici.
 */
const ABBREV: Record<string, string> = {
  'gn': 'Genese', 'ex': 'Exode', 'lv': 'Levitique', 'nb': 'Nombres', 'dt': 'Deuteronome',
  'jos': 'Josue', 'jg': 'Juges', 'rt': 'Ruth',
  '1 s': '1 Samuel', '2 s': '2 Samuel', '1 r': '1 Rois', '2 r': '2 Rois',
  '1 ch': '1 Chroniques', '2 ch': '2 Chroniques', 'esd': 'Esdras', 'ne': 'Nehemie',
  'est': 'Esther', 'jb': 'Job', 'job': 'Job', 'ps': 'Psaumes', 'pr': 'Proverbes',
  'qo': 'Ecclesiaste', 'ec': 'Ecclesiaste', 'ct': 'Cantique',
  'is': 'Esaie', 'jr': 'Jeremie', 'lm': 'Lamentations', 'ez': 'Ezechiel', 'dn': 'Daniel',
  'os': 'Osee', 'jl': 'Joel', 'am': 'Amos', 'ab': 'Abdias', 'jon': 'Jonas', 'mi': 'Michee',
  'na': 'Nahum', 'ha': 'Habacuc', 'so': 'Sophonie', 'ag': 'Aggee', 'za': 'Zacharie', 'ml': 'Malachie',
  'mt': 'Matthieu', 'mc': 'Marc', 'lc': 'Luc', 'jn': 'Jean', 'ac': 'Actes', 'rm': 'Romains',
  '1 co': '1 Corinthiens', '2 co': '2 Corinthiens', 'ga': 'Galates', 'ep': 'Ephesiens',
  'ph': 'Philippiens', 'col': 'Colossiens', '1 th': '1 Thessaloniciens', '2 th': '2 Thessaloniciens',
  '1 tm': '1 Timothee', '2 tm': '2 Timothee', 'tt': 'Tite', 'phm': 'Philemon', 'he': 'Hebreux',
  'jc': 'Jacques', '1 p': '1 Pierre', '2 p': '2 Pierre',
  '1 jn': '1 Jean', '2 jn': '2 Jean', '3 jn': '3 Jean', 'jude': 'Jude', 'jud': 'Jude', 'ap': 'Apocalypse'
};

/** Reference "Michee 7.14-15,18-20" ou "Mt 5, 1-12" vers { name, chapter, verses[] } */
export function parseRef(ref: string) {
  const cleaned = ref.replace(/ /g, ' ').trim();
  // Psaume donne sans nom de livre par AELF : "33 (34), 2-3" ou "119, 1-8".
  // Attention : ne jamais confondre avec "2 Co 4, 7-15" ou "1 S 3, 1-10",
  // ou le chiffre initial fait partie du nom du livre. On exige donc que les
  // chiffres soient suivis d'une virgule ou d'une parenthese, pas d'une lettre.
  const c2 = /^\d+\s*(\(\d+\))?\s*[,.:]/.test(cleaned) ? 'Psaumes ' + cleaned : cleaned;
  // AELF numerote les psaumes a la grecque, l'hebreu est entre parentheses.
  // Segond 1910 suit l'hebreu : on prend le nombre entre parentheses s'il existe.
  const alt = c2.match(/\((\d+)\)/);
  const m = c2.match(/^(.+?)\s+(\d+)/);
  if (!m) return null;
  const name = m[1].trim();
  const chapter = alt ? +alt[1] : +m[2];
  const rest = c2.replace(/\(\d+\)/, '').replace(/^.+?\s+\d+[.,:]?/, '');
  const verses: number[] = [];
  rest.split(/[.,;]/).forEach(part => {
    const range = part.trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) { for (let v = +range[1]; v <= +range[2]; v++) verses.push(v); }
    else if (/^\d+$/.test(part.trim())) verses.push(+part.trim());
  });
  return { name, chapter, verses };
}

export async function bookIdByName(name: string) {
  const key = denorm(name);
  const full = ABBREV[key] ?? name;
  const norm = denorm(full);
  const { data } = await admin.from('books').select('id,name');
  return data?.find(b => denorm(b.name).startsWith(norm))?.id ?? null;
}

export async function getVerses(translation: string, book: number, chapter: number, only?: number[]) {
  let q = admin.from('verses').select('verse,text')
    .eq('translation', translation).eq('book', book).eq('chapter', chapter)
    .order('verse');
  if (only?.length) q = q.in('verse', only);
  const { data } = await q;
  return (data ?? []) as Verse[];
}

/** Traduction Bible du Semeur (BDS), avec repli sur Segond 1910. */
export async function bdsTranslation(): Promise<{ code: string; name: string }> {
  const { data } = await admin.from('translations').select('code, name').eq('enabled', true);
  const bds = (data ?? []).find((t: any) => /semeur|\bbds\b/i.test(`${t.code} ${t.name}`));
  return bds ?? { code: 'FRLSG', name: 'Segond 1910' };
}

/**
 * Recharge le texte des lectures du jour dans une traduction donnee (BDS par
 * defaut), en (re)calculant book/chapter au passage. Sans cela, les lectures
 * generees avant l'ajout de book/chapter n'affichaient aucun verset. Repli
 * silencieux sur le texte deja stocke si la reference ne se resout pas.
 */
export async function readingsWithTranslation(readings: any[], translation: string) {
  return Promise.all((readings ?? []).map(async (r: any) => {
    try {
      const p = await getPassage(r.reference, translation);
      if (p && p.verses.length) {
        return {
          ...r, book: p.book, chapter: p.chapter,
          verses: p.verses.map(v => [v.verse, v.text] as [number, string])
        };
      }
    } catch { /* repli ci-dessous */ }
    return r;
  }));
}

/** Recupere le texte d'une reference complete, dans la traduction demandee. */
export async function getPassage(ref: string, translation = 'FRLSG') {
  const parsed = parseRef(ref);
  if (!parsed) return null;
  const book = await bookIdByName(parsed.name);
  if (!book) return null;
  const verses = await getVerses(translation, book, parsed.chapter, parsed.verses);
  return { book, chapter: parsed.chapter, verses };
}
