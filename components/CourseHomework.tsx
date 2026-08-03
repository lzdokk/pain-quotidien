'use client';
import { useState } from 'react';

const LEVEL_COLOR: Record<string, string> = {
  'Acquis': '#2f8f5b',
  'A renforcer': '#b3813a',
  'Non acquis': '#b3413a'
};

/** Ouvre une version imprimable propre du résultat : l'utilisateur choisit
 *  « Enregistrer en PDF » dans la boite d'impression. Aucune dépendance. */
function exportPdf(r: any, code: string, title?: string) {
  const esc = (s: any) => String(s ?? '').replace(/[<>&]/g, m => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[m]!));
  const li = (a: string[]) => (a || []).map(x => `<li>${esc(x)}</li>`).join('');
  const corr = (r.corrections || []).map((c: any) =>
    `<p><b>${esc(c.point)}</b><br>${esc(c.explanation)}</p>`).join('');
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<title>Correction ${esc(code)}</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;max-width:720px;margin:44px auto;padding:0 26px;color:#161616;line-height:1.62}
  h1{font-size:25px;margin:0 0 2px} .sub{color:#777;margin:0 0 8px}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:.09em;color:#7a7a7a;margin:26px 0 8px;font-family:Arial,sans-serif}
  .lvl{font-weight:700;font-size:16px} .verdict{font-size:18px;font-style:italic}
  ul{padding-left:20px;margin:6px 0} li{margin:4px 0}
  .foot{margin-top:34px;color:#999;font-size:12px;font-family:Arial,sans-serif}
</style></head><body>
  <h1>Correction — ${esc(code)}</h1>
  <p class="sub">${esc(title || '')}${title ? ' · ' : ''}${date}</p>
  <h2>Évaluation</h2>
  <p class="lvl">${esc(r.level)}</p>
  <p class="verdict">${esc(r.verdict)}</p>
  ${r.strengths?.length ? `<h2>Points forts</h2><ul>${li(r.strengths)}</ul>` : ''}
  ${r.gaps?.length ? `<h2>À corriger</h2><ul>${li(r.gaps)}</ul>` : ''}
  ${corr ? `<h2>Explications</h2>${corr}` : ''}
  <h2>Pour progresser</h2><p>${esc(r.next_step)}</p>
  <p class="foot">Le Pain quotidien · Cursus théologique</p>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) { alert('Autorisez les fenêtres pop-up pour télécharger le PDF.'); return; }
  w.document.write(html); w.document.close(); w.focus();
  setTimeout(() => w.print(), 400);
}

function Result({ r, code, title }: { r: any; code: string; title?: string }) {
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
        <button className="btn" onClick={() => exportPdf(r, code, title)}>
          Télécharger en PDF ↓
        </button>
      </div>
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
