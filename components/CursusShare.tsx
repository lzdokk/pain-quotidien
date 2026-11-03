'use client';
import { useEffect, useState } from 'react';

type Member = { email: string; name: string | null; created_at: string };

/**
 * Panneau du responsable : partager l'accès au cursus avec ses frères et sœurs.
 *  - un lien d'invitation qui ouvre directement le cursus (code inclus) ;
 *  - une liste de personnes autorisées par email (entrée sans code une fois connectées) ;
 *  - le changement du code d'accès.
 */
export default function CursusShare() {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [code, setCode] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newCode, setNewCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const r = await fetch('/api/cursus/members');
    if (!r.ok) return;
    const j = await r.json();
    setMembers(j.members ?? []); setCode(j.code ?? null);
  };
  useEffect(() => { if (open) load(); }, [open]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const link = code ? `${origin}/cursus?acces=${encodeURIComponent(code)}` : `${origin}/cursus`;
  const invite = (who?: string | null) =>
    `${who ? `Shalom ${who} ! ` : 'Shalom ! '}Je t’ouvre l’accès aux cursus de formation biblique de Pain de Vie. ` +
    `Touche ce lien, il ouvre directement les cours :\n${link}` +
    (code ? `\n\nSi on te demande un code : ${code}` : '') +
    `\n\nQue le Seigneur te bénisse dans ta croissance 🙏`;

  const share = async (who?: string | null) => {
    const txt = invite(who); const nav: any = navigator;
    if (nav?.share) { try { await nav.share({ title: 'Accès au cursus', text: txt }); return; } catch { /* repli copie */ } }
    copy(txt);
  };
  const copy = async (txt: string) => {
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  const add = async () => {
    if (!email.trim()) return;
    setBusy(true); setMsg(null);
    const r = await fetch('/api/cursus/members', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg(j.error ?? 'Ajout impossible'); return; }
    setMsg(`${name || email} a maintenant accès au cursus ✓`);
    setName(''); setEmail(''); load();
  };

  const remove = async (e: string) => {
    await fetch(`/api/cursus/members?email=${encodeURIComponent(e)}`, { method: 'DELETE' });
    setMembers(m => m.filter(x => x.email !== e));
  };

  const saveCode = async () => {
    setBusy(true); setMsg(null);
    const r = await fetch('/api/cursus/members', {
      method: 'PATCH', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: newCode })
    });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg(j.error ?? 'Changement impossible'); return; }
    setCode(j.code); setNewCode(''); setMsg('Nouveau code enregistré ✓ Les anciens liens ne marchent plus.');
  };

  return (
    <div className={`card volet${open ? ' open' : ''}`} style={{ marginBottom: 20 }}>
      <button className="volet-h" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="volet-t">
          <b>Partager l&rsquo;accès</b>
          <small>Inviter mes frères et sœurs dans les cursus</small>
        </span>
        <span className="volet-chev">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="volet-b">
          <div className="cs-block">
            <div className="cs-k">1 · Le lien d&rsquo;invitation</div>
            <p className="fine">Il ouvre directement les cursus, sans taper de code.</p>
            <div className="cs-link">{link}</div>
            <div className="cs-actions">
              <button className="btn primary sm" onClick={() => share()}>Partager…</button>
              <a className="btn sm" target="_blank" rel="noreferrer"
                 href={`https://wa.me/?text=${encodeURIComponent(invite())}`}>WhatsApp</a>
              <a className="btn sm" href={`mailto:?subject=${encodeURIComponent('Accès aux cursus Pain de Vie')}&body=${encodeURIComponent(invite())}`}>Email</a>
              <button className="btn sm" onClick={() => copy(invite())}>{copied ? 'Copié ✓' : 'Copier'}</button>
            </div>
          </div>

          <div className="cs-block">
            <div className="cs-k">2 · Donner l&rsquo;accès par email</div>
            <p className="fine">Une fois connecté(e) au site avec cet email, la personne entre sans code, même si tu changes le code.</p>
            <div className="cs-form">
              <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom" />
              <input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)}
                     onKeyDown={e => { if (e.key === 'Enter') add(); }} placeholder="email@exemple.fr" />
              <button className="btn primary" onClick={add} disabled={busy || !email.trim()}>Ajouter</button>
            </div>
            {members.length > 0 && (
              <ul className="cs-members">
                {members.map(m => (
                  <li key={m.email}>
                    <span className="cs-who"><b>{m.name || m.email.split('@')[0]}</b><small>{m.email}</small></span>
                    <button className="btn sm" onClick={() => share(m.name)}>Inviter</button>
                    <button className="cs-x" aria-label="Retirer l'accès" onClick={() => remove(m.email)}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="cs-block">
            <div className="cs-k">3 · Le code d&rsquo;accès</div>
            <p className="fine">Code actuel : <b>{code ?? 'aucun (accès libre)'}</b></p>
            <div className="cs-form">
              <input className="field" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="Nouveau code" />
              <button className="btn" onClick={saveCode} disabled={busy || newCode.trim().length < 4}>Changer le code</button>
            </div>
          </div>

          {msg && <p className="cs-msg">{msg}</p>}
        </div>
      )}
    </div>
  );
}
