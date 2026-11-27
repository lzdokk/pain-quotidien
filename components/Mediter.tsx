'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MEDITER_QUESTIONS, MEDITER_ETAPES } from '@/lib/reading-guide';
import { ficheChapitre } from '@/lib/fiches-chapitres';
import { aiFetch } from '@/lib/ai-key';
import { ajouter, entrees, abonner, etiquetteVersets, type EntreeSuivi } from '@/lib/suivi-carnet';
import NeedKey from './NeedKey';
import R from './R';

/**
 * MÉDITER UN CHAPITRE : l'aide du chapitre, une zone de réponse par question,
 * les six étapes (le verset choisi d'abord), puis « Valider » ajoute la méditation
 * au carnet de suivi, rattachée au parcours du jour.
 * Le brouillon reste sur l'appareil tant qu'il n'est pas validé.
 */
export type Contexte = { id: string; label: string };
type Aide = {
  title?: string; dating?: string; resume: string;
  blocs: Array<[string, string]>; questions: string[]; jesus: string[]; etapes: string[];
  parler?: { phrase: string; question: string };
};
type Brouillon = {
  q: string[]; sel: number[]; par: string; per: string; conf: string; confesse: boolean; exa: string; pra: string; ctx?: string;
};
const VIDE: Brouillon = { q: ['', '', '', '', '', ''], sel: [], par: '', per: '', conf: '', confesse: false, exa: '', pra: '' };
const CHAMPS = ['par', 'per', 'conf', 'exa', 'pra'] as const;

/** L'aide d'un chapitre : la fiche écrite à la main si elle existe, sinon celle préparée à la demande. */
function useAide(book: number, chapter: number) {
  const fixe = ficheChapitre(book, chapter);
  const [aide, setAide] = useState<Aide | null | undefined>(undefined);
  const [etat, setEtat] = useState<'' | 'prep' | 'cle' | 'err'>('');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let vivant = true;
    setEtat(''); setMsg('');
    if (fixe) { setAide({ ...fixe }); return; }
    setAide(undefined);
    fetch(`/api/chapitre?b=${book}&c=${chapter}`).then(r => r.ok ? r.json() : null)
      .then(j => { if (vivant) setAide(j ? norm(j) : null); }).catch(() => vivant && setAide(null));
    return () => { vivant = false; };
  }, [book, chapter]); // eslint-disable-line react-hooks/exhaustive-deps
  const preparer = async () => {
    setEtat('prep');
    try {
      const r = await aiFetch('/api/chapitre', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ book, chapter }) });
      const j = await r.json().catch(() => null);
      if (r.ok && j) { setAide(norm(j)); setEtat(''); return; }
      if (j?.needKey) { setEtat('cle'); setMsg(j.error ?? ''); return; }
      setEtat('err'); setMsg(j?.error ?? 'La préparation a échoué, réessaie.');
    } catch { setEtat('err'); setMsg('La préparation a échoué, réessaie.'); }
  };
  useEffect(() => {
    const on = () => { if (etat === 'cle') preparer(); };
    window.addEventListener('pq-ai-key', on);
    return () => window.removeEventListener('pq-ai-key', on);
  }); // eslint-disable-line react-hooks/exhaustive-deps
  return { aide, etat, msg, preparer };
}
const norm = (j: any): Aide => ({
  title: j.title, dating: j.dating, resume: j.resume ?? '',
  blocs: (j.blocs ?? []).map((b: any) => Array.isArray(b) ? b : [b.v, b.idee]),
  questions: j.questions ?? [], jesus: j.jesus ?? [], etapes: j.etapes ?? [], parler: j.parler
});

