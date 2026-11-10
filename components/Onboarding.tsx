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
          <b>Pain de Vie</b> vous met devant la Parole chaque jour, simplement, avec de
          quoi la comprendre et la prier.
        </p>
        <p>Tout part de l&rsquo;<b>Accueil</b> : un verset du jour et des tuiles pour aller partout d&rsquo;un toucher. La barre du bas vous suit sur chaque page.</p>
      </>
    )
  },
  {
    eyebrow: 'Votre temps avec Dieu',
    title: 'Pain du jour, prière, sagesse',
    body: (
      <>
        <p>Le <b>Pain du jour</b> : le passage, son cœur et une méditation.</p>
        <p>Le <b>Notre Père</b>, prié en trois temps : <b>adoration</b>, <b>louange</b>, <b>intercession</b>.</p>
        <p>La <b>Sagesse</b> : chaque jour son chapitre des Proverbes, entre deux prières.</p>
      </>
    )
  },
  {
    eyebrow: 'Lire',
    title: 'La Bible, et la Bible d’étude',
    body: (
      <>
        <p>
          Touchez un verset pour le <b>classer par couleur</b> (chaque couleur a son thème),
          l&rsquo;<b>annoter</b>, l&rsquo;<b>expliquer</b> ou le <b>comparer</b>.
        </p>
        <p>
          Passez en <b>Bible d&rsquo;étude</b> pour voir les fiches liées au chapitre, et touchez
          <b> א</b> pour le <b>Strong</b> : l&rsquo;hébreu ou le grec, mot par mot.
        </p>
      </>
    )
  },
  {
    eyebrow: 'Grandir',
    title: 'Récits et cursus',
    body: (
      <>
        <p>Les <b>Récits</b> : la théologie racontée, trois histoires par thème.</p>
        <p>Le <b>Cursus</b> : une formation biblique complète, fiche après fiche.</p>
      </>
    )
  },
  {
    eyebrow: 'Votre carnet',
    title: 'Retrouvez tout, partout',
    body: (
      <>
        <p>
          Avec un compte gratuit, vos <b>couleurs</b>, vos <b>notes</b> et votre
          <b> progression</b> vous suivent sur tous vos appareils.
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
      if (!localStorage.getItem('pq-onboarded-2')) setOpen(true);
    } catch {}
  }, []);

  const close = () => {
    try { localStorage.setItem('pq-onboarded-2', '1'); } catch {}
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
