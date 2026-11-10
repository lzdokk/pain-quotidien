import { supabasePublic } from '@/lib/supabase/public';
import VersesBrowser from '@/components/VersesBrowser';
import { citedVerse } from '@/lib/bible';

export const revalidate = 3600;
export const metadata = { title: 'Les versets à connaître' };

export default async function Versets() {
  const sb = await supabasePublic();
  const user: any = null; // lu dans le navigateur (useUser)
  const { data: verses } = await sb.from('famous_verses')
    .select('slug, reference, theme, title, blurb, verse_text, ord, book, chapter, verse_start, verse_end')
    .order('ord');

  // Chaque verset cite dans la traduction par defaut du site (S21 si importee).
  const versesDef = await Promise.all((verses ?? []).map(async v => ({
    ...v, verse_text: (await citedVerse(v.reference, v.verse_text)).text,
  })));

  return (
    <>
      <VersesBrowser verses={versesDef} user={user} />
    </>
  );
}
