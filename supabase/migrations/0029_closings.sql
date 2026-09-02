-- 0029 — Une phrase de clôture pour le pain et pour la veillée.
-- Remplace, à l'affichage, les 3 actions du matin et les 3 questions du soir
-- par une seule phrase simple, facile à retenir. Rempli à la génération.
alter table daily_bread add column if not exists bread_close   text;
alter table daily_bread add column if not exists evening_close text;
