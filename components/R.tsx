import { Fragment, type ReactNode } from 'react';

/**
 * Texte « riche » : les **gras** et *italiques* écrits par le modèle deviennent
 * un vrai gras / italique, sans astérisques visibles. Sûr (aucun HTML injecté).
 * Utilisable partout, côté serveur comme côté client :  <R t={fiche.definition} />
 */
export default function R({ t }: { t?: unknown }): ReactNode {
  if (typeof t !== 'string') return (t ?? null) as ReactNode;
  if (!/[*_]/.test(t)) return t;
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+?)\*\*|\*([^*\n]+?)\*|(?<![A-Za-z0-9])_([^_\n]+?)_(?![A-Za-z0-9])/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  const clean = (s: string) => s.replace(/\*+/g, '');           // astérisques orphelins (texte coupé)
  while ((m = re.exec(t))) {
    if (m.index > last) out.push(clean(t.slice(last, m.index)));
    if (m[1] !== undefined) out.push(<strong key={i++}>{m[1]}</strong>);
    else out.push(<em key={i++}>{m[2] ?? m[3]}</em>);
    last = re.lastIndex;
  }
  if (last < t.length) out.push(clean(t.slice(last)));
  return <Fragment>{out}</Fragment>;
}
