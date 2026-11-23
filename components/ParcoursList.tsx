'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useProgression } from './EtudierProgress';
import { GROUPES, type Groupe } from '@/lib/parcours';

type Item = { id: string; titre: string; pour: string; groupe: Groupe; total: number };

export default function ParcoursList({ items }: { items: Item[] }) {
  const { done } = useProgression();
  const [f, setF] = useState<'all' | Groupe>('all');
  return (
    <>
      <div className="chips" role="tablist" style={{ margin: '4px 0 0' }}>
        <button className="chip" aria-selected={f === 'all'} onClick={() => setF('all')}>Tous ({items.length})</button>
        {GROUPES.map(g => (
          <button key={g.id} className="chip" aria-selected={f === g.id} onClick={() => setF(g.id)}>
            {g.label} ({items.filter(i => i.groupe === g.id).length})
          </button>
        ))}
      </div>
      {GROUPES.filter(g => f === 'all' || f === g.id).map(g => (
        <section key={g.id}>
          <div className="pe-grp">{g.label}</div>
          <div className="pe-list">
            {items.filter(i => i.groupe === g.id).map(p => {
              const n = (done[p.id] ?? []).length;
              return (
                <Link key={p.id} href={`/etudier/${p.id}`} className="card pad pe-item">
                  <h3>{p.titre}</h3>
                  <p>{p.pour}</p>
                  <div className="pe-prog">{n > 0 ? `${n} sur ${p.total} terminés` : `${p.total} étapes`}</div>
                  {n > 0 && <div className="pe-bar"><i style={{ width: `${Math.round(n / p.total * 100)}%` }} /></div>}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
