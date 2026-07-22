'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Explain from './Explain';

type V = { verse: number; text: string };
const iso = (d: Date) => d.toISOString().slice(0, 10);
const STYLES = [
  ['progressif', 'Progressif, pour comprendre'],
  ['integral', 'Integral, pour tout lire'],
  ['libre', 'Libre, a votre main']
] as const;

export default function Reader({ books, translations, plans, steps, plan, notes, highlights, user }: any) {
  const [trad, setTrad] = useState(translations[0]?.code ?? 'FRLSG');
  const [book, setBook] = useState(44);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<V[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [editing, setEditing] = useState(false);
  const [explain, setExplain] = useState<{ kind: 'ch' | 'v'; verse?: number } | null>(null);
  const [search, setSearch] = useState('');
  const [hl, setHl] = useState<Record<string, number>>(
    Object.fromEntries((highlights ?? []).map((h: any) => [`${h.book}-${h.chapter}-${h.verse}`, h.color])));
  const [myNotes, setMyNotes] = useState<any[]>(notes ?? []);

  const bookName = books.find((b: any) => b.id === book)?.name ?? '';
  const chapters = books.find((b: any) => b.id === book)?.chapters ?? 1;

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
    const { data } = await supabase.from('verses').select('verse, text')
      .eq('translation', trad).eq('book', book).eq('chapter', chapter).order('verse');
    setVerses((data ?? []) as V[]); setLoading(false);
  }, [trad, book, chapter]);

  useEffect(() => { load(); }, [load]);

  const key = (v: number) => `${book}-${chapter}-${v}`;
  const noteFor = (v: number) => myNotes.find(n => n.book === book && n.chapter === chapter && n.verse === v);

  const setColor = async (v: number, color: number) => {
    const k = key(v);
    const next = { ...hl }; color ? next[k] = color : delete next[k];
    setHl(next); setSel(null);
    if (!user) return;
    if (color) await supabase.from('highlights').upsert({ user_id: user.id, book, chapter, verse: v, color });
    else await supabase.from('highlights').delete().eq('book', book).eq('chapter', chapter).eq('verse', v);
  };

  const saveNote = async (v: number) => {
    if (!user) return alert('Connectez-vous pour ecrire dans votre carnet.');
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
    if (b) { setBook(b.id); setChapter(Math.min(+m[2], b.chapters)); setExplain(null); }
  };

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Lire la Bible</div>
        <h1>Un chapitre<br />par jour</h1>
        <p className="lede">Un parcours qui commence la ou il faut commencer, et un carnet qui garde tout ce que vous notez.</p>
      </header>

      {forgot && (
        <div className="banner">
          <span style={{ fontSize: 18 }}>🔔</span>
          <div><b>Vous n&rsquo;avez pas encore lu aujourd&rsquo;hui.</b> Votre derniere lecture remonte au {plan.last_read_on}. Un chapitre prend sept minutes.</div>
        </div>
      )}

      {P && position.step && (
        <div className="card">
          <div className="today-read">
            <span className="kicker">Votre lecture du jour</span>
            <div className="big-ref">{position.step.label} {position.chapter}</div>
            <p style={{ color: 'var(--ink-2)', fontSize: 15.5 }}>
              Jour {plan?.current_day ?? 1}{P.days ? ` sur ${P.days}` : ''} · Etape {position.index + 1} sur {mySteps.length}, {position.step.title}
              {plan?.streak > 1 ? ` · ${plan.streak} jours d'affilee` : ''}
            </p>
            {P.days ? (
              <div className="progress-wrap">
                <div className="bar"><i style={{ width: `${Math.min(100, Math.round((plan?.current_day ?? 1) / P.days * 100))}%` }} /></div>
                <span className="pct">{Math.min(100, Math.round((plan?.current_day ?? 1) / P.days * 100))} %</span>
              </div>
            ) : null}
            <div className="share-grid" style={{ marginTop: 20 }}>
              <button className="btn primary" onClick={() => { setBook(position.step.book); setChapter(position.chapter); }}>
                Ouvrir la lecture
              </button>
              <button className="btn" onClick={markRead}>J&rsquo;ai lu, chapitre suivant</button>
            </div>
          </div>
        </div>
      )}

      <h2 className="sect">Votre parcours</h2>
      <p className="sub">Sept chemins. Prenez Le Fondement si vous debutez.</p>
      <div className="card pad">
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
                    <div className="cles">{(e.key_passages as string[]).map(c => <span key={c}>{c}</span>)}</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <h2 className="sect">Le lecteur</h2>
      <p className="sub">Touchez le titre du chapitre pour son introduction, un verset pour le surligner ou l&rsquo;annoter.</p>
      <div className="card">
        <div style={{ padding: '24px 30px 4px' }}>
          <input className="field" type="search" value={search}
                 onChange={e => setSearch(e.target.value)}
                 onKeyDown={e => { if (e.key === 'Enter') go(search); }}
                 placeholder="Rechercher une reference, par exemple Jean 3 ou Psaume 23" />
          <div className="reader-bar">
            <select className="field" value={trad} onChange={e => setTrad(e.target.value)}>
              {translations.map((t: any) => <option key={t.code} value={t.code}>{t.name}</option>)}
            </select>
            <select className="field" value={book} onChange={e => { setBook(+e.target.value); setChapter(1); }}>
              {books.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="field" value={chapter} onChange={e => setChapter(+e.target.value)}>
              {Array.from({ length: chapters }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 10 }}>
            {translations.find((t: any) => t.code === trad)?.notice}
          </p>
        </div>

        <div className="chap-nav">
          <button className="nav-day" onClick={() => chapter > 1 ? setChapter(chapter - 1) : book > 1 && (setBook(book - 1), setChapter(1))} aria-label="Precedent">‹</button>
          <span className="chap-title" style={{ cursor: 'pointer' }} onClick={() => setExplain({ kind: 'ch' })}>
            {bookName} {chapter} <span style={{ fontSize: 13, color: 'var(--accent)', verticalAlign: 3 }}>ⓘ</span>
          </span>
          <button className="nav-day" onClick={() => chapter < chapters ? setChapter(chapter + 1) : book < 66 && (setBook(book + 1), setChapter(1))} aria-label="Suivant">›</button>
        </div>

        <div className="vlist">
          {loading ? <p className="empty">Chargement…</p> :
           verses.length === 0 ? <p className="empty">Ce chapitre n&rsquo;est pas encore importe dans cette traduction.</p> :
           verses.map(v => {
             const c = hl[key(v.verse)];
             return (
               <span key={v.verse} className={`vs${c ? ` h${c}` : ''}${sel === v.verse ? ' sel' : ''}`}
                     onClick={() => { setSel(sel === v.verse ? null : v.verse); setEditing(false); setNoteText(noteFor(v.verse)?.body ?? ''); }}>
                 <span className="vn">{v.verse}</span>{v.text}
                 {noteFor(v.verse) && <span className="noteflag">note</span>}
               </span>
             );
           })}
        </div>

        {sel !== null && (
          <div className="vbar on">
            <div className="vref">{bookName} {chapter}.{sel}</div>
            <div className="vbar-row">
              {[1, 2, 3, 4].map(c => <span key={c} className={`swatch s${c}`} onClick={() => setColor(sel, c)} />)}
              <span className="swatch s0" onClick={() => setColor(sel, 0)} />
              <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => setEditing(true)}>
                {noteFor(sel) ? 'Modifier la note' : 'Ajouter une note'}
              </button>
              <button className="btn sm" onClick={() => setExplain({ kind: 'v', verse: sel })}>Expliquer</button>
              <button className="btn sm" onClick={() =>
                navigator.clipboard?.writeText(`« ${verses.find(v => v.verse === sel)?.text} » ${bookName} ${chapter}.${sel}`)}>
                Copier
              </button>
            </div>
            {editing && (
              <div>
                <textarea className="field" style={{ marginTop: 12 }} autoFocus value={noteText}
                          onChange={e => setNoteText(e.target.value)}
                          placeholder="Ce que ce verset vous dit, une question, un lien avec votre vie…" />
                <div className="share-grid" style={{ marginTop: 10 }}>
                  <button className="btn primary" onClick={() => saveNote(sel)}>Enregistrer dans mon carnet</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
          <div><b>Vos notes ne sont pas encore enregistrees.</b> Creez un compte pour les retrouver partout et ne rien perdre.</div>
        </div>
      )}

      {explain && (
        <Explain book={book} chapter={chapter} verse={explain.verse}
                 bookName={bookName} text={verses.find(v => v.verse === explain.verse)?.text ?? ''}
                 onClose={() => setExplain(null)} onGoto={go} />
      )}
    </main>
  );
}
