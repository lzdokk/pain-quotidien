-- Lexique Strong, hebreu et grec.
-- Source : Strong's Exhaustive Concordance (James Strong, 1890), domaine public,
-- version JSON d'Ulrik Petersen (projet openscriptures/strongs).
-- La definition francaise est produite a la demande, une seule fois par entree,
-- puis conservee : les consultations suivantes sont gratuites et instantanees.

create table if not exists strongs (
  code text primary key,              -- "G26", "H2617"
  lang text not null,                 -- "grec" | "hebreu"
  num int not null,
  lemma text,                         -- le mot original
  translit text,                      -- translitteration
  pronunciation text,
  definition_en text,
  derivation text,
  kjv_def text,
  definition_fr text,                 -- rempli a la demande
  created_at timestamptz default now()
);

create index if not exists strongs_lang_num_idx on strongs (lang, num);
create index if not exists strongs_lemma_idx on strongs (lemma);
create index if not exists strongs_translit_idx on strongs (translit);

-- Lecture publique, ecriture reservee au service.
alter table strongs enable row level security;
drop policy if exists pub_strongs on strongs;
create policy pub_strongs on strongs for select using (true);
