import { admin } from '@/lib/supabase/admin';

export type Verse = { verse: number; text: string };

/** Reference "Michee 7.14-15,18-20" vers { book, chapter, verses[] } */
export function parseRef(ref: string) {
  const m = ref.match(/^(.+?)\s+(\d+)[.:]?\s*(.*)$/);
  if (!m) return null;
  const [, name, chapter, rest] = m;
  const verses: number[] = [];
  rest.split(/[,;]/).forEach(part => {
    const range = part.trim().match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) { for (let v = +range[1]; v <= +range[2]; v++) verses.push(v); }
    else if (/^\d+$/.test(part.trim())) verses.push(+part.trim());
  });
  return { name: name.trim(), chapter: +chapter, verses };
}

export async function bookIdByName(name: string) {
  const norm = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const { data } = await admin.from('books').select('id,name');
  return data?.find(b =>
    b.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').startsWith(norm)
  )?.id ?? null;
}

export async function getVerses(translation: string, book: number, chapter: number, only?: number[]) {
  let q = admin.from('verses').select('verse,text')
    .eq('translation', translation).eq('book', book).eq('chapter', chapter)
    .order('verse');
  if (only?.length) q = q.in('verse', only);
  const { data } = await q;
  return (data ?? []) as Verse[];
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
