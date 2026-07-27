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

    /** Decoupe un texte en lignes qui tiennent dans la largeur donnee. */
    const wrap = (t: string, max: number) => {
      const out: string[] = []; let line = '';
      t.split(' ').forEach(w => {
        const test = line ? `${line} ${w}` : w;
        if (x.measureText(test).width > max && line) { out.push(line); line = w; } else line = test;
      });
      if (line) out.push(line);
      return out;
    };

    x.fillStyle = acc; x.font = '700 30px -apple-system,Helvetica,Arial';
    x.fillText('LE PAIN QUOTIDIEN', W / 2, 280);

    // Le titre du jour, ce qui accroche le regard
    const plainTitle = title.replace(/<br\s*\/?>/g, ' ').trim();
    x.fillStyle = ink; x.font = '600 62px Georgia,serif';
    const tLines = wrap(plainTitle, 840);
    let ty = 420;
    tLines.forEach(l => { x.fillText(l, W / 2, ty); ty += 76; });

    // Le verset, au centre
    x.fillStyle = ink; x.font = 'italic 500 64px Georgia,serif';
    const vLines = wrap(`« ${verse} »`, 820);
    let y = Math.max(ty + 180, H / 2 - (vLines.length - 1) * 48);
    vLines.forEach(l => { x.fillText(l, W / 2, y); y += 96; });

    x.fillStyle = acc; x.font = '600 32px -apple-system,Helvetica,Arial';
    x.fillText(`${ref_.toUpperCase()}  ·  SEGOND`, W / 2, y + 40);

    // La phrase qui touche
    if (lede) {
      x.fillStyle = soir ? '#A9B6C4' : '#5A6673';
      x.font = '400 38px -apple-system,Helvetica,Arial';
      let ly = y + 150;
      wrap(lede, 820).slice(0, 4).forEach(l => { x.fillText(l, W / 2, ly); ly += 54; });
    }

    x.fillStyle = soir ? '#5E6A76' : '#8894A2'; x.font = '400 27px -apple-system,Helvetica,Arial';
    x.fillText(`@${process.env.NEXT_PUBLIC_INSTAGRAM ?? 'lepainquotidien'}`, W / 2, H - 250);

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
