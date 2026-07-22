# PROTOTYPE.html

Le prototype de design validé, en un seul fichier autonome, recalé sur les
couleurs du logo. Il sert de référence visuelle et fonctionne hors ligne.

Les données du prototype sont dans `/seed`, chargées en base par
`scripts/seed-reference.ts`.

## Portage en Next.js, terminé

| Page | Route | Composants |
|---|---|---|
| Matin | `app/page.tsx` | `Shell`, `Reading`, `DayActions`, `Checklist` |
| Archive | `app/jour/[date]` | idem, avec `generateStaticParams` |
| Témoigner | `app/temoigner` | `Openers`, `Intercession`, `ShareBar` |
| Soir | `app/soir` | `Checklist` |
| Lire | `app/lire` | `Reader`, `Explain` |
| Questions | `app/questions` + `[id]` | `QuestionBrowser` |
| Cursus | `app/cursus` + `[code]` | `CursusBrowser`, `ValidateCourse` |

Toutes les données personnelles passent par Supabase avec RLS. Sans compte,
le site reste consultable, seules la sauvegarde et l'assistant demandent
une connexion.
