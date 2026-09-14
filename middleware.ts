import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Ouverture de l'application : TOUJOURS sur le pain du matin (/pain).
 * En middleware (edge), la redirection est executee AVANT tout cache et sur
 * chaque requete : c'est fiable, contrairement a un redirect() de page qui
 * peut etre fige par le cache de build. La priere et la veillee du soir
 * restent accessibles par les onglets Priere / Soir.
 */
export function middleware(req: NextRequest) {
  return NextResponse.redirect(new URL('/pain', req.url));
}

// Ne s'applique qu'a la racine exacte.
export const config = { matcher: '/' };
