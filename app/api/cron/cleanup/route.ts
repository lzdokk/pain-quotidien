import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { contentDate } from '@/lib/date';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * MÉNAGE (chaque semaine) pour rester sous la limite gratuite de Supabase :
 * on garde le mois en cours + les 2 mois précédents.
 *   • pains du jour plus anciens (leurs lectures partent avec, par cascade) ;
 *   • progression du jour, journaux d'IA et de génération plus anciens.
 * Les textes bibliques, fiches d'étude, Strong, récits et cursus ne sont PAS touchés.
 *   GET /api/cron/cleanup   (Authorization: Bearer CRON_SECRET)
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'non autorisé' }, { status: 401 });
  }
  const [y, m] = contentDate().split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1 - 2, 1));          // 1er jour du mois M-2
  const cutoff = first.toISOString().slice(0, 10);              // AAAA-MM-01
  const out: Record<string, number | string> = { cutoff };

  const del = async (label: string, q: any) => {
    const { count, error } = await q;
    out[label] = error ? `erreur : ${error.message}` : (count ?? 0);
  };
  await del('daily_bread', admin.from('daily_bread').delete({ count: 'exact' }).lt('date', cutoff));
  await del('day_progress', admin.from('day_progress').delete({ count: 'exact' }).lt('date', cutoff));
  await del('conversations', admin.from('conversations').delete({ count: 'exact' }).lt('created_at', cutoff));
  await del('ai_usage', admin.from('ai_usage').delete({ count: 'exact' }).lt('day', cutoff));
  await del('generation_runs', admin.from('generation_runs').delete({ count: 'exact' }).lt('period_start', cutoff));

  return NextResponse.json({ ok: true, ...out });
}
