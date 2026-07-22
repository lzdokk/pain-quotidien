# Le Pain quotidien

Site de méditation biblique quotidienne. Chaque matin les lectures et le pain
quotidien, chaque soir une veillée, un lecteur de Bible avec carnet de bord
personnel, une base de questions et un cursus théologique complet.

**Stack** Next.js 15 · Supabase · Vercel · Gemini, palier gratuit · Resend

---

## Déploiement pas à pas

Compte environ trente minutes la première fois. Chaque étape se termine par une
vérification : ne passe à la suivante que si elle passe.

### Avant de commencer

Il te faut trois choses installées. Ouvre le Terminal et vérifie :

```bash
node --version     # doit afficher v20 ou plus
git --version      # n'importe quelle version
```

Si Node manque, installe-le depuis [nodejs.org](https://nodejs.org), version LTS.

Ensuite, place-toi dans le dossier du projet et installe les dépendances :

```bash
cd ~/Downloads/pain-quotidien     # adapte le chemin
npm install
```

**Vérification** : un dossier `node_modules` est apparu, sans message rouge.

---

### Étape 1. Créer la base Supabase

**1.1** Va sur [supabase.com](https://supabase.com) et clique **Start your project**.
Connecte-toi avec GitHub, c'est le plus simple.

**1.2** Clique **New project**. Trois champs à remplir :

| Champ | Valeur |
|---|---|
| Name | `pain-quotidien` |
| Database Password | Clique **Generate a password**, puis **copie-le immédiatement** dans un endroit sûr. Il ne sera plus jamais affiché. |
| Region | `West EU (Paris)` |

Clique **Create new project**. La création prend une à deux minutes.

**1.3** Une fois le projet prêt, ouvre **SQL Editor** dans le menu de gauche,
l'icône en forme de terminal. Clique **New query**.

**1.4** Sur ton ordinateur, ouvre le fichier `supabase/migrations/0001_init.sql`
avec TextEdit ou VS Code. Sélectionne tout, copie, colle dans la fenêtre SQL de
Supabase, puis clique **Run** en bas à droite, ou fais Cmd+Entrée.

**Vérification** : le message `Success. No rows returned` apparaît en bas.
Si tu vois une erreur rouge, ne continue pas, envoie-moi le message.

**1.5** Clique de nouveau **New query** et répète l'opération avec
`supabase/migrations/0002_functions.sql`, puis avec `0003_budget.sql`.

**Vérification** : va dans **Table Editor**, menu de gauche. Tu dois voir une
vingtaine de tables : `daily_bread`, `readings`, `verses`, `books`, `faq`,
`courses`, `profiles`, `notes`, `highlights` et les autres.

**1.6** Va dans **Project Settings**, l'engrenage tout en bas du menu de gauche,
puis **API** dans le sous-menu. Trois valeurs à récupérer :

| Où c'est écrit | Ce que c'est | Où ça ira |
|---|---|---|
| **Project URL** | commence par `https://` et finit par `.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` |
| **Project API keys → anon public** | longue chaîne commençant par `eyJ` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Project API keys → service_role** | clique **Reveal** pour l'afficher | `SUPABASE_SERVICE_ROLE_KEY` |

La clé `service_role` contourne toutes les sécurités. Elle ne doit jamais être
mise dans une variable dont le nom commence par `NEXT_PUBLIC_`, jamais collée
dans un message, jamais poussée sur GitHub. Le fichier `.gitignore` du projet
protège déjà `.env.local`, ne le modifie pas.

**1.7** De retour dans le Terminal, crée ton fichier de configuration :

```bash
cp .env.example .env.local
open -e .env.local        # ouvre dans TextEdit
```

Colle les trois valeurs aux bons endroits, enregistre, ferme.

---

### Étape 2. Obtenir la clé Gemini, gratuite

**2.1** Va sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
et connecte-toi avec ton compte Google.

**2.2** Clique **Create API key**, puis **Create API key in new project**.

**2.3** Copie la clé et colle-la dans `.env.local`, ligne `GOOGLE_AI_KEY=`.

Aucune carte bancaire n'est demandée. Le palier gratuit autorise 1 500 requêtes
par jour, et le site en consomme une par semaine.

**Vérification** : la clé commence par `AIza` et fait une quarantaine de
caractères.

---

### Étape 3. Charger la Bible et les données

**3.1** Génère le secret qui protège les tâches automatiques :

```bash
openssl rand -hex 32
```

Copie la ligne affichée dans `.env.local`, ligne `CRON_SECRET=`.

**3.2** Vérifie d'abord que ta configuration est lue correctement. Cette
commande ne fait rien d'autre que contrôler tes clés :

```bash
npx tsx scripts/load-env.ts
```

**Vérification** : la réponse doit être `Configuration chargée depuis .env.local`.

Si tu vois `Aucun fichier .env.local trouvé`, c'est que l'étape 1.7 n'a pas
abouti. Vérifie que tu es bien dans le dossier du projet :

```bash
pwd          # doit finir par /pain-quotidien
ls -a | grep env
```

Tu dois voir `.env.example` **et** `.env.local`. Attention, le point du début
rend le fichier invisible dans le Finder, d'où le `-a`.

Si tu vois `il manque NEXT_PUBLIC_SUPABASE_URL`, ouvre le fichier et vérifie
qu'il n'y a ni espace autour du signe égal, ni guillemets, ni ligne vide au
milieu d'une clé. Le format attendu est exactement :

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

Les clés `eyJ...` font plusieurs centaines de caractères et doivent tenir sur
**une seule ligne**. C'est l'erreur la plus fréquente : un copier-coller qui
introduit un retour à la ligne au milieu.

**3.3** Importe maintenant le texte biblique. Cette commande tourne quatre à six
minutes et affiche le nom des livres au fur et à mesure :

```bash
npm run seed:bible FRLSG
```

**Vérification** : le message final annonce environ 31 100 versets. Dans
Supabase, **Table Editor → verses**, le compteur en haut affiche le même ordre
de grandeur.

**3.4** Charge les parcours de lecture, le cursus et la base de questions :

```bash
npm run seed:ref
```

**Vérification** : dans **Table Editor**, la table `courses` contient 75 lignes,
`faq` en contient 20, `reading_plans` en contient 7.

**3.5** Lance le site en local pour vérifier que tout tient :

```bash
npm run dev
```

Ouvre [localhost:3000/lire](http://localhost:3000/lire). Tu dois voir le lecteur
avec les 66 livres et le texte qui s'affiche. La page d'accueil sera vide, c'est
normal, aucun contenu quotidien n'a encore été créé.

Arrête le serveur avec Ctrl+C quand tu as vérifié.

---

### Étape 4. Publier sur GitHub

**4.1** Crée un compte sur [github.com](https://github.com) si tu n'en as pas.

**4.2** Dans le Terminal, toujours dans le dossier du projet :

```bash
git init
git add .
git commit -m "Le Pain quotidien, version initiale"
```

**Vérification importante** : la commande suivante ne doit rien afficher.

```bash
git ls-files | grep ".env.local"
```

Si elle affiche quelque chose, arrête tout : ta clé secrète serait publiée.
Fais `git rm --cached .env.local` puis recommence le commit.

**4.3** Sur [github.com/new](https://github.com/new), crée un dépôt nommé
`pain-quotidien`, coché **Private**, et surtout **ne coche aucune** des cases
« Add a README », « Add .gitignore », « Choose a license ».

**4.4** GitHub affiche alors deux lignes à copier, du type :

```bash
git remote add origin https://github.com/TON-COMPTE/pain-quotidien.git
git branch -M main
git push -u origin main
```

Colle-les dans le Terminal.

**Vérification** : rafraîchis la page GitHub, tes fichiers y sont.

---

### Étape 5. Déployer sur Vercel

**5.1** Va sur [vercel.com](https://vercel.com), clique **Sign up** et choisis
**Continue with GitHub**.

**5.2** Clique **Add New → Project**. Vercel liste tes dépôts GitHub. À côté de
`pain-quotidien`, clique **Import**.

**5.3** Ne touche à rien dans Framework Preset, Vercel détecte Next.js tout seul.
Déplie **Environment Variables** et ajoute une ligne par variable. Le plus rapide
est de coller directement le contenu entier de ton `.env.local` dans le premier
champ : Vercel découpe automatiquement.

Les variables à renseigner :

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
GOOGLE_AI_KEY
AI_ASSISTANT=on
AI_DAILY_LIMIT=8
AI_GLOBAL_DAILY_CAP=400
CRON_SECRET
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_INSTAGRAM=lepainquotidien
```

Laisse `RESEND_API_KEY` et `MAIL_FROM` vides pour l'instant, les e-mails
attendront.

Pour `NEXT_PUBLIC_SITE_URL`, mets provisoirement
`https://pain-quotidien.vercel.app`. Tu la corrigeras à l'étape 7 si tu prends un
nom de domaine.

**5.4** Clique **Deploy**. Compte deux à trois minutes.

**Vérification** : Vercel affiche un écran de félicitations avec une vignette du
site. Clique dessus, la page s'ouvre.

---

### Étape 6. Activer les connexions utilisateurs

Retourne dans Supabase, **Authentication** dans le menu de gauche.

**6.1** Onglet **URL Configuration**. Renseigne :

| Champ | Valeur |
|---|---|
| Site URL | l'adresse Vercel, par exemple `https://pain-quotidien.vercel.app` |
| Redirect URLs | ajoute deux lignes : `https://pain-quotidien.vercel.app/auth/callback` et `http://localhost:3000/auth/callback` |

Clique **Save**.

**6.2** Onglet **Providers**. Le fournisseur **Email** est déjà actif par défaut,
c'est le lien magique. Vérifie simplement que **Enable email provider** est
allumé. C'est suffisant pour ouvrir le site aux utilisateurs.

**6.3** Pour ajouter **Google**, il y a une manipulation extérieure :

1. Va sur [console.cloud.google.com](https://console.cloud.google.com)
2. En haut, crée un projet nommé `pain-quotidien`
3. Menu de gauche, **APIs & Services → OAuth consent screen**. Choisis
   **External**, remplis le nom de l'application, ton e-mail de contact, puis
   enregistre en cliquant **Save and continue** jusqu'au bout
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
5. Type : **Web application**
6. Dans **Authorized redirect URIs**, colle l'URL que Supabase affiche dans son
   panneau Google, du type
   `https://xxxxxxxx.supabase.co/auth/v1/callback`
7. Clique **Create**. Google affiche un **Client ID** et un **Client Secret**
8. Reviens dans Supabase, active **Google**, colle les deux valeurs, **Save**

**6.4** **Facebook** suit exactement la même logique via
[developers.facebook.com](https://developers.facebook.com), produit
« Facebook Login ». **Apple** demande un compte développeur payant à 99 euros par
an : garde-le pour le jour où tu publieras une application iOS.

**Vérification** : ouvre ton site, clique l'icône de compte en haut à droite,
saisis ton e-mail. Tu dois recevoir un lien de connexion en une minute.

---

### Étape 7. Le nom de domaine

Facultatif au démarrage, l'adresse `.vercel.app` fonctionne parfaitement.

**7.1** Achète le domaine chez OVH, Gandi ou Namecheap, environ 12 euros par an.

**7.2** Dans Vercel, ouvre ton projet, onglet **Settings → Domains**, saisis ton
domaine et clique **Add**.

**7.3** Vercel affiche les enregistrements DNS à créer chez ton registrar,
généralement un `A` vers `76.76.21.21` et un `CNAME` pour `www`. Crée-les dans
l'interface de ton registrar.

**7.4** Compte de dix minutes à quelques heures pour la propagation. Ensuite,
reviens mettre à jour à trois endroits :

- Vercel, `NEXT_PUBLIC_SITE_URL` avec la nouvelle adresse
- Supabase, **Authentication → URL Configuration**, Site URL et Redirect URLs
- Google Cloud, l'URI de redirection si tu as activé Google

Puis redéploie : dans Vercel, onglet **Deployments**, les trois points du dernier
déploiement, **Redeploy**.

---

### Étape 8. Créer le premier contenu

Tu as deux façons de faire, au choix.

**Option A, automatique et gratuite.** Dans le Terminal :

```bash
curl -H "Authorization: Bearer TON_CRON_SECRET" \
  https://pain-quotidien.vercel.app/api/cron/weekly
```

Remplace `TON_CRON_SECRET` par la valeur générée à l'étape 3.1. Compte une à
deux minutes, la réponse ressemble à :

```json
{"ok":true,"run":1,"days":7,"range":["2026-07-29","2026-08-04"],"cost_usd":0}
```

**Option B, import manuel.** Utilise la semaine que je t'ai déjà rédigée :

```bash
npm run import:week out/semaine-2026-07-22.json
```

**Vérification** dans les deux cas : Supabase, **Table Editor →
generation_runs**. Une ligne avec `status = ok` et `days_created = 7`.

**8.1** Publie la journée du jour :

```bash
curl -H "Authorization: Bearer TON_CRON_SECRET" \
  https://pain-quotidien.vercel.app/api/cron/daily
```

Ouvre ton site : le pain du jour s'affiche.

---

### Étape 9. Vérifier les tâches automatiques

Dans Vercel, ouvre ton projet, onglet **Settings → Cron Jobs**. Les trois tâches
déclarées dans `vercel.json` doivent apparaître avec leur horaire.

**Attention si tu es en offre Hobby** : Vercel n'autorise que deux tâches
planifiées. Tu as deux solutions.

La première, fusionner les rappels dans la publication quotidienne. Ouvre
`vercel.json`, supprime la ligne `reminders`, et ajoute un appel à cette route
depuis `app/api/cron/daily/route.ts`.

La seconde, plus simple, utiliser [cron-job.org](https://cron-job.org), gratuit.
Crée trois tâches qui appellent tes trois URL, avec l'en-tête
`Authorization: Bearer TON_CRON_SECRET`, aux horaires indiqués dans `vercel.json`.

---

### Les erreurs les plus fréquentes

| Symptôme | Cause | Correction |
|---|---|---|
| Build Vercel en échec, `Missing environment variable` | Une variable oubliée | Settings → Environment Variables, ajoute-la, puis Redeploy |
| `Error: supabaseUrl is required` | Le script ne trouve pas `.env.local` | Lance `npx tsx scripts/load-env.ts` pour voir ce qui manque. Vérifie avec `pwd` que tu es dans le dossier du projet |
| `Invalid URL` ou clé refusée | Une clé `eyJ...` coupée sur deux lignes | Recopie-la, elle doit tenir sur une seule ligne |
| Le lecteur reste vide | La Bible n'est pas importée | Relance `npm run seed:bible FRLSG` |
| `Invalid API key` au chargement | Clé Supabase mal copiée, souvent tronquée | Recopie-la entièrement, elle est très longue |
| La connexion Google renvoie une erreur `redirect_uri_mismatch` | L'URI dans Google Cloud ne correspond pas | Recopie exactement celle affichée par Supabase, sans espace final |
| Le cron renvoie `Unauthorized` | `CRON_SECRET` différent entre Vercel et ta commande | Compare les deux valeurs caractère par caractère |
| La page d'accueil reste vide après le cron | La journée est générée mais pas publiée | Lance `/api/cron/daily` |

---

## Le rythme de génération

```
DIMANCHE 02h00  →  /api/cron/weekly
                   Récupère le calendrier AELF des 7 jours suivants,
                   substitue les lectures deutérocanoniques par un
                   passage du canon protestant, récupère le texte Segond
                   depuis la base, et produit les 7 journées en UN SEUL
                   appel Claude. Tout est sauvegardé en `published = false`.

CHAQUE JOUR 03h30 →  /api/cron/daily
                   Publie la journée du jour et régénère les pages.
                   Si rien n'existe, relance la génération hebdomadaire.

CHAQUE JOUR 20h00 →  /api/cron/reminders
                   Rappel de lecture aux seuls utilisateurs qui n'ont
                   pas lu aujourd'hui.
```

**Pourquoi une semaine d'avance.** Le contenu est prêt sept jours avant sa
publication. Cela laisse le temps de relire, de corriger une formulation, et
cela absorbe n'importe quelle panne d'API sans que le site s'en aperçoive.
La table `generation_runs` garde la trace de chaque exécution avec le nombre
de tokens et le coût réel.

---

## L'environnement de chaque utilisateur

À l'inscription, un trigger crée automatiquement le profil et le parcours de
lecture. Tout ce qui est personnel est isolé par des politiques RLS Postgres :
un utilisateur ne peut **techniquement pas** lire les données d'un autre, même
si le code applicatif avait un défaut.

| Table | Contenu |
|---|---|
| `profiles` | Nom, avatar, fuseau, préférences de notification, traduction choisie |
| `user_plan` | Parcours en cours, jour actuel, dernière lecture, série |
| `highlights` | Versets surlignés, quatre couleurs |
| `notes` | Notes personnelles rattachées à un verset |
| `day_progress` | Actions du jour cochées |
| `course_progress` | Cours du cursus validés |
| `ai_usage` | Quota quotidien de questions à l'assistant |
| `conversations` | Historique des échanges |

---

## Fonctionner à zéro euro

Le projet est conçu pour ne rien coûter en crédits. Trois leviers, cumulables.

### 1. Un fournisseur gratuit, réglé par défaut

`LLM_PROVIDER` accepte plusieurs moteurs. Le code est identique, seule la clé
change. Par défaut le projet est sur **Gemini**, dont le palier gratuit est très
au-dessus de nos besoins.

| Fournisseur | Palier gratuit | Suffisant ? |
|---|---|---|
| **gemini** (défaut) | 1 500 requêtes par jour, sans carte bancaire | Très largement |
| groq | 1 000 requêtes par jour | Oui |
| mistral | environ 1 milliard de tokens par mois | Oui |
| cerebras | environ 1 million de tokens par jour | Oui |
| anthropic | payant | Meilleure qualité rédactionnelle |

Mise en perspective : la génération hebdomadaire consomme **une seule requête
par semaine**, soit quatre par mois. Le palier gratuit de Gemini en autorise
quarante-cinq mille sur la même période.

Deux précisions utiles. Depuis l'Union européenne, les contenus envoyés au
palier gratuit de Google **ne servent pas à l'entraînement**. Et Mistral, à
l'inverse, impose l'inverse : son quota gratuit exige d'accepter que les données
servent à l'entraînement. Pour un site chrétien c'est sans gravité, les textes
sont publics, mais autant le savoir.

### 2. Le mode import, zéro appel API

Si tu préfères garder la qualité rédactionnelle de Claude sans payer d'API, tu
utilises simplement ton abonnement existant, côté interface.

```bash
npm run prompt:week              # prépare le prompt complet de la semaine
# → out/semaine-2026-07-27.txt
```

Tu colles ce fichier dans Claude, tu récupères le JSON, tu l'enregistres, puis :

```bash
npm run import:week out/semaine-2026-07-27.json
```

Sept journées créées, **coût zéro**. Le fichier est validé par le même schéma
Zod que la génération automatique, donc rien de mal formé ne peut entrer en base.
Cela prend cinq minutes une fois par semaine, ou vingt minutes une fois par mois
si tu prépares quatre semaines d'avance.

Avec `LLM_PROVIDER=none`, aucune route ne tente le moindre appel.

### 3. Les garde-fous

Même en mode automatique, trois verrous rendent un dépassement impossible :

- `AI_ASSISTANT=off` désactive complètement l'assistant. Les visiteurs gardent
  la base de questions, illimitée et gratuite, et toute question absente est
  enregistrée dans `pending_questions` pour être rédigée plus tard.
- `AI_DAILY_LIMIT` plafonne chaque utilisateur, 8 par défaut.
- `AI_GLOBAL_DAILY_CAP` plafonne le site entier, 400 par défaut. Le compteur est
  géré en base par `consume_global_budget`, donc infranchissable.

Les explications de versets sont générées **une seule fois puis mises en cache**
dans `verse_notes` : le premier lecteur déclenche l'appel, tous les suivants
lisent gratuitement.

### Le coût réel, selon la configuration

| Configuration | Coût mensuel |
|---|---|
| Gemini gratuit + Vercel Hobby + Supabase Free | **0 €** |
| Mode import + Vercel Hobby + Supabase Free | **0 €** |
| Gemini gratuit + Vercel Pro | 20 € |
| Claude API + Vercel Pro + Supabase Pro | environ 64 € |

Vercel Hobby suffit tant que le site n'est pas monétisé, avec une limite de deux
tâches planifiées. Dans ce cas, fusionne `daily` et `reminders` en une seule
route, ou déclenche les crons depuis un service gratuit comme cron-job.org.

Le tableau de bord `usage_summary` en base donne à tout moment le nombre
d'appels du jour, le coût des trente derniers jours, et le nombre de questions
en attente de rédaction.

---


## Identité visuelle

La palette est calée sur le logo, bleu ardoise sur blanc. Tout tient dans
`app/theme.css`, bloc **MARQUE**, six valeurs :

```css
--brand:       #4E6A85;   /* le bleu ardoise du logo */
--brand-deep:  #3A5266;   /* le même, plus foncé, survols */
--brand-night: #8FA9C4;   /* la déclinaison du mode soir */
--paper:       #FBFBFC;   /* le fond clair */
--paper-night: #0E141A;   /* le fond du mode soir */
--ink-base:    #1A222B;   /* le texte, charbon bleuté */
```

Le reste, environ deux cents nuances, se recalcule en `color-mix`. Si la teinte
exacte du logo diffère un peu, change la seule ligne `--brand` et tout suit,
y compris le mode soir, les surlignages et l'image de partage.

Fichiers d'identité dans `public/` :

| Fichier | Usage |
|---|---|
| `logo.svg` | La Bible ouverte au trait, monochrome, hérite de la couleur du texte |
| `icon.svg` | L'icône carrée, favicon et PWA |
| `wordmark.svg` | Le bloc **PAIN** QUOTIDIEN complet, en-tête des e-mails et partages |

Générer les PNG une fois :

```bash
npx sharp-cli -i public/icon.svg -o public/icon-192.png resize 192 192
npx sharp-cli -i public/icon.svg -o public/icon-512.png resize 512 512
```

---

## Points juridiques à traiter

- **AELF** : l'API est publique mais non documentée pour un usage commercial.
  L'attribution est en place dans le pied de page. Un e-mail de signalement est
  la démarche propre.
- **Segond 1910** : domaine public, aucune contrainte. C'est le socle.
- **Segond 21** : autorisation écrite de la Société Biblique de Genève requise.
  Même dossier que pour le livre. Tant qu'elle n'est pas obtenue, la traduction
  reste désactivée dans `translations` (`enabled = false`).
- **RGPD** : mentions légales et politique de confidentialité obligatoires dès
  la collecte d'e-mails. Aucun traceur tiers dans le projet.

---

## Développement local

```bash
npm run dev                     # http://localhost:3000

# Déclencher un cron à la main
curl -H "Authorization: Bearer $CRON_SECRET" localhost:3000/api/cron/weekly
```

## Règle d'écriture

Le tiret cadratin est proscrit dans tous les contenus, y compris ceux générés.
La consigne est inscrite en dur dans `lib/prompts/voice.ts` et s'applique à
chaque appel au modèle.
