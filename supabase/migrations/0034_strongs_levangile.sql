-- Lexique Strong en français repris de levangile.com (avec l'accord de son
-- propriétaire). Rempli une fois par le workflow « Lexique levangile — import ».
alter table strongs add column if not exists fr_def text;      -- définition (liste <ol><li>)
alter table strongs add column if not exists fr_lsg text;      -- « traduit dans la Louis Segond par »
alter table strongs add column if not exists fr_origine text;  -- « Vient de agapao (25) »
alter table strongs add column if not exists fr_type text;     -- « Nom féminin »

-- Dictionnaire biblique Westphal (numérisation Yves Petrakian, via levangile.com,
-- avec l'accord de son propriétaire).
create table if not exists dictionnaire (
  source text not null default 'westphal',
  id int not null,
  titre text not null,
  html text,                 -- article : <p>, listes, <a data-ref="Esther 1.10">, <a data-w="Assuérus">
  texte text,                -- même article en texte simple (recherche)
  created_at timestamptz default now(),
  primary key (source, id)
);
create index if not exists dictionnaire_titre_idx on dictionnaire (lower(titre));
alter table dictionnaire enable row level security;
drop policy if exists pub_dictionnaire on dictionnaire;
create policy pub_dictionnaire on dictionnaire for select using (true);
