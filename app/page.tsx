import { redirect } from 'next/navigation';

// L'application s'ouvre toujours sur le Pain du matin.
// (La reprise de lecture reste accessible via la bannière « Reprendre votre
//  lecture » sur les pages Matin / Prière / Soir.)
export const dynamic = 'force-dynamic';

export default function Home() {
  redirect('/pain');
}
