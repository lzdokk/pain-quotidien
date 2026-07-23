'use client';
import { useState } from 'react';

const LEVEL_COLOR: Record<string, string> = {
  'Acquis': '#2f8f5b',
  'A renforcer': '#b3813a',
  'Non acquis': '#b3413a'
};

function Result({ r }: { r: any }) {
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
    </div>
  );
}

export default function CourseHomework({ code, user, last }: any) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(last ?? null);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="card pad" style={{ marginTop: 12 }}>
        <span className="kicker">Rendre le devoir</span>
        <p className="muted" style={{ marginTop: 8 }}>
          Connectez-vous pour rendre votre devoir et recevoir une correction detaillee.
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
          Voici ta derniere correction. Tu peux rendre une nouvelle version ci-dessous.
        </p>
      )}
      <textarea className="field" style={{ marginTop: 10, minHeight: 170 }} value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Redige ici ta reponse au travail demande..." />
      {error && <p className="muted" style={{ color: '#b3413a', marginTop: 8 }}>{error}</p>}
      <button className="btn primary" style={{ marginTop: 10 }} disabled={loading} onClick={submit}>
        {loading ? 'Correction en cours...' : 'Envoyer pour correction'}
      </button>

      {result && <Result r={result} />}
    </div>
  );
}
