'use client';
import { useState } from 'react';
import Link from 'next/link';
import VerseActions from './VerseActions';

/** Les lectures du jour. Un seul volet ouvert a la fois. */
export default function Readings({ readings, user, translationName }:
  { readings: any[]; user?: any; translationName?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="card">
      {readings.map((r, i) => {
        const verses = (r.verses ?? []) as Array<[number, string]>;
        const on = open === i;
        return (
          <article className={`rd${on ? ' open' : ''}`} key={r.id ?? i}>
            <div className="rd-head">
              <button className="rd-toggle" onClick={() => setOpen(on ? null : i)}>
                <span className="num">{i + 1}</span>
                <span>
                  <span className="rd-ref">{r.reference.toUpperCase()}</span>
                  <span className="rd-title">{r.title}</span>
                  <span className="rd-teaser">{r.tag} · {verses.length} versets</span>
                </span>
                <svg className="chev" width="15" height="15" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <Link className="rd-open" href={`/lire?ref=${encodeURIComponent(r.reference)}&from=/pain`}
                    title="Ouvrir dans le lecteur">
                Lire ›
              </Link>
            </div>

            <div className="rd-body">
              {verses.length > 0 && (
                <div className="rd-trad">{r.reference.toUpperCase()} · {translationName ?? 'Bible du Semeur'}</div>
              )}
              {/* On ne monte VerseActions que pour la lecture ouverte : ouvrir
                  une autre lecture referme donc le volet de la précédente. */}
              {on && (
                <VerseActions book={r.book ?? null} chapter={r.chapter ?? null}
                              bookName={(r.reference.match(/^(.*?)\s+\d+/) ?? [null, r.reference])[1]}
                              verses={verses} user={user} />
              )}

              {r.canon_note && (
                <div className="note-canon">
                  <b>Note de canon.</b> Le calendrier de lectures proposait ici un texte
                  deutérocanonique, absent du canon protestant de 66 livres. Il a été
                  remplacé par un passage de même thème.
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
