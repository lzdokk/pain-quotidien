import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import VersesBrowser from '@/components/VersesBrowser';

export const revalidate = 3600;
export const metadata = { title: 'Les versets à connaître' };

export default async function Versets() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: verses } = await sb.from('famous_verses')
    .select('slug, reference, theme, title, blurb, verse_text, ord')
    .order('ord');

  return (
    <>
      <Nav user={user} />
      <VersesBrowser verses={verses ?? []} />
    </>
  );
}
