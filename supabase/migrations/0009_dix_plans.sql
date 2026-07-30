-- ════════════════════════════════════════════════════════════════════
--  LES DIX PARCOURS DE LECTURE
--  A executer dans Supabase, SQL Editor. Remplace tous les parcours.
--  Le suivi d'avancement fonctionne automatiquement : le nombre de
--  chapitres de chaque etape alimente la barre de progression et le
--  bouton « J'ai lu, chapitre suivant ».
-- ════════════════════════════════════════════════════════════════════

-- On detache d'abord les comptes de leur parcours, sinon Postgres refuse
-- de supprimer une ligne encore referencee. Les comptes sont rattaches
-- au parcours de depart a la fin du script.
update user_plan set plan_id = null;
delete from plan_steps;
delete from reading_plans;

-- ─── 1. Fondation évangélique, 30 jours ─────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('fondement', 'Fondation évangélique', 'L''essentiel en trente jours', 'progressif', 30,
 'Vous découvrez la foi, ou vous voulez reprendre par le commencement.',
 'Quatre semaines, quatre piliers. On ne commence pas la Bible à la Genèse comme on ne commence pas une série par les archives du studio. On commence par les origines, puis par Jésus, puis par le mécanisme du salut, et on termine par la prière. À la fin du mois, les doctrines fondatrices sont en place.', 1);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('fondement', 0, 1,  'Genèse 1 à 11', 7,  'Semaine 1, les origines',
 'La création, la chute, le déluge, Babel. D''où vient le monde, et d''où vient ce qui ne va pas.',
 '["Genèse 1, la création","Genèse 3, la rupture","Genèse 12.1-3, la promesse"]'::jsonb),
('fondement', 1, 43, 'Jean', 8,  'Semaine 2, qui est Jésus',
 'Le seul évangile qui commence avant la naissance. Sept signes, sept déclarations « Je suis ». Jean dit lui-même pourquoi il écrit, en 20.31.',
 '["Jean 1.1-18, le prologue","Jean 3.16","Jean 11, Lazare","Jean 20, la résurrection"]'::jsonb),
('fondement', 2, 45, 'Romains', 8,  'Semaine 3, le mécanisme du salut',
 'L''exposé le plus complet de la foi chrétienne. Le péché, la grâce, la justification, l''Esprit, l''espérance.',
 '["Romains 3.21-26","Romains 8","Romains 12"]'::jsonb),
('fondement', 3, 19, 'Psaumes choisis', 7,  'Semaine 4, apprendre à prier',
 'Sept psaumes qui couvrent toute la gamme : la confiance, le cri, le pardon, la louange.',
 '["Psaume 1","Psaume 23","Psaume 51","Psaume 139"]'::jsonb);

-- ─── 2. Promesses et réconfort, 21 jours ────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('reconfort', 'Promesses et réconfort', 'Pour les jours de tempête', 'progressif', 21,
 'Vous traversez une épreuve, une fatigue, un combat. Vous avez besoin d''un baume, pas d''un programme.',
 'Ce parcours ne demande pas d''effort. Il rassemble les textes sur la paix, la protection et la force dans la faiblesse. Trois semaines pour laisser la Parole faire son travail quand on n''a plus la force d''en faire beaucoup.', 2);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('reconfort', 0, 19, 'Psaumes de refuge', 7, 'La première semaine, se poser',
 'Sept psaumes où quelqu''un crie et se retrouve tenu. Rien à comprendre, tout à recevoir.',
 '["Psaume 23","Psaume 27","Psaume 46","Psaume 91","Psaume 121"]'::jsonb),
('reconfort', 1, 23, 'Ésaïe 40 à 43', 4, 'La deuxième semaine, relever la tête',
 'Les chapitres de la consolation. « Ceux qui se confient en l''Éternel renouvellent leur force. »',
 '["Ésaïe 40.28-31","Ésaïe 41.10","Ésaïe 43.1-3"]'::jsonb),
('reconfort', 2, 40, 'Matthieu 5 à 7 et 11', 4, 'La troisième semaine, entendre Jésus',
 'Les béatitudes, puis l''invitation la plus douce de l''Évangile : « Venez à moi, vous tous qui êtes fatigués. »',
 '["Matthieu 5.1-12","Matthieu 6.25-34","Matthieu 11.28-30"]'::jsonb),
