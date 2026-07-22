'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const BASE = "Seigneur, je te confie NOM. Tu le connais mieux que moi. Ote ce qui l'empeche de voir, mets sur sa route ceux qu'il faut, et prepare le moment. Donne-moi les mots justes et la patience de me taire quand il le faut. Que ta bonte le conduise a la repentance. Au nom de Jesus, amen.";

export default function Intercession({ user, initial }: { user: any; initial: string }) {
  const [name, setName] = useState(initial);

  const save = async (v: string) => {
    setName(v);
    if (user) await supabase.from('profiles').update({ intercession_name: v }).eq('id', user.id);
    else try { localStorage.setItem('pq-name', v); } catch {}
  };

  return (
    <div className="card pad">
      <span className="kicker">Une personne, un nom</span>
      <h3 style={{ marginTop: 6 }}>Priez pour quelqu&rsquo;un de precis</h3>
      <p style={{ marginTop: 10 }}>
        L&rsquo;evangelisation devient concrete le jour ou elle a un prenom.
        {user ? " Le nom est enregistre dans votre compte." : " Connectez-vous pour le retrouver sur tous vos appareils."}
      </p>
      <input className="field" style={{ marginTop: 12 }} value={name}
             onChange={e => save(e.target.value)} autoComplete="off"
             placeholder="Le prenom de la personne pour qui vous priez" />
      <div className="prayer" style={{ marginTop: 18 }}>
        <span className="kicker">Priere d&rsquo;intercession</span>
        <p>{BASE.replace('NOM', name.trim() || 'cette personne')}</p>
      </div>
    </div>
  );
}
