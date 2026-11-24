'use client';
import { useUser } from '@/lib/useUser';
import { Fragment, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase/client';
import Explain from './Explain';
import WordByWord from './WordByWord';
import Compare from './Compare';
import VerseCompare from './VerseCompare';
import OfflineDownload from './OfflineDownload';
import AiKeyButton from './AiKeyButton';
import { themeOf, suggestTheme, matchThemeQuery } from '@/lib/highlight-themes';
import { MEDITER_QUESTIONS, MEDITER_ETAPES } from '@/lib/reading-guide';
import { ALLIANCES, BOOK_GROUPS, groupOf, searchBooks, bookName as accentName } from '@/lib/bible-books';
import StudyIndex from './StudyIndex';
import FicheSheet from './FicheSheet';
import dynamic from 'next/dynamic';
import CarteEtude from './CarteEtude';
import { useSuivi } from './EtudierProgress';
import { chapitreDuJour } from '@/lib/parcours';
const Dictionnaire = dynamic(() => import('./Dictionnaire'), { ssr: false });
const StrongModal = dynamic(() => import('./StrongModal'), { ssr: false });
const VerseImage = dynamic(() => import('./VerseImage'), { ssr: false });
import { ThemeButton } from './ThemeSheet';
import { FONDS, readLook, saveLook, readLookPhoto, saveLookPhoto, type Look, LOOK_DEFAULT } from '@/lib/reader-look';
const EtudeLivres = dynamic(() => import('./EtudeLivres'), { ssr: false, loading: () => <div className="skel skel-card" /> });
import ChapterStudy from './ChapterStudy';
import WordsBrowser from './WordsBrowser';
import VerseTools from './VerseTools';
import { getStudyList, getChapterStudy, kindLabel, type StudyList } from '@/lib/study-client';
import R from '@/components/R';

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

// Chapitres deja charges : relecture instantanee, et chapitre suivant pre-charge.
type Chap = { verses: V[]; famous: Array<{ verse_start: number; verse_end: number; title: string }>; jesus: number[] };
const chapterCache = new Map<string, Chap>();

/** Les outils du bouton + (Lire), du haut vers le bas. */
const svg = (d: JSX.Element, sw = 1.8) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const FABS: Array<{ k: 'etude' | 'dico' | 'strong' | 'importants' | 'search' | 'method' | 'look'; l: string; ic: JSX.Element }> = [
  { k: 'etude', l: 'Bible d’étude', ic: svg(<><path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5zM12 6.5V19" /></>) },
  { k: 'dico', l: 'Dictionnaire biblique', ic: svg(<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM5 17a3 3 0 013-3h11M9 8h6" />) },
  { k: 'strong', l: 'Strong (hébreu, grec)', ic: <span className="rfab-he">א</span> },
  { k: 'importants', l: 'Versets importants', ic: <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3.2l2.6 5.5 6 .7-4.5 4.1 1.2 5.9L12 16.5 6.7 19.4l1.2-5.9L3.4 9.4l6-.7z" /></svg> },
  { k: 'search', l: 'Rechercher', ic: svg(<><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>) },
  { k: 'method', l: 'Méditer', ic: svg(<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z" />, 1.7) },
  { k: 'look', l: 'Apparence de lecture', ic: svg(<><path d="M12 3a9 9 0 100 18c1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.9.7-1.6 1.6-1.6H16a5 5 0 005-5C21 6.6 17 3 12 3z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7.5" r="1" /><circle cx="14.5" cy="7.5" r="1" /></>) },
];
let loadSeq = 0; // numéro de la dernière demande de chapitre
/** Lecture d'un chapitre par la route mise en cache (CDN + téléphone). */
async function readChapter(t: string, b: number, c: number): Promise<Chap> {
  const r = await fetch(`/api/bible/read?t=${encodeURIComponent(t)}&b=${b}&c=${c}`);
  const j = await r.json();
  return { verses: j.verses ?? [], famous: j.famous ?? [], jesus: j.jesus ?? [] };
}

export default function Reader({ books: booksIn, translations, plans, steps, plan: planProp, notes, highlights, intros, user: userProp }: any) {
  const user = useUser(userProp); // lu dans le navigateur
  // Parcours de lecture personnel, relu dans le navigateur.
  const [plan, setPlan] = useState<any>(planProp);
  useEffect(() => {
    if (!user) return;
    supabase.from('user_plan').select('*').maybeSingle().then(({ data }) => { if (data) setPlan(data); });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // Noms des livres AVEC accents (Genèse, Lévitique, Deutéronome…).
  const books = useMemo(() => (booksIn ?? []).map((b: any) => ({ ...b, name: accentName(b.id, b.name) })), [booksIn]);
  // Recherche rapide d'un livre dans la feuille « Livres » (« gen » -> Genèse).
  const [bookQ, setBookQ] = useState('');
  // Mode « Approfondir » (Strong) : partage avec les autres pages via localStorage.
  const [deep, setDeep] = useState(false);
  useEffect(() => {
    try { localStorage.removeItem('pq-strong'); } catch {} // ancien mode Strong permanent : retiré
    const on = (e: any) => setDeep(!!e.detail);
    window.addEventListener('pq-strong', on);
    return () => window.removeEventListener('pq-strong', on);
  }, []);
  const toggleDeep = () => {
    const next = !deep; setDeep(next); setWbw(null);
    try { localStorage.setItem('pq-strong', next ? '1' : '0'); } catch {}
    window.dispatchEvent(new CustomEvent('pq-strong', { detail: next }));
  };
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
  // Page gardée en mémoire par le navigateur : on relit couleurs et notes
  // pour qu'elles soient toujours à jour (sans recharger toute la page).
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: h }, { data: n }] = await Promise.all([
        supabase.from('highlights').select('book, chapter, verse, color'),
        supabase.from('notes').select('*').not('reference', 'like', '~etude:%').order('created_at', { ascending: false }).limit(60)
      ]);
      if (h) setHl(Object.fromEntries(h.map((x: any) => [`${x.book}-${x.chapter}-${x.verse}`, x.color])));
      if (n) setMyNotes(n);
    })();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [results, setResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [backTo, setBackTo] = useState<string | null>(null); // retour (ex. parabole)
  const [searchedIn, setSearchedIn] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState(false);
  const [famous, setFamous] = useState<Record<number, string>>({});
  const [jesusV, setJesusV] = useState<Set<number>>(new Set()); // paroles de Jésus (red-letter)
  const applyChapter = (j: Chap) => {
    setVerses(j.verses);
    const map: Record<number, string> = {};
    for (const f of j.famous) for (let n = f.verse_start; n <= f.verse_end; n++) map[n] = f.title;
    setFamous(map);
    setJesusV(new Set(j.jesus));
  };
  const [sheet, setSheet] = useState<null | 'book' | 'version' | 'verse'>(null); // feuilles (livre / version / aller au verset)
  const [sheetBook, setSheetBook] = useState<number | null>(null); // livre deplie dans la feuille
  // Onglets de la page : lecture du jour / parcours / Bible.
  type Tab = 'jour' | 'parcours' | 'bible' | 'recherche' | 'etude';
  const [tab, setTabState] = useState<Tab>('bible');
  const setTab = (t: Tab) => {
    const v: Tab = t === 'jour' ? 'parcours' : t;
    setTabState(v);
    try { sessionStorage.setItem('pq-tab', v); } catch {}
  };
  // Bible d'étude : mode lecture enrichie, fiche ouverte, liste des fiches.
  const [etudeOn, setEtudeOn] = useState(false);
  const [fiche, setFiche] = useState<string | null>(null);
  const [studyList, setStudyList] = useState<StudyList | null>(null);
  const [studyVerses, setStudyVerses] = useState<Set<number>>(new Set());
  const [studyMap, setStudyMap] = useState<Record<number, string>>({});
  const [lexique, setLexique] = useState<any[] | null>(null);
  const [lexOpen, setLexOpen] = useState(false);
  const [wordHits, setWordHits] = useState<any[]>([]);
  const [bookFamous, setBookFamous] = useState<Array<{ chapter: number; verse: number; title: string }>>([]);
  useEffect(() => {
    try { setEtudeOn(localStorage.getItem('pq-etude') === '1'); } catch {}
  }, []);
  const toggleEtude = (on?: boolean) => {
    const next = on ?? !etudeOn;
    setEtudeOn(next);
    try { localStorage.setItem('pq-etude', next ? '1' : '0'); } catch {}
  };
  useEffect(() => {
    if (!etudeOn) { setStudyMap({}); setStudyVerses(new Set()); return; }
    let alive = true;
    getChapterStudy(book, chapter).then(list => {
      if (!alive) return;
      const map: Record<number, string> = {};
      for (const it of list as any[]) for (const v of it.verses) if (!map[v]) map[v] = it.slug;
      setStudyMap(map); setStudyVerses(new Set(Object.keys(map).map(Number)));
    });
    return () => { alive = false; };
  }, [etudeOn, book, chapter]); // eslint-disable-line react-hooks/exhaustive-deps
  const loadStudy = () => { if (!studyList) getStudyList().then(setStudyList); };
  const loadLexique = async () => {
    if (lexique) return lexique;
    const { data } = await supabase.from('bible_words')
      .select('slug, term, translit, lang, gloss, theme, sense, christ, refs').order('translit');
    const list = (data ?? []).filter((w: any) => !/grec/i.test(w.lang ?? ''));
    setLexique(list);
    return list;
  };
  // Recherche : derniere requete lancee, historique des mots cherches,
  // et verset a ouvrir quand on touche un resultat.
  const [doneQ, setDoneQ] = useState('');
  const [qHist, setQHist] = useState<string[]>([]);
  const [target, setTarget] = useState<number | null>(null);
  // Bulles flottantes : methode de lecture / recherche + historique.
  const [bubble, setBubble] = useState<null | 'method' | 'search' | 'versions' | 'importants' | 'etude' | 'dico' | 'strong' | 'look'>(null);
  // Image de verset à partager, apparence de lecture.
  const [imgShare, setImgShare] = useState<{ text: string; ref: string; v?: number } | null>(null);
  const [look, setLookState] = useState<Look>(LOOK_DEFAULT);
  const [lookPhoto, setLookPhoto] = useState<string | null>(null);
  const [lookMsg, setLookMsg] = useState('');
  useEffect(() => { setLookState(readLook()); setLookPhoto(readLookPhoto()); }, []);
  const setLook = (p: Partial<Look>) => setLookState(l => { const n = { ...l, ...p }; saveLook(n); return n; });
  const pickLookPhoto = async (f?: File) => {
    if (!f) return;
    try {
      const { loadPhoto } = await import('./VerseImage');
      const { url } = await loadPhoto(f, 1400);
      setLookPhoto(url); setLook({ fond: 'photo' });
      setLookMsg(saveLookPhoto(url) ? '' : 'Photo trop lourde pour être gardée : elle restera jusqu’à la fermeture.');
    } catch { setLookMsg('Photo illisible.'); }
  };
  const [dicoInit, setDicoInit] = useState<number | null>(null);
  const [strongCode, setStrongCode] = useState<string | null>(null);
  const [sq, setSq] = useState('');
  const [sres, setSres] = useState<any[] | null>(null);
  const [sload, setSload] = useState(false);
  const [strongHits, setStrongHits] = useState<any[]>([]);
  const [dicoHits, setDicoHits] = useState<any[]>([]);
  const findStrong = async (k: string) => {
    try { const r = await fetch(`/api/strongs?q=${encodeURIComponent(k)}`); return (await r.json()).results ?? []; } catch { return []; }
  };
  const findDico = async (k: string) => {
    try { const r = await fetch(`/api/dict?q=${encodeURIComponent(k)}`); return (await r.json()).items ?? []; } catch { return []; }
  };
  const [sAside, setSAside] = useState<any[] | null>(null);
  const [sAll, setSAll] = useState(false);
  const sKey = useRef('');
  useEffect(() => {
    if (bubble !== 'strong' || !book) return;
    const k = `${book}-${chapter}`;
    if (sKey.current === k && sAside) return;
    sKey.current = k; setSAside(null); setSAll(false); setSres(null); setSq('');
    fetch(`/api/aside/strong?b=${book}&c=${chapter}`).then(r => r.ok ? r.json() : null)
      .then(j => setSAside(j?.items ?? [])).catch(() => setSAside([]));
  }, [bubble, book, chapter]); // eslint-disable-line react-hooks/exhaustive-deps
  const runStrong = async () => {
    if (sq.trim().length < 1) return;
    setSload(true); setSres(await findStrong(sq.trim())); setSload(false);
  };
  const [fabOpen, setFabOpen] = useState(false); // bouton + : déplie les autres boutons
  // Recherche rapide dans la bulle loupe (reste dans la bulle, sans changer d'onglet).
  const [bq, setBq] = useState('');
  const [bres, setBres] = useState<any[] | null>(null);
  const [bload, setBload] = useState(false);
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

  const { actif: parcoursEtude } = useSuivi();
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

  const jourEtape = useMemo(() => {
    if (!position?.step) return null;
    try { return chapitreDuJour(position.step, position.chapter); } catch { return null; }
  }, [position]);
  const nomLivreJour = jourEtape ? (books.find((b: any) => b.id === jourEtape.book)?.name ?? '') : '';

  const forgot = plan?.last_read_on && plan.last_read_on !== iso(new Date());

  const load = useCallback(async () => {
    const ck = `${trad}|${book}|${chapter}`;
    // Seule la DERNIÈRE demande s'affiche : un chapitre précédent qui arrive en
    // retard ne doit jamais remplacer celui qu'on vient d'ouvrir.
    const seq = ++loadSeq;
    // Pre-charge le chapitre suivant en arriere-plan (lecture suivie sans attente).
    const prefetchNext = () => {
      const nb = chapter < chapters ? book : book + 1;
      const nc = chapter < chapters ? chapter + 1 : 1;
      const nk = `${trad}|${nb}|${nc}`;
      if (nb > 66 || chapterCache.has(nk)) return;
      setTimeout(async () => {
        try {
          const j = await readChapter(trad, nb, nc);
          if (j.verses.length) chapterCache.set(nk, j);
        } catch {}
      }, 900);
    };
    const hit = chapterCache.get(ck);
    if (hit) { setSel(null); applyChapter(hit); setLoading(false); prefetchNext(); return; }
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
    // Chapitre + versets célèbres + paroles de Jésus : une seule réponse mise
    // en cache (CDN puis téléphone), au lieu de trois lectures Supabase.
    let j: Chap = { verses: [], famous: [], jesus: [] };
    try { j = await readChapter(trad, book, chapter); } catch {}
    if (j.verses.length) chapterCache.set(ck, j);
    if (seq !== loadSeq) return;
    applyChapter(j); setLoading(false);
    prefetchNext();
  }, [trad, book, chapter, translations, chapters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

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
      // Version gardée seulement si elle existe encore (certaines ont été retirées pour la place).
      const savedT = saved?.t && saved.t !== 'FRLSG' && translations.some((t: any) => t.code === saved.t) ? saved.t : preferred;
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
      const qs = new URLSearchParams(location.search);
      const hasRef = qs.get('ref');
      const savedTab = sessionStorage.getItem('pq-tab');
      const wanted = qs.get('tab');
      if (wanted === 'etude' || wanted === 'recherche' || wanted === 'parcours') setTabState(wanted as Tab);
      else if (!hasRef && (savedTab === 'recherche' || savedTab === 'etude')) setTabState(savedTab as Tab);
      if (qs.get('vue') === 'livres') setTabState('parcours');
      if (qs.get('fiche')) setFiche(qs.get('fiche'));
      if (qs.get('lexique')) { setTabState('recherche'); setLexOpen(true); }
      if (qs.get('q') && wanted === 'recherche') setSearch(qs.get('q')!);
      setQHist(JSON.parse(localStorage.getItem('pq-search-hist') ?? '[]'));
    } catch {}
  }, []);
  useEffect(() => { if (tab === 'etude' || tab === 'recherche') loadStudy(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lexOpen) loadLexique(); }, [lexOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  // Versets importants du livre (bulle ★)
  useEffect(() => {
    let alive = true;
    fetch(`/api/bible/famous?b=${book}`).then(r => r.json()).then(({ items }) => {
      if (alive) setBookFamous((items ?? []).map((f: any) => ({ chapter: f.chapter, verse: f.verse_start, title: f.title })));
    }).catch(() => {});
    return () => { alive = false; };
  }, [book]);
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
    setBookQ('');
    // Le volet du livre en cours est ouvert : on l'amène en haut de la liste.
    const t = setTimeout(() => (document.querySelector('.bk-fold.cur') ?? document.getElementById(`bk-${book}`))
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

  const etudeGo = (e: string) => {
    try { window.dispatchEvent(new CustomEvent('pq-etude-go', { detail: e })); } catch {}
  };

  const markRead = async () => {
    if (!user) return alert('Connectez-vous pour suivre votre parcours.');
    await supabase.rpc('mark_read', { p_user: user.id });
    location.reload();
  };

  const go = (ref: string) => {
    const m = ref.match(/^(.+?)\s+(\d+)/);
    if (!m) return;
    const nz = (x: string) => x.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
    const norm = nz(m[1]);
    const b = books.find((x: any) => nz(x.name).startsWith(norm));
    if (b) { setBook(b.id); setChapter(Math.min(+m[2], b.chapters)); setExplain(null); setWbw(null); setCmp(null); setTab('bible'); }
  };
  // « Esther 1.10 » (renvois du dictionnaire) : ouvre le chapitre et place le verset.
  const goRef = (ref: string) => {
    const m = ref.match(/^(.+?)\s+(\d+)(?:[.:](\d+))?/);
    if (!m) return;
    go(`${m[1]} ${m[2]}`);
    if (m[3]) setTarget(+m[3]); else window.scrollTo({ top: 0 });
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
  const runQuick = async (qIn?: string) => {
    const q = (qIn ?? bq).trim();
    if (qIn !== undefined) setBq(qIn);
    if (q.length < 2) return;
    remember(q);
    if (/\S\s+\d/.test(q)) { go(q); setBubble(null); return; }   // « jean 3 » : on y va directement
    setBload(true); setBres([]);
    try {
      const r = await fetch(`/api/bible/find?t=${encodeURIComponent(trad)}&q=${encodeURIComponent(q)}`);
      setBres((await r.json()).results ?? []);
    } catch { setBres([]); }
    setBload(false);
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
    // En parallèle : mots hébreux du lexique (sans attendre les versets).
    if (q.length >= 2) {
      loadLexique().then(list => {
        const n = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const nm = (x: string) => (x ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        setWordHits(list.filter((w: any) => nm(`${w.translit} ${w.term} ${w.gloss}`).includes(n)).slice(0, 8));
      });
    } else setWordHits([]);
    if (q.length >= 2 && !/\S\s+\d/.test(q)) {
      findStrong(q).then(r => setStrongHits(r.slice(0, 12)));
      findDico(q).then(r => setDicoHits(r.slice(0, 12)));
    } else { setStrongHits([]); setDicoHits([]); }
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
    // Concordance mise en cache (CDN) : Supabase n'est sollicité qu'une fois par recherche et par jour.
    let data: any[] = [];
    try {
      const r = await fetch(`/api/bible/find?t=${encodeURIComponent(searchIn)}&q=${encodeURIComponent(q)}`);
      data = (await r.json()).results ?? [];
    } catch {}
    setResults(data); setSearching(false);
  };

  return (
    <main className="wrap">
      <div style={{ height: 18 }} />

      <div className="page-tabs four" role="tablist">
        {([['bible', 'Bible'], ['etude', 'Étude'], ['recherche', 'Recherche'], ['parcours', 'Parcours']] as const).map(([k, l]) => (
          <button key={k} role="tab" className="page-tab" aria-selected={tab === k}
                  onClick={() => { setTab(k); setBubble(null); }}>{l}</button>
        ))}
      </div>

      {tab === 'parcours' && (
        <>
      {parcoursEtude && (
        <CarteEtude
          onRead={(b, c) => { setBook(b); setChapter(c); setTarget(null); setTab('bible'); }}
          onStudy={(b, c) => etudeGo(`c:${b}:${c}`)}
          onFiche={(b) => etudeGo(`l:${b}`)}
          onList={() => etudeGo('')} />
      )}
      {!parcoursEtude && P && position.step && (
        <div className="card">
          <div className="today-read tr-flex">
            <div className="tr-main">
              <span className="kicker">Votre lecture du jour</span>
              <div className="big-ref">{nomLivreJour && jourEtape ? `${nomLivreJour} ${jourEtape.chapter}` : `${position.step.label}`}</div>
              <p style={{ color: 'var(--ink-2)', fontSize: 15.5 }}>
                Jour {plan?.current_day ?? 1}{P.days ? ` sur ${P.days}` : ''} · Étape {position.index + 1} sur {mySteps.length}, {position.step.label}{position.step.title ? ` (${position.step.title})` : ''}
                {plan?.streak > 1 ? ` · ${plan.streak} jours d'affilee` : ''}
              </p>
              {P.days ? (
                <div className="progress-wrap">
                  <div className="bar"><i style={{ width: `${Math.min(100, Math.round(((plan?.current_day ?? 1) - 1) / P.days * 100))}%` }} /></div>
                  <span className="pct">{Math.min(100, Math.round(((plan?.current_day ?? 1) - 1) / P.days * 100))} %</span>
                </div>
              ) : null}
              <div className="share-grid" style={{ marginTop: 20 }}>
                <button className="btn primary" onClick={() => {
                  setBook(jourEtape?.book ?? position.step.book); setChapter(jourEtape?.chapter ?? 1); setTab('bible');
                  setTimeout(() => document.getElementById('lecteur')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
                }}>
                  Ouvrir la lecture
                </button>
                <button className="btn" onClick={() => etudeGo(jourEtape ? `c:${jourEtape.book}:${jourEtape.chapter}` : `l:${position.step.book}`)}>Étudier ce chapitre</button>
                <button className="btn" onClick={markRead}>J&rsquo;ai lu, chapitre suivant</button>
              </div>
              <button className="pe-back" style={{ marginTop: 10, fontWeight: 500, fontSize: 14 }} onClick={() => etudeGo(`q:${P.id}`)}>↺ Recommencer ou reprendre à une étape</button>
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

      <EtudeLivres
        plans={plans} steps={steps} activePlanId={P?.id}
        activeIndex={position.index} activeDay={plan?.current_day ?? 1}
        onRead={(b, c) => { try { history.replaceState(null, '', '/lire'); } catch {} setBook(b); setChapter(c); setTarget(null); setTab('bible'); }}
        onJump={async (id, day) => {
          if (!user) return alert('Connectez-vous pour suivre votre parcours.');
          await supabase.from('user_plan').update({ plan_id: id, current_day: day }).eq('user_id', user.id);
          location.reload();
        }}
        onChoose={async (id) => {
          if (!user) return alert('Connectez-vous pour changer de parcours.');
          await supabase.from('user_plan').update({ plan_id: id, current_day: 1 }).eq('user_id', user.id);
          location.reload();
        }} />

      <h2 className="sect">Mon carnet de bord</h2>
      <p className="sub">{myNotes.length} note{myNotes.length > 1 ? 's' : ''} et {Object.keys(hl).length} surlignage{Object.keys(hl).length > 1 ? 's' : ''}.</p>
      <div className="card pad">
        {myNotes.length === 0 && Object.keys(hl).length === 0 ? (
          <p className="empty">Rien pour l&rsquo;instant. Ouvrez un chapitre, touchez un verset, choisissez une couleur ou ecrivez une note. Tout se retrouve ici.</p>
        ) : myNotes.map(n => (
          <div className="entry" key={n.id}>
            <div className="eref">{n.reference}</div>
            <div className="etext">{n.verse_text}</div>
            <div className="enote">{<R t={n.body} />}</div>
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

      {tab === 'etude' && (
        <>
          <Dictionnaire onRef={goRef} chapter={{ b: book, c: chapter, name: bookName }} />
          {studyList
            ? <StudyIndex embedded plan={studyList.plan} ready={studyList.ready} sujets={studyList.sujets}
                          renvois={studyList.renvois} onOpen={setFiche} />
            : <div className="skel skel-card" />}
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

            <div className="srch-more">
              <button className="btn sm" onClick={() => setLexOpen(true)}>א Mots hébreux</button>
              <button className="btn sm" onClick={() => setTab('etude')}>Bible d&rsquo;étude</button>
            </div>
          </div>

          {doneQ && !doneQ.startsWith('★') && (() => {
            const n = doneQ.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const nm = (x: string) => (x ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const fiches = studyList ? studyList.plan
              .filter(e => studyList.ready[e.slug] !== undefined && nm(e.title).includes(n)).slice(0, 8) : [];
            if (!fiches.length && !wordHits.length && !strongHits.length && !dicoHits.length) return null;
            return (
              <div className="card pad srch-groups">
                {fiches.length > 0 && (
                  <>
                    <div className="srch-k">Dans la Bible d&rsquo;étude</div>
                    <div className="ix-chips">
                      {fiches.map(f => (
                        <button key={f.slug} className="ix-chip" onClick={() => setFiche(f.slug)}>
                          {f.title}<small className="chip-k"> · {kindLabel(f.kind)}</small>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {dicoHits.length > 0 && (
                  <>
                    <div className="srch-k">Dans le dictionnaire biblique</div>
                    <div className="ix-chips">
                      {dicoHits.map((d: any) => (
                        <button key={d.id} className="ix-chip" onClick={() => { setDicoInit(d.id); setBubble('dico'); }}>
                          {d.titre}{d.m === 'x' ? <small className="chip-k"> · cité</small> : null}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {strongHits.length > 0 && (
                  <>
                    <div className="srch-k">Dans le Strong (hébreu, grec)</div>
                    <div className="ix-chips">
                      {strongHits.map((w: any) => (
                        <button key={w.code} className="ix-chip" onClick={() => setStrongCode(w.code)}>
                          {w.translit || w.lemma}<small className="chip-k"> · {w.code}</small>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {wordHits.length > 0 && (
                  <>
                    <div className="srch-k">Mots hébreux</div>
                    <div className="ix-chips">
                      {wordHits.map((w: any) => (
                        <button key={w.slug} className="ix-chip" onClick={() => setLexOpen(true)}>
                          {w.translit}<small className="chip-k"> · {w.gloss}</small>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

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

      <div className={`card look-${look.fond}${look.police === 'sans' ? ' look-sans' : ''}`} id="lecteur"
           style={{ scrollMarginTop: 70, ['--rd-scale' as any]: look.taille,
             ...(look.fond === 'photo' && lookPhoto ? { backgroundImage: `linear-gradient(rgba(8,10,14,${look.voile}),rgba(8,10,14,${look.voile})),url(${lookPhoto})` } : {}) }}>
        {compareWith && (
          <div className="cmp-strip">
            <span>Comparaison : <b>{trad}</b> et <b>{compareWith}</b></span>
            <button className="btn sm" onClick={() => setCompareWith(null)}>Fermer</button>
          </div>
        )}

        {deep && (
          <div className="deep-bar">
            <span><b>Mode Strong</b> · touchez un verset : l&rsquo;hébreu ou le grec s&rsquo;ouvre, mot par mot.</span>
            <button className="btn sm" onClick={toggleDeep}>Quitter</button>
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
              <p className="bi-situ">{<R t={intro.situ} />}</p>
              <div className="bi-grid">
                <div><span className="kicker">C&rsquo;est qui</span><p>{<R t={intro.who} />}</p></div>
                <div><span className="kicker">Pourquoi ce livre</span><p>{<R t={intro.why} />}</p></div>
              </div>
              <div className="bi-christ">
                <span className="kicker">Le fil vers Jésus</span>
                <p>{<R t={intro.christ} />}</p>
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
                       className={`vs${c ? ` h${c}` : ''}${sel === v.verse ? ' sel' : ''}${multi.has(v.verse) ? ' multi' : ''}${famous[v.verse] ? ' famous' : ''}${jesusV.has(v.verse) ? ' jesus' : ''}${etudeOn && studyVerses.has(v.verse) ? ' stud' : ''}`}
                       onClick={() => {
                         if (deep) { setSel(null); setWbw(wbw === v.verse ? null : v.verse); return; }
                         setSel(sel === v.verse ? null : v.verse); setEditing(false); setNoteText(noteFor(v.verse)?.body ?? '');
                       }}>
                   {famous[v.verse] && <span className="vstar" title={`Verset connu · ${famous[v.verse]}`}>★</span>}
                   <span className="vn">{v.verse}</span>{v.text}
                   {etudeOn && studyMap[v.verse] && (
                     <button className="vstud" title="Fiche de la Bible d’étude"
                             onClick={e => { e.stopPropagation(); setFiche(studyMap[v.verse]); }}>✦</button>
                   )}
                   {noteFor(v.verse) && <span className="noteflag">note</span>}
                 </span>
                 {showExplain && (
                   <Explain book={book} chapter={chapter} verse={v.verse} bookName={bookName}
                            text={v.text} inline onClose={() => setExplain(null)} onGoto={go} />
                 )}
                 {wbw === v.verse && (
                   <WordByWord book={book} chapter={chapter} verse={v.verse} prefer={deep ? 'grec' : undefined}
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
            <VerseTools refLabel={`${bookName} ${chapter}.${s}`} text={sv.text} color={hl[key(s)] ?? 0}
                        onShare={() => setImgShare({ text: sv.text, ref: `${bookName} ${chapter}.${s}`, v: s })}
                        suggestion={sug} hasNote={!!noteFor(s)} multiOn={multi.has(s)}
                        open={{ note: editing, strong: wbw === s, compare: cmp === s, explain: explain?.kind === 'v' && explain.verse === s }}
                        onClose={() => { setSel(null); setEditing(false); }}
                        onColor={c => setColor(s, c)}
                        onNote={() => setEditing(e => !e)}
                        onExplain={() => setExplain({ kind: 'v', verse: s })}
                        onStrong={() => setWbw(wbw === s ? null : s)}
                        onCompare={() => setCmp(cmp === s ? null : s)}
                        onMulti={() => toggleMulti(s)} />
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
            <button className="btn sm primary" onClick={() => setImgShare({
              text: multiSorted().map(n => verses.find(x => x.verse === n)?.text ?? '').join(' '),
              ref: `${bookName} ${chapter}.${multiRefLabel()}` })}>Image</button>
            <button className="btn sm" onClick={shareMulti}>Partager</button>
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
              <div className="rsheet-extra">
                <div className="rbubble-k" style={{ marginTop: 0 }}>Comparer 2 versions</div>
                <button className="btn sm" onClick={() => {
                  setCompareWith(langTranslations.find((t: any) => t.code !== trad)?.code ?? null);
                  setSheet(null);
                  setTimeout(() => document.getElementById('lecteur')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
                }}>Comparer avec une autre version</button>
                <div className="rbubble-k">Lire hors ligne (avion)</div>
                <OfflineDownload translation={trad} translationName={translations.find((t: any) => t.code === trad)?.name} />
                <div className="rbubble-k">Assistant IA</div>
                <AiKeyButton compact />
              </div>
              </>
            )}

            {sheet === 'book' && (() => {
              const openChap = (id: number, c: number) => {
                setBook(id); setChapter(c); setSheet(null); setTab('bible');
                setTimeout(() => document.getElementById('lecteur')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
              };
              const bookRow = (b: any, tag?: string) => (
                <div key={b.id} id={`bk-${b.id}`}>
                  <button className={`rsheet-row${b.id === book ? ' on' : ''}`}
                          onClick={() => setSheetBook(sheetBook === b.id ? null : b.id)}>
                    <span className="sr-main"><b>{b.name}</b>{tag && <span className="bk-tag">{tag}</span>}</span>
                    <span className="sr-chev">{sheetBook === b.id ? '▾' : '▸'}</span>
                  </button>
                  {sheetBook === b.id && (
                    <div className="chgrid">
                      {Array.from({ length: b.chapters }, (_, i) => (
                        <button key={i}
                                className={`chcell${b.id === book && chapter === i + 1 ? ' on' : ''}`}
                                onClick={() => openChap(b.id, i + 1)}>{i + 1}</button>
                      ))}
                    </div>
                  )}
                </div>
              );
              const found = searchBooks(bookQ);
              const hits = found.ids.map(id => books.find((b: any) => b.id === id)).filter(Boolean).slice(0, 8);
              const pick = () => {
                const b: any = hits[0]; if (!b) return;
                if (found.chapter) openChap(b.id, Math.min(Math.max(1, found.chapter), b.chapters));
                else setSheetBook(b.id);
              };
              return (
                <>
                  <h3 className="rsheet-title">Livres</h3>
                  <div className="bk-search">
                    <input className="field" type="search" value={bookQ}
                           onChange={e => { setBookQ(e.target.value); setSheetBook(null); }}
                           onKeyDown={e => { if (e.key === 'Enter') pick(); }}
                           placeholder="Chercher : gen, 1 co, jean 3…" />
                  </div>

                  {bookQ.trim() ? (
                    <div className="rsheet-list">
                      {hits.length === 0 && <p className="empty">Aucun livre ne correspond.</p>}
                      {found.chapter && hits[0] && (
                        <button className="bk-direct" onClick={pick}>
                          Ouvrir {(hits[0] as any).name} {Math.min(found.chapter, (hits[0] as any).chapters)} ›
                        </button>
                      )}
                      {hits.map((b: any) => bookRow(b, groupOf(b.id)?.label))}
                    </div>
                  ) : (
                    <>
                      <div className="bk-jump">
                        {ALLIANCES.map(a => (
                          <button key={a.id} className={`bk-jump-b ${a.id}`}
                                  onClick={() => document.getElementById(`al-${a.id}`)
                                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                            {a.label}
                          </button>
                        ))}
                      </div>
                      {ALLIANCES.map(a => (
                        <section key={a.id} id={`al-${a.id}`} className={`bk-alliance ${a.id}`}>
                          <div className="bk-al-head">
                            <b>{a.label}</b>
                            <span>{a.he} · {a.sub}</span>
                          </div>
                          {BOOK_GROUPS.filter(g => g.alliance === a.id).map(g => (
                            <details key={g.id} open={book >= g.from && book <= g.to} className={`bk-group bk-fold${book >= g.from && book <= g.to ? ' cur' : ''}`}>
                              <summary className="bk-group-h">
                                <span className="bk-g-l">{g.label}</span>
                                {g.he && <span className="bk-g-he">{g.he}</span>}
                                <span className="bk-g-n">{g.to - g.from + 1}</span>
                                <span className="bk-g-chev">›</span>
                              </summary>
                              <div className="rsheet-list">
                                {books.filter((b: any) => b.id >= g.from && b.id <= g.to).map((b: any) => bookRow(b))}
                              </div>
                            </details>
                          ))}
                        </section>
                      ))}
                    </>
                  )}
                </>
              );
            })()}

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
        <div className={`rfabs${fabOpen ? ' open' : ''}`}>
          {fabOpen && FABS.map(f => (
            <button key={f.k} className="rfab-row" onClick={() => { setBubble(f.k); setFabOpen(false); }}>
              <span className="rfab-l">{f.l}</span>
              <span className={`rfab${f.k === 'importants' ? ' rfab-star' : ''}`}>{f.ic}</span>
            </button>
          ))}
          <button className={`rfab rfab-plus${fabOpen || bubble ? ' x' : ''}`}
                  aria-label={fabOpen || bubble ? 'Fermer' : 'Outils de lecture'} aria-expanded={fabOpen}
                  onClick={() => { if (bubble) setBubble(null); else setFabOpen(o => !o); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
      )}
      {fabOpen && <div className="rfab-veil" onClick={() => setFabOpen(false)} />}

      {bubble && (tab === 'bible' || bubble === 'dico' || bubble === 'strong') && (
        <div className={`rbubble${bubble === 'dico' || bubble === 'strong' ? ' rbubble-wide' : ''}`} role="dialog">
          <button className="rbubble-x" onClick={() => { setBubble(null); setDicoInit(null); }} aria-label="Fermer">×</button>

          {bubble === 'look' && (
            <>
              <h3 className="rbubble-t">Apparence de lecture</h3>
              <div className="rbubble-k" style={{ marginTop: 0 }}>Fond</div>
              <div className="lk-fonds">
                {FONDS.map(f => (
                  <button key={f.id} className={look.fond === f.id ? 'on' : ''} onClick={() => setLook({ fond: f.id })}>
                    <span className="lk-sw" style={{ background: f.swatch }} />{f.label}
                  </button>
                ))}
                <label className={look.fond === 'photo' ? 'on' : ''}>
                  <input type="file" accept="image/*" onChange={e => pickLookPhoto(e.target.files?.[0])} />
                  <span className="lk-sw lk-ph" style={lookPhoto ? { backgroundImage: `url(${lookPhoto})` } : undefined}>{lookPhoto ? '' : '+'}</span>Ma photo
                </label>
              </div>
              {look.fond === 'photo' && lookPhoto && (
                <label className="vi-range">Voile <input type="range" min="0.3" max="0.85" step="0.05" value={look.voile} onChange={e => setLook({ voile: +e.target.value })} /></label>
              )}
              {lookMsg && <p className="fine">{lookMsg}</p>}
              <div className="rbubble-k">Taille du texte</div>
              <div className="lk-size">
                <button onClick={() => setLook({ taille: Math.max(0.8, +(look.taille - 0.1).toFixed(2)) })} aria-label="Plus petit">A−</button>
                <span>{Math.round(look.taille * 100)} %</span>
                <button onClick={() => setLook({ taille: Math.min(1.6, +(look.taille + 0.1).toFixed(2)) })} aria-label="Plus grand">A+</button>
              </div>
              <div className="rbubble-k">Police</div>
              <div className="vi-chips">
                <button className={look.police === 'serif' ? 'on' : ''} style={{ fontFamily: 'var(--serif)' }} onClick={() => setLook({ police: 'serif' })}>Classique</button>
                <button className={look.police === 'sans' ? 'on' : ''} style={{ fontFamily: 'var(--sans)' }} onClick={() => setLook({ police: 'sans' })}>Moderne</button>
              </div>
              <button className="linkbtn" style={{ marginTop: 14, fontSize: 13.5 }} onClick={() => setLook({ ...LOOK_DEFAULT })}>Revenir à l’apparence par défaut</button>
              <div style={{ marginTop: 14 }}><ThemeButton label="Couleurs et police de toute l’app" className="btn sm" /></div>
            </>
          )}

          {bubble === 'dico' && (
            <>
              <h3 className="rbubble-t">Dictionnaire biblique</h3>
              <Dictionnaire bare initialId={dicoInit} chapter={{ b: book, c: chapter, name: bookName }} onRef={r => { setBubble(null); setDicoInit(null); goRef(r); }} />
            </>
          )}

          {bubble === 'strong' && (
            <>
              <h3 className="rbubble-t">Strong</h3>
              {!sres && (
                <>
                  <p className="rbubble-sub">Les mots clés {book >= 40 ? 'grecs' : 'hébreux'} de {bookName} {chapter}.</p>
                  {sAside === null ? <p className="fine">Recherche des mots du chapitre…</p>
                    : sAside.length === 0 ? <p className="fine">Pas encore de mots d’origine pour ce chapitre.</p> : (
                    <>
                      <div className="cstudy-list">
                        {(sAll ? sAside : sAside.slice(0, 16)).map((w: any) => (
                          <button key={w.code} className="cstudy-it st-card" onClick={() => setStrongCode(w.code)}>
                            <span className="cstudy-k">{w.code}{w.type ? ` · ${w.type}` : ''}</span>
                            <span className="cstudy-t"><span className="st-lem" dir="auto">{w.lemma}</span> {w.translit}</span>
                            {w.sens && <span className="st-sens">{w.sens}</span>}
                            <span className="cstudy-v">v. {w.verses.slice(0, 5).join(', ')}{w.verses.length > 5 ? '…' : ''}</span>
                          </button>
                        ))}
                      </div>
                      {sAside.length > 16 && !sAll && (
                        <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setSAll(true)}>Voir les {sAside.length} mots</button>
                      )}
                    </>
                  )}
                  <div className="rbubble-k">Chercher un autre mot ou un numéro</div>
                </>
              )}
              {sres && <button className="pe-back" onClick={() => { setSres(null); setSq(''); }}>‹ Mots de {bookName} {chapter}</button>}
              <div className="srch-row">
                <input className="field" type="search" value={sq} placeholder="amour, agape, G26, H7225…"
                       onChange={e => setSq(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') runStrong(); }} />
                <button className="btn primary" onClick={runStrong}>Chercher</button>
              </div>
              {sload ? <p className="rbubble-sub" style={{ marginTop: 10 }}>Recherche…</p> : sres && (
                sres.length === 0 ? <p className="rbubble-sub" style={{ marginTop: 10 }}>Aucune entrée trouvée.</p> : (
                  <div className="qs-list">
                    {sres.map((w: any) => (
                      <button key={w.code} className="qs-it st-it" onClick={() => setStrongCode(w.code)}>
                        <span className="st-top"><b>{w.translit || w.lemma}</b> <span className="st-lem">{w.lemma}</span> <small>{w.code}</small></span>
                        <span className="st-def">{w.fr_lsg || w.definition_fr}</span>
                      </button>
                    ))}
                  </div>
                )
              )}
            </>
          )}

          {bubble === 'etude' && (
            <>
              <h3 className="rbubble-t">Bible d’étude</h3>
              <p className="rbubble-sub">Les thèmes, personnages, lieux et mots liés à {bookName} {chapter}.</p>
              <ChapterStudy bare book={book} chapter={chapter} label={`${bookName} ${chapter}`}
                            onOpen={slug => { setFiche(slug); setBubble(null); }} />
              <label className="switch rb-switch">
                <input type="checkbox" checked={etudeOn} onChange={e => toggleEtude(e.target.checked)} />
                <span className="switch-ui" />
                <span className="switch-l">Repérer ces versets (✦) dans le texte</span>
              </label>
              <button className="linkbtn rb-more" onClick={() => { setBubble(null); setTab('etude'); }}>Toutes les fiches de la Bible d’étude ›</button>
            </>
          )}

          {bubble === 'method' && (
            <>
              <h3 className="rbubble-t">Méditer</h3>
              <p className="rbubble-sub">D’abord, demande à l’Esprit d’ouvrir ton intelligence.</p>
              <div className="rbubble-k">Se poser les questions</div>
              <div className="med-q">{MEDITER_QUESTIONS.map((q, i) => <span key={i}>{q}</span>)}</div>
              <div className="rbubble-k">Puis</div>
              <ol className="med-steps">{MEDITER_ETAPES.map(([t, d]) => <li key={t}><b>{t}</b> {d}</li>)}</ol>
            </>
          )}

          {bubble === 'search' && (
            <>
              <h3 className="rbubble-t">Rechercher</h3>
              <div className="qs-row">
                <input className="field" type="search" autoFocus value={bq} placeholder="Un mot, ou « jean 3 »"
                       onChange={e => { setBq(e.target.value); if (!e.target.value) setBres(null); }}
                       onKeyDown={e => { if (e.key === 'Enter') runQuick(); }} />
                <button className="btn sm primary" onClick={() => runQuick()}>Chercher</button>
              </div>
              {bres === null ? (
                qHist.length > 0 && (
                  <>
                    <div className="rbubble-k">Mes dernières recherches</div>
                    <div className="qs-hist">
                      {qHist.slice(0, 10).map(h => (
                        <span key={h} className="qs-h">
                          <button onClick={() => runQuick(h)}>{h}</button>
                          <button className="qs-x" onClick={() => forget(h)} aria-label={`Oublier ${h}`}>×</button>
                        </span>
                      ))}
                    </div>
                  </>
                )
              ) : bload ? <p className="rbubble-sub">Recherche…</p> : (
                <>
                  <div className="rbubble-k">{bres.length ? `${bres.length >= 400 ? '400+' : bres.length} verset${bres.length > 1 ? 's' : ''}` : 'Aucun verset trouvé'}</div>
                  <div className="qs-list">
                    {bres.slice(0, 60).map((r: any) => (
                      <button key={`${r.book}-${r.chapter}-${r.verse}`} className="qs-it"
                              onClick={() => { openResult(r); setBubble(null); }}>
                        <b>{books.find((x: any) => x.id === r.book)?.name} {r.chapter}.{r.verse}</b>
                        <span>{r.text}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {bubble === 'importants' && (
            <>
              <h3 className="rbubble-t">Versets importants</h3>
              {Object.keys(famous).length > 0 ? (
                <>
                  <div className="rbubble-k" style={{ marginTop: 0 }}>{bookName} {chapter}</div>
                  <div className="imp-list">
                    {Object.entries(famous)
                      .filter(([v, t], i, arr) => i === 0 || arr[i - 1][1] !== t)
                      .map(([v, t]) => (
                        <button key={v} className="imp-it" onClick={() => { setBubble(null); setTarget(Number(v)); }}>
                          <b>v. {v}</b><span>{t}</span>
                        </button>
                      ))}
                  </div>
                </>
              ) : <p className="rbubble-sub">Pas de verset célèbre repéré dans ce chapitre.</p>}
              {bookFamous.filter(f => f.chapter !== chapter).length > 0 && (
                <>
                  <div className="rbubble-k">Dans tout le livre</div>
                  <div className="imp-list">
                    {bookFamous.filter(f => f.chapter !== chapter).slice(0, 30).map(f => (
                      <button key={`${f.chapter}-${f.verse}`} className="imp-it"
                              onClick={() => { setBubble(null); setChapter(f.chapter); setTarget(f.verse); }}>
                        <b>{f.chapter}.{f.verse}</b><span>{f.title}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {bubble === 'versions' && (
            <>
              <h3 className="rbubble-t">Plus</h3>
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
              <div className="rbubble-k">Assistant IA</div>
              <AiKeyButton compact />
            </>
          )}

        </div>
      )}

      <FicheSheet slug={fiche} onClose={() => setFiche(null)} />
      {strongCode && <StrongModal code={strongCode} onClose={() => setStrongCode(null)} />}
      {imgShare && <VerseImage text={imgShare.text} refLabel={imgShare.ref} bcv={imgShare.v ? { b: book, c: chapter, v: imgShare.v } : undefined}
                               bookName={bookName} onClose={() => setImgShare(null)} />}

      {lexOpen && (
        <div className="rsheet-back" onClick={() => setLexOpen(false)}>
          <div className="rsheet lex-sheet" onClick={e => e.stopPropagation()}>
            <div className="rsheet-grip" />
            <div className="fiche-top"><span className="kicker">Mots hébreux et araméens</span>
              <button className="vbar-x" onClick={() => setLexOpen(false)} aria-label="Fermer">✕</button></div>
            {lexique ? <WordsBrowser words={lexique} embedded /> : <p className="empty">Ouverture du lexique…</p>}
          </div>
        </div>
      )}
    </main>
  );
}
