'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

const LIMIT = 8;

type Msg = { role: 'me' | 'bot'; html: string; src?: string };

export default function QuestionBrowser({ faq, user, used }: any) {
  const [cat, setCat] = useState('Tout');
  const [q, setQ] = useState('');
  const [input, setInput] = useState('');
  const [log, setLog] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(Math.max(0, LIMIT - used));

  const cats = useMemo(() => ['Tout', ...Array.from(new Set(faq.map((f: any) => f.category)))], [faq]);
  const list = faq.filter((f: any) =>
    (cat === 'Tout' || f.category === cat) &&
    (!q || `${f.question} ${f.short_answer}`.toLowerCase().includes(q.toLowerCase())));

  const send = async () => {
    const question = input.trim();
    if (!question || busy) return;
    if (!user) return alert('Connectez-vous pour poser une question.');
    setInput(''); setBusy(true);
    setLog(l => [...l, { role: 'me', html: question }]);

    const r = await fetch('/api/ask', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const d = await r.json();

    if (d.source === 'faq') {
      const f = d.answer;
      setLog(l => [...l, {
        role: 'bot', src: 'Base de questions, réponse gratuite',
        html: `<b>${f.question}</b><br><br>${f.short_answer}<div class="par">${f.parable}</div>${f.body[0]}
               <br><br><span class="ref-inline">${f.verses.join(' · ')}</span>
               <br><a href="/questions/${f.id}">Lire la réponse complète</a>`
      }]);
    } else if (d.source === 'none') {
      setLog(l => [...l, { role: 'bot', html: d.message, src: 'Question enregistree' }]);
    } else if (d.source === 'quota') {
      setLog(l => [...l, { role: 'bot', html: d.message, src: 'Quota atteint' }]);
      setRemaining(0);
    } else {
      setLog(l => [...l, {
        role: 'bot', src: 'Assistant · 1 question decomptee',
        html: String(d.answer).replace(/\n\n/g, '<br><br>')
      }]);
      setRemaining(d.remaining ?? Math.max(0, remaining - 1));
    }
    setBusy(false);
  };

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Questions</div>
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

      <h2 className="sect">L&rsquo;assistant</h2>
      <p className="sub">Pour une question qui n&rsquo;est pas dans la base, ou pour approfondir un verset précis.</p>

      <div className="chatbox">
        <div className="quota">
          <span className="qd">
            {Array.from({ length: LIMIT }, (_, i) => <i key={i} className={i < remaining ? '' : 'off'} />)}
          </span>
          <span>{remaining} question{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} aujourd&rsquo;hui</span>
        </div>

        {log.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <span dangerouslySetInnerHTML={{ __html: m.html }} />
            {m.src && <span className="src">{m.src}</span>}
          </div>
        ))}
        {busy && <div className="msg bot"><i>Reflexion en cours…</i></div>}

        <textarea className="field" style={{ marginTop: 14 }} value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Votre question. Par exemple : je lis Jean 1.14, que veut dire « la Parole a été faite chair » ?" />
        <div className="share-grid" style={{ marginTop: 10, gridTemplateColumns: '1fr auto' }}>
          <button className="btn primary" onClick={send} disabled={busy}>Envoyer</button>
        </div>
      </div>
    </main>
  );
}
