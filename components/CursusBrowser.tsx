'use client';
import { useState } from 'react';
import Link from 'next/link';

const KIND: Record<string, string> = { E: 'Exegese', D: 'Doctrine', P: 'Pratique', G: 'Langue' };

export default function CursusBrowser({ levels, groups, courses, done, user }: any) {
  const [level, setLevel] = useState(levels[0]?.id);
  const [validated] = useState<Set<string>>(new Set(done));

  const total = courses.length;
  const hours = courses.reduce((a: number, c: any) => a + c.hours, 0);
  const doneCount = courses.filter((c: any) => validated.has(c.code)).length;
  const doneHours = courses.filter((c: any) => validated.has(c.code)).reduce((a: number, c: any) => a + c.hours, 0);

  const L = levels.find((l: any) => l.id === level) ?? levels[0];
  const myGroups = groups.filter((g: any) => g.level_id === L?.id);
  const inLevel = courses.filter((c: any) => myGroups.some((g: any) => g.id === c.group_id));

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Cursus théologique</div>
        <h1>Un cursus complet,<br />dans l&rsquo;ordre</h1>
        <p className="lede">
          {total} cours, du niveau Base a l&rsquo;Approfondissement, plus le grec ancien.
          La progression d&rsquo;un institut biblique, a votre rythme.
        </p>
      </header>

      <div className="card pad">
        <span className="kicker">Votre progression</span>
        <h3 style={{ marginTop: 6 }}>{doneCount} cours valide{doneCount > 1 ? 's' : ''} sur {total}</h3>
        <div className="progress-wrap">
          <div className="bar"><i style={{ width: `${Math.round(doneCount / total * 100)}%` }} /></div>
          <span className="pct">{Math.round(doneCount / total * 100)} %</span>
        </div>
        <div className="grid2" style={{ marginTop: 18 }}>
          <div className="mini"><strong>Volume horaire</strong><span>{doneHours} h suivies sur {hours} h au total</span></div>
          <div className="mini"><strong>Rythme conseille</strong><span>Deux cours par mois, soit environ six ans pour le cursus entier</span></div>
        </div>
        {!user && <div className="banner" style={{ marginTop: 18 }}>
          <span>☁︎</span><div><b>Connectez-vous</b> pour enregistrer les cours valides et les retrouver partout.</div>
        </div>}
      </div>

      <div className="chips" style={{ margin: '26px 0 0' }}>
        {levels.map((l: any) => (
          <button key={l.id} className="chip" aria-selected={l.id === level} onClick={() => setLevel(l.id)}>
            {l.name}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="lvl-head">
          <div className="ln2">{inLevel.filter((c: any) => validated.has(c.code)).length} / {inLevel.length} cours</div>
          <h3>{L?.name}</h3>
          <div className="ls">{L?.subtitle}</div>
          <div className="li">{L?.intro}</div>
        </div>

        {myGroups.map((g: any) => (
          <div key={g.id}>
            {g.name && <div className="grp">{g.name}</div>}
            {courses.filter((c: any) => c.group_id === g.id).map((c: any) => {
              const ok = validated.has(c.code);
              const ready = c.status === 'reviewed';
              return (
                <Link key={c.code} href={`/cursus/${c.code}`}
                      className={`course${ok ? ' done' : ''}${ready ? ' ready' : ''}`}>
                  <span className="code">{ok ? '✓' : c.code}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="ct">{c.title}</span>
                    <span className="cp">{c.hook}{ready ? '' : ' · fiche a venir'}</span>
                  </span>
                  <span className="ctype">{KIND[c.kind]} · {c.hours} h</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}
