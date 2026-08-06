'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Musique de fond instrumentale (on/off), persistante d'une page à l'autre.
 * Placé dans le layout : l'audio continue pendant la navigation. La lecture
 * ne démarre qu'au clic (règle des navigateurs), donc pas de son surprise.
 *
 * Détection tolérante : on teste une liste de noms de fichiers courants dans
 * public/music/ et on garde ceux qui existent réellement. Nomme simplement ton
 * MP3 avec l'un de ces noms (paix.mp3, adoration.mp3, louange.mp3, 1.mp3…).
 */
const CANDIDATES = [
  'paix', 'adoration', 'contemplation', 'louange', 'priere', 'meditation',
  'worship', 'instrumental', 'musique', 'ambiance', 'fond', '1', '2', '3'
];
const NICE: Record<string, string> = {
  paix: 'Paix', adoration: 'Adoration', contemplation: 'Contemplation',
  louange: 'Louange', priere: 'Prière', meditation: 'Méditation',
  worship: 'Worship', instrumental: 'Instrumental', musique: 'Musique',
  ambiance: 'Ambiance', fond: 'Ambiance', '1': 'Piste 1', '2': 'Piste 2', '3': 'Piste 3'
};
const label = (b: string) => NICE[b] ?? (b.charAt(0).toUpperCase() + b.slice(1));

type Track = { src: string; name: string };

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[] | null>(null); // null = on teste
  const [playing, setPlaying] = useState(false);
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all(CANDIDATES.map(async b => {
      const src = `/music/${b}.mp3`;
      try { const r = await fetch(src, { method: 'HEAD' }); return r.ok ? { src, name: label(b) } : null; }
      catch { return null; }
    })).then(list => { if (alive) setTracks(list.filter(Boolean) as Track[]); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !tracks || !tracks[i]) return;
    a.src = tracks[i].src;
    a.loop = true; a.volume = 0.35;
    if (playing) a.play().catch(() => setPlaying(false));
  }, [i, tracks]); // eslint-disable-line react-hooks/exhaustive-deps

  if (tracks !== null && tracks.length === 0) return null; // aucun fichier en ligne
  if (tracks === null) return null; // en cours de test : on n'affiche encore rien

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else {
      a.src = a.src || tracks[i].src;
      a.loop = true; a.volume = 0.35;
      a.play().then(() => { setPlaying(true); setOpen(true); }).catch(() => setPlaying(false));
    }
  };
  const next = () => setI(v => (v + 1) % tracks.length);

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
          <span className="music-name">{playing ? '♪ ' : ''}{tracks[i].name}</span>
          {tracks.length > 1 && (
            <button className="music-next" onClick={next} aria-label="Piste suivante" title="Piste suivante">›</button>
          )}
          <button className="music-x" onClick={() => setOpen(false)} aria-label="Réduire">×</button>
        </div>
      )}
    </div>
  );
}
