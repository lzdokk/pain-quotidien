'use client';
import { useEffect, useState } from 'react';
import { ACCENTS, AMBIANCES, FONTS, THEME_DEFAULT, readTheme, saveTheme, type Theme } from '@/lib/theme';
import HeroScene, { SCENES, THEMES, normScene, type SceneId } from './HeroScenes';

type HomeBg = { mode: 'auto' | 'scene' | 'photo'; scene?: SceneId };
const readBg = (): HomeBg => { try { return JSON.parse(localStorage.getItem('pq-home-bg') ?? '{"mode":"auto"}'); } catch { return { mode: 'auto' }; } };

/** Ouvre la fenêtre « Personnaliser l'app » depuis n'importe où. */
export const openTheme = () => { try { window.dispatchEvent(new Event('pq-theme-open')); } catch {} };

/** Bouton prêt à poser (profil, menu du compte, apparence de lecture). */
export function ThemeButton({ label = 'Personnaliser l’app', className = 'btn' }: { label?: string; className?: string }) {
  return (
    <button className={`${className} th-btn`} onClick={openTheme}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 100 18c1 0 1.6-.8 1.6-1.6 0-.5-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.9.7-1.6 1.6-1.6H16a5 5 0 005-5C21 6.6 17 3 12 3z" />
        <circle cx="7.5" cy="11" r="1" /><circle cx="10" cy="7.5" r="1" /><circle cx="14.5" cy="7.5" r="1" />
      </svg>{label}
    </button>
  );
}

/**
 * PERSONNALISER L'APP : couleur principale, ambiance, police.
 * Chaque choix s'applique tout de suite à toute l'app (aperçu en direct).
 */
export default function ThemeSheet() {
  const [open, setOpen] = useState(false);
  const [t, setT] = useState<Theme>(THEME_DEFAULT);
  const [bg, setBgState] = useState<HomeBg>({ mode: 'auto' });
  const [hasPhoto, setHasPhoto] = useState(false);
  const [bgMsg, setBgMsg] = useState('');
  const [gal, setGal] = useState<string>('esperance'); // thème affiché dans la galerie
  const setBg = (b: HomeBg) => {
    setBgState(b);
    try { localStorage.setItem('pq-home-bg', JSON.stringify(b)); } catch {}
    window.dispatchEvent(new Event('pq-home-bg'));
  };
  const pickPhoto = async (f?: File) => {
    if (!f) return;
    try {
      const { loadPhoto } = await import('./VerseImage');
      const { url } = await loadPhoto(f, 1600);
      try { localStorage.setItem('pq-home-photo', url); setHasPhoto(true); setBgMsg(''); setBg({ mode: 'photo' }); }
      catch { setBgMsg('Photo trop lourde pour être gardée sur le téléphone : essaie une image plus petite.'); }
    } catch { setBgMsg('Photo illisible.'); }
  };
  useEffect(() => {
    const on = () => {
      setT(readTheme()); setBgState(readBg());
      try { setHasPhoto(!!localStorage.getItem('pq-home-photo')); } catch {}
      setOpen(true);
    };
    window.addEventListener('pq-theme-open', on);
    return () => window.removeEventListener('pq-theme-open', on);
  }, []);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  const set = (p: Partial<Theme>) => { const n = { ...t, ...p }; setT(n); saveTheme(n); };

  return (
    <div className="th-ov" role="dialog" aria-modal="true" aria-label="Personnaliser l’app" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="th-sheet">
        <div className="th-head">
          <h3>Personnaliser</h3>
          <button className="rbubble-x" style={{ position: 'static' }} onClick={() => setOpen(false)} aria-label="Fermer">×</button>
        </div>
        <p className="th-sub">Ta couleur, ton ambiance, ta police : tout s’applique tout de suite, dans toute l’app.</p>

        <div className="th-k">Fond de l’accueil</div>
        <div className="th-scenes th-modes2">
          <button className={bg.mode === 'auto' ? 'on' : ''} onClick={() => setBg({ mode: 'auto' })}>
            <span className="th-sc th-auto">↻</span>Selon le thème du jour
          </button>
          <label className={bg.mode === 'photo' ? 'on' : ''}>
            <input type="file" accept="image/*" onChange={e => pickPhoto(e.target.files?.[0])} />
            <span className="th-sc th-auto">{hasPhoto ? '✓' : '+'}</span>Ma photo
          </label>
        </div>
        <div className="th-gal-k">Ou choisis un fond ({SCENES.length}) :</div>
        <div className="th-themes">
          {THEMES.map(t => <button key={t.id} className={gal === t.id ? 'on' : ''} onClick={() => setGal(t.id)}>{t.label}</button>)}
          <button className={gal === 'tous' ? 'on' : ''} onClick={() => setGal('tous')}>Tous</button>
        </div>
        <div className="th-grid">
          {SCENES.filter(sc => gal === 'tous' || sc.themes.includes(gal)).map(sc => (
            <button key={sc.id} className={bg.mode === 'scene' && normScene(bg.scene) === sc.id ? 'on' : ''} onClick={() => setBg({ mode: 'scene', scene: sc.id })} title={sc.label}>
              <span className="th-sc"><HeroScene id={sc.id} /></span><small>{sc.label}</small>
            </button>
          ))}
        </div>
        {hasPhoto && bg.mode !== 'photo' && <button className="linkbtn" style={{ fontSize: 13, marginTop: 6 }} onClick={() => setBg({ mode: 'photo' })}>Reprendre ma photo</button>}
        {bgMsg && <p className="fine">{bgMsg}</p>}

        <div className="th-k">Couleur</div>
        <div className="th-acc">
          {ACCENTS.map(a => (
            <button key={a.id} className={t.accent === a.id ? 'on' : ''} onClick={() => set({ accent: a.id })}>
              <span className="th-dot" style={{ background: `linear-gradient(140deg, color-mix(in srgb, ${a.c} 70%, #fff), ${a.c})` }} />{a.label}
            </button>
          ))}
        </div>

        <div className="th-k">Ambiance (mode jour)</div>
        <div className="th-amb">
          {AMBIANCES.map(a => (
            <button key={a.id} className={t.ambiance === a.id ? 'on' : ''} onClick={() => set({ ambiance: a.id })}>
              <span className="th-mini" style={{ background: a.bg }}>
                <i style={{ background: a.card, width: '100%', height: 22 }} />
                <i style={{ background: 'var(--accent)', width: '55%' }} />
              </span>{a.label}
            </button>
          ))}
        </div>

        <div className="th-k">Police</div>
        <div className="th-fonts">
          {FONTS.map(f => (
            <button key={f.id} className={t.font === f.id ? 'on' : ''} onClick={() => set({ font: f.id })}>
              <b style={{ fontFamily: f.family }}>Pain de Vie</b><small>{f.label}</small>
            </button>
          ))}
        </div>

        <div className="th-prev">
          <div className="card">
            <span className="kicker">Aperçu · Matthieu 11.28</span>
            <p>Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos.</p>
            <button className="btn primary sm">Méditer ce verset</button>
          </div>
        </div>

        <button className="linkbtn th-reset" onClick={() => { set({ ...THEME_DEFAULT }); setBg({ mode: 'auto' }); }}>Revenir à l’apparence d’origine</button>
        <p className="fine" style={{ marginTop: 10 }}>Le mode jour / soir se change avec la lune, en haut. Le fond de lecture de la Bible se règle dans Lire › + › Apparence de lecture.</p>
      </div>
    </div>
  );
}
