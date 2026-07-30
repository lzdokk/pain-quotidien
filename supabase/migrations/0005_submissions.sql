-- Devoirs de cursus rendus par les etudiants, avec leur correction IA.
create table if not exists course_submissions (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  code text references courses(code) on delete cascade,
  submission text not null,
  level text,
  verdict text,
  strengths jsonb,
  gaps jsonb,
  corrections jsonb,
  next_step text,
  created_at timestamptz default now()
);

alter table course_submissions enable row level security;

create policy own_submissions on course_submissions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists course_submissions_user_idx
  on course_submissions (user_id, code, created_at desc);
