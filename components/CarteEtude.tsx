'use client';
import { useSuivi, etatParcours } from './EtudierProgress';
import { parcoursById } from '@/lib/parcours';
import { BOOKS } from '@/lib/refs';

/** Carte « Votre parcours » : prend la place de « Votre lecture du jour » quand un parcours d'étude est suivi. */
export default function CarteEtude({ onRead, onStudy, onFiche, onList }: {
  onRead: (book: number, ch: number) => void;
  onStudy: (book: number, ch: number) => void;
  onFiche: (book: number) => void;
  onList: () => void;
}) {
  const { actif, done, lus, lire, reprendre } = useSuivi();
  const p = actif ? parcoursById(actif) : undefined;
  if (!p) return null;
  const { etapes, courant, faites } = etatParcours(p, { actif, done, lus });
  const fini = courant < 0;
  const e = fini ? etapes[etapes.length - 1] : etapes[courant];
  if (!e) return null;
  const nom = BOOKS[e.book - 1][1];
  const pct = Math.round(faites / etapes.length * 100);
  const suite = etapes.slice(courant + 1, courant + 4);

  return (
    <div className="card">
      <div className="today-read tr-flex">
        <div className="tr-main">
          <span className="kicker">Votre parcours · {p.titre}</span>
          {fini ? (
            <>
              <div className="big-ref">Parcours terminé</div>
              <p style={{ color: 'var(--ink-2)', fontSize: 15.5 }}>Bravo : {etapes.length} étapes lues. Choisis le parcours suivant dans la liste ci-dessous.</p>
              <div className="share-grid" style={{ marginTop: 20 }}><button className="btn primary" onClick={onList}>Choisir un parcours</button><button className="btn" onClick={() => reprendre(p.id, 0)}>↺ Recommencer</button></div>
            </>
          ) : (
            <>
              <div className="big-ref">{nom} {e.prochain}</div>
              <p style={{ color: 'var(--ink-2)', fontSize: 15.5 }}>
                Étape {courant + 1} sur {etapes.length} · {e.label}
                {e.chapters.length > 1 ? ` · ${e.lus} chapitre${e.lus > 1 ? 's' : ''} lu${e.lus > 1 ? 's' : ''} sur ${e.chapters.length}` : ''}
              </p>
              <div className="progress-wrap">
                <div className="bar"><i style={{ width: `${Math.max(2, pct)}%` }} /></div>
                <span className="pct">{pct} %</span>
              </div>
              <div className="share-grid" style={{ marginTop: 20 }}>
                <button className="btn primary" onClick={() => onRead(e.book, e.prochain)}>Ouvrir la lecture</button>
                <button className="btn" onClick={() => onStudy(e.book, e.prochain)}>Étudier ce chapitre</button>
                <button className="btn" onClick={() => lire(e.book, e.prochain)}>J&rsquo;ai lu, chapitre suivant</button>
              </div>
              <button className="pe-back" style={{ marginTop: 10, fontWeight: 500, fontSize: 14 }}
                onClick={() => { try { if (!window.confirm('Recommencer ce parcours au début ?')) return; } catch {} reprendre(p.id, 0); }}>↺ Recommencer ce parcours</button>
            </>
          )}
        </div>
        {!fini && (
          <div className="tr-side">
            <span className="tr-side-t">Accès direct</span>
            <button className="tr-jump" onClick={() => onFiche(e.book)}><span>Fiche de {nom}</span><span className="tr-jump-go">›</span></button>
            {suite.map(x => (
              <button key={x.i} className="tr-jump" onClick={() => onFiche(x.book)}>
                <span>Ensuite : {x.label}</span><span className="tr-jump-go">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
