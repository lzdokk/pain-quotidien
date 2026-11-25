'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import HeroScene, { sceneOfDay, SCENES, normScene, type SceneId } from './HeroScenes';
import { openTheme } from './ThemeSheet';

const VerseImage = dynamic(() => import('./VerseImage'), { ssr: false });

/**
 * ACCUEIL PLEIN ÉCRAN : le verset du jour sur un paysage (un par jour, au choix,
 * ou ta photo). Un toucher ouvre le Pain du jour ; on fait glisser pour la suite.
 */
export type HomeBg = { mode: 'auto' | 'scene' | 'photo'; scene?: SceneId; blur?: number };
export const readHomeBg = (): HomeBg => { try { return JSON.parse(localStorage.getItem('pq-home-bg') ?? '{"mode":"auto"}'); } catch { return { mode: 'auto' }; } };
export const readHomePhoto = () => { try { return localStorage.getItem('pq-home-photo'); } catch { return null; } };

export default function HomeHero({ date, dateLabel, text, refLabel, theme }: {
  date: string; dateLabel: string; text: string | null; refLabel: string | null; theme: string | null;
}) {
  const [scene, setScene] = useState<SceneId>(sceneOfDay(date, theme));
  const [photo, setPhoto] = useState<string | null>(null);
  const [share, setShare] = useState(false);
  const [blur, setBlur] = useState(0);
  useEffect(() => {
    const apply = () => {
      const bg = readHomeBg();
      setBlur(Math.max(0, Math.min(14, Number(bg.blur) || 0)));
      if (bg.mode === 'photo') { const p = readHomePhoto(); setPhoto(p); if (p) return; }
      else setPhoto(null);
      setScene(bg.mode === 'scene' ? (normScene(bg.scene) ?? sceneOfDay(date, theme)) : sceneOfDay(date, theme));
    };
    apply();
    window.addEventListener('pq-home-bg', apply);
    return () => window.removeEventListener('pq-home-bg', apply);
  }, [date, theme]);

  const len = text?.length ?? 0;
  const size = len > 230 ? 'xs' : len > 160 ? 's' : len > 100 ? 'm' : 'l';
  const label = SCENES.find(s => s.id === scene)?.label;

  return (
    <section className="hh" aria-label="Verset du jour">
      <div className={`hh-bg${blur ? ' blurred' : ''}`} style={blur ? { filter: `blur(${blur}px)` } : undefined}>
        {photo ? <img src={photo} alt="" /> : <HeroScene id={scene} />}
      </div>
      <div className="hh-veil" />
      <a href="/pain" className="hh-tap" aria-label="Ouvrir le Pain du jour">
        <span className="hh-date">{dateLabel}</span>
        {text ? (
          <>
            <blockquote className={`hh-verse hh-${size}`}>{text}</blockquote>
            <cite className="hh-ref">{refLabel}</cite>
            {theme && <span className="hh-theme">Pain du jour · {theme} <b>›</b></span>}
          </>
        ) : <blockquote className="hh-verse hh-m">La Parole, chaque jour.</blockquote>}
      </a>
      <div className="hh-tools">
        {text && (
          <button onClick={() => setShare(true)} aria-label="Partager le verset du jour en image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" /></svg>
          </button>
        )}
        <button onClick={openTheme} aria-label={`Changer le fond (${photo ? 'ma photo' : label})`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l5-5 4 4 3-3 4 4M4 5h16v14H4zM15.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
        </button>
      </div>
      <button className="hh-down" onClick={() => document.getElementById('home-suite')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} aria-label="Voir la suite">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {share && text && refLabel && <VerseImage text={text} refLabel={refLabel} onClose={() => setShare(false)} />}
    </section>
  );
}
