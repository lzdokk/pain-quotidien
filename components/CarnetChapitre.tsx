'use client';
import { useEffect, useRef, useState } from 'react';

/** Carnet de méditation : notes privées, gardées sur l'appareil. */
export default function CarnetChapitre({ cle, placeholder }: { cle: string; placeholder: string }) {
  const k = `pq-carnet-${cle}`;
  const [v, setV] = useState('');
  const [ok, setOk] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { try { setV(localStorage.getItem(k) ?? ''); } catch {} }, [k]);
  const change = (s: string) => {
    setV(s); setOk(false);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => { try { localStorage.setItem(k, s); setOk(true); } catch {} }, 500);
  };
  return (
    <>
      <textarea className="pe-note" value={v} onChange={e => change(e.target.value)} placeholder={placeholder} />
      <div className="pe-saved">{ok ? 'Enregistré sur cet appareil' : 'Privé : seulement sur cet appareil'}</div>
    </>
  );
}
