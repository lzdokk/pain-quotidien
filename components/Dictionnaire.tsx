'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Dictionnaire biblique Westphal (numérisation Yves Petrakian, via levangile.com).
 * Recherche, A–Z, article ; les renvois ouvrent un verset ou un autre article.
 */
type Item = { id: number; titre: string; m?: string };
type Art = { id: number; titre: string; html: string | null };
const LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

type Aside = { cites: Array<Item & { verses: number[] }>; mots: Array<Item & { verses: number[] }> };
const vlist = (v: number[]) => v.length ? `v. ${v.slice(0, 5).join(', ')}${v.length > 5 ? '…' : ''}` : '';

export default function Dictionnaire({ onRef, bare, initialId, chapter }: {
  onRef: (ref: string) => void; bare?: boolean; initialId?: number | null;
  chapter?: { b: number; c: number; name: string } | null;
}) {
  const [aside, setAside] = useState<Aside | null>(null);
  const [allMots, setAllMots] = useState(false);
  useEffect(() => {
    if (!chapter?.b || !chapter.name) return;
    let alive = true; setAside(null); setAllMots(false);
    fetch(`/api/aside/dico?b=${chapter.b}&c=${chapter.c}&name=${encodeURIComponent(chapter.name)}`)
      .then(r => r.ok ? r.json() : null).then(j => { if (alive) setAside(j ?? { cites: [], mots: [] }); }).catch(() => alive && setAside({ cites: [], mots: [] }));
    return () => { alive = false; };
  }, [chapter?.b, chapter?.c, chapter?.name]);
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
      if (!bare) requestAnimationFrame(() => top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
    }
  };
  useEffect(() => { if (initialId) open(`/api/dict?id=${initialId}`, false); }, [initialId]); // eslint-disable-line react-hooks/exhaustive-deps
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
    <div className={bare ? 'dico bare' : 'card pad dico'} ref={top} style={{ scrollMarginTop: 80 }}>
      {!bare && <span className="kicker">Dictionnaire biblique</span>}
      {!art && (
        <>
          {chapter && !items && !busy && (
            <div className="dico-aside">
              {aside === null ? <p className="fine">Recherche des articles liés à {chapter.name} {chapter.c}…</p>
                : !aside.cites.length && !aside.mots.length ? <p className="fine">Aucun article lié à {chapter.name} {chapter.c}.</p>
                : (
                  <>
                    {aside.cites.length > 0 && (
                      <>
                        <div className="rbubble-k">Ils citent {chapter.name} {chapter.c}</div>
                        <div className="cstudy-list">
                          {aside.cites.map(a => (
                            <button key={a.id} className="cstudy-it" onClick={() => open(`/api/dict?id=${a.id}`, false)}>
                              <span className="cstudy-k">Article</span><span className="cstudy-t">{a.titre}</span>
                              {a.verses.length > 0 && <span className="cstudy-v">{vlist(a.verses)}</span>}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {aside.mots.length > 0 && (
                      <>
                        <div className="rbubble-k">Dans le texte du chapitre</div>
                        <div className="cstudy-list">
                          {(allMots ? aside.mots : aside.mots.slice(0, 14)).map(a => (
                            <button key={a.id} className="cstudy-it" onClick={() => open(`/api/dict?id=${a.id}`, false)}>
                              <span className="cstudy-k">Mot</span><span className="cstudy-t">{a.titre}</span>
                              <span className="cstudy-v">{vlist(a.verses)}</span>
                            </button>
                          ))}
                        </div>
                        {aside.mots.length > 14 && !allMots && (
                          <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setAllMots(true)}>Voir les {aside.mots.length} articles</button>
                        )}
                      </>
                    )}
                  </>
                )}
              <div className="rbubble-k">Chercher un autre mot</div>
            </div>
          )}
          {chapter && items && (
            <button className="pe-back" style={{ marginTop: 4 }} onClick={() => { setItems(null); setLettre(null); setQ(''); }}>‹ Articles de {chapter.name} {chapter.c}</button>
          )}
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
