'use client';
import { openAiSetup } from '@/lib/ai-key';

/** Petite carte quand une génération IA demande la clé Gemini du lecteur. */
export default function NeedKey({ what = 'cette explication', msg }: { what?: string; msg?: string }) {
  return (
    <div className="needkey">
      <p>{msg ?? `Pour générer ${what}, ajoute ta clé Gemini gratuite (2 minutes, une seule fois).`}</p>
      <button className="btn sm primary" onClick={openAiSetup}>Ajouter ma clé</button>
    </div>
  );
}
