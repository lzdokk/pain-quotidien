-- Trois parcours de lecture supplementaires, pour atteindre dix au total.
-- Donnee pure : a executer dans Supabase SQL Editor, aucun redeploiement requis.

-- ─── 1. Les Evangiles en 40 jours ───────────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values (
  'evangiles40', $q$Les Evangiles en 40 jours$q$, $q$Marcher avec Jesus, quatre regards$q$, 'progressif', 40,
  $q$Vous voulez passer un temps concentre aupres de Jesus, sans encore lire toute la Bible.$q$,
  $q$Quarante jours, la duree biblique de la preparation et du desert. On lit les quatre evangiles a la suite : Marc pour le recit brut, Matthieu pour l'enseignement, Luc pour les exclus, Jean pour la profondeur. Le meme Jesus, sous quatre eclairages.$q$, 7
) on conflict (id) do nothing;

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
 ('evangiles40', 0, 41, $q$Marc$q$, 16, $q$Le recit le plus rapide$q$, $q$Le plus court des evangiles, sans doute le premier ecrit. Le mot aussitot y revient sans cesse. Une lecture d'une traite est possible.$q$, $q$["Marc 4, les paraboles","Marc 8.27-38, la question centrale","Marc 15, la croix"]$q$::jsonb),
 ('evangiles40', 1, 40, $q$Matthieu$q$, 28, $q$Jesus enseignant$q$, $q$L'evangile qui rassemble les grands discours, du Sermon sur la montagne aux paraboles du Royaume.$q$, $q$["Matthieu 5 a 7, le Sermon","Matthieu 13, le Royaume","Matthieu 28, l'envoi"]$q$::jsonb),
 ('evangiles40', 2, 42, $q$Luc$q$, 24, $q$L'evangile des exclus$q$, $q$Luc s'interesse aux femmes, aux pauvres, aux etrangers, a ceux qui sont hors cadre.$q$, $q$["Luc 10.25-37, le bon Samaritain","Luc 15, le fils prodigue","Luc 24, Emmaus"]$q$::jsonb),
 ('evangiles40', 3, 43, $q$Jean$q$, 21, $q$Qui est Jesus$q$, $q$Le seul evangile qui commence a l'origine du monde. Sept signes, sept declarations Je suis.$q$, $q$["Jean 1.1-18, le prologue","Jean 11, Lazare","Jean 20, la resurrection"]$q$::jsonb);

-- ─── 2. Les Psaumes en 60 jours ─────────────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values (
  'psaumes60', $q$Les Psaumes en 60 jours$q$, $q$L'ecole de la priere$q$, 'progressif', 60,
  $q$Vous voulez apprendre a prier avec des mots qui ne sont pas les votres, dans toutes les saisons.$q$,
  $q$Les Psaumes sont le livre de priere d'Israel, et celui que Jesus a prie. Ils disent tout : la confiance, la plainte, la colere, la louange. Rien n'y est censure. Les lire en entier, dans l'ordre des cinq livres, c'est apprendre a mettre devant Dieu ce qu'on garde d'habitude pour soi.$q$, 8
) on conflict (id) do nothing;

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
 ('psaumes60', 0, 19, $q$Psaumes 1 a 41$q$, 41, $q$Livre I, la confiance et la plainte$q$, $q$Les psaumes de David, entre la certitude et le cri. Le socle de toute priere.$q$, $q$["Psaume 1","Psaume 22","Psaume 23","Psaume 32"]$q$::jsonb),
 ('psaumes60', 1, 19, $q$Psaumes 42 a 72$q$, 31, $q$Livre II, la soif et le roi$q$, $q$L'exil, le desir de Dieu, et les psaumes royaux qui annoncent le Messie.$q$, $q$["Psaume 42","Psaume 51","Psaume 63","Psaume 72"]$q$::jsonb),
 ('psaumes60', 2, 19, $q$Psaumes 73 a 89$q$, 17, $q$Livre III, les questions difficiles$q$, $q$Pourquoi les mechants prosperent, pourquoi Dieu semble se taire. Les psaumes qui osent.$q$, $q$["Psaume 73","Psaume 84","Psaume 88"]$q$::jsonb),
 ('psaumes60', 3, 19, $q$Psaumes 90 a 106$q$, 17, $q$Livre IV, Dieu regne$q$, $q$La reponse aux questions : au-dela des rois humains, l'Eternel regne.$q$, $q$["Psaume 90","Psaume 91","Psaume 103"]$q$::jsonb),
 ('psaumes60', 4, 19, $q$Psaumes 107 a 150$q$, 44, $q$Livre V, la louange finale$q$, $q$Le mouvement d'ensemble aboutit a la louange pure, cinq fois Alleluia pour finir.$q$, $q$["Psaume 119","Psaume 139","Psaume 150"]$q$::jsonb);

-- ─── 3. Les Prophetes en 75 jours ───────────────────────────────────
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values (
  'prophetes75', $q$Les Prophetes en 75 jours$q$, $q$La justice et l'esperance$q$, 'progressif', 75,
  $q$Vous connaissez les recits et les evangiles, et les prophetes vous restent obscurs.$q$,
  $q$Les prophetes ne predisent pas d'abord l'avenir : ils rappellent l'alliance, denoncent l'injustice et tiennent ouverte l'esperance. Ce sont eux que le Nouveau Testament cite le plus. Les lire, c'est comprendre le vocabulaire dans lequel Jesus s'est presente.$q$, 9
) on conflict (id) do nothing;

insert into plan_steps (plan_id, position, book, label, chapters, title, description, key_passages) values
 ('prophetes75', 0, 23, $q$Esaie$q$, 66, $q$L'attente du Messie$q$, $q$Le prophete le plus cite par le Nouveau Testament. Les chapitres du Serviteur souffrant sont bouleversants.$q$, $q$["Esaie 6, la vocation","Esaie 53, le Serviteur","Esaie 55, l'invitation"]$q$::jsonb),
 ('prophetes75', 1, 24, $q$Jeremie$q$, 52, $q$La fidelite dans l'effondrement$q$, $q$Un homme qui pleure sur son peuple pendant que tout s'ecroule, et qui annonce une alliance nouvelle.$q$, $q$["Jeremie 1, l'appel","Jeremie 29, la lettre aux exiles","Jeremie 31, l'alliance nouvelle"]$q$::jsonb),
 ('prophetes75', 2, 26, $q$Ezechiel$q$, 48, $q$La gloire qui revient$q$, $q$Des visions puissantes en exil, des ossements qui reprennent vie, un temple restaure.$q$, $q$["Ezechiel 1, la vision","Ezechiel 37, les ossements","Ezechiel 47, le fleuve"]$q$::jsonb),
 ('prophetes75', 3, 27, $q$Daniel$q$, 12, $q$Tenir en exil$q$, $q$Comment rester fidele dans un empire paien, et l'esperance du Royaume qui ne finira pas.$q$, $q$["Daniel 3, la fournaise","Daniel 6, la fosse","Daniel 7, le Fils de l'homme"]$q$::jsonb),
 ('prophetes75', 4, 28, $q$Les douze petits prophetes$q$, 67, $q$D'Osee a Malachie$q$, $q$Douze voix breves et intenses : la fidelite de Dieu, la justice sociale, le jour du Seigneur.$q$, $q$["Osee 11, l'amour de Dieu","Amos 5, la justice","Michee 6.8","Jonas 4"]$q$::jsonb);
