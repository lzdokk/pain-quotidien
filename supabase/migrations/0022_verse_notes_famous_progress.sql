-- Curseur de progression pour la pre-generation des fiches des versets
-- connus (★). Table de service : aucune policy RLS, donc accessible
-- uniquement via la service_role (les crons), jamais depuis le navigateur.
create table if not exists verse_notes_famous_progress (
  id         int primary key default 1,
  pos        int not null default 0,
  updated_at timestamptz default now()
);

alter table verse_notes_famous_progress enable row level security;
-- Volontairement aucune policy : lecture/ecriture reservees au service role.
