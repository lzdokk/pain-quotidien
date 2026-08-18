'use client';
import { useState } from 'react';

/**
 * Bloc « Partager l'application » : un petit mot prêt à envoyer qui explique
 * ce que l'app apporte, tout en rappelant que c'est l'Esprit qui éclaire la
 * Parole — l'app n'y ajoute que de la connaissance et de la réflexion.
 * Bouton de partage natif (WhatsApp, SMS, mail…) et copie du texte.
 */
export default function SharePitch({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const speech =
`Je te partage une application qui m'accompagne chaque jour dans la Parole : « Pain de Vie ».

Chaque matin, elle propose un passage, une courte méditation et un temps de prière. On y lit toute la Bible, on surligne les versets par thème, on garde ses notes, et on peut creuser plus loin : paraboles, mots d'origine en hébreu et en grec, une base de questions, un cursus de théologie, et les cinq fondements de la foi.

Bien sûr, c'est l'Esprit de Dieu qui éclaire et fait vivre l'Écriture, et aucune application ne remplacera jamais cela. Mais celle-ci peut y ajouter de la connaissance et de la réflexion, comme un bon outil dans la main : de quoi mieux comprendre ce que l'on lit, et le méditer plus en profondeur.

Essaie, tu me diras :
${url}`;

  const share = async () => {
    const nav: any = typeof navigator !== 'undefined' ? navigator : null;
    if (nav?.share) {
      try { await nav.share({ title: 'Pain de Vie', text: speech }); return; } catch { /* repli copie */ }
    }
    try { await nav?.clipboard?.writeText(speech); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  const copy = async () => {
    try {
      await navigator?.clipboard?.writeText(speech);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="card pad sharepitch">
      <span className="kicker">Partager l'application</span>
      <h3 style={{ marginTop: 8, marginBottom: 12 }}>Un mot prêt à envoyer</h3>
      <div className="sharepitch-text">
        {speech.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <div className="share-grid" style={{ marginTop: 18 }}>
        <button className="btn primary" onClick={share}>Partager ›</button>
        <button className="btn" onClick={copy}>{copied ? 'Texte copié ✓' : 'Copier le texte'}</button>
      </div>
    </div>
  );
}
