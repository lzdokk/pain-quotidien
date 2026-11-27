'use client';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { MEDITER_QUESTIONS, MEDITER_ETAPES } from '@/lib/reading-guide';
import { entrees, abonner, synchroniser, supprimer, etiquetteVersets, type EntreeSuivi } from '@/lib/suivi-carnet';

/** CARNET DE SUIVI : les méditations validées, de la plus récente à la plus ancienne, par parcours. */
const jour = (t: number) => new Date(t).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const ETAPES_K = ['paraphraser', 'personnaliser', 'confesser', 'examiner', 'pratiquer'] as const;

export function texteEntree(e: EntreeSuivi) {
  const l: string[] = [`${e.ref}${e.versets.length ? ` (v. ${etiquetteVersets(e.versets)})` : ''}`, `${jour(e.t)} · ${e.parcours.label}`, ''];
  if (e.versets.length) { l.push(...e.versets.map(([n, t]) => `${n}. ${t}`), ''); }
  MEDITER_QUESTIONS.forEach((q, i) => { if (e.questions[i]) l.push(`${q}\n${e.questions[i]}`, ''); });
  ETAPES_K.forEach((k, i) => {
    const v = e.etapes[k]; const titre = MEDITER_ETAPES[i + 1][0];
    if (v) l.push(`${titre} : ${v}`);
    if (k === 'confesser' && e.etapes.confesse) l.push('✓ Proclamé à haute voix');
  });
  return l.join('\n').trim();
}

function Entree({ e, onGoto }: { e: EntreeSuivi; onGoto: (b: number, c: number) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const [sur, setSur] = useState(false);
  const [copie, setCopie] = useState(false);
  const qs = MEDITER_QUESTIONS.map((q, i) => [q, e.questions[i]] as const).filter(([, a]) => a);
  const et = ETAPES_K.map((k, i) => [MEDITER_ETAPES[i + 1][0], e.etapes[k]] as const).filter(([, a]) => a);
  return (
    <article className={`cs-e${ouvert ? ' open' : ''}`}>
      <button className="cs-h" onClick={() => setOuvert(o => !o)} aria-expanded={ouvert}>
        <span className="cs-date">{jour(e.t)}</span>
        <span className="cs-ref">{e.ref}{e.versets.length ? <small> · v. {etiquetteVersets(e.versets)}</small> : null}</span>
        <span className="cs-p">{e.parcours.label}</span>
        {!ouvert && (e.etapes.pratiquer || e.versets[0]) && (
          <span className="cs-peek">{e.etapes.pratiquer ? `Pratiquer : ${e.etapes.pratiquer}` : `« ${e.versets[0][1]} »`}</span>
        )}
        <i className="cs-chev">{ouvert ? '−' : '+'}</i>
      </button>
      {ouvert && (
        <div className="cs-body">
          {e.versets.length > 0 && (
            <div className="md-quote">{e.versets.map(([n, t]) => <p key={n}><sup>{n}</sup> {t}</p>)}</div>
          )}
          {qs.length > 0 && (
            <>
              <div className="md-k">Les questions</div>
              <dl className="cs-dl">{qs.map(([q, a]) => <div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}</dl>
            </>
          )}
          {(et.length > 0 || e.etapes.confesse) && (
            <>
              <div className="md-k">Les étapes</div>
              <dl className="cs-dl">
                {et.map(([q, a]) => <div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}
                {e.etapes.confesse && <div><dt>Confesser</dt><dd>✓ Proclamé à haute voix</dd></div>}
              </dl>
            </>
          )}
          <div className="cs-act">
            <button className="btn sm" onClick={() => onGoto(e.book, e.chapter)}>Relire {e.ref} ›</button>
            <button className="btn sm" onClick={() => { navigator.clipboard?.writeText(texteEntree(e)); setCopie(true); setTimeout(() => setCopie(false), 1500); }}>{copie ? 'Copié ✓' : 'Copier'}</button>
            {sur
              ? <><button className="btn sm cs-del" onClick={() => supprimer(e.id)}>Oui, supprimer</button><button className="btn sm" onClick={() => setSur(false)}>Annuler</button></>
              : <button className="btn sm ghost" onClick={() => setSur(true)}>Supprimer</button>}
          </div>
        </div>
      )}
    </article>
  );
}

export default function CarnetSuivi({ onClose, onGoto }: { onClose: () => void; onGoto: (b: number, c: number) => void }) {
  const [liste, setListe] = useState<EntreeSuivi[]>([]);
  const [filtre, setFiltre] = useState<string>('');
  const [sync, setSync] = useState(true);
  useEffect(() => {
    const f = () => setListe(entrees()); f();
    const off = abonner(f);
    synchroniser().finally(() => setSync(false));
    return off;
  }, []);
  const parcours = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const e of liste) { const x = m.get(e.parcours.id); m.set(e.parcours.id, { label: e.parcours.label, n: (x?.n ?? 0) + 1 }); }
    return [...m.entries()];
  }, [liste]);
  const vue = filtre ? liste.filter(e => e.parcours.id === filtre) : liste;
  const jours = new Set(liste.map(e => new Date(e.t).toDateString())).size;

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="rsheet-back" onClick={onClose}>
      <div className="rsheet md-sheet cs-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label="Carnet de suivi">
        <div className="rsheet-grip" />
        <div className="md-top">
          <div>
            <span className="kicker">Mon carnet de suivi</span>
            <h2 className="md-title">{liste.length ? `${liste.length} méditation${liste.length > 1 ? 's' : ''}` : 'Rien encore'}</h2>
            {liste.length > 0 && <p className="md-mute" style={{ margin: 0 }}>{jours} jour{jours > 1 ? 's' : ''} de méditation{sync ? ' · synchronisation…' : ''}</p>}
          </div>
          <button className="vbar-x" onClick={onClose} aria-label="Fermer">✕</button>
        </div>
        {parcours.length > 1 && (
          <div className="md-ctx-chips cs-f">
            <button className={`ix-chip${!filtre ? ' on' : ''}`} onClick={() => setFiltre('')}>Tout</button>
            {parcours.map(([id, p]) => <button key={id} className={`ix-chip${filtre === id ? ' on' : ''}`} onClick={() => setFiltre(id)}>{p.label} <small className="chip-k">{p.n}</small></button>)}
          </div>
        )}
        {!liste.length && !sync && (
          <div className="md-card"><p className="md-mute" style={{ margin: 0 }}>Quand tu médites un chapitre (bouton <b>+</b> puis <b>Méditer</b>) et que tu valides, la méditation arrive ici avec le parcours, le chapitre, tes versets et tes réponses.</p></div>
        )}
        <div className="cs-list">{vue.map(e => <Entree key={e.id} e={e} onGoto={(b, c) => { onClose(); onGoto(b, c); }} />)}</div>
      </div>
    </div>,
    document.body
  );
}
