-- Paroles de Jésus (« red-letter ») : versets où Jésus parle directement,
-- au niveau du verset (indépendant de la traduction). Sert à surligner les
-- paroles du Christ dans le lecteur, dans la couleur du thème.

create table if not exists jesus_verses (
  book int not null,
  chapter int not null,
  verse int not null,
  primary key (book, chapter, verse)
);
create index if not exists jesus_verses_loc on jesus_verses (book, chapter);
alter table jesus_verses enable row level security;
drop policy if exists jesus_verses_read on jesus_verses;
create policy jesus_verses_read on jesus_verses for select using (true);

-- Curseur de progression du tagging (une seule ligne). Parcourt les 4
-- Évangiles : Matthieu(40), Marc(41), Luc(42), Jean(43).
create table if not exists jesus_progress (
  id int primary key default 1,
  book int not null default 40,
  chapter int not null default 0,
  done boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into jesus_progress (id, book, chapter, done)
values (1, 40, 0, false)
on conflict (id) do nothing;
alter table jesus_progress enable row level security;
-- Aucune policy : table de service (écrite via service_role uniquement).
