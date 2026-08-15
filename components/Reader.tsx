'use client';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Explain from './Explain';
import WordByWord from './WordByWord';
import Compare from './Compare';
import { themeOf, suggestTheme, matchThemeQuery } from '@/lib/highlight-themes';

type V = { verse: number; text: string };
const iso = (d: Date) => d.toISOString().slice(0, 10);
const STYLES = [
  ['progressif', 'Progressif, pour comprendre'],
  ['integral', 'Integral, pour tout lire'],
  ['libre', 'Libre, a votre main']
] as const;

// Traductions volontairement masquees de la liste (doublon avec la BDS).
const HIDDEN_TRAD = (t: any) => /segond\s*21|^s21$|^frs21$/i.test(`${t.code} ${t.name}`);

// Mini-explication affichee sous le choix de traduction, pour aider a choisir
// suivant l'objectif de lecture.
function describeTranslation(t: any): string {
  const s = `${t.code} ${t.name}`.toLowerCase();
  if (/semeur|bds/.test(s)) return 'Pour la lecture suivie : avancez vite et saisissez l’idée globale, sans effort.';
  if (/nouvelle bible segond|\bnbs\b/.test(s)) return 'Pour décortiquer un verset au mot près : au plus proche de la structure du texte grec ou hébreu d’origine.';
  if (/1910|\blsg\b/.test(s)) return 'Pour retrouver une référence classique ou un verset connu dans son phrasé traditionnel.';
  if (/darby/.test(s)) return 'Traduction littérale, très proche du texte original, pour l’étude mot à mot.';
  if (/parole de vie|\bpdv\b/.test(s)) return 'Français très simple et immédiat, idéal pour une première lecture ou pour partager.';
  return '';
}

const LANG_LABELS: Record<string, string> = {
  fr: 'Français', en: 'English', he: 'עברית · Hébreu', el: 'Ελληνικά · Grec',
  la: 'Latina · Latin', de: 'Deutsch', ru: 'Русский', pl: 'Polski', ar: 'العربية', zh: '中文'
};
const LANG_ORDER = ['fr', 'en', 'he', 'el', 'la', 'de', 'ru', 'pl', 'ar', 'zh'];

