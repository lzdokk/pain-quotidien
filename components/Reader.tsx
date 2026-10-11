'use client';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase/client';
import Explain from './Explain';
import WordByWord from './WordByWord';
import Compare from './Compare';
import VerseCompare from './VerseCompare';
import OfflineDownload from './OfflineDownload';
import { themeOf, suggestTheme, matchThemeQuery } from '@/lib/highlight-themes';
import { QUATRE_TEMPS, QUESTIONS, POUR_PRIER } from '@/lib/reading-guide';

type V = { verse: number; text: string };
const iso = (d: Date) => d.toISOString().slice(0, 10);
const STYLES = [
  ['progressif', 'Progressif, pour comprendre'],
  ['integral', 'Integral, pour tout lire'],
  ['libre', 'Libre, a votre main']
] as const;

// Plus aucune traduction n'est masquee : la S21 est desormais importee en local
// et pleinement disponible (lecteur ET comparateur).
const HIDDEN_TRAD = (_t: any) => false;

// Mini-explication affichee sous le choix de traduction, pour aider a choisir
// suivant l'objectif de lecture.
function describeTranslation(t: any): string {
  const s = `${t.code} ${t.name}`.toLowerCase();
  if (/semeur|bds/.test(s)) return 'Pour la lecture suivie : avancez vite et saisissez l’idée globale, sans effort.';
  if (/nouvelle bible segond|\bnbs\b/.test(s)) return 'Pour décortiquer un verset au mot près : au plus proche de la structure du texte grec ou hébreu d’origine.';
  if (/1910|\blsg\b/.test(s)) return 'Pour retrouver une référence classique ou un verset connu dans son phrasé traditionnel.';
  if (/darby/.test(s)) return 'Traduction littérale, très proche du texte original, pour l’étude mot à mot.';
  if (/martin/.test(s)) return 'Le français classique de 1744, une des plus anciennes Bibles protestantes, au phrasé solennel.';
  if (/ostervald/.test(s)) return 'Révision fidèle du XIXᵉ siècle, entre la rigueur de Martin et la clarté moderne.';
  if (/parole de vie|\bpdv\b/.test(s)) return 'Français très simple et immédiat, idéal pour une première lecture ou pour partager.';
  return '';
}

// Toutes les traductions sont desormais stockees en LOCAL (import XML) : plus
// aucune lecture a distance, aucune API. On garde la fonction (toujours false)
// pour neutraliser les anciens chemins d'API sans toucher au reste du code.
const REMOTE_SRC = (_t: any) => false;

const LANG_LABELS: Record<string, string> = {
  fr: 'Français', en: 'English', he: 'עברית · Hébreu', el: 'Ελληνικά · Grec',
  la: 'Latina · Latin', de: 'Deutsch', ru: 'Русский', pl: 'Polski', ar: 'العربية', zh: '中文'
};
const LANG_ORDER = ['fr', 'en', 'he', 'el', 'la', 'de', 'ru', 'pl', 'ar', 'zh'];