('reconfort', 3, 47, '2 Corinthiens 1, 4 et 12', 3, 'Pour finir, la force dans la faiblesse',
 'Paul ne cache pas ses limites. Il découvre que la grâce suffit, et que la puissance s''accomplit dans la faiblesse.',
 '["2 Corinthiens 1.3-7","2 Corinthiens 4.7-18","2 Corinthiens 12.9"]'::jsonb),
('reconfort', 4, 50, 'Philippiens', 3, 'La joie sous pression',
 'Écrite depuis une prison. Le mot « joie » y revient seize fois.',
 '["Philippiens 4.4-9","Philippiens 4.11-13"]'::jsonb);

-- ─── 3. Les quatre Évangiles, 90 jours ──────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('evangiles90', 'Les quatre Évangiles', 'Marcher avec Jésus, trois mois', 'progressif', 90,
 'Vous voulez fixer le regard sur Christ avant d''élargir à toute la bibliothèque biblique.',
 'Quatre portraits d''une même personne. Lire à la suite fait apparaître ce que chacun choisit de garder et de laisser. Marc pour le récit brut, Matthieu pour l''enseignement, Luc pour les exclus, Jean pour la profondeur.', 3);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('evangiles90', 0, 41, 'Marc',     16, 'Le récit le plus rapide',
 'Le plus court, sans doute le premier écrit. Le mot « aussitôt » y revient plus de quarante fois.',
 '["Marc 4, les paraboles","Marc 8.27-38","Marc 15, la croix"]'::jsonb),
('evangiles90', 1, 40, 'Matthieu', 28, 'Jésus enseignant',
 'L''évangile qui rassemble les grands discours, du Sermon sur la montagne aux paraboles du Royaume.',
 '["Matthieu 5 à 7","Matthieu 13","Matthieu 28.18-20"]'::jsonb),
('evangiles90', 2, 42, 'Luc',      24, 'L''évangile des exclus',
 'Luc s''intéresse aux femmes, aux pauvres, aux étrangers, à ceux qui sont hors cadre.',
 '["Luc 10.25-37","Luc 15","Luc 24, Emmaüs"]'::jsonb),
('evangiles90', 3, 43, 'Jean',     21, 'La profondeur',
 'Le regard le plus théologique. Sept signes, sept « Je suis », et le discours d''adieu.',
 '["Jean 1.1-18","Jean 15","Jean 17"]'::jsonb);

-- ─── 4. Nouveau Testament en semaine, 26 semaines ───────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('nt5jours', 'Nouveau Testament, cinq jours par semaine', 'Six mois, week-ends libres', 'integral', 130,
 'Vous voulez tout le Nouveau Testament, sans la culpabilité du retard.',
 'On lit du lundi au vendredi seulement. Le week-end sert à souffler, à rattraper, ou à méditer un passage qui a marqué. C''est le plan qui tient dans la durée, parce qu''il prévoit les jours où la vie déborde.', 4);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('nt5jours', 0, 40, 'Les évangiles',            89, 'Matthieu à Jean',
 'Quatre récits de la vie de Jésus, lus à la suite, environ trois mois.',
 '["Matthieu 5 à 7","Marc 8.27-38","Luc 15","Jean 20"]'::jsonb),
('nt5jours', 1, 44, 'Actes',                    28, 'L''expansion',
 'De Jérusalem à Rome en trente ans. Le livre du Saint-Esprit et de la mission.',
 '["Actes 2","Actes 9","Actes 17"]'::jsonb),
('nt5jours', 2, 45, 'Les épîtres de Paul',      87, 'Romains à Philémon',
 'Treize lettres, de la théologie la plus dense à la note personnelle la plus courte.',
 '["Romains 8","1 Corinthiens 13","Galates 2.20","Éphésiens 2"]'::jsonb),
('nt5jours', 3, 58, 'Hébreux et épîtres générales', 34, 'Le reste du témoignage',
 'Hébreux, Jacques, Pierre, Jean, Jude. La persévérance et la vie concrète.',
 '["Hébreux 11","Jacques 2","1 Pierre 2","1 Jean 4"]'::jsonb),
('nt5jours', 4, 66, 'Apocalypse',               22, 'La fin de l''histoire',
 'Un livre de consolation écrit pour des persécutés, à lire comme tel.',
 '["Apocalypse 1","Apocalypse 21"]'::jsonb);

