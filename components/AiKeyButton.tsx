'use client';
import { useEffect, useState } from 'react';
import { hasAiKey, openAiSetup } from '@/lib/ai-key';

/** Carte « Mon assistant IA » : état de la clé + ouverture du guide. */
export default function AiKeyButton({ compact = false }: { compact?: boolean }) {
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    const up = () => setOn(hasAiKey());
    up(); window.addEventListener('pq-ai-key', up);
    return () => window.removeEventListener('pq-ai-key', up);
  }, []);
  return (
    <button className={`aikey-card${compact ? ' compact' : ''}`} onClick={openAiSetup}>
      <span className="aikey-ic" aria-hidden>✦</span>
      <span className="aikey-t">
        <b>Mon assistant IA</b>
        <small>{on === null ? '…' : on ? 'Clé Gemini active sur ce téléphone' : 'Ajoute ta clé Gemini gratuite'}</small>
      </span>
      <span className={`aikey-st${on ? ' ok' : ''}`}>{on ? '✓' : '›'}</span>
    </button>
  );
}
