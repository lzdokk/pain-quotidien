'use client';
import { useEffect, useRef, useState } from 'react';
import { getRemote, putRemote } from '@/lib/etude-sync';
import R from '@/components/R';

/** Carnet de méditation : notes privées, gardées sur l'appareil et synchronisées avec le compte. */
export default function CarnetChapitre({ cle, placeholder }: { cle: string; placeholder: string }) {
  const k = `pq-carnet-${cle}`, kt = `pq-carnet-t-${cle}`;
  const [v, setV] = useState('');
  const [ok, setOk] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let alive = true;
    try { setV(localStorage.getItem(k) ?? ''); } catch {}
    (async () => {
      const r = await getRemote('carnet:' + cle);
      if (!alive || !r) return;
      let local = 0, cur = '';
      try { local = +(localStorage.getItem(kt) ?? 0); cur = localStorage.getItem(k) ?? ''; } catch {}
      if (r.t > local && r.body !== cur) {
        setV(r.body);
        try { localStorage.setItem(k, r.body); localStorage.setItem(kt, String(r.t)); } catch {}
      } else if (local > r.t && cur) putRemote('carnet:' + cle, cur);
    })();
    return () => { alive = false; };
  }, [k, kt, cle]);
  const change = (s: string) => {
    setV(s); setOk(false);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => {
      try { localStorage.setItem(k, s); localStorage.setItem(kt, String(Date.now())); setOk(true); } catch {}
      putRemote('carnet:' + cle, s);
    }, 600);
  };
  return (
    <>
      <textarea className="pe-note" value={v} onChange={e => change(e.target.value)} placeholder={placeholder} />
      <div className="pe-saved">{ok ? 'Enregistré (synchronisé avec ton compte)' : 'Privé : synchronisé avec ton compte'}</div>
    </>
  );
}
