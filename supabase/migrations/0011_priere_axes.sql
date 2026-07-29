-- Onglet Priere, deuxieme version : structure en trois axes (Adoration,
-- Louange, Intercession), Notre Pere prie demande par demande, confession
-- et supplication. Remplace la colonne prayer_moments de la 0010.

alter table daily_bread add column if not exists prayer_axes jsonb;
alter table daily_bread add column if not exists prayer_notre_pere jsonb;
alter table daily_bread add column if not exists prayer_confession text;
alter table daily_bread add column if not exists prayer_supplication text;

-- La 0010 avait introduit prayer_moments, remplace par prayer_axes.
alter table daily_bread drop column if exists prayer_moments;
