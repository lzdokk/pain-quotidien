-- ════════════════════════════════════════════════════════════════════
--  PARCOURS « LES 3 LECTURES DU JOUR »
--  À exécuter dans Supabase, SQL Editor. Ajoute le parcours à la liste
--  des parcours au quotidien (le programme jour par jour est dans l'app).
-- ════════════════════════════════════════════════════════════════════
insert into reading_plans (id, name, subtitle, style, days, audience, rationale, order_index) values
('trois-lectures', 'Les 3 lectures du jour',
 'Par grands thèmes du Nouveau Testament, avec un Psaume et l''Ancien Testament en reflet', 'triple', 365,
 'Pour celui qui veut un rendez-vous quotidien avec la Parole pendant un an : découvrir tout le Nouveau Testament thème par thème, prier avec les Psaumes, et voir comment l''Ancien Testament l''annonçait déjà.',
 'Chaque jour, trois chapitres reliés par un même fil. On part du Nouveau Testament, rangé par grands thèmes dans l''ordre du salut : la venue de Jésus, le Royaume, les signes, la croix, la résurrection, l''Église, la vie nouvelle, l''espérance. Au milieu, un Psaume (ou Proverbes, Job, Ecclésiaste, Cantique) pour prier. À la fin, un chapitre de l''Ancien Testament qui lui répond en reflet : promesse, image ou prophétie. Une question aide à méditer. En un an, chaque chapitre du Nouveau Testament et chaque chapitre poétique est lu au moins une fois.',
 0)
on conflict (id) do update set name = excluded.name, subtitle = excluded.subtitle, style = excluded.style,
  days = excluded.days, audience = excluded.audience, rationale = excluded.rationale, order_index = excluded.order_index;
