import type { SupabaseClient } from '@supabase/supabase-js';
import { admin } from '@/lib/supabase/admin';

// ─── Types ───────────────────────────────────────────────────────────

export type VerseHit = {
  translation: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  rank: number;
};

export type ComparedVerse = { verse: number; text: string };

export type ComparedChapter = {
  translation: string;
  name: string;
  verses: ComparedVerse[];
};

export type StrongEntry = {
  code: string;
  lang: string;
  num: number;
  lemma: string | null;
  translit: string | null;
  pronunciation: string | null;
  definition_en: string | null;
  definition_fr: string | null;
  derivation: string | null;
  kjv_def: string | null;
};

export type CrossReference = {
  to_book: number;
  to_chapter: number;
  to_verse: number;
  to_verse_end: number | null;
  kind: string;
  note: string | null;
  weight: number;
};

// ─── Recherche plein texte ─────────────────────────────────────────────

/** FTS sur toutes les traductions locales (ou une seule si `translation` est fourni). */
export async function searchVerses(
  query: string,
  opts?: { translation?: string; limit?: number; offset?: number },
  client: SupabaseClient = admin
): Promise<VerseHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const { data, error } = await client.rpc('search_verses', {
    p_query: q,
    p_translation: opts?.translation ?? null,
    p_limit: opts?.limit ?? 50,
    p_offset: opts?.offset ?? 0
  });
  if (error) throw error;
  return (data ?? []) as VerseHit[];
}

// ─── Comparateur de chapitres (2 traductions) ──────────────────────────

/**
 * Récupère un chapitre entier dans deux traductions locales en une seule
 * requête, prêt pour un affichage côte à côte ou empilé.
 */
export async function getChapterCompared(
  book: number,
  chapter: number,
  translationA: string,
  translationB: string,
  client: SupabaseClient = admin
): Promise<ComparedChapter[]> {
  const codes = [translationA, translationB];
  const [{ data: rows, error }, { data: meta }] = await Promise.all([
    client.from('verses')
      .select('translation, verse, text')
      .eq('book', book)
      .eq('chapter', chapter)
      .in('translation', codes)
      .order('verse'),
    client.from('translations')
      .select('code, name')
      .in('code', codes)
  ]);
  if (error) throw error;

  const names = new Map((meta ?? []).map(t => [t.code, t.name]));
  const grouped = new Map<string, ComparedVerse[]>();
  for (const code of codes) grouped.set(code, []);
  for (const row of rows ?? []) {
    grouped.get(row.translation)?.push({ verse: row.verse, text: row.text });
  }

  return codes.map(code => ({
    translation: code,
    name: names.get(code) ?? code,
    verses: grouped.get(code) ?? []
  }));
}

// ─── Lexique Strong ────────────────────────────────────────────────────

/** Entrée précise du dictionnaire Strong (vue `strong_lexicon`). */
export async function getStrongEntry(
  code: string,
  client: SupabaseClient = admin
): Promise<StrongEntry | null> {
  const { data, error } = await client
    .from('strong_lexicon')
    .select('code, lang, num, lemma, translit, pronunciation, definition_en, definition_fr, derivation, kjv_def')
    .eq('code', code.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data as StrongEntry | null;
}

/** Recherche plein texte dans le lexique Strong. */
export async function searchStrongLexicon(
  query: string,
  limit = 40,
  client: SupabaseClient = admin
): Promise<Omit<StrongEntry, 'num' | 'pronunciation' | 'derivation' | 'kjv_def'>[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const { data, error } = await client.rpc('search_strong_lexicon', {
    p_query: q,
    p_limit: limit
  });
  if (error) throw error;
  return data ?? [];
}

// ─── Références croisées ─────────────────────────────────────────────────

/** Liens canoniques sortants d'un verset (table `cross_references`). */
export async function getCrossReferences(
  book: number,
  chapter: number,
  verse: number,
  client: SupabaseClient = admin
): Promise<CrossReference[]> {
  const { data, error } = await client.rpc('get_cross_references', {
    p_book: book,
    p_chapter: chapter,
    p_verse: verse
  });
  if (error) throw error;
  return (data ?? []) as CrossReference[];
}
