import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuration Capacitor — l'app native (iOS + Android) charge le site web
 * deja en ligne (server.url) dans une coque native, et y ajoute les fonctions
 * natives (splash, barre de statut, notifications push). On reutilise ainsi
 * 100% de l'app existante, et tout changement de contenu est instantane sans
 * repasser par les stores.
 *
 * Le dossier `www` ne sert que de page de secours hors-ligne.
 */
const config: CapacitorConfig = {
  appId: 'fr.painquotidien.app',
  appName: 'Le Pain quotidien',
  webDir: 'www',
  server: {
    // Ta production. Change-la si tu branches un domaine personnalise.
    url: 'https://pain-quotidien-france.vercel.app',
    cleartext: false
  },
  backgroundColor: '#0E141A',
  ios: {
    contentInset: 'always'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      backgroundColor: '#0E141A',
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
