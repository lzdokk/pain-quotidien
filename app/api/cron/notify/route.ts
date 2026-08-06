import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Envoie une notification push a tous les abonnes via l'API OneSignal.
 * Appele par GitHub Actions (2x/jour). Protege par CRON_SECRET.
 *
 * Env requis :
 *   ONESIGNAL_REST_KEY  (secret, cote serveur uniquement)
 *   ONESIGNAL_APP_ID    (ou NEXT_PUBLIC_ONESIGNAL_APP_ID)
 *   CRON_SECRET         (deja utilise par les autres crons)
 */
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pain-quotidien-france.vercel.app';
const APP_ID =
  process.env.ONESIGNAL_APP_ID ??
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ??
  'b09767d8-4bf7-4feb-9ad7-36c833b5f9d4';
const REST_KEY = process.env.ONESIGNAL_REST_KEY;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!REST_KEY) {
    return NextResponse.json({ error: 'ONESIGNAL_REST_KEY manquant' }, { status: 500 });
  }

  const slot = req.nextUrl.searchParams.get('slot') === 'soir' ? 'soir' : 'matin';
  const msg =
    slot === 'soir'
      ? {
          title: 'La veillée du soir 🌙',
          body: 'Un temps de silence avec la Parole avant la nuit.',
          url: `${SITE}/soir`
        }
      : {
          title: 'Le Pain du matin ☀️',
          body: "Ta portion de ce jour t'attend. Viens la recevoir.",
          url: `${SITE}/`
        };

  const res = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Key ${REST_KEY}`
    },
    body: JSON.stringify({
      app_id: APP_ID,
      included_segments: ['Total Subscriptions'],
      target_channel: 'push',
      headings: { en: msg.title, fr: msg.title },
      contents: { en: msg.body, fr: msg.body },
      url: msg.url
    })
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ ok: res.ok, slot, data }, { status: res.ok ? 200 : 502 });
}
