'use client';
import { useEffect, useState } from 'react';
import { ACCENTS, AMBIANCES, FONTS, NUITS, THEME_DEFAULT, readTheme, saveTheme, type Theme } from '@/lib/theme';
import HeroScene, { SCENES, THEMES, normScene, type SceneId } from './HeroScenes';
import { PHOTOS, photoThumb } from '@/lib/photos';
import { prefsChanged, pullPrefs } from '@/lib/prefs-sync';
import { supabase } from '@/lib/supabase/client';

type HomeBg = { mode: 'auto' | 'scene' | 'photo' | 'lib' | 'dessin'; scene?: SceneId; lib?: string; blur?: number };
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
  const [kind, setKind] = useState<'photos' | 'dessins'>('photos');
  const setBg = (b: HomeBg) => {
    setBgState(b);
    try { localStorage.setItem('pq-home-bg', JSON.stringify(b)); } catch {}
    window.dispatchEvent(new Event('pq-home-bg'));
    prefsChanged();
  };
  const pickPhoto = async (f?: File) => {
    if (!f) return;
    try {
      const { loadPhoto } = await import('./VerseImage');
      const { url } = await loadPhoto(f, 1600);
      try { localStorage.setItem('pq-home-photo', url); setHasPhoto(true); setBgMsg(''); setBg({ mode: 'photo', blur: bg.blur }); }
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
  // Réglages du compte : au démarrage, à la connexion et quand on revient sur l'app.
  useEffect(() => {
    pullPrefs();
    const vis = () => { if (document.visibilityState === 'visible') pullPrefs(); };
    document.addEventListener('visibilitychange', vis);
    const { data } = supabase.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_IN') setTimeout(pullPrefs, 300); });
    return () => { document.removeEventListener('visibilitychange', vis); data.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  const set = (p: Partial<Theme>) => { const n = { ...t, ...p }; setT(n); saveTheme(n); prefsChanged(); };

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
          <button className={bg.mode === 'auto' ? 'on' : ''} onClick={() => setBg({ mode: 'auto', blur: bg.blur })}>
            <span className="th-sc th-auto">↻</span>Photo du jour
          </button>
          <button className={bg.mode === 'dessin' ? 'on' : ''} onClick={() => setBg({ mode: 'dessin', blur: bg.blur })}>
            <span className="th-sc th-auto">✎</span>Dessin du jour
          </button>
          <label className={bg.mode === 'photo' ? 'on' : ''}>
            <input type="file" accept="image/*" onChange={e => pickPhoto(e.target.files?.[0])} />
            <span className="th-sc th-auto">{hasPhoto ? '✓' : '+'}</span>Ma photo
          </label>
        </div>
        <div className="th-gal-k">Ou choisis ton fond :</div>
        <div className="th-kind">
          <button className={kind === 'photos' ? 'on' : ''} onClick={() => setKind('photos')}>Photos ({PHOTOS.length})</button>
          <button className={kind === 'dessins' ? 'on' : ''} onClick={() => setKind('dessins')}>Dessins ({SCENES.length})</button>
        </div>
        <div className="th-themes">
          {THEMES.map(t => <button key={t.id} className={gal === t.id ? 'on' : ''} onClick={() => setGal(t.id)}>{t.label}</button>)}
          <button className={gal === 'tous' ? 'on' : ''} onClick={() => setGal('tous')}>Tous</button>
        </div>
        <div className="th-grid">
          {kind === 'photos'
            ? PHOTOS.filter(p => gal === 'tous' || p.themes.includes(gal)).map(p => (
                <button key={p.id} className={bg.mode === 'lib' && bg.lib === p.id ? 'on' : ''} onClick={() => setBg({ mode: 'lib', lib: p.id, blur: bg.blur })} title={`Photo : ${p.author}`}>
                  <span className="th-sc"><img src={photoThumb(p.id)} alt="" loading="lazy" /></span>
                </button>
              ))
            : SCENES.filter(sc => gal === 'tous' || sc.themes.includes(gal)).map(sc => (
                <button key={sc.id} className={bg.mode === 'scene' && normScene(bg.scene) === sc.id ? 'on' : ''} onClick={() => setBg({ mode: 'scene', scene: sc.id, blur: bg.blur })} title={sc.label}>
                  <span className="th-sc"><HeroScene id={sc.id} /></span><small>{sc.label}</small>
                </button>
              ))}
        </div>
        <p className="fine" style={{ marginTop: 6 }}>Photos : Unsplash (libres de droits).</p>
        <label className="vi-range" style={{ marginTop: 12 }}>Flou du fond
          <input type="range" min="0" max="14" step="1" value={bg.blur ?? 0} onChange={e => setBg({ ...bg, blur: +e.target.value })} />
        </label>
        {hasPhoto && bg.mode !== 'photo' && <button className="linkbtn" style={{ fontSize: 13, marginTop: 6 }} onClick={() => setBg({ mode: 'photo', blur: bg.blur })}>Reprendre ma photo</button>}
        {bgMsg && <p className="fine">{bgMsg}</p>}

        <div className="th-k">Couleur</div>
        <div className="th-acc">
          {ACCENTS.map(a => (
            <button key={a.id} className={t.accent === a.id ? 'on' : ''} onClick={() => set({ accent: a.id })}>
              <span className="th-dot" style={{ background: `linear-gradient(140deg, color-mix(in srgb, ${a.c} 70%, #fff), ${a.c})` }} />{a.label}
            </button>
          ))}
          <label className={`th-perso${t.accent === 'perso' ? ' on' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-2)' }}>
            <span className="th-dot" style={{ background: t.accent === 'perso' ? t.perso : 'conic-gradient(#e66,#eb4,#6c6,#4bd,#66e,#c6c,#e66)', boxShadow: t.accent === 'perso' ? '0 0 0 2px var(--accent)' : undefined }} />Ma couleur
            <input type="color" value={t.perso || '#7A5BA8'} onChange={e => set({ accent: 'perso', perso: e.target.value })} aria-label="Choisir ma couleur" />
          </label>
        </div>

        <div className="th-k">Fond du mode jour</div>
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

        <div className="th-k">Fond du mode nuit</div>
        <div className="th-nuits">
          {NUITS.map(n => (
            <button key={n.id} className={(t.nuit || 'auto') === n.id ? 'on' : ''} onClick={() => set({ nuit: n.id })}>
              <span className="th-mini" style={{ background: n.bg }}>
                <i style={{ background: 'rgba(255,255,255,.08)', width: '100%', height: 22 }} />
                <i style={{ background: 'var(--accent)', width: '55%' }} />
              </span>{n.label}
            </button>
          ))}
        </div>
        <p className="fine" style={{ marginTop: 6 }}>Passe en mode nuit avec la lune, en haut, pour voir le résultat.</p>

        <div className="th-k">Taille du texte</div>
        <div className="th-size">
          <button onClick={() => set({ size: Math.max(0.85, +((t.size ?? 1) - 0.05).toFixed(2)) })} aria-label="Texte plus petit">A−</button>
          <span>{Math.round((t.size ?? 1) * 100)} %</span>
          <button onClick={() => set({ size: Math.min(1.4, +((t.size ?? 1) + 0.05).toFixed(2)) })} aria-label="Texte plus grand">A+</button>
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
