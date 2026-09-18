import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { bdsTranslation, readingsWithTranslation, citedVerse } from '@/lib/bible';
import { contentDate } from '@/lib/date';
import Shell from '@/components/Shell';

// Une page admin peut charger un jour manquant : pas de cache fige.
export const dynamic = 'force-dynamic';

const ADMINS = (process.env.CURSUS_ADMINS ?? 'lzdokk@gmail.com')
  .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

function lastDates(today: string, n: number): string[] {
  const [y, m, d] = today.split('-').map(Number);
  const base = Date.UTC(y, m - 1, d);
  return Array.from({ length: n }, (_, i) =>
    new Date(base - i * 86400000).toISOString().slice(0, 10));
}

export default async function Jour({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const sb = await supabaseServer();

  const { data: day } = await sb.from('daily_bread')
    .select('*').eq('date', date).eq('published', true).maybeSingle();
  if (!day) notFound();

  const { data: readings } = await sb.from('readings').select('*').eq('date', date).order('position');
  const bds = await bdsTranslation();
  const readingsBds = await readingsWithTranslation(readings ?? [], bds.code);
  const { data: { user } } = await sb.auth.getUser();

  const isAdmin = !!user?.email && ADMINS.includes(user.email.toLowerCase());
  const today = contentDate();

  const { data: recent } = await sb.from('daily_bread')
    .select('date').eq('published', true).lte('date', today)
    .order('date', { ascending: false }).limit(62);
  const recentDays = (recent ?? []).map(d => d.date).reverse();

  const publishedSet = new Set(recentDays);
  const missingDays = isAdmin
    ? lastDates(today, 14).filter(d => !publishedSet.has(d))
    : [];

  const memVerse = await citedVerse(day.verse_ref, day.verse_text);

  return <Shell day={day} readings={readingsBds} user={user} archive recentDays={recentDays}
                translationName={bds.name}
                missingDays={missingDays} isAdmin={isAdmin} todayDate={today}
                verseText={memVerse.text} verseName={memVerse.name} />;
}
