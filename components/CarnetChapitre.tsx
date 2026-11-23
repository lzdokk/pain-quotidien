'use client';
import { useEffect, useRef, useState } from 'react';
import { getRemote, putRemote } from '@/lib/etude-sync';
import { MEDITER_ETAPES } from '@/lib/reading-guide';

/**
 * Carnet de méditation d'un chapitre : une zone par étape de la méthode
 * (Choisir, Paraphraser, Personnaliser, Confesser, M'examiner, Pratiquer) + notes libres.
 * Notes privées, gardées sur l'appareil et synchronisées avec le compte.
 * Ancien format (simple texte) : repris dans « Notes libres ».
 */
const CLES = ['choisir', 'paraphraser', 'personnaliser', 'confesser', 'examiner', 'pratiquer'] as const;
type Carnet = Record<(typeof CLES)[number] | 'libre', string>;
const VIDE: Carnet = { choisir: '', paraphraser: '', personnaliser: '', confesser: '', examiner: '', pratiquer: '', libre: '' };

function lire(raw: string): Carnet {
  if (!raw) return { ...VIDE };
  try {
    const j = JSON.parse(raw);
    if (j && j.v === 2) return { ...VIDE, ...j };
  } catch {}
  return { ...VIDE, libre: raw };
}
const ecrire = (c: Carnet) => JSON.stringify({ v: 2, ...c });
const vide = (c: Carnet) => Object.values(c).every(x => !x);

export default function CarnetChapitre({ cle }: { cle: string; placeholder?: string }) {
  const k = `pq-carnet-${cle}`, kt = `pq-carnet-t-${cle}`;
  const [v, setV] = useState<Carnet>({ ...VIDE });
  const [ok, setOk] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let alive = true;
    try { setV(lire(localStorage.getItem(k) ?? '')); } catch {}
    (async () => {
      const r = await getRemote('carnet:' + cle);
      if (!alive || !r) return;
      let local = 0, cur = '';
      try { local = +(localStorage.getItem(kt) ?? 0); cur = localStorage.getItem(k) ?? ''; } catch {}
      if (r.t > local && r.body !== cur) {
        setV(lire(r.body));
        try { localStorage.setItem(k, r.body); localStorage.setItem(kt, String(r.t)); } catch {}
      } else if (local > r.t && cur) putRemote('carnet:' + cle, cur);
    })();
    return () => { alive = false; };
  }, [k, kt, cle]);
  const change = (champ: keyof Carnet, val: string) => {
    const n = { ...v, [champ]: val };
    setV(n); setOk(false);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => {
      const body = vide(n) ? '' : ecrire(n);
      try { localStorage.setItem(k, body); localStorage.setItem(kt, String(Date.now())); setOk(true); } catch {}
      putRemote('carnet:' + cle, body);
    }, 600);
  };
  return (
    <>
      {MEDITER_ETAPES.map(([titre, desc], i) => {
        const champ = CLES[i];
        return (
          <label key={champ} className="pe-champ">
            <span><b>{i + 1}. {titre}</b> {desc}</span>
            <textarea className="pe-note" rows={2} value={v[champ]} onChange={e => change(champ, e.target.value)} />
          </label>
        );
      })}
      <label className="pe-champ">
        <span><b>Notes libres</b> à qui j&rsquo;en parle, ce que je veux retenir</span>
        <textarea className="pe-note" rows={2} value={v.libre} onChange={e => change('libre', e.target.value)} />
      </label>
      <div className="pe-saved">{ok ? 'Enregistré (synchronisé avec ton compte)' : 'Privé : synchronisé avec ton compte'}</div>
    </>
  );
}