-- ─── 5. Les grands héros, 60 jours ──────────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('heros', 'Les grands héros de la foi', 'Les tournants de l''Alliance', 'progressif', 60,
 'Vous apprenez mieux par les récits que par les exposés.',
 'La Bible ne cache pas les échecs de ses héros, et c''est précisément ce qui la rend crédible. Suivre Abraham, Moïse, David, Élie, Daniel et Paul, c''est apprendre autant de leurs chutes que de leurs victoires.', 5);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('heros', 0, 1,  'Abraham',  12, 'L''homme qui part sans savoir où',
 'Genèse 12 à 25. La promesse, l''attente, le sacrifice arrêté. La foi qui compte comme justice.',
 '["Genèse 12.1-3","Genèse 15","Genèse 22"]'::jsonb),
('heros', 1, 2,  'Moïse',    14, 'L''homme qui se croyait incapable',
 'Exode 1 à 20. Le buisson, les objections, la sortie d''Égypte, la Loi.',
 '["Exode 3","Exode 12","Exode 20"]'::jsonb),
('heros', 2, 9,  'David',    14, 'L''homme selon le cœur de Dieu, et sa chute',
 '1 et 2 Samuel. Le berger, le géant, le roi, l''adultère, le repentir du Psaume 51.',
 '["1 Samuel 17","2 Samuel 11","Psaume 51"]'::jsonb),
('heros', 3, 11, 'Élie',      8, 'L''homme qui a voulu mourir',
 '1 Rois 17 à 19, 2 Rois 2. Le feu du Carmel, puis la dépression, puis le murmure doux et léger.',
 '["1 Rois 18","1 Rois 19.1-18","2 Rois 2"]'::jsonb),
('heros', 4, 27, 'Daniel',    6, 'L''homme fidèle en terre étrangère',
 'Comment rester droit dans un empire païen, sans se couper du monde ni s''y dissoudre.',
 '["Daniel 1","Daniel 3","Daniel 6"]'::jsonb),
('heros', 5, 44, 'Paul',      6, 'L''homme retourné sur la route',
 'Actes 9, 13 à 20. Le persécuteur devenu apôtre, et les voyages qui ont porté l''Évangile jusqu''à Rome.',
 '["Actes 9","Actes 17","Actes 20.17-38"]'::jsonb);

-- ─── 6. Sagesse et poésie, cycle mensuel ────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('sagesse', 'Sagesse et poésie', 'Un proverbe par jour, cinq psaumes par semaine', 'libre', 31,
 'Vous cherchez une nourriture quotidienne courte, à reprendre chaque mois.',
 'Les Proverbes comptent trente et un chapitres, un par jour du mois. En parallèle, cinq psaumes par semaine. C''est le parcours qu''on ne termine jamais vraiment : il se recommence, et il ne dit pas la même chose selon la saison qu''on traverse.', 6);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('sagesse', 0, 20, 'Proverbes', 31, 'Un chapitre par jour du mois',
 'La parole, l''argent, le travail, les amitiés, la colère. La sagesse concrète, verset après verset.',
 '["Proverbes 3.5-6","Proverbes 15.1","Proverbes 31"]'::jsonb),
('sagesse', 1, 19, 'Psaumes, en parallèle', 0, 'Cinq par semaine',
 'À lire en plus du proverbe du jour. Toute la gamme de ce qu''on peut dire à Dieu, y compris la colère.',
 '["Psaume 1","Psaume 23","Psaume 103","Psaume 139"]'::jsonb),
('sagesse', 2, 21, 'Ecclésiaste, pour finir le cycle', 12, 'Quand tout semble vain',
 'Le livre le plus lucide de la Bible sur l''absurdité apparente de l''existence, et sur ce qui reste.',
 '["Ecclésiaste 3","Ecclésiaste 12"]'::jsonb);

-- ─── 7. Les Prophètes, 75 jours ─────────────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('prophetes75', 'Les Prophètes', 'La justice et l''espérance', 'progressif', 75,
 'Vous connaissez les récits et les évangiles, et les prophètes vous restent obscurs.',
 'Les prophètes ne prédisent pas d''abord l''avenir : ils rappellent l''alliance, dénoncent l''injustice et tiennent ouverte l''espérance. Ce sont eux que le Nouveau Testament cite le plus. Les lire, c''est comprendre le vocabulaire dans lequel Jésus s''est présenté.', 7);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('prophetes75', 0, 23, 'Ésaïe',    66, 'L''attente du Messie',
 'Le prophète le plus cité par le Nouveau Testament. Les chapitres du Serviteur souffrant sont bouleversants.',
 '["Ésaïe 6","Ésaïe 53","Ésaïe 55"]'::jsonb),
