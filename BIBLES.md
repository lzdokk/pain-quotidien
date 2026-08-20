# Bibles de Pain de Vie — comment ça marche, comment en ajouter

Ce document récapitule **tout ce qui touche aux traductions bibliques** : où elles
sont configurées, les sources disponibles, ce qui est inclus, et comment ajouter
une version toi-même (y compris celles sous droits, sous ta responsabilité).

---

## 1. Où tout se configure : la table `translations`

Une seule table Supabase pilote les Bibles. Une ligne = une version.

| colonne | rôle |
|---|---|
| `code` | identifiant unique dans l'app (ex. `FRMART`) |
| `name` | nom affiché |
| `language` | `fr`, `en`, `he`… (filtre par langue) |
| `source` | **d'où vient le texte** (voir §2) |
| `api_id` | identifiant de la version chez la source |
| `enabled` | `true`/`false` pour l'afficher |
| `public_domain` | information de licence |

## 2. Les 4 sources possibles (`source`)

- **`local`** — le texte est stocké chez toi, dans la table `verses`. Rapide,
  hors-ligne, illimité. C'est le cas de la Segond 1910, et de tout ce qu'on
  importe avec `scripts/import-bible.mjs`.
- **`bolls`** — lu **à la volée** sur bolls.life. `api_id` = short_name bolls.
  Le texte n'est **jamais** copié chez toi : bolls le sert à chaque lecture.
- **`getbible`** — lu **à la volée** sur getbible.net. `api_id` = abréviation
  getbible (ex. `martin`).
- **`apibible`** — via API.Bible (nécessite une clé `BIBLE_API_KEY`).

Le lecteur et le comparateur savent lire ces 4 sources sans code supplémentaire.

## 3. Ce qui est inclus dans ce lot

**Français, domaine public :**

| code | nom | source |
|---|---|---|
| `FRLSG` | Segond 1910 | local |
| `FRDBY` | Darby (1890) | bolls |
| `FRMART` | Martin (1744) | getbible |
| `EPEE` | Bible de l'Épée (Ostervald) | local (via import) |

**Français que tu lis déjà à la volée via bolls (gardées telles quelles) :**
Bible du Semeur, Nouvelle Bible Segond, Parole de Vie. Le texte n'est pas stocké
chez toi ; on n'y touche pas.

La migration `0026_french_only.sql` **masque** toutes les langues étrangères
(anglais, allemand, grec…) sans rien supprimer, et **ne coupe jamais** une Bible
française (Semeur/NBS/PdV comprises).

## 4. Ajouter une Bible du domaine public (import local)

```bash
node scripts/import-bible.mjs \
  --url "<URL du JSON livres→chapitres→versets>" \
  --code <CODE> --name "<Nom affiché>" --public --replace
```

Exemple déjà prêt (Bible de l'Épée, lignée Ostervald, libre au partage) :

```bash
node scripts/import-bible.mjs \
  --url "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/fr_apee.json" \
  --code EPEE --name "Bible de l'Épée (Ostervald)" --public --replace
```

## 5. Ajouter une version SOUS DROITS toi-même (sous ta responsabilité)

Je ne peux pas copier ni rediffuser un texte sous copyright. Mais tu peux le
faire toi-même, en connaissance de cause. Trois cas :

**a) La version existe sur bolls.life** (lecture à la volée, texte non stocké) —
c'est le cas de Semeur (`BDS`), Nouvelle Bible Segond (`NBS`), Parole de Vie
(`FRPDV17`). Il suffit d'une ligne :

```sql
insert into translations (code, name, language, enabled, source, api_id)
values ('BDS', 'Bible du Semeur', 'fr', true, 'bolls', 'BDS')
on conflict (code) do update set enabled = true, source = 'bolls', api_id = 'BDS';
```

**b) La version existe sur API.Bible** — crée un compte sur scripture.api.bible,
récupère une clé, mets-la dans Vercel (`BIBLE_API_KEY`), puis :

```sql
insert into translations (code, name, language, enabled, source, api_id)
values ('S21', 'Segond 21', 'fr', true, 'apibible', '<id API.Bible de la S21>');
```

**c) Tu as le fichier texte et le droit de l'héberger** — importe-le en local
avec `scripts/import-bible.mjs` (retire `--public` si ce n'est pas du domaine
public). Le texte sera alors stocké dans ta base : assure-toi d'en avoir
l'autorisation écrite (la Segond 21, par exemple, demande une autorisation de la
Société Biblique de Genève pour un usage public).

> Note technique : **bible-strong (smontlouis)** n'expose **pas** d'API publique
> de lecture verset par verset comme bolls. Ses textes sont dans une base SQLite
> privée téléchargée par l'app. On ne peut donc **pas** les lire « à la volée »
> comme on le fait avec bolls. Les versions libres qu'elle liste (Ostervald,
> Crampon, Lausanne, Martin) restent récupérables — mais depuis des sources
> ouvertes, pas depuis son serveur.

## 5 bis. Versions SOUS DROITS, en toute légalité : YouVersion Platform

C'est **la** voie officielle pour lire Segond 21, Semeur, NBS, NEG, Parole de
Vie… sans jamais stocker le texte (lecture à la volée, comme bolls) et **avec
l'accord des éditeurs**. Une nouvelle source `youversion` est déjà branchée
dans l'app (routes lecteur + comparateur). Étapes, une seule fois :

1. Crée un compte et une app sur **platform.youversion.com**, récupère ta clé
   (App Key).
2. Mets la clé dans **Vercel → Settings → Environment Variables** :
   `YVP_APP_KEY = <ta clé>`. (Elle n'est jamais exposée au navigateur.)
3. Dans le portail, **accepte la licence** de chaque Bible française voulue.
   Puis récupère son **ID numérique** (visible dans l'URL bible.com/versions/<ID>,
   ou via l'endpoint « Get a Bible collection »). Exemples d'IDs YouVersion :
   Segond 21 = `152`, Bible du Semeur = `62`, NBS = `146`, NEG1979 = `133`,
   Parole de Vie = `93` *(à vérifier dans ton portail : les IDs disponibles
   dépendent des licences que TU as acceptées)*.
4. Ajoute une ligne par version, `source='youversion'`, `api_id` = l'ID :

```sql
insert into translations (code, name, language, enabled, source, api_id, public_domain)
values ('S21', 'Segond 21', 'fr', true, 'youversion', '152', false)
on conflict (code) do update
  set source = 'youversion', api_id = '152', enabled = true, language = 'fr';
```

Le texte est lu chapitre par chapitre à la demande, jamais copié dans ta base :
tu restes dans le cadre de la licence acceptée. Si l'affichage d'un chapitre
paraît « en un bloc » plutôt que verset par verset, préviens-moi : le petit
analyseur HTML (`lib/youversion.ts`) se règle en une passe une fois testé avec
ta clé réelle.

## 6. Déploiement de ce lot

```bash
cd ~/Desktop/pain-quotidien
unzip -o ~/Downloads/<ce-zip>.zip -d .
git add -A && git commit -m "bibles: francais seulement + source getbible + import local" && git push
```

Puis, dans Supabase SQL Editor, exécuter `supabase/migrations/0026_french_only.sql`.
Enfin, si voulu, lancer la commande d'import de la Bible de l'Épée (§4).
