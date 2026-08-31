'use client';
import { Fragment, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { themeOf, suggestTheme } from '@/lib/highlight-themes';
import Explain from './Explain';
import WordByWord from './WordByWord';
import Compare from './Compare';

type Props = {
  book: number | null;
  chapter: number | null;
  bookName: string;
  verses: Array<[number, string]>;
  user: any;
};

/**
 * Les MÊMES actions verset que dans /lire, mais directement dans les lectures
 * du jour : le volet s'ouvre juste SOUS le verset tapé, avec surlignage,
 * thème, note, explication, mot-à-mot, comparaison, partage et multi-sélection.
 */
export default function VerseActions({ book, chapter, bookName, verses, user }: Props) {
  const [sel, setSel] = useState<number | null>(null);
  const [hl, setHl] = useState<Record<number, number>>({});
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [explain, setExplain] = useState<number | null>(null);
  const [wbw, setWbw] = useState<number | null>(null);
  const [cmp, setCmp] = useState<number | null>(null);
  const [multi, setMulti] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user || !book || !chapter) return;
    (async () => {
      const [{ data: h }, { data: n }] = await Promise.all([
        supabase.from('highlights').select('verse, color').eq('user_id', user.id).eq('book', book).eq('chapter', chapter),
        supabase.from('notes').select('*').eq('user_id', user.id).eq('book', book).eq('chapter', chapter)
      ]);
      setHl(Object.fromEntries((h ?? []).map((x: any) => [x.verse, x.color])));
      setMyNotes(n ?? []);
    })();
  }, [user, book, chapter]);

  if (!book || !chapter) return null;

  const textOf = (n: number) => verses.find(([m]) => m === n)?.[1] ?? '';
  const noteFor = (v: number) => myNotes.find(n => n.verse === v);

  const setColor = async (v: number, color: number) => {
    const next = { ...hl }; color ? next[v] = color : delete next[v];
    setHl(next); // on garde le volet ouvert pour voir le thème appliqué
    if (!user) return;
    if (color) await supabase.from('highlights').upsert({ user_id: user.id, book, chapter, verse: v, color });
    else await supabase.from('highlights').delete().eq('user_id', user.id).eq('book', book).eq('chapter', chapter).eq('verse', v);
  };

  const saveNote = async (v: number) => {
    if (!user) return alert('Connectez-vous pour écrire dans votre carnet.');
    const reference = `${bookName} ${chapter}.${v}`;
    const existing = noteFor(v);
    if (!noteText.trim()) {
      if (existing) { await supabase.from('notes').delete().eq('id', existing.id); setMyNotes(n => n.filter(x => x.id !== existing.id)); }
    } else if (existing) {
      await supabase.from('notes').update({ body: noteText, updated_at: new Date().toISOString() }).eq('id', existing.id);
      setMyNotes(n => n.map(x => x.id === existing.id ? { ...x, body: noteText } : x));
    } else {
      const { data } = await supabase.from('notes')
        .insert({ user_id: user.id, book, chapter, verse: v, reference, verse_text: textOf(v), body: noteText })
        .select().single();
      if (data) setMyNotes(n => [data, ...n]);
    }
    setEditing(false); setNoteText('');
  };

  const shareText = async (txt: string) => {
    const nav: any = navigator;
    if (nav?.share) { try { await nav.share({ text: txt }); return; } catch { /* repli copie */ } }
    try { await nav?.clipboard?.writeText(txt); } catch {}
  };
  const shareOne = (n: number) => shareText(`« ${textOf(n)} » ${bookName} ${chapter}.${n}`);

  // ── Multi-sélection ────────────────────────────────────────────────
  const toggleMulti = (v: number) =>
    setMulti(prev => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n; });
  const multiSorted = () => [...multi].sort((a, b) => a - b);
  const multiRefLabel = () => {
    const s = multiSorted(); if (!s.length) return '';
    const contiguous = s.every((n, i) => i === 0 || n === s[i - 1] + 1);
    return contiguous && s.length > 1 ? `${s[0]}-${s[s.length - 1]}` : s.join(', ');
  };
  const multiText = () =>
    `${multiSorted().map(n => `${n}. ${textOf(n)}`).join('\n')}\n— ${bookName} ${chapter}.${multiRefLabel()}`;

  return (
    <>
      <div className="scripture">
        {verses.map(([n, t]) => {
          const c = hl[n];
          return (
            <Fragment key={n}>
              <span className={`vs${c ? ` h${c}` : ''}${sel === n ? ' sel' : ''}${multi.has(n) ? ' multi' : ''}`}
                    onClick={() => { setSel(sel === n ? null : n); setEditing(false); setNoteText(noteFor(n)?.body ?? ''); }}>
                <span className="vn">{n}</span>{t}
                {noteFor(n) && <span className="noteflag">note</span>}
              </span>

              {sel === n && (
                <div className="vbar-inline">
                  <div className="vbar-head">
                    <span className="vref">{bookName} {chapter}.{n}</span>
                    <button className="vbar-x" onClick={() => { setSel(null); setEditing(false); }} aria-label="Fermer">✕</button>
                  </div>

                  {(() => {
                    const sug = suggestTheme(t);
                    return sug && hl[n] !== sug.color ? (
                      <button className="btn sm suggest" onClick={() => setColor(n, sug.color)}>
                        ✨ Classer en « {sug.label} »
                      </button>
                    ) : null;
                  })()}

                  <div className="vbar-row">
                    {[1, 2, 3, 4, 5, 6, 7].map(cc => (
                      <span key={cc} className={`swatch s${cc}`} title={themeOf(cc)?.label} onClick={() => setColor(n, cc)} />
                    ))}
                    <span className="swatch s0" title="Retirer le surlignage" onClick={() => setColor(n, 0)} />
                    <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => setEditing(true)}>
                      {noteFor(n) ? 'Modifier la note' : 'Ajouter une note'}
                    </button>
                    <button className="btn sm" onClick={() => setExplain(explain === n ? null : n)}>Expliquer</button>
                    <button className="btn sm" onClick={() => setWbw(wbw === n ? null : n)}>Mot à mot</button>
                    <button className="btn sm" onClick={() => setCmp(cmp === n ? null : n)}>Comparer</button>
                    <button className="btn sm" onClick={() => shareOne(n)}>Partager</button>
                    <button className="btn sm" onClick={() => navigator.clipboard?.writeText(`« ${t} » ${bookName} ${chapter}.${n}`)}>Copier</button>
                    <button className="btn sm" onClick={() => toggleMulti(n)}>{multi.has(n) ? '− Retirer' : '+ Sélection'}</button>
                  </div>

                  {hl[n] ? (
                    <div className="vbar-theme">
                      <span className={`swatch s${hl[n]}`} />
                      Thème : <strong>{themeOf(hl[n])?.label}</strong>
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
                        <button className="btn primary" onClick={() => saveNote(n)}>Enregistrer dans mon carnet</button>
                      </div>
                    </div>
                  )}

                  {wbw === n && <WordByWord book={book} chapter={chapter} verse={n} onClose={() => setWbw(null)} />}
                  {cmp === n && (
                    <Compare book={book} chapter={chapter} verse={n}
                             refLabel={`${bookName} ${chapter}.${n}`} onClose={() => setCmp(null)} />
                  )}
                  {explain === n && (
                    <Explain book={book} chapter={chapter} verse={n} bookName={bookName} text={t} inline
                             onClose={() => setExplain(null)}
                             onGoto={(ref) => { location.href = `/lire?ref=${encodeURIComponent(ref)}`; }} />
                  )}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {multi.size > 0 && (
        <div className="multibar">
          <span className="multibar-ref">
            {bookName} {chapter}.{multiRefLabel()} · {multi.size} verset{multi.size > 1 ? 's' : ''}
          </span>
          <div className="multibar-actions">
            <button className="btn sm primary" onClick={() => shareText(multiText())}>Partager</button>
            <button className="btn sm" onClick={() => navigator.clipboard?.writeText(multiText())}>Copier</button>
            <button className="btn sm" onClick={() => setMulti(new Set())}>Effacer</button>
          </div>
        </div>
      )}
    </>
  );
}
