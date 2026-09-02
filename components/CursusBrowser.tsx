'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { relabelCode } from '@/lib/cursus-code';
import { courseTitle } from '@/lib/course-titles';

const KIND: Record<string, string> = { E: 'Exegese', D: 'Doctrine', P: 'Pratique', G: 'Langue' };

export default function CursusBrowser({ cursus, levels, groups, courses, done, user, isAdmin }: any) {
  const [validated] = useState<Set<string>>(new Set(done));
  const [curId, setCurId] = useState<string>(cursus[0]?.id);
  const [level, setLevel] = useState<string | undefined>(undefined);
  const [gateOk, setGateOk] = useState(false);
  const [code, setCode] = useState('');
  const [err, setErr] = useState(false);
  const [checking, setChecking] = useState(false);
  const currentRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    try { if (localStorage.getItem('pq-cursus-gate') === '1') setGateOk(true); } catch {}
  }, []);

  // Toute la section Cursus est verrouillée si au moins un cursus a un code.
  const sectionLocked = cursus.some((c: any) => c.locked);
  const access = isAdmin || !sectionLocked || gateOk;

  const cur = cursus.find((c: any) => c.id === curId) ?? cursus[0];
  const myLevels = levels.filter((l: any) => l.cursus_id === cur?.id);
  const levelIds = new Set(myLevels.map((l: any) => l.id));
  const myGroups = groups.filter((g: any) => levelIds.has(g.level_id));
  const groupIds = new Set(myGroups.map((g: any) => g.id));
  const myCourses = courses.filter((c: any) => groupIds.has(c.group_id));

  useEffect(() => { setLevel(myLevels[0]?.id); /* eslint-disable-next-line */ }, [curId]);

  const current = myCourses.find((c: any) => !validated.has(c.code)) ?? null;
  useEffect(() => {
    if (access && currentRef.current) {
      const t = setTimeout(() => currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
      return () => clearTimeout(t);
    }
  }, [access, curId, level]);

  const submitCode = async () => {
    if (!code.trim()) return;
    setChecking(true); setErr(false);
    try {
      const r = await fetch('/api/cursus/unlock', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const j = await r.json();
      if (j.ok) { setGateOk(true); try { localStorage.setItem('pq-cursus-gate', '1'); } catch {} setCode(''); }
      else setErr(true);
    } catch { setErr(true); }
    setChecking(false);
  };

  const total = myCourses.length;
  const doneCount = myCourses.filter((c: any) => validated.has(c.code)).length;
  const hours = myCourses.reduce((a: number, c: any) => a + (c.hours || 0), 0);
  const L = myLevels.find((l: any) => l.id === level) ?? myLevels[0];
  const lvlGroups = myGroups.filter((g: any) => g.level_id === L?.id);
  const lvlCourses = myCourses.filter((c: any) => lvlGroups.some((g: any) => g.id === c.group_id));

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Cursus</div>
        <h1>Se former,<br />dans l&rsquo;ordre</h1>
        <p className="lede">Plusieurs cursus pour grandir, à votre rythme.</p>
      </header>

      {/* Porte d'entrée : un seul code pour toute la section */}
      {!access && (
        <div className="card pad" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 34 }}>🔒</div>
          <h3 style={{ marginTop: 8 }}>Accès aux cursus</h3>
          <p className="muted" style={{ marginTop: 6 }}>Entrez le code communiqué par le responsable.</p>
          <div style={{ maxWidth: 280, margin: '16px auto 0' }}>
            <input className="field" value={code} onChange={e => { setCode(e.target.value); setErr(false); }}
                   placeholder="Code d&rsquo;accès" onKeyDown={e => { if (e.key === 'Enter') submitCode(); }} />
            {err && <p className="muted" style={{ color: '#b3413a', marginTop: 8 }}>Code incorrect.</p>}
            <button className="btn primary" style={{ marginTop: 10, width: '100%' }}
                    onClick={submitCode} disabled={checking || !code.trim()}>
              {checking ? 'Vérification…' : 'Déverrouiller'}
            </button>
          </div>
        </div>
      )}

      {access && (
        <>
          <div className="chips" style={{ margin: '0 0 20px' }}>
            {cursus.map((c: any) => (
              <button key={c.id} className="chip" aria-selected={c.id === curId} onClick={() => setCurId(c.id)}>
                {c.name}
              </button>
            ))}
          </div>

          <div className="card pad">
            {cur?.subtitle && <span className="kicker">{cur.subtitle}</span>}
            <h3 style={{ marginTop: 6 }}>{cur?.name}</h3>
            {total > 0 && (
              <>
                <div className="progress-wrap" style={{ marginTop: 14 }}>
                  <div className="bar"><i style={{ width: `${Math.round(doneCount / total * 100)}%` }} /></div>
                  <span className="pct">{Math.round(doneCount / total * 100)} %</span>
                </div>
                <div className="mini" style={{ marginTop: 14 }}>
                  <strong>{doneCount} / {total} cours</strong><span>{hours ? `${hours} h indicatives` : ''}</span>
                </div>
              </>
            )}
            {cur?.source_url && (
              <a className="btn sm" style={{ marginTop: 14 }} href={cur.source_url} target="_blank" rel="noreferrer">
                Site officiel ›
              </a>
            )}
            {!user && (
              <div className="banner" style={{ marginTop: 16 }}>
                <span>☁︎</span><div><b>Connectez-vous</b> pour enregistrer votre progression.</div>
              </div>
            )}
          </div>

          {myLevels.length > 1 && (
            <div className="chips" style={{ margin: '22px 0 0' }}>
              {myLevels.map((l: any) => (
                <button key={l.id} className="chip" aria-selected={l.id === level} onClick={() => setLevel(l.id)}>
                  {l.name}
                </button>
              ))}
            </div>
          )}

          {L && (
            <div className="card">
              <div className="lvl-head">
                <div className="ln2">{lvlCourses.filter((c: any) => validated.has(c.code)).length} / {lvlCourses.length} cours</div>
                <h3>{L.name}</h3>
                <div className="ls">{L.subtitle}</div>
                <div className="li">{L.intro}</div>
              </div>

              {lvlGroups.map((g: any) => (
                <div key={g.id}>
                  {g.name && <div className="grp">{g.name}</div>}
                  {myCourses.filter((c: any) => c.group_id === g.id).map((c: any) => {
                    const ok = validated.has(c.code);
                    const ready = c.status === 'reviewed';
                    const isCurrent = current?.code === c.code;
                    return (
                      <Link key={c.code} href={`/cursus/${c.code}`}
                            ref={isCurrent ? currentRef : undefined}
                            className={`course${ok ? ' done' : ''}${ready ? ' ready' : ''}${isCurrent ? ' current' : ''}`}>
                        <span className="code">{ok ? '✓' : relabelCode(c.code)}</span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span className="ct">{courseTitle(c.code, c.title)}{isCurrent && <span className="course-here">Reprendre ici</span>}</span>
                          <span className="cp">{c.hook}{ready ? '' : ' · fiche a venir'}</span>
                        </span>
                        <span className="ctype">{KIND[c.kind]}{c.hours ? ` · ${c.hours} h` : ''}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
