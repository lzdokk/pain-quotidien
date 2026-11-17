import PriereView from './view';

export const revalidate = 300;
export const metadata = { title: 'Prière' };

/** Prière du jour (aujourd'hui). Un autre jour : /priere/AAAA-MM-JJ. */
export default function Priere() {
  return <PriereView />;
}
