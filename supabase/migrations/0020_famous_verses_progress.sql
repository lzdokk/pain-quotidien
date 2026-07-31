-- Curseur de progression pour la generation systematique des versets
-- importants (cron /api/cron/famous-verses). Une seule ligne (id=1), qui
-- memorise le dernier chapitre traite, dans l'ordre canonique de la Bible.

create table if not exists famous_verses_progress (
  id int primary key default 1,
  book int not null default 0,
  chapter int not null default 0,
  done boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into famous_verses_progress (id, book, chapter, done)
values (1, 0, 0, false)
on conflict (id) do nothing;

alter table famous_verses_progress enable row level security;
-- Aucune policy : table de service, ecrite uniquement via la cle service_role
-- (qui contourne la RLS). Personne d'autre n'y a acces.
