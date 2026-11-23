import { redirect } from 'next/navigation';

// Les parcours d'étude vivent dans Lire > Parcours > Étude des livres.
export default function Etudier() {
  redirect('/lire?tab=parcours&vue=livres');
}