export default function Reader({ books, translations, plans, steps, plan, notes, highlights, intros, user }: any) {
  // Segond 1910 (FRLSG) par defaut partout, sauf si l'utilisateur a memorise un autre choix.
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
  const [compareWith, setCompareWith] = useState<string | null>(null); // 2e traduction (comparateur chapitre)
  const [multi, setMulti] = useState<Set<number>>(new Set()); // sélection multi-versets
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
  const [sheet, setSheet] = useState<null | 'book' | 'version' | 'verse'>(null); // feuilles (livre / version / aller au verset)
  const [sheetBook, setSheetBook] = useState<number | null>(null); // livre deplie dans la feuille
  // Onglets de la page : lecture du jour / parcours / Bible.
  type Tab = 'jour' | 'parcours' | 'bible' | 'recherche';
  const [tab, setTabState] = useState<Tab>('bible');
  const setTab = (t: Tab) => {
    setTabState(t);
    try { sessionStorage.setItem('pq-tab', t); } catch {}
  };
  // Recherche : derniere requete lancee, historique des mots cherches,
  // et verset a ouvrir quand on touche un resultat.
  const [doneQ, setDoneQ] = useState('');
  const [qHist, setQHist] = useState<string[]>([]);
  const [target, setTarget] = useState<number | null>(null);
  // Bulles flottantes : methode de lecture / recherche + historique.
  const [bubble, setBubble] = useState<null | 'method' | 'search' | 'versions'>(null);
  const [guideTab, setGuideTab] = useState<'court' | 'questions' | 'prier'>('court');
  // Emplacement dans la barre du haut (a cote de l'avatar) pour livre · version · v.
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById('nav-slot')); }, []);

  const bookName = books.find((b: any) => b.id === book)?.name ?? '';
  const chapters = books.find((b: any) => b.id === book)?.chapters ?? 1;
  const visibleTranslations = useMemo(() => translations.filter((t: any) => !HIDDEN_TRAD(t)), [translations]);
  const [lang, setLang] = useState('fr');
  const languages = useMemo(() => {
    const set = new Set(visibleTranslations.map((t: any) => t.language ?? 'fr'));
    return [...LANG_ORDER.filter(l => set.has(l)), ...[...set].filter((l: any) => !LANG_ORDER.includes(l))];
  }, [visibleTranslations]);
  const langTranslations = useMemo(() => {
    const list = visibleTranslations.filter((t: any) => (t.language ?? 'fr') === lang);
    // La Bible expliquée (BEX2004) en tête de liste (version + comparaison).
    return [...list].sort((a: any, b: any) =>
      a.code === 'BEX2004' ? -1 : b.code === 'BEX2004' ? 1 : 0);
  }, [visibleTranslations, lang]);
  // Langues ecrites de droite a gauche (hebreu, arabe).
  const isRtl = (code: string | null) =>
    /^(he|ar)$/.test(translations.find((t: any) => t.code === code)?.language ?? '');
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
    if (REMOTE_SRC(t)) {
      // Traduction lue a distance, jamais copiee dans notre base.
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
      // Traduction par defaut : Segond 21 PARTOUT (y compris ouverture depuis un
      // lien cursus/pain). On ne restaure un choix memorise que si l'utilisateur
      // a explicitement pris AUTRE chose que la Segond 1910 (l'ancien defaut).
      const preferred = translations.some((t: any) => t.code === 'S21') ? 'S21' : 'FRLSG';
      const p = qs.get('ref');
      if (p) {
        const m = p.match(/^(.+?)\s+(\d+)/);
        if (m) {
          const norm = m[1].trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
          const b = books.find((x: any) =>
            x.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').startsWith(norm));
          if (b) { setBook(b.id); setChapter(Math.min(+m[2], b.chapters)); setTrad(preferred); setTabState('bible'); return; }
        }
      }
      const saved = JSON.parse(localStorage.getItem('pq-pos') ?? 'null');
      const savedT = saved?.t && saved.t !== 'FRLSG' ? saved.t : preferred;
      if (saved?.b) {
        setBook(saved.b); setChapter(saved.c ?? 1);
        setTrad(savedT);
      } else {
        setTrad(preferred);
      }
      setRecent(JSON.parse(localStorage.getItem('pq-recent') ?? '[]'));
    } catch {}
  }, [books, translations]);

  // Recherche gardee pendant toute la session : en revenant sur /lire
  // (bouton retour, lien, autre page), on retrouve les memes resultats.
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('pq-search') ?? 'null');
      if (saved?.results) {
        setSearch(saved.q ?? ''); setDoneQ(saved.q ?? '');
        setResults(saved.results); setThemeMode(!!saved.themeMode); setSearchedIn(saved.searchedIn ?? null);
      }
      const hasRef = new URLSearchParams(location.search).get('ref');
      if (!hasRef && sessionStorage.getItem('pq-tab') === 'recherche') setTabState('recherche');
      setQHist(JSON.parse(localStorage.getItem('pq-search-hist') ?? '[]'));
    } catch {}
  }, []);
  useEffect(() => {
    if (searching) return;
    try {
      if (results === null) sessionStorage.removeItem('pq-search');
      else sessionStorage.setItem('pq-search', JSON.stringify({ q: doneQ, results, themeMode, searchedIn }));
    } catch {}
  }, [results, searching, themeMode, searchedIn, doneQ]);

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

  useEffect(() => {
    if (sheet !== 'book') return;
    const t = setTimeout(() => document.getElementById(`bk-${book}`)
      ?.scrollIntoView({ block: 'start' }), 40);
    return () => clearTimeout(t);
  }, [sheet]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (target === null || loading || tab !== 'bible') return;
    if (!verses.some(v => v.verse === target)) return;
    const v = target;
    const t = setTimeout(() => {
      setSel(v); setEditing(false); setNoteText(noteFor(v)?.body ?? '');
      document.getElementById(`v-${v}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTarget(null);
    }, 120);
    return () => clearTimeout(t);
  }, [target, loading, verses, tab]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (b) { setBook(b.id); setChapter(Math.min(+m[2], b.chapters)); setExplain(null); setWbw(null); setCmp(null); setTab('bible'); }
  };

  // ── Sélection multi-versets (partager / copier un ensemble) ──────────
  const toggleMulti = (v: number) =>
    setMulti(prev => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n; });
  const multiSorted = () => [...multi].sort((a, b) => a - b);
  const multiRefLabel = () => {
    const s = multiSorted(); if (!s.length) return '';
    const contiguous = s.every((n, i) => i === 0 || n === s[i - 1] + 1);
    return contiguous && s.length > 1 ? `${s[0]}-${s[s.length - 1]}` : s.join(', ');
  };
  const multiText = () => {
    const body = multiSorted()
      .map(n => `${n}. ${verses.find(x => x.verse === n)?.text ?? ''}`).join('\n');
    return `${body}\n— ${bookName} ${chapter}.${multiRefLabel()}`;
  };
  const shareMulti = async () => {
    const txt = multiText(); const nav: any = navigator;
    if (nav?.share) { try { await nav.share({ text: txt }); return; } catch { /* repli copie */ } }
    try { await nav?.clipboard?.writeText(txt); } catch {}
  };
  // Change de chapitre/livre : on referme les volets ouverts et la sélection.
  useEffect(() => { setMulti(new Set()); setSel(null); setWbw(null); setCmp(null); setExplain(null); }, [book, chapter]);

  // Recherche : une reference (nom + chiffre) ouvre le passage ;
  // un simple mot lance une concordance sur toute la traduction.
  const showResults = () => {
    setBubble(null); setTab('recherche');
    setTimeout(() => document.getElementById('resultats')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };
  const remember = (q: string) => {
    const k = q.trim(); if (!k) return;
    setQHist(prev => {
      const next = [k, ...prev.filter(x => x.toLowerCase() !== k.toLowerCase())].slice(0, 16);
      try { localStorage.setItem('pq-search-hist', JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const forget = (q: string) => setQHist(prev => {
    const next = prev.filter(x => x !== q);
    try { localStorage.setItem('pq-search-hist', JSON.stringify(next)); } catch {}
    return next;
  });
  const openResult = (r: any) => {
    setBook(r.book); setChapter(r.chapter); setTarget(r.verse); setTab('bible');
  };
  const clearSearch = () => { setResults(null); setSearch(''); setDoneQ(''); setThemeMode(false); };
  // Met en valeur le mot cherche dans le texte du verset.
  const mark = (text: string) => {
    const q = doneQ.trim();
    if (themeMode || q.length < 2) return text;
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp('(' + esc + ')', 'gi'));
    return parts.map((x, i) => i % 2 ? <mark key={i} className="srch-mark">{x}</mark> : x);
  };

  const searchTheme = async (color: number) => {
    showResults();
    setThemeMode(true); setSearching(true); setResults([]);
    setSearchedIn(themeOf(color)?.label ?? null); setDoneQ(themeOf(color)?.label ?? '');
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
    showResults();
    setThemeMode(true); setSearching(true); setResults([]); setSearchedIn('★ versets connus'); setDoneQ('★ versets connus');
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

  const runSearch = async (qIn?: string) => {
    const q = (qIn ?? search).trim();
    if (qIn !== undefined) setSearch(qIn);
    if (!q) { setResults(null); return; }
    remember(q);
    if (q.startsWith('★')) { searchFamous(); return; }
    const themeColor = matchThemeQuery(q);
    if (themeColor) { searchTheme(themeColor); return; }
    setThemeMode(false);
    if (/\S\s+\d/.test(q)) { go(q); setResults(null); setBubble(null); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    showResults();
    setSearching(true); setResults([]); setDoneQ(q);
    // Les traductions sous licence sont lues a distance, verset par verset :
    // la concordance porte donc sur le texte local (Segond 1910).
    const t = translations.find((x: any) => x.code === trad);
    const searchIn = REMOTE_SRC(t) ? 'FRLSG' : trad;
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
        <p className="lede">Un parcours qui commence là où il faut commencer, et un carnet qui garde tout ce que vous notez.</p>
      </header>

      <div className="page-tabs four" role="tablist">
        {([['bible', 'Bible'], ['recherche', 'Recherche'], ['jour', 'Lecture du jour'], ['parcours', 'Parcours']] as const).map(([k, l]) => (
          <button key={k} role="tab" className="page-tab" aria-selected={tab === k}
                  onClick={() => { setTab(k); setBubble(null); }}>{l}</button>
        ))}
      </div>

      {tab === 'jour' && (
        <>
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
                  setBook(position.step.book); setChapter(position.chapter); setTab('bible');
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

        </>
      )}

      {tab === 'parcours' && (
        <>
      <div className="card pad">
        <span className="kicker">Choisir un parcours de lecture · {plans.length} disponibles</span>
        <div>
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
      </div>

        </>
      )}

      {tab === 'recherche' && (
        <>
          <div className="card pad srch-card">
            <div className="srch-row">
              <input className="field" type="search" value={search}
                     onChange={e => setSearch(e.target.value)}
                     onKeyDown={e => { if (e.key === 'Enter') runSearch(); }}
                     placeholder="Un mot (grâce, gloire…) ou une référence (Jean 3)" />
              <button className="btn primary" onClick={() => runSearch()}>Chercher</button>
            </div>
            <div className="filter-row">
              <span className="filter-label">Mes couleurs :</span>
              {[1, 2, 3, 4, 5, 6, 7].map(c => (
                <button key={c} className={`swatch s${c}`} title={themeOf(c)?.label}
                        onClick={() => { const l = themeOf(c)?.label ?? ''; setSearch(l); remember(l); searchTheme(c); }} />
              ))}
              <button className="filter-star" title="Versets connus (★)"
                      onClick={() => runSearch('★ versets connus')}>★</button>
            </div>

            {qHist.length > 0 && (
              <>
                <div className="srch-k">Recherches récentes</div>
                <div className="chips srch-hist">
                  {qHist.map(h => (
                    <span key={h} className={`chip${h === doneQ ? ' on' : ''}`}>
                      <span onClick={() => runSearch(h)}>{h}</span>
                      <span className="srch-x" aria-label="Retirer" onClick={() => forget(h)}>×</span>
                    </span>
                  ))}
                </div>
              </>
            )}

            <a className="srch-index"
               href={`/etude${search.trim() && !search.startsWith('★') ? `?q=${encodeURIComponent(search.trim())}` : ''}`}>
              {search.trim() && !search.startsWith('★') ? `Voir « ${search.trim()} » dans l’Index d’étude ›` : 'Chercher un thème dans l’Index d’étude ›'}
            </a>
          </div>

          {results !== null && (
            <>
              <h2 className="sect" id="resultats" style={{ scrollMarginTop: 70 }}>Résultats</h2>
              <p className="sub">
                {searching ? 'Recherche en cours…'
                  : themeMode ? (results.length === 0
                      ? `Rien à afficher pour « ${searchedIn} ».`
                      : `${results.length} verset${results.length > 1 ? 's' : ''} — « ${searchedIn} ».`)
                  : results.length === 0 ? `Aucun verset ne contient « ${doneQ} ».`
                  : `${results.length}${results.length === 400 ? '+ (400 premiers)' : ''} verset${results.length > 1 ? 's' : ''} contiennent « ${doneQ} »${searchedIn ? `, recherche faite dans la ${searchedIn}` : ''}.`}
                {' '}<a style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={clearSearch}>Effacer</a>
              </p>
              {!searching && results.length > 0 && (
                <div className="card pad">
                  {results.map((r, i) => (
                    <div className="entry srch-res" key={i} onClick={() => openResult(r)}>
                      <div className="eref">{books.find((b: any) => b.id === r.book)?.name} {r.chapter}.{r.verse} <span className="srch-go">Ouvrir ›</span></div>
                      <div className="etext">{mark(r.text)}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {recent.length > 1 && (
            <>
              <h2 className="sect">Derniers chapitres lus</h2>
              <div className="chips srch-hist">
                {recent.slice(0, 8).map((r, i) => (
                  <span key={i} className="chip"
                        onClick={() => { setBook(r.b); setChapter(r.c); setTab('bible'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    {books.find((b: any) => b.id === r.b)?.name} {r.c}
                  </span>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === 'bible' && (
        <>
      {backTo && (
        <a href={backTo} className="back-parable">‹ Revenir à la parabole</a>
      )}
      {results !== null && results.length > 0 && !searching && (
        <button className="srch-back" onClick={() => { setTab('recherche'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          ‹ Résultats « {doneQ} » <span>{results.length}</span>
        </button>
      )}

      <div className="card" id="lecteur" style={{ scrollMarginTop: 70 }}>
        {compareWith && (
          <div className="cmp-strip">
            <span>Comparaison : <b>{trad}</b> et <b>{compareWith}</b></span>
            <button className="btn sm" onClick={() => setCompareWith(null)}>Fermer</button>
          </div>
        )}

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

        {compareWith && (
          <div style={{ padding: '4px 30px 26px' }}>
            <VerseCompare book={book} chapter={chapter} transA={trad} transB={compareWith}
              nameA={translations.find((t: any) => t.code === trad)?.name}
              nameB={translations.find((t: any) => t.code === compareWith)?.name}
              rtlA={isRtl(trad)} rtlB={isRtl(compareWith)} />
          </div>
        )}

        {!compareWith && (
        <div className={`vlist${isRtl(trad) ? ' he' : ''}`} dir={isRtl(trad) ? 'rtl' : undefined}>
          {loading ? <p className="empty">Chargement…</p> :
           verses.length === 0 ? <p className="empty">Ce chapitre n&rsquo;est pas encore importe dans cette traduction.</p> :
           verses.map(v => {
             const c = hl[key(v.verse)];
             const showExplain = explain?.kind === 'v' && explain.verse === v.verse;
             return (
               <Fragment key={v.verse}>
                 <span id={`v-${v.verse}`}
                       className={`vs${c ? ` h${c}` : ''}${sel === v.verse ? ' sel' : ''}${multi.has(v.verse) ? ' multi' : ''}${famous[v.verse] ? ' famous' : ''}${jesusV.has(v.verse) ? ' jesus' : ''}`}
                       onClick={() => { setSel(sel === v.verse ? null : v.verse); setEditing(false); setNoteText(noteFor(v.verse)?.body ?? ''); }}>
                   {famous[v.verse] && <span className="vstar" title={`Verset connu · ${famous[v.verse]}`}>★</span>}
                   <span className="vn">{v.verse}</span>{v.text}
                   {noteFor(v.verse) && <span className="noteflag">note</span>}
                 </span>
                 {showExplain && (
                   <Explain book={book} chapter={chapter} verse={v.verse} bookName={bookName}
                            text={v.text} inline onClose={() => setExplain(null)} onGoto={go} />
                 )}
                 {wbw === v.verse && (
                   <WordByWord book={book} chapter={chapter} verse={v.verse}
                               frText={v.text} onClose={() => setWbw(null)} />
                 )}
                 {cmp === v.verse && (
                   <Compare book={book} chapter={chapter} verse={v.verse}
                            refLabel={`${bookName} ${chapter}.${v.verse}`} onClose={() => setCmp(null)} />
                 )}
               </Fragment>
             );
           })}
        </div>
        )}

        {!loading && verses.length > 0 && !compareWith && (
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
        {translations.find((t: any) => t.code === trad)?.notice && (
          <p className="reader-notice">{translations.find((t: any) => t.code === trad)?.notice}</p>
        )}
      </div>

        </>
      )}

      {/* Barre d'actions du verset selectionne, dockée en bas de l'ecran. */}
      {sel !== null && !compareWith && (() => {
        const s = sel; if (s === null) return null;
        const sv = verses.find(x => x.verse === s);
        if (!sv) return null;
        const sug = suggestTheme(sv.text);
        return (
          <div className="vbar-inline">
            <div className="vbar-head">
              <span className="vref">{bookName} {chapter}.{s}</span>
              <button className="vbar-x" onClick={() => { setSel(null); setEditing(false); }} aria-label="Fermer">✕</button>
            </div>
            {sug && hl[key(s)] !== sug.color && (
              <button className="btn sm suggest" onClick={() => setColor(s, sug.color)}>✨ Classer en « {sug.label} »</button>
            )}
            <div className="vbar-row">
              {[1, 2, 3, 4, 5, 6, 7].map(c => <span key={c} className={`swatch s${c}`} title={themeOf(c)?.label} onClick={() => setColor(s, c)} />)}
              <span className="swatch s0" title="Retirer le surlignage" onClick={() => setColor(s, 0)} />
              <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => setEditing(true)}>
                {noteFor(s) ? 'Modifier la note' : 'Ajouter une note'}
              </button>
              <button className="btn sm" onClick={() => setExplain({ kind: 'v', verse: s })}>Expliquer</button>
              <button className="btn sm" onClick={() => setWbw(wbw === s ? null : s)}>Mot à mot</button>
              <button className="btn sm" onClick={() => setCmp(cmp === s ? null : s)}>Comparer</button>
              <button className="btn sm" onClick={() =>
                navigator.clipboard?.writeText(`« ${sv.text} » ${bookName} ${chapter}.${s}`)}>Copier</button>
              <button className="btn sm" onClick={() => toggleMulti(s)}>
                {multi.has(s) ? '− Retirer' : '+ Sélection'}
              </button>
            </div>
            {hl[key(s)] ? (
              <div className="vbar-theme">
                <span className={`swatch s${hl[key(s)]}`} /> Thème : <strong>{themeOf(hl[key(s)])?.label}</strong>
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
                  <button className="btn primary" onClick={() => saveNote(s)}>Enregistrer dans mon carnet</button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {multi.size > 0 && (
        <div className="multibar">
          <span className="multibar-ref">
            {bookName} {chapter}.{multiRefLabel()} · {multi.size} verset{multi.size > 1 ? 's' : ''}
          </span>
          <div className="multibar-actions">
            <button className="btn sm primary" onClick={shareMulti}>Partager</button>
            <button className="btn sm" onClick={() => navigator.clipboard?.writeText(multiText())}>Copier</button>
            <button className="btn sm" onClick={() => setMulti(new Set())}>Effacer</button>
          </div>
        </div>
      )}

      {explain?.kind === 'ch' && (
        <Explain book={book} chapter={chapter} verse={undefined}
                 bookName={bookName} text=""
                 onClose={() => setExplain(null)} onGoto={go} />
      )}

      {/* ── Feuilles : version, livre + chapitres, aller au verset ───────── */}
      {sheet && (
        <div className="rsheet-back" onClick={() => setSheet(null)}>
          <div className="rsheet" onClick={e => e.stopPropagation()}>
            <div className="rsheet-grip" />

            {sheet === 'version' && (
              <>
                <h3 className="rsheet-title">Version</h3>
                {languages.length > 1 && (
                  <div className="rsheet-langs">
                    {languages.map((l: any) => (
                      <button key={l} className={`chip${l === lang ? ' on' : ''}`}
                              onClick={() => changeLang(l)}>{LANG_LABELS[l] ?? l}</button>
                    ))}
                  </div>
                )}
                <div className="rsheet-list">
                  {langTranslations.map((t: any) => (
                    <button key={t.code} className={`rsheet-row${t.code === trad ? ' on' : ''}`}
                            onClick={() => { setTrad(t.code); setSheet(null); }}>
                      <span className="sr-code">{t.code}</span>
                      <span className="sr-main">
                        <b>{t.name}</b>
                        {t.notice && <span className="sr-sub">{t.notice}</span>}
                      </span>
                      {t.code === trad && <span className="sr-check">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}

            {sheet === 'book' && (
              <>
                <h3 className="rsheet-title">Livres</h3>
                <div className="rsheet-list">
                  {books.map((b: any) => (
                    <div key={b.id} id={`bk-${b.id}`}>
                      <button className={`rsheet-row${b.id === book ? ' on' : ''}`}
                              onClick={() => setSheetBook(sheetBook === b.id ? null : b.id)}>
                        <span className="sr-main"><b>{b.name}</b></span>
                        <span className="sr-chev">{sheetBook === b.id ? '▾' : '▸'}</span>
                      </button>
                      {sheetBook === b.id && (
                        <div className="chgrid">
                          {Array.from({ length: b.chapters }, (_, i) => (
                            <button key={i}
                                    className={`chcell${b.id === book && chapter === i + 1 ? ' on' : ''}`}
                                    onClick={() => {
                                      setBook(b.id); setChapter(i + 1); setSheet(null); setTab('bible');
                                      setTimeout(() => document.getElementById('lecteur')
                                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
                                    }}>{i + 1}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {sheet === 'verse' && (
              <>
                <h3 className="rsheet-title">Aller au verset</h3>
                <div className="chgrid vg">
                  {verses.map(v => (
                    <button key={v.verse} className="chcell"
                            onClick={() => {
                              setSel(v.verse); setSheet(null);
                              setTimeout(() => document.getElementById(`v-${v.verse}`)
                                ?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
                            }}>{v.verse}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Livre · version · verset, dans la barre du haut a cote de l'avatar. */}
      {slot && createPortal(
        <div className="rpill-nav">
          <button className="rp-seg rp-book" onClick={() => { setTab('bible'); setSheetBook(book); setSheet('book'); }}
                  aria-label="Choisir le livre et le chapitre">{bookName} {chapter}</button>
          <button className="rp-seg rp-v" onClick={() => { setTab('bible'); setSheet('verse'); }}
                  disabled={!verses.length} aria-label="Aller au verset">vers.</button>
          <button className="rp-seg rp-ver" onClick={() => { setTab('bible'); setSheet('version'); }}
                  aria-label="Choisir la version">{translations.find((t: any) => t.code === trad)?.code ?? trad}</button>
        </div>, slot)}

      {/* Bulles flottantes : comment lire / rechercher + historique. */}
      {tab === 'bible' && sel === null && multi.size === 0 && !sheet && (
        <div className="rfabs">
          <button className={`rfab${bubble === 'method' ? ' on' : ''}`} aria-label="Comment lire"
                  onClick={() => setBubble(bubble === 'method' ? null : 'method')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z" />
            </svg>
          </button>
          <button className={`rfab${bubble === 'versions' ? ' on' : ''}`} aria-label="Comparer et lire hors ligne"
                  onClick={() => setBubble(bubble === 'versions' ? null : 'versions')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5C6.5 5 8.5 5.3 10 6.5V19c-1.5-1.2-3.5-1.5-6-1V5.5zM20 5.5c-2.5-.5-4.5-.2-6 1V19c1.5-1.2 3.5-1.5 6-1V5.5z" />
            </svg>
          </button>
          <button className="rfab" aria-label="Rechercher et historique"
                  onClick={() => { setBubble(null); setTab('recherche'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" />
            </svg>
          </button>
        </div>
      )}

      {bubble && tab === 'bible' && (
        <div className="rbubble" role="dialog">
          <button className="rbubble-x" onClick={() => setBubble(null)} aria-label="Fermer">×</button>

          {bubble === 'method' && (
            <>
              <h3 className="rbubble-t">Comment lire</h3>
              <div className="rb-tabs">
                {([['court', '4 temps'], ['questions', 'Questions'], ['prier', 'Pour prier']] as const).map(([k, l]) => (
                  <button key={k} className={`cmp-chip${guideTab === k ? ' on' : ''}`} onClick={() => setGuideTab(k)}>{l}</button>
                ))}
              </div>
              {guideTab === 'court' && (
                <>
                  <p className="rbubble-sub">Le plus important n&rsquo;est pas de lire beaucoup, mais de lire chaque jour.</p>
                  <div className="rmethod">
                    {QUATRE_TEMPS.map(([t, q, d]) => (
                      <div className="rm-row" key={t}><b>{t}</b><span>{q}</span><i>{d}</i></div>
                    ))}
                  </div>
                </>
              )}
              {guideTab === 'questions' && (
                <>
                  <p className="rbubble-sub">Réponds au moins à une question.</p>
                  <ul className="rb-list">{QUESTIONS.map((q, i) => <li key={i}>{q}</li>)}</ul>
                </>
              )}
              {guideTab === 'prier' && (
                <div className="rmethod">
                  {POUR_PRIER.map(p => (
                    <div className="rm-row" key={p.t} style={{ gridTemplateColumns: '96px 1fr' }}><b>{p.t}</b><span>{p.q}</span></div>
                  ))}
                </div>
              )}
              <a href="/etude/comment-lire" className="btn sm" style={{ marginTop: 12 }}>
                Le guide complet ›
              </a>
            </>
          )}

          {bubble === 'versions' && (
            <>
              <h3 className="rbubble-t">Versions</h3>
              <div className="rbubble-k" style={{ marginTop: 0 }}>Comparer 2 versions</div>
              {compareWith ? (
                <>
                  <select className="field" style={{ marginTop: 8 }} value={compareWith}
                          onChange={e => setCompareWith(e.target.value)}>
                    {/* Toutes les versions, hebreu compris, pour comparer le texte d'origine */}
                    {visibleTranslations.filter((t: any) => t.code !== trad).map((t: any) =>
                      <option key={t.code} value={t.code}>
                        {t.name}{(t.language ?? 'fr') !== 'fr' ? ` · ${LANG_LABELS[t.language] ?? t.language}` : ''}
                      </option>)}
                  </select>
                  <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setCompareWith(null)}>
                    Fermer la comparaison
                  </button>
                </>
              ) : (
                <button className="btn sm" style={{ marginTop: 8 }} onClick={() => {
                  setCompareWith(langTranslations.find((t: any) => t.code !== trad)?.code ?? null);
                  setBubble(null);
                  setTimeout(() => document.getElementById('lecteur')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
                }}>Comparer avec une autre version</button>
              )}
              {describeTranslation(translations.find((t: any) => t.code === trad) ?? {}) && (
                <p className="rbubble-sub" style={{ marginTop: 12 }}>
                  {describeTranslation(translations.find((t: any) => t.code === trad) ?? {})}
                </p>
              )}
              <div className="rbubble-k">Lire hors ligne (avion)</div>
              <OfflineDownload translation={trad}
                translationName={translations.find((t: any) => t.code === trad)?.name} />
            </>
          )}

        </div>
      )}

    </main>
  );
}