export default function Reader({ books, translations, plans, steps, plan, notes, highlights, intros, user }: any) {
  // Bible du Semeur (BDS) par defaut, sauf si une position a ete memorisee.
  const [trad, setTrad] = useState('FRLSG');
  const [book, setBook] = useState(43);
  const [chapter, setChapter] = useState(1);
  const [recent, setRecent] = useState<Array<{ b: number; c: number }>>([]);
  const [verses, setVerses] = useState<V[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [editing, setEditing] = useState(false);
  const [explain, setExplain] = useState<{ kind: 'ch' | 'v'; verse?: number } | null>(null);
  const [wbw, setWbw] = useState<number | null>(null);
  const [cmp, setCmp] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [hl, setHl] = useState<Record<string, number>>(
    Object.fromEntries((highlights ?? []).map((h: any) => [`${h.book}-${h.chapter}-${h.verse}`, h.color])));
  const [myNotes, setMyNotes] = useState<any[]>(notes ?? []);
  const [results, setResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [backTo, setBackTo] = useState<string | null>(null); // retour (ex. parabole)
  const [searchedIn, setSearchedIn] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState(false);
  const [famous, setFamous] = useState<Record<number, string>>({});
  const [jesusV, setJesusV] = useState<Set<number>>(new Set()); // paroles de Jésus (red-letter)

  const bookName = books.find((b: any) => b.id === book)?.name ?? '';
  const chapters = books.find((b: any) => b.id === book)?.chapters ?? 1;
  const visibleTranslations = useMemo(() => translations.filter((t: any) => !HIDDEN_TRAD(t)), [translations]);
  const [lang, setLang] = useState('fr');
  const languages = useMemo(() => {
    const set = new Set(visibleTranslations.map((t: any) => t.language ?? 'fr'));
    return [...LANG_ORDER.filter(l => set.has(l)), ...[...set].filter((l: any) => !LANG_ORDER.includes(l))];
  }, [visibleTranslations]);
  const langTranslations = useMemo(
    () => visibleTranslations.filter((t: any) => (t.language ?? 'fr') === lang),
    [visibleTranslations, lang]);
  const changeLang = (l: string) => {
    setLang(l);
    const inLang = visibleTranslations.filter((t: any) => (t.language ?? 'fr') === l);
    if (!inLang.some((t: any) => t.code === trad) && inLang[0]) setTrad(inLang[0].code);
  };

  // Navigation chapitre : ou aller quand on arrive en bas.
  const prevBook = books.find((b: any) => b.id === book - 1);
  const nextBook = books.find((b: any) => b.id === book + 1);
  const prevLabel = chapter > 1 ? `${bookName} ${chapter - 1}`
    : prevBook ? `${prevBook.name} ${prevBook.chapters}` : null;
  const nextLabel = chapter < chapters ? `${bookName} ${chapter + 1}`
    : nextBook ? `${nextBook.name} 1` : null;
  const goPrev = () => {
    if (chapter > 1) setChapter(chapter - 1);
    else if (prevBook) { setBook(prevBook.id); setChapter(prevBook.chapters); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goNext = () => {
    if (chapter < chapters) setChapter(chapter + 1);
    else if (nextBook) { setBook(nextBook.id); setChapter(1); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const intro = useMemo(
    () => (intros ?? []).find((x: any) => x.book === book) ?? null,
    [intros, book]
  );

  const planId = plan?.plan_id ?? 'fondement';
  const P = plans.find((p: any) => p.id === planId) ?? plans[0];
  const mySteps = steps.filter((s: any) => s.plan_id === P?.id);
  const position = useMemo(() => {
    let n = plan?.current_day ?? 1;
    for (let i = 0; i < mySteps.length; i++) {
      const c = mySteps[i].chapters || 1;
      if (n <= c) return { step: mySteps[i], index: i, chapter: n };
      n -= c;
    }
    return { step: mySteps[mySteps.length - 1], index: mySteps.length - 1, chapter: 1 };
  }, [plan, mySteps]);

  const forgot = plan?.last_read_on && plan.last_read_on !== iso(new Date());

  const load = useCallback(async () => {
    setLoading(true); setSel(null);
    const t = translations.find((x: any) => x.code === trad);
    if (t?.source === 'apibible' || t?.source === 'bolls') {
      // Traduction sous licence lue a distance, jamais copiee dans notre base.
      const r = await fetch(`/api/bible/chapter?trans=${trad}&book=${book}&chapter=${chapter}`);
      const j = await r.json();
      setVerses(((j.verses ?? []) as Array<[number, string]>).map(v => ({ verse: v[0], text: v[1] })));
      setLoading(false);
      return;
    }
    const { data } = await supabase.from('verses').select('verse, text')
      .eq('translation', trad).eq('book', book).eq('chapter', chapter).order('verse');
    setVerses((data ?? []) as V[]); setLoading(false);
  }, [trad, book, chapter, translations]);

  useEffect(() => { load(); }, [load]);

  // Versets celebres du chapitre courant : une petite etoile dans la marge.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from('famous_verses')
        .select('verse_start, verse_end, title').eq('book', book).eq('chapter', chapter);
      const map: Record<number, string> = {};
      for (const f of (data ?? []) as any[]) {
        for (let n = f.verse_start; n <= f.verse_end; n++) map[n] = f.title;
      }
      if (alive) setFamous(map);
    })();
    return () => { alive = false; };
  }, [book, chapter]);

  // Paroles de Jésus du chapitre courant : surlignage dans la couleur du thème.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from('jesus_verses')
        .select('verse').eq('book', book).eq('chapter', chapter);
      if (alive) setJesusV(new Set((data ?? []).map((r: any) => r.verse)));
    })();
    return () => { alive = false; };
  }, [book, chapter]);

  // Reprise a l'endroit ou on s'etait arrete, et lien direct ?ref=Jean 15
  useEffect(() => {
    try {
      const qs = new URLSearchParams(location.search);
      const f = qs.get('from');
      if (f && f.startsWith('/')) setBackTo(f); // retour interne uniquement (securite)
      const p = qs.get('ref');
      if (p) {
        const m = p.match(/^(.+?)\s+(\d+)/);
        if (m) {
          const norm = m[1].trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
          const b = books.find((x: any) =>
            x.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').startsWith(norm));
          if (b) { setBook(b.id); setChapter(Math.min(+m[2], b.chapters)); return; }
        }
      }
      const saved = JSON.parse(localStorage.getItem('pq-pos') ?? 'null');
      const bds = translations.find((t: any) => !HIDDEN_TRAD(t) && /semeur|\bbds\b/i.test(`${t.code} ${t.name}`));
      if (saved?.b) {
        setBook(saved.b); setChapter(saved.c ?? 1);
        if (saved.t && !HIDDEN_TRAD({ code: saved.t, name: '' })) setTrad(saved.t);
        else if (bds) setTrad(bds.code);
      } else if (bds) {
        setTrad(bds.code);
      }
      setRecent(JSON.parse(localStorage.getItem('pq-recent') ?? '[]'));
    } catch {}
  }, [books, translations]);

  // Memorisation de la position et de l'historique de lecture
  useEffect(() => {
    try {
      localStorage.setItem('pq-pos', JSON.stringify({ b: book, c: chapter, t: trad }));
      localStorage.setItem('pq-pos-ref', `${bookName} ${chapter}`);
      const prev: Array<{ b: number; c: number }> =
        JSON.parse(localStorage.getItem('pq-recent') ?? '[]');
      const next = [{ b: book, c: chapter },
        ...prev.filter(x => !(x.b === book && x.c === chapter))].slice(0, 8);
      localStorage.setItem('pq-recent', JSON.stringify(next));
      setRecent(next);
    } catch {}
  }, [book, chapter, trad]);

  const key = (v: number) => `${book}-${chapter}-${v}`;
  const noteFor = (v: number) => myNotes.find(n => n.book === book && n.chapter === chapter && n.verse === v);

  const setColor = async (v: number, color: number) => {
    const k = key(v);
    const next = { ...hl }; color ? next[k] = color : delete next[k];
    setHl(next); // on garde le volet ouvert pour voir le thème appliqué
    if (!user) return;
    if (color) await supabase.from('highlights').upsert({ user_id: user.id, book, chapter, verse: v, color });
    else await supabase.from('highlights').delete().eq('book', book).eq('chapter', chapter).eq('verse', v);
  };

  const saveNote = async (v: number) => {
    if (!user) return alert('Connectez-vous pour écrire dans votre carnet.');
    const reference = `${bookName} ${chapter}.${v}`;
    const verse_text = verses.find(x => x.verse === v)?.text ?? '';
    const existing = noteFor(v);
    if (!noteText.trim()) {
      if (existing) { await supabase.from('notes').delete().eq('id', existing.id); setMyNotes(n => n.filter(x => x.id !== existing.id)); }
    } else if (existing) {
      await supabase.from('notes').update({ body: noteText, updated_at: new Date().toISOString() }).eq('id', existing.id);
      setMyNotes(n => n.map(x => x.id === existing.id ? { ...x, body: noteText } : x));
    } else {
      const { data } = await supabase.from('notes')
        .insert({ user_id: user.id, book, chapter, verse: v, reference, verse_text, body: noteText })
        .select().single();
      if (data) setMyNotes(n => [data, ...n]);
    }
    setEditing(false); setSel(null); setNoteText('');
  };

  const markRead = async () => {
    if (!user) return alert('Connectez-vous pour suivre votre parcours.');
    await supabase.rpc('mark_read', { p_user: user.id });
    location.reload();
  };

  const go = (ref: string) => {
    const m = ref.match(/^(.+?)\s+(\d+)/);
    if (!m) return;
    const norm = m[1].trim().toLowerCase();
    const b = books.find((x: any) => x.name.toLowerCase().startsWith(norm));
    if (b) { setBook(b.id); setChapter(Math.min(+m[2], b.chapters)); setExplain(null); setWbw(null); setCmp(null); }
  };

  // Recherche : une reference (nom + chiffre) ouvre le passage ;
  // un simple mot lance une concordance sur toute la traduction.
  const searchTheme = async (color: number) => {
    setThemeMode(true); setSearching(true); setResults([]);
    setSearchedIn(themeOf(color)?.label ?? null);
    const { data: hls } = await supabase.from('highlights')
      .select('book, chapter, verse').eq('color', color)
      .order('book').order('chapter').order('verse');
    const rows = hls ?? [];
    if (rows.length === 0) { setResults([]); setSearching(false); return; }
    const or = rows.slice(0, 400)
      .map((h: any) => `and(book.eq.${h.book},chapter.eq.${h.chapter},verse.eq.${h.verse})`).join(',');
    const { data: vs } = await supabase.from('verses')
      .select('book, chapter, verse, text').eq('translation', 'FRLSG').or(or);
    const tmap = new Map((vs ?? []).map((v: any) => [`${v.book}-${v.chapter}-${v.verse}`, v.text]));
    setResults(rows.map((h: any) => ({
      book: h.book, chapter: h.chapter, verse: h.verse,
      text: tmap.get(`${h.book}-${h.chapter}-${h.verse}`) ?? ''
    })));
    setSearching(false);
  };

  const searchFamous = async () => {
    setThemeMode(true); setSearching(true); setResults([]); setSearchedIn('★ versets connus');
    const { data: fam } = await supabase.from('famous_verses')
      .select('book, chapter, verse_start, title').order('book').order('chapter').limit(400);
    const rows = fam ?? [];
    if (rows.length === 0) { setResults([]); setSearching(false); return; }
    const or = rows.slice(0, 400)
      .map((h: any) => `and(book.eq.${h.book},chapter.eq.${h.chapter},verse.eq.${h.verse_start})`).join(',');
    const { data: vs } = await supabase.from('verses')
      .select('book, chapter, verse, text').eq('translation', 'FRLSG').or(or);
    const tmap = new Map((vs ?? []).map((v: any) => [`${v.book}-${v.chapter}-${v.verse}`, v.text]));
    setResults(rows.map((h: any) => ({
      book: h.book, chapter: h.chapter, verse: h.verse_start,
      text: tmap.get(`${h.book}-${h.chapter}-${h.verse_start}`) ?? h.title
    })));
    setSearching(false);
  };

  const runSearch = async () => {
    const q = search.trim();
    if (!q) { setResults(null); return; }
    const themeColor = matchThemeQuery(q);
    if (themeColor) { searchTheme(themeColor); return; }
    setThemeMode(false);
    if (/\S\s+\d/.test(q)) { go(q); setResults(null); return; }
    setSearching(true); setResults([]);
    // Les traductions sous licence sont lues a distance, verset par verset :
    // la concordance porte donc sur le texte local (Segond 1910).
    const t = translations.find((x: any) => x.code === trad);
    const searchIn = (t?.source === 'apibible' || t?.source === 'bolls') ? 'FRLSG' : trad;
    setSearchedIn(searchIn === trad ? null : 'Segond 1910');
    const { data } = await supabase.from('verses')
      .select('book, chapter, verse, text')
      .eq('translation', searchIn).ilike('text', `%${q}%`)
      .order('book').order('chapter').order('verse').limit(400);
    setResults(data ?? []); setSearching(false);
  };

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Lire la Bible</div>
        <h1>Un chapitre<br />par jour</h1>
        <p className="lede">Un parcours qui commencé la ou il faut commencer, et un carnet qui garde tout ce que vous notez.</p>
      </header>

      {P && position.step && (
        <div className="card">
          <div className="today-read tr-flex">
            <div className="tr-main">
              <span className="kicker">Votre lecture du jour</span>
              <div className="big-ref">{position.step.label} {position.chapter}</div>
              <p style={{ color: 'var(--ink-2)', fontSize: 15.5 }}>
                Jour {plan?.current_day ?? 1}{P.days ? ` sur ${P.days}` : ''} · Étape {position.index + 1} sur {mySteps.length}, {position.step.title}
                {plan?.streak > 1 ? ` · ${plan.streak} jours d'affilee` : ''}
              </p>
              {P.days ? (
                <div className="progress-wrap">
                  <div className="bar"><i style={{ width: `${Math.min(100, Math.round((plan?.current_day ?? 1) / P.days * 100))}%` }} /></div>
                  <span className="pct">{Math.min(100, Math.round((plan?.current_day ?? 1) / P.days * 100))} %</span>
                </div>
              ) : null}
              <div className="share-grid" style={{ marginTop: 20 }}>
                <button className="btn primary" onClick={() => {
                  setBook(position.step.book); setChapter(position.chapter);
                  setTimeout(() => document.getElementById('lecteur')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
                }}>
                  Ouvrir la lecture
                </button>
                <button className="btn" onClick={markRead}>J&rsquo;ai lu, chapitre suivant</button>
              </div>
            </div>

            {(position.step.key_passages as string[])?.length > 0 && (
              <div className="tr-side">
                <span className="tr-side-t">Accès direct aux lectures</span>
                {(position.step.key_passages as string[]).map((ref) => (
                  <button key={ref} className="tr-jump" onClick={() => {
                    go(ref);
                    setTimeout(() => document.getElementById('lecteur')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
                  }}>
                    <span>{ref}</span>
                    <span className="tr-jump-go">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <details className="card pad volet">
        <summary><b>Choisir un parcours de lecture</b><span className="muted"> · {plans.length} disponibles</span></summary>
        <div style={{ marginTop: 14 }}>
        <p style={{ color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.6, marginBottom: 4 }}>
          Un <b>parcours</b> vous dit <b>quoi lire chaque jour</b> : il découpe la Bible en étapes et
          avance tout seul. Choisissez-en un ci-dessous ; ensuite, la carte «&nbsp;Votre lecture du jour&nbsp;»
          en haut vous indique le passage exact du jour et le bouton «&nbsp;Ouvrir la lecture&nbsp;» vous
          y emmène. Quand vous avez lu, touchez «&nbsp;J&rsquo;ai lu&nbsp;» pour passer au suivant.
        </p>
        {STYLES.map(([sid, label]) => (
          <div key={sid}>
            <div className="grp" style={{ padding: '14px 0 4px' }}>{label}</div>
            <div className="chips" style={{ margin: 0 }}>
              {plans.filter((p: any) => p.style === sid).map((p: any) => (
                <button key={p.id} className="chip" aria-selected={p.id === P?.id}
                        onClick={async () => {
                          if (!user) return alert('Connectez-vous pour changer de parcours.');
                          await supabase.from('user_plan').update({ plan_id: p.id, current_day: 1 }).eq('user_id', user.id);
                          location.reload();
                        }}>
                  {p.name}{p.days ? ` · ${p.days} j` : ''}
                </button>
              ))}
            </div>
          </div>
        ))}
        {P && (
          <>
            <h3 style={{ marginTop: 26 }}>{P.name}</h3>
            <p style={{ color: 'var(--ink-3)', fontSize: 14.5, marginTop: 3 }}>
              {P.subtitle}{P.days ? ` · ${P.days} jours` : ''}
            </p>
            <div className="mini" style={{ marginTop: 16 }}><strong>Pour qui</strong><span>{P.audience}</span></div>
            <p style={{ marginTop: 16 }}>{P.rationale}</p>
            {mySteps.map((e: any, i: number) => (
              <div className={`step${i < position.index ? ' done' : ''}`} key={e.position}>
                <span className="step-n">{i < position.index ? '✓' : i + 1}</span>
                <div>
                  <h4>{e.label}{e.chapters ? ` · ${e.chapters} chapitres` : ''}</h4>
                  <div className="sm">{e.title}</div>
                  <p>{e.description}</p>
                  {(e.key_passages as string[])?.length > 0 && (
                    <div className="clés">{(e.key_passages as string[]).map(c => <span key={c}>{c}</span>)}</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        </div>
      </details>

      {backTo && (
        <a href={backTo} className="back-parable">‹ Revenir à la parabole</a>
      )}
      <h2 className="sect" id="lecteur" style={{ scrollMarginTop: 70 }}>Le lecteur</h2>
      <p className="sub">Touchez le titre du chapitre pour son introduction, un verset pour le surligner ou l&rsquo;annoter.</p>

      <div className="card">
        <div style={{ padding: '24px 30px 26px' }}>
          <input className="field" type="search" value={search}
                 onChange={e => setSearch(e.target.value)}
                 onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
                 placeholder="Référence (Jean 3), un mot (grâce…), ou un thème / une couleur (foi, bleu…)" />

          <div className="filter-row">
            <span className="filter-label">Aller à :</span>
            {[1, 2, 3, 4, 5, 6, 7].map(c => (
              <button key={c} className={`swatch s${c}`} title={themeOf(c)?.label}
                      onClick={() => { setSearch(themeOf(c)?.label ?? ''); searchTheme(c); }} />
            ))}
            <button className="filter-star" title="Versets connus (★)"
                    onClick={() => { setSearch('★ versets connus'); searchFamous(); }}>★</button>
          </div>

          {results !== null && (
            <button className="btn sm" style={{ marginTop: 10 }}
                    onClick={() => document.getElementById('resultats')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              Voir les résultats ↓
            </button>
          )}

          {recent.length > 1 && (
            <div className="chips" style={{ marginTop: 10 }}>
              <span className="muted" style={{ fontSize: 12, alignSelf: 'center', marginRight: 4 }}>Reprendre :</span>
              {recent.slice(1, 6).map((r, i) => (
                <span key={i} className="chip" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <span onClick={() => { setBook(r.b); setChapter(r.c); }}>
                    {books.find((b: any) => b.id === r.b)?.name} {r.c}
                  </span>
                  <span aria-label="Retirer" style={{ opacity: .55, fontSize: 13, lineHeight: 1 }}
                        onClick={e => {
                          e.stopPropagation();
                          const next = recent.filter(x => !(x.b === r.b && x.c === r.c));
                          setRecent(next);
                          try { localStorage.setItem('pq-recent', JSON.stringify(next)); } catch {}
                        }}>×</span>
                </span>
              ))}
            </div>
          )}
          {languages.length > 1 && (
            <select className="field" value={lang} onChange={e => changeLang(e.target.value)}
                    style={{ marginBottom: 10 }} aria-label="Langue">
              {languages.map((l: any) => <option key={l} value={l}>{LANG_LABELS[l] ?? l}</option>)}
            </select>
          )}
          <div className="reader-bar">
            <select className="field" value={trad} onChange={e => setTrad(e.target.value)}>
              {langTranslations.map((t: any) => <option key={t.code} value={t.code}>{t.name}</option>)}
            </select>
            <select className="field" value={book} onChange={e => { setBook(+e.target.value); setChapter(1); }}>
              {books.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="field" value={chapter} onChange={e => setChapter(+e.target.value)}>
              {Array.from({ length: chapters }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
            </select>
          </div>
          {describeTranslation(translations.find((t: any) => t.code === trad) ?? {}) && (
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 10 }}>
              {describeTranslation(translations.find((t: any) => t.code === trad) ?? {})}
            </p>
          )}
          <p style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 4 }}>
            {translations.find((t: any) => t.code === trad)?.notice}
          </p>
        </div>

        <div className="chap-nav">
          <button className="nav-day" onClick={() => chapter > 1 ? setChapter(chapter - 1) : book > 1 && (setBook(book - 1), setChapter(1))} aria-label="Precedent">‹</button>
          <span className="chap-title">
            {bookName} {chapter}
          </span>
          <button className="nav-day" onClick={() => chapter < chapters ? setChapter(chapter + 1) : book < 66 && (setBook(book + 1), setChapter(1))} aria-label="Suivant">›</button>
        </div>

        {intro && (
          <details className="bookintro">
            <summary>
              <span className="bi-sec">{intro.section}</span>
              <span className="bi-title">{intro.name} — {intro.title}</span>
              <span className="bi-hint">Où sommes-nous&nbsp;?</span>
            </summary>
            <div className="bi-body">
              <p className="bi-situ">{intro.situ}</p>
              <div className="bi-grid">
                <div><span className="kicker">C&rsquo;est qui</span><p>{intro.who}</p></div>
                <div><span className="kicker">Pourquoi ce livre</span><p>{intro.why}</p></div>
              </div>
              <div className="bi-christ">
                <span className="kicker">Le fil vers Jésus</span>
                <p>{intro.christ}</p>
              </div>
              {intro.key_verse && (
                <button className="btn sm" onClick={() => go(intro.key_verse)}>
                  Aller à {intro.key_verse} ›
                </button>
              )}
            </div>
          </details>
        )}

        <div className="vlist">
          {loading ? <p className="empty">Chargement…</p> :
           verses.length === 0 ? <p className="empty">Ce chapitre n&rsquo;est pas encore importe dans cette traduction.</p> :
           verses.map(v => {
             const c = hl[key(v.verse)];
             const showExplain = explain?.kind === 'v' && explain.verse === v.verse;
             return (
               <Fragment key={v.verse}>
                 <span className={`vs${c ? ` h${c}` : ''}${sel === v.verse ? ' sel' : ''}${famous[v.verse] ? ' famous' : ''}${jesusV.has(v.verse) ? ' jesus' : ''}`}
                       onClick={() => { setSel(sel === v.verse ? null : v.verse); setEditing(false); setNoteText(noteFor(v.verse)?.body ?? ''); }}>
                   {famous[v.verse] && <span className="vstar" title={`Verset connu · ${famous[v.verse]}`}>★</span>}
                   <span className="vn">{v.verse}</span>{v.text}
                   {noteFor(v.verse) && <span className="noteflag">note</span>}
                 </span>
                 {sel === v.verse && (
                   <div className="vbar-inline">
                     <div className="vbar-head">
                       <span className="vref">{bookName} {chapter}.{v.verse}</span>
                       <button className="vbar-x" onClick={() => { setSel(null); setEditing(false); }} aria-label="Fermer">✕</button>
                     </div>
                     {(() => {
                       const sug = suggestTheme(v.text);
                       return sug && hl[key(v.verse)] !== sug.color ? (
                         <button className="btn sm suggest" onClick={() => setColor(v.verse, sug.color)}>
                           ✨ Classer en « {sug.label} »
                         </button>
                       ) : null;
                     })()}
                     <div className="vbar-row">
                       {[1, 2, 3, 4, 5, 6, 7].map(c => <span key={c} className={`swatch s${c}`} title={themeOf(c)?.label} onClick={() => setColor(v.verse, c)} />)}
                       <span className="swatch s0" title="Retirer le surlignage" onClick={() => setColor(v.verse, 0)} />
                       <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => setEditing(true)}>
                         {noteFor(v.verse) ? 'Modifier la note' : 'Ajouter une note'}
                       </button>
                       <button className="btn sm" onClick={() => setExplain({ kind: 'v', verse: v.verse })}>Expliquer</button>
                       <button className="btn sm" onClick={() => setWbw(wbw === v.verse ? null : v.verse)}>Mot à mot</button>
                       <button className="btn sm" onClick={() => setCmp(cmp === v.verse ? null : v.verse)}>Comparer</button>
                       <button className="btn sm" onClick={() =>
                         navigator.clipboard?.writeText(`« ${v.text} » ${bookName} ${chapter}.${v.verse}`)}>
                         Copier
                       </button>
                     </div>
                     {hl[key(v.verse)] ? (
                       <div className="vbar-theme">
                         <span className={`swatch s${hl[key(v.verse)]}`} />
                         Thème : <strong>{themeOf(hl[key(v.verse)])?.label}</strong>
                       </div>
                     ) : (
                       <div className="vbar-theme muted">Chaque couleur correspond à un thème — survole pour le voir.</div>
                     )}
                     {editing && (
                       <div>
                         <textarea className="field" style={{ marginTop: 12 }} autoFocus value={noteText}
                                   onChange={e => setNoteText(e.target.value)}
                                   placeholder="Ce que ce verset vous dit, une question, un lien avec votre vie…" />
                         <div className="share-grid" style={{ marginTop: 10 }}>
                           <button className="btn primary" onClick={() => saveNote(v.verse)}>Enregistrer dans mon carnet</button>
                         </div>
                       </div>
                     )}
                   </div>
                 )}
                 {showExplain && (
                   <Explain book={book} chapter={chapter} verse={v.verse} bookName={bookName}
                            text={v.text} inline onClose={() => setExplain(null)} onGoto={go} />
                 )}
                 {wbw === v.verse && (
                   <WordByWord book={book} chapter={chapter} verse={v.verse} onClose={() => setWbw(null)} />
                 )}
                 {cmp === v.verse && (
                   <Compare book={book} chapter={chapter} verse={v.verse}
                            refLabel={`${bookName} ${chapter}.${v.verse}`} onClose={() => setCmp(null)} />
                 )}
               </Fragment>
             );
           })}
        </div>

        {!loading && verses.length > 0 && (
          <div className="chap-foot">
            <button className="chap-move" disabled={!prevLabel} onClick={goPrev}>
              <span className="cm-dir">‹ Précédent</span>
              {prevLabel && <span className="cm-ref">{prevLabel}</span>}
            </button>
            <button className="chap-move next" disabled={!nextLabel} onClick={goNext}>
              <span className="cm-dir">Suivant ›</span>
              {nextLabel && <span className="cm-ref">{nextLabel}</span>}
            </button>
          </div>
        )}
      </div>

      {results !== null && (
        <>
          <h2 className="sect" id="resultats" style={{ scrollMarginTop: 70 }}>Recherche</h2>
          <p className="sub">
            {searching ? 'Recherche en cours…'
              : themeMode ? (results.length === 0
                  ? `Rien à afficher pour « ${searchedIn} ».`
                  : `${results.length} verset${results.length > 1 ? 's' : ''} — « ${searchedIn} ».`)
              : results.length === 0 ? `Aucun verset ne contient « ${search} ».`
              : `${results.length}${results.length === 400 ? '+ (400 premiers)' : ''} verset${results.length > 1 ? 's' : ''} contiennent « ${search} »${searchedIn ? `, recherche faite dans la ${searchedIn}` : ''}.`}
            {' '}<a style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => { setResults(null); setSearch(''); setThemeMode(false); }}>Effacer</a>
          </p>
          {!searching && results.length > 0 && (
            <div className="card pad">
              {results.map((r, i) => (
                <div className="entry" key={i} style={{ cursor: 'pointer' }}
                     onClick={() => { setBook(r.book); setChapter(r.chapter); setSel(r.verse); setResults(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <div className="eref">{books.find((b: any) => b.id === r.book)?.name} {r.chapter}.{r.verse}</div>
                  <div className="etext">{r.text}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <h2 className="sect">Mon carnet de bord</h2>
      <p className="sub">{myNotes.length} note{myNotes.length > 1 ? 's' : ''} et {Object.keys(hl).length} surlignage{Object.keys(hl).length > 1 ? 's' : ''}.</p>
      <div className="card pad">
        {myNotes.length === 0 && Object.keys(hl).length === 0 ? (
          <p className="empty">Rien pour l&rsquo;instant. Ouvrez un chapitre, touchez un verset, choisissez une couleur ou ecrivez une note. Tout se retrouve ici.</p>
        ) : myNotes.map(n => (
          <div className="entry" key={n.id}>
            <div className="eref">{n.reference}</div>
            <div className="etext">{n.verse_text}</div>
            <div className="enote">{n.body}</div>
            <button className="edel" onClick={async () => {
              await supabase.from('notes').delete().eq('id', n.id);
              setMyNotes(l => l.filter(x => x.id !== n.id));
            }}>Supprimer</button>
          </div>
        ))}
      </div>

      {!user && (
        <div className="banner">
          <span>☁︎</span>
          <div><b>Vos notes ne sont pas encore enregistrées.</b> Creez un compte pour les retrouver partout et ne rien perdre.</div>
        </div>
      )}

      {explain?.kind === 'ch' && (
        <Explain book={book} chapter={chapter} verse={undefined}
                 bookName={bookName} text=""
                 onClose={() => setExplain(null)} onGoto={go} />
      )}
    </main>
  );
}
