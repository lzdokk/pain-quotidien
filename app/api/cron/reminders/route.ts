import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, skipped: 'no key' });
  }
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await admin
    .from('user_plan')
    .select('user_id, streak, last_read_on, profiles!inner(email, display_name, wants_reading_reminder)')
    .neq('last_read_on', today);
  let sent = 0;
  for (const r of (data ?? []).filter((r) => r.profiles?.wants_reading_reminder && r.profiles?.email)) {
    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: r.profiles.email,
      subject: 'Votre chapitre du jour vous attend',
      html: `<p>Un chapitre prend sept minutes. <a href="${process.env.NEXT_PUBLIC_SITE_URL}/lire">Ouvrir ma lecture</a></p>`
    });
    sent++;
  }
  return NextResponse.json({ ok: true, sent });
}
