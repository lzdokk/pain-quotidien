-- Plafond global d'appels au modele, filet de securite absolu.
create table if not exists global_budget (
  day date primary key,
  count int default 0
);
alter table global_budget enable row level security;   -- aucune policy : service_role seul

create or replace function public.consume_global_budget(p_limit int default 400)
returns boolean language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into global_budget (day, count) values (current_date, 0)
    on conflict (day) do nothing;
  select count into c from global_budget where day = current_date;
  if c >= p_limit then return false; end if;
  update global_budget set count = count + 1 where day = current_date;
  return true;
end; $$;

-- Vue de pilotage : combien d'appels, combien ils ont coute
create or replace view public.usage_summary as
  select
    (select count from global_budget where day = current_date) as appels_aujourdhui,
    (select coalesce(sum(cost_usd),0) from generation_runs
      where started_at > now() - interval '30 days')          as cout_30_jours_usd,
    (select count(*) from faq where reviewed)                  as questions_publiees,
    (select count(*) from pending_questions where promoted = false and hits >= 3) as questions_a_rediger;