('prophetes75', 1, 24, 'Jérémie',  52, 'La fidélité dans l''effondrement',
 'Un homme qui pleure sur son peuple pendant que tout s''écroule, et qui annonce une alliance nouvelle.',
 '["Jérémie 1","Jérémie 29","Jérémie 31.31-34"]'::jsonb),
('prophetes75', 2, 26, 'Ézéchiel', 48, 'La gloire qui revient',
 'Des visions puissantes en exil, des ossements qui reprennent vie, un temple restauré.',
 '["Ézéchiel 1","Ézéchiel 37","Ézéchiel 47"]'::jsonb),
('prophetes75', 3, 27, 'Daniel',   12, 'Tenir en exil',
 'La fidélité dans un empire païen, et l''espérance du Royaume qui ne finira pas.',
 '["Daniel 3","Daniel 6","Daniel 7"]'::jsonb),
('prophetes75', 4, 28, 'Les douze petits prophètes', 67, 'D''Osée à Malachie',
 'Douze voix brèves et intenses : la fidélité de Dieu, la justice sociale, le jour du Seigneur.',
 '["Osée 11","Amos 5","Michée 6.8","Jonas 4"]'::jsonb);

-- ─── 8. Les 66 livres par genres, 180 jours ─────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('genres', 'Les 66 livres par genres', 'La grande fresque, six mois', 'integral', 180,
 'Vous voulez saisir la logique d''ensemble sans vous perdre dans les détails.',
 'La Bible n''est pas un livre mais une bibliothèque, et on ne lit pas une loi comme un poème, ni une chronique comme une lettre. Traverser les six grands genres dans l''ordre fait apparaître la fresque entière de la rédemption.', 8);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('genres', 0, 1,  'La Loi',                187, 'Genèse à Deutéronome',
 'La fondation. Les origines, la formation d''un peuple, le don de la Loi.',
 '["Genèse 1","Exode 20","Lévitique 16","Deutéronome 6"]'::jsonb),
('genres', 1, 6,  'L''Histoire d''Israël', 249, 'Josué à Esther',
 'La conquête, les juges, la royauté, l''exil, le retour. Douze livres de chronique.',
 '["Josué 1","Juges 2","1 Rois 18","Néhémie 8"]'::jsonb),
('genres', 2, 18, 'Poésie et sagesse',     243, 'Job à Cantique des cantiques',
 'La souffrance, la prière, la sagesse pratique, le désir. La Bible qui parle au cœur.',
 '["Job 38","Psaume 22","Proverbes 3","Ecclésiaste 3"]'::jsonb),
('genres', 3, 23, 'Les Prophètes',         250, 'Ésaïe à Malachie',
 'Dix-sept livres qui rappellent l''alliance et tiennent ouverte l''espérance.',
 '["Ésaïe 53","Jérémie 31","Ézéchiel 37","Michée 6.8"]'::jsonb),
('genres', 4, 40, 'Évangiles et Actes',    117, 'Matthieu à Actes',
 'La venue de Jésus, puis ce que cette venue a produit en trente ans.',
 '["Jean 1","Luc 15","Actes 2","Actes 17"]'::jsonb),
('genres', 5, 45, 'Épîtres et Apocalypse', 143, 'Romains à Apocalypse',
 'La doctrine, la vie d''Église, la persévérance, et la fin de l''histoire.',
 '["Romains 8","Éphésiens 2","Hébreux 11","Apocalypse 21"]'::jsonb);

-- ─── 9. Chronologique en un an ──────────────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('chrono', 'Chronologique en un an', 'La Bible dans l''ordre des événements', 'integral', 365,
 'Vous avez déjà lu la Bible et l''enchaînement historique vous échappe.',
 'L''ordre des livres n''est pas l''ordre des événements. Job se lit au temps des patriarches, les psaumes de David s''intercalent dans 1 et 2 Samuel, les prophètes se replacent dans les règnes qu''ils traversent. Tout devient beaucoup plus clair.', 9);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('chrono', 0, 1,  'Origines et patriarches',      60,  'Genèse, Job',
 'Job se situe probablement à l''époque d''Abraham, ce qui change complètement sa lecture.',
 '["Genèse 12","Job 1","Job 38"]'::jsonb),
