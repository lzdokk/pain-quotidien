import { bookName } from '@/lib/bible-books';

export type HighlightItem = {
  color: number; book: number; chapter: number; verse: number;
  bookName: string; ref: string; text: string;
};

/**
 * Versets colories de l'utilisateur connecte, avec leur texte
 * (Segond 21, complete par la Segond 1910 si besoin). Cote serveur.
 */
export async function loadHighlightItems(sb: any): Promise<HighlightItem[]> {
  const { data: hls } = await sb.from('highlights')
    .select('book, chapter, verse, color').order('book').order('chapter').order('verse');
  const highlights = (hls ?? []).filter((h: any) => h.color >= 1 && h.color <= 7);
  if (!highlights.length) return [];

  const k = (h: any) => `${h.book}-${h.chapter}-${h.verse}`;
  const textMap = new Map<string, string>();
  // Par paquets de 150 pour garder des requetes courtes.
  for (let i = 0; i < highlights.length && i < 900; i += 150) {
    const part = highlights.slice(i, i + 150);
    const or = part.map((h: any) => `and(book.eq.${h.book},chapter.eq.${h.chapter},verse.eq.${h.verse})`).join(',');
    for (const t of ['S21', 'FRLSG']) {
      const missing = part.filter((h: any) => !textMap.has(k(h)));
      if (!missing.length) break;
      const { data: vs } = await sb.from('verses').select('book, chapter, verse, text').eq('translation', t).or(or);
      for (const v of (vs ?? [])) if (!textMap.has(k(v))) textMap.set(k(v), v.text);
    }
  }

  return highlights.map((h: any) => {
    const bn = bookName(h.book, `Livre ${h.book}`);
    return {
      color: h.color, book: h.book, chapter: h.chapter, verse: h.verse, bookName: bn,
      ref: `${bn} ${h.chapter}.${h.verse}`, text: textMap.get(k(h)) ?? ''
    };
  });
}
