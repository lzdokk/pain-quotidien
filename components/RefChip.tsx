'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { parseShortRef, readerHref } from '@/lib/refs';
import VerseActions from './VerseActions';

type Passage = { ref: string; translation: string; verses: Array<{ verse: number; text: string }> };

/**
 * Reference cliquable de l'index d'etude (« Gn 12.1-3 ») : un toucher ouvre
 * le passage dans une feuille en bas de l'ecran. Chaque verset se touche
 * comme dans /lire : classer (couleur), note, Expliquer, Mot a mot,
 * Comparer, Partager, Copier, + Selection.
 */
export default function RefChip({ r, from }: { r: string; from?: string }) {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState<Passage | null>(null);
  const [err, setErr] = useState(false);
  const [user, setUser] = useState<any>(undefined);
  const parsed = parseShortRef(r);
  if (!parsed) return <span className="refchip off">{r}</span>;

  const show = async () => {
    setOpen(true);
    if (user === undefined) {
      supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null)).catch(() => setUser(null));
    }
    if (p || err) return;
    try {
      const res = await fetch(`/api/passage?ref=${encodeURIComponent(r)}`);
      if (!res.ok) throw new Error();
      setP(await res.json());
    } catch { setErr(true); }
  };

  const title = `${parsed.bookName} ${parsed.chapter}${parsed.vStart ? `.${parsed.vStart}${parsed.vEnd && parsed.vEnd !== parsed.vStart ? `-${parsed.vEnd}` : ''}` : ''}`;

  return (
    <>
      <button className="refchip" onClick={show}>{parsed.label}</button>
      {open && (
        <div className="rsheet-back" onClick={() => setOpen(false)}>
          <div className="rsheet refsheet" onClick={e => e.stopPropagation()}>
            <div className="rsheet-grip" />
            <h3 className="rsheet-title">{title}</h3>
            {err ? <p className="empty">Passage indisponible pour le moment.</p>
              : !p ? <p className="empty">Chargement…</p>
              : (
                <>
                  <p className="refsheet-hint">Touchez un verset pour le classer, l&rsquo;expliquer, le lire mot à mot…</p>
                  <VerseActions book={parsed.book} chapter={parsed.chapter} bookName={parsed.bookName}
                                verses={p.verses.map(v => [v.verse, v.text] as [number, string])}
                                user={user ?? null} />
                  <span className="refsheet-tr">{p.translation}</span>
                </>
              )}
            <div className="refsheet-actions">
              <Link className="btn primary sm" href={readerHref(parsed, from)}>Lire tout le chapitre ›</Link>
              <button className="btn sm" onClick={() => setOpen(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
