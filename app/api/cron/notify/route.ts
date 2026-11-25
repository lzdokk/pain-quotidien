import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { contentDate } from '@/lib/date';
import { SITE_URL } from '@/lib/site';
import { photoOfDay } from '@/lib/photos';
import { THEMES } from '@/components/HeroScenes';

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
const SITE = SITE_URL;
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
  // Le rappel « lecture » de début de soirée est supprimé : s'il est encore
  // programmé quelque part (cron-job.org), il n'envoie plus rien.
  if (raw === 'lecture') return NextResponse.json({ ok: true, skipped: 'rappel de lecture supprimé' });
  const slot = raw === 'soir' ? 'soir' : 'matin';

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

  let msg: { title: string; body: string; url: string; image?: string };
  if (slot === 'soir') {
    // Le soir : avant de se coucher, un temps avec la Parole (quelle qu'elle soit).
    const n = Number(contentDate().slice(8, 10));
    const SOIR = [
      'Avant de te coucher, prends un moment avec la Parole de Dieu. Un passage, une prière, et repose-toi en Lui 🙏',
      'Termine ta journée avec Dieu : ouvre sa Parole quelques minutes et remets-lui ta nuit 🙏',
      'Un dernier regard vers le Seigneur avant de dormir : un verset, un merci, un abandon 🙏',
      'Avant le sommeil, laisse Dieu te parler : quelques minutes dans sa Parole suffisent 🙏',
      '« Je me couche et je m’endors en paix, car toi seul, Éternel, tu me donnes la sécurité » (Psaume 4.9). Prends un temps avec Lui 🙏'
    ];
    msg = {
      title: '🌙 Avant de te coucher',
      body: SOIR[n % SOIR.length],
      url: `${SITE}/`
    };
  } else {
    const verse = day?.verse_text ? `« ${clip(day.verse_text)} »` : '';
    const ref = day?.verse_ref ? ` — ${day.verse_ref}` : '';
    // Photo du jour (la même que l'accueil) : affichée en grand sur Android et ordinateur.
    const themeIds = day?.theme_title ? THEMES.filter(t => t.words.test(day!.theme_title!)).map(t => t.id) : [];
    msg = {
      title: `☀️ ${day?.theme_title || 'Le Pain du matin'}`,
      body: verse ? `${verse}${ref}` : 'Ta méditation du jour est prête.',
      url: `${SITE}/`,
      image: `${SITE}/photos/${photoOfDay(contentDate(), themeIds).id}.webp`
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
      url: msg.url,
      ...(msg.image ? { chrome_web_image: msg.image, big_picture: msg.image } : {})
    })
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json({ ok: res.ok, slot, data }, { status: res.ok ? 200 : 502 });
}
