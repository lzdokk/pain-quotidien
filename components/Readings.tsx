'use client';
import { useState } from 'react';
import Link from 'next/link';

/** Les lectures du jour. Un seul volet ouvert a la fois. */
export default function Readings({ readings }: { readings: any[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="card">
      {readings.map((r, i) => {
        const verses = (r.verses ?? []) as Array<[number, string]>;
        const on = open === i;
        return (
          <article className={`rd${on ? ' open' : ''}`} key={r.id ?? i}>
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

            <div className="rd-body">
              <div className="scripture">
                {verses.map(([n, t]) => <p key={n}><span className="v">{n}</span>{t}</p>)}
              </div>

              <Link href={`/lire?ref=${encodeURIComponent(r.reference)}`} className="btn sm"
                    style={{ marginTop: 4, display: 'inline-block' }}>
                Ouvrir dans le lecteur, pour surligner et annoter
              </Link>

              {r.canon_note && (
                <div className="note-canon">
                  <b>Note de canon.</b> Le calendrier de lectures proposait ici un texte
                  deutérocanonique, absent du canon protestant de 66 livres. Il a été
                  remplacé par un passage de même thème.
                </div>
              )}

              <div className="rd-sum">
                <strong>Le résumé</strong>
                <p dangerouslySetInnerHTML={{ __html: r.summary }} />
                <span className="tag">{r.tag}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
