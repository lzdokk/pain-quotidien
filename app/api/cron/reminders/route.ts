import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/** Rappel de lecture a 20h Paris, uniquement pour ceux qui n'ont pas lu.
 *  Le client Resend est créé a l'interieur du handler, pas au chargement du
 *  module, pour que le build ne casse pas quand la clé e-mail n'est pas encore
 *  configuree. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, skipped: 'RESEND_API_KEY non configure' });
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await admin
    .from('user_plan')
    .select('user_id, current_day, streak, last_read_on, profiles!inner(email, display_name, wants_reading_reminder)')
    .neq('last_read_on', today);

  const targets = (data ?? []).filter((r: any) => r.profiles?.wants_reading_reminder && r.profiles?.email);
  let sent = 0;

  for (const r of targets as any[]) {
    const streak = r.streak ?? 0;
    await resend.emails.send({
      from: process.env.MAIL_FROM!,
      to: r.profiles.email,
      subject: streak > 1 ? `${streak} jours de suite, on continue ?` : 'Votre chapitre du jour vous attend',
      html: `<p>Bonjour ${r.profiles.display_name ?? ''},</p>
        <p>Vous n'avez pas encore lu aujourd'hui. Un chapitre prend sept minutes.</p>
        ${streak > 1 ? `<p>Vous en êtes a <strong>${streak} jours d'affilee</strong>.</p>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/lire">Ouvrir ma lecture</a></p>
        <p style="font-size:12px;color:#888">Pour ne plus recevoir ce rappel, rendez-vous dans votre compte.</p>`
    });
    sent++;
  }
  return NextResponse.json({ ok: true, sent });
}
