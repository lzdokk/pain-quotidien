'use client';
import { useEffect } from 'react';

/**
 * Initialise le Web Push (OneSignal, SDK v16). Charge le SDK une seule fois et
 * appelle OneSignal.init avec l'App ID public. Fonctionne sur le web, en PWA
 * (iPhone « Sur l'ecran d'accueil », iOS 16.4+) et sur Android/Chrome.
 * Aucune cle secrete ici : l'App ID est public.
 */
const APP_ID =
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? 'b09767d8-4bf7-4feb-9ad7-36c833b5f9d4';

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === 'undefined' || !APP_ID) return;
    if (document.getElementById('onesignal-sdk')) return;

    const w = window as unknown as { OneSignalDeferred?: unknown[] };
    w.OneSignalDeferred = w.OneSignalDeferred || [];
    w.OneSignalDeferred.push(async (OneSignal: {
      init: (o: Record<string, unknown>) => Promise<void>;
    }) => {
      await OneSignal.init({
        appId: APP_ID,
        // laisse OneSignal gerer le service worker (/OneSignalSDKWorker.js a la racine)
        allowLocalhostAsSecureOrigin: true
      });
    });

    const s = document.createElement('script');
    s.id = 'onesignal-sdk';
    s.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    s.defer = true;
    document.head.appendChild(s);
  }, []);

  return null;
}
