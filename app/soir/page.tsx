import { redirect } from 'next/navigation';

// « Soir » est remplacé par « Sagesse » (Proverbes du jour), lisible à toute heure.
export default function Soir() {
  redirect('/sagesse');
}
