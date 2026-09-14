'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';

/**
 * Navigation des jours, groupee par mois (et par annee au changement d'annee).
 * Le mois courant est deplie ; les autres mois apparaissent comme des onglets
 * a toucher pour deplier leurs jours. Un seul mois affiche a la fois.
 *
 * ADMIN : les jours ATTENDUS mais non generes/publies (missingDays) s'affichent
 * quand meme, en pastille grisee. Un clic force leur generation + publication,
 * puis recharge la page — pratique quand un jour "ne s'est pas charge".
 */
type D = { date: string; y: number; m: number; d: number; missing?: boolean };

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const label = (k: string) => { const [y, m] = k.split('-').map(Number); return `${cap(MOIS[m - 1])} ${y}`; };

export default function DayNav({
  days, current, missingDays = [], isAdmin = false,
}: { days: string[]; current: string; missingDays?: string[]; isAdmin?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string>('');

  const parsed = useMemo<D[]>(() => {
    const pub = new Set(days);
    const miss = isAdmin ? missingDays.filter(d => !pub.has(d)) : [];
    const all = [...new Set([...days, ...miss])];
    return all.map(date => {
      const [y, m, d] = date.split('-').map(Number);
      return { date, y, m, d, missing: !pub.has(date) };
    }).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [days, missingDays, isAdmin]);

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

  async function loadDay(date: string) {
    setBusy(date); setErr('');
    try {
      const r = await fetch('/api/admin/generate', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok) { window.location.href = `/jour/${date}`; return; }
      setErr(j?.error || j?.gen?.errors?.[0] || `Échec (${r.status})`);
      setBusy(null);
    } catch (e: any) {
      setErr(e?.message ?? 'Erreur réseau'); setBusy(null);
    }
  }

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
        {selDays.map(it => it.missing ? (
          <button
            key={it.date}
            className={`day-pill missing${busy === it.date ? ' loading' : ''}`}
            title={busy === it.date ? 'Génération en cours…' : `Charger le ${it.date}`}
            onClick={() => loadDay(it.date)}
            disabled={!!busy}
          >
            {busy === it.date ? '…' : it.d}
          </button>
        ) : (
          <Link key={it.date} href={`/jour/${it.date}`}
                className={`day-pill${it.date === current ? ' active' : ''}`} title={it.date}>
            {it.d}
          </Link>
        ))}
        <Link href="/jours" className="day-pill more" title="Tous les jours">›</Link>
      </div>

      {isAdmin && missingDays.filter(d => !days.includes(d)).length > 0 && (
        <p className="dn-hint">
          Les pastilles grisées sont des jours non générés. Touchez-les pour les charger.
        </p>
      )}
      {err && <p className="dn-hint err">{err}</p>}
    </div>
  );
}
