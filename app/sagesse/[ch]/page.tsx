import SagesseView from '../view';

export const revalidate = 86400;
export const generateStaticParams = () => Array.from({ length: 31 }, (_, i) => ({ ch: String(i + 1) }));
export const metadata = { title: 'Proverbes · Sagesse' };

export default async function SagesseChapitre({ params }: { params: Promise<{ ch: string }> }) {
  const { ch } = await params;
  return <SagesseView chapter={Number(ch)} />;
}
