-- Phase B: generalized access sources. Additive only — no existing table or
-- function is altered. grant_free_product (202608010001, fixed in
-- 202608010003) is untouched and remains the only entitlement-creation path
-- reachable by an authenticated client directly.
--
-- These three functions are service_role-only, never granted to
-- authenticated/anon. Unlike grant_free_product, which always grants to
-- auth.uid() and is inherently safe to expose to a signed-in client, these
-- accept an explicit target user_id — reachable only from trusted
-- server-side code (an admin action, a verified webhook) that has already
-- done its own verification before calling. See docs/DECISIONS.md and the
-- Phase B plan: SQL enforces what's DB-checkable (ownership, idempotency);
-- anything requiring external verification (webhook signature, admin
-- session) is the caller's job, not this function's.

-- ---------------------------------------------------------------------------
-- _grant_product_instance: the shared entitlement + instance creation body
-- behind grant_admin_product and grant_purchased_product, so the mutation
-- logic exists once even though eligibility is checked separately per
-- source (matching the separate-public-functions decision). Not exposed to
-- any client-facing role — only callable from within another SECURITY
-- DEFINER function in this schema, same trust model as every private helper
-- here.
--
-- Deliberately does not touch a product's own state table (unlike
-- grant_free_product's direct monthly_money_reset_states insert) — this
-- helper is product-agnostic, and a product's own first-load path is
-- responsible for creating its own state row lazily.
-- ---------------------------------------------------------------------------
create or replace function public._grant_product_instance(
  p_user_id uuid,
  p_product_slug text,
  p_product_version text,
  p_cycle_key text,
  p_access_source text,
  p_metadata jsonb
)
returns table (entitlement_id uuid, product_instance_id uuid, was_existing boolean)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_entitlement_id uuid;
  v_instance_id uuid;
  v_was_existing boolean := false;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required' using errcode = '22004';
  end if;

  if p_product_slug is null or p_product_slug = '' then
    raise exception 'p_product_slug is required' using errcode = '22004';
  end if;

  if p_product_version is null or p_product_version = '' then
    raise exception 'p_product_version is required' using errcode = '22004';
  end if;

  if p_cycle_key is null or p_cycle_key !~ '^\d{4}-\d{2}$' then
    raise exception 'Invalid cycle key "%"; expected YYYY-MM', p_cycle_key using errcode = '22023';
  end if;

  -- On an existing entitlement (grant -> revoke -> re-grant, or a second
  -- grant from a different source), the conflict branch must actually
  -- restore access, not just touch updated_at: reactivate, clear the
  -- revocation, adopt the new source, and merge in the new metadata rather
  -- than dropping the old (|| keeps prior keys, new values win on
  -- collision) — required by the locked revocation decision: re-granting
  -- must restore the user's existing instance and saved data, which it can
  -- only do if the entitlement itself comes back active.
  insert into public.entitlements (user_id, product_slug, access_source, metadata)
  values (p_user_id, p_product_slug, p_access_source, coalesce(p_metadata, '{}'::jsonb))
  on conflict (user_id, product_slug) do update
  set is_active = true,
      revoked_at = null,
      access_source = excluded.access_source,
      metadata = public.entitlements.metadata || excluded.metadata,
      updated_at = now()
  returning id into v_entitlement_id;

  select true into v_was_existing
  from public.product_instances
  where user_id = p_user_id and product_slug = p_product_slug and cycle_key = p_cycle_key;

  insert into public.product_instances (user_id, entitlement_id, product_slug, product_version, cycle_key)
  values (p_user_id, v_entitlement_id, p_product_slug, p_product_version, p_cycle_key)
  on conflict (user_id, product_slug, cycle_key) do update set updated_at = now()
  returning id into v_instance_id;

  return query select v_entitlement_id, v_instance_id, coalesce(v_was_existing, false);
end;
$$;

revoke all on function public._grant_product_instance(uuid, text, text, text, text, jsonb) from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- grant_admin_product: a one-off manual grant (Phase B's hidden test
-- product is reached only this way — never self-serve). p_note goes into
-- entitlements.metadata for an audit trail; no new column.
-- ---------------------------------------------------------------------------
create or replace function public.grant_admin_product(
  p_user_id uuid,
  p_product_slug text,
  p_product_version text,
  p_cycle_key text,
  p_note text default null
)
returns table (entitlement_id uuid, product_instance_id uuid, was_existing boolean)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select * from public._grant_product_instance(
    p_user_id,
    p_product_slug,
    p_product_version,
    p_cycle_key,
    'admin-grant',
    case when p_note is not null then jsonb_build_object('note', p_note) else '{}'::jsonb end
  );
end;
$$;

revoke all on function public.grant_admin_product(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.grant_admin_product(uuid, text, text, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- grant_purchased_product: called by a verified purchase/webhook handler
-- after it has already confirmed the payment — this function does not and
-- cannot verify a payment itself. p_metadata holds provider-specific
-- details (e.g. {provider, external_charge_id, amount, currency}) in the
-- existing entitlements.metadata jsonb column, no new columns.
-- ---------------------------------------------------------------------------
create or replace function public.grant_purchased_product(
  p_user_id uuid,
  p_product_slug text,
  p_product_version text,
  p_cycle_key text,
  p_metadata jsonb default '{}'::jsonb
)
returns table (entitlement_id uuid, product_instance_id uuid, was_existing boolean)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select * from public._grant_product_instance(
    p_user_id,
    p_product_slug,
    p_product_version,
    p_cycle_key,
    'purchase',
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.grant_purchased_product(uuid, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.grant_purchased_product(uuid, text, text, text, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- revoke_entitlement: "full removal" per the locked decision — sets
-- is_active = false and revoked_at, nothing else. product_instances and any
-- product-specific state rows are never touched or deleted; access
-- disappears purely because src/app/app/products/[productSlug]/layout.tsx's
-- entitlement check stops passing. Returns false (not an error) if there
-- was nothing active to revoke, so a retried call is a safe no-op.
-- ---------------------------------------------------------------------------
create or replace function public.revoke_entitlement(
  p_user_id uuid,
  p_product_slug text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_revoked boolean := false;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required' using errcode = '22004';
  end if;

  update public.entitlements
  set is_active = false, revoked_at = now(), updated_at = now()
  where user_id = p_user_id and product_slug = p_product_slug and is_active = true
  returning true into v_revoked;

  return coalesce(v_revoked, false);
end;
$$;

revoke all on function public.revoke_entitlement(uuid, text) from public, anon, authenticated;
grant execute on function public.revoke_entitlement(uuid, text) to service_role;
