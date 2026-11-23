'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import RefChip from './RefChip';
import CarnetChapitre from './CarnetChapitre';
import { useProgression } from './EtudierProgress';
import './etudier.css';
import { BOOKS } from '@/lib/refs';
import { GROUPES, PARCOURS, parcoursById, resoudreEtape, type Groupe } from '@/lib/parcours';
import { FICHES_LIVRES } from '@/lib/fiches-livres';
import { ficheChapitre, FICHES_CHAPITRES } from '@/lib/fiches-chapitres';

/**
 * ÉTUDE DES LIVRES — vit dans Lire > Parcours (à côté de « Lecture du jour »).
 * Navigation interne : liste > parcours > livre > chapitre, sans quitter le lecteur.
 * L'adresse change à chaque vue (retour du téléphone et lien direct fonctionnent).
 */
type View = { t: 'list' } | { t: 'parcours'; id: string } | { t: 'livre'; n: number } | { t: 'chap'; n: number; c: number };

const base = '/lire?tab=parcours&vue=livres';
const enc = (v: View) => v.t === 'list' ? '' : v.t === 'parcours' ? `p:${v.id}` : v.t === 'livre' ? `l:${v.n}` : `c:${v.n}:${v.c}`;
const urlOf = (v: View) => v.t === 'list' ? base : `${base}&e=${encodeURIComponent(enc(v))}`;
function parse(): View {
  try {
    const e = new URLSearchParams(location.search).get('e') ?? '';
    const [k, a, b] = e.split(':');
    if (k === 'p' && parcoursById(a)) return { t: 'parcours', id: a };
    if (k === 'l' && BOOKS[+a - 1]) return { t: 'livre', n: +a };
    if (k === 'c' && BOOKS[+a - 1] && +b >= 1 && +b <= BOOKS[+a - 1][2]) return { t: 'chap', n: +a, c: +b };
  } catch {}
  return { t: 'list' };
}
const parent = (v: View): View =>
  v.t === 'chap' ? { t: 'livre', n: v.n } : v.t === 'livre' ? { t: 'list' } : { t: 'list' };

const QUESTIONS = [
  'Qui parle ? À qui s’adresse-t-on ?',
  'Que se passe-t-il ? Quel est le contexte ?',
  'Que m’apprend ce passage sur Dieu, sur Jésus ?',
  'Comment aurais-je réagi dans la même situation ?',
  'Comment devrais-je réagir aujourd’hui ?',
  'Ce passage est-il d’actualité ? Quel équivalent aujourd’hui ?',
  'Y a-t-il un péché à confesser, une promesse à saisir, un ordre à suivre, un exemple à imiter ?',
  'À qui puis-je en parler cette semaine ?'
];

