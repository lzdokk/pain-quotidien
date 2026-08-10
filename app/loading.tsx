/**
 * Écran de chargement affiché automatiquement par Next.js pendant la
 * navigation d'une page à l'autre : un logo qui tourne, au centre.
 * Améliore nettement la sensation de rapidité.
 */
export default function Loading() {
  return (
    <div className="route-loading" aria-busy="true" aria-label="Chargement">
      <svg className="route-spin" viewBox="0 0 50 50" width="46" height="46" aria-hidden="true">
        <circle cx="25" cy="25" r="20" fill="none" stroke="var(--line-2)" strokeWidth="4" />
        <circle cx="25" cy="25" r="20" fill="none" stroke="var(--accent)" strokeWidth="4"
                strokeLinecap="round" strokeDasharray="90 150" />
      </svg>
    </div>
  );
}
