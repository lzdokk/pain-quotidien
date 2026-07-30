-- Curseur de progression pour la generation systematique des fiches de
-- versets (verse_notes) sur toute la Bible, verset par verset, en tache de
-- fond. Une seule ligne : le dernier verset traite, dans l'ordre canonique
-- (book, chapter, verse) de la table verses (traduction FRLSG).
create table if not exists verse_notes_progress (
  id int primary key default 1,
  book int not null default 0,
  chapter int not null default 0,
  verse int not null default 0,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint verse_notes_progress_singleton check (id = 1)
);

insert into verse_notes_progress (id, book, chapter, verse)
values (1, 0, 0, 0)
on conflict (id) do nothing;
