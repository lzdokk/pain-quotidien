'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Dictionnaire biblique Westphal (numérisation Yves Petrakian, via levangile.com).
 * Recherche, A–Z, article ; les renvois ouvrent un verset ou un autre article.
 */
type Item = { id: number; titre: string; m?: string };
type Art = { id: number; titre: string; html: string | null };
const LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Dictionnaire({ onRef }: { onRef: (ref: string) => void }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[] | null>(null);
  const [lettre, setLettre] = useState<string | null>(null);
  const [art, setArt] = useState<Art | null>(null);
  const [hist, setHist] = useState<Art[]>([]);
  const [busy, setBusy] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const load = async (url: string) => {
    setBusy(true);
    try { const r = await fetch(url); return r.ok ? await r.json() : null; } catch { return null; } finally { setBusy(false); }
  };
  const search = async (k = q) => {
    if (k.trim().length < 2) return;
    setLettre(null); setArt(null);
    const j = await load(`/api/dict?q=${encodeURIComponent(k.trim())}`);
    setItems(j?.items ?? []);
  };
  const byLetter = async (L: string) => {
    setLettre(L); setArt(null); setQ('');
    const j = await load(`/api/dict?l=${L}`);
    setItems(j?.items ?? []);
  };
  const open = async (url: string, push = true) => {
    const j = await load(url);
    if (j?.id) {
      if (push && art) setHist(h => [...h, art]);
      setArt(j);
      requestAnimationFrame(() => top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }
  };
  const back = () => { const h = [...hist]; const p = h.pop(); setHist(h); setArt(p ?? null); };
  useEffect(() => { if (!art) setHist([]); }, [art]);

  const onClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a[data-ref], a[data-w]') as HTMLElement | null;
    if (!a) return;
    e.preventDefault();
    if (a.dataset.ref) onRef(a.dataset.ref);
    else if (a.dataset.w) open(`/api/dict?t=${encodeURIComponent(a.dataset.w)}`);
  };

  return (
    <div className="card pad dico" ref={top} style={{ scrollMarginTop: 80 }}>
      <span className="kicker">Dictionnaire biblique</span>
      {!art && (
        <>
          <div className="srch-row" style={{ marginTop: 8 }}>
            <input className="field" type="search" value={q} placeholder="Un mot : alliance, Abraham, tabernacle…"
                   onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') search(); }} />
            <button className="btn primary" onClick={() => search()}>Chercher</button>
          </div>
          <div className="dico-az">
            {LETTRES.map(L => <button key={L} className={lettre === L ? 'on' : ''} onClick={() => byLetter(L)}>{L}</button>)}
          </div>
          {busy && <p className="fine">Recherche…</p>}
          {!busy && items && (items.length === 0
            ? <p className="fine">Aucun article trouvé.</p>
            : <div className="dico-list">
                {items.map(it => (
                  <button key={it.id} className={it.m === 'x' ? 'x' : ''} onClick={() => open(`/api/dict?id=${it.id}`, false)}>{it.titre}</button>
                ))}
              </div>)}
        </>
      )}
      {art && (
        <div className="dico-art">
          <button className="pe-back" onClick={back}>‹ {hist.length ? hist[hist.length - 1].titre : 'Retour'}</button>
          <h3>{art.titre}</h3>
          <div className="dico-body" onClick={onClick} dangerouslySetInnerHTML={{ __html: art.html ?? '' }} />
          <p className="lexfr-src">Dictionnaire Westphal · numérisation Yves Petrakian · levangile.com</p>
        </div>
      )}
    </div>
  );
}
