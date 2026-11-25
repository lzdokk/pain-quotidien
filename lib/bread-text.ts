import { SITE_URL } from './site';
import { plainText } from './meditation-text';

/**
 * La méditation du Pain du jour, prête à partager avec l'image du verset :
 * thème, verset, message, ce que dit le texte, ce que ça touche, à retenir, lien.
 */
export function breadText(day: any, verseText?: string | null) {
  if (!day) return '';
  const parts: string[] = [];
  if (day.theme_title) parts.push(`☀️ ${plainText(day.theme_title)}`);
  const v = verseText || day.verse_text;
  if (v) parts.push(`« ${plainText(v)} »${day.verse_ref ? ` — ${day.verse_ref}` : ''}`);
  const sec = (t: string | null, x: any) => {
    const c = Array.isArray(x) ? x.map(plainText).filter(Boolean).join('\n\n') : plainText(x);
    if (c) parts.push(t ? `${t}\n${c}` : c);
  };
  sec(null, day.theme_lede);
  sec('LE MESSAGE', day.central_message);
  sec('LE PAIN QUOTIDIEN', day.bread_lead);
  sec('CE QUE DIT LE TEXTE', day.bread_says);
  sec('CE QUE ÇA TOUCHE EN NOUS', day.bread_touches);
  sec('À RETENIR AUJOURD’HUI', day.bread_close);
  parts.push(`Pain de Vie · ${SITE_URL}${day.date ? `/jour/${day.date}` : '/pain'}`);
  return parts.join('\n\n');
}
