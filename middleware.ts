import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Ouverture de l'application selon l'heure de Paris :
 *   • de 20h a 3h du matin  -> la veillee du soir
 *   • le reste de la journee -> le temps de priere
 * En middleware (edge), la redirection est executee AVANT tout cache et sur
 * chaque requete : c'est fiable, contrairement a un redirect() de page qui
 * peut etre fige par le cache de build. Le pain quotidien reste accessible
 * via /pain (onglet Matin) et le bouton en bas de la page Priere.
 */
export function middleware(req: NextRequest) {
  const h = Number(new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', hour: '2-digit', hour12: false
  }).format(new Date()));
  const dest = (h >= 20 || h < 3) ? '/soir' : '/priere';
  return NextResponse.redirect(new URL(dest, req.url));
}

// Ne s'applique qu'a la racine exacte.
export const config = { matcher: '/' };
