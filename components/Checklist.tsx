'use client';
import { useState } from 'react';

const Tick = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5.5 5.5L20 7" /></svg>
);

export default function Checklist({ title, items, onToggle, initial = [] }:
  { title: string; items: Array<{ title: string; body: string }>; onToggle?: (i: number, on: boolean) => void; initial?: number[] }) {
  const [done, setDone] = useState<Set<number>>(new Set(initial));

  const toggle = (i: number) => {
    const next = new Set(done);
    const on = !next.has(i);
    on ? next.add(i) : next.delete(i);
    setDone(next); onToggle?.(i, on);
  };

  return (
    <div className="card pad">
      <span className="kicker">{title}</span>
      <ul className="steps">
        {items.map((a, i) => (
          <li key={i} className={done.has(i) ? 'done' : ''}>
            <button className="tick" aria-pressed={done.has(i)} onClick={() => toggle(i)} aria-label="Fait"><Tick /></button>
            <span className="st-txt"><b>{a.title}</b> {a.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
