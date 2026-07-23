'use client';
import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

function answerText(content: string) {
  try {
    const f = JSON.parse(content);
    return f.short_answer ?? content;
  } catch {
    return content;
  }
}

export default function Profile({ user, profile, plan, notes, highlights, conversations }: any) {
  const [search, setSearch] = useState('');
  const [myNotes, setMyNotes] = useState(notes);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return myNotes;
    return myNotes.filter((n: any) =>
      n.reference?.toLowerCase().includes(q) ||
      n.body?.toLowerCase().includes(q) ||
      n.verse_text?.toLowerCase().includes(q));
  }, [myNotes, search]);

  const questions = conversations.filter((c: any) => c.role === 'user');

  return (
    <main className="wrap">
      <header className="hero">
        <div className="eyebrow">Mon profil</div>
        <h1>{profile?.display_name || user.email}</h1>
        <p className="lede">{user.email}</p>
      </header>

      <div className="card pad">
        <div className="mini"><strong>Parcours en cours</strong><span>{plan?.reading_plans?.name ?? 'Aucun parcours choisi'}</span></div>
        <div className="mini" style={{ marginTop: 10 }}><strong>Jour</strong><span>{plan?.current_day ?? 1}</span></div>
        <div className="mini" style={{ marginTop: 10 }}><strong>Jours d&rsquo;affilee</strong><span>{plan?.streak ?? 0}</span></div>
        <div className="mini" style={{ marginTop: 10 }}><strong>Notes enregistrees</strong><span>{notes.length}</span></div>
        <div className="mini" style={{ marginTop: 10 }}><strong>Versets surlignes</strong><span>{highlights.length}</span></div>

        <button
          className="btn"
          style={{ marginTop: 20 }}
          onClick={async () => { await supabase.auth.signOut(); location.href = '/'; }}
        >
          Se deconnecter
        </button>
      </div>

      <h2 className="sect">Mon carnet de bord</h2>
      <p className="sub">Recherchez dans vos notes, par reference ou par mot-cle.</p>
      <div className="card" style={{ padding: '24px 30px' }}>
        <input className="field" type="search" value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Rechercher, par exemple grace, Jean 3, pardon…" />
      </div>

      <div className="card pad" style={{ marginTop: 12 }}>
        {filtered.length === 0 ? (
          <p className="empty">
            {search ? 'Aucune note ne correspond a cette recherche.' : 'Rien pour l’instant. Ouvrez la Bible et notez ce qui vous parle.'}
          </p>
        ) : filtered.map((n: any) => (
          <div clame="entry" key={n.id}>
            <div className="eref">{n.reference}</div>
            <div className="etext">{n.verse_text}</div>
            <div className="enote">{n.body}</div>
            <button className="edel" onClick={async () => {
              await supabase.from('notes').delete().eq('id', n.id);
              setMyNotes((l: any[]) => l.filter(x => x.id !== n.id));
            }}>Supprimer</button>
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <>
          <h2 className="sect">Mes questions</h2>
          <p className="sub">L&rsquo;historique de ce que vous avez demande.</p>
          <div className="card pad">
            {questions.map((q: any) => {
              const rep = conversations.find((c: any) =>
                c.role === 'assistant' &&
                new Date(c.created_at).getTime() >= new Date(q.created_at).getTime());
              return (
                <div className="entry" key={q.id}>
                  <div className="eref">{q.content}</div>
                  {rep && <div className="enote">{answerText(rep.content)}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
