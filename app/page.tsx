import { redirect } from 'next/navigation';
import { parisHour } from '@/lib/date';

// L'ouverture de l'application depend de l'heure (Paris) :
//   • de 20h a 3h du matin  -> la veillee du soir
//   • le reste de la journee -> le temps de priere (avec, en bas, un bouton
//     vers le pain quotidien)
// La page du matin reste accessible a tout moment via /pain et l'onglet Matin.
export const dynamic = 'force-dynamic';

export default function Home() {
  const h = parisHour();
  redirect(h >= 20 || h < 3 ? '/soir' : '/priere');
}
