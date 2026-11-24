'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { aiFetch } from '@/lib/ai-key';
import NeedKey from './NeedKey';
import R from '@/components/R';
import { rich } from '@/lib/rich';
import { meditationText } from '@/lib/meditation-text';
import dynamic from 'next/dynamic';
const VerseImage = dynamic(() => import('./VerseImage'), { ssr: false });

type P = {
  book: number; chapter: number; verse?: number; bookName: string; text: string;
  onClose: () => void; onGoto: (ref: string) => void;
  /** inline = volet affiché sous le verset (au lieu d'une fenêtre centrée) */
  inline?: boolean;
};

const stripTags = (s: string) => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

export default function Explain({ book, chapter, verse, bookName, text, onClose, onGoto, inline }: P) {
  const [data, setData] = useState<any>(undefined);
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [shared, setShared] = useState(false);
  const [needKey, setNeedKey] = useState(false);   // explication à générer : clé requise
  const [askKey, setAskKey] = useState(false);     // question : clé requise
  const [keyTick, setKeyTick] = useState(0);       // relance après ajout de la clé
  useEffect(() => {
    const on = () => setKeyTick(t => t + 1);
    window.addEventListener('pq-ai-key', on);
    return () => window.removeEventListener('pq-ai-key', on);
  }, []);

  const reference = verse === undefined ? `${bookName} ${chapter}` : `${bookName} ${chapter}.${verse}`;

  // Partage : le verset ET toute la méditation (texte simple, sans balises ni astérisques).
  const [img, setImg] = useState(false);
  const fullText = () => meditationText({ reference, verseText: text, data, bookName, chapter, question: q, answer });
  const shareExplanation = async () => {
    const body = fullText();
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    if (nav?.share) { try { await nav.share({ title: reference, text: body }); return; } catch (e: any) { if (e?.name === 'AbortError') return; } }
    try { await nav?.clipboard?.writeText(body); setShared(true); setTimeout(() => setShared(false), 1800); } catch {}
  };

  const ask = async () => {
    if (!q.trim() || asking) return;
    setAsking(true); setAnswer(null); setAskKey(false);
    try {
      const r = await aiFetch('/api/verse-ask', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reference, text, question: q })
      });
      const j = await r.json();
      if (j?.needKey) { setAskKey(true); setAsking(false); return; }
      setAnswer(r.ok ? j.answer : (j.error ?? 'La réponse a échoué.'));
    } catch {
      setAnswer('La réponse a échoué, réessayez.');
    }
    setAsking(false);
  };

  useEffect(() => {
    (async () => {
      if (verse === undefined) {
        const { data } = await supabase.from('chapter_notes')
          .select('*').eq('book', book).eq('chapter', chapter).maybeSingle();
        setData(data ?? null);
      } else {
        // Déjà écrite : lue par le CDN (pas de Supabase).
        try {
          const g = await fetch(`/api/explain?b=${book}&c=${chapter}&v=${verse}`);
          if (g.ok) { setNeedKey(false); return setData(await g.json()); }
        } catch {}
        // Genere a la demande (cle Gemini du lecteur), une seule fois, puis mis en cache pour tous
        const r = await aiFetch('/api/explain', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ book, chapter, verse })
        });
        const j = await r.json().catch(() => null);
        setNeedKey(!!j?.needKey);
        setData(r.ok ? j : null);
      }
    })();
  }, [book, chapter, verse, keyTick]);

  const title = verse === undefined ? `${bookName} ${chapter}` : `${bookName} ${chapter}.${verse}`;

  const inner = (
    <div className={inline ? 'modal-in vexplain' : 'modal-in'}>
      <button className="mclose" onClick={onClose} aria-label="Fermer">✕</button>

      {data === undefined && <><h3>{title}</h3><p className="empty">Chargement…</p></>}

      {data === null && needKey && (
        <>
          <h3>{title}</h3>
          <div className="msub">Méditer ce verset</div>
          <NeedKey what="la méditation de ce verset" />
        </>
      )}

      {data === null && !needKey && (
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
          <p dangerouslySetInnerHTML={{ __html: rich(data.summary) }} />
          <h4>Le découpage</h4>
          <ul className="mlist">{(data.outline as string[]).map((x, i) => <li key={i}>{x}</li>)}</ul>
          <h4>La clé de lecture</h4>
          <div className="par">{<R t={data.reading_key} />}</div>
          <h4>Pourquoi il est là</h4>
          <p dangerouslySetInnerHTML={{ __html: rich(data.why_here) }} />
        </>
      )}

      {data && verse !== undefined && (
        <>
          <h3>{title}</h3>
          <div className="msub">Méditer ce verset</div>
          <div className="quoted">{text}</div>
          {data.word_term && (
            <>
              <h4>Le mot</h4>
              <div className="wordbox">
                <span className="wt">{data.word_term}</span>
                <span className="wl">{data.word_lang}</span>
                <span className="ws">{<R t={data.word_sense} />}</span>
              </div>
            </>
          )}
          <h4>Ce que dit le texte</h4>
          <p dangerouslySetInnerHTML={{ __html: rich(data.says) }} />
          <h4>Une image</h4>
          <div className="par">{<R t={data.parable} />}</div>
          <h4>Pour aller plus loin</h4>
          <p dangerouslySetInnerHTML={{ __html: rich(data.development) }} />
          <h4>À croiser</h4>
          <div className="vrefs">
            {(data.cross_refs as string[]).map(r => (
              <button key={r} onClick={() => onGoto(r)}>{r}</button>
            ))}
          </div>
        </>
      )}

      {data && (
        <div className="ex-foot">
          <div className="share-grid" style={{ marginTop: 4 }}>
            {verse !== undefined && text && (
              <button className="btn sm primary" onClick={() => setImg(true)}>Image + méditation ›</button>
            )}
            <button className="btn sm" onClick={shareExplanation}>
              {shared ? 'Copié ✓' : 'Partager cette méditation ›'}
            </button>
          </div>

          <div className="ex-ask">
            <span className="kicker">Poser ma question</span>
            <textarea className="field" value={q} onChange={e => setQ(e.target.value)}
                      placeholder="Une question sur ce passage… (ex. « Pourquoi Jésus dit-il cela ? »)"
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask(); }} />
            <button className="btn primary sm" onClick={ask} disabled={asking || !q.trim()} style={{ marginTop: 8 }}>
              {asking ? 'Réflexion…' : 'Demander à l’assistant'}
            </button>
            {askKey && <NeedKey what="une réponse" />}
            {answer && (
              <div className="ex-answer">
                {answer.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const imgSheet = img && text ? <VerseImage text={text} refLabel={reference} message={fullText()} onClose={() => setImg(false)} /> : null;
  // Volet sous le verset : pas d'overlay, le contenu se glisse dans le flux.
  if (inline) return <>{inner}{imgSheet}</>;

  // Chapitre : fenêtre centrée classique.
  return (
    <div className="modal on" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {inner}
      {imgSheet}
    </div>
  );
}
