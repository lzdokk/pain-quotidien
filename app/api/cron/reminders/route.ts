import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
const resend = new Resend(process.env.RESEND_API_KEY!);

/** Rappel de lecture a 20h Paris, uniquement pour ceux qui n'ont pas lu. */
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
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
        ${streak > 1 ? `<p>Vous en etes a <strong>${streak} jours d'affilee</strong>.</p>` : ''}
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/lire">Ouvrir ma lecture</a></p>
        <p style="font-size:12px;color:#888">Pour ne plus recevoir ce rappel, rendez-vous dans votre compte.</p>`
    });
    sent++;
  }
  return NextResponse.json({ ok: true, sent });
}
