'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BOOKS } from '@/lib/refs';
import { getRemote, putRemote } from '@/lib/etude-sync';

/**
 * LES 3 LECTURES : chaque jour, un chapitre de l'Ancien Testament (dans l'ordre),
 * un chapitre poétique (Psaumes, Proverbes, Job…) et un chapitre du Nouveau
 * Testament, reliés par un même fil, avec une question pour méditer.
 * Progression gardée sur l'appareil et synchronisée avec le compte.
 */
type Day = { n: number; at: [number, number]; po: [number, number]; nt: [number, number]; theme: string; fil: string; question: string };
type Prog = { started: boolean; day: number; done: Record<string, number>; t: number };
const KEY = 'pq-trois';
const CTX = 'pq-trois-ctx';
const EMPTY: Prog = { started: false, day: 1, done: {}, t: 0 };
const LABELS = ['Nouveau Testament', 'Poésie et sagesse', 'Ancien Testament'];

export const refName = (b: number, c: number) => `${b === 19 ? 'Psaume' : BOOKS[b - 1][1]} ${c}`;
/** Ordre de lecture : le Nouveau Testament d'abord, l'Ancien en reflet à la fin. */
const parts = (d: Day): Array<[number, number]> => [d.nt, d.po, d.at];

function readLocal(): Prog {
  try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); return p && typeof p.day === 'number' ? { ...EMPTY, ...p } : EMPTY; } catch { return EMPTY; }
}
function save(p: Prog) {
  const v = { ...p, t: Date.now() };
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {}
  putRemote('trois', JSON.stringify(v));
  try { window.dispatchEvent(new CustomEvent('pq-trois', { detail: v })); } catch {}
  return v;
}
/** Progression : locale tout de suite, puis celle du compte si elle est plus récente. */
function useProg(): [Prog, (p: Prog) => void] {
  const [p, setP] = useState<Prog>(EMPTY);
  useEffect(() => {
    const l = readLocal(); setP(l);
    getRemote('trois').then(r => {
      if (!r) return;
      try { const rp = JSON.parse(r.body); if ((rp.t ?? 0) > l.t) { setP({ ...EMPTY, ...rp }); localStorage.setItem(KEY, JSON.stringify(rp)); } } catch {}
    });
    const on = (e: Event) => setP((e as CustomEvent).detail);
    window.addEventListener('pq-trois', on);
    return () => window.removeEventListener('pq-trois', on);
  }, []);
  return [p, (np: Prog) => setP(save(np))];
}

const dayCache = new Map<number, Promise<{ total: number; prevu: number; day: Day | null; next: Day | null }>>();
function getDay(n: number) {
  if (!dayCache.has(n)) dayCache.set(n, fetch(`/api/trois?d=${n}`).then(r => r.json()).catch(() => { dayCache.delete(n); return { total: 0, prevu: 686, day: null, next: null }; }));
  return dayCache.get(n)!;
}
const bit = (done: Record<string, number>, n: number, k: number) => ((done[n] ?? 0) >> k) & 1;

/** Progression locale (sans compte) et cases cochées, synchronisées avec le compte. */
export const useTroisProg = useProg;

/**
 * La carte du jour, affichée en haut de Parcours quand « Les 3 lectures » est le parcours suivi.
 * Le jour vient du suivi des parcours (compte) ou, sans compte, de l'appareil.
 */
