'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Explain from './Explain';
import WordByWord from './WordByWord';
import { HL_THEMES, themeOf } from '@/lib/highlight-themes';

type Item = {
  color: number; book: number; chapter: number; verse: number;
  bookName: string; ref: string; text: string;
};

export default function SurlignesView({ items, userId }: { items: Item[]; userId: string }) {
  const [q, setQ] = useState('');
  const [list, setList] = useState<Item[]>(items);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [wbwOpen, setWbwOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const keyOf = (it: Item) => `${it.book}-${it.chapter}-${it.verse}`;
  const query = q.trim().toLowerCase();
  const filtered = query ? list.filter(it => `${it.ref} ${it.text}`.toLowerCase().includes(query)) : list;

  const toggle = (it: Item) => {
    const k = keyOf(it);
    if (openKey === k) { setOpenKey(null); return; }
    setOpenKey(k); setWbwOpen(false); setNoteOpen(false); setNoteText(''); setNoteSaved(false);
  };

  const changeColor = async (it: Item, color: number) => {
    const k = keyOf(it);
    if (color) {
      await supabase.from('highlights').upsert({ user_id: userId, book: it.book, chapter: it.chapter, verse: it.verse, color });
      setList(l => l.map(x => (keyOf(x) === k ? { ...x, color } : x)));
    } else {
      await supabase.from('highlights').delete().eq('book', it.book).eq('chapter', it.chapter).eq('verse', it.verse);
      setList(l => l.filter(x => keyOf(x) !== k)); setOpenKey(null);
    }
  };

  const saveNote = async (it: Item) => {
    if (!noteText.trim()) { setNoteOpen(false); return; }
    await supabase.from('notes').insert({
      user_id: userId, book: it.book, chapter: it.chapter, verse: it.verse,
      reference: it.ref, verse_text: it.text, body: noteText.trim()
    });
    setNoteSaved(true); setNoteOpen(false); setNoteText('');
  };

  const goto = (ref: string) => { window.location.href = `/lire?ref=${encodeURIComponent(ref)}`; };

  return (
    <>
      <div className="card pad">
        <input className="field" type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Chercher dans mes surlignés (référence ou mot)…" />
        {query && <p className="fine" style={{ marginTop: 8 }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</p>}
      </div>

      {filtered.length === 0 ? (
        <div className="card pad">
          <p className="empty">Aucun surlignage {query ? 'ne correspond à cette recherche' : "pour l'instant"}.</p>
        </div>
      ) : HL_THEMES.map(th => {
        const group = filtered.filter(it => it.color === th.color);
        if (group.length === 0) return null;
        return (
          <section key={th.color} className="card pad" style={{ marginTop: 16 }}>
            <div className="sl-th">
              <span className={`swatch s${th.color}`} />
              <div className="sl-th-txt"><strong>{th.label}</strong><span className="sl-hint">{th.hint}</span></div>
              <span className="sl-count">{group.length}</span>
            </div>
            <div className="sl-list">
              {group.map(it => {
                const k = keyOf(it); const open = openKey === k;
                return (
                  <div key={k} className={`sl-item-wrap${open ? ' open' : ''}`}>
                    <button className="sl-item" onClick={() => toggle(it)}>
                      <span className="sl-ref">{it.ref}</span>
                      {it.text && <span className="sl-text">{it.text}</span>}
                    </button>

                    {open && (
                      <div className="sl-panel">
                        <div className="vbar-row">
                          {[1, 2, 3, 4, 5, 6, 7].map(c =>
                            <span key={c} className={`swatch s${c}${it.color === c ? ' cur' : ''}`}
                                  title={themeOf(c)?.label} onClick={() => changeColor(it, c)} />)}
                          <button className="btn sm" onClick={() => setNoteOpen(o => !o)}>Note</button>
                          <button className="btn sm" onClick={() => setWbwOpen(o => !o)}>Mot à mot</button>
                          <button className="btn sm" onClick={() => changeColor(it, 0)}>Retirer</button>
                        </div>

                        {noteSaved && <p className="fine" style={{ marginTop: 8 }}>Note enregistrée dans ton carnet ✓</p>}
                        {noteOpen && (
                          <div style={{ marginTop: 10 }}>
                            <textarea className="field" autoFocus value={noteText}
                                      onChange={e => setNoteText(e.target.value)}
                                      placeholder="Ta note sur ce verset…" />
                            <button className="btn primary sm" style={{ marginTop: 8 }} onClick={() => saveNote(it)}>
                              Enregistrer la note
                            </button>
                          </div>
                        )}

                        {/* Fiche détaillée en priorité */}
                        <Explain book={it.book} chapter={it.chapter} verse={it.verse} bookName={it.bookName}
                                 text={it.text} inline onClose={() => setOpenKey(null)} onGoto={goto} />

                        {wbwOpen && (
                          <WordByWord book={it.book} chapter={it.chapter} verse={it.verse}
                                      onClose={() => setWbwOpen(false)} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
