-- L'inscription ne doit jamais echouer, meme si aucun parcours de lecture
-- n'a encore ete seede en base. On rattache l'utilisateur au premier
-- parcours disponible s'il existe, sinon on cree seulement le profil.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_plan text;
begin
  insert into public.profiles (id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );

  select id into v_plan from public.reading_plans order by order_index limit 1;

  if v_plan is not null then
    insert into public.user_plan (user_id, plan_id, current_day)
    values (new.id, v_plan, 1);
  end if;

  return new;
end; $$;