export default function EtudeLivres({ onRead }: { onRead: (book: number, chapter: number) => void }) {
  const [view, setView] = useState<View>(() => (typeof window === 'undefined' ? { t: 'list' } : parse()));
  const pushes = useRef(0);
  const [filtre, setFiltre] = useState<'all' | Groupe>('all');
  const { done, toggle } = useProgression();

  const go = useCallback((v: View) => {
    setView(v);
    try { window.history.pushState(null, '', urlOf(v)); pushes.current++; } catch {}
    window.scrollTo({ top: 0 });
  }, []);
  const back = useCallback(() => {
    if (pushes.current > 0) { pushes.current--; window.history.back(); return; }
    const p = parent(view);
    setView(p);
    try { window.history.replaceState(null, '', urlOf(p)); } catch {}
    window.scrollTo({ top: 0 });
  }, [view]);

  useEffect(() => {
    const onPop = () => { setView(parse()); window.scrollTo({ top: 0 }); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const key = enc(view) || 'list';
  const Back = ({ label }: { label: string }) => (
    <div className="pe-top"><button className="pe-back" onClick={back}>‹ {label}</button></div>
  );

  /* ───────── 1. Liste des parcours ───────── */
  if (view.t === 'list') {
    return (
      <div className="pe-wrap"><div className="pe-view" key={key}>
        <div className="pe-head">
          <span className="eyebrow">Étude des livres</span>
          <h2>Quel livre méditer, dans quel ordre ?</h2>
          <p>Choisis un parcours : chaque livre a sa fiche, ses questions et ton carnet.</p>
        </div>
        <div className="chips" role="tablist" style={{ margin: '4px 0 0' }}>
          <button className="chip" aria-selected={filtre === 'all'} onClick={() => setFiltre('all')}>Tous ({PARCOURS.length})</button>
          {GROUPES.map(g => (
            <button key={g.id} className="chip" aria-selected={filtre === g.id} onClick={() => setFiltre(g.id)}>
              {g.label} ({PARCOURS.filter(p => p.groupe === g.id).length})
            </button>
          ))}
        </div>
        {GROUPES.filter(g => filtre === 'all' || filtre === g.id).map(g => (
          <section key={g.id}>
            <div className="pe-grp">{g.label}</div>
            <div className="pe-list">
              {PARCOURS.filter(p => p.groupe === g.id).map(p => {
                const n = (done[p.id] ?? []).length, total = p.etapes.length;
                return (
                  <button key={p.id} className="card pad pe-item" onClick={() => go({ t: 'parcours', id: p.id })}>
                    <h3>{p.titre}</h3>
                    <p>{p.pour}</p>
                    <div className="pe-prog">{n > 0 ? `${n} sur ${total} terminés` : `${total} étapes`}</div>
                    {n > 0 && <div className="pe-bar"><i style={{ width: `${Math.round(n / total * 100)}%` }} /></div>}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div></div>
    );
  }

  /* ───────── 2. Un parcours ───────── */
  if (view.t === 'parcours') {
    const p = parcoursById(view.id)!;
    const steps = p.etapes.map(l => resoudreEtape(l)).filter((e): e is NonNullable<typeof e> => !!e);
    const mine = new Set(done[p.id] ?? []);
    const next = steps.findIndex((_, i) => !mine.has(i));
    return (
      <div className="pe-wrap"><div className="pe-view" key={key}>
        <Back label="Parcours" />
        <div className="pe-head">
          <span className="eyebrow">Parcours</span>
          <h2>{p.titre}</h2>
          <p>{p.pour}</p>
        </div>
        <div className="card pad">
          <div className="pe-prog">{mine.size} sur {steps.length} terminés</div>
          <div className="pe-bar"><i style={{ width: `${Math.round(mine.size / steps.length * 100)}%` }} /></div>
        </div>
        {next >= 0 && mine.size > 0 && <div className="pe-next" style={{ marginTop: 10 }}>Prochaine étape : <b>{steps[next].label}</b></div>}
        <div className="card pad">
          {steps.map((s, i) => (
            <div key={i} className={`pe-step${mine.has(i) ? ' done' : ''}`}>
              <button className="pe-check" aria-pressed={mine.has(i)} aria-label={`Marquer ${s.label} comme terminé`} onClick={() => toggle(p.id, i)}>
                {mine.has(i) ? '✓' : ''}
              </button>
              <div className="pe-step-main">
                <div className="pe-step-t">{s.label}</div>
                <div className="pe-links">
                  <button className="ix-chip" onClick={() => go({ t: 'livre', n: s.book })}>Fiche du livre</button>
                  <button className="ix-chip" onClick={() => onRead(s.book, s.chapter ?? 1)}>Lire</button>
                  <button className="ix-chip" onClick={() => go({ t: 'chap', n: s.book, c: s.chapter ?? 1 })}>Étudier le chapitre {s.chapter ?? 1}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div></div>
    );
  }

  /* ───────── 3. Fiche d'un livre ───────── */
  if (view.t === 'livre') {
    const [ab, nom, chapitres] = BOOKS[view.n - 1];
    const f = FICHES_LIVRES[view.n];
    const row = (k: string, v: string) => <div className="pe-row"><dt>{k}</dt><dd>{v}</dd></div>;
    return (
      <div className="pe-wrap"><div className="pe-view" key={key}>
        <Back label="Retour" />
        <div className="pe-head">
          <span className="eyebrow">Fiche du livre</span>
          <h2>{nom}</h2>
          <p>{f.t}</p>
        </div>
        <section className="card pad">
          <span className="kicker">Carte d&rsquo;identité</span>
          <dl className="pe-dl">{row('Auteur', f.a)}{row('Date', f.d)}{row('À qui', f.p)}{row('Genre', f.g)}</dl>
        </section>
        <section className="card pad">
          <span className="kicker">Le plan</span>
          <ul className="pe-plan">{f.pl.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </section>
        <section className="card pad">
          <span className="kicker">Où est Jésus ?</span>
          <p className="pe-big" style={{ fontSize: 16.5 }}>{f.j}</p>
          <span className="kicker" style={{ marginTop: 14, display: 'block' }}>Comment Dieu me parle</span>
          <p className="pe-big" style={{ fontSize: 16.5 }}>{f.dg}</p>
        </section>
        <section className="card pad">
          <span className="kicker">Versets clés</span>
          <div className="ix-chips">
            {f.v.map(r => /^\d/.test(r) ? <RefChip key={r} r={`${ab} ${r.replace(':', '.')}`} /> : <span key={r} className="ix-chip soon">{r}</span>)}
          </div>
          {f.x && <div className="pe-warn">{f.x}</div>}
        </section>
        <section className="card pad">
          <span className="kicker">À lire avec</span>
          <div className="ix-chips">{f.l.map(r => <RefChip key={r} r={r.replace(':', '.')} />)}</div>
        </section>
        <section className="card pad">
          <span className="kicker">Étudier chapitre par chapitre</span>
          <div className="pe-chaps">
            {Array.from({ length: chapitres }, (_, i) => i + 1).map(c => (
              <button key={c} className={`pe-chap${FICHES_CHAPITRES[`${view.n}-${c}`] ? ' has' : ''}`} onClick={() => go({ t: 'chap', n: view.n, c })}>{c}</button>
            ))}
          </div>
          <p className="pe-prog">Les chapitres en couleur ont leur fiche détaillée ; les autres ont les questions de méditation et le carnet.</p>
        </section>
        <div className="share-grid" style={{ marginTop: 18 }}>
          <button className="btn primary" onClick={() => onRead(view.n, 1)}>Lire {nom} ›</button>
        </div>
        <p className="ix-note">Fiche rédigée pour Pain de Vie à partir de sources évangéliques de référence. Les dates et auteurs suivent la tradition ; vérifie avec ta Bible d&rsquo;étude.</p>
      </div></div>
    );
  }

  /* ───────── 4. Étude d'un chapitre ───────── */
  const { n, c } = view;
  const [, nom, chapitres] = BOOKS[n - 1];
  const f = ficheChapitre(n, c);
  return (
    <div className="pe-wrap"><div className="pe-view" key={key}>
      <Back label={nom} />
      <div className="pe-head">
        <span className="eyebrow">Étude du chapitre</span>
        <h2>{nom} {c}</h2>
      </div>
      <div className="share-grid" style={{ marginBottom: 12 }}>
        <button className="btn primary" onClick={() => onRead(n, c)}>Lire {nom} {c} ›</button>
      </div>
      <section className="card pad">
        <span className="kicker">① Avant de lire</span>
        <p>Prie : « Ouvre mes yeux, que je voie les merveilles de ta loi » (Ps 119.18). Lis le chapitre trois fois : d&rsquo;une traite, à voix haute, crayon en main.</p>
      </section>
      {f ? (
        <>
          <section className="card pad">
            <span className="kicker">② Le chapitre en bref</span>
            <p>{f.resume}</p>
            <dl className="pe-dl" style={{ marginTop: 8 }}>{f.blocs.map(([v, i]) => <div className="pe-row" key={v}><dt>v. {v}</dt><dd>{i}</dd></div>)}</dl>
          </section>
          <section className="card pad"><span className="kicker">③ Observer</span><ul className="pe-q">{f.observation.map((x, i) => <li key={i}>{x}</li>)}</ul></section>
          <section className="card pad"><span className="kicker">④ Comprendre</span><ul className="pe-q">{f.interpretation.map((x, i) => <li key={i}>{x}</li>)}</ul></section>
          <section className="card pad"><span className="kicker">⑤ Me mettre dans la scène</span><ul className="pe-q">{f.scene.map((x, i) => <li key={i}>{x}</li>)}</ul></section>
          <section className="card pad">
            <span className="kicker">⑥ Méditer et agir</span>
            <ul className="pe-q">
              <li><b>Verset à ruminer :</b> {f.mediter.verset}</li>
              <li><b>Question :</b> {f.mediter.question}</li>
              <li><b>Action :</b> {f.mediter.action}</li>
            </ul>
          </section>
          <section className="card pad">
            <span className="kicker">⑦ Pour en parler autour de moi</span>
            <p className="pe-big">{f.parler.phrase}</p>
            <p><b>Question à poser :</b> {f.parler.question}</p>
          </section>
        </>
      ) : (
        <section className="card pad">
          <span className="kicker">Questions pour méditer ce chapitre</span>
          <ul className="pe-q">{QUESTIONS.map((q, i) => <li key={i}>{q}</li>)}</ul>
          <p className="pe-prog">La fiche détaillée de ce chapitre arrive peu à peu. La fiche du livre te donne le cadre en attendant.</p>
          <div className="share-grid" style={{ marginTop: 10 }}>
            <button className="btn" onClick={() => go({ t: 'livre', n })}>Fiche du livre ›</button>
          </div>
        </section>
      )}
      <section className="card pad">
        <span className="kicker">Mon carnet</span>
        <p className="pe-prog" style={{ marginTop: 0, marginBottom: 8 }}>Ce que Dieu me dit, ce que je fais, ce que je veux dire à quelqu&rsquo;un.</p>
        <CarnetChapitre cle={`${n}-${c}`} placeholder="Mes notes sur ce chapitre…" />
      </section>
      <div className="pe-nav">
        {c > 1 ? <button className="btn" onClick={() => go({ t: 'chap', n, c: c - 1 })}>‹ Chapitre {c - 1}</button> : <span />}
        {c < chapitres ? <button className="btn" onClick={() => go({ t: 'chap', n, c: c + 1 })}>Chapitre {c + 1} ›</button> : <span />}
      </div>
    </div></div>
  );
}
