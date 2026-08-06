'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import LearnTabs from './LearnTabs';

export default function QuestionBrowser({ faq }: any) {
  const [cat, setCat] = useState('Tout');
  const [q, setQ] = useState('');

  const cats = useMemo(() => ['Tout', ...Array.from(new Set(faq.map((f: any) => f.category)))], [faq]);
  const list = faq.filter((f: any) =>
    (cat === 'Tout' || f.category === cat) &&
    (!q || `${f.question} ${f.short_answer}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <main className="wrap">
      <LearnTabs />
      <header className="hero">
        <div className="eyebrow">Apprendre · Questions</div>
        <h1>Les questions<br />que tout le monde<br />se pose</h1>
        <p className="lede">{faq.length} réponses déjà redigees, chacune avec une parabole. Et si la votre n&rsquo;y est pas, posez-la.</p>
      </header>

      <div className="card pad">
        <input className="field" type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Chercher une question, par exemple « souffrance » ou « enfer »" />
        <div className="chips" style={{ marginTop: 16 }}>
          {cats.map((c: any) => (
            <button key={c} className="chip" aria-selected={c === cat} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {list.map((f: any, i: number) => (
          <div className="faq-item" key={f.id}>
            <Link href={`/questions/${f.id}`} className="faq-q">
              <span className="qi">{i + 1}</span>
              <span><span className="qt">{f.question}</span><span className="qc">{f.category}</span></span>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
