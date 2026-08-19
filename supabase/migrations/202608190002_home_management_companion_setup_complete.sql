-- Home Base has no JSONB setup-state blob (unlike Monthly Money Reset),
-- its real data lives directly in hmc_appliances/hmc_maintenance_tasks/
-- hmc_service_providers, written through those tables' own RLS-enforced
-- insert policies as the Setup wizard runs. The one thing still missing a
-- write path is product_instances.setup_complete itself: that column has
-- no client UPDATE policy (select-only, see 202608010001's product_instances
-- policy), so a small dedicated function is needed, mirroring
-- set_product_instance_lifecycle's ownership-check shape exactly but
-- scoped to this one column rather than lifecycle_state.

begin;

create or replace function public.mark_home_management_companion_setup_complete(
  p_instance_id uuid
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
  set setup_complete = true,
      last_activity_at = now(),
      updated_at = now()
  where id = p_instance_id and user_id = v_user_id;
end;
$$;

revoke all on function public.mark_home_management_companion_setup_complete(uuid) from public;
grant execute on function public.mark_home_management_companion_setup_complete(uuid) to authenticated;

commit;
