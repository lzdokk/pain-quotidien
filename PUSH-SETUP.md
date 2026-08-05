# Notifications push « Pain de Vie » — Web Push (OneSignal)

Couvre **iPhone (PWA), Android et ordinateur**. Aucun compte Apple, aucun Firebase, gratuit.

## 1. Déployer le code
```bash
unzip -o ~/Downloads/pain-de-vie-phase3.zip -d .
git add -A && git commit -m "Phase 3: notifications push Web (OneSignal)" && git push
```

## 2. Variables d'environnement (Vercel → Settings → Environment Variables)
| Variable | Valeur | Visibilité |
|---|---|---|
| `NEXT_PUBLIC_ONESIGNAL_APP_ID` | `b09767d8-4bf7-4feb-9ad7-36c833b5f9d4` | publique |
| `ONESIGNAL_APP_ID` | `b09767d8-4bf7-4feb-9ad7-36c833b5f9d4` | publique |
| `ONESIGNAL_REST_KEY` | *(OneSignal → Settings → Keys & IDs → « REST API Key »)* | **SECRÈTE** |

⚠️ La **REST API Key** ne se colle **jamais** dans un chat ni dans le code — uniquement ici, dans Vercel.

Puis **Redeploy** sur Vercel.

## 3. Secret GitHub (pour les envois quotidiens)
Repo → Settings → Secrets and variables → Actions → New repository secret :
- `ONESIGNAL_REST_KEY` = la même clé secrète (les workflows en ont besoin).

(`SITE_URL` et `CRON_SECRET` sont déjà configurés.)

## 4. Envois automatiques
- `notify-matin.yml` → 05:00 UTC ≈ **07:00 Paris** (été) — « Le Pain du matin ☀️ »
- `notify-soir.yml` → 18:00 UTC ≈ **20:00 Paris** (été) — « La veillée du soir 🌙 »

Test manuel : GitHub → Actions → un workflow → **Run workflow**.

## 5. S'abonner
- **Ordinateur / Android** : ouvre le site, un bandeau propose d'autoriser les notifications. Ou va sur **Mon profil** → « Activer les notifications ».
- **iPhone** : ouvre le site dans **Safari** → Partager → **« Sur l'écran d'accueil »**. Ouvre l'app depuis l'icône, va sur **Mon profil** → « Activer les notifications » (iOS 16.4+).

## Plus tard (optionnel)
- **App Store / Play Store natif** = push natif (Apple .p8 à 99 $/an ; Firebase FCM gratuit pour Android). L'App ID OneSignal est déjà prêt, il suffira d'ajouter les plateformes.
