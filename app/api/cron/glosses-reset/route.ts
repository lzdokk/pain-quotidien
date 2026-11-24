import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Efface les traductions mot à mot faites avec l'ancienne méthode (risque de
 * décalage d'une case). Elles sont refaites, bien alignées, par la tâche
 * « Mot à mot » et à la demande quand un lecteur ouvre un verset.
 * La glose anglaise et le texte d'origine ne sont pas touchés.
 */
export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const a = await admin.from('verse_words').update({ gloss_fr: null }, { count: 'exact' }).not('gloss_fr', 'is', null);
  const b = await admin.from('verse_words_he').update({ gloss_fr: null }, { count: 'exact' }).not('gloss_fr', 'is', null);
  return NextResponse.json({ ok: !a.error && !b.error, grec_hebreu: a.count ?? a.error?.message, nt_hebreu: b.count ?? b.error?.message });
}
