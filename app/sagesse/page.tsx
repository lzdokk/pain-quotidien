import SagesseView from './view';

export const metadata = { title: 'Sagesse du jour · Proverbes' };
// Le chapitre du jour (jour du mois) : page pré-générée, rafraîchie toutes les 10 min.
export const revalidate = 600;

export default function Sagesse() {
  return <SagesseView />;
}
