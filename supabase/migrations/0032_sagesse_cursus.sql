-- ════════════════════════════════════════════════════════════════════
--  0032 — Sagesse du jour (Proverbes) · accès Cursus partagé · titres
-- ════════════════════════════════════════════════════════════════════

-- 1) PROVERBES DU JOUR : une fiche par chapitre (1 à 31), rédigée une fois.
create table if not exists proverbes_daily (
  chapter        smallint primary key check (chapter between 1 and 31),
  title          text,
  key_verse      smallint,
  prayer_before  jsonb,
  meditation     jsonb,
  retenir        text,
  prayer_after   jsonb,
  updated_at     timestamptz default now()
);
alter table proverbes_daily enable row level security;
drop policy if exists pub_proverbes on proverbes_daily;
create policy pub_proverbes on proverbes_daily for select using (true);

-- 2) CURSUS : frères et sœurs à qui l'accès est donné (par email).
--    Aucune lecture publique : seul le serveur (clé admin) lit cette table.
create table if not exists cursus_members (
  email      text primary key,
  name       text,
  added_by   text,
  created_at timestamptz default now()
);
alter table cursus_members enable row level security;

-- 3) CURSUS : des noms et des titres PROPRES à l'application.
--    Les codes internes (itb, icc, ICC001A…) ne changent pas : la progression
--    de chacun est conservée.
update cursus set
  name = 'Fondements & Théologie',
  subtitle = 'Trois niveaux : les fondations, l’approfondissement, le grec du Nouveau Testament',
  source_url = null
where id = 'itb';

update cursus set
  name = 'Racines & Croissance',
  subtitle = 'Cinq étapes pour grandir : de la nouvelle naissance au cœur de berger',
  source_url = null
where id = 'icc';

update cursus_levels set
  name = 'Grandir en Christ, pas à pas',
  subtitle = '5 étapes, de la nouvelle naissance au service des autres',
  intro = 'Cinq étapes pour enraciner sa foi : naître de nouveau, bâtir sur le roc, prendre racine, laisser Dieu restaurer l’âme, puis prendre soin des autres. Chaque fiche est rédigée pour Pain de Vie.'
where id = 'icc-pcnc';

