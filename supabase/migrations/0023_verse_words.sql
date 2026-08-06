-- Interlinéaire mot-à-mot : chaque mot de chaque verset, avec son terme
-- d'origine (hébreu/grec), sa glose courte, et son numéro Strong (pour
-- joindre la table `strongs` et afficher le sens français au clic).
-- Données ingérées depuis STEPBible (TAHOT/TAGNT, licence CC BY).
create table if not exists verse_words (
  book     int  not null,
  chapter  int  not null,
  verse    int  not null,
  position int  not null,     -- ordre du mot dans le verset
  lang     text not null,     -- 'hebreu' | 'grec'
  word     text not null,     -- forme pointée (hébreu) / accentuée (grec)
  strong   text,              -- code Strong canonique (ex "H7225", "G26")
  gloss    text,              -- glose courte d'origine (ex "to create")
  primary key (book, chapter, verse, position)
);

create index if not exists verse_words_ref_idx on verse_words (book, chapter, verse);

alter table verse_words enable row level security;
-- Lecture publique (comme la table `verses`) ; écriture réservée au service role.
drop policy if exists "verse_words public read" on verse_words;
create policy "verse_words public read" on verse_words for select using (true);
