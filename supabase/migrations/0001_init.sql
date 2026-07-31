-- ════════════════════════════════════════════════════════════════════
--  LE PAIN QUOTIDIEN, schema initial
--  Chaque utilisateur a son environnement : lectures, carnet, cursus.
-- ════════════════════════════════════════════════════════════════════
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ─────────────── CONTENU PUBLIC ───────────────

create table daily_bread (
  date               date primary key,
  week_id            bigint,
  liturgical_season  text,
  liturgical_week    text,
  reading_day        int,
  theme_title        text not null,
  theme_lede         text not null,
  central_message    text not null,
  verse_text         text not null,
  verse_ref          text not null,
  verse_version      text default 'Segond 1910',
  bread_lead         text not null,
  bread_says         jsonb not null,     -- 2 paragraphes
  bread_touches      jsonb not null,     -- 2 paragraphes
  actions            jsonb not null,     -- [{title, body}] x3
  prayer_open        text not null,
  prayer_close       text not null,
  evening_verse      text, evening_verse_ref text,
  evening_title      text, evening_meditation jsonb,
  evening_review     jsonb, prayer_night text,
  witness_thread     jsonb,
  witness_openers    jsonb,
  objection_q        text, objection_a jsonb,
  model              text,
  generated_at       timestamptz default now(),
  published          boolean default false
);

create table readings (
  id          bigserial primary key,
  date        date references daily_bread(date) on delete cascade,
  position    smallint not null,
  reference   text not null,
  title       text not null,
  tag         text not null,
  verses      jsonb not null,          -- [[14, "texte"], ...]
  summary     text not null,
  canon_note  boolean default false,   -- substitution deuterocanonique
  unique(date, position)
);

-- Journal de generation, une ligne par semaine produite
create table generation_runs (
  id           bigserial primary key,
  kind         text not null,          -- 'week' | 'day' | 'course'
  period_start date not null,
  period_end   date,
  status       text not null default 'running',  -- running|ok|partial|failed
  days_created smallint default 0,
  input_tokens int, output_tokens int, cost_usd numeric(10,4),
  error        text,
  started_at   timestamptz default now(),
  ended_at     timestamptz
);

-- ─────────────── BIBLE ───────────────

create table translations (
  code text primary key, name text not null, language text default 'fr',
  public_domain boolean default false, licensed boolean default false,
  enabled boolean default true, notice text
);

create table books (
  id smallint primary key, name text not null, short text,
  chapters smallint not null, testament char(2)   -- AT | NT
);

create table verses (
  translation text references translations(code) on delete cascade,
  book smallint references books(id),
  chapter smallint, verse smallint, text text not null,
  primary key (translation, book, chapter, verse)
);
create index verses_chapter_idx on verses (translation, book, chapter);
alter table verses add column tsv tsvector
  generated always as (to_tsvector('french', text)) stored;
create index verses_tsv_idx on verses using gin (tsv);

create table chapter_notes (
  book smallint, chapter smallint,
  title text, dating text, summary text,
  outline jsonb, reading_key text, why_here text,
  primary key (book, chapter)
);

create table verse_notes (
  book smallint, chapter smallint, verse smallint,
  word_term text, word_lang text, word_sense text,
  says text, parable text, development text, cross_refs jsonb,
  generated_at timestamptz default now(),
  primary key (book, chapter, verse)
);

-- ─────────────── PARCOURS DE LECTURE ───────────────

create table reading_plans (
  id text primary key, name text not null, subtitle text,
  style text not null,          -- progressif | integral | libre
  days smallint, audience text, rationale text, order_index smallint
);

create table plan_steps (
  plan_id text references reading_plans(id) on delete cascade,
  position smallint, book smallint, label text, chapters smallint,
  title text, description text, key_passages jsonb,
  primary key (plan_id, position)
);

-- ─────────────── CURSUS ───────────────

create table cursus_levels (
  id text primary key, name text not null, subtitle text, intro text, order_index smallint
);
create table cursus_groups (
  id bigserial primary key, level_id text references cursus_levels(id) on delete cascade,
  name text, order_index smallint
);
create table courses (
  code text primary key,
  group_id bigint references cursus_groups(id) on delete cascade,
  title text not null,
  kind char(1) not null,        -- E exegese | D doctrine | P pratique | G langue
  hook text not null, hours smallint not null, order_index smallint,
  objectives jsonb, parable text, body jsonb,
  key_verse text, key_verse_ref text, readings jsonb, assignment text,
  status text default 'planned' -- planned | generated | reviewed
);

-- ─────────────── BASE DE QUESTIONS ───────────────

create table faq (
  id bigserial primary key,
  category text not null, question text not null,
  short_answer text not null, parable text not null,
  body jsonb not null, verses jsonb not null,
  ask_count int default 0, reviewed boolean default false,
  created_at timestamptz default now()
);
create index faq_fts_idx on faq
  using gin (to_tsvector('french', question || ' ' || short_answer));

