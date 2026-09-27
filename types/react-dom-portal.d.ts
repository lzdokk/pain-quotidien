// Types minimaux de react-dom (le paquet @types/react-dom n'est pas installe).
// Seul createPortal est utilise (Lire : livre · version · v. dans la barre du haut).
declare module 'react-dom' {
  import type { ReactNode, ReactPortal } from 'react';
  export function createPortal(children: ReactNode, container: Element | DocumentFragment): ReactPortal;
}
