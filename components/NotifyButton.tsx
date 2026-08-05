'use client';
import { useEffect, useState } from 'react';

/**
 * Bouton d'activation des notifications (Web Push OneSignal). Le clic est
 * indispensable sur iPhone (l'autorisation push doit venir d'un geste de
 * l'utilisateur, dans la PWA installee sur l'ecran d'accueil). Sur Android /
 * ordinateur, il demande aussi l'autorisation proprement.
 */
type Perm = 'unsupported' | 'default' | 'granted' | 'denied' | 'loading';

interface OneSignalLike {
  Notifications: {
    permission: boolean;
    permissionNative?: NotificationPermission;
    requestPermission: () => Promise<void>;
    addEventListener: (e: string, cb: (v: unknown) => void) => void;
  };
}

function withOneSignal(cb: (os: OneSignalLike) => void) {
  const w = window as unknown as { OneSignalDeferred?: unknown[] };
  w.OneSignalDeferred = w.OneSignalDeferred || [];
  w.OneSignalDeferred.push(cb as unknown);
}

export default function NotifyButton() {
  const [perm, setPerm] = useState<Perm>('loading');
  const [standalone, setStandalone] = useState(true);

  useEffect(() => {
    // iOS n'autorise le web push que si l'app est installee (ecran d'accueil).
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setStandalone(!isIOS || !!isStandalone);

    if (!('Notification' in window)) {
      setPerm('unsupported');
      return;
    }
    withOneSignal((os) => {
      const update = () =>
        setPerm(os.Notifications.permission ? 'granted' : (Notification.permission as Perm));
      update();
      os.Notifications.addEventListener('permissionChange', update);
    });
    // fallback si le SDK tarde
    const t = setTimeout(() => setPerm((p) => (p === 'loading' ? (Notification.permission as Perm) : p)), 1500);
    return () => clearTimeout(t);
  }, []);

  const enable = () =>
    withOneSignal(async (os) => {
      await os.Notifications.requestPermission();
      setPerm(os.Notifications.permission ? 'granted' : (Notification.permission as Perm));
    });

  if (perm === 'unsupported') return null;

  return (
    <div className="notify-card">
      <div className="notify-txt">
        <strong>Notifications</strong>
        <span>Reçois le Pain du matin ☀️ et la veillée du soir 🌙</span>
      </div>
      {perm === 'granted' ? (
        <span className="notify-on">Activées ✓</span>
      ) : perm === 'denied' ? (
        <span className="notify-off">Bloquées — autorise-les dans les réglages du navigateur</span>
      ) : !standalone ? (
        <span className="notify-off">
          Sur iPhone : ouvre dans Safari, puis Partager → « Sur l'écran d'accueil », et reviens ici.
        </span>
      ) : (
        <button className="btn sm" onClick={enable} disabled={perm === 'loading'}>
          Activer les notifications
        </button>
      )}
    </div>
  );
}
