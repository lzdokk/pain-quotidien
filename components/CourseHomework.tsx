'use client';
import { useRef, useState } from 'react';
import { relabelCode } from '@/lib/cursus-code';
import { courseTitle } from '@/lib/course-titles';

const LEVEL_COLOR: Record<string, string> = {
  'Acquis': '#2f8f5b',
  'A renforcer': '#b3813a',
  'Non acquis': '#b3413a'
};

/** Construit le document imprimable branché (HTML autonome). */
function buildHtml(r: any, code: string, title?: string) {
  const esc = (s: any) => String(s ?? '').replace(/[<>&]/g, m => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m]!));
  const li = (a: string[]) => (a || []).map(x => `<li>${esc(x)}</li>`).join('');
  const corr = (r.corrections || []).map((c: any) =>
    `<p><b>${esc(c.point)}</b><br>${esc(c.explanation)}</p>`).join('');
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const lvlColor = LEVEL_COLOR[r.level] ?? '#4E6A85';
  const displayTitle = esc(courseTitle(code, title || ''));
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Correction — ${esc(relabelCode(code))}</title>
<style>
  @page { size: A4; margin: 15mm; }
  *{ box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body{ margin:0; padding:24px; color:#1b2229; background:#f4f6f8;
        font-family:'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif; line-height:1.62; }
  .doc{ max-width:720px; margin:0 auto; }
  .band{ background:linear-gradient(120deg,#4E6A85,#33485c); color:#fff;
         border-radius:16px; padding:26px 30px; margin-bottom:24px; }
  .brand{ font-family:-apple-system,'Helvetica Neue',Arial,sans-serif; font-weight:700;
          letter-spacing:.16em; text-transform:uppercase; font-size:11px; opacity:.85; }
  .band h1{ font-size:25px; font-weight:600; margin:12px 0 5px; line-height:1.2; }
  .band .meta{ font-family:-apple-system,'Helvetica Neue',Arial,sans-serif; font-size:12.5px; opacity:.82; }
  .sec{ break-inside:avoid; page-break-inside:avoid; }
  .lbl{ font-family:-apple-system,'Helvetica Neue',Arial,sans-serif; font-size:11px; font-weight:700;
        letter-spacing:.12em; text-transform:uppercase; color:#4E6A85; margin:20px 0 8px;
        break-after:avoid; page-break-after:avoid; }
  .card{ border:1px solid #e7eaef; border-left:3px solid #4E6A85; border-radius:12px;
         padding:15px 20px; background:#fff; }
  .badge{ display:inline-block; font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;
          font-weight:700; font-size:12px; padding:5px 13px; border-radius:99px; color:#fff; }
  .verdict{ font-size:18px; font-style:italic; line-height:1.5; margin:12px 0 0; }
  ul{ padding-left:18px; margin:2px 0; } li{ margin:5px 0; }
  .corr p{ margin:2px 0 13px; } .corr b{ color:#33485c; }
  .foot{ margin-top:30px; padding-top:14px; border-top:1px solid #e7eaef;
         font-family:-apple-system,'Helvetica Neue',Arial,sans-serif; font-size:11px; color:#9aa4ad;
         display:flex; justify-content:space-between; }
  @media print { body{ background:#fff; padding:0; } }
</style></head><body>
  <div class="doc">
    <div class="band">
      <div class="brand">Pain de Vie · Cursus théologique</div>
      <h1>${displayTitle || 'Correction du devoir'}</h1>
      <div class="meta">${esc(relabelCode(code))} · Correction du devoir · ${date}</div>
    </div>

    <div class="sec"><p class="lbl">Évaluation</p>
      <div class="card">
        <span class="badge" style="background:${lvlColor}">${esc(r.level)}</span>
        <p class="verdict">${esc(r.verdict)}</p>
      </div></div>

    ${r.strengths?.length ? `<div class="sec"><p class="lbl">Points forts</p><div class="card"><ul>${li(r.strengths)}</ul></div></div>` : ''}
    ${r.gaps?.length ? `<div class="sec"><p class="lbl">À corriger</p><div class="card"><ul>${li(r.gaps)}</ul></div></div>` : ''}
    ${corr ? `<div class="sec"><p class="lbl">Explications</p><div class="card corr">${corr}</div></div>` : ''}
    <div class="sec"><p class="lbl">Pour progresser</p><div class="card">${esc(r.next_step)}</div></div>

    <div class="foot"><span>Pain de Vie — Cursus théologique</span><span>${date}</span></div>
  </div>
</body></html>`;
}

function Result({ r, code, title }: { r: any; code: string; title?: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const open = () => setHtml(buildHtml(r, code, title));
  const download = () => {
    const w = frameRef.current?.contentWindow;
    if (w) { w.focus(); w.print(); }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div className="mini">
        <strong>Evaluation</strong>
        <span style={{ color: LEVEL_COLOR[r.level] ?? 'var(--accent)', fontWeight: 660 }}>{r.level}</span>
      </div>
      <p style={{ marginTop: 12, fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.5 }}>{r.verdict}</p>

      {r.strengths?.length > 0 && (
        <>
          <h3 style={{ marginTop: 20 }}>Points forts</h3>
          <ul className="mlist">{r.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
        </>
      )}

      {r.gaps?.length > 0 && (
        <>
          <h3 style={{ marginTop: 18 }}>A corriger</h3>
          <ul className="mlist">{r.gaps.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
        </>
      )}

      {r.corrections?.length > 0 && (
        <>
          <h3 style={{ marginTop: 18 }}>Explications</h3>
          {r.corrections.map((c: any, i: number) => (
            <div key={i} style={{ marginTop: 12 }}>
              <p style={{ fontWeight: 640 }}>{c.point}</p>
              <p style={{ color: 'var(--ink-2)' }}>{c.explanation}</p>
            </div>
          ))}
        </>
      )}

      <div className="prayer" style={{ marginTop: 20 }}>
        <span className="kicker">Pour progresser</span>
        <p>{r.next_step}</p>
      </div>

      <div className="share-grid" style={{ marginTop: 18 }}>
        <button className="btn" onClick={open}>Aperçu / PDF ↓</button>
      </div>

      {html && (
        <div className="pdfmodal">
          <div className="pdfmodal-bar">
            <button className="btn sm" onClick={() => setHtml(null)}>✕ Fermer</button>
            <span className="pdfmodal-title">Aperçu de la correction</span>
            <button className="btn sm primary" onClick={download}>Télécharger ↓</button>
          </div>
          <iframe ref={frameRef} className="pdfmodal-frame" srcDoc={html} title="Correction" />
        </div>
      )}
    </div>
  );
}

export default function CourseHomework({ code, user, last, title }: any) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(last ?? null);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="card pad" style={{ marginTop: 12 }}>
        <span className="kicker">Rendre le devoir</span>
        <p className="muted" style={{ marginTop: 8 }}>
          Connectez-vous pour rendre votre devoir et recevoir une correction détaillée.
        </p>
      </div>
    );
  }

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/cursus/correct', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, submission: text })
      });
      const j = await res.json();
      setLoading(false);
      if (!res.ok) { setError(j.error ?? 'Une erreur est survenue.'); return; }
      setResult(j);
    } catch {
      setLoading(false);
      setError('Connexion interrompue. Reessaie.');
    }
  };

  return (
    <div className="card pad" style={{ marginTop: 12 }}>
      <span className="kicker">Rendre le devoir</span>
      {last && !text && (
        <p className="muted" style={{ marginTop: 8 }}>
          Voici ta dernière correction. Tu peux rendre une nouvelle version ci-dessous.
        </p>
      )}
      <textarea className="field" style={{ marginTop: 10, minHeight: 170 }} value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Rédige ici ta réponse au travail demandé..." />
      {error && <p className="muted" style={{ color: '#b3413a', marginTop: 8 }}>{error}</p>}
      <button className="btn primary" style={{ marginTop: 10 }} disabled={loading} onClick={submit}>
        {loading ? 'Correction en cours...' : 'Envoyer pour correction'}
      </button>

      {result && <Result r={result} code={code} title={title} />}
    </div>
  );
}
