/**
 * Renomme le code d'un cours à l'affichage, pour ne pas reprendre le modèle
 * ITB : les codes en base restent inchangés (contenus, progression, URLs),
 * seul l'affichage change. Idempotent (un code déjà renommé reste tel quel).
 *   UBxxx  -> NBxxx   (Niveau Base)
 *   U1..U5 -> NA1..NA5 (Niveau Approfondissement)
 *   UGCxx  -> EGAxx   (Étude du Grec Ancien)
 */
export function relabelCode(code: string): string {
  if (!code) return code;
  if (code.startsWith('UGC')) return 'EGA' + code.slice(3);
  if (code.startsWith('UB')) return 'NB' + code.slice(2);
  const m = code.match(/^U([1-9].*)$/);
  if (m) return 'NA' + m[1];
  return code;
}
