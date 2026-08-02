import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/supabase/admin';
import { contentDate } from '@/lib/date';

export const dynamic = 'force-dynamic';
// AJOUT IMPORTANT : Si le filet de sécurité se déclenche, Vercel a besoin de temps 
// pour générer le jour manquant via l'IA. On lui donne le maximum (5 minutes).
export const maxDuration = 300; 

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const today = contentDate();

  const { data } = await admin.from('daily_bread')
    .select('date, published').eq('date', today).maybeSingle();

  if (!data) {
    // CORRECTION : On cible EXCLUSIVEMENT aujourd'hui pour rattraper le coup, et 1 seul jour.
    // L'utilisation de req.headers.get('host') évite un plantage si NEXT_PUBLIC_SITE_URL n'est pas bien lu par le Cron
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.get('host')}`;
    
    await fetch(`${baseUrl}/api/cron/weekly?from=today&days=1`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }
    });

    // Maintenant que le jour a été généré en urgence, on LE PUBLIE.
    await admin.from('daily_bread').update({ published: true }).eq('date', today);
    revalidatePath('/pain');
    revalidatePath('/priere');
    revalidatePath('/soir');
    revalidatePath(`/jour/${today}`);
    
    return NextResponse.json({ ok: true, recovered: true, date: today });
  }

  // Comportement normal : le jour existait déjà
  if (!data.published) {
    await admin.from('daily_bread').update({ published: true }).eq('date', today);
  }
  
  revalidatePath('/pain');
  revalidatePath('/priere');
  revalidatePath('/soir');
  revalidatePath(`/jour/${today}`);
  return NextResponse.json({ ok: true, published: today });
}