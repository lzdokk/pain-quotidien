import { unstable_cache } from 'next/cache';
import { admin } from '@/lib/supabase/admin';

/**
 * CACHE SERVEUR des contenus publics (identiques pour tout le monde).
 * Lus une fois, gardés en mémoire côté Vercel, puis resservis instantanément
 * jusqu'à la durée indiquée ou jusqu'à ce qu'un cron les rafraîchisse
 * (revalidateTag). Les données personnelles (notes, couleurs) ne passent
 * JAMAIS par ici.
 */

// Lecteur : livres, traductions, parcours, introductions des livres.
export const getReaderStatic = unstable_cache(async () => {
  const [{ data: books }, { data: translations }, { data: plans }, { data: steps }, { data: intros }] = await Promise.all([
    admin.from('books').select('id, name, chapters').order('id'),
    admin.from('translations').select('code, name, notice, enabled, source, api_id, language').eq('enabled', true).order('code'),
    admin.from('reading_plans').select('*').order('order_index'),
    admin.from('plan_steps').select('*').order('position'),
    admin.from('book_intros').select('book, name, testament, section, title, situ, who, why, christ, key_verse')
  ]);
  return { books: books ?? [], translations: translations ?? [], plans: plans ?? [], steps: steps ?? [], intros: intros ?? [] };
}, ['reader-static-v1'], { revalidate: 3600, tags: ['reader'] });

// Index d'étude : la liste des fiches (définition raccourcie pour la recherche).
export const getIndexList = unstable_cache(async () => {
  const { data } = await admin.from('bible_index').select('slug, definition');
  return (data ?? []).map((e: any) => [e.slug, String(e.definition ?? '').slice(0, 240)] as [string, string]);
}, ['etude-list-v1'], { revalidate: 900, tags: ['etude'] });

// Cursus : la structure (cursus, niveaux, groupes, cours), sans les mots de passe.
export const getCursusStatic = unstable_cache(async () => {
  const [{ data: cursusRows }, { data: levels }, { data: groups }, { data: courses }] = await Promise.all([
    admin.from('cursus').select('id, name, subtitle, source_url, password, order_index').order('order_index'),
    admin.from('cursus_levels').select('*').order('order_index'),
    admin.from('cursus_groups').select('*').order('order_index'),
    admin.from('courses').select('code, group_id, title, kind, hook, hours, order_index, status').order('order_index')
  ]);
  const cursus = (cursusRows ?? []).map((c: any) => ({
    id: c.id, name: c.name, subtitle: c.subtitle, source_url: c.source_url,
    order_index: c.order_index, locked: !!c.password
  }));
  return { cursus, levels: levels ?? [], groups: groups ?? [], courses: courses ?? [] };
}, ['cursus-static-v1'], { revalidate: 1800, tags: ['cursus'] });

// Sagesse : texte du chapitre des Proverbes + sa fiche (prières, méditation).
export const getProverbe = unstable_cache(async (ch: number) => {
  let trName = 'Segond 21';
  let { data: vs } = await admin.from('verses').select('verse, text')
    .eq('translation', 'S21').eq('book', 20).eq('chapter', ch).order('verse');
  if (!vs?.length) {
    ({ data: vs } = await admin.from('verses').select('verse, text')
      .eq('translation', 'FRLSG').eq('book', 20).eq('chapter', ch).order('verse'));
    trName = 'Segond 1910';
  }
  const { data: fiche } = await admin.from('proverbes_daily').select('*').eq('chapter', ch).maybeSingle();
  return { verses: (vs ?? []) as Array<{ verse: number; text: string }>, trName, fiche };
}, ['proverbe-v1'], { revalidate: 86400, tags: ['sagesse'] });
