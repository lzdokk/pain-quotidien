-- Lexique Strong en français repris de levangile.com (avec l'accord de son
-- propriétaire). Rempli une fois par le workflow « Lexique levangile — import ».
alter table strongs add column if not exists fr_def text;      -- définition (liste <ol><li>)
alter table strongs add column if not exists fr_lsg text;      -- « traduit dans la Louis Segond par »
alter table strongs add column if not exists fr_origine text;  -- « Vient de agapao (25) »
alter table strongs add column if not exists fr_type text;     -- « Nom féminin »
