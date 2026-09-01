-- Follow-up to 202608010001_monthly_money_reset.sql. Additive; forward-replaces
-- the grant_free_product function to fix a defect that made every activation
-- fail. This does not edit or rerun 202608010001.
--
-- Defect: the function's RETURNS TABLE output column product_instance_id has the
-- same name as monthly_money_reset_states.product_instance_id. Inside
-- "on conflict (product_instance_id)" PL/pgSQL could not tell whether the name
-- meant the output variable or the table column and raised
-- 42702 "column reference product_instance_id is ambiguous", so the function
-- errored and activation redirected to ?error=1.
--
-- Fix: the "#variable_conflict use_column" directive tells PL/pgSQL to resolve
-- any such ambiguity to the table column. Every real variable in this function
-- is prefixed v_/p_ and does not collide with a column, so resolving ambiguous
-- bare names to columns is always the intended behavior here. The function
-- signature and return shape are unchanged, so create-or-replace is enough and
-- existing grants are preserved; the revoke/grant below are repeated only for
-- idempotency.

create or replace function public.grant_free_product(
  p_product_slug text,
  p_cycle_key text
)
returns table (entitlement_id uuid, product_instance_id uuid, was_existing boolean)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_user_id uuid := auth.uid();
  v_version text;
  v_entitlement_id uuid;
  v_instance_id uuid;
  v_was_existing boolean := false;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if p_cycle_key is null or p_cycle_key !~ '^\d{4}-\d{2}$' then
    raise exception 'Invalid cycle key "%"; expected YYYY-MM', p_cycle_key using errcode = '22023';
  end if;

  select fap.product_version into v_version
  from public.free_activatable_products fap
  where fap.product_slug = p_product_slug and fap.is_active = true;

  if v_version is null then
    raise exception 'Product "%" is not eligible for free activation', p_product_slug using errcode = '42501';
  end if;

  insert into public.entitlements (user_id, product_slug, access_source)
  values (v_user_id, p_product_slug, 'free-grant')
  on conflict (user_id, product_slug) do update set updated_at = now()
  returning id into v_entitlement_id;

  select true into v_was_existing
  from public.product_instances
  where user_id = v_user_id and product_slug = p_product_slug and cycle_key = p_cycle_key;

  insert into public.product_instances (user_id, entitlement_id, product_slug, product_version, cycle_key)
  values (v_user_id, v_entitlement_id, p_product_slug, v_version, p_cycle_key)
  on conflict (user_id, product_slug, cycle_key) do update set updated_at = now()
  returning id into v_instance_id;

  insert into public.monthly_money_reset_states (product_instance_id, user_id, state, revision)
  values (v_instance_id, v_user_id, '{}'::jsonb, 1)
  on conflict (product_instance_id) do nothing;

  return query select v_entitlement_id, v_instance_id, coalesce(v_was_existing, false);
end;
$$;

revoke all on function public.grant_free_product(text, text) from public;
grant execute on function public.grant_free_product(text, text) to authenticated;