-- Questions posees sans reponse trouvee, pour enrichir la base
create table pending_questions (
  id bigserial primary key, question text not null,
  normalized text not null, hits int default 1,
  last_asked timestamptz default now(), promoted boolean default false
);
create unique index pending_norm_idx on pending_questions (normalized);

-- ════════════════════════════════════════════════════════════════════
--  ENVIRONNEMENT UTILISATEUR
-- ════════════════════════════════════════════════════════════════════

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text, avatar_url text, email citext,
  timezone text default 'Europe/Paris',
  wants_morning boolean default true,
  wants_evening boolean default true,
  wants_reading_reminder boolean default true,
  theme text default 'auto',       -- auto | matin | soir
  translation text default 'FRLSG',
  intercession_name text,
  created_at timestamptz default now()
);

create table user_plan (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_id text references reading_plans(id),
  current_day smallint default 1,
  last_read_on date, streak smallint default 0, best_streak smallint default 0
);

create table highlights (
  user_id uuid references auth.users(id) on delete cascade,
  book smallint, chapter smallint, verse smallint,
  color smallint not null check (color between 1 and 4),
  created_at timestamptz default now(),
  primary key (user_id, book, chapter, verse)
);

create table notes (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  book smallint, chapter smallint, verse smallint,
  reference text not null, verse_text text, body text not null,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index notes_user_idx on notes (user_id, created_at desc);

create table day_progress (
  user_id uuid references auth.users(id) on delete cascade,
  date date, action_index smallint,
  done_at timestamptz default now(),
  primary key (user_id, date, action_index)
);

create table course_progress (
  user_id uuid references auth.users(id) on delete cascade,
  code text references courses(code) on delete cascade,
  completed_at timestamptz default now(),
  primary key (user_id, code)
);

create table ai_usage (
  user_id uuid references auth.users(id) on delete cascade,
  day date, count smallint default 0,
  primary key (user_id, day)
);

create table conversations (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null, content text not null,
  source text,                     -- 'faq' | 'ai'
  context_ref text,
  created_at timestamptz default now()
);

-- ════════════════════════════════════════════════════════════════════
--  SECURITE : chacun ne voit que son environnement
-- ════════════════════════════════════════════════════════════════════

-- Contenu public : lecture ouverte, ecriture service_role uniquement
alter table daily_bread enable row level security;
alter table readings    enable row level security;
alter table verses      enable row level security;
alter table books       enable row level security;
alter table translations enable row level security;
alter table chapter_notes enable row level security;
alter table verse_notes enable row level security;
alter table reading_plans enable row level security;
alter table plan_steps  enable row level security;
alter table cursus_levels enable row level security;
alter table cursus_groups enable row level security;
alter table courses     enable row level security;
alter table faq         enable row level security;

create policy pub_bread   on daily_bread   for select using (published);
create policy pub_read    on readings      for select using (true);
create policy pub_verses  on verses        for select using (true);
create policy pub_books   on books         for select using (true);
create policy pub_trans   on translations  for select using (enabled);
create policy pub_chnotes on chapter_notes for select using (true);
create policy pub_vnotes  on verse_notes   for select using (true);
create policy pub_plans   on reading_plans for select using (true);
create policy pub_steps   on plan_steps    for select using (true);
create policy pub_levels  on cursus_levels for select using (true);
create policy pub_groups  on cursus_groups for select using (true);
create policy pub_courses on courses       for select using (true);
create policy pub_faq     on faq           for select using (reviewed);

-- Donnees personnelles : proprietaire uniquement
alter table profiles         enable row level security;
alter table user_plan        enable row level security;
alter table highlights       enable row level security;
alter table notes            enable row level security;
alter table day_progress     enable row level security;
alter table course_progress  enable row level security;
alter table ai_usage         enable row level security;
alter table conversations    enable row level security;

create policy own_profile   on profiles        for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy own_plan      on user_plan       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_hl        on highlights      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_notes     on notes           for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_dayprog   on day_progress    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_courseprog on course_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_usage     on ai_usage        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_conv      on conversations   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Creation automatique du profil et du parcours a l'inscription
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  insert into public.user_plan (user_id, plan_id, current_day) values (new.id, 'fondement', 1);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Quota IA quotidien, applique cote serveur
create or replace function public.consume_ai_quota(p_user uuid, p_limit int default 8)
returns boolean language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into ai_usage (user_id, day, count) values (p_user, current_date, 0)
    on conflict (user_id, day) do nothing;
  select count into c from ai_usage where user_id = p_user and day = current_date;
  if c >= p_limit then return false; end if;
  update ai_usage set count = count + 1 where user_id = p_user and day = current_date;
  return true;
end; $$;

-- Serie de lecture
create or replace function public.mark_read(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
declare last date; s smallint;
begin
  select last_read_on, streak into last, s from user_plan where user_id = p_user;
  if last = current_date then return; end if;
  s := case when last = current_date - 1 then coalesce(s,0) + 1 else 1 end;
  update user_plan set current_day = current_day + 1, last_read_on = current_date,
    streak = s, best_streak = greatest(coalesce(best_streak,0), s)
  where user_id = p_user;
end; $$;
