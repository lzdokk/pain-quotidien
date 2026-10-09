import { supabaseServer } from '@/lib/supabase/server';
import Nav from '@/components/Nav';
import StudyIndex from '@/components/StudyIndex';
import { allEntries, GRANDS_SUJETS } from '@/lib/prompts/study-index';

export const revalidate = 600;
export const metadata = { title: 'Index d’étude' };

export default async function Etude() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data } = await sb.from('bible_index').select('slug, kind, title, definition');

  // Les fiches deja redigees, et le plan complet (pour afficher l'ordre des grands sujets).
  const ready = Object.fromEntries((data ?? []).map((e: any) => [e.slug, e.definition ?? '']));
  const plan = allEntries().map(e => ({ slug: e.slug, kind: e.kind, title: e.title, category: e.category, subcategory: e.subcategory }));
  const sujets = GRANDS_SUJETS.map(g => ({ id: g.id, title: g.title, groups: g.groups.map(x => x.title) }));

  return (
    <>
      <Nav user={user} />
      <StudyIndex plan={plan} ready={ready} sujets={sujets} />
    </>
  );
}
