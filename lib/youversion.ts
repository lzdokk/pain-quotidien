/**
 * YOUVERSION PLATFORM (bible.com) — lecture à la volée, texte JAMAIS stocké.
 * ─────────────────────────────────────────────────────────────────────────
 * Voie LÉGALE pour les versions sous droits (Segond 21, Semeur, NBS, NEG,
 * Parole de Vie…) : tu crées une app sur platform.youversion.com, tu acceptes
 * la licence de chaque éditeur, et tu obtiens une clé (YVP_APP_KEY) + l'ID
 * numérique de chaque Bible. On lit ensuite chaque passage à la demande.
 *
 * API : https://api.youversion.com/v1/bibles/{id}/passages/{USFM}
 *   - chapitre : JHN.3   · verset : JHN.3.16
 *   - en-tête d'authentification : X-YVP-App-Key
 * Les codes USFM des 66 livres sont exactement ceux de lib/osis.ts.
 */
import { OSIS } from './osis';

const BASE = 'https://api.youversion.com/v1';
const authHeaders = () => ({ 'X-YVP-App-Key': process.env.YVP_APP_KEY ?? '' });
const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/** Un chapitre entier, en tableau [numéro, texte]. */
export async function fetchYouversionChapter(
  bibleId: string, book: number, chapter: number
): Promise<[number, string][]> {
  const usfm = OSIS[book - 1];
  if (!usfm) return [];
  const url = `${BASE}/bibles/${bibleId}/passages/${usfm}.${chapter}?format=html&include_headings=false&include_notes=false`;
  const r = await fetch(url, { headers: authHeaders(), next: { revalidate: 86400 } });
  if (!r.ok) throw new Error(`youversion ${r.status}`);
  const j = await r.json();
  return parseVerses(String(j?.content ?? ''));
}

/** Un seul verset (pour le comparateur). */
export async function fetchYouversionVerse(
  bibleId: string, book: number, chapter: number, verse: number
): Promise<string> {
  const usfm = OSIS[book - 1];
  if (!usfm) return '';
  const url = `${BASE}/bibles/${bibleId}/passages/${usfm}.${chapter}.${verse}?format=text`;
  const r = await fetch(url, { headers: authHeaders(), next: { revalidate: 86400 } });
  if (!r.ok) return '';
  const j = await r.json();
  return String(j?.content ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Découpe le HTML YouVersion en versets via les marqueurs `class="verse vN"`.
 * Défensif : si la structure ne correspond pas, on renvoie tout le chapitre en
 * un bloc (verset 1) plutôt que rien. (À affiner une fois testé avec la clé.)
 */
function parseVerses(html: string): [number, string][] {
  if (!html) return [];
  const re = /<span\b[^>]*class="[^"]*\bverse\b[^"]*\bv(\d+)\b[^"]*"[^>]*>/gi;
  const marks: { verse: number; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) marks.push({ verse: +m[1], index: m.index });

  if (marks.length === 0) {
    const t = strip(html);
    return t ? [[1, t]] : [];
  }

  const byVerse = new Map<number, string>();
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].index;
    const end = i + 1 < marks.length ? marks[i + 1].index : html.length;
    // On retire d'abord le numéro de verset (span "label"/"note"), puis les balises.
    const seg = html.slice(start, end)
      .replace(/<span\b[^>]*class="[^"]*\b(?:label|note)\b[^"]*"[^>]*>[\s\S]*?<\/span>/gi, ' ');
    const text = strip(seg);
    if (!text) continue;
    const v = marks[i].verse;
    byVerse.set(v, byVerse.has(v) ? `${byVerse.get(v)} ${text}` : text);
  }
  return [...byVerse.entries()].sort((a, b) => a[0] - b[0]);
}
