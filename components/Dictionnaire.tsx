'use client';
import { useEffect, useRef, useState } from 'react';
import { getChapterStudy, getStudyList, kindLabel } from '@/lib/study-client';
import { SrcDico, SrcFiche, IcoDico, titleKey, stems } from './SrcBadge';

/**
 * ÉTUDE = dictionnaire biblique Westphal (livre de référence, numérisation
 * Yves Petrakian via levangile.com) + fiches Pain de Vie (passages réunis par
 * thème). Chaque élément porte son logo : 📖 Dictionnaire, ✦ Fiche Pain de Vie.
 * Quand les deux existent pour un même mot, ils sont réunis sur une seule carte.
 */
type Item = { id: number; titre: string; m?: string };
type Art = { id: number; titre: string; html: string | null };
const LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

type Aside = { cites: Array<Item & { verses: number[] }>; mots: Array<Item & { verses: number[] }> };
type Fiche = { slug: string; title: string; kind: string; verses?: number[] };
/** Une carte : un article du dictionnaire, une fiche, ou les deux réunis. */
type Card = { key: string; titre: string; verses: number[]; dico?: number; fiche?: Fiche; cite?: boolean };
const vlist = (v: number[]) => v.length ? `v. ${v.slice(0, 5).join(', ')}${v.length > 5 ? '…' : ''}` : '';

/** Réunit articles et fiches du chapitre, sans doublons. */
function merge(aside: Aside, fiches: Fiche[]): Card[] {
  const dicoBy = new Map<string, Item & { verses: number[]; cite: boolean }>();
  for (const a of aside.cites) dicoBy.set(titleKey(a.titre), { ...a, cite: true });
  for (const a of aside.mots) if (!dicoBy.has(titleKey(a.titre))) dicoBy.set(titleKey(a.titre), { ...a, cite: false });
  const used = new Set<number>(), covered = new Set<string>(), out: Card[] = [];
  const cover = (t: string) => stems(t).forEach(w => covered.add(w));
  for (const f of fiches) {
    const d = dicoBy.get(titleKey(f.title));
    // Thèmes presque identiques (« Bergers », « Troupeau » après « Bergers et troupeaux ») : on n'en garde qu'un.
    if (!d && f.kind === 'theme') {
      const st = stems(f.title);
      if (st.length && st.every(w => covered.has(w))) continue;
    }
    if (d) used.add(d.id);
    cover(f.title);
    out.push({ key: `f-${f.slug}`, titre: f.title, fiche: f, dico: d?.id, cite: d?.cite,
      verses: [...new Set([...(f.verses ?? []), ...(d?.verses ?? [])])].sort((x, y) => x - y) });
  }
  // Les cartes « dictionnaire + fiche » en tête, puis les fiches, puis les articles qui citent le chapitre, puis les mots.
  const both = out.filter(c => c.dico), solo = out.filter(c => !c.dico);
  const cites = aside.cites.filter(a => !used.has(a.id)).map(a => ({ key: `d-${a.id}`, titre: a.titre, dico: a.id, cite: true, verses: a.verses }));
  const mots = aside.mots.filter(a => !used.has(a.id) && !cites.some(c => c.dico === a.id))
    .map(a => ({ key: `d-${a.id}`, titre: a.titre, dico: a.id, verses: a.verses }));
  return [...both, ...solo.slice(0, 6), ...cites, ...solo.slice(6), ...mots];
}

