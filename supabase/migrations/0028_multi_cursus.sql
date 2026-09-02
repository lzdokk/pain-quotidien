-- ════════════════════════════════════════════════════════════════════
--  0028 — Plusieurs cursus (ITB + ICC) avec accès par code
-- ════════════════════════════════════════════════════════════════════
-- On ajoute un niveau « cursus » au-dessus des cursus_levels existants :
--   • itb : le cursus actuel (Institut biblique).
--   • icc : un parcours de croissance calqué sur la STRUCTURE des formations
--           d’Impact Centre Chrétien (session par session), mais dont le
--           CONTENU est rédigé ORIGINALEMENT par le générateur de l’app
--           (mêmes thèmes bibliques, notre propre voix — rien n’est copié).
-- Chaque cursus peut avoir un mot de passe (null = accès libre).

create table if not exists cursus (
  id           text primary key,
  name         text not null,
  subtitle     text,
  source_url   text,
  password     text,             -- null = accès libre ; sinon code à saisir
  order_index  smallint default 0
);
alter table cursus enable row level security;
drop policy if exists pub_cursus on cursus;
create policy pub_cursus on cursus for select using (true);

alter table cursus_levels add column if not exists cursus_id text references cursus(id);
alter table courses       add column if not exists source_url text;

-- 1) Les deux cursus. (Tu changes les codes/mots de passe quand tu veux.)
-- Les DEUX cursus sont protégés par le même code d'accès (« la section Cursus »
-- est verrouillée). Tu partages ce code à qui tu veux ; toi (admin) passes sans.
insert into cursus (id, name, subtitle, source_url, password, order_index) values
  ('itb', 'Théologie — Institut biblique',
   'Cursus complet : Base, Approfondissement, grec ancien', null, 'ACCES2026', 0),
  ('icc', 'Parcours de Croissance',
   'De la nouvelle naissance à l’école des bergers — mêmes thèmes que le parcours ICC, contenu original',
   'https://formations.egliseicc.com/pages/courses', 'ACCES2026', 1)
on conflict (id) do update set
  name = excluded.name, subtitle = excluded.subtitle,
  source_url = excluded.source_url, order_index = excluded.order_index,
  password = excluded.password;

-- 2) Tous les niveaux existants appartiennent au cursus ITB.
update cursus_levels set cursus_id = 'itb' where cursus_id is null;

-- 3) Le niveau ICC (une section).
insert into cursus_levels (id, name, subtitle, intro, order_index, cursus_id) values
  ('icc-pcnc', 'Parcours de Croissance de la Nouvelle Création',
   '5 formations, de la nouvelle naissance à l’école des bergers',
   'Un parcours de croissance en cinq formations. La structure suit les grandes étapes classiques du disciple ; le contenu de chaque fiche est rédigé pour cette application.',
   0, 'icc')
on conflict (id) do update set cursus_id = 'icc',
  name = excluded.name, subtitle = excluded.subtitle, intro = excluded.intro;

-- Remise à zéro idempotente de la section ICC (structure + fiches) avant (re)pose.
delete from courses where code like 'ICC%';
delete from cursus_groups where level_id = 'icc-pcnc';

-- 4) Les 5 formations = 5 groupes.
insert into cursus_groups (level_id, name, order_index) values
  ('icc-pcnc', '001 · Entrer dans le Royaume',          0),
  ('icc-pcnc', '101 · Les fondements du Royaume',        1),
  ('icc-pcnc', '201 · La croissance spirituelle',        2),
  ('icc-pcnc', 'RTT · Restauration et transformation',   3),
  ('icc-pcnc', 'Poïmaino · Berger et disciple',          4);

-- 5) Les sessions = des cours en attente de génération (status 'planned').
--    Le générateur (/api/cron/courses) rédige ensuite une fiche originale à
--    partir du titre + du thème (hook). kind 'P', hours 0 (sessions).
insert into courses (code, group_id, title, kind, hook, hours, order_index, status, source_url)
select v.code,
       (select id from cursus_groups where level_id = 'icc-pcnc' and name = v.grp),
       v.title, 'P', v.hook, 0::smallint, v.oi::smallint, 'planned', v.url
