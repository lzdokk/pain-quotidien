'use client';
import { useState } from 'react';

export default function Openers({ items }: { items: string[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  const copy = (t: string, i: number) => {
    navigator.clipboard?.writeText(t);
    setCopied(i); setTimeout(() => setCopied(null), 1800);
  };
  return (
    <div className="card pad">
      <span className="kicker">Trois amorces de conversation</span>
      <h3 style={{ marginTop: 6 }}>Touchez pour copier</h3>
      {items.map((a, i) => (
        <div className="opener" key={i} onClick={() => copy(a, i)}
             style={copied === i ? { borderColor: 'var(--accent)' } : undefined}>
          {a}
        </div>
      ))}
    </div>
  );
}
