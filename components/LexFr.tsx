/**
 * Fiche du lexique Strong en français (levangile.com, avec l'accord de son
 * propriétaire) : définition, traductions dans la Louis Segond, origine, type.
 * fr_def ne contient que <ol>/<ul>/<li> (filtré à l'import et à l'enregistrement).
 */
type E = { fr_def?: string | null; fr_lsg?: string | null; fr_origine?: string | null; fr_type?: string | null };
export const hasLexFr = (e?: E | null) => !!(e && (e.fr_def || e.fr_lsg));

export default function LexFr({ e }: { e?: E | null }) {
  if (!e || !hasLexFr(e)) return null;
  return (
    <div className="lexfr">
      {e.fr_def && (
        <>
          <div className="sx-k">Définition{e.fr_type ? <span className="lexfr-type">{e.fr_type}</span> : null}</div>
          <div className="lexfr-def" dangerouslySetInnerHTML={{ __html: e.fr_def }} />
        </>
      )}
      {e.fr_lsg && (
        <>
          <div className="sx-k">Traduit dans la Louis Segond par</div>
          <p className="lexfr-p">{e.fr_lsg}</p>
        </>
      )}
      {e.fr_origine && (
        <>
          <div className="sx-k">Origine du mot</div>
          <p className="lexfr-p">{e.fr_origine}</p>
        </>
      )}
      <p className="lexfr-src">Lexique Strong français : levangile.com</p>
    </div>
  );
}
