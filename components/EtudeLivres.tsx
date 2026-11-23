'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import RefChip from './RefChip';
import CarnetChapitre from './CarnetChapitre';
import { useSuivi, etatParcours } from './EtudierProgress';
import './etudier.css';
import { BOOKS } from '@/lib/refs';
import { GROUPES, PARCOURS, parcoursById, sectionDuChapitre, type Groupe } from '@/lib/parcours';
import { FICHES_LIVRES } from '@/lib/fiches-livres';
import { PLUS } from '@/lib/fiches-contexte';
import { ficheChapitre, FICHES_CHAPITRES } from '@/lib/fiches-chapitres';
import R from '@/components/R';
import { MEDITER_QUESTIONS, MEDITER_ETAPES, QUATRE_TEMPS } from '@/lib/reading-guide';

/**
 * PARCOURS (Lire > Parcours) : lecture quotidienne + études de livres, un seul suivi.
 * Navigation interne : liste > parcours > livre > chapitre, sans quitter le lecteur.
 * L'adresse change à chaque vue (retour du téléphone et lien direct fonctionnent).
 * Le haut de page peut aussi piloter la navigation via l'événement « pq-etude-go ».
 */
type View = { t: 'list' } | { t: 'parcours'; id: string } | { t: 'plan'; id: string } | { t: 'livre'; n: number } | { t: 'chap'; n: number; c: number };

const base = '/lire?tab=parcours&vue=livres';
const enc = (v: View) => v.t === 'list' ? '' : v.t === 'parcours' ? `p:${v.id}` : v.t === 'plan' ? `q:${v.id}` : v.t === 'livre' ? `l:${v.n}` : `c:${v.n}:${v.c}`;
const urlOf = (v: View) => v.t === 'list' ? base : `${base}&e=${encodeURIComponent(enc(v))}`;
function parse(e?: string): View {
  try {
    const raw = e ?? new URLSearchParams(location.search).get('e') ?? '';
    const [k, a, b] = raw.split(':');
    if (k === 'p' && parcoursById(a)) return { t: 'parcours', id: a };
    if (k === 'q' && a) return { t: 'plan', id: a };
    if (k === 'l' && BOOKS[+a - 1]) return { t: 'livre', n: +a };
    if (k === 'c' && BOOKS[+a - 1] && +b >= 1 && +b <= BOOKS[+a - 1][2]) return { t: 'chap', n: +a, c: +b };
  } catch {}
  return { t: 'list' };
}
const parent = (v: View): View => v.t === 'chap' ? { t: 'livre', n: v.n } : { t: 'list' };


type Props = {
  onRead: (book: number, chapter: number) => void;
  plans: any[]; steps: any[];
  activePlanId?: string; activeIndex: number; activeDay: number;
  onChoose: (planId: string) => void;
  onJump: (planId: string, day: number) => void;
};

