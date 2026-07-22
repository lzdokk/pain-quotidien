-- Compteurs utilitaires appeles par /api/ask
create or replace function public.increment_faq(p_id bigint)
returns void language sql security definer set search_path = public as $$
  update faq set ask_count = ask_count + 1 where id = p_id;
$$;

create or replace function public.bump_pending(p_norm text)
returns void language sql security definer set search_path = public as $$
  update pending_questions set hits = hits + 1, last_asked = now()
  where normalized = p_norm;
$$;

-- Vue de pilotage : questions a rediger en priorite
create or replace view public.questions_to_write as
  select question, hits, last_asked from pending_questions
  where promoted = false and hits >= 3 order by hits desc;
