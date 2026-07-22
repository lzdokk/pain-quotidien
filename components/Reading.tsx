'use client';
import { useState } from 'react';

export default function Reading({ r, index, open }: { r: any; index: number; open?: boolean }) {
  const [on, setOn] = useState(Boolean(open));
  const verses = (r.verses ?? []) as Array<[number, string]>;

  return (
    <article className={`rd${on ? ' open' : ''}`}>
      <button className="rd-toggle" onClick={() => setOn(v => !v)}>
        <span className="num">{index + 1}</span>
        <span>
          <span className="rd-ref">{r.reference.toUpperCase()} · SEGOND</span>
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
        {r.canon_note && (
          <div className="note-canon">
            <b>Note de canon.</b> Le calendrier de lectures proposait ici un texte
            deuterocanonique, absent du canon protestant de 66 livres. Il a ete
            remplace par un passage de meme theme.
          </div>
        )}
        <div className="rd-sum">
          <strong>Le resume</strong>
          <p dangerouslySetInnerHTML={{ __html: r.summary }} />
          <span className="tag">{r.tag}</span>
        </div>
      </div>
    </article>
  );
}
