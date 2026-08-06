import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { contentDate } from '@/lib/date';

export const dynamic = 'force-dynamic';

/** Coupe proprement un verset trop long pour une notification. */
function clip(s: string, n = 140) {
  const t = (s || '').trim();
  return t.length <= n ? t : t.slice(0, n - 1).trimEnd() + '…';
}

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

  const raw = req.nextUrl.searchParams.get('slot');
  const slot = raw === 'soir' ? 'soir' : raw === 'lecture' ? 'lecture' : 'matin';

  // On va chercher la journée publiée pour composer un message vivant :
  // le thème du jour en titre, le verset du jour en corps.
  let day: {
    theme_title?: string; verse_text?: string; verse_ref?: string;
    evening_title?: string; evening_verse?: string; evening_verse_ref?: string;
  } | null = null;
  try {
    const { data } = await admin
      .from('daily_bread')
      .select('theme_title,verse_text,verse_ref,evening_title,evening_verse,evening_verse_ref')
      .eq('date', contentDate())
      .eq('published', true)
      .maybeSingle();
    day = data;
  } catch { /* si la lecture échoue, on garde un message générique */ }

  let msg: { title: string; body: string; url: string };
  if (slot === 'lecture') {
    msg = {
      title: '📖 Ton plan de lecture',
      body: "As-tu avancé dans ton plan de lecture aujourd'hui ? Prends quelques minutes avec la Parole 🙏",
      url: `${SITE}/lire`
    };
  } else if (slot === 'soir') {
    const verse = day?.evening_verse ? `« ${clip(day.evening_verse)} »` : '';
    const ref = day?.evening_verse_ref ? ` — ${day.evening_verse_ref}` : '';
    msg = {
      title: `🌙 ${day?.evening_title || 'La veillée du soir'}`,
      body: verse ? `${verse}${ref}` : 'Un temps de paix avec la Parole avant la nuit.',
      url: `${SITE}/soir`
    };
  } else {
    const verse = day?.verse_text ? `« ${clip(day.verse_text)} »` : '';
    const ref = day?.verse_ref ? ` — ${day.verse_ref}` : '';
    msg = {
      title: `☀️ ${day?.theme_title || 'Le Pain du matin'}`,
      body: verse ? `${verse}${ref}` : 'Ta méditation du jour est prête.',
      url: `${SITE}/`
    };
  }

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
