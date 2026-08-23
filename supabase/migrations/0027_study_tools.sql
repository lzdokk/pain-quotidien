-- ════════════════════════════════════════════════════════════════════
--  0027 — Outils d'étude : références croisées + recherche plein texte
-- ════════════════════════════════════════════════════════════════════
-- Rappels sur l'existant (rien à recréer) :
--   • Recherche plein texte : verses.tsv (config 'french') + index GIN existent
--     déjà (migration 0001).
--   • Dictionnaire Strong : table `strongs` + `verse_words` (interlinéaire)
--     existent déjà (migrations 0008 et 0023).
-- Cette migration n'ajoute que ce qui manque.

-- ─────────────────────────────────────────────────────────────────────
-- 1) RÉFÉRENCES CROISÉES (jeu de données type Treasury of Scripture Knowledge)
--    Chaque ligne relie un verset source à un verset (ou plage) cible.
-- ─────────────────────────────────────────────────────────────────────
-- Une version antérieure (créée à la main dans Cursor) a pu poser des colonnes
-- différentes : on repart d'un schéma propre. Sûr tant que l'import n'a pas
-- encore rempli la table.
drop table if exists cross_references cascade;

create table cross_references (
  id             bigserial primary key,
  from_book      smallint not null references books(id),
  from_chapter   smallint not null,
  from_verse     smallint not null,
  to_book        smallint not null references books(id),
  to_chapter     smallint not null,
  to_verse_start smallint not null,
  to_verse_end   smallint,             -- null = un seul verset
  votes          int default 0,        -- pertinence (openbible.info / TSK)
  created_at     timestamptz default now()
);

-- Accès ultra-rapide : "toutes les références croisées de ce verset".
create index if not exists xref_from_idx
  on cross_references (from_book, from_chapter, from_verse);

-- On évite les doublons exacts lors des imports répétés.
create unique index if not exists xref_unique_idx on cross_references
  (from_book, from_chapter, from_verse, to_book, to_chapter, to_verse_start, to_verse_end);

alter table cross_references enable row level security;
drop policy if exists pub_xref on cross_references;
create policy pub_xref on cross_references for select using (true);   -- lecture publique

-- ─────────────────────────────────────────────────────────────────────
-- 2) FULL-TEXT SEARCH — amélioration : recherche INSENSIBLE AUX ACCENTS
--    L'index 'french' existant gère déjà la racinisation (grâce/grâces),
--    mais pas l'absence d'accents. On ajoute une config 'fr_unaccent' et
--    une colonne indexée dédiée, sans toucher à l'existante.
-- ─────────────────────────────────────────────────────────────────────
create extension if not exists unaccent;

do $$
begin
  if not exists (select 1 from pg_ts_config where cfgname = 'fr_unaccent') then
    create text search configuration fr_unaccent ( copy = french );
    alter text search configuration fr_unaccent
      alter mapping for hword, hword_part, word with unaccent, french_stem;
  end if;
end $$;

alter table verses add column if not exists tsv_ua tsvector
  generated always as (to_tsvector('fr_unaccent', text)) stored;

create index if not exists verses_tsv_ua_idx on verses using gin (tsv_ua);

-- ─────────────────────────────────────────────────────────────────────
-- 3) FONCTION DE RECHERCHE classée (RPC appelée depuis le client)
--    Recherche plein texte, insensible aux accents, triée par pertinence.
--    Usage JS : supabase.rpc('search_verses', { q, trans, lim })
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.search_verses(
  q text,
  trans text default 'FRLSG',   -- code de la Segond locale dans TON app
  lim int default 100
)
returns table (
  book smallint, chapter smallint, verse smallint, text text, rank real
)
language sql stable as $$
  select v.book, v.chapter, v.verse, v.text,
         ts_rank(v.tsv_ua, websearch_to_tsquery('fr_unaccent', q)) as rank
  from verses v
  where v.translation = trans
    and v.tsv_ua @@ websearch_to_tsquery('fr_unaccent', q)
  order by rank desc, v.book, v.chapter, v.verse
  limit greatest(1, least(lim, 400));
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 4) (Optionnel) Alias `strong_lexicon` vers la table `strongs` existante,
--    si tu préfères ce nom dans ton code d'Étape 2/3. À décommenter au besoin.
-- ─────────────────────────────────────────────────────────────────────
-- create or replace view public.strong_lexicon as
--   select code, lang, num, lemma, translit, pronunciation,
--          definition_en, definition_fr, derivation, kjv_def
--   from public.strongs;
