-- Onglet Priere : temps de priere quotidien structure (Adoration, Pardon,
-- Remerciement, Protection, Communion), genere en meme temps que le reste
-- du pain quotidien du jour.

alter table daily_bread add column if not exists prayer_intro text;
alter table daily_bread add column if not exists prayer_moments jsonb;
alter table daily_bread add column if not exists spirit_invitation text;
