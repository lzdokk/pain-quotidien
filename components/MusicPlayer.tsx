'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Musique de fond instrumentale, persistante d'une page à l'autre (placé dans
 * le layout). Lecture au clic (pas de son surprise). Choix du titre + curseur
 * de temps (utile pour les longues pistes). Détection tolérante des fichiers
 * présents dans public/music/.
 */
const CANDIDATES = [
  'paix', 'adoration', 'contemplation', 'louange', 'priere', 'meditation',
  'worship', 'instrumental', 'musique', 'ambiance', 'fond', '1', '2', '3', '4', '5'
];
const NICE: Record<string, string> = {
  paix: 'Paix', adoration: 'Adoration', contemplation: 'Contemplation',
  louange: 'Louange', priere: 'Prière', meditation: 'Méditation',
  worship: 'Worship', instrumental: 'Instrumental', musique: 'Musique',
  ambiance: 'Ambiance', fond: 'Ambiance'
};
const label = (b: string) => NICE[b] ?? (/^\d+$/.test(b) ? `Piste ${b}` : b.charAt(0).toUpperCase() + b.slice(1));
const fmt = (s: number) => {
  s = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? h + ':' : ''}${mm}:${String(sec).padStart(2, '0')}`;
};

type Track = { src: string; name: string };

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [playing, setPlaying] = useState(false);
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all(CANDIDATES.map(async b => {
      const src = `/music/${b}.mp3`;
      try { const r = await fetch(src, { method: 'HEAD' }); return r.ok ? { src, name: label(b) } : null; }
      catch { return null; }
    })).then(list => { if (alive) setTracks(list.filter(Boolean) as Track[]); });
    return () => { alive = false; };
  }, []);

  // Change de piste : recharge la source, remet le temps à 0, joue si en lecture.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !tracks || !tracks[i]) return;
    a.src = tracks[i].src;
    a.loop = true; a.volume = 0.4;
    setCur(0); setDur(0);
    if (playing) a.play().catch(() => setPlaying(false));
  }, [i, tracks]); // eslint-disable-line react-hooks/exhaustive-deps

  if (tracks === null || tracks.length === 0) return null;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else {
      a.src = a.src || tracks[i].src;
      a.loop = true; a.volume = 0.4;
      a.play().then(() => { setPlaying(true); setOpen(true); }).catch(() => setPlaying(false));
    }
  };
  const choose = (idx: number) => {
    if (idx === i) { setOpen(true); return; }
    setPlaying(true); setI(idx); setOpen(true);
  };
  const seek = (t: number) => {
    const a = audioRef.current;
    if (a) { a.currentTime = t; setCur(t); }
  };

  return (
    <div className={`music${open ? ' open' : ''}`}>
      <audio ref={audioRef} preload="metadata"
             onTimeUpdate={e => setCur(e.currentTarget.currentTime)}
             onLoadedMetadata={e => setDur(e.currentTarget.duration || 0)} />

      <button className="music-fab" onClick={() => (open ? toggle() : setOpen(true))}
              aria-label="Musique de fond" title="Musique de fond">
        {playing ? '❚❚' : '♪'}
      </button>

      {open && (
        <div className="music-panel">
          <div className="music-top">
            <button className="music-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Lecture'}>
              {playing ? '❚❚' : '►'}
            </button>
            <span className="music-name">{tracks[i].name}</span>
            <button className="music-x" onClick={() => setOpen(false)} aria-label="Réduire">×</button>
          </div>

          <div className="music-seek">
            <input type="range" min={0} max={dur || 0} step={1} value={Math.min(cur, dur || 0)}
                   onChange={e => seek(+e.target.value)} aria-label="Position dans la piste" />
            <div className="music-time"><span>{fmt(cur)}</span><span>{dur ? fmt(dur) : '—'}</span></div>
          </div>

          {tracks.length > 1 && (
            <div className="music-list">
              {tracks.map((t, idx) => (
                <button key={t.src} className={`music-track${idx === i ? ' on' : ''}`} onClick={() => choose(idx)}>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
