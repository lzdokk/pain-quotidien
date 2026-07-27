import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * PUBLICATION QUOTIDIENNE
 * Publie la journée du jour, déjà générée la semaine precedente,
 * puis regenere les pages statiques. Filet de securite : si aucune
 * journée n'existe pour aujourd'hui, on declenche la génération
 * hebdomadaire en urgence.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await admin.from('daily_bread')
    .select('date, published').eq('date', today).maybeSingle();

  if (!data) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/weekly`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }
    });
    return NextResponse.json({ ok: false, recovered: true, date: today });
  }

  await admin.from('daily_bread').update({ published: true }).eq('date', today);
  revalidatePath('/');
  revalidatePath(`/jour/${today}`);
  return NextResponse.json({ ok: true, published: today });
}
