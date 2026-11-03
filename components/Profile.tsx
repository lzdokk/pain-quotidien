'use client';
import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import SurlignesView from './SurlignesView';

function answerText(content: string) {
  try {
    const f = JSON.parse(content);
    return f.short_answer ?? content;
  } catch {
    return content;
  }
}

const norm = (s: string) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Un volet qui se déplie : titre, petite phrase, compteur. */
function Volet({ title, sub, count, children, defaultOpen = false }: {
  title: string; sub: string; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`card volet${open ? ' open' : ''}`}>
      <button className="volet-h" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="volet-t"><b>{title}</b><small>{sub}</small></span>
        {count !== undefined && <span className="volet-n">{count}</span>}
        <span className="volet-chev">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="volet-b">{children}</div>}
    </section>
  );
}

export default function Profile({ user, profile, plan, notes, highlights, conversations }: any) {
  const [search, setSearch] = useState('');
  const [qSearch, setQSearch] = useState('');
  const [openQ, setOpenQ] = useState<string | null>(null);
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
    const q = norm(search.trim());
    if (!q) return myNotes;
    return myNotes.filter((n: any) =>
      norm(n.reference).includes(q) || norm(n.body).includes(q) || norm(n.verse_text).includes(q));
  }, [myNotes, search]);

  // Mes questions : chaque question avec la réponse qui la suit.
  const questions = useMemo(() => conversations
    .filter((c: any) => c.role === 'user')
    .map((q: any) => {
      const rep = conversations.find((c: any) =>
        c.role === 'assistant' && new Date(c.created_at).getTime() >= new Date(q.created_at).getTime());
      return { id: String(q.id), q: q.content as string, a: rep ? answerText(rep.content) : '', at: q.created_at };
    }), [conversations]);
  const qFiltered = useMemo(() => {
    const q = norm(qSearch.trim());
    return q ? questions.filter((x: any) => norm(`${x.q} ${x.a}`).includes(q)) : questions;
  }, [questions, qSearch]);
  const fdate = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));

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

        <div className="mini" style={{ marginTop: 18, alignItems: 'center' }}>
          <strong>Rappel quotidien par email</strong>
          <button className="btn sm" onClick={toggleReminder}
                  style={{ background: reminder ? 'var(--accent)' : 'transparent',
                           color: reminder ? '#fff' : 'var(--ink-2)',
                           borderColor: reminder ? 'var(--accent)' : 'var(--line-2)' }}>
            {reminder ? 'Activé' : 'Désactivé'}
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

        <button className="btn" style={{ marginTop: 20 }}
                onClick={async () => { await supabase.auth.signOut(); location.href = '/'; }}>
          Se déconnecter
        </button>
      </div>

      <div className="volets">
        <Volet title="Mon carnet de bord" sub="Mes notes, par référence ou par mot" count={myNotes.length}>
          <input className="field" type="search" value={search}
                 onChange={e => setSearch(e.target.value)}
                 placeholder="Rechercher : grâce, Jean 3, pardon…" />
          <div className="volet-list">
            {filtered.length === 0 ? (
              <p className="empty">
                {search ? 'Aucune note ne correspond à cette recherche.' : 'Rien pour l’instant. Ouvrez la Bible et notez ce qui vous parle.'}
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
        </Volet>

        <Volet title="Mes versets coloriés" sub="Par catégorie, par livre ou par mot" count={highlights.length}>
          <SurlignesView items={highlights} userId={user.id} compact />
          <a className="btn sm" href="/surlignes" style={{ marginTop: 14 }}>Ouvrir en pleine page ›</a>
        </Volet>

        <Volet title="Mes questions" sub="Tout ce que j’ai demandé, avec les réponses" count={questions.length}>
          <input className="field" type="search" value={qSearch}
                 onChange={e => setQSearch(e.target.value)}
                 placeholder="Chercher dans mes questions et les réponses…" />
          <div className="volet-list">
            {qFiltered.length === 0 ? (
              <p className="empty">{qSearch ? 'Aucune question ne correspond.' : 'Aucune question pour l’instant.'}</p>
            ) : qFiltered.map((x: any) => (
              <div key={x.id} className={`qa${openQ === x.id ? ' open' : ''}`}>
                <button className="qa-q" onClick={() => setOpenQ(openQ === x.id ? null : x.id)}>
                  <span>{x.q}</span>
                  <small>{fdate(x.at)}</small>
                </button>
                {openQ === x.id && x.a && <div className="qa-a">{x.a}</div>}
              </div>
            ))}
          </div>
        </Volet>
      </div>
    </main>
  );
}
