'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PHOTOS, photoThumb, photoUrl } from '@/lib/photos';

/**
 * IMAGE DE VERSET À PARTAGER : un visuel soigné (Instagram, Story, WhatsApp).
 * Dessinée dans le téléphone (canvas), rien n'est envoyé au serveur.
 * Fonds dégradés ou photo personnelle, trois polices, partage direct de l'image.
 */
type Bg = { id: string; label: string; stops?: string[]; ink: string; sub: string; deco?: 'stars' | 'grain' | 'rays' };
const BGS: Bg[] = [
  { id: 'aube', label: 'Aube', stops: ['#F7DDBF', '#EBAE86', '#B8707A'], ink: '#2A1B18', sub: 'rgba(42,27,24,.66)', deco: 'rays' },
  { id: 'nuit', label: 'Nuit', stops: ['#0B1626', '#1B2C4A', '#3A3E6C'], ink: '#F5F0E6', sub: 'rgba(245,240,230,.68)', deco: 'stars' },
  { id: 'lin', label: 'Lin', stops: ['#FCF9F3', '#F2EBDF', '#E5DAC6'], ink: '#2A251E', sub: 'rgba(42,37,30,.6)', deco: 'grain' },
  { id: 'olivier', label: 'Olivier', stops: ['#EEF0E6', '#CDD6BF', '#8DA07B'], ink: '#1E2A1B', sub: 'rgba(30,42,27,.62)', deco: 'grain' },
  { id: 'mer', label: 'Mer', stops: ['#0D3540', '#1B5F6B', '#5FA2A0'], ink: '#F1F8F7', sub: 'rgba(241,248,247,.7)', deco: 'rays' },
  { id: 'vigne', label: 'Vigne', stops: ['#250C17', '#561C31', '#8E3B50'], ink: '#FCEFF2', sub: 'rgba(252,239,242,.68)', deco: 'grain' },
  { id: 'desert', label: 'Désert', stops: ['#F5E6C8', '#DFBC8D', '#B07F57'], ink: '#2D1F13', sub: 'rgba(45,31,19,.64)', deco: 'rays' },
  { id: 'ardoise', label: 'Ardoise', stops: ['#1A2129', '#2B3640', '#4A5B6E'], ink: '#EEF2F6', sub: 'rgba(238,242,246,.66)', deco: 'grain' }
];
const FONTS = [
  { id: 'elegant', label: 'Élégant', family: '"Cormorant Garamond"', weight: '500', italic: true, k: 1.18 },
  { id: 'classique', label: 'Classique', family: '"Playfair Display"', weight: '500', italic: false, k: 0.98 },
  { id: 'livre', label: 'Livre', family: 'Lora', weight: '500', italic: false, k: 0.98 },
  { id: 'baskerville', label: 'Baskerville', family: '"Libre Baskerville"', weight: '400', italic: true, k: 0.9 },
  { id: 'display', label: 'Affiche', family: '"DM Serif Display"', weight: '400', italic: false, k: 1.02 },
  { id: 'antique', label: 'Antique', family: 'Cinzel', weight: '500', italic: false, k: 0.82 },
  { id: 'marcellus', label: 'Gravé', family: 'Marcellus', weight: '400', italic: false, k: 0.95 },
  { id: 'calligraphie', label: 'Calligraphie', family: '"Great Vibes"', weight: '400', italic: false, k: 1.35 },
  { id: 'manuscrite', label: 'Manuscrite', family: '"Dancing Script"', weight: '600', italic: false, k: 1.12 },
  { id: 'crayon', label: 'Crayon', family: 'Caveat', weight: '600', italic: false, k: 1.28 },
  { id: 'moderne', label: 'Moderne', family: 'Inter', weight: '600', italic: false, k: 0.9 },
  { id: 'montserrat', label: 'Montserrat', family: 'Montserrat', weight: '600', italic: false, k: 0.86 },
  { id: 'josefin', label: 'Fine', family: '"Josefin Sans"', weight: '400', italic: false, k: 0.95 },
  { id: 'fraunces', label: 'Chaleureuse', family: 'Fraunces', weight: '500', italic: false, k: 0.95 }
];
const FORMATS = [
  { id: 'post', label: 'Post 4:5', w: 1080, h: 1350 },
  { id: 'carre', label: 'Carré', w: 1080, h: 1080 },
  { id: 'story', label: 'Story', w: 1080, h: 1920 }
];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Playfair+Display:ital,wght@0,500;1,500&family=Inter:wght@500;600;700&family=Lora:wght@500&family=Libre+Baskerville:ital@1&family=DM+Serif+Display&family=Cinzel:wght@500&family=Marcellus&family=Great+Vibes&family=Dancing+Script:wght@600&family=Caveat:wght@600&family=Montserrat:wght@600&family=Josefin+Sans:wght@400&family=Fraunces:opsz,wght@9..144,500&display=swap';

