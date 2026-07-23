'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

function messageErreur(code?: string) {
  switch (code) {
    case 'invalid_credentials':
      return 'Email ou mot de passe incorrect.';
    case 'user_already_exists':
      return 'Un compte existe deja avec cet email. Connectez-vous plutot.';
    case 'weak_password':
      return 'Le mot de passe doit contenir au moins 6 caracteres.';
    default:
      return 'Une erreur est survenue. Reessayez.';
  }
}

export default function SignIn({ user }: { user?: any }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <div className="signin">
        <h3>Votre compte</h3>
        <p className="muted">Connecte en tant que {user.email}</p>
        <button
          className="btn"
          style={{ marginTop: 12 }}
          onClick={async () => { await supabase.auth.signOut(); location.reload(); }}
        >
          Se deconnecter
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setError(messageErreur(error.code)); return; }
      location.reload();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) { setError(messageErreur(error.code)); return; }
      setSent(true);
    }
  };

  return (
    <div className="signin">
      <h3>Votre carnet de bord</h3>
      <p className="muted">
        Vos notes, vos surlignages et votre progression, retrouves sur tous vos appareils.
      </p>

      {sent ? (
        <p className="muted" style={{ marginTop: 16 }}>
          Compte cree. Verifiez votre boite mail pour confirmer votre adresse, puis connectez-vous.
        </p>
      ) : (
        <form onSubmit={submit} style={{ marginTop: 12 }}>
          <input className="field" type="email" required placeholder="votre@email.fr"
                 value={email} onChange={e => setEmail(e.target.value)} />
          <input className="field" type="password" required minLength={6} placeholder="Mot de passe"
                 value={password} onChange={e => setPassword(e.target.value)}
                 style={{ marginTop: 8 }} />

          {error && <p className="muted" style={{ color: '#b3413a', marginTop: 8 }}>{error}</p>}

          <button className="btn primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Un instant...' : mode === 'login' ? 'Se connecter' : 'Creer mon compte'}
          </button>

          <button
            type="button"
            className="btn"
            style={{ marginTop: 8 }}
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Deja un compte ? Se connecter'}
          </button>
        </form>
      )}

      <p className="fine">
        Aucune donnee revendue, aucun traceur publicitaire. Vous pouvez tout supprimer en un clic.
      </p>
    </div>
  );
}
