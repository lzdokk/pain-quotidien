-- ════════════════════════════════════════════════════════════════════
--  0027 — Outil d'étude biblique : lexique Strong, cross-refs, FTS
--  Choix retenus :
--    • strong_lexicon = vue sur `strongs` (zéro duplication)
--    • cross_references = table prête, données à importer (voir commentaires)
--    • FTS = toutes les traductions locales (source = 'local' dans verses)
-- ════════════════════════════════════════════════════════════════════

create extension if not exists unaccent;

-- unaccent() n'est pas IMMUTABLE par défaut → interdit dans une colonne GENERATED.
-- Wrapper standard Supabase/PostgreSQL pour l'indexation FTS.
create or replace function public.immutable_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
as $$ select public.unaccent('public.unaccent', $1) $$;


-- ────────────────────────────────────────────────────────────────────
--  A. LEXIQUE STRONG — vue `strong_lexicon` sur la table existante
-- ────────────────────────────────────────────────────────────────────

create or replace view public.strong_lexicon as
select
  code,
  lang,
  num,
  lemma,
  translit,
  pronunciation,
  definition_en,
  definition_fr,
  derivation,
  kjv_def,
  created_at
from public.strongs;

comment on view public.strong_lexicon is
  'Vue API stable sur le lexique Strong (source : table strongs).';

-- FTS sur le lexique (définitions FR/EN, lemma, translit)
alter table public.strongs drop column if exists tsv;

alter table public.strongs
  add column tsv tsvector
  generated always as (
    to_tsvector('french',
      public.immutable_unaccent(
        coalesce(lemma, '') || ' ' ||
        coalesce(translit, '') || ' ' ||
        coalesce(definition_fr, '') || ' ' ||
        coalesce(definition_en, '')
      )
    )
  ) stored;

create index if not exists strongs_tsv_idx
  on public.strongs using gin (tsv);


-- ────────────────────────────────────────────────────────────────────
--  B. RÉFÉRENCES CROISÉES
--  Source de données recommandée (à choisir lors de l'import) :
--    • OpenScriptures cross_references (domaine public, JSON)
--      https://github.com/openscriptures/cross_references
--    • Treasury of Scripture Knowledge (TSK, ~500 000 liens)
--    • En attendant : les refs IA dans verse_notes.cross_refs (jsonb)
-- ────────────────────────────────────────────────────────────────────

create table if not exists public.cross_references (
  id            bigserial primary key,

  from_book     smallint not null references public.books(id) on delete cascade,
  from_chapter  smallint not null check (from_chapter > 0),
  from_verse    smallint not null check (from_verse > 0),

  to_book       smallint not null references public.books(id) on delete cascade,
  to_chapter    smallint not null check (to_chapter > 0),
  to_verse      smallint not null check (to_verse > 0),
  to_verse_end  smallint check (to_verse_end is null or to_verse_end >= to_verse),

  weight        smallint not null default 100,
  kind          text not null default 'parallel'
                check (kind in ('parallel', 'quotation', 'theme', 'typology', 'allusion')),
  note          text,
  source        text not null default 'manual'
                check (source in ('openscriptures', 'tsk', 'manual', 'ai')),

  created_at    timestamptz not null default now(),

  unique (from_book, from_chapter, from_verse,
          to_book, to_chapter, to_verse, to_verse_end, kind)
);

create index if not exists cross_refs_from_idx
  on public.cross_references (from_book, from_chapter, from_verse, weight);

create index if not exists cross_refs_to_idx
  on public.cross_references (to_book, to_chapter, to_verse);

alter table public.cross_references enable row level security;

drop policy if exists "cross_references public read" on public.cross_references;
create policy "cross_references public read"
  on public.cross_references for select using (true);


-- ────────────────────────────────────────────────────────────────────
--  C. FULL-TEXT SEARCH — toutes les traductions locales
--  « Local » = traductions dont le texte est stocké dans `verses`
--  (coalesce(source, 'local') = 'local').
-- ────────────────────────────────────────────────────────────────────

-- Recréer tsv avec unaccent pour une meilleure tolérance aux accents
alter table public.verses drop column if exists tsv;

alter table public.verses
  add column tsv tsvector
  generated always as (
    to_tsvector('french', public.immutable_unaccent(coalesce(text, '')))
  ) stored;

create index if not exists verses_tsv_idx
  on public.verses using gin (tsv);

create index if not exists verses_trans_ref_idx
  on public.verses (translation, book, chapter, verse);


-- Recherche principale : toutes les traductions locales par défaut.
-- Passer p_translation pour restreindre à une seule version (ex. 'FRLSG').
create or replace function public.search_verses(
  p_query       text,
  p_translation text default null,
  p_limit       int  default 50,
  p_offset      int  default 0
)
returns table (
  translation text,
  book        smallint,
  chapter     smallint,
  verse       smallint,
  text        text,
  rank        real
)
language sql
stable
security definer
set search_path = public
as $$
  select
    v.translation,
    v.book,
    v.chapter,
    v.verse,
    v.text,
    ts_rank_cd(v.tsv, websearch_to_tsquery('french', public.immutable_unaccent(p_query))) as rank
  from public.verses v
  join public.translations t
    on t.code = v.translation
   and t.enabled = true
   and coalesce(t.source, 'local') = 'local'
  where v.tsv @@ websearch_to_tsquery('french', public.immutable_unaccent(p_query))
    and (p_translation is null or v.translation = p_translation)
  order by rank desc, v.translation, v.book, v.chapter, v.verse
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

comment on function public.search_verses is
  'FTS sur toutes les traductions locales. p_translation optionnel pour filtrer.';


-- Récupérer les cross-refs d'un verset (triées par pertinence)
create or replace function public.get_cross_references(
  p_book    smallint,
  p_chapter smallint,
  p_verse   smallint
)
returns table (
  to_book       smallint,
  to_chapter    smallint,
  to_verse      smallint,
  to_verse_end  smallint,
  kind          text,
  note          text,
  weight        smallint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    cr.to_book,
    cr.to_chapter,
    cr.to_verse,
    cr.to_verse_end,
    cr.kind,
    cr.note,
    cr.weight
  from public.cross_references cr
  where cr.from_book = p_book
    and cr.from_chapter = p_chapter
    and cr.from_verse = p_verse
  order by cr.weight, cr.to_book, cr.to_chapter, cr.to_verse;
$$;


-- Recherche dans le lexique Strong
create or replace function public.search_strong_lexicon(
  p_query text,
  p_limit int default 40
)
returns table (
  code          text,
  lang          text,
  lemma         text,
  translit      text,
  definition_fr text,
  definition_en text,
  rank          real
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.code,
    s.lang,
    s.lemma,
    s.translit,
    s.definition_fr,
    s.definition_en,
    ts_rank_cd(s.tsv, websearch_to_tsquery('french', public.immutable_unaccent(p_query))) as rank
  from public.strongs s
  where s.tsv @@ websearch_to_tsquery('french', public.immutable_unaccent(p_query))
  order by rank desc, s.code
  limit greatest(p_limit, 1);
$$;