from (values
  -- 001 · Entrer dans le Royaume
  ('ICC001A','001 · Entrer dans le Royaume','Au commencement, Dieu : le plan, la chute, la promesse','Le plan originel de Dieu, la chute d’Adam et Ève, et la promesse d’un sauveur pour l’humanité.',200,'https://formations.egliseicc.com/courses/001-fr'),
  ('ICC001B','001 · Entrer dans le Royaume','La rédemption par la croix de Christ (1)','Ce que le sacrifice de Christ accomplit pour nous : première partie.',201,'https://formations.egliseicc.com/courses/001-fr'),
  ('ICC001C','001 · Entrer dans le Royaume','La rédemption par la croix de Christ (2)','La portée de la croix pour le croyant : seconde partie.',202,'https://formations.egliseicc.com/courses/001-fr'),
  ('ICC001D','001 · Entrer dans le Royaume','Les premiers pas du disciple (1)','Quatre appuis voulus par Dieu : se faire baptiser, méditer la Parole, prier, appartenir à une famille spirituelle.',203,'https://formations.egliseicc.com/courses/001-fr'),
  ('ICC001E','001 · Entrer dans le Royaume','Les premiers pas du disciple (2)','Vivre ces quatre appuis au quotidien : seconde partie.',204,'https://formations.egliseicc.com/courses/001-fr'),

  -- 101 · Les fondements du Royaume
  ('ICC101A','101 · Les fondements du Royaume','Le salut et la nouvelle naissance','Naître de nouveau : ce qui change quand on passe de la mort à la vie.',205,'https://formations.egliseicc.com/courses/101-les-fondements-du-royaume'),
  ('ICC101B','101 · Les fondements du Royaume','Ta nouvelle identité en Christ','Qui le croyant devient en Christ : enfant de Dieu, justifié, aimé.',206,'https://formations.egliseicc.com/courses/101-les-fondements-du-royaume'),
  ('ICC101C','101 · Les fondements du Royaume','Ton héritage en Christ (1)','Les bénéfices acquis par le sang de Christ : première partie.',207,'https://formations.egliseicc.com/courses/101-les-fondements-du-royaume'),
  ('ICC101D','101 · Les fondements du Royaume','Ton héritage en Christ (2)','Les bénéfices acquis par le sang de Christ : deuxième partie.',208,'https://formations.egliseicc.com/courses/101-les-fondements-du-royaume'),
  ('ICC101E','101 · Les fondements du Royaume','Ton héritage en Christ (3)','Entrer dans la pleine mesure de l’héritage du croyant.',209,'https://formations.egliseicc.com/courses/101-les-fondements-du-royaume'),
  ('ICC101F','101 · Les fondements du Royaume','Manifester le règne de Dieu par l’Esprit (1)','Vivre et rayonner le Royaume par la puissance du Saint-Esprit : première partie.',210,'https://formations.egliseicc.com/courses/101-les-fondements-du-royaume'),
  ('ICC101G','101 · Les fondements du Royaume','Manifester le règne de Dieu par l’Esprit (2)','Vivre et rayonner le Royaume par la puissance du Saint-Esprit : seconde partie.',211,'https://formations.egliseicc.com/courses/101-les-fondements-du-royaume'),
  ('ICC101H','101 · Les fondements du Royaume','Appelé à servir (1)','Grandir, se fortifier et mûrir pour prendre sa place dans le corps.',212,'https://formations.egliseicc.com/courses/101-les-fondements-du-royaume'),
  ('ICC101I','101 · Les fondements du Royaume','Appelé à servir (2)','Mettre ses dons au service des autres, concrètement.',213,'https://formations.egliseicc.com/courses/101-les-fondements-du-royaume'),

  -- 201 · La croissance spirituelle
  ('ICC201A','201 · La croissance spirituelle','Le secret de la vie de Jésus','La source de la vie extraordinaire de Jésus, et comment y puiser.',214,'https://formations.egliseicc.com/courses/copy-of-poimaino-ecole-des-bergers-et-des-disciples-promo-3-2'),
  ('ICC201B','201 · La croissance spirituelle','Prier le Notre Père','Entrer dans la prière que Jésus enseigne : la relation avant la demande.',215,'https://formations.egliseicc.com/courses/copy-of-poimaino-ecole-des-bergers-et-des-disciples-promo-3-2'),
  ('ICC201C','201 · La croissance spirituelle','Que ton nom soit sanctifié','Honorer et sanctifier le nom de Dieu dans la prière et la vie.',216,'https://formations.egliseicc.com/courses/copy-of-poimaino-ecole-des-bergers-et-des-disciples-promo-3-2'),
  ('ICC201D','201 · La croissance spirituelle','Que ton règne vienne','Désirer et accueillir le règne de Dieu.',217,'https://formations.egliseicc.com/courses/copy-of-poimaino-ecole-des-bergers-et-des-disciples-promo-3-2'),
  ('ICC201E','201 · La croissance spirituelle','Que ta volonté soit faite','S’aligner et se soumettre à la volonté du Père.',218,'https://formations.egliseicc.com/courses/copy-of-poimaino-ecole-des-bergers-et-des-disciples-promo-3-2'),
  ('ICC201F','201 · La croissance spirituelle','Le baptême du Saint-Esprit','Recevoir la puissance promise de l’Esprit (Actes 1-2) : ce que c’est et pourquoi.',219,'https://formations.egliseicc.com/courses/copy-of-poimaino-ecole-des-bergers-et-des-disciples-promo-3-2'),
  ('ICC201G','201 · La croissance spirituelle','Le parler en langues et ses bienfaits','Le don des langues : son sens et ses bénéfices pour la vie de prière.',220,'https://formations.egliseicc.com/courses/copy-of-poimaino-ecole-des-bergers-et-des-disciples-promo-3-2'),
  ('ICC201H','201 · La croissance spirituelle','Pourquoi lire et méditer la Parole','Ce que la Parole opère dans le croyant, et pourquoi la fréquenter.',221,'https://formations.egliseicc.com/courses/copy-of-poimaino-ecole-des-bergers-et-des-disciples-promo-3-2'),
  ('ICC201I','201 · La croissance spirituelle','Comment lire et méditer la Parole','Une méthode simple et féconde pour lire, méditer et mettre en pratique.',222,'https://formations.egliseicc.com/courses/copy-of-poimaino-ecole-des-bergers-et-des-disciples-promo-3-2'),

  -- RTT · Restauration et transformation
  ('ICCRTTA','RTT · Restauration et transformation','Trois raisons de restaurer l’âme','Pourquoi l’âme du racheté a besoin d’être restaurée.',223,'https://formations.egliseicc.com/courses/rtt'),
  ('ICCRTTB','RTT · Restauration et transformation','La chair et ses caractéristiques','Reconnaître la chair et ses œuvres (Galates 5).',224,'https://formations.egliseicc.com/courses/rtt'),
  ('ICCRTTC','RTT · Restauration et transformation','Les dégâts causés par la chair','Comprendre les ravages de la chair dans la vie et les relations.',225,'https://formations.egliseicc.com/courses/rtt'),
  ('ICCRTTD','RTT · Restauration et transformation','Restaurer son âme : les clés','Les clés bibliques d’une âme guérie et affermie.',226,'https://formations.egliseicc.com/courses/rtt'),
  ('ICCRTTE','RTT · Restauration et transformation','Comprendre et repérer les forteresses','Identifier les forteresses de pensée qui tiennent captif (2 Corinthiens 10).',227,'https://formations.egliseicc.com/courses/rtt'),
  ('ICCRTTF','RTT · Restauration et transformation','Renverser les forteresses','Démolir les raisonnements et déloger ce qui résiste, par la vérité et l’Esprit.',228,'https://formations.egliseicc.com/courses/rtt'),

  -- Poïmaino · Berger et disciple
  ('ICCPOIA','Poïmaino · Berger et disciple','Le cœur du berger selon Dieu','Des bergers selon le cœur de Dieu (Jérémie 3.15) : d’abord un cœur.',229,'https://formations.egliseicc.com/courses/poimaino'),
  ('ICCPOIB','Poïmaino · Berger et disciple','Nourrir et garder le troupeau','Poïmaino : nourrir, soigner et garder les brebis.',230,'https://formations.egliseicc.com/courses/poimaino'),
  ('ICCPOIC','Poïmaino · Berger et disciple','Prendre soin des âmes','Écouter, porter et relever les âmes confiées (Jean 21, 1 Pierre 5).',231,'https://formations.egliseicc.com/courses/poimaino'),
  ('ICCPOID','Poïmaino · Berger et disciple','Faire des disciples affermis','Former des disciples solides, pas seulement des auditeurs (Matthieu 28).',232,'https://formations.egliseicc.com/courses/poimaino')
) as v(code, grp, title, hook, oi, url);
