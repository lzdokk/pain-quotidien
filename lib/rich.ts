/**
 * Convertit le balisage d'emphase Markdown en HTML, pour les textes generes
 * par le modele qui ecrit parfois **gras** ou *italique* (souvent pour une
 * parole citee). Sans cette conversion, les asterisques restaient affiches
 * tels quels. A utiliser via dangerouslySetInnerHTML.
 *
 *   **texte**  -> <strong>texte</strong>
 *   *texte*    -> <em>texte</em>
 *   _texte_    -> <em>texte</em>
 */
export function rich(s?: string | null): string {
  if (!s) return '';
  return String(s)
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/(?<![A-Za-z0-9])_([^_\n]+?)_(?![A-Za-z0-9])/g, '<em>$1</em>');
}
