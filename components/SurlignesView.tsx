'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Explain from './Explain';
import WordByWord from './WordByWord';
import Compare from './Compare';
import { HL_THEMES, themeOf } from '@/lib/highlight-themes';
import { ALLIANCES, BOOK_GROUPS, allianceOf, groupOf } from '@/lib/bible-books';

type Item = {
  color: number; book: number; chapter: number; verse: number;
  bookName: string; ref: string; text: string;
};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Mes versets colories : recherche, filtre par CATÉGORIE (couleur = thème)
 * et par famille de livres (Torah, Évangiles, lettres de Paul…).
 * Chaque thème est un volet qui se déplie.
 *   compact : volets fermés au départ (intégré au profil).
 */
export default function SurlignesView({ items, userId, compact = false }: { items: Item[]; userId: string; compact?: boolean }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(0);            // 0 = toutes les catégories
  const [fam, setFam] = useState('tout');       // tout | ancienne | nouvelle | id de groupe
  const [list, setList] = useState<Item[]>(items);
  const [openThemes, setOpenThemes] = useState<Set<number>>(new Set(compact ? [] : HL_THEMES.map(t => t.color)));
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [wbwOpen, setWbwOpen] = useState(false);
  const [cmpOpen, setCmpOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const keyOf = (it: Item) => `${it.book}-${it.chapter}-${it.verse}`;
  const query = norm(q.trim());
  const inFam = (it: Item) => fam === 'tout' ? true
    : fam === 'ancienne' || fam === 'nouvelle' ? allianceOf(it.book) === fam
    : groupOf(it.book)?.id === fam;
  const base = list.filter(it => inFam(it) && (!query || norm(`${it.ref} ${it.text}`).includes(query)));
  const filtered = cat ? base.filter(it => it.color === cat) : base;
  const filtering = !!query || !!cat || fam !== 'tout';

  const toggleTheme = (c: number) => setOpenThemes(prev => {
    const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n;
  });

  const toggle = (it: Item) => {
    const k = keyOf(it);
    if (openKey === k) { setOpenKey(null); return; }
    setOpenKey(k); setWbwOpen(false); setCmpOpen(false); setNoteOpen(false); setNoteText(''); setNoteSaved(false);
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
      <div className={compact ? 'sl-filters' : 'card pad sl-filters'}>
        <input className="field" type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Chercher dans mes versets (référence ou mot)…" />

        <div className="sl-k">Catégorie</div>
        <div className="sl-cats">
          <button className={`sl-cat${cat === 0 ? ' on' : ''}`} onClick={() => setCat(0)}>
            Toutes <span>{base.length}</span>
          </button>
          {HL_THEMES.map(th => {
            const n = base.filter(it => it.color === th.color).length;
            return (
              <button key={th.color} className={`sl-cat${cat === th.color ? ' on' : ''}`}
                      onClick={() => setCat(cat === th.color ? 0 : th.color)} disabled={!n && cat !== th.color}>
                <span className={`swatch s${th.color}`} />{th.label} <span>{n}</span>
              </button>
            );
          })}
        </div>

        <div className="sl-k">Livres</div>
        <select className="field sl-fam" value={fam} onChange={e => setFam(e.target.value)}>
          <option value="tout">Toute la Bible</option>
          {ALLIANCES.map(a => (
            <optgroup key={a.id} label={a.label}>
              <option value={a.id}>{a.label} (tout)</option>
              {BOOK_GROUPS.filter(g => g.alliance === a.id).map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </optgroup>
          ))}
        </select>

        {filtering && (
          <p className="fine" style={{ marginTop: 10 }}>
            {filtered.length} verset{filtered.length > 1 ? 's' : ''}
            {' · '}<a style={{ cursor: 'pointer', color: 'var(--accent)' }}
                      onClick={() => { setQ(''); setCat(0); setFam('tout'); }}>Tout afficher</a>
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className={compact ? '' : 'card pad'}>
          <p className="empty">Aucun verset {filtering ? 'ne correspond à ce filtre' : "colorié pour l'instant"}.</p>
        </div>
      ) : HL_THEMES.map(th => {
        const group = filtered.filter(it => it.color === th.color);
        if (group.length === 0) return null;
        const open = filtering || openThemes.has(th.color);
        return (
          <section key={th.color} className={`${compact ? 'sl-sec' : 'card pad'} sl-volet${open ? ' open' : ''}`} style={{ marginTop: compact ? 10 : 16 }}>
            <button className="sl-th" onClick={() => toggleTheme(th.color)} aria-expanded={open}>
              <span className={`swatch s${th.color}`} />
              <div className="sl-th-txt"><strong>{th.label}</strong><span className="sl-hint">{th.hint}</span></div>
              <span className="sl-count">{group.length}</span>
              <span className="volet-chev">{open ? '▾' : '▸'}</span>
            </button>
            {open && (
              <div className="sl-list">
                {group.map(it => {
                  const k = keyOf(it); const isOpen = openKey === k;
                  return (
                    <div key={k} className={`sl-item-wrap${isOpen ? ' open' : ''}`}>
                      <button className="sl-item" onClick={() => toggle(it)}>
                        <span className="sl-ref">{it.ref}<em className="sl-fam-tag">{groupOf(it.book)?.label}</em></span>
                        {it.text && <span className="sl-text">{it.text}</span>}
                      </button>

                      {isOpen && (
                        <div className="sl-panel">
                          <div className="vbar-row">
                            {[1, 2, 3, 4, 5, 6, 7].map(c =>
                              <span key={c} className={`swatch s${c}${it.color === c ? ' cur' : ''}`}
                                    title={themeOf(c)?.label} onClick={() => changeColor(it, c)} />)}
                            <button className="btn sm" onClick={() => setNoteOpen(o => !o)}>Note</button>
                            <button className="btn sm" onClick={() => setWbwOpen(o => !o)}>Strong · mot à mot</button>
                            <button className="btn sm" onClick={() => setCmpOpen(o => !o)}>Comparer</button>
                            <button className="btn sm" onClick={() => goto(it.ref)}>Ouvrir dans le lecteur ›</button>
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

                          <Explain book={it.book} chapter={it.chapter} verse={it.verse} bookName={it.bookName}
                                   text={it.text} inline onClose={() => setOpenKey(null)} onGoto={goto} />

                          {wbwOpen && (
                            <WordByWord book={it.book} chapter={it.chapter} verse={it.verse} frText={it.text}
                                        onClose={() => setWbwOpen(false)} />
                          )}
                          {cmpOpen && (
                            <Compare book={it.book} chapter={it.chapter} verse={it.verse}
                                     refLabel={it.ref} onClose={() => setCmpOpen(false)} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
