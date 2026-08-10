'use client';
import { useState } from 'react';
import Link from 'next/link';
import { HL_THEMES } from '@/lib/highlight-themes';

type Item = { color: number; ref: string; text: string; href: string };

export default function SurlignesView({ items }: { items: Item[] }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const filtered = query
    ? items.filter(it => `${it.ref} ${it.text}`.toLowerCase().includes(query))
    : items;

  return (
    <>
      <div className="card pad">
        <input className="field" type="search" value={q} onChange={e => setQ(e.target.value)}
               placeholder="Chercher dans mes surlignés (référence ou mot)…" />
        {query && <p className="fine" style={{ marginTop: 8 }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </p>}
      </div>

      {filtered.length === 0 ? (
        <div className="card pad">
          <p className="empty">Aucun surlignage {query ? 'ne correspond à cette recherche' : "pour l'instant"}.</p>
        </div>
      ) : HL_THEMES.map(th => {
        const list = filtered.filter(it => it.color === th.color);
        if (list.length === 0) return null;
        return (
          <section key={th.color} className="card pad" style={{ marginTop: 16 }}>
            <div className="sl-th">
              <span className={`swatch s${th.color}`} />
              <div className="sl-th-txt">
                <strong>{th.label}</strong>
                <span className="sl-hint">{th.hint}</span>
              </div>
              <span className="sl-count">{list.length}</span>
            </div>
            <div className="sl-list">
              {list.map(it => (
                <Link key={`${it.href}-${it.ref}`} className="sl-item" href={it.href}>
                  <span className="sl-ref">{it.ref}</span>
                  {it.text && <span className="sl-text">{it.text}</span>}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
