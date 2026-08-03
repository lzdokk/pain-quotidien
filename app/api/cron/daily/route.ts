import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { contentDate } from '@/lib/date';

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
  const today = contentDate();

  const { data } = await admin.from('daily_bread')
    .select('date, published').eq('date', today).maybeSingle();

  // Filet de securite : la journee du jour manque (l'hebdomadaire n'a pas
  // tourne, ou a echoue). On la genere IMMEDIATEMENT et pour CE jour precis
  // (from=today&days=1), sans quoi on generait demain et le lecteur resterait
  // sur « le pain arrive bientot ».
  if (!data) {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/weekly?from=today&days=1&skip=0`,
      { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } }
    ).then(x => x.json()).catch(() => null);
    // Si la generation a reussi, on publie dans la foulee.
    const { data: fresh } = await admin.from('daily_bread')
      .select('date').eq('date', today).maybeSingle();
    if (fresh) {
      await admin.from('daily_bread').update({ published: true }).eq('date', today);
      revalidatePath('/pain'); revalidatePath('/priere'); revalidatePath('/soir');
      revalidatePath(`/jour/${today}`);
      return NextResponse.json({ ok: true, recovered: true, published: today });
    }
    return NextResponse.json({ ok: false, recovered: false, date: today, gen: r });
  }

  await admin.from('daily_bread').update({ published: true }).eq('date', today);
  revalidatePath('/pain');
  revalidatePath('/priere');
  revalidatePath('/soir');
  revalidatePath(`/jour/${today}`);
  return NextResponse.json({ ok: true, published: today });
}
