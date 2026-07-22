'use client';
import { useRef } from 'react';

type P = { verse: string; ref_: string; title: string; lede: string; date: string };

export default function ShareBar({ verse, ref_, title, lede, date }: P) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const link = typeof window !== 'undefined' ? `${location.origin}/jour/${date}` : '';
  const text = `${verse}\n${ref_} (Segond)\n\n${title.replace(/<br\s*\/?>/g, ' ')}\n${lede}\n\nLe pain quotidien du jour :\n${link}`;

  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: 'Le Pain quotidien', text }); } catch {} }
    else navigator.clipboard?.writeText(text);
  };

  const story = () => {
    const c = canvas.current!; const x = c.getContext('2d')!;
    const soir = document.documentElement.dataset.mode === 'soir';
    const W = 1080, H = 1920;
    const bg = soir ? '#0E141A' : '#FBFBFC', ink = soir ? '#EDF1F5' : '#1A222B', acc = soir ? '#8FA9C4' : '#4E6A85';
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W / 2, 340, 0, W / 2, 340, 780);
    g.addColorStop(0, soir ? 'rgba(143,169,196,.16)' : 'rgba(78,106,133,.14)');
    g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);

    x.textAlign = 'center';
    x.fillStyle = acc; x.font = '700 30px -apple-system,Helvetica,Arial';
    x.fillText('LE PAIN QUOTIDIEN', W / 2, 300);

    x.fillStyle = ink; x.font = '500 70px Georgia,serif';
    const words = verse.split(' '); let line = ''; const lines: string[] = [];
    words.forEach(w => {
      const t = line ? `${line} ${w}` : w;
      if (x.measureText(t).width > 820 && line) { lines.push(line); line = w; } else line = t;
    });
    lines.push(line);
    let y = H / 2 - (lines.length - 1) * 52;
    lines.forEach(l => { x.fillText(l, W / 2, y); y += 104; });

    x.fillStyle = acc; x.font = '600 32px -apple-system,Helvetica,Arial';
    x.fillText(`${ref_.toUpperCase()}  ·  SEGOND`, W / 2, y + 46);
    x.fillStyle = soir ? '#5E6A76' : '#8894A2'; x.font = '400 27px -apple-system,Helvetica,Arial';
    x.fillText('painquotidien.app', W / 2, H - 250);

    c.toBlob(b => {
      const u = URL.createObjectURL(b!); const a = document.createElement('a');
      a.href = u; a.download = `pain-quotidien-${date}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(u), 1500);
    }, 'image/png');
  };

  return (
    <div className="card pad">
      <div className="share-grid">
        <button className="btn primary" onClick={share}>Partager</button>
        <button className="btn" onClick={() => navigator.clipboard?.writeText(text)}>Copier le texte</button>
        <button className="btn" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')}>WhatsApp</button>
        <button className="btn" onClick={story}>Image story</button>
      </div>
      <div className="preview">{text}</div>
      <canvas ref={canvas} width={1080} height={1920} style={{ display: 'none' }} />
    </div>
  );
}
