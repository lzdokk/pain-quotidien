'use client';
import { useState } from 'react';

/**
 * Bouton ADMIN : force la generation + publication d'un jour precis, puis
 * recharge la page. La generation peut prendre ~30-90 s (le modele ecrit tout
 * le jour) : on affiche un etat d'attente et on ne bloque pas l'interface.
 */
export default function DayLoadButton({
  date, label = 'Charger ce jour', className = 'btn',
}: { date: string; label?: string; className?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function run() {
    setState('loading'); setMsg('');
    try {
      const r = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok) {
        // Petit delai pour laisser la revalidation se propager, puis on recharge.
        setMsg('Généré ✓');
        setTimeout(() => window.location.reload(), 600);
        return;
      }
      setState('error');
      setMsg(j?.error || j?.gen?.errors?.[0] || `Échec (${r.status})`);
    } catch (e: any) {
      setState('error');
      setMsg(e?.message ?? 'Erreur réseau');
    }
  }

  return (
    <span className="dayload">
      <button className={className} onClick={run} disabled={state === 'loading'}>
        {state === 'loading' ? 'Génération en cours…' : label}
      </button>
      {msg && <span className={`dayload-msg${state === 'error' ? ' err' : ''}`}>{msg}</span>}
    </span>
  );
}
