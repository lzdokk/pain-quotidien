import Link from 'next/link';
import { notFound } from 'next/navigation';
import ParcoursSteps from '@/components/ParcoursSteps';
import { PARCOURS, parcoursById, resoudreEtape } from '@/lib/parcours';
import { FICHES_LIVRES } from '@/lib/fiches-livres';

export const generateStaticParams = () => PARCOURS.map(p => ({ id: p.id }));
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: parcoursById(id)?.titre ?? 'Parcours d’étude' };
}

export default async function ParcoursPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = parcoursById(id);
  if (!p) notFound();
  const steps = p.etapes.map(label => resoudreEtape(label))
    .filter((e): e is NonNullable<typeof e> => !!e)
    .map(e => ({ ...e, fiche: !!FICHES_LIVRES[e.book] }));
  return (
    <main className="wrap">
      <Link href="/etudier" className="back-parable">‹ Parcours d&rsquo;étude</Link>
      <header className="hero compact">
        <div className="eyebrow">Parcours</div>
        <h1>{p.titre}</h1>
        <p className="lede">{p.pour}</p>
      </header>
      <ParcoursSteps id={p.id} steps={steps} />
    </main>
  );
}