function Champ({ label, n, aide, value, onChange, ph }: {
  label: JSX.Element; n: number; aide?: string; value: string; onChange: (v: string) => void; ph?: string;
}) {
  const [voir, setVoir] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const t = ref.current; if (t) { t.style.height = 'auto'; t.style.height = Math.max(54, t.scrollHeight) + 'px'; } }, [value]);
  return (
    <div className="md-champ">
      <div className="md-l"><span className="md-n">{n}</span><span className="md-lt">{label}</span>
        {aide && <button type="button" className={`md-aide-b${voir ? ' on' : ''}`} onClick={() => setVoir(v => !v)}>{voir ? 'Masquer l’aide' : 'Aide'}</button>}
      </div>
      {voir && aide && <div className="md-aide"><R t={aide} /></div>}
      <textarea ref={ref} className="md-ta" rows={2} value={value} placeholder={ph ?? 'Ma réponse…'} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

export default function Mediter({ book, chapter, bookName, verses, initialSel, contextes, defaut, onClose, onCarnet }: {
  book: number; chapter: number; bookName: string;
  verses: Array<{ verse: number; text: string }>;
  initialSel: number[];
  contextes: Contexte[];
  defaut: string;
  onClose: () => void;
  onCarnet: () => void;
}) {
  const cle = `pq-med-${book}-${chapter}`;
  const [b, setB] = useState<Brouillon>(VIDE);
  const [fait, setFait] = useState<EntreeSuivi | null>(null);
  const [aideOuverte, setAideOuverte] = useState(false);
  const [nb, setNb] = useState(0);
  const { aide, etat, msg, preparer } = useAide(book, chapter);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let d: Brouillon = { ...VIDE };
    try { const j = JSON.parse(localStorage.getItem(cle) || 'null'); if (j) d = { ...VIDE, ...j }; } catch {}
    if (initialSel.length) d.sel = [...new Set([...d.sel, ...initialSel])].sort((x, y) => x - y);
    setB(d); setFait(null);
  }, [cle]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const f = () => setNb(entrees().length); f(); return abonner(f); }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const maj = (n: Partial<Brouillon>) => {
    setB(prev => {
      const v = { ...prev, ...n };
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => { try { localStorage.setItem(cle, JSON.stringify(v)); } catch {} }, 400);
      return v;
    });
  };
  const ctx = contextes.find(c => c.id === (b.ctx ?? defaut)) ?? contextes[0];
  const choisis = useMemo(() => b.sel.map(n => [n, verses.find(v => v.verse === n)?.text ?? ''] as [number, string]), [b.sel, verses]);
  const rempli = b.sel.length > 0 || b.q.some(x => x.trim()) || CHAMPS.some(k => (b[k] as string).trim()) || b.confesse;

  const valider = () => {
    const e: EntreeSuivi = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      t: Date.now(),
      parcours: { id: ctx.id, label: ctx.label },
      book, chapter, ref: `${bookName} ${chapter}`,
      versets: choisis,
      questions: b.q.map(x => x.trim()),
      etapes: { paraphraser: b.par.trim(), personnaliser: b.per.trim(), confesser: b.conf.trim(), confesse: b.confesse, examiner: b.exa.trim(), pratiquer: b.pra.trim() }
    };
    ajouter(e);
    try { localStorage.removeItem(cle); } catch {}
    setB({ ...VIDE, ctx: b.ctx });
    setFait(e);
    requestAnimationFrame(() => document.querySelector('.md-sheet')?.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const toggle = (n: number) => maj({ sel: b.sel.includes(n) ? b.sel.filter(x => x !== n) : [...b.sel, n].sort((x, y) => x - y) });

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="rsheet-back" onClick={onClose}>
      <div className="rsheet md-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label={`Méditer ${bookName} ${chapter}`}>
        <div className="rsheet-grip" />
        <div className="md-top">
          <div>
            <span className="kicker">Méditer</span>
            <h2 className="md-title">{bookName} {chapter}</h2>
          </div>
          <button className="vbar-x" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {fait ? (
          <div className="md-ok">
            <div className="md-ok-i">✓</div>
            <h3>Ajouté à ton carnet de suivi</h3>
            <p>{fait.ref}{fait.versets.length ? ` · v. ${etiquetteVersets(fait.versets)}` : ''} · {fait.parcours.label}</p>
            <div className="share-grid">
              <button className="btn primary" onClick={onCarnet}>Voir mon carnet ›</button>
              <button className="btn" onClick={onClose}>Fermer</button>
            </div>
          </div>
        ) : (
          <>
            <div className="md-ctx">
              <span className="md-ctx-l">Dans le cadre de</span>
              <div className="md-ctx-chips">
                {contextes.map(c => (
                  <button key={c.id} className={`ix-chip${c.id === ctx.id ? ' on' : ''}`} onClick={() => maj({ ctx: c.id })}>{c.label}</button>
                ))}
              </div>
            </div>

            {/* ── L'aide du chapitre ── */}
            <section className="md-card md-help">
              <div className="md-help-h">
                <span className="kicker">Comprendre ce chapitre</span>
                {aide?.dating && <span className="md-dating">{aide.dating}</span>}
              </div>
              {aide === undefined && <div className="skel" style={{ height: 54, borderRadius: 12 }} />}
              {aide === null && etat !== 'cle' && (
                <>
                  <p className="md-mute">L&rsquo;aide de ce chapitre n&rsquo;est pas encore écrite. Elle se prépare une seule fois, puis elle reste là pour tout le monde.</p>
                  <button className="btn sm primary" disabled={etat === 'prep'} onClick={preparer}>
                    {etat === 'prep' ? 'Préparation… (30 s environ)' : '✦ Préparer l’aide de ce chapitre'}
                  </button>
                  {etat === 'err' && <p className="md-err">{msg}</p>}
                </>
              )}
              {aide === null && etat === 'cle' && <NeedKey what="l’aide de ce chapitre" msg={msg || undefined} />}
              {aide && (
                <>
                  {aide.title && <h3 className="md-help-t">{aide.title}</h3>}
                  <p className="md-resume"><R t={aide.resume} /></p>
                  {aideOuverte && (
                    <>
                      {aide.blocs.length > 0 && (
                        <dl className="pe-dl md-blocs">{aide.blocs.map(([v, i]) => <div className="pe-row" key={v}><dt>v. {v}</dt><dd>{i}</dd></div>)}</dl>
                      )}
                      {aide.jesus.length > 0 && <ul className="pe-q md-jesus">{aide.jesus.map((x, i) => <li key={i}><R t={x} /></li>)}</ul>}
                      {aide.parler?.phrase && (
                        <p className="md-parler"><b>Pour en parler :</b> {aide.parler.phrase}{aide.parler.question ? <><br /><b>Question à poser :</b> {aide.parler.question}</> : null}</p>
                      )}
                    </>
                  )}
                  <button className="linkbtn md-more" onClick={() => setAideOuverte(o => !o)}>
                    {aideOuverte ? 'Réduire ‹' : 'Le découpage, où est Jésus, pour en parler ›'}
                  </button>
                  <p className="md-note">Les boutons « Aide » sous chaque question montrent une piste. Écris d&rsquo;abord ta réponse.</p>
                </>
              )}
            </section>

            <p className="md-esprit">D&rsquo;abord, demande à l&rsquo;Esprit d&rsquo;ouvrir ton intelligence.</p>

            {/* ── Les questions ── */}
            <section className="md-card">
              <div className="md-k">Se poser les questions</div>
              {MEDITER_QUESTIONS.map((q, i) => (
                <Champ key={q} n={i + 1} label={<b>{q}</b>} aide={aide?.questions[i]} value={b.q[i] ?? ''}
                       onChange={v => maj({ q: b.q.map((x, j) => j === i ? v : x) })} />
              ))}
            </section>

            {/* ── Les six étapes ── */}
            <section className="md-card">
              <div className="md-k">Puis, les six étapes</div>
              <div className="md-champ">
                <div className="md-l"><span className="md-n">1</span><span className="md-lt"><b>{MEDITER_ETAPES[0][0]}</b> {MEDITER_ETAPES[0][1]}</span></div>
                {aide?.etapes[0] && <div className="md-aide md-aide-soft">Piste : <R t={aide.etapes[0]} /></div>}
                <p className="md-mute">Touche un ou plusieurs numéros de verset.</p>
                <div className="md-vgrid">
                  {verses.map(v => (
                    <button key={v.verse} className={`md-v${b.sel.includes(v.verse) ? ' on' : ''}`} onClick={() => toggle(v.verse)}
                            aria-pressed={b.sel.includes(v.verse)} title={v.text.slice(0, 80)}>{v.verse}</button>
                  ))}
                </div>
                {choisis.length > 0 && (
                  <div className="md-quote">
                    {choisis.map(([n, txt]) => <p key={n}><sup>{n}</sup> {txt}</p>)}
                    <span>{bookName} {chapter}.{etiquetteVersets(choisis)}</span>
                  </div>
                )}
              </div>
              {MEDITER_ETAPES.slice(1).map(([titre, desc], i) => {
                const k = CHAMPS[i];
                return (
                  <div key={titre}>
                    <Champ n={i + 2} label={<><b>{titre}</b> {desc}</>} aide={aide?.etapes[i + 1]} value={b[k] as string}
                           ph={k === 'conf' ? 'Ce que je proclame…' : k === 'pra' ? 'Aujourd’hui, je…' : undefined}
                           onChange={v => maj({ [k]: v } as any)} />
                    {k === 'conf' && (
                      <label className="md-check">
                        <input type="checkbox" checked={b.confesse} onChange={e => maj({ confesse: e.target.checked })} />
                        <span>Je l&rsquo;ai proclamé à haute voix</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </section>

            <p className="md-priv">Brouillon gardé sur cet appareil jusqu&rsquo;à la validation. Le carnet est privé et synchronisé avec ton compte.</p>
            <div className="md-foot">
              <button className="btn primary md-valider" disabled={!rempli} onClick={valider}>Valider · ajouter au carnet</button>
              <button className="linkbtn" onClick={onCarnet}>Mon carnet{nb ? ` (${nb})` : ''} ›</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