('chrono', 1, 2,  'Sortie d''Égypte et Loi',      70,  'Exode à Deutéronome',
 'La formation d''un peuple et le don de la Loi.',
 '["Exode 20","Lévitique 16","Deutéronome 6"]'::jsonb),
('chrono', 2, 6,  'Conquête et royauté',          110, 'Josué à Rois, avec les Psaumes replacés',
 'Les psaumes de David lus au moment où il les a écrits.',
 '["1 Samuel 17","2 Samuel 11 et Psaume 51","1 Rois 18"]'::jsonb),
('chrono', 3, 23, 'Prophètes dans leur règne',    80,  'Ésaïe, Jérémie, Ézéchiel, Daniel et les douze',
 'Chaque oracle remis dans le contexte politique qui l''a provoqué.',
 '["Ésaïe 6","Jérémie 29","Daniel 9"]'::jsonb),
('chrono', 4, 40, 'Vie de Jésus en harmonie',     30,  'Les quatre évangiles fondus',
 'Les récits parallèles rassemblés en un seul déroulé.',
 '["Luc 2","Jean 11","Matthieu 27"]'::jsonb),
('chrono', 5, 44, 'Église et lettres datées',     15,  'Actes avec les épîtres à leur place',
 'Les lettres de Paul insérées au moment du voyage où il les a écrites.',
 '["Actes 18 et 1 Thessaloniciens","Actes 20","Apocalypse 22"]'::jsonb);

-- ─── 10. Intégral équilibré, un an ──────────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('integrale', 'Intégral équilibré', 'Ancien et Nouveau Testament, chaque jour', 'integral', 365,
 'Vous voulez avoir lu toute la Bible en fin d''année, à un rythme digeste.',
 'Le grand classique indémodable. Chaque jour, un passage d''Ancien Testament, un psaume ou un proverbe, un passage de Nouveau Testament. Environ quinze minutes. On ne s''enlise jamais dans les généalogies, parce que l''Évangile revient tous les jours.', 10);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('integrale', 0, 1,  'Ancien Testament, lecture continue', 0, 'Un à deux chapitres par jour',
 'De la Genèse à Malachie, dans l''ordre des livres.',
 '["Genèse 1","Exode 20","Ésaïe 53"]'::jsonb),
('integrale', 1, 19, 'Psaumes et Proverbes',               0, 'Un passage par jour',
 'En parallèle, toute l''année. La prière et la sagesse en accompagnement.',
 '["Psaume 23","Psaume 119","Proverbes 3"]'::jsonb),
('integrale', 2, 40, 'Nouveau Testament, lecture continue', 0, 'Un chapitre par jour',
 'De Matthieu à l''Apocalypse, deux fois dans l''année.',
 '["Jean 3","Romains 8","Apocalypse 21"]'::jsonb);

-- ─── Mosaïque, Ancien et Nouveau mêlés ──────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('mosaique', 'Mosaïque', 'Les deux Testaments en miroir', 'integral', 365,
 'Vous avez déjà abandonné un plan en route, découragé par les longs blocs de lois.',
 'Chaque jour, un passage de chaque Testament, choisis pour s''éclairer mutuellement. L''agneau de la Pâque et l''Agneau de Dieu, le temple et le corps, l''alliance et la nouvelle alliance. On ne lit jamais deux fois la même chose de la même manière.', 11);

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
('mosaique', 0, 1,  'Ancien Testament, un passage',  0, 'Le matin',
 'La promesse, la Loi, les récits, les prophètes. Ce qui prépare et annonce.',
 '["Genèse 22","Exode 12","Ésaïe 53"]'::jsonb),
('mosaique', 1, 40, 'Nouveau Testament, un passage', 0, 'Le soir',
 'L''accomplissement, lu le même jour. C''est là que le rapprochement se fait tout seul.',
 '["Jean 1.29","Hébreux 9","Luc 24.27"]'::jsonb);

-- Les comptes qui n'ont plus de parcours repartent sur la Fondation.
-- Chacun peut en changer ensuite depuis la page Lire.
update user_plan set plan_id = 'fondement', current_day = 1 where plan_id is null;