export default function Dictionnaire({ onRef, bare, initialId, chapter, onFiche }: {
  onRef: (ref: string) => void; bare?: boolean; initialId?: number | null;
  chapter?: { b: number; c: number; name: string } | null;
  /** Ouvre une fiche Pain de Vie (si absent, les fiches ne sont pas montrées). */
  onFiche?: (slug: string) => void;
}) {
  const [aside, setAside] = useState<Aside | null>(null);
  const [chapFiches, setChapFiches] = useState<Fiche[] | null>(null);
  const [allMots, setAllMots] = useState(false);
  // Toutes les fiches prêtes, par titre (pour relier un article à sa fiche, et pour la recherche).
  const [ficheIdx, setFicheIdx] = useState<Fiche[]>([]);
  useEffect(() => {
    if (!onFiche) return;
    getStudyList().then(l => setFicheIdx(l.plan.filter(e => l.ready[e.slug] !== undefined)));
  }, [!!onFiche]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!chapter?.b || !chapter.name) return;
    let alive = true; setAside(null); setAllMots(false); setChapFiches(onFiche ? null : []);
    fetch(`/api/aside/dico?b=${chapter.b}&c=${chapter.c}&name=${encodeURIComponent(chapter.name)}`)
      .then(r => r.ok ? r.json() : null).then(j => { if (alive) setAside(j ?? { cites: [], mots: [] }); }).catch(() => alive && setAside({ cites: [], mots: [] }));
    if (onFiche) getChapterStudy(chapter.b, chapter.c).then(l => { if (alive) setChapFiches(l as Fiche[]); });
    return () => { alive = false; };
  }, [chapter?.b, chapter?.c, chapter?.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const cards = aside && chapFiches ? merge(aside, chapFiches) : null;
  const ficheFor = (titre: string) => { const k = titleKey(titre); return ficheIdx.find(f => titleKey(f.title) === k) ?? null; };
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
  const [ficheHits, setFicheHits] = useState<Fiche[]>([]);
  const search = async (k = q) => {
    if (k.trim().length < 2) return;
    setLettre(null); setArt(null);
    const n = titleKey(k);
    setFicheHits(n ? ficheIdx.filter(f => titleKey(f.title).includes(n)).slice(0, 12) : []);
    const j = await load(`/api/dict?q=${encodeURIComponent(k.trim())}`);
    setItems(j?.items ?? []);
  };
  const byLetter = async (L: string) => {
    setLettre(L); setArt(null); setQ(''); setFicheHits([]);
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
      {!bare && <span className="kicker">{onFiche ? 'Étude · dictionnaire et fiches' : 'Dictionnaire biblique'}</span>}
      {!art && (
        <>
          {chapter && !items && !busy && (
            <div className="dico-aside">
              {onFiche && (
                <div className="src-legend">
                  <span><SrcDico /> le livre de référence : il explique le mot (histoire, coutumes, sens)</span>
                  <span><SrcFiche /> nos fiches : tous les passages de la Bible sur ce thème</span>
                </div>
              )}
              {cards === null ? <p className="fine">Recherche de ce qui éclaire {chapter.name} {chapter.c}…</p>
                : !cards.length ? <p className="fine">Rien de lié à {chapter.name} {chapter.c} pour l&rsquo;instant.</p>
                : (
                  <>
                    <div className="rbubble-k">Pour {chapter.name} {chapter.c}</div>
                    <div className="cstudy-list">
                      {(allMots ? cards : cards.slice(0, 16)).map(c => (
                        <button key={c.key} className={`cstudy-it${c.fiche ? ' has-fiche' : ''}${c.dico ? ' has-dico' : ''}`}
                                onClick={() => c.dico ? open(`/api/dict?id=${c.dico}`, false) : onFiche?.(c.fiche!.slug)}>
                          <span className="src-row">
                            {c.dico && <SrcDico />}{c.fiche && <SrcFiche />}
                            {c.fiche && c.fiche.kind !== 'theme' && <span className="src-kind">{kindLabel(c.fiche.kind)}</span>}
                          </span>
                          <span className="cstudy-t">{c.titre}</span>
                          {c.verses.length > 0 && <span className="cstudy-v">{vlist(c.verses)}</span>}
                        </button>
                      ))}
                    </div>
                    {cards.length > 16 && !allMots && (
                      <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setAllMots(true)}>Tout voir ({cards.length})</button>
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
          {!busy && items && onFiche && ficheHits.length > 0 && (
            <div className="dico-list">
              {ficheHits.map(f => (
                <button key={f.slug} className="fh" onClick={() => onFiche(f.slug)}><b className="src-star">✦</b> {f.title}</button>
              ))}
            </div>
          )}
          {!busy && items && (items.length === 0 && !ficheHits.length
            ? <p className="fine">Aucun article trouvé.</p>
            : <div className="dico-list">
                {items.map(it => (
                  <button key={it.id} className={it.m === 'x' ? 'x' : ''} onClick={() => open(`/api/dict?id=${it.id}`, false)}>{onFiche && <span className="src-ico"><IcoDico /></span>}{it.titre}</button>
                ))}
              </div>)}
        </>
      )}
      {art && (
        <div className="dico-art">
          <button className="pe-back" onClick={back}>‹ {hist.length ? hist[hist.length - 1].titre : 'Retour'}</button>
          <div className="src-row" style={{ marginTop: 6 }}><SrcDico long /></div>
          <h3>{art.titre}</h3>
          {onFiche && (() => { const f = ficheFor(art.titre); return f && (
            <button className="src-link" onClick={() => onFiche(f.slug)}>
              <SrcFiche long /><span>Tous les passages de la Bible sur « {f.title} »</span><i>›</i>
            </button>
          ); })()}
          <div className="dico-body" onClick={onClick} dangerouslySetInnerHTML={{ __html: art.html ?? '' }} />
          <p className="lexfr-src">Dictionnaire Westphal · numérisation Yves Petrakian · levangile.com</p>
        </div>
      )}
    </div>
  );
}
