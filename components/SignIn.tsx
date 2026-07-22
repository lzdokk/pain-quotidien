'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const PROVIDERS = [
  { id: 'google',   label: 'Continuer avec Google' },
  { id: 'apple',    label: 'Continuer avec Apple' },
  { id: 'facebook', label: 'Continuer avec Facebook' }
] as const;

export default function SignIn({ next = '/' }: { next?: string }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;

  const oauth = (provider: 'google' | 'apple' | 'facebook') =>
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });

  const magic = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (!error) setSent(true);
  };

  return (
    <div className="signin">
      <h3>Votre carnet de bord</h3>
      <p className="muted">
        Vos notes, vos surlignages et votre progression, retrouves sur tous vos appareils.
      </p>

      {PROVIDERS.map(p => (
        <button key={p.id} className="btn" onClick={() => oauth(p.id)}>{p.label}</button>
      ))}

      {sent ? (
        <p className="muted" style={{ marginTop: 16 }}>
          Lien envoye. Ouvrez votre boite mail et cliquez pour vous connecter.
        </p>
      ) : (
        <form onSubmit={magic} style={{ marginTop: 12 }}>
          <input className="field" type="email" required placeholder="votre@email.fr"
                 value={email} onChange={e => setEmail(e.target.value)} />
          <button className="btn primary" type="submit" style={{ marginTop: 8 }}>
            Recevoir un lien de connexion
          </button>
        </form>
      )}

      <p className="fine">
        Aucune donnee revendue, aucun traceur publicitaire. Vous pouvez tout supprimer en un clic.
      </p>
    </div>
  );
}
