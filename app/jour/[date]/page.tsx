import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { admin } from '@/lib/supabase/admin';
import Shell from '@/components/Shell';

export const revalidate = 86400;

export async function generateStaticParams() {
  const { data } = await admin.from('daily_bread')
    .select('date').eq('published', true).order('date', { ascending: false }).limit(120);
  return (data ?? []).map(d => ({ date: d.date }));
}

export default async function Jour({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const sb = await supabaseServer();

  const { data: day } = await sb.from('daily_bread')
    .select('*').eq('date', date).eq('published', true).maybeSingle();
  if (!day) notFound();

  const { data: readings } = await sb.from('readings').select('*').eq('date', date).order('position');
  const { data: { user } } = await sb.auth.getUser();

  const { data: recent } = await sb.from('daily_bread')
    .select('date').eq('published', true).lte('date', date)
    .order('date', { ascending: false }).limit(10);
  const recentDays = (recent ?? []).map(d => d.date).reverse();

  return <Shell day={day} readings={readings ?? []} user={user} archive recentDays={recentDays} />;
}
