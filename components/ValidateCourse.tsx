'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function ValidateCourse({ code, user, initial, next }:
  { code: string; user: any; initial: boolean; next?: { code: string; title: string } | null }) {
  const [done, setDone] = useState(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    if (!user) return alert('Connectez-vous pour enregistrer votre progression.');
    setSaving(true);
    if (done) {
      await supabase.from('course_progress').delete().eq('code', code);
      setDone(false);
      setSaving(false);
    } else {
      await supabase.from('course_progress').insert({ user_id: user.id, code });
      setDone(true);
      setSaving(false);
      // Enchaine directement sur le cours suivant, s'il existe.
      if (next?.code) {
        router.push(`/cursus/${next.code}`);
        router.refresh();
      }
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <div className="share-grid">
        <button className="btn primary" onClick={toggle} disabled={saving}>
          {saving ? 'Enregistrement…' : done ? 'Cours validé ✓' : 'Valider ce cours'}
        </button>
      </div>
      {done && next?.code && (
        <Link href={`/cursus/${next.code}`} className="to-pain" style={{ marginTop: 16 }}>
          <span className="tp-k">Cours suivant</span>
          <span className="tp-t">{next.title} ›</span>
        </Link>
      )}
      {done && !next?.code && (
        <p className="muted" style={{ marginTop: 16 }}>
          Bravo, tu as atteint le dernier cours disponible du cursus. 🎓
        </p>
      )}
    </div>
  );
}
