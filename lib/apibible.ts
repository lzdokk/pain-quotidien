/** Client minimal pour API.Bible (scripture.api.bible).
 *  Recupere un chapitre d'une traduction sous licence et le renvoie sous la
 *  meme forme que la table locale : [[numero, texte], ...]. */

const BASE = 'https://api.scripture.api.bible/v1';

export async function fetchApiBibleChapter(
  bibleId: string, chapterId: string
): Promise<Array<[number, string]>> {
  const url = `${BASE}/bibles/${bibleId}/chapters/${chapterId}`
    + '?content-type=text&include-notes=false&include-titles=false'
    + '&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false';

  const r = await fetch(url, {
    headers: { 'api-key': process.env.BIBLE_API_KEY ?? '' },
    next: { revalidate: 86400 }
  });
  if (!r.ok) throw new Error(`API.Bible ${r.status} : ${await r.text()}`);

  const j = await r.json();
  const content: string = j?.data?.content ?? '';

  // Les versets sont marques par [n] dans le texte renvoye.
  const parts = content.split(/\s*\[(\d+)\]\s*/).slice(1);
  const out: Array<[number, string]> = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const n = Number(parts[i]);
    const text = parts[i + 1].replace(/\s+/g, ' ').trim();
    if (n && text) out.push([n, text]);
  }
  return out;
}
