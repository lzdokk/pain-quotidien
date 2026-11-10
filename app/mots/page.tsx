import { redirect } from 'next/navigation';

// Les mots hébreux sont maintenant dans Lire › Recherche.
export default function Mots() {
  redirect('/lire?tab=recherche&lexique=1');
}
