'use client';
import { useEffect, useState } from 'react';
import SignIn from './SignIn';

/**
 * Tour d'accueil, affiché une seule fois à la première ouverture (drapeau
 * localStorage « pq-onboarded »). Un petit mot de bienvenue, les fonctions
 * clés en quelques écrans, puis l'invitation à se connecter pour retrouver
 * ses surlignages et ses notes sur tous ses appareils.
 */
type Step = { eyebrow: string; title: string; body: React.ReactNode };

const STEPS: Step[] = [
  {
    eyebrow: 'Bienvenue',
    title: 'La Parole, chaque jour',
    body: (
      <>
        <p>
          Heureux de vous accueillir. <b>Pain de Vie</b> est pensé pour une chose :
          vous mettre devant le texte biblique chaque jour, simplement, et vous
          donner de quoi le comprendre et le prier.
        </p>
        <p>Trois minutes suffisent pour commencer. Laissez-moi vous montrer.</p>
      </>
    )
  },
  {
    eyebrow: 'Le rythme du jour',
    title: 'Un matin, un soir',
    body: (
      <>
        <p>
          Le <b>Pain du matin</b> vous donne le passage du jour, son cœur et une
          courte méditation. La <b>Prière</b> vous guide en quelques axes, et la
          <b> Veillée du soir</b> vous aide à relire votre journée devant Dieu.
        </p>
        <p>L'application s'ouvre là où vous vous étiez arrêté.</p>
      </>
    )
  },
  {
    eyebrow: 'La Parole en main',
    title: 'Lire, surligner, annoter',
    body: (
      <>
        <p>
          Dans <b>Lire</b>, toute la Bible est à vous. Touchez un verset pour le
          <b> surligner par couleur</b> : chaque couleur correspond à un thème
          (promesses, grâce, prière…), pour retrouver d'un coup d'œil ce qui vous
          a parlé.
        </p>
        <p>
          Vous pouvez aussi <b>annoter</b>, <b>comparer les traductions</b> et
          voir le mot à mot hébreu ou grec.
        </p>
      </>
    )
  },
  {
    eyebrow: 'Aller plus loin',
    title: 'Comprendre et grandir',
    body: (
      <>
        <p>
          La section <b>Apprendre</b> réunit les <b>paraboles</b>, les <b>mots</b>
          d'origine, les <b>versets</b> à connaître, une base de <b>questions</b>,
          et les <b>cinq fondements</b> de la foi protestante.
        </p>
        <p>
          Le <b>Cursus</b> vous propose, lui, une formation théologique complète,
          fiche après fiche.
        </p>
      </>
    )
  },
  {
    eyebrow: 'Votre environnement',
    title: 'Retrouvez tout, partout',
    body: (
      <>
        <p>
          En créant un compte gratuit, vos <b>surlignages</b>, vos <b>notes</b> et
          votre <b>progression de lecture</b> vous suivent sur tous vos appareils.
          Sans compte, vous pouvez tout explorer, mais rien n'est sauvegardé.
        </p>
      </>
    )
  }
];

export default function Onboarding() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem('pq-onboarded')) setOpen(true);
    } catch {}
  }, []);

  const close = () => {
    try { localStorage.setItem('pq-onboarded', '1'); } catch {}
    setOpen(false);
  };

  if (!open) return null;
  const last = i === STEPS.length - 1;
  const s = STEPS[i];

  return (
    <div className="ob" role="dialog" aria-modal="true" aria-label="Bienvenue">
      <div className="ob-card">
        <button className="ob-skip" onClick={close} aria-label="Fermer">Passer</button>

        <div className="ob-body">
          <span className="kicker">{s.eyebrow}</span>
          <h2 className="ob-title">{s.title}</h2>
          <div className="ob-text">{s.body}</div>

          {last && (
            <div className="ob-signin">
              <SignIn />
            </div>
          )}
        </div>

        <div className="ob-dots">
          {STEPS.map((_, k) => (
            <span key={k} className={`ob-dot${k === i ? ' on' : ''}`} />
          ))}
        </div>

        <div className="ob-nav">
          {i > 0 ? (
            <button className="btn" onClick={() => setI(i - 1)}>Précédent</button>
          ) : <span />}
          {last ? (
            <button className="btn primary" onClick={close}>Explorer l'application ›</button>
          ) : (
            <button className="btn primary" onClick={() => setI(i + 1)}>Suivant ›</button>
          )}
        </div>
      </div>
    </div>
  );
}
