# Créer l'APK Android « Pain de Vie » à partager

L'app native charge le site en ligne : cet APK est une coque légère, il affiche
toujours la dernière version du site (pas besoin de le reconstruire à chaque MAJ).

## 1. Construire l'APK (le plus simple : version debug, sans signature)
Sur ton Mac, dans le dossier du projet :

```bash
npx cap sync android
cd android
./gradlew assembleDebug
```

L'APK est généré ici :

```
android/app/build/outputs/apk/debug/app-debug.apk
```

> Alternative sans terminal : Android Studio → menu **Build → Build App Bundle(s) / APK(s) → Build APK(s)**, puis « locate ».

## 2. Renommer
```bash
cp android/app/build/outputs/apk/debug/app-debug.apk ~/Desktop/Pain-de-Vie.apk
```

## 3. Deux façons de le distribuer
**A. Envoi direct** (WhatsApp, mail, AirDrop…) : envoie `Pain-de-Vie.apk`. Le
destinataire l'ouvre ; Android demande d'autoriser « installer depuis cette
source » → Autoriser → Installer.

**B. Lien de téléchargement sur le site** (le bouton « Télécharger » de la page
/installer pointe déjà vers `/Pain-de-Vie.apk`) :

```bash
cp ~/Desktop/Pain-de-Vie.apk public/Pain-de-Vie.apk
git add public/Pain-de-Vie.apk && git commit -m "APK Android a telecharger" && git push
```

→ disponible sur `https://pain-quotidien-france.vercel.app/Pain-de-Vie.apk`

## Notes
- L'APK **debug** suffit pour ton entourage (installation directe). Une version
  **release signée** ne sert que pour le Play Store (plus tard).
- Les **notifications** fonctionnent pareil : ouvrir l'app → *Mon profil* →
  « Activer les notifications ».
- Le plus simple pour la majorité reste la **PWA** (Chrome → « Installer
  l'application ») : pas de fichier, pas d'alerte de sécurité, notifs incluses.
