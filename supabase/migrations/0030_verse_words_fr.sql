-- Mot a mot : traduction francaise de chaque mot hebreu/grec, DANS SON CONTEXTE.
-- Remplie une seule fois par verset (au premier affichage), puis lue en cache.
alter table verse_words add column if not exists gloss_fr text;

-- Mot a mot du NOUVEAU TESTAMENT en hebreu (traduction de Delitzsch) :
-- chaque mot hebreu et sa traduction francaise en contexte, en cache.
create table if not exists verse_words_he (
  book     int  not null,
  chapter  int  not null,
  verse    int  not null,
  position int  not null,
  word     text not null,
  gloss_fr text,
  primary key (book, chapter, verse, position)
);
alter table verse_words_he enable row level security;
drop policy if exists "verse_words_he public read" on verse_words_he;
create policy "verse_words_he public read" on verse_words_he for select using (true);
