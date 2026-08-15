'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { themeOf } from '@/lib/highlight-themes';
import Explain from './Explain';

type Props = {
  book: number | null;
  chapter: number | null;
  bookName: string;
  verses: Array<[number, string]>;
  user: any;
};

/**
 * Les memes actions verset (surligner, noter, expliquer, copier) que dans
 * /lire, mais directement dans les lectures du jour : pas besoin d'ouvrir
 * le lecteur pour interagir avec un verset.
 */
export default function VerseActions({ book, chapter, bookName, verses, user }: Props) {
  const [sel, setSel] = useState<number | null>(null);
  const [hl, setHl] = useState<Record<number, number>>({});
  const [myNotes, setMyNotes] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [explain, setExplain] = useState<number | null>(null);

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
    const verse_text = verses.find(([n]) => n === v)?.[1] ?? '';
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

  return (
    <>
      <div className="scripture">
        {verses.map(([n, t]) => {
          const c = hl[n];
          return (
            <span key={n} className={`vs${c ? ` h${c}` : ''}${sel === n ? ' sel' : ''}`}
                  onClick={() => { setSel(sel === n ? null : n); setEditing(false); setNoteText(noteFor(n)?.body ?? ''); }}>
              <span className="vn">{n}</span>{t}
              {noteFor(n) && <span className="noteflag">note</span>}
            </span>
          );
        })}
      </div>

      {sel !== null && (
        <div className="vbar on" style={{ position: 'static', marginTop: 16 }}>
          <div className="vref">{bookName} {chapter}.{sel}</div>
          <div className="vbar-row">
            {[1, 2, 3, 4, 5, 6, 7].map(c => (
              <span key={c} className={`swatch s${c}${hl[sel] === c ? ' on' : ''}`}
                    title={themeOf(c)?.label} onClick={() => setColor(sel, c)} />
            ))}
            <span className="swatch s0" title="Retirer" onClick={() => setColor(sel, 0)} />
            <button className="btn sm" style={{ marginLeft: 'auto' }} onClick={() => setEditing(true)}>
              {noteFor(sel) ? 'Modifier la note' : 'Ajouter une note'}
            </button>
            <button className="btn sm" onClick={() => setExplain(sel)}>Expliquer</button>
            <button className="btn sm" onClick={() =>
              navigator.clipboard?.writeText(`« ${verses.find(([n]) => n === sel)?.[1]} » ${bookName} ${chapter}.${sel}`)}>
              Copier
            </button>
          </div>
          <div className="vbar-theme">
            {hl[sel]
              ? <>Thème : <b>{themeOf(hl[sel])?.label}</b></>
              : <span className="muted">Chaque couleur correspond à un thème — survole une pastille pour le voir.</span>}
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

      {explain !== null && (
        <Explain book={book} chapter={chapter} verse={explain}
                 bookName={bookName} text={verses.find(([n]) => n === explain)?.[1] ?? ''}
                 onClose={() => setExplain(null)}
                 onGoto={(ref) => { location.href = `/lire?ref=${encodeURIComponent(ref)}`; }} />
      )}
    </>
  );
}
