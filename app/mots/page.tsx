import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import WordsBrowser from '@/components/WordsBrowser';

export const revalidate = 3600;
export const metadata = { title: 'Les mots hébreu & grec' };

const THEME_ORDER = [
  'Noms de Dieu', 'La personne de Christ', 'Le Saint-Esprit',
  'Le salut et la grâce', 'La foi et l’alliance', 'La création et l’homme',
  'L’Église et la vie chrétienne', 'Prière et louange', 'Adoration'
];

export default async function Mots() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: words } = await sb.from('bible_words')
    .select('slug, term, translit, lang, gloss, theme, sense, christ, refs')
    .order('translit');

  const sorted = (words ?? []).slice().sort((a, b) => {
    const ia = THEME_ORDER.indexOf(a.theme), ib = THEME_ORDER.indexOf(b.theme);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <>
      <Nav user={user} />
      <WordsBrowser words={sorted} />
    </>
  );
}
