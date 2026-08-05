'use client';
import { useEffect } from 'react';

/**
 * Initialisation native (Capacitor). Sans effet sur le web ; dans l'app
 * iOS/Android, configure la barre de statut, masque le splash, et gère le
 * bouton retour Android. Les imports sont dynamiques pour ne rien charger
 * (ni casser le rendu serveur) côté web.
 */
export default function NativeInit() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
          import('@capacitor/status-bar'),
          import('@capacitor/splash-screen'),
          import('@capacitor/app')
        ]);

        const mode = document.documentElement.dataset.mode; // 'matin' | 'soir'
        try {
          // Bord a bord : la barre de statut se superpose, le CSS gere l'espace
          // sous l'encoche (env(safe-area-inset-top)).
          await StatusBar.setOverlaysWebView({ overlay: true });
          // Style.Dark = texte clair (fond sombre) ; Style.Light = texte foncé.
          await StatusBar.setStyle({ style: mode === 'soir' ? Style.Dark : Style.Light });
        } catch { /* statut non dispo */ }

        try { await SplashScreen.hide(); } catch { /* pas de splash */ }

        // Bouton retour Android : revenir en arrière, ou quitter à la racine.
        const sub = await App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else App.exitApp();
        });
        cleanup = () => { sub.remove(); };
      } catch { /* environnement non natif */ }
    })();
    return () => { cleanup?.(); };
  }, []);
  return null;
}
