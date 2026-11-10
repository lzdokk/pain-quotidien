import StudyIndex from '@/components/StudyIndex';
import { getIndexList } from '@/lib/cache';
import { allEntries, GRANDS_SUJETS, RENVOIS, slugify } from '@/lib/prompts/study-index';

export const revalidate = 600;
export const metadata = { title: 'Index d’étude' };

export default async function Etude() {
  const list = await getIndexList();

  // Les fiches deja redigees, et le plan complet (pour afficher l'ordre des grands sujets).
  const ready = Object.fromEntries(list);
  const plan = allEntries().map(e => ({ slug: e.slug, kind: e.kind, title: e.title, category: e.category, subcategory: e.subcategory }));
  const sujets = GRANDS_SUJETS.map(g => ({ id: g.id, title: g.title, groups: g.groups.map(x => x.title) }));

  return (
    <>
      <StudyIndex plan={plan} ready={ready} sujets={sujets}
        renvois={Object.entries(RENVOIS).map(([from, to]) => ({ from, to, slug: slugify(to) }))} />
    </>
  );
}
