'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * « Rendre disponible hors ligne » : pré-charge dans le cache du service worker
 * toute la Bible (version choisie), les pages de l'app et les fiches de cursus,
 * pour lire et étudier dans l'avion. Chaque chapitre est demandé exactement
 * comme le lecteur le demande, donc le cache correspond parfaitement.
 */
export default function OfflineDownload({ translation, translationName }:
  { translation: string; translationName?: string }) {
  const [books, setBooks] = useState<Array<{ id: number; chapters: number }>>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [pct, setPct] = useState(0);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !('serviceWorker' in navigator)) setSupported(false);
    supabase.from('books').select('id, chapters').order('id')
      .then(({ data }) => setBooks((data ?? []) as any));
    supabase.from('courses').select('code').eq('status', 'reviewed')
      .then(({ data }) => setCourses((data ?? []).map((c: any) => c.code)));
  }, []);

  async function run() {
    setState('running'); setPct(0);
    try {
      // 1) Toutes les pages fixes + fiches de cursus (HTML).
      const pages = ['/pain', '/priere', '/soir', '/lire', '/cursus', '/paraboles', '/versets',
        ...courses.map(c => `/cursus/${c}`)];
      // 2) Tous les chapitres de la version, demandes comme le lecteur.
      const chapters: Array<{ b: number; c: number }> = [];
      for (const bk of books) for (let c = 1; c <= bk.chapters; c++) chapters.push({ b: bk.id, c });

      const total = pages.length + chapters.length;
      let done = 0;
      const bump = () => { done++; if (done % 8 === 0 || done === total) setPct(Math.round(done / total * 100)); };

      // Pages, en douceur.
      for (const p of pages) {
        try { await fetch(p, { headers: { accept: 'text/html' }, credentials: 'include' }); } catch {}
        bump();
      }

      // Chapitres, en parallele modere (6 a la fois).
      let idx = 0;
      const worker = async () => {
        while (idx < chapters.length) {
          const j = chapters[idx++];
          try {
            await supabase.from('verses').select('verse, text')
              .eq('translation', translation).eq('book', j.b).eq('chapter', j.c).order('verse');
          } catch {}
          bump();
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));

      setPct(100); setState('done');
    } catch { setState('error'); }
  }

  if (!supported) return null;

  return (
    <div className="offline-dl">
      <div className="odl-txt">
        <b>Lire hors ligne (avion)</b>
        <span>Télécharge {translationName ?? 'cette version'}, les pages et le cursus sur cet appareil.</span>
      </div>
      {state === 'running' ? (
        <div className="odl-prog"><div className="odl-bar"><i style={{ width: `${pct}%` }} /></div><span>{pct}%</span></div>
      ) : state === 'done' ? (
        <span className="odl-done">✓ Disponible hors ligne</span>
      ) : (
        <button className="btn sm" onClick={run}>
          {state === 'error' ? 'Réessayer' : 'Télécharger'}
        </button>
      )}
    </div>
  );
}