export default function TroisLectures({ day, onRead, onNext, onDay }: {
  day: number;
  onRead: (b: number, c: number) => void;
  onNext: () => void;
  onDay: (n: number) => void;
}) {
  const [prog, setProg] = useProg();
  const [data, setData] = useState<{ total: number; prevu: number; day: Day | null } | null>(null);
  const [list, setList] = useState<any[] | null>(null);
  const [plan, setPlan] = useState(false);
  const n = Math.max(1, day || 1);

  useEffect(() => { let a = true; setData(null); getDay(n).then(j => a && setData(j)); return () => { a = false; }; }, [n]);
  useEffect(() => {
    if (!plan || list) return;
    fetch('/api/trois?list=1').then(r => r.json()).then(j => setList(j.days ?? [])).catch(() => setList([]));
  }, [plan, list]);
  // Garde le jour visible dans le programme
  useEffect(() => { if (plan && list) requestAnimationFrame(() => document.getElementById(`tl-d-${n}`)?.scrollIntoView({ block: 'center' })); }, [plan, list, n]);
  // Mémorise le jour en cours pour la suite en bas des chapitres.
  useEffect(() => { try { sessionStorage.setItem(CTX, JSON.stringify({ day: n })); } catch {} }, [n]);

  const d = data?.day;
  const total = data?.total ?? 0, prevu = data?.prevu ?? 686;
  const open = (k: number) => {
    if (!d) return;
    const [b, c] = parts(d)[k];
    try { sessionStorage.setItem(CTX, JSON.stringify({ day: d.n })); } catch {}
    onRead(b, c);
  };
  const toggle = (k: number) => setProg({ ...prog, done: { ...prog.done, [n]: (prog.done[n] ?? 0) ^ (1 << k) } });
  const finish = () => { setProg({ ...prog, done: { ...prog.done, [n]: 7 } }); onNext(); };

  const nDone = d ? [0, 1, 2].filter(k => bit(prog.done, n, k)).length : 0;
  const pct = Math.round(((n - 1) + nDone / 3) / prevu * 100);
  return (
    <section className="card tl-card">
      <div className="tl-top">
        <span className="kicker">Votre lecture du jour · Jour {n} sur {prevu}</span>
        <button className="tl-plan" onClick={() => setPlan(true)}>Programme</button>
      </div>
      {!d ? <div className="skel skel-card" /> : (
        <>
          <h2 className="tl-h">{d.theme}</h2>
          <div className="tl-reads">
            {parts(d).map(([b, c], k) => {
              const ok = bit(prog.done, n, k) === 1;
              return (
                <div key={k} className={`tl-read k${k}${ok ? ' ok' : ''}`}>
                  <button className="tl-open" onClick={() => open(k)}>
                    <span className="tl-tag">{k + 1} · {LABELS[k]}</span>
                    <span className="tl-ref">{refName(b, c)}</span>
                  </button>
                  <button className="tl-check" onClick={() => toggle(k)} aria-pressed={ok} aria-label={ok ? 'Marquer non lu' : 'Marquer lu'}>
                    {ok ? '✓' : ''}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="tl-fil">
            <span className="tl-k">Le fil</span>
            <p>{d.fil}</p>
            <span className="tl-k">Pour méditer</span>
            <p className="tl-q">{d.question}</p>
          </div>
          <div className="progress-wrap">
            <div className="bar"><i style={{ width: `${Math.min(100, pct)}%` }} /></div>
            <span className="pct">{pct} %</span>
          </div>
          <div className="tl-btns">
            {n < total
              ? <button className="btn primary" onClick={finish}>{nDone === 3 ? 'Jour suivant ›' : 'J’ai lu les 3 · jour suivant'}</button>
              : <p className="fine">Bravo, tu as lu toute la Bible !</p>}
            {n > 1 && <button className="btn" onClick={() => onDay(n - 1)}>‹ Jour {n - 1}</button>}
          </div>
        </>
      )}
      {plan && <Programme list={list} cur={n} total={total} prevu={prevu} onPick={x => { onDay(x); setPlan(false); }} onClose={() => setPlan(false)} />}
    </section>
  );
}

/** Le programme complet, dans la fiche du parcours (liste des parcours). */
export function TroisProgramme({ cur, onPick }: { cur: number; onPick?: (n: number) => void }) {
  const [list, setList] = useState<any[] | null>(null);
  const [all, setAll] = useState(false);
  useEffect(() => { fetch('/api/trois?list=1').then(r => r.json()).then(j => setList(j.days ?? [])).catch(() => setList([])); }, []);
  if (!list) return <p className="fine">Chargement du programme…</p>;
  const from = Math.max(0, cur - 1);
  const shown = all ? list : list.slice(from, from + 14);
  return (
    <>
      <ol className="tl-list tl-inline">
        {shown.map(([i, a, ac, p, pc, t, tc, th]: any[]) => (
          <li key={i} className={i === cur ? 'on' : i < cur ? 'past' : ''}>
            <button onClick={() => onPick?.(i)} disabled={!onPick}>
              <span className="tl-n">{i}</span>
              <span className="tl-li">
                <b>{th}</b>
                <small>{refName(t, tc)} · {refName(p, pc)} · {refName(a, ac)}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
      {!all && <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setAll(true)}>Voir les {list.length} jours</button>}
    </>
  );
}

function Programme({ list, cur, total, prevu, onPick, onStop, onClose }: {
  list: any[] | null; cur: number; total: number; prevu: number;
  onPick: (n: number) => void; onStop?: () => void; onClose: () => void;
}) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="rsheet-back" onClick={onClose}>
      <div className="rsheet tl-sheet" onClick={e => e.stopPropagation()}>
        <div className="rsheet-grip" />
        <div className="tl-sheet-h">
          <div>
            <h3>Le programme</h3>
            <p className="fine">{total < prevu ? `${total} jours prêts sur ${prevu} · la suite arrive` : `${prevu} jours`} · touche un jour pour t&rsquo;y placer</p>
          </div>
          <button className="vbar-x" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        {!list ? <p className="fine">Chargement…</p> : (
          <ol className="tl-list">
            {list.map(([i, a, ac, p, pc, t, tc, th]: any[]) => (
              <li key={i} id={`tl-d-${i}`} className={i === cur ? 'on' : i < cur ? 'past' : ''}>
                <button onClick={() => onPick(i)}>
                  <span className="tl-n">{i}</span>
                  <span className="tl-li">
                    <b>{th}</b>
                    <small>{refName(t, tc)} · {refName(p, pc)} · {refName(a, ac)}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
        {onStop && <button className="linkbtn tl-stop" onClick={onStop}>Arrêter ce parcours</button>}
      </div>
    </div>, document.body
  );
}

/**
 * En bas d'un chapitre ouvert depuis « Les 3 lectures » : cocher la lecture
 * et passer directement à la suivante.
 */
export function TroisSuite({ active, book, chapter, onGo, onBack }: {
  active: boolean; book: number; chapter: number; onGo: (b: number, c: number) => void; onBack: () => void;
}) {
  const [prog, setProg] = useProg();
  const [d, setD] = useState<Day | null>(null);
  const [ctx, setCtx] = useState<number | null>(null);
  useEffect(() => { try { const c = JSON.parse(sessionStorage.getItem(CTX) || 'null'); setCtx(c?.day ?? null); } catch {} }, [book, chapter]);
  useEffect(() => { if (!ctx) return; let a = true; getDay(ctx).then(j => a && setD(j.day)); return () => { a = false; }; }, [ctx]);
  if (!d || !active) return null;
  const ps = parts(d);
  const k = ps.findIndex(([b, c]) => b === book && c === chapter);
  if (k < 0) return null;
  const ok = bit(prog.done, d.n, k) === 1;
  const mark = () => { const m = (prog.done[d.n] ?? 0) | (1 << k); setProg({ ...prog, done: { ...prog.done, [d.n]: m } }); return m; };
  const nextK = [0, 1, 2].find(x => x !== k && !bit(prog.done, d.n, x));
  return (
    <div className="tl-suite">
      <span className="tl-k">Les 3 lectures · Jour {d.n} · {k + 1}/3</span>
      <div className="tl-suite-row">
        {nextK !== undefined ? (
          <button className="btn primary" onClick={() => { mark(); onGo(...ps[nextK]); }}>
            {ok ? '' : '✓ Lu · '}Suite : {refName(...ps[nextK])} ›
          </button>
        ) : (
          <button className="btn primary" onClick={() => { mark(); try { sessionStorage.removeItem(CTX); } catch {} onBack(); }}>
            ✓ Les 3 lectures sont faites · méditer le fil
          </button>
        )}
        {!ok && nextK !== undefined && <button className="btn" onClick={mark}>✓ Lu</button>}
      </div>
    </div>
  );
}
