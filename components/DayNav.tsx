'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';

/**
 * Navigation des jours, groupee par mois (et par annee au changement d'annee).
 * Le mois courant est deplie ; les autres mois apparaissent comme des onglets
 * a toucher pour deplier leurs jours. Un seul mois affiche a la fois.
 */
type D = { date: string; y: number; m: number; d: number };

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const label = (k: string) => { const [y, m] = k.split('-').map(Number); return `${cap(MOIS[m - 1])} ${y}`; };

export default function DayNav({ days, current }: { days: string[]; current: string }) {
  const parsed = useMemo<D[]>(() =>
    [...new Set(days)].map(date => {
      const [y, m, d] = date.split('-').map(Number);
      return { date, y, m, d };
    }).sort((a, b) => (a.date < b.date ? -1 : 1)), [days]);

  // Groupes { "AAAA-MM": jours[] }, du mois le plus recent au plus ancien.
  const groups = useMemo(() => {
    const map = new Map<string, D[]>();
    for (const it of parsed) {
      const k = `${it.y}-${String(it.m).padStart(2, '0')}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [parsed]);

  const [cy, cm] = current.split('-').map(Number);
  const currentKey = `${cy}-${String(cm).padStart(2, '0')}`;
  const [sel, setSel] = useState(currentKey);

  const selDays = groups.find(([k]) => k === sel)?.[1] ?? [];

  return (
    <div className="daynav">
      {groups.length > 1 ? (
        <div className="dn-months">
          {groups.map(([k]) => (
            <button key={k} className="dn-month" aria-selected={k === sel} onClick={() => setSel(k)}>
              {label(k)}
            </button>
          ))}
        </div>
      ) : groups.length === 1 ? (
        <div className="dn-title">{label(groups[0][0])}</div>
      ) : null}

      <div className="day-pills">
        {selDays.map(it => (
          <Link key={it.date} href={`/jour/${it.date}`}
                className={`day-pill${it.date === current ? ' active' : ''}`} title={it.date}>
            {it.d}
          </Link>
        ))}
        <Link href="/jours" className="day-pill more" title="Tous les jours">›</Link>
      </div>
    </div>
  );
}
