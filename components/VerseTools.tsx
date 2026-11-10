'use client';
import { useEffect, useState } from 'react';
import { HL_THEMES, themeOf } from '@/lib/highlight-themes';

type Props = {
  refLabel: string;
  text: string;
  color: number;                                   // couleur actuelle (0 = aucune)
  suggestion?: { color: number; label: string } | null;
  hasNote: boolean;
  multiOn: boolean;
  open?: { explain?: boolean; strong?: boolean; compare?: boolean; note?: boolean };
  onClose: () => void;
  onColor: (c: number) => void;
  onNote: () => void;
  onExplain: () => void;
  onStrong: () => void;
  onCompare: () => void;
  onMulti: () => void;
  children?: React.ReactNode;                      // note, explication, Strong, comparaison…
};

const Ic = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

/**
 * Le volet d'un verset : compact, des boutons rangés en grille (icône +
 * mot), et « Classer » qui se déplie pour montrer les couleurs AVEC leur
 * thème (sur mobile, on ne peut pas survoler).
 */
export default function VerseTools(p: Props) {
  const [classer, setClasser] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setClasser(false); }, [p.refLabel]);

  const full = `« ${p.text} » ${p.refLabel}`;
  const share = async () => {
    const nav: any = navigator;
    if (nav?.share) { try { await nav.share({ text: full }); return; } catch { /* repli : copie */ } }
    copy();
  };
  const copy = async () => {
    try { await navigator.clipboard?.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  const cur = p.color ? themeOf(p.color) : null;

  const btn = (key: string, label: string, icon: React.ReactNode, onClick: () => void, on = false) => (
    <button key={key} className={`vt-btn${on ? ' on' : ''}`} onClick={onClick}>
      <span className="vt-ic">{icon}</span>
      <span className="vt-l">{label}</span>
    </button>
  );

  return (
    <>
      <div className="vt-head">
        <span className="vref">{p.refLabel}</span>
        <button className="vbar-x" onClick={p.onClose} aria-label="Fermer">✕</button>
      </div>

      <div className="vt-grid">
        {btn('classer', cur ? 'Classé' : 'Classer',
          <span className={`vt-dot${p.color ? ` s${p.color}` : ''}`} />, () => setClasser(o => !o), classer)}
        {btn('note', p.hasNote ? 'Ma note' : 'Note', <Ic d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />, p.onNote, !!p.open?.note)}
        {btn('explain', 'Expliquer', <Ic d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />, p.onExplain, !!p.open?.explain)}
        {btn('strong', 'Strong', <span className="vt-he">א</span>, p.onStrong, !!p.open?.strong)}
        {btn('compare', 'Comparer', <Ic d="M4 5.5C6.5 5 8.5 5.3 10 6.5V19c-1.5-1.2-3.5-1.5-6-1V5.5zM20 5.5c-2.5-.5-4.5-.2-6 1V19c1.5-1.2 3.5-1.5 6-1V5.5z" />, p.onCompare, !!p.open?.compare)}
        {btn('share', 'Partager', <Ic d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" />, share)}
        {btn('copy', copied ? 'Copié ✓' : 'Copier', <Ic d="M9 9h10v12H9zM5 15V3h10" />, copy)}
        {btn('multi', p.multiOn ? 'Retirer' : 'Plusieurs', <Ic d={p.multiOn ? 'M5 12h14' : 'M12 5v14M5 12h14'} />, p.onMulti, p.multiOn)}
      </div>

      {classer && (
        <div className="vt-colors">
          {p.suggestion && p.suggestion.color !== p.color && (
            <p className="vt-sug">✨ Suggéré pour ce verset : <b>{p.suggestion.label}</b></p>
          )}
          {HL_THEMES.map(t => (
            <button key={t.color}
                    className={`vt-color${p.color === t.color ? ' on' : ''}${p.suggestion?.color === t.color ? ' sug' : ''}`}
                    onClick={() => { p.onColor(t.color); setClasser(false); }}>
              <span className={`swatch s${t.color}`} />
              <span className="vt-ct">{t.label}</span>
              {p.color === t.color && <span className="vt-check">✓</span>}
            </button>
          ))}
          {p.color > 0 && (
            <button className="vt-color vt-remove" onClick={() => { p.onColor(0); setClasser(false); }}>
              <span className="swatch s0" /><span className="vt-ct">Retirer la couleur</span>
            </button>
          )}
        </div>
      )}

      {p.children}
    </>
  );
}
