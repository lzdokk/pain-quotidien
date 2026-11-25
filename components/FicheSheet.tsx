'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import RefChip from './RefChip';
import { getFiche, kindLabel } from '@/lib/study-client';
import { slugify } from '@/lib/prompts/slug';
import R from '@/components/R';
import { SrcDico, SrcFiche, titleKey } from './SrcBadge';

type Section = { title: string; items: Array<{ label: string; refs: string[] }> };

// Gras **…** et italiques *…* du texte des fiches.
const rich = (s: string) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+?)\*/g, '<em>$1</em>');

/**
 * Une fiche de la Bible d'étude, ouverte sur place dans une feuille.
 * Chaque référence se lit d'un toucher (avec toutes les actions verset) ;
 * « Voir aussi » ouvre la fiche suivante dans la même feuille (retour possible).
 */
export default function FicheSheet({ slug, onClose, onDico }: {
  slug: string | null; onClose: () => void;
  /** Ouvre l'article du dictionnaire Westphal du même nom. */
  onDico?: (id: number) => void;
}) {
  const [stack, setStack] = useState<string[]>([]);
  const [data, setData] = useState<any>(undefined);
  const [dico, setDico] = useState<{ id: number; titre: string } | null>(null);
  const cur = stack[stack.length - 1] ?? null;

  useEffect(() => { setStack(slug ? [slug] : []); }, [slug]);
  useEffect(() => {
    if (!cur) return;
    let alive = true;
    setData(undefined);
    setDico(null);
    getFiche(cur).then(d => {
      if (!alive) return;
      setData(d);
      // Article du dictionnaire du même nom (même mot, sans accents ni pluriel).
      if (d?.title && onDico) fetch(`/api/dict?t=${encodeURIComponent(d.title)}`).then(r => r.ok ? r.json() : null)
        .then(a => { if (alive && a?.id && titleKey(a.titre) === titleKey(d.title)) setDico(a); }).catch(() => {});
    });
    return () => { alive = false; };
  }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cur) return null;
  const sections = (data?.sections ?? []) as Section[];
  const total = sections.reduce((n, s) => n + s.items.reduce((m, it) => m + it.refs.length, 0), 0);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="rsheet-back" onClick={onClose}>
      <div className="rsheet fiche-sheet" onClick={e => e.stopPropagation()}>
        <div className="rsheet-grip" />
        <div className="fiche-top">
          {stack.length > 1
            ? <button className="fiche-back" onClick={() => setStack(s => s.slice(0, -1))}>‹ Retour</button>
            : <span />}
          <button className="vbar-x" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {data === undefined ? <p className="empty">Ouverture de la fiche…</p>
          : data === null ? <p className="empty">Cette fiche est en préparation : elle arrive bientôt.</p>
          : (
            <>
              <div className="src-row"><SrcFiche long /></div>
              <span className="kicker">{kindLabel(data.kind)}{data.kind === 'theme' && data.category ? ` · ${data.category}` : ''}</span>
              <h2 className="fiche-title">{data.title}</h2>
              {data.definition && <p className="ix-def" dangerouslySetInnerHTML={{ __html: rich(data.definition) }} />}
              <p className="ix-meta">{total} passage{total > 1 ? 's' : ''} · touchez une référence pour la lire</p>
              {dico && onDico && (
                <button className="src-link" onClick={() => onDico(dico.id)}>
                  <SrcDico long /><span>Lire l&rsquo;article « {dico.titre} » du dictionnaire</span><i>›</i>
                </button>
              )}

              {sections.map((s, i) => (
                <section className="fiche-sec" key={i}>
                  <h3>{s.title}</h3>
                  <ul className="ix-items">
                    {s.items.map((it, j) => (
                      <li key={j}>
                        <span className="ix-label" dangerouslySetInnerHTML={{ __html: rich(it.label) }} />
                        <span className="ix-refs">{it.refs.map(r => <RefChip key={r} r={r} />)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {(data.see_also ?? []).length > 0 && (
                <div className="fiche-sec">
                  <h3>Voir aussi</h3>
                  <div className="ix-chips">
                    {(data.see_also as string[]).map(t => (
                      <button key={t} className="ix-chip" onClick={() => setStack(s => [...s, slugify(t)])}>{t}</button>
                    ))}
                  </div>
                </div>
              )}
              <p className="ix-note">✦ Fiche rédigée pour Pain de Vie avec l&rsquo;aide de l&rsquo;IA ; chaque référence a été vérifiée. Lis toujours le passage dans son contexte.</p>
            </>
          )}
      </div>
    </div>, document.body
  );
}
