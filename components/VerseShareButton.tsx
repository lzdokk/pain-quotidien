'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const VerseImage = dynamic(() => import('./VerseImage'), { ssr: false });

/** « Partager ce verset » : ouvre l'image du verset, avec la méditation du jour jointe au message. */
export default function VerseShareButton({ text, refLabel, message, label = 'Partager ce verset', className = 'btn sm' }:
  { text: string; refLabel: string; message?: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>{label}</button>
      {open && <VerseImage text={text} refLabel={refLabel} message={message} onClose={() => setOpen(false)} />}
    </>
  );
}
