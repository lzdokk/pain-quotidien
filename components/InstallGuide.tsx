'use client';
import { useEffect, useState } from 'react';

/**
 * Guide d'installation « prêt à partager ». Détecte l'appareil (iPhone /
 * Android / ordinateur) et affiche les bonnes étapes + l'activation des
 * notifications. Utilisé sur la page /installer et dans le popup d'accueil.
 */
type OS = 'ios' | 'android' | 'desktop';
type Notif = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported';

// Lien de téléchargement de l'APK Android (déposer le fichier dans /public).
const APK_URL = '/Pain-de-Vie.apk';

function activate(cb: (granted: boolean) => void) {
  const w = window as unknown as { OneSignalDeferred?: unknown[] };
  w.OneSignalDeferred = w.OneSignalDeferred || [];
  w.OneSignalDeferred.push(async (os: { Notifications: { permission: boolean; requestPermission: () => Promise<void> } }) => {
    try {
      await os.Notifications.requestPermission();
      cb(!!os.Notifications.permission);
    } catch {
      cb(false);
    }
  });
}

export default function InstallGuide({ compact = false }: { compact?: boolean }) {
  const [os, setOs] = useState<OS>('desktop');
  const [standalone, setStandalone] = useState(false);
  const [notif, setNotif] = useState<Notif>('idle');

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const iOS = /iphone|ipad|ipod/i.test(ua) ||
      (/mac/i.test(ua) && 'ontouchend' in document); // iPad iPadOS
    const android = /android/i.test(ua);
    setOs(iOS ? 'ios' : android ? 'android' : 'desktop');
    setStandalone(
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
    if (!('Notification' in window)) setNotif('unsupported');
    else if (Notification.permission === 'granted') setNotif('granted');
    else if (Notification.permission === 'denied') setNotif('denied');
  }, []);

  const enable = () => {
    setNotif('loading');
    activate((g) => setNotif(g ? 'granted' : (Notification.permission === 'denied' ? 'denied' : 'idle')));
  };

  const NotifStep = () => {
    if (notif === 'unsupported') return null;
    if (notif === 'granted') return <p className="ig-ok">✓ Notifications activées — tu recevras le Pain du matin et la veillée du soir.</p>;
    if (notif === 'denied') return <p className="ig-note">Les notifications sont bloquées. Autorise-les dans les réglages de ton navigateur pour l'app.</p>;
    if (os === 'ios' && !standalone)
      return <p className="ig-note">Ajoute d'abord l'app à l'écran d'accueil (étapes ci-dessus), ouvre-la depuis l'icône, puis reviens ici pour activer les notifications.</p>;
    return (
      <button className="btn sm" onClick={enable} disabled={notif === 'loading'}>
        {notif === 'loading' ? 'Un instant…' : 'Activer les notifications'}
      </button>
    );
  };

  return (
    <div className={`ig${compact ? ' ig-compact' : ''}`}>
      {standalone && os !== 'desktop' ? (
        <>
          <p className="ig-lead">L'app est bien installée 🎉 Il ne reste qu'à activer les rappels quotidiens :</p>
          <NotifStep />
        </>
      ) : os === 'ios' ? (
        <>
          <div className="ig-head"><span className="ig-badge"></span> Sur iPhone / iPad</div>
          <ol className="ig-steps">
            <li>Ouvre ce lien dans <strong>Safari</strong> (pas Chrome).</li>
            <li>Touche le bouton <strong>Partager</strong> <span className="ig-ic">⬆︎</span> en bas de l'écran.</li>
            <li>Fais défiler et choisis <strong>« Sur l'écran d'accueil »</strong>, puis <strong>Ajouter</strong>.</li>
            <li>Ouvre <strong>Pain de Vie</strong> depuis la nouvelle icône.</li>
            <li>Reviens ici et touche <strong>Activer les notifications</strong>.</li>
          </ol>
          <NotifStep />
        </>
      ) : os === 'android' ? (
        <>
          <div className="ig-head"><span className="ig-badge"></span> Sur Android</div>
          <p className="ig-sub">Option 1 — recommandée (rapide, notifications incluses) :</p>
          <ol className="ig-steps">
            <li>Ouvre ce lien dans <strong>Chrome</strong>.</li>
            <li>Menu <strong>⋮</strong> en haut à droite → <strong>« Installer l'application »</strong> (ou « Ajouter à l'écran d'accueil »).</li>
            <li>Ouvre <strong>Pain de Vie</strong> depuis l'icône, puis touche <strong>Activer les notifications</strong>.</li>
          </ol>
          <p className="ig-sub">Option 2 — installer le fichier (.apk) :</p>
          <ol className="ig-steps">
            <li><a className="ig-dl" href={APK_URL} download>⬇︎ Télécharger Pain-de-Vie.apk</a></li>
            <li>Ouvre le fichier téléchargé. Si Android prévient, autorise <strong>« Installer depuis cette source »</strong>.</li>
            <li>Ouvre l'app et active les notifications.</li>
          </ol>
          <NotifStep />
        </>
      ) : (
        <>
          <div className="ig-head"><span className="ig-badge"></span> Sur ordinateur</div>
          <ol className="ig-steps">
            <li>Clique <strong>Activer les notifications</strong> ci-dessous et accepte la demande du navigateur.</li>
            <li>(Optionnel) Dans Chrome/Edge, l'icône <strong>⊕ Installer</strong> dans la barre d'adresse crée un raccourci comme une app.</li>
          </ol>
          <NotifStep />
        </>
      )}
    </div>
  );
}
