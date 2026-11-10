import Reader from '@/components/Reader';
import { getReaderStatic } from '@/lib/cache';

export const metadata = { title: 'Lire la Bible' };
// Page pré-générée : livres, traductions et parcours viennent du cache.
// Couleurs, notes et parcours personnel se chargent dans le navigateur.
export const revalidate = 3600;

export default async function Lire() {
  const { books, translations, plans, steps, intros } = await getReaderStatic();
  return (
    <Reader books={books} translations={translations} plans={plans}
            steps={steps} plan={null} notes={[]} highlights={[]}
            intros={intros} user={null} />
  );
}
