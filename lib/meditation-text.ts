import { SITE_URL } from './site';

/** Texte simple (sans balises ni astérisques). */
export const plainText = (x?: string | null) => String(x ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')
  .replace(/\*+/g, '').replace(/(?<![A-Za-z0-9])_([^_]+?)_(?![A-Za-z0-9])/g, '$1').trim();

/**
 * La méditation complète d'un verset (ou d'un chapitre), prête à partager :
 * le verset, le mot, ce que dit le texte, une image, pour aller plus loin, à croiser.
 */
export function meditationText(o: {
  reference: string; verseText?: string; data: any; bookName: string; chapter: number; question?: string; answer?: string | null;
  withVerse?: boolean;
}) {
  const { data } = o;
  const parts: string[] = [`📖 ${o.reference}`];
  if (o.withVerse !== false && o.verseText) parts.push(`« ${plainText(o.verseText)} »`);
  const sec = (t: string, v?: string | null) => { const c = plainText(v); if (c) parts.push(`${t}\n${c}`); };
  if (data && (data.says || data.parable || data.development)) {
    if (data.word_term) parts.push(`LE MOT\n${plainText(data.word_term)}${data.word_lang ? ` (${plainText(data.word_lang)})` : ''}${data.word_sense ? ` : ${plainText(data.word_sense)}` : ''}`);
    sec('CE QUE DIT LE TEXTE', data.says);
    sec('UNE IMAGE', data.parable);
    sec('POUR ALLER PLUS LOIN', data.development);
    if (Array.isArray(data.cross_refs) && data.cross_refs.length) parts.push(`À CROISER\n${data.cross_refs.join(' · ')}`);
  } else if (data) {
    sec('CE QUE FAIT CE CHAPITRE', data.summary);
    if (Array.isArray(data.outline) && data.outline.length) parts.push(`LE DÉCOUPAGE\n${data.outline.map((x: string) => `• ${plainText(x)}`).join('\n')}`);
    sec('LA CLÉ DE LECTURE', data.reading_key);
    sec('POURQUOI IL EST LÀ', data.why_here);
  }
  if (o.answer && o.question?.trim()) parts.push(`MA QUESTION\n${o.question.trim()}\n${plainText(o.answer)}`);
  parts.push(`Pain de Vie · ${SITE_URL}/lire?ref=${encodeURIComponent(`${o.bookName} ${o.chapter}`)}`);
  return parts.join('\n\n');
}
