-- ════════════════════════════════════════════════════════════════════
--  PARCOURS « LES 3 LECTURES DU JOUR »
--  À exécuter dans Supabase, SQL Editor. Ajoute le parcours à la liste
--  des parcours au quotidien (le programme jour par jour est dans l'app).
-- ════════════════════════════════════════════════════════════════════
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('trois-lectures', 'Les 3 lectures du jour',
 'Nouveau Testament, Psaume, Ancien Testament : toute la Bible en reflet', 'triple', 686,
 'Pour celui qui veut un rendez-vous quotidien avec la Parole, comme une table servie chaque jour, et lire toute la Bible en un peu moins de deux ans.',
 'Chaque jour, trois chapitres reliés par un même fil. On commence par le Nouveau Testament, on prie avec un Psaume (ou Proverbes, Job, Ecclésiaste, Cantique), et on termine par l''Ancien Testament, lu dans l''ordre, qui apparaît comme le reflet de ce que Jésus accomplit. Une question aide à méditer. Tout l''Ancien Testament y passe, et chaque chapitre poétique et du Nouveau Testament est lu au moins une fois.',
 0)
on conflict (id) do update set name = excluded.name, subtitle = excluded.subtitle, style = excluded.style,
  days = excluded.days, audience = excluded.audience, rationale = excluded.rationale, order_index = excluded.order_index;
