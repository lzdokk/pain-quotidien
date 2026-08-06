'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type P = {
  book: number; chapter: number; verse?: number; bookName: string; text: string;
  onClose: () => void; onGoto: (ref: string) => void;
  /** inline = volet affiché sous le verset (au lieu d'une fenêtre centrée) */
  inline?: boolean;
};

export default function Explain({ book, chapter, verse, bookName, text, onClose, onGoto, inline }: P) {
  const [data, setData] = useState<any>(undefined);

  useEffect(() => {
    (async () => {
      if (verse === undefined) {
        const { data } = await supabase.from('chapter_notes')
          .select('*').eq('book', book).eq('chapter', chapter).maybeSingle();
        setData(data ?? null);
      } else {
        const { data } = await supabase.from('verse_notes')
          .select('*').eq('book', book).eq('chapter', chapter).eq('verse', verse).maybeSingle();
        if (data) return setData(data);
        // Genere a la demande, une seule fois, puis mis en cache pour tous
        const r = await fetch('/api/explain', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ book, chapter, verse })
        });
        setData(r.ok ? await r.json() : null);
      }
    })();
  }, [book, chapter, verse]);

  const title = verse === undefined ? `${bookName} ${chapter}` : `${bookName} ${chapter}.${verse}`;

  const inner = (
    <div className={inline ? 'modal-in vexplain' : 'modal-in'}>
      <button className="mclose" onClick={onClose} aria-label="Fermer">✕</button>

      {data === undefined && <><h3>{title}</h3><p className="empty">Chargement…</p></>}

      {data === null && (
        <>
          <h3>{title}</h3>
          <div className="msub">Fiche en préparation</div>
          <p>Cette fiche n&rsquo;est pas encore écrite. Les versets des lectures du jour
             sont préparés à l&rsquo;avance chaque nuit : réessayez demain, ou ouvrez un
             verset du pain quotidien, ils sont déjà prêts.</p>
        </>
      )}

      {data && verse === undefined && (
        <>
          <h3>{data.title}</h3>
          <div className="msub">{data.dating}</div>
          <h4>Ce que fait ce chapitre</h4>
          <p dangerouslySetInnerHTML={{ __html: data.summary }} />
          <h4>Le decoupage</h4>
          <ul className="mlist">{(data.outline as string[]).map((x, i) => <li key={i}>{x}</li>)}</ul>
          <h4>La clé de lecture</h4>
          <div className="par">{data.reading_key}</div>
          <h4>Pourquoi il est la</h4>
          <p dangerouslySetInnerHTML={{ __html: data.why_here }} />
        </>
      )}

      {data && verse !== undefined && (
        <>
          <h3>{title}</h3>
          <div className="msub">Explication détaillée</div>
          <div className="quoted">{text}</div>
          {data.word_term && (
            <>
              <h4>Le mot</h4>
              <div className="wordbox">
                <span className="wt">{data.word_term}</span>
                <span className="wl">{data.word_lang}</span>
                <span className="ws">{data.word_sense}</span>
              </div>
            </>
          )}
          <h4>Ce que dit le texte</h4>
          <p dangerouslySetInnerHTML={{ __html: data.says }} />
          <h4>Une image</h4>
          <div className="par">{data.parable}</div>
          <h4>Pour aller plus loin</h4>
          <p dangerouslySetInnerHTML={{ __html: data.development }} />
          <h4>A croiser</h4>
          <div className="vrefs">
            {(data.cross_refs as string[]).map(r => (
              <button key={r} onClick={() => onGoto(r)}>{r}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // Volet sous le verset : pas d'overlay, le contenu se glisse dans le flux.
  if (inline) return inner;

  // Chapitre : fenêtre centrée classique.
  return (
    <div className="modal on" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {inner}
    </div>
  );
}
