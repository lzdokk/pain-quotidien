-- ════════════════════════════════════════════════════════════════════
--  0025 — 7 couleurs de surlignage + cours « Méditer la Bible »
-- ════════════════════════════════════════════════════════════════════

-- 1) Le lecteur propose 7 thèmes/couleurs, mais la contrainte d'origine
--    n'autorisait que 1..4 : les couleurs 5, 6 et 7 échouaient en silence.
alter table highlights drop constraint if exists highlights_color_check;
alter table highlights add  constraint highlights_color_check
  check (color between 1 and 7);

-- 2) Cours pratique : la méthode protestante de méditation de la Bible.
--    Rattaché au premier groupe du Niveau Base, placé à la suite des cours
--    existants. Idempotent : on ne réinsère pas s'il est déjà là.
insert into courses (
  code, group_id, title, kind, hook, hours, order_index,
  objectives, parable, body, key_verse, key_verse_ref, readings, assignment, status
)
select
  'PMED01',
  (select id from cursus_groups where level_id = 'base' order by order_index limit 1),
  'Méditer la Bible selon la méthode protestante',
  'P',
  'Une méthode simple, en étapes, pour passer du texte lu au texte qui transforme',
  6,
  (select coalesce(max(order_index), 0) + 1 from courses
     where group_id = (select id from cursus_groups where level_id = 'base' order by order_index limit 1)),
  $j$[
    "Distinguer la méditation biblique de la méditation orientale et de la simple lecture rapide",
    "Suivre une méthode claire en cinq mouvements : prier, observer, comprendre, appliquer, répondre",
    "Ancrer chaque méditation dans le contexte du passage et dans la personne de Christ",
    "Installer une habitude quotidienne courte, régulière et nourrissante"
  ]$j$::jsonb,
  $p$On peut lire la Bible comme on regarde un paysage par la fenêtre d'un train : tout défile, rien ne reste. Méditer, c'est descendre du train, s'asseoir devant un seul verset, et le retourner dans sa main jusqu'à ce qu'il rende son parfum. Le psaume 1 compare l'homme qui médite jour et nuit à un arbre planté près d'un cours d'eau : ses racines boivent lentement, et c'est pourquoi il porte du fruit en sa saison. La méditation, ce n'est pas lire plus, c'est lire plus profond.$p$,
  $b$[
    {
      "h": "Ce qu'est — et n'est pas — la méditation biblique",
      "p": [
        "La méditation chrétienne est à l'opposé de la méditation orientale. Celle-ci cherche à **vider** l'esprit ; celle-là cherche à le **remplir** de la Parole de Dieu. On ne fait pas le vide, on rumine une vérité révélée jusqu'à ce qu'elle descende de la tête au cœur, puis du cœur aux mains.",
        "Elle se distingue aussi de la simple lecture. Lire, c'est parcourir ; méditer, c'est s'arrêter, interroger, prier le texte. Le mot hébreu *hagah* (Psaume 1.2) évoque le murmure : on se redit le verset à voix basse, comme on savoure lentement un aliment.",
        "Le fondement reste protestant : *sola Scriptura*. C'est le texte qui commande, pas nos impressions. On ne demande pas d'abord « qu'est-ce que ça m'évoque ? » mais « qu'est-ce que Dieu a voulu dire ici ? » — et c'est de ce sens-là que jaillit l'application. L'Esprit qui a inspiré l'Écriture est aussi celui qui l'éclaire (Jean 16.13), d'où la prière avant, pendant et après."
      ]
    },
    {
      "h": "La méthode, en cinq mouvements",
      "p": [
        "**1. Prier pour voir.** Avant d'ouvrir, une phrase suffit : « Seigneur, ouvre mes yeux pour que je contemple les merveilles de ta loi » (Psaume 119.18). On dépend de l'Esprit, pas de son intelligence.",
        "**2. Observer le texte.** Lire lentement, deux ou trois fois, le passage entier. Qui parle ? À qui ? Que se passe-t-il avant et après ? Quels mots reviennent ? Quel est le ton ? On note ce qu'on voit, sans encore conclure.",
        "**3. Comprendre le sens.** Que voulait dire l'auteur pour ses premiers lecteurs ? On respecte le contexte immédiat, le genre littéraire et le fil du livre. Puis on demande : que m'apprend ce passage sur Dieu, sur l'homme, et sur Christ ? Toute l'Écriture conduit à lui (Luc 24.27).",
        "**4. S'approprier et appliquer.** On choisit **une** vérité, une promesse à croire, un ordre à suivre, un péché à quitter, un exemple à imiter. On la rumine, on se la redit. Puis on la traduit en **une** action concrète pour aujourd'hui — précise, vérifiable.",
        "**5. Répondre à Dieu.** On reprend le texte dans la prière : adoration pour ce qu'il révèle, confession de ce qu'il met en lumière, requête pour l'obéir. La méditation qui ne débouche pas sur la prière et l'action reste une théorie."
      ]
    },
    {
      "h": "Tenir dans la durée",
      "p": [
        "Mieux vaut dix minutes chaque matin que deux heures une fois par mois. La régularité fait l'arbre, pas l'intensité d'un jour. Choisissez une heure, un lieu, un carnet.",
        "Restez court et concret. Un seul verset médité et obéi vaut mieux qu'un chapitre survolé. Gardez une trace écrite : une phrase sur ce que Dieu a dit, une phrase sur ce que vous ferez.",
        "Reliez la méditation au reste de la journée : le soir, relisez votre note et demandez-vous si vous avez vécu ce que vous aviez reçu. C'est ainsi que la Parole passe de la lecture à la vie."
      ]
    }
  ]$b$::jsonb,
  $kv$Que ce livre de la loi ne s'éloigne point de ta bouche ; médite-le jour et nuit, pour agir fidèlement selon tout ce qui y est écrit ; car c'est alors que tu auras du succès dans tes entreprises, c'est alors que tu réussiras.$kv$,
  'Josué 1.8',
  $r$["Psaume 1","Josué 1.1 à 9","Psaume 119.9 à 16","Luc 24.27","Jean 5.39 et 40"]$r$::jsonb,
  'Méditez le Psaume 1 en suivant les cinq mouvements du cours. Écrivez : une vérité observée sur Dieu, une application concrète pour cette semaine, et une courte prière de réponse tirée du texte.',
  'reviewed'
where not exists (select 1 from courses where code = 'PMED01');
