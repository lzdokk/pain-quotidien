-- Paraboles : serie d'enseignement theologique par le recit, 1 a 2 fois par
-- semaine, un point a la fois, rangee par theme pour que le lecteur ne se
-- perde pas dans la profondeur du sujet.

create table if not exists parables (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  theme text not null,
  theme_order int not null,
  episode int not null,
  title text not null,
  hook text not null,
  story jsonb not null,
  unpacking jsonb not null,
  key_verse text not null,
  key_verse_ref text not null,
  questions jsonb not null,
  refs jsonb not null,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists parables_theme_idx on parables(theme_order, episode);
create index if not exists parables_published_idx on parables(published_at desc);

alter table parables enable row level security;
drop policy if exists "public read parables" on parables;
create policy "public read parables" on parables for select using (true);
