'use client';
import { useState } from 'react';

export default function Lexique() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [entry, setEntry] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    if (q.trim().length < 2) return;
    setBusy(true); setEntry(null);
    const r = await fetch(`/api/strongs?q=${encodeURIComponent(q.trim())}`);
    const j = await r.json();
    setResults(j.results ?? []); setBusy(false);
  };

  const open = async (code: string) => {
    setBusy(true);
    const r = await fetch(`/api/strongs?code=${code}`);
    setEntry(await r.json()); setBusy(false);
  };

  return (
    <>
      <div className="card" style={{ padding: '24px 30px' }}>
        <input className="field" type="search" value={q}
               onChange={e => setQ(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter') search(); }}
               placeholder="Un mot français, grec ou hébreu, ou un numéro (agape, hesed, G26...)" />
        <button className="btn primary" style={{ marginTop: 10 }} onClick={search} disabled={busy}>
          {busy ? 'Recherche…' : 'Chercher dans le lexique'}
        </button>
      </div>

      {entry && (
        <div className="card pad" style={{ marginTop: 12 }}>
          <span className="kicker">{entry.lang} · {entry.code}</span>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 30, marginTop: 6 }}>{entry.lemma}</h3>
          <p className="muted" style={{ fontSize: 16 }}>{entry.translit}</p>

          {entry.definition_fr ? (
            <>
              <h4 style={{ marginTop: 20 }}>Le sens</h4>
              <p>{entry.definition_fr}</p>
            </>
          ) : (
            <p className="fine" style={{ marginTop: 16 }}>
              La mise en français de cette entrée n&rsquo;a pas pu être produite
              (limite quotidienne atteinte). La définition d&rsquo;origine reste
              consultable ci-dessous, et le français sera ajouté au prochain passage.
            </p>
          )}
          {entry.derivation && (
            <>
              <h4 style={{ marginTop: 18 }}>Étymologie</h4>
              <p style={{ color: 'var(--ink-2)' }}>{entry.derivation}</p>
            </>
          )}
          {entry.definition_en && (
            <>
              <h4 style={{ marginTop: 18 }}>Définition de Strong</h4>
              <p style={{ color: 'var(--ink-3)', fontSize: 14.5 }}>{entry.definition_en}</p>
            </>
          )}
          {entry.kjv_def && (
            <p className="fine" style={{ marginTop: 14 }}>Traduit par : {entry.kjv_def}</p>
          )}
          <button className="btn" style={{ marginTop: 18 }} onClick={() => setEntry(null)}>
            Retour aux résultats
          </button>
        </div>
      )}

      {!entry && results !== null && (
        <div className="card pad" style={{ marginTop: 12 }}>
          {results.length === 0 ? (
            <div>
              <p className="empty">Aucune entrée ne correspond à « {q} ».</p>
              <p className="fine" style={{ marginTop: 10 }}>
                La concordance de Strong est rédigée en anglais à l&rsquo;origine. Cherchez
                plutôt par le mot translittéré (<i>agape</i>, <i>hesed</i>, <i>logos</i>,
                <i> shalom</i>, <i>pistis</i>) ou par son numéro (<i>G26</i>, <i>H2617</i>).
                Le sens français est produit à l&rsquo;ouverture de la fiche.
              </p>
            </div>
          ) : results.map(r => (
            <div className="entry" key={r.code} style={{ cursor: 'pointer' }} onClick={() => open(r.code)}>
              <div className="eref">{r.lemma} · {r.translit} <span className="muted">({r.code}, {r.lang})</span></div>
              <div className="enote">{r.definition_fr ?? r.definition_en}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
