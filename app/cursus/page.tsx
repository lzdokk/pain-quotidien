import CursusBrowser from '@/components/CursusBrowser';
import { getCursusStatic } from '@/lib/cache';

export const revalidate = 300;
export const metadata = { title: 'Cursus theologique' };


export default async function Cursus() {
  const { cursus, levels, groups, courses } = await getCursusStatic();

  return (
    <>
      <CursusBrowser
        cursus={cursus}
        levels={levels ?? []}
        groups={groups ?? []}
        courses={courses ?? []}
        done={[]}
        user={null}
        isAdmin={false}
        isMember={false}
      />
    </>
  );
}
