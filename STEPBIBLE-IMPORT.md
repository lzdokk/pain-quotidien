# Import de l'interlinéaire mot-à-mot (STEPBible → verse_words)

Le parser est validé sur ton échantillon (בָּרָא → H1254 « to create », etc.).
Voici comment remplir la base. Les gros fichiers restent sur ton Mac.

## 1. Migration
Dans **Supabase → SQL Editor**, exécute `supabase/migrations/0023_verse_words.sql`
(crée la table `verse_words` + lecture publique).

## 2. Télécharger les fichiers STEPBible
Dépôt `github.com/STEPBible/STEPBible-Data` (Code → Download ZIP). Tu as besoin :
- **Hébreu (AT)** : les 4 fichiers `TAHOT …` (Gen-Deu, Jos-Est, Job-Sng, Isa-Mal)
- **Grec (NT)** : les 2 fichiers `TAGNT …` (Mat-Jhn, Act-Rev)

## 3. Lancer l'import (depuis la racine du projet)
Récupère tes clés Supabase (les mêmes que dans Vercel) et lance :

```bash
NEXT_PUBLIC_SUPABASE_URL="https://XXXX.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJ...(clé service_role)" \
node scripts/import-stepbible.mjs \
  "TAHOT Gen-Deu - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt" \
  "TAHOT Jos-Est - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt" \
  "TAHOT Job-Sng - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt" \
  "TAHOT Isa-Mal - Translators Amalgamated Hebrew OT - STEPBible.org CC BY.txt" \
  "TAGNT Mat-Jhn - Translators Amalgamated Greek NT - STEPBible.org CC BY.txt" \
  "TAGNT Act-Rev - Translators Amalgamated Greek NT - STEPBible.org CC BY.txt"
```

Le script affiche l'avancement (« X mots importés… ») et est **ré-exécutable
sans risque**. Compte quelques minutes (~400 000 mots).

> ⚠️ Le parser est confirmé pour l'**hébreu (TAHOT)**. Pour le **grec (TAGNT)**,
> les colonnes peuvent différer : envoie-moi ~20 lignes d'un fichier TAGNT avant
> de l'importer, je confirme/ajuste en 2 minutes. Tu peux déjà importer l'hébreu.

## 4. Ensuite
Une fois des mots en base, je te livre l'**affichage mot-à-mot dans le lecteur**
(tap sur un verset → chaque mot cliquable → sens français via le lexique Strong,
comme les captures de l'appli biblique).

## Licence
Données STEPBible **CC BY 4.0** — pense à créditer « STEPBible.org » quelque part
dans l'app (ex. bas de la page /lexique).
