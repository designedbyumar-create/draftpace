-- Vacation-mode pause for the ongoing (cycleModel: "continuous")
-- Companion products — deliberately a NEW, separate column and RPC, not a
-- reuse of lifecycle_state/set_product_instance_lifecycle.
--
-- lifecycle_state's check constraint and its only mutator are wired to
-- Monthly Money Reset's monthly-cycle model (completed_at is set the
-- moment lifecycle_state becomes 'completed', and starting a new cycle
-- creates a brand new product_instances row via grant_free_product).
-- Every ongoing Companion's own definition.ts documents, on purpose, that
-- it never calls set_product_instance_lifecycle at all — reusing that
-- mechanism for a cycle-less product would be exactly the "declared a
-- transition path never used" trap that already bit
-- personal-finance-companion once (its own definition.ts still carries
-- the comment explaining why). paused_at is a plain, cycle-agnostic
-- fact — "is this instance paused right now" — independent of whichever
-- lifecycle model the owning product uses.
--
-- No "finished"/"completed" counterpart is added here: only Monthly
-- Money Reset has a real end-of-cycle to mark, which is what
-- lifecycle_state already covers for it.

begin;

alter table public.product_instances
  add column if not exists paused_at timestamptz;

create or replace function public.set_product_instance_paused(
  p_instance_id uuid,
  p_paused boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select user_id into v_owner from public.product_instances where id = p_instance_id;
  if v_owner is null or v_owner <> v_user_id then
    raise exception 'Not found' using errcode = '42501';
  end if;

  update public.product_instances
  set paused_at = case when p_paused then now() else null end,
      updated_at = now()
  where id = p_instance_id and user_id = v_user_id;
end;
$$;

revoke all on function public.set_product_instance_paused(uuid, boolean) from public;
grant execute on function public.set_product_instance_paused(uuid, boolean) to authenticated;

commit;
