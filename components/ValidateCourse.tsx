'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function ValidateCourse({ code, user, initial }:
  { code: string; user: any; initial: boolean }) {
  const [done, setDone] = useState(initial);

  const toggle = async () => {
    if (!user) return alert('Connectez-vous pour enregistrer votre progression.');
    if (done) await supabase.from('course_progress').delete().eq('code', code);
    else await supabase.from('course_progress').insert({ user_id: user.id, code });
    setDone(!done);
  };

  return (
    <div className="share-grid" style={{ marginTop: 24 }}>
      <button className="btn primary" onClick={toggle}>
        {done ? 'Cours valide ✓' : 'Valider ce cours'}
      </button>
    </div>
  );
}
