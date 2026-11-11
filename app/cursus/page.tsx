import CursusBrowser from '@/components/CursusBrowser';
import { getCursusStatic } from '@/lib/cache';
import { requireAdmin } from '@/lib/admin-guard';

// Réservé au responsable : vérifié côté serveur à chaque visite.
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cursus', robots: { index: false, follow: false } };


export default async function Cursus() {
  const me = await requireAdmin();
  const { cursus, levels, groups, courses } = await getCursusStatic();

  return (
    <>
      <CursusBrowser
        cursus={cursus}
        levels={levels ?? []}
        groups={groups ?? []}
        courses={courses ?? []}
        done={[]}
        user={me}
        isAdmin={true}
        isMember={false}
      />
    </>
  );
}
