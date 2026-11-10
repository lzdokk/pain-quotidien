/**
 * Pendant le passage d'une page à l'autre : la barre du haut reste en place
 * (elle vit dans le layout) et une fine barre de progression glisse en haut,
 * avec un squelette léger. Plus d'écran blanc avec une roue qui tourne.
 */
export default function Loading() {
  return (
    <>
      <div className="route-loading" aria-busy="true" aria-label="Chargement"><div className="rl-bar" /></div>
      <main className="wrap skel-page" aria-hidden="true">
        <div className="skel skel-eyebrow" />
        <div className="skel skel-title" />
        <div className="skel skel-lede" />
        <div className="skel skel-card" />
        <div className="skel skel-card short" />
      </main>
    </>
  );
}
