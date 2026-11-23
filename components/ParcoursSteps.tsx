'use client';
import Link from 'next/link';
import { useProgression } from './EtudierProgress';

type Step = { label: string; book: number; chapter: number | null; href: string; fiche: boolean };

export default function ParcoursSteps({ id, steps }: { id: string; steps: Step[] }) {
  const { done, toggle } = useProgression();
  const mine = new Set(done[id] ?? []);
  const next = steps.findIndex((_, i) => !mine.has(i));
  const pct = Math.round(mine.size / steps.length * 100);
  return (
    <>
      <div className="card pad">
        <div className="pe-prog">{mine.size} sur {steps.length} terminés</div>
        <div className="pe-bar"><i style={{ width: `${pct}%` }} /></div>
      </div>
      {next >= 0 && mine.size > 0 && (
        <div className="pe-next">Prochaine étape : <b>{steps[next].label}</b></div>
      )}
      <div className="card pad">
        {steps.map((s, i) => (
          <div key={i} className={`pe-step${mine.has(i) ? ' done' : ''}`}>
            <button className="pe-check" aria-pressed={mine.has(i)} aria-label={`Marquer ${s.label} comme terminé`} onClick={() => toggle(id, i)}>
              {mine.has(i) ? '✓' : ''}
            </button>
            <div className="pe-step-main">
              <div className="pe-step-t">{s.label}</div>
              <div className="pe-links">
                {s.fiche && <Link className="ix-chip" href={`/etudier/livre/${s.book}`}>Fiche du livre</Link>}
                <Link className="ix-chip" href={s.href}>Lire</Link>
                {s.chapter !== null && s.fiche && <Link className="ix-chip" href={`/etudier/livre/${s.book}/${s.chapter}`}>Étudier le chapitre {s.chapter}</Link>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
