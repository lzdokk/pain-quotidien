import Link from 'next/link';
import ParcoursList from '@/components/ParcoursList';
import { PARCOURS } from '@/lib/parcours';

export const metadata = { title: 'Parcours d’étude' };

export default function Etudier() {
  const items = PARCOURS.map(p => ({ id: p.id, titre: p.titre, pour: p.pour, groupe: p.groupe, total: p.etapes.length }));
  return (
    <main className="wrap">
      <Link href="/lire?tab=etude" className="back-parable">‹ Bible d&rsquo;étude</Link>
      <header className="hero compact">
        <div className="eyebrow">Étudier</div>
        <h1>Parcours d&rsquo;étude</h1>
        <p className="lede">Choisis un parcours : il te dit quel livre méditer, et dans quel ordre. Chaque livre a sa fiche.</p>
      </header>
      <ParcoursList items={items} />
      <div className="share-grid" style={{ marginTop: 18 }}>
        <Link href="/etude/comment-lire" className="btn">Comment méditer un passage ›</Link>
      </div>
    </main>
  );
}
