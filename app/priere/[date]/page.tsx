import { notFound } from 'next/navigation';
import PriereView from '../view';

export const revalidate = 86400;
// Générée à la première visite puis gardée en cache.
export const generateStaticParams = async () => [];
export const metadata = { title: 'Prière' };

/** Prière d'un jour choisi, avec le thème de ce jour. */
export default async function PriereJour({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  return <PriereView date={date} />;
}
