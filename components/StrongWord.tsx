'use client';
import { useState } from 'react';
import StrongModal from './StrongModal';

/**
 * Mot cliquable lié à un numéro Strong.
 * Ouvre StrongModal au clic (popover/modale).
 */
export default function StrongWord({
  label,
  code,
  title,
  className = ''
}: {
  label: React.ReactNode;
  code: string;
  title?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`strong-word${className ? ` ${className}` : ''}`}
        title={title ?? `Strong ${code}`}
        onClick={e => { e.stopPropagation(); setOpen(true); }}
      >
        {label}
      </button>
      {open && <StrongModal code={code} onClose={() => setOpen(false)} />}
    </>
  );
}
