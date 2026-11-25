'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import HeroScene, { sceneOfDay, SCENES, THEMES, normScene, type SceneId } from './HeroScenes';
import { photoOfDay, photoById, photoUrl } from '@/lib/photos';
import { openTheme } from './ThemeSheet';

const VerseImage = dynamic(() => import('./VerseImage'), { ssr: false });

/**
 * ACCUEIL PLEIN ÉCRAN : le verset du jour sur un paysage (un par jour, au choix,
 * ou ta photo). Un toucher ouvre le Pain du jour ; on fait glisser pour la suite.
 */
export type HomeBg = { mode: 'auto' | 'scene' | 'photo' | 'lib' | 'dessin'; scene?: SceneId; lib?: string; blur?: number };
export const readHomeBg = (): HomeBg => { try { return JSON.parse(localStorage.getItem('pq-home-bg') ?? '{"mode":"auto"}'); } catch { return { mode: 'auto' }; } };
export const readHomePhoto = () => { try { return localStorage.getItem('pq-home-photo'); } catch { return null; } };

export default function HomeHero({ date, dateLabel, text, refLabel, theme, message }: {
  date: string; dateLabel: string; text: string | null; refLabel: string | null; theme: string | null; message?: string;
}) {
  const themeIds = theme ? THEMES.filter(t => t.words.test(theme)).map(t => t.id) : [];
  // Par défaut : une vraie photo accordée au thème du jour.
  const [scene, setScene] = useState<SceneId>(sceneOfDay(date, theme));
  const [photo, setPhoto] = useState<string | null>(photoUrl(photoOfDay(date, themeIds).id));
  const [share, setShare] = useState(false);
  const [blur, setBlur] = useState(0);
  useEffect(() => {
    const apply = () => {
      const bg = readHomeBg();
      setBlur(Math.max(0, Math.min(14, Number(bg.blur) || 0)));
      if (bg.mode === 'photo') { const p = readHomePhoto(); if (p) { setPhoto(p); return; } }
      if (bg.mode === 'lib' && photoById(bg.lib)) { setPhoto(photoUrl(bg.lib!)); return; }
      if (bg.mode === 'scene' && normScene(bg.scene)) { setPhoto(null); setScene(normScene(bg.scene)!); return; }
      if (bg.mode === 'dessin') { setPhoto(null); setScene(sceneOfDay(date, theme)); return; }
      setPhoto(photoUrl(photoOfDay(date, themeIds).id));
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
        {photo ? <img src={photo} alt="" decoding="async" fetchPriority="high" /> : <HeroScene id={scene} />}
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
      {share && text && refLabel && <VerseImage text={text} refLabel={refLabel} message={message} onClose={() => setShare(false)} />}
    </section>
  );
}