export default function EtudeLivres({ onRead, plans, steps, activePlanId, activeIndex, activeDay, onChoose, onJump }: Props) {
  const [view, setView] = useState<View>(() => (typeof window === 'undefined' ? { t: 'list' } : parse()));
  const pushes = useRef(0);
  const [filtre, setFiltre] = useState<'all' | 'jour' | Groupe>('all');
  const suivi = useSuivi();
  const { actif, setActif, toggleEtape, lire, estLu, reprendre, resetLivre } = suivi;
  const sure = (q: string) => { try { return window.confirm(q); } catch { return true; } };
  const planActif = actif ? undefined : activePlanId;

  const go = useCallback((v: View, scroll = true) => {
    setView(v);
    try { window.history.pushState(null, '', urlOf(v)); pushes.current++; } catch {}
    if (scroll) window.scrollTo({ top: 0 });
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
    const onGo = (ev: Event) => {
      const v = parse((ev as CustomEvent<string>).detail);
      go(v, false);
      document.getElementById('mes-parcours')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('pq-etude-go', onGo);
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('pq-etude-go', onGo); };
  }, [go]);

  const key = enc(view) || 'list';
  const Back = ({ label }: { label: string }) => (
    <div className="pe-top"><button className="pe-back" onClick={back}>‹ {label}</button></div>
  );

  /* ───────── 1. Liste des parcours ───────── */
  if (view.t === 'list') {
    return (
      <div className="pe-wrap" id="mes-parcours"><div className="pe-view" key={key}>
        <div className="pe-head">
          <span className="eyebrow">Parcours</span>
          <h2>Quel parcours suivre ?</h2>
          <p>Lecture quotidienne ou étude des livres : un seul endroit, un seul suivi. Le parcours choisi s’affiche tout en haut.</p>
        </div>
        <div className="chips" role="tablist" style={{ margin: '4px 0 0' }}>
          <button className="chip" aria-selected={filtre === 'all'} onClick={() => setFiltre('all')}>Tous ({plans.length + PARCOURS.length})</button>
          <button className="chip" aria-selected={filtre === 'jour'} onClick={() => setFiltre('jour')}>Au quotidien ({plans.length})</button>
          {GROUPES.map(g => (
            <button key={g.id} className="chip" aria-selected={filtre === g.id} onClick={() => setFiltre(g.id)}>
              {g.label} ({PARCOURS.filter(p => p.groupe === g.id).length})
            </button>
          ))}
        </div>
        {(filtre === 'all' || filtre === 'jour') && (
          <section>
            <div className="pe-grp">Au quotidien</div>
            <div className="pe-list">
              {plans.map((p: any) => {
                const en = p.id === planActif;
                return (
                  <button key={p.id} className="card pad pe-item" onClick={() => go({ t: 'plan', id: p.id })}>
                    <h3>{p.name}{en && <span className="pe-badge">En cours</span>}</h3>
                    <p>{<R t={p.subtitle} />}</p>
                    <div className="pe-prog">{en && p.days ? `Jour ${activeDay} sur ${p.days}` : p.days ? `${p.days} jours` : 'À votre rythme'}</div>
                    {en && p.days && <div className="pe-bar"><i style={{ width: `${Math.min(100, Math.round((activeDay - 1) / p.days * 100))}%` }} /></div>}
                  </button>
                );
              })}
            </div>
          </section>
        )}
        {GROUPES.filter(g => filtre === 'all' || filtre === g.id).map(g => (
          <section key={g.id}>
            <div className="pe-grp">{g.label}</div>
            <div className="pe-list">
              {PARCOURS.filter(p => p.groupe === g.id).map(p => {
                const { etapes, faites } = etatParcours(p, suivi);
                const en = p.id === actif;
                return (
                  <button key={p.id} className="card pad pe-item" onClick={() => go({ t: 'parcours', id: p.id })}>
                    <h3>{p.titre}{en && <span className="pe-badge">En cours</span>}</h3>
                    <p>{p.pour}</p>
                    <div className="pe-prog">{faites > 0 ? `${faites} sur ${etapes.length} terminés` : `${etapes.length} étapes`}</div>
                    {faites > 0 && <div className="pe-bar"><i style={{ width: `${Math.round(faites / etapes.length * 100)}%` }} /></div>}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div></div>
    );
  }

  /* ───────── 2b. Un parcours de lecture quotidienne ───────── */
  if (view.t === 'plan') {
    const P = plans.find((x: any) => x.id === view.id);
    if (!P) return null;
    const en = P.id === planActif;
    const mine = steps.filter((x: any) => x.plan_id === P.id);
    return (
      <div className="pe-wrap" id="mes-parcours"><div className="pe-view" key={key}>
        <Back label="Parcours" />
        <div className="pe-head">
          <span className="eyebrow">Au quotidien</span>
          <h2>{P.name}</h2>
          <p>{<R t={P.subtitle} />}{P.days ? ` · ${P.days} jours` : ''}</p>
        </div>
        <div className="card pad">
          {en ? (
            <>
              <div className="pe-prog">En cours · {P.days ? `jour ${activeDay} sur ${P.days}` : `étape ${activeIndex + 1} sur ${mine.length}`}</div>
              {P.days ? <div className="pe-bar"><i style={{ width: `${Math.min(100, Math.round((activeDay - 1) / P.days * 100))}%` }} /></div> : null}
              <div style={{ marginTop: 12 }}>
                <button className="btn" onClick={() => sure('Recommencer ce parcours au jour 1 ?') && onJump(P.id, 1)}>↺ Recommencer du début</button>
              </div>
            </>
          ) : (
            <button className="btn primary" onClick={() => { setActif(null); onChoose(P.id); }}>Suivre ce parcours</button>
          )}
          {P.audience && <div className="pe-row" style={{ marginTop: 12 }}><dt>Pour qui</dt><dd>{<R t={P.audience} />}</dd></div>}
          {P.rationale && <p style={{ marginTop: 10 }}>{<R t={P.rationale} />}</p>}
        </div>
        <div className="card pad">
          {mine.map((e: any, i: number) => {
            const fait = en && i < activeIndex;
            const jour = 1 + mine.slice(0, i).reduce((t: number, x: any) => t + (x.chapters || 1), 0);
            return (
              <div key={e.position} className={`pe-step${fait ? ' done' : ''}`}>
                <span className="pe-check" aria-hidden>{fait ? '✓' : ''}</span>
                <div className="pe-step-main">
                  <div className="pe-step-t">{e.label}</div>
                  {e.title && <div className="pe-prog" style={{ margin: '2px 0 0' }}>{e.title}{e.chapters ? ` · ${e.chapters} jours` : ''}</div>}
                  {e.description && <p className="pe-prog" style={{ margin: '6px 0 0' }}>{<R t={e.description} />}</p>}
                  <div className="pe-links">
                    <button className="ix-chip" onClick={() => go({ t: 'livre', n: e.book })}>Fiche du livre</button>
                    <button className="ix-chip" onClick={() => onRead(e.book, 1)}>Lire</button>
                    <button className="ix-chip" onClick={() => sure(`Reprendre le parcours à « ${e.label} » (jour ${jour}) ?`) && onJump(P.id, jour)}>↺ Reprendre ici</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div></div>
    );
  }

  /* ───────── 2. Un parcours d'étude ───────── */
  if (view.t === 'parcours') {
    const p = parcoursById(view.id)!;
    const { etapes, courant, faites } = etatParcours(p, suivi);
    const en = p.id === actif;
    const pct = Math.round(faites / etapes.length * 100);
    return (
      <div className="pe-wrap" id="mes-parcours"><div className="pe-view" key={key}>
        <Back label="Parcours" />
        <div className="pe-head">
          <span className="eyebrow">Étude des livres</span>
          <h2>{p.titre}</h2>
          <p>{p.pour}</p>
        </div>
        <div className="card pad">
          <div className="pe-prog">{faites} sur {etapes.length} terminés</div>
          <div className="pe-bar"><i style={{ width: `${pct}%` }} /></div>
          {en
            ? <p className="pe-prog" style={{ marginTop: 10 }}>Parcours en cours : il s’affiche tout en haut de la page.</p>
            : <div style={{ marginTop: 12 }}><button className="btn primary" onClick={() => { setActif(p.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Suivre ce parcours</button></div>}
          {(faites > 0 || etapes.some(x => x.lus > 0)) && (
            <div style={{ marginTop: 10 }}>
              <button className="btn" onClick={() => sure('Remettre ce parcours à zéro ? Les chapitres lus de ses livres seront décochés.') && reprendre(p.id, 0)}>↺ Recommencer du début</button>
            </div>
          )}
        </div>
        <div className="card pad">
          {etapes.map(s => {
            const nom = BOOKS[s.book - 1][1];
            return (
              <div key={s.i} className={`pe-step${s.complete ? ' done' : ''}`}>
                <button className="pe-check" aria-pressed={s.complete} aria-label={`Marquer ${s.label} comme terminé`} onClick={() => toggleEtape(p.id, s.i)}>
                  {s.complete ? '✓' : ''}
                </button>
                <div className="pe-step-main">
                  <div className="pe-step-t">{s.label}{s.i === courant ? <span className="pe-badge">À lire</span> : null}</div>
                  {s.chapters.length > 1 && <div className="pe-prog" style={{ margin: '2px 0 0' }}>{s.lus} chapitre{s.lus > 1 ? 's' : ''} lu{s.lus > 1 ? 's' : ''} sur {s.chapters.length}</div>}
                  <div className="pe-links">
                    <button className="ix-chip" onClick={() => go({ t: 'livre', n: s.book })}>Fiche du livre</button>
                    <button className="ix-chip" onClick={() => onRead(s.book, s.prochain)}>Lire {nom} {s.prochain}</button>
                    <button className="ix-chip" onClick={() => go({ t: 'chap', n: s.book, c: s.prochain })}>Étudier le chapitre {s.prochain}</button>
                    {(s.lus > 0 || s.complete || s.i > courant) && (
                      <button className="ix-chip" onClick={() => sure(`Reprendre le parcours à « ${s.label} » ? Cette étape et les suivantes seront remises à zéro.`) && reprendre(p.id, s.i)}>↺ Reprendre ici</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div></div>
    );
  }

  /* ───────── 3. Fiche d'un livre ───────── */
  if (view.t === 'livre') {
    const [ab, nom, chapitres] = BOOKS[view.n - 1];
    const f = FICHES_LIVRES[view.n];
    const x = PLUS[view.n];
    const row = (k: string, v: string) => <div className="pe-row"><dt>{k}</dt><dd>{v}</dd></div>;
    const lus = Array.from({ length: chapitres }, (_, i) => i + 1).filter(c => estLu(view.n, c)).length;
    return (
      <div className="pe-wrap" id="mes-parcours"><div className="pe-view" key={key}>
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
        {x && (
          <>
            <section className="card pad">
              <span className="kicker">Le contexte</span>
              <p className="pe-big" style={{ fontSize: 16.5 }}>{x.ctx}</p>
            </section>
            <section className="card pad">
              <span className="kicker">Ce qui se joue dans ce livre</span>
              <p className="pe-big" style={{ fontSize: 16.5 }}>{x.fil}</p>
              <ul className="pe-q" style={{ marginTop: 10 }}>{x.th.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </section>
          </>
        )}
        <section className="card pad">
          <span className="kicker">Le plan</span>
          <ul className="pe-plan">{f.pl.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </section>
        <section className="card pad">
          <span className="kicker">Où est Jésus ?</span>
          <p className="pe-big" style={{ fontSize: 16.5 }}>{f.j}</p>
          <span className="kicker" style={{ marginTop: 14, display: 'block' }}>Comment Dieu me parle</span>
          <p className="pe-big" style={{ fontSize: 16.5 }}>{f.dg}</p>
        </section>
        {x && (
          <section className="card pad">
            <span className="kicker">Comment le lire</span>
            <p className="pe-big" style={{ fontSize: 16.5 }}>{x.lire}</p>
            <span className="kicker" style={{ marginTop: 14, display: 'block' }}>Pour ma vie</span>
            <p className="pe-big" style={{ fontSize: 16.5 }}>{x.appl}</p>
          </section>
        )}
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
          <span className="kicker">Étudier chapitre par chapitre{lus > 0 ? ` · ${lus} lu${lus > 1 ? 's' : ''} sur ${chapitres}` : ''}</span>
          <div className="pe-chaps">
            {Array.from({ length: chapitres }, (_, i) => i + 1).map(c => (
              <button key={c} className={`pe-chap${FICHES_CHAPITRES[`${view.n}-${c}`] ? ' has' : ''}${estLu(view.n, c) ? ' read' : ''}`} onClick={() => go({ t: 'chap', n: view.n, c })}>{c}</button>
            ))}
          </div>
          <p className="pe-prog">Les chapitres cochés (✓) sont lus. Chaque chapitre a ses questions de méditation et ton carnet.</p>
          {lus > 0 && <button className="ix-chip" onClick={() => sure(`Remettre ${nom} à zéro ? Tous ses chapitres seront décochés.`) && resetLivre(view.n)}>↺ Reprendre {nom} du début</button>}
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
  const lf = FICHES_LIVRES[n];
  const x = PLUS[n];
  const section = sectionDuChapitre(lf.pl, c);
  const lu = estLu(n, c);
  return (
    <div className="pe-wrap" id="mes-parcours"><div className="pe-view" key={key}>
      <Back label={nom} />
      <div className="pe-head">
        <span className="eyebrow">Étude du chapitre</span>
        <h2>{nom} {c}</h2>
        {section && <p>Dans le plan du livre : {section}</p>}
      </div>
      <div className="share-grid" style={{ marginBottom: 12 }}>
        <button className="btn primary" onClick={() => onRead(n, c)}>Lire {nom} {c} ›</button>
        <button className={`btn${lu ? ' on' : ''}`} onClick={() => lire(n, c, !lu)}>{lu ? '✓ Chapitre lu' : 'Marquer comme lu'}</button>
      </div>
      <section className="card pad">
        <span className="kicker">① Avant de lire</span>
        <p><b>D&rsquo;abord, demande à l&rsquo;Esprit d&rsquo;ouvrir ton intelligence.</b> {QUATRE_TEMPS[0][1]}</p>
        <p>Lis ensuite le chapitre trois fois : d&rsquo;une traite, à voix haute, crayon en main.</p>
        {x && (
          <>
            <span className="kicker" style={{ marginTop: 12, display: 'block' }}>Le contexte du livre</span>
            <p>{x.ctx}</p>
            <span className="kicker" style={{ marginTop: 12, display: 'block' }}>Ce qui se joue</span>
            <p>{x.fil}</p>
          </>
        )}
      </section>
      {f ? (
        <>
          <section className="card pad">
            <span className="kicker">② Le chapitre en bref</span>
            <p>{<R t={f.resume} />}</p>
            <dl className="pe-dl" style={{ marginTop: 8 }}>{f.blocs.map(([v, i]) => <div className="pe-row" key={v}><dt>v. {v}</dt><dd>{i}</dd></div>)}</dl>
          </section>
          <section className="card pad">
            <span className="kicker">③ Se poser les questions</span>
            <dl className="pe-dl">{MEDITER_QUESTIONS.map((q, i) => <div className="pe-row" key={q}><dt>{q}</dt><dd><R t={f.questions[i]} /></dd></div>)}</dl>
          </section>
          <section className="card pad">
            <span className="kicker">④ Où est Jésus ? Comment Dieu me parle ?</span>
            <ul className="pe-q">{f.jesus.map((q, i) => <li key={i}><R t={q} /></li>)}</ul>
          </section>
          <section className="card pad">
            <span className="kicker">⑤ Puis, les six étapes</span>
            <ol className="med-steps" style={{ gap: 10 }}>{MEDITER_ETAPES.map(([t, d], i) => <li key={t}><b>{t}</b> {d}<div style={{ marginTop: 3, color: 'var(--ink-2)' }}><R t={f.etapes[i]} /></div></li>)}</ol>
          </section>
          <section className="card pad">
            <span className="kicker">⑥ Pour en parler autour de moi</span>
            <p className="pe-big">{f.parler.phrase}</p>
            <p><b>Question à poser :</b> {f.parler.question}</p>
          </section>
        </>
      ) : (
        <>
          {x && (
            <section className="card pad">
              <span className="kicker">② Comment lire ce chapitre</span>
              <p>{x.lire}</p>
              <span className="kicker" style={{ marginTop: 12, display: 'block' }}>Les grands thèmes à repérer</span>
              <ul className="pe-q">{x.th.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </section>
          )}
          <section className="card pad">
            <span className="kicker">③ Méditer ce chapitre</span>
            <div className="med-q">{MEDITER_QUESTIONS.map((q, i) => <span key={i}>{q}</span>)}</div>
            <ol className="med-steps">{MEDITER_ETAPES.map(([t, d]) => <li key={t}><b>{t}</b> {d}</li>)}</ol>
          </section>
          <section className="card pad">
            <span className="kicker">④ Où est Jésus ? Comment Dieu me parle ?</span>
            <p>{lf.j}</p>
            <p>{lf.dg}</p>
            {x && <><span className="kicker" style={{ marginTop: 12, display: 'block' }}>Pour ma vie</span><p>{x.appl}</p></>}
            <div className="share-grid" style={{ marginTop: 10 }}>
              <button className="btn" onClick={() => go({ t: 'livre', n })}>Fiche complète du livre ›</button>
            </div>
          </section>
        </>
      )}
      <section className="card pad">
        <span className="kicker">Mon carnet</span>
        <p className="pe-prog" style={{ marginTop: 0, marginBottom: 8 }}>Les six étapes, une par une : choisir, paraphraser, personnaliser, confesser, m&rsquo;examiner, pratiquer.</p>
        <CarnetChapitre cle={`${n}-${c}`} placeholder="Mes notes sur ce chapitre…" />
      </section>
      <div className="pe-nav">
        {c > 1 ? <button className="btn" onClick={() => go({ t: 'chap', n, c: c - 1 })}>‹ Chapitre {c - 1}</button> : <span />}
        {c < chapitres ? <button className="btn" onClick={() => go({ t: 'chap', n, c: c + 1 })}>Chapitre {c + 1} ›</button> : <span />}
      </div>
    </div></div>
  );
}
