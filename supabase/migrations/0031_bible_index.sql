-- INDEX D'ETUDE (comme l'annexe d'une Bible d'etude) : themes, personnages, lieux.
-- Chaque fiche : une courte definition, des sections, et des references
-- cliquables (abreviations « Gn 12.1-3 »). Generee progressivement par
-- /api/cron/index, lue par tout le monde.
create table if not exists bible_index (
  slug        text primary key,
  kind        text not null,            -- 'theme' | 'personne' | 'lieu'
  title       text not null,
  category    text,                     -- grand sujet (I. Dieu, II. Jésus…), ou Personnages / Lieux
  subcategory text,
  definition  text,
  sections    jsonb not null default '[]',
  see_also    text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists bible_index_kind_idx on bible_index (kind, category);
alter table bible_index enable row level security;
drop policy if exists "bible_index public read" on bible_index;
create policy "bible_index public read" on bible_index for select using (true);
