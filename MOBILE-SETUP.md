# 📱 Le Pain quotidien — App iOS & Android (Capacitor)

L'app native charge ton site déjà en ligne dans une coque native, et y ajoute
les fonctions natives (splash, notifications push, présence sur les stores).
On réutilise **100 %** de ton app web.

---

## Prérequis (à installer une fois sur ton Mac)

| Pour | Outil | Où |
|---|---|---|
| iOS | **Xcode** (gratuit) | App Store |
| iOS | **CocoaPods** | `sudo gem install cocoapods` |
| Android | **Android Studio** (gratuit) | developer.android.com/studio |
| Publier | Apple Developer (99 $/an) + Google Play (25 $) | à prendre au moment de publier |

---

## Étape 1 — Installer Capacitor (dans le dossier du projet)

```bash
npm install @capacitor/core @capacitor/ios @capacitor/android \
  @capacitor/splash-screen @capacitor/status-bar @capacitor/app
npm install -D @capacitor/cli
```

> `capacitor.config.ts` et le dossier `www/` sont déjà fournis dans le patch.

## Étape 2 — Générer les projets natifs

```bash
npx cap add ios
npx cap add android
npx cap sync
```

Ça crée deux dossiers `ios/` et `android/` (à committer dans le repo).

## Étape 3 — Lancer sur ton téléphone

**iOS :**
```bash
npx cap open ios
```
→ Xcode s'ouvre. En haut, choisis ton iPhone (branché) ou un simulateur, puis
clique ▶︎. La première fois, dans **Signing & Capabilities**, sélectionne ton
compte Apple (gratuit suffit pour tester sur ton propre téléphone).

**Android :**
```bash
npx cap open android
```
→ Android Studio s'ouvre. Choisis ton téléphone (mode développeur activé) ou un
émulateur, puis ▶︎.

🎉 **Ton app s'ouvre, plein écran, avec ton site dedans.**

## Étape 4 — Icône & écran de démarrage

Place un logo carré `1024×1024` dans `assets/icon.png` et un `assets/splash.png`
`2732×2732`, puis :

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
npx cap sync
```

Ça génère automatiquement toutes les tailles d'icônes et splash pour les 2 OS.

---

## Ce qu'on fait ensemble ensuite (phases suivantes)

- **Phase 2 — Finitions natives** : barre de statut, encoches (safe areas),
  bouton retour Android, ouverture des liens externes proprement.
- **Phase 3 — Notifications push** 🔔 : « Le pain du matin est prêt » (7 h),
  « La veillée du soir vous attend » (20 h). On branchera **OneSignal**
  (gratuit, iOS + Android) + un cron qui envoie chaque jour. Il faudra créer un
  compte OneSignal + un projet Firebase (Android) + une clé APNs (iOS) — je te
  guiderai pas à pas.
- **Phase 4 — Publication** : fiches App Store Connect + Google Play (captures,
  description, confidentialité), puis soumission à la revue.

---

## ⚠️ Deux points à anticiper

1. **Nom de l'app / marque.** « Le Pain Quotidien » est aussi une chaîne de
   boulangeries connue → risque de refus ou de conflit sur les stores. Prévois
   un nom distinct (ex. *« Pain Quotidien — Méditation »* ou une marque à toi).
   L'`appId` actuel est `fr.painquotidien.app` (modifiable).
2. **Revue Apple.** Une app qui n'est « qu'un site web » peut être refusée.
   Nos **notifications push** + le rendu natif justifient la valeur ajoutée —
   c'est pour ça que la Phase 3 est importante avant de soumettre à Apple.

Quand tu as fait les Étapes 1→3 et que l'app tourne sur ton téléphone, dis-le
moi : on enchaîne sur les notifications push. 🙏