-- Niveaux du cursus Fondements & Théologie (renommés d'après leur contenu).
update cursus_levels set name = case
    when name ilike '%grec%'              then 'Niveau 3 · Le grec du Nouveau Testament'
    when name ilike '%approfondissement%' then 'Niveau 2 · Approfondir'
    when name ilike '%base%'              then 'Niveau 1 · Les fondations'
    else name end
where cursus_id = 'itb';

update cursus_groups set name = case name
    when '001 · Entrer dans le Royaume'          then 'Étape 1 · Naître de nouveau'
    when '101 · Les fondements du Royaume'        then 'Étape 2 · Bâtir sur le roc'
    when '201 · La croissance spirituelle'        then 'Étape 3 · Prendre racine'
    when 'RTT · Restauration et transformation'   then 'Étape 4 · Une âme restaurée'
    when 'Poïmaino · Berger et disciple'          then 'Étape 5 · Prendre soin du troupeau'
    else name end
where level_id = 'icc-pcnc';

-- Titres et accroches des 33 sessions, réécrits ; plus aucun lien externe.
update courses c set title = v.title, hook = v.hook, source_url = null
from (values
  ('ICC001A','Au commencement : le dessein de Dieu et la promesse','Pourquoi Dieu a créé l’homme, ce que la chute a brisé, et la promesse qui traverse toute l’Écriture.'),
  ('ICC001B','La croix, là où tout change','Ce que Yéchoua (Jésus) a porté à la croix, et ce que cela ouvre pour nous.'),
  ('ICC001C','Racheté pour de bon','Pardon, réconciliation, liberté : ce que la croix produit dans la vie du croyant.'),
  ('ICC001D','Les premiers réflexes du disciple','Baptême, Parole, prière, communauté : quatre habitudes pour bien démarrer.'),
  ('ICC001E','Marcher chaque jour avec Dieu','Faire de ces habitudes une vie : régularité, fidélité et joie.'),
  ('ICC101A','Passé de la mort à la vie','La nouvelle naissance selon Jean 3 : ce qui change vraiment.'),
  ('ICC101B','Qui je suis désormais','Enfant de Dieu, pardonné, accepté : l’identité que donne le Messie.'),
  ('ICC101C','Ce que Dieu m’a donné (1)','Un héritage reçu par grâce : la paix avec Dieu et l’adoption.'),
  ('ICC101D','Ce que Dieu m’a donné (2)','La justice, la sanctification et le libre accès au Père.'),
  ('ICC101E','Ce que Dieu m’a donné (3)','Vivre dès maintenant de ce qui nous est promis pour l’éternité.'),
  ('ICC101F','L’Esprit à l’œuvre en moi (1)','Le Ruah HaKodech (Saint-Esprit) qui console, guide et fortifie.'),
  ('ICC101G','L’Esprit à l’œuvre en moi (2)','Laisser l’Esprit porter son fruit et agir à travers nous.'),
  ('ICC101H','Une place dans le corps (1)','Chaque croyant a un rôle dans l’Église : découvrir le sien.'),
  ('ICC101I','Une place dans le corps (2)','Servir avec ses dons, simplement, là où l’on est.'),
  ('ICC201A','La source cachée de Jésus','Jésus se retirait pour prier : apprendre de sa relation avec le Père.'),
  ('ICC201B','Apprendre à prier avec Jésus','La prière modèle de Matthieu 6 : d’abord une relation.'),
  ('ICC201C','Ton Nom est saint','Honorer Dieu pour qui il est, dans la prière et dans la vie.'),
  ('ICC201D','Ton règne, pas le mien','Désirer que Dieu règne : dans le cœur, la maison, le monde.'),
  ('ICC201E','Ta volonté avant la mienne','Faire confiance au Père et s’abandonner à son dessein.'),
  ('ICC201F','Revêtu de puissance','La promesse du Père en Actes 1 et 2 : être rempli de l’Esprit.'),
  ('ICC201G','Le don des langues dans la prière','Ce que l’Écriture dit de ce don et de sa place dans la vie de prière.'),
  ('ICC201H','Pourquoi se nourrir de la Parole','La Parole qui nourrit, corrige et fait grandir.'),
  ('ICC201I','Méditer la Parole, pas à pas','Une méthode simple pour lire, retenir et vivre ce qu’on lit.'),
  ('ICCRTTA','Pourquoi l’âme a besoin de guérir','Né de nouveau, et pourtant blessé : comprendre le chemin de restauration.'),
  ('ICCRTTB','Reconnaître la chair','Les œuvres de la chair selon Galates 5, sans se condamner.'),
  ('ICCRTTC','Quand la chair fait des ravages','Ce que la chair détruit dans la vie, la famille et l’Église.'),
  ('ICCRTTD','Le chemin de la guérison intérieure','Repentance, pardon, vérité : les étapes bibliques de la restauration.'),
  ('ICCRTTE','Les murs dans la pensée','Repérer les raisonnements qui retiennent captif (2 Co 10).'),
  ('ICCRTTF','Abattre les murs par la vérité','Remplacer le mensonge par la vérité de Dieu, avec l’aide de l’Esprit.'),
  ('ICCPOIA','Un cœur de berger','Jérémie 3.15 : Dieu donne des bergers selon son cœur.'),
  ('ICCPOIB','Nourrir les brebis','Paître, soigner, protéger : le service du berger (Jean 21).'),
  ('ICCPOIC','Accompagner les âmes','Écouter, porter et relever ceux qui nous sont confiés.'),
  ('ICCPOID','Former des disciples solides','Matthieu 28 : faire des disciples qui en forment d’autres.')
) as v(code, title, hook)
where c.code = v.code;

update courses set source_url = null where source_url is not null;

-- Vérification : les noms affichés après la mise à jour.
select c.name as cursus, l.name as niveau, g.name as groupe
from cursus c join cursus_levels l on l.cursus_id = c.id
left join cursus_groups g on g.level_id = l.id
order by c.order_index, l.order_index, g.order_index;
