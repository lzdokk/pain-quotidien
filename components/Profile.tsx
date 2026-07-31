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
  const [reminder, setReminder] = useState(Boolean(profile?.wants_reading_reminder));
  const [hour, setHour] = useState<number>(profile?.reminder_hour ?? 18);

  const toggleReminder = async () => {
    const next = !reminder;
    setReminder(next);
    await supabase.from('profiles').update({ wants_reading_reminder: next }).eq('id', user.id);
  };

  const changeHour = async (h: number) => {
    setHour(h);
    await supabase.from('profiles').update({ reminder_hour: h }).eq('id', user.id);
  };

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
        <div className="mini" style={{ marginTop: 10 }}><strong>Jours d&rsquo;affilée</strong><span>{plan?.streak ?? 0}</span></div>
        <div className="mini" style={{ marginTop: 10 }}><strong>Notes enregistrées</strong><span>{notes.length}</span></div>
        <div className="mini" style={{ marginTop: 10 }}><strong>Versets surlignés</strong><span>{highlights.length}</span></div>

        <div className="mini" style={{ marginTop: 18, alignItems: 'center' }}>
          <strong>Rappel quotidien par email</strong>
          <button className="btn sm" onClick={toggleReminder}
                  style={{ background: reminder ? 'var(--accent)' : 'transparent',
                           color: reminder ? '#fff' : 'var(--ink-2)',
                           borderColor: reminder ? 'var(--accent)' : 'var(--line-2)' }}>
            {reminder ? 'Active' : 'Desactive'}
          </button>
        </div>
        {reminder && (
          <div className="mini" style={{ marginTop: 12, alignItems: 'center' }}>
            <strong>Heure du rappel</strong>
            <select className="field" style={{ width: 'auto', padding: '6px 10px' }}
                    value={hour} onChange={e => changeHour(Number(e.target.value))}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')} h 00</option>
              ))}
            </select>
          </div>
        )}
        <p className="fine" style={{ marginTop: 6 }}>
          Un message à l&rsquo;heure choisie si vous n&rsquo;avez pas encore lu, pour tenir votre série.
          Heure de Paris.
        </p>

        <button
          className="btn"
          style={{ marginTop: 20 }}
          onClick={async () => { await supabase.auth.signOut(); location.href = '/'; }}
        >
          Se déconnecter
        </button>
      </div>

      <h2 className="sect">Mon carnet de bord</h2>
      <p className="sub">Recherchez dans vos notes, par référence ou par mot-clé.</p>
      <div className="card" style={{ padding: '24px 30px' }}>
        <input className="field" type="search" value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Rechercher, par exemple grâce, Jean 3, pardon…" />
      </div>

      <div className="card pad" style={{ marginTop: 12 }}>
        {filtered.length === 0 ? (
          <p className="empty">
            {search ? 'Aucune note ne correspond a cette recherche.' : 'Rien pour l’instant. Ouvrez la Bible et notez ce qui vous parle.'}
          </p>
        ) : filtered.map((n: any) => (
          <div className="entry" key={n.id}>
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
          <p className="sub">L&rsquo;historique de ce que vous avez demandé.</p>
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
