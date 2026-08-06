'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Musique de fond instrumentale (on/off), persistante d'une page à l'autre.
 * Placé dans le layout : l'audio continue pendant la navigation. La lecture
 * ne démarre qu'au clic (règle des navigateurs), donc pas de son surprise.
 *
 * Dépose tes fichiers dans public/music/ et déclare-les ci-dessous.
 */
const TRACKS: { src: string; name: string }[] = [
  { src: '/music/paix.mp3', name: 'Paix' },
  { src: '/music/adoration.mp3', name: 'Adoration' },
  { src: '/music/contemplation.mp3', name: 'Contemplation' }
];

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState<boolean | null>(null); // null = on teste
  const [playing, setPlaying] = useState(false);
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);

  // Volume mémorisé + piste mémorisée.
  useEffect(() => {
    try {
      const vi = Number(localStorage.getItem('pq-music-track'));
      if (!Number.isNaN(vi) && vi >= 0 && vi < TRACKS.length) setI(vi);
    } catch { /* ignore */ }

    // On vérifie qu'au moins une piste existe (sinon on masque le bouton).
    fetch(TRACKS[0].src, { method: 'HEAD' })
      .then(r => setReady(r.ok))
      .catch(() => setReady(false));
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = TRACKS[i].src;
    a.loop = true;
    a.volume = 0.35;
    try { localStorage.setItem('pq-music-track', String(i)); } catch { /* ignore */ }
    if (playing) a.play().catch(() => setPlaying(false));
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else {
      a.src = a.src || TRACKS[i].src;
      a.loop = true; a.volume = 0.35;
      a.play().then(() => { setPlaying(true); setOpen(true); }).catch(() => setPlaying(false));
    }
  };

  const next = () => setI(v => (v + 1) % TRACKS.length);

  if (ready === false) return null; // aucun fichier audio en ligne : on n'affiche rien

  return (
    <div className={`music${open ? ' open' : ''}`}>
      <audio ref={audioRef} preload="none" />
      <button className="music-fab" onClick={toggle}
              aria-label={playing ? 'Couper la musique' : 'Musique de fond'}
              title={playing ? 'Couper la musique' : 'Musique de fond'}>
        {playing ? '❚❚' : '♪'}
      </button>
      {open && (
        <div className="music-panel">
          <span className="music-name">{playing ? '♪ ' : ''}{TRACKS[i].name}</span>
          {TRACKS.length > 1 && (
            <button className="music-next" onClick={next} aria-label="Piste suivante" title="Piste suivante">›</button>
          )}
          <button className="music-x" onClick={() => setOpen(false)} aria-label="Réduire">×</button>
        </div>
      )}
    </div>
  );
}
