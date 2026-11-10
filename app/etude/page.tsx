import { redirect } from 'next/navigation';

// La Bible d'étude vit maintenant dans Lire (onglet « Étude »).
export default function Etude() {
  redirect('/lire?tab=etude');
}
