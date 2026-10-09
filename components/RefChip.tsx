'use client';
import { useState } from 'react';
import Link from 'next/link';
import { parseShortRef, readerHref } from '@/lib/refs';

type Passage = { ref: string; translation: string; verses: Array<{ verse: number; text: string }> };

/**
 * Reference cliquable de l'index d'etude (« Gn 12.1-3 ») : un toucher ouvre
 * le passage dans une feuille en bas de l'ecran, avec un lien vers le lecteur.
 */
export default function RefChip({ r, from }: { r: string; from?: string }) {
  const [open, setOpen] = useState(false);
  const [p, setP] = useState<Passage | null>(null);
  const [err, setErr] = useState(false);
  const parsed = parseShortRef(r);
  if (!parsed) return <span className="refchip off">{r}</span>;

  const show = async () => {
    setOpen(true);
    if (p || err) return;
    try {
      const res = await fetch(`/api/passage?ref=${encodeURIComponent(r)}`);
      if (!res.ok) throw new Error();
      setP(await res.json());
    } catch { setErr(true); }
  };

  return (
    <>
      <button className="refchip" onClick={show}>{parsed.label}</button>
      {open && (
        <div className="rsheet-back" onClick={() => setOpen(false)}>
          <div className="rsheet refsheet" onClick={e => e.stopPropagation()}>
            <div className="rsheet-grip" />
            <h3 className="rsheet-title">{parsed.bookName} {parsed.chapter}{parsed.vStart ? `.${parsed.vStart}${parsed.vEnd && parsed.vEnd !== parsed.vStart ? `-${parsed.vEnd}` : ''}` : ''}</h3>
            {err ? <p className="empty">Passage indisponible pour le moment.</p>
              : !p ? <p className="empty">Chargement…</p>
              : (
                <div className="refsheet-text">
                  {p.verses.map(v => (
                    <p key={v.verse}><span className="v">{v.verse}</span>{v.text}</p>
                  ))}
                  <span className="refsheet-tr">{p.translation}</span>
                </div>
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
