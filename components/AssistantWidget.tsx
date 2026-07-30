'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const LIMIT = 8;
type Msg = { role: 'me' | 'bot'; html: string; src?: string };

/**
 * Bouton flottant global (present sur toutes les pages via app/layout.tsx),
 * qui ouvre un mini-chat vers /api/ask sans quitter la page. Reprend la
 * meme logique que components/QuestionBrowser.tsx, en plus compact.
 */
export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [log, setLog] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (u) {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await supabase.from('ai_usage').select('count').eq('day', today).maybeSingle();
        setRemaining(Math.max(0, LIMIT - (data?.count ?? 0)));
      }
    })();
  }, []);

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
        html: `<b>${f.question}</b><br><br>${f.short_answer}
               <br><br><a href="/questions/${f.id}">Lire la réponse complète</a>`
      }]);
    } else if (d.source === 'none') {
      setLog(l => [...l, { role: 'bot', html: d.message, src: 'Question enregistrée' }]);
    } else if (d.source === 'quota') {
      setLog(l => [...l, { role: 'bot', html: d.message, src: 'Quota atteint' }]);
      setRemaining(0);
    } else {
      setLog(l => [...l, {
        role: 'bot', src: 'Assistant',
        html: String(d.answer ?? '').replace(/\n\n/g, '<br><br>')
      }]);
      setRemaining(d.remaining ?? null);
    }
    setBusy(false);
  };

  return (
    <>
      <button className={`af-btn${open ? ' on' : ''}`} onClick={() => setOpen(o => !o)}
              aria-label="Mon assistant">
        <span className="af-ico">{open ? '×' : '💬'}</span>
        <span className="af-label">Mon assistant</span>
      </button>

      {open && (
        <div className="af-panel">
          <div className="af-head">
            <b>Mon assistant</b>
            {remaining !== null && (
              <span className="af-quota">{remaining} question{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} aujourd&rsquo;hui</span>
            )}
          </div>

          <div className="af-log">
            {log.length === 0 && (
              <p className="empty" style={{ padding: '10px 2px' }}>
                Une question de foi, un verset a comprendre ? Ecrivez-la ici.
              </p>
            )}
            {log.map((m, i) => (
              <div key={i} className={`msg ${m.role}`} style={{ marginLeft: m.role === 'me' ? 20 : 0, marginRight: m.role === 'bot' ? 6 : 0 }}>
                <span dangerouslySetInnerHTML={{ __html: m.html }} />
                {m.src && <span className="src">{m.src}</span>}
              </div>
            ))}
            {busy && <div className="msg bot"><i>Réflexion en cours…</i></div>}
          </div>

          <div className="af-input">
            <textarea className="field" value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                      placeholder={user ? 'Votre question…' : 'Connectez-vous pour poser une question.'} />
            <button className="btn primary sm" onClick={send} disabled={busy}>Envoyer</button>
          </div>
        </div>
      )}
    </>
  );
}
