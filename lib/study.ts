/**
 * COUCHE D'ACCÈS AUX OUTILS D'ÉTUDE (Étape 2)
 * ───────────────────────────────────────────
 * Toutes les lectures passent par le client navigateur `supabase` (les tables
 * verses / strongs / cross_references / verse_words sont en lecture publique).
 * Les traductions distantes (bolls, getbible, youversion) ne sont pas dans la
 * table `verses` : on les lit via la route /api/bible/chapter déjà en place.
 */
import { supabase } from '@/lib/supabase/client';

export type Verse = { verse: number; text: string };
export type StrongEntry = {
  code: string; lang: string; lemma: string | null; translit: string | null;
  pronunciation: string | null; definition_fr: string | null; definition_en: string | null;
};
export type CrossRef = {
  to_book: number; to_chapter: number; to_verse_start: number;
  to_verse_end: number | null; votes: number;
};

/* Codes considérés comme « distants » (texte lu à la volée, hors table verses). */
const REMOTE = new Set(['bolls', 'apibible', 'getbible', 'youversion']);

/* ─────────────────────────────────────────────────────────────────────
 * 1. RECHERCHE PLEIN TEXTE (via la fonction SQL search_verses, insensible
 *    aux accents, classée par pertinence).
 * ──────────────────────────────────────────────────────────────────── */
export async function searchVerses(
  q: string, translation = 'FRLSG', limit = 100
): Promise<Array<{ book: number; chapter: number; verse: number; text: string; rank: number }>> {
  const query = q.trim();
  if (!query) return [];
  const { data, error } = await supabase.rpc('search_verses', {
    q: query, trans: translation, lim: limit
  });
  if (error) throw error;
  return data ?? [];
}

/* ─────────────────────────────────────────────────────────────────────
 * 2. UN CHAPITRE, LOCAL OU DISTANT.
 * ──────────────────────────────────────────────────────────────────── */
async function getSource(code: string): Promise<string> {
  const { data } = await supabase.from('translations').select('source').eq('code', code).maybeSingle();
  return data?.source ?? 'local';
}

export async function getChapter(book: number, chapter: number, translation: string): Promise<Verse[]> {
  const source = await getSource(translation);

  if (REMOTE.has(source)) {
    // Traduction distante : on passe par la route serveur (jamais stockée).
    const r = await fetch(`/api/bible/chapter?trans=${encodeURIComponent(translation)}&book=${book}&chapter=${chapter}`);
    const j = await r.json();
    return ((j.verses ?? []) as Array<[number, string]>).map(([verse, text]) => ({ verse, text }));
  }

  const { data, error } = await supabase.from('verses')
    .select('verse, text')
    .eq('translation', translation).eq('book', book).eq('chapter', chapter)
    .order('verse');
  if (error) throw error;
  return (data ?? []) as Verse[];
}

/** Le même chapitre dans DEUX traductions, pour l'affichage comparé. */
export async function getTwoTranslations(
  book: number, chapter: number, transA: string, transB: string
): Promise<{ a: Verse[]; b: Verse[] }> {
  const [a, b] = await Promise.all([
    getChapter(book, chapter, transA),
    getChapter(book, chapter, transB)
  ]);
  return { a, b };
}

/* ─────────────────────────────────────────────────────────────────────
 * 3. DICTIONNAIRE STRONG.
 * ──────────────────────────────────────────────────────────────────── */
/** Définition d'un code Strong ("G26", "H2617"). */
export async function getStrong(code: string): Promise<StrongEntry | null> {
  const { data, error } = await supabase.from('strongs')
    .select('code, lang, lemma, translit, pronunciation, definition_fr, definition_en')
    .eq('code', code.toUpperCase()).maybeSingle();
  if (error) throw error;
  return (data as StrongEntry) ?? null;
}

/** Découpage mot à mot d'un verset (interlinéaire), avec code Strong par mot.
 *  Renvoie [] si le verset n'est pas encore couvert par verse_words. */
export async function getVerseWords(
  book: number, chapter: number, verse: number
): Promise<Array<{ position: number; lang: string; word: string; strong: string | null; gloss: string | null }>> {
  const { data, error } = await supabase.from('verse_words')
    .select('position, lang, word, strong, gloss')
    .eq('book', book).eq('chapter', chapter).eq('verse', verse)
    .order('position');
  if (error) throw error;
  return data ?? [];
}

/* ─────────────────────────────────────────────────────────────────────
 * 4. RÉFÉRENCES CROISÉES d'un verset (triées par pertinence).
 * ──────────────────────────────────────────────────────────────────── */
export async function getCrossReferences(
  book: number, chapter: number, verse: number, minVotes = 1, limit = 20
): Promise<CrossRef[]> {
  const { data, error } = await supabase.from('cross_references')
    .select('to_book, to_chapter, to_verse_start, to_verse_end, votes')
    .eq('from_book', book).eq('from_chapter', chapter).eq('from_verse', verse)
    .gte('votes', minVotes)
    .order('votes', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as CrossRef[];
}