let fontsReady: Promise<void> | null = null;
function loadFonts() {
  if (fontsReady) return fontsReady;
  fontsReady = (async () => {
    if (!document.querySelector(`link[href="${FONT_CSS}"]`)) {
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = FONT_CSS; document.head.appendChild(l);
      await new Promise(r => { l.onload = r; l.onerror = r; setTimeout(r, 2500); });
    }
    await Promise.all([
      ...FONTS.map(f => `${f.italic ? 'italic ' : ''}${f.weight} 60px ${f.family}`), '600 60px "Cormorant Garamond"', '700 30px Inter'
    ].map(f => document.fonts.load(f).catch(() => null)));
  })();
  return fontsReady;
}

/** Petit générateur pseudo-aléatoire stable (mêmes étoiles à chaque dessin). */
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

type Opts = { bg: string; font: string; format: string; align: 'center' | 'left'; sign: boolean; veil: number; blur: number; size: number; photo: HTMLImageElement | null };

function draw(cv: HTMLCanvasElement, text: string, ref: string, o: Opts) {
  const F = FORMATS.find(f => f.id === o.format)!; const W = F.w, H = F.h;
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;
  const bg = BGS.find(b => b.id === o.bg);
  const isPhoto = (o.bg === 'photo' || o.bg.startsWith('scene:') || o.bg.startsWith('lib:')) && o.photo;
  const ink = isPhoto ? '#FFFFFF' : bg?.ink ?? '#222';
  const sub = isPhoto ? 'rgba(255,255,255,.78)' : bg?.sub ?? 'rgba(0,0,0,.6)';

  // Fond
  if (isPhoto) {
    const im = o.photo!; const s = Math.max(W / im.width, H / im.height);
    const dw = im.width * s, dh = im.height * s, dx = (W - dw) / 2, dy = (H - dh) / 2;
    if (o.blur > 0) {
      // Flou : par le filtre du navigateur s'il existe, sinon en réduisant puis agrandissant l'image.
      if ('filter' in ctx && (ctx as any).filter === 'none') {
        (ctx as any).filter = `blur(${o.blur * 2.2}px)`;
        const m = o.blur * 6; ctx.drawImage(im, dx - m, dy - m, dw + 2 * m, dh + 2 * m);
        (ctx as any).filter = 'none';
      } else {
        const k = 1 / (1 + o.blur * 0.9);
        const t = document.createElement('canvas'); t.width = Math.max(8, Math.round(W * k)); t.height = Math.max(8, Math.round(H * k));
        const tc = t.getContext('2d')!; tc.imageSmoothingQuality = 'high';
        tc.drawImage(im, dx * k, dy * k, dw * k, dh * k);
        ctx.imageSmoothingEnabled = true; (ctx as any).imageSmoothingQuality = 'high';
        ctx.drawImage(t, 0, 0, W, H);
      }
    } else ctx.drawImage(im, dx, dy, dw, dh);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgba(0,0,0,${o.veil * 0.75})`); g.addColorStop(0.5, `rgba(0,0,0,${o.veil})`); g.addColorStop(1, `rgba(0,0,0,${Math.min(0.95, o.veil * 1.15)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else {
    const st = bg?.stops ?? ['#eee', '#ccc'];
    const g = ctx.createLinearGradient(0, 0, W * 0.35, H);
    st.forEach((c, i) => g.addColorStop(i / (st.length - 1), c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const r = rng(7);
    if (bg?.deco === 'stars') {
      for (let i = 0; i < 160; i++) {
        const x = r() * W, y = r() * H * 0.9, rad = r() * 1.8 + 0.3;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.55})`; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      }
    } else if (bg?.deco === 'rays') {
      const rg = ctx.createRadialGradient(W * 0.5, -H * 0.05, 0, W * 0.5, -H * 0.05, H * 0.9);
      rg.addColorStop(0, 'rgba(255,255,255,.42)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    } else if (bg?.deco === 'grain') {
      for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)';
        ctx.fillRect(r() * W, r() * H, 2, 2);
      }
    }
    // Lumière douce en bas pour la profondeur
    const vg = ctx.createRadialGradient(W / 2, H * 0.55, W * 0.2, W / 2, H * 0.55, H * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.18)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  // Texte du verset : la plus grande taille qui tient
  const f = FONTS.find(x => x.id === o.font)!;
  const M = W * 0.11, maxW = W - 2 * M;
  const top = H * (o.format === 'story' ? 0.24 : 0.2), bottom = H * (o.format === 'story' ? 0.72 : 0.74);
  const clean = text.replace(/\s+/g, ' ').trim();
  let size = W * 0.082 * f.k * (o.size || 1), lines: string[] = [], lh = 0;
  for (; size > W * 0.03; size -= 2) {
    ctx.font = `${f.italic ? 'italic ' : ''}${f.weight} ${size}px ${f.family}, Georgia, serif`;
    lines = wrap(ctx, clean, maxW); lh = size * (f.id === 'moderne' ? 1.32 : 1.28);
    if (lines.length * lh <= bottom - top) break;
  }
  const blockH = lines.length * lh;
  let y = top + (bottom - top - blockH) / 2 + size * 0.85;
  const x = o.align === 'center' ? W / 2 : M;
  ctx.textAlign = o.align === 'center' ? 'center' : 'left';

  // Guillemet décoratif
  ctx.save();
  ctx.fillStyle = ink; ctx.globalAlpha = 0.14;
  const Q = W * 0.26;
  ctx.font = `${f.italic ? 'italic ' : ''}600 ${Q}px "Cormorant Garamond", Georgia, serif`;
  // juste au-dessus de la première ligne
  ctx.fillText('“', o.align === 'center' ? W / 2 : M + W * 0.03, Math.max(Q * 0.8, y - size - H * 0.015 + Q * 0.42));
  ctx.restore();

  ctx.fillStyle = ink;
  ctx.font = `${f.italic ? 'italic ' : ''}${f.weight} ${size}px ${f.family}, Georgia, serif`;
  if (isPhoto) { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 18; }
  for (const l of lines) { ctx.fillText(l, x, y); y += lh; }
  ctx.shadowBlur = 0;

  // Filet + référence
  const ry = Math.min(H * 0.86, y + H * 0.035);
  ctx.strokeStyle = sub; ctx.lineWidth = 2;
  ctx.beginPath();
  if (o.align === 'center') { ctx.moveTo(W / 2 - W * 0.05, ry - H * 0.022); ctx.lineTo(W / 2 + W * 0.05, ry - H * 0.022); }
  else { ctx.moveTo(M, ry - H * 0.022); ctx.lineTo(M + W * 0.1, ry - H * 0.022); }
  ctx.stroke();
  ctx.fillStyle = sub;
  ctx.font = `700 ${W * 0.03}px Inter, Helvetica, Arial, sans-serif`;
  const spaced = ref.toUpperCase().split('').join(' ');
  ctx.fillText(spaced, x, ry + W * 0.012);

  // Signature
  if (o.sign) {
    ctx.globalAlpha = 0.7;
    ctx.font = `600 ${W * 0.022}px Inter, Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('P A I N   D E   V I E', W / 2, H - H * 0.045);
    ctx.globalAlpha = 1;
  }
}

/** Réduit une photo du téléphone (taille raisonnable, orientation correcte). */
export async function loadPhoto(file: File, max = 1600): Promise<{ img: HTMLImageElement; url: string }> {
  const bmp = await createImageBitmap(file).catch(() => null);
  const src = bmp ?? await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  const s = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement('canvas'); c.width = Math.round(src.width * s); c.height = Math.round(src.height * s);
  c.getContext('2d')!.drawImage(src as any, 0, 0, c.width, c.height);
  const url = c.toDataURL('image/jpeg', 0.82);
  const img = await new Promise<HTMLImageElement>(r => { const i = new Image(); i.onload = () => r(i); i.src = url; });
  return { img, url };
}

export default function VerseImage({ text, refLabel, onClose, message, bcv, bookName }: {
  text: string; refLabel: string; onClose: () => void;
  /** Méditation déjà prête à joindre au message */
  message?: string;
  /** Sinon : verset à chercher (méditation déjà écrite, lue en cache) */
  bcv?: { b: number; c: number; v: number }; bookName?: string;
}) {
  const [medit, setMedit] = useState<string | null>(message ?? null);
  const [attach, setAttach] = useState(true);
  useEffect(() => {
    if (message || !bcv) return;
    let alive = true;
    fetch(`/api/explain?b=${bcv.b}&c=${bcv.c}&v=${bcv.v}`).then(r => r.ok ? r.json() : null).then(async d => {
      if (!alive || !d) return;
      const { meditationText } = await import('@/lib/meditation-text');
      setMedit(meditationText({ reference: refLabel, verseText: text, data: d, bookName: bookName ?? refLabel.replace(/\s+\d+.*$/, ''), chapter: bcv.c }));
    }).catch(() => null);
    return () => { alive = false; };
  }, [message, bcv?.b, bcv?.c, bcv?.v]); // eslint-disable-line react-hooks/exhaustive-deps
  const cv = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [o, setO] = useState<Opts>(() => {
    let saved: any = {};
    try { saved = JSON.parse(localStorage.getItem('pq-vimg') ?? '{}'); } catch {}
    return { bg: saved.bg && saved.bg !== 'photo' && !String(saved.bg).startsWith('scene:') && !String(saved.bg).startsWith('lib:') ? saved.bg : 'aube', font: saved.font ?? 'elegant', format: saved.format ?? 'post', align: saved.align ?? 'center', sign: saved.sign ?? true, veil: 0.45, blur: 0, size: saved.size ?? 1, photo: null };
  });
  const [busy, setBusy] = useState(false);
  // Paysages (les mêmes que l'accueil), suggérés selon le texte du verset.
  const [scenes, setScenes] = useState<Array<{ id: string; label: string }>>([]);
  const [sceneMod, setSceneMod] = useState<any>(null);
  const [libs, setLibs] = useState<string[]>([]);
  useEffect(() => {
    import('./HeroScenes').then(m => {
      setSceneMod(m);
      const hit = m.THEMES.filter((t: any) => t.words.test(text)).map((t: any) => t.id);
      const pool = hit.length ? m.SCENES.filter((sc: any) => sc.themes.some((t: string) => hit.includes(t))) : m.SCENES;
      const seed = [...text].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100000, 7);
      const pick: any[] = [];
      for (let i = 0; pick.length < Math.min(10, pool.length) && i < 200; i++) {
        const sc = pool[(seed + i * 37) % pool.length];
        if (!pick.includes(sc)) pick.push(sc);
      }
      setScenes(pick.slice(0, 6));
      const photos = (hit.length ? PHOTOS.filter(p => p.themes.some(t => hit.includes(t))) : PHOTOS);
      const lp: string[] = [];
      for (let i = 0; lp.length < Math.min(10, photos.length) && i < 300; i++) {
        const ph = photos[(seed + i * 41) % photos.length].id;
        if (!lp.includes(ph)) lp.push(ph);
      }
      setLibs(lp);
    });
  }, [text]);
  const pickLib = async (id: string) => {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = photoUrl(id); }).catch(() => null);
    if (img) set({ photo: img, bg: `lib:${id}`, veil: 0.3 });
  };
  const pickScene = async (id: string) => {
    if (!sceneMod) return;
    const el = document.querySelector(`.vi-scenes button[data-scene="${id}"] svg`);
    if (!el) return;
    const W = 1080, H = 1920; // dessiné en grand, recadré au format
    let svg = el.outerHTML;
    svg = svg.replace(/^<svg /, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" `).replace(/ class="[^"]*"/, '');
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    set({ photo: img, bg: `scene:${id}`, veil: 0.28 });
  };
  const [msg, setMsg] = useState('');
  const set = (p: Partial<Opts>) => setO(x => {
    const n = { ...x, ...p };
    try { const { photo, ...keep } = n; localStorage.setItem('pq-vimg', JSON.stringify(keep)); } catch {}
    return n;
  });

  useEffect(() => { loadFonts().then(() => setReady(true)); }, []);
  useEffect(() => { if (ready && cv.current) draw(cv.current, text, refLabel, o); }, [ready, o, text, refLabel]);
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  const blob = () => new Promise<Blob | null>(r => cv.current!.toBlob(r, 'image/jpeg', 0.93));
  const fileName = `${refLabel.replace(/[^\p{L}\d]+/gu, '-')}-pain-de-vie.jpg`;
  // WhatsApp (et d'autres) coupent la légende d'une image vers 1 000 caractères :
  // l'image part avec une version courte, la méditation complète part en second message.
  const LIMIT = 900;
  const shortText = (t: string) => {
    if (t.length <= LIMIT) return t;
    const link = t.split('\n').reverse().find(l => /https?:\/\//.test(l)) ?? '';
    const paras = t.split('\n\n');
    let out = '';
    for (const p of paras) {
      if (/https?:\/\//.test(p)) continue;
      if ((out + '\n\n' + p).length > LIMIT - 120) break;
      out = out ? `${out}\n\n${p}` : p;
    }
    return `${out}\n\n📖 La méditation complète suit dans le message suivant${link ? ` · ${link.replace(/^Pain de Vie · /, '')}` : ''}`;
  };
  const [afterShare, setAfterShare] = useState(false);
  const shareImg = async () => {
    setBusy(true); setMsg(''); setAfterShare(false);
    if (attach && medit) { try { await navigator.clipboard.writeText(medit); } catch {} }
    try {
      const b = await blob(); if (!b) return;
      const file = new File([b], fileName, { type: 'image/jpeg' });
      const nav: any = navigator;
      const withText = attach && medit;
      if (nav.canShare?.({ files: [file] })) {
        await nav.share(withText ? { files: [file], title: refLabel, text: shortText(medit!) } : { files: [file], title: refLabel });
      } else download(b);
      if (withText) setAfterShare(true);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setMsg('Partage impossible : utilise « Enregistrer ».');
      else if (attach && medit) setAfterShare(true);
    }
    finally { setBusy(false); }
  };
  const download = (b: Blob) => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const save = async () => { const b = await blob(); if (b) download(b); };
  const shareText = async () => {
    const t = attach && medit ? medit : `« ${text} » ${refLabel}`; const nav: any = navigator;
    if (nav.share) { try { await nav.share({ text: t }); return; } catch { /* annulé */ } }
    try { await navigator.clipboard.writeText(t); setMsg('Texte copié ✓'); } catch {}
  };
  const onPhoto = async (f?: File) => {
    if (!f) return;
    try { const { img } = await loadPhoto(f); set({ photo: img, bg: 'photo' }); } catch { setMsg('Photo illisible.'); }
  };

  // Ouverte au-dessus de tout (hors de l'accueil plein écran, de la barre du haut et du bas).
  return createPortal(
    <div className="vi-ov" role="dialog" aria-modal="true" aria-label="Image du verset" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="vi-sheet">
        <div className="vi-head">
          <b>Image du verset</b>
          <button className="rbubble-x" style={{ position: 'static' }} onClick={onClose} aria-label="Fermer">×</button>
        </div>
        <div className={`vi-prev vi-${o.format}`}>
          <canvas ref={cv} />
          {!ready && <span className="vi-wait">Préparation…</span>}
        </div>

        <div className="vi-k">Format</div>
        <div className="vi-chips">
          {FORMATS.map(f => <button key={f.id} className={o.format === f.id ? 'on' : ''} onClick={() => set({ format: f.id })}>{f.label}</button>)}
        </div>

        <div className="vi-k">Fond</div>
        <div className="vi-bgs">
          {BGS.map(b => (
            <button key={b.id} className={o.bg === b.id ? 'on' : ''} aria-label={b.label} title={b.label}
                    style={{ background: `linear-gradient(160deg, ${b.stops!.join(',')})` }} onClick={() => set({ bg: b.id })} />
          ))}
          <label className={`vi-photo${o.bg === 'photo' ? ' on' : ''}`} title="Ma photo">
            <input type="file" accept="image/*" onChange={e => onPhoto(e.target.files?.[0])} />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h3l2-2h6l2 2h3v12H4zM12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" /></svg>
          </label>
        </div>
        {scenes.length > 0 && (
          <>
            <div className="vi-k">Fonds pour ce verset</div>
            <div className="vi-scenes">
              {libs.map(id => (
                <button key={`l${id}`} className={o.bg === `lib:${id}` ? 'on' : ''} title="Photo" onClick={() => pickLib(id)}>
                  <img src={photoThumb(id)} alt="" loading="lazy" />
                </button>
              ))}
              {scenes.map(sc => {
                const Comp = sceneMod?.default;
                return (
                  <button key={sc.id} data-scene={sc.id} className={o.bg === `scene:${sc.id}` ? 'on' : ''} title={sc.label} onClick={() => pickScene(sc.id)}>
                    {Comp && <Comp id={sc.id} />}
                  </button>
                );
              })}
            </div>
          </>
        )}
        {(o.bg === 'photo' || o.bg.startsWith('scene:') || o.bg.startsWith('lib:')) && o.photo && (
          <>
            <label className="vi-range">Voile <input type="range" min="0.1" max="0.8" step="0.05" value={o.veil} onChange={e => set({ veil: +e.target.value })} /></label>
            <label className="vi-range">Flou <input type="range" min="0" max="12" step="1" value={o.blur} onChange={e => set({ blur: +e.target.value })} /></label>
          </>
        )}

        <div className="vi-k">Police</div>
        <div className="vi-chips vi-fonts">
          {FONTS.map(f => (
            <button key={f.id} className={o.font === f.id ? 'on' : ''} onClick={() => set({ font: f.id })}
                    style={{ fontFamily: `${f.family}, Georgia, serif`, fontStyle: f.italic ? 'italic' : 'normal' }}>{f.label}</button>
          ))}
        </div>
        <label className="vi-range">Taille <input type="range" min="0.6" max="1.4" step="0.05" value={o.size} onChange={e => set({ size: +e.target.value })} /></label>
        <div className="vi-chips" style={{ marginTop: 8 }}>
          <button className={o.align === 'center' ? 'on' : ''} onClick={() => set({ align: 'center' })} aria-label="Centré">≡ Centré</button>
          <button className={o.align === 'left' ? 'on' : ''} onClick={() => set({ align: 'left' })} aria-label="À gauche">☰ Gauche</button>
        </div>
        <label className="vi-sign"><input type="checkbox" checked={o.sign} onChange={e => set({ sign: e.target.checked })} /> Signature « Pain de Vie »</label>
        <label className={`vi-sign${medit ? '' : ' off'}`}>
          <input type="checkbox" checked={attach && !!medit} disabled={!medit} onChange={e => setAttach(e.target.checked)} />
          {medit ? 'Joindre la méditation complète au message' : 'Méditation pas encore écrite pour ce verset (ouvre « Méditer » d’abord)'}
        </label>

        <div className="vi-actions">
          <button className="btn primary" onClick={shareImg} disabled={!ready || busy}>{busy ? 'Préparation…' : 'Partager l’image'}</button>
          <button className="btn" onClick={save} disabled={!ready}>Enregistrer</button>
          <button className="btn" onClick={shareText}>{attach && medit ? 'Méditation (texte)' : 'Verset seul'}</button>
        </div>
        {afterShare && medit && (
          <div className="vi-after">
            <p>L’image est partie avec le début de la méditation. Envoie maintenant <b>la méditation complète</b> dans un second message (elle est aussi copiée : tu peux la coller).</p>
            <button className="btn primary" onClick={shareText}>Envoyer la méditation complète</button>
          </div>
        )}
        {msg && <p className="fine" style={{ textAlign: 'center', marginTop: 8 }}>{msg}</p>}
      </div>
    </div>,
    document.body
  );
}
