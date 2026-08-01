-- Monthly Money Reset: free-product entitlement, product instances, and the
-- product's own validated financial state. Additive only — no existing
-- table is touched. See docs/FREE-PRODUCT-ACTIVATION.md and
-- docs/products/MONTHLY-MONEY-RESET-STATES.md for the full design.
--
-- Mutation model: entitlements, product_instances, and
-- monthly_money_reset_states are never written to directly by clients.
-- `authenticated` is granted select only on all three; every insert/update
-- goes through the security definer functions below, which independently
-- verify auth.uid() ownership and (for free activation) an explicit
-- database-side allowlist, not a client-supplied product slug/version.

-- ---------------------------------------------------------------------------
-- Free-activation allowlist. The database, not the TypeScript registry, is
-- the source of truth for which product slugs may be granted for free and at
-- which version — a caller can never supply an arbitrary slug/version.
-- ---------------------------------------------------------------------------
create table if not exists public.free_activatable_products (
  product_slug text primary key,
  product_version text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.free_activatable_products (product_slug, product_version, is_active)
values ('monthly-money-reset', '0.1.0', true)
on conflict (product_slug) do update set product_version = excluded.product_version, is_active = true;

-- No grants to anon/authenticated at all — only readable from inside the
-- security definer functions below.

-- ---------------------------------------------------------------------------
-- Entitlements: one row per (user, product) a user has access to.
-- ---------------------------------------------------------------------------
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  access_source text not null default 'free-grant' check (access_source in ('free-grant', 'purchase', 'admin-grant')),
  is_active boolean not null default true,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

create index if not exists entitlements_user_id_idx on public.entitlements (user_id);

alter table public.entitlements enable row level security;

drop policy if exists "Users can view their own entitlements" on public.entitlements;
create policy "Users can view their own entitlements"
on public.entitlements for select
to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Product instances: one per (user, product, monthly cycle). Deliberately
-- generic and lightweight — no product-specific payload lives here (see
-- docs/DATA-BOUNDARIES.md). setup_complete / safe_to_spend_cents /
-- next_action_label are a denormalized read cache for Library and Platform
-- Home, kept consistent with monthly_money_reset_states.state by being
-- written in the same transaction as that table, never independently.
-- ---------------------------------------------------------------------------
create table if not exists public.product_instances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_id uuid not null references public.entitlements(id) on delete cascade,
  product_slug text not null,
  product_version text not null,
  cycle_key text not null check (cycle_key ~ '^\d{4}-\d{2}$'),
  previous_instance_id uuid references public.product_instances(id),
  lifecycle_state text not null default 'active' check (lifecycle_state in ('active', 'completed', 'paused', 'archived')),
  setup_complete boolean not null default false,
  safe_to_spend_cents bigint,
  next_action_label text,
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_slug, cycle_key)
);

create index if not exists product_instances_user_id_idx on public.product_instances (user_id);
create index if not exists product_instances_user_product_idx on public.product_instances (user_id, product_slug);

alter table public.product_instances enable row level security;

drop policy if exists "Users can view their own product instances" on public.product_instances;
create policy "Users can view their own product instances"
on public.product_instances for select
to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Monthly Money Reset's own validated state. One row per product instance.
-- `revision` implements optimistic concurrency: every write must supply the
-- revision it last read; a mismatch means someone else wrote first, and the
-- caller reloads and reconciles rather than overwriting.
-- ---------------------------------------------------------------------------
create table if not exists public.monthly_money_reset_states (
  id uuid primary key default gen_random_uuid(),
  product_instance_id uuid not null unique references public.product_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  schema_version integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mmr_states_user_id_idx on public.monthly_money_reset_states (user_id);

alter table public.monthly_money_reset_states enable row level security;

drop policy if exists "Users can view their own Monthly Money Reset state" on public.monthly_money_reset_states;
create policy "Users can view their own Monthly Money Reset state"
on public.monthly_money_reset_states for select
to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- grant_free_product: the only way an entitlement + first instance can be
-- created. Looks up eligibility and version from free_activatable_products
-- (never trusts a client-supplied version), is idempotent (safe to call
-- repeatedly for the same user/product/cycle), and can only ever write rows
-- owned by auth.uid() — there is no user-id parameter to spoof.
-- ---------------------------------------------------------------------------
create or replace function public.grant_free_product(
  p_product_slug text,
  p_cycle_key text
)
returns table (entitlement_id uuid, product_instance_id uuid, was_existing boolean)
language plpgsql
security definer
set search_path = public
as $$
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

-- ---------------------------------------------------------------------------
-- save_monthly_money_reset_state: the only way state is ever updated.
-- Enforces ownership manually (security definer bypasses RLS) and
-- optimistic concurrency via the revision column. Returns conflict = true
-- with the current revision/state when p_expected_revision is stale, rather
-- than overwriting a newer write from another tab or device.
-- ---------------------------------------------------------------------------
create or replace function public.save_monthly_money_reset_state(
  p_instance_id uuid,
  p_expected_revision integer,
  p_new_state jsonb,
  p_setup_complete boolean,
  p_safe_to_spend_cents bigint,
  p_next_action_label text
)
returns table (revision integer, state jsonb, conflict boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner uuid;
  v_new_revision integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  select user_id into v_owner from public.product_instances where id = p_instance_id;
  if v_owner is null or v_owner <> v_user_id then
    raise exception 'Not found' using errcode = '42501';
  end if;

  update public.monthly_money_reset_states mrs
  set state = p_new_state, revision = mrs.revision + 1, updated_at = now()
  where mrs.product_instance_id = p_instance_id
    and mrs.user_id = v_user_id
    and mrs.revision = p_expected_revision
  returning mrs.revision into v_new_revision;

  if v_new_revision is null then
    return query
      select mrs.revision, mrs.state, true
      from public.monthly_money_reset_states mrs
      where mrs.product_instance_id = p_instance_id;
    return;
  end if;

  update public.product_instances pi
  set setup_complete = p_setup_complete,
      safe_to_spend_cents = p_safe_to_spend_cents,
      next_action_label = p_next_action_label,
      last_activity_at = now(),
      updated_at = now()
  where pi.id = p_instance_id and pi.user_id = v_user_id;

  return query select v_new_revision, p_new_state, false;
end;
$$;

revoke all on function public.save_monthly_money_reset_state(uuid, integer, jsonb, boolean, bigint, text) from public;
grant execute on function public.save_monthly_money_reset_state(uuid, integer, jsonb, boolean, bigint, text) to authenticated;

-- ---------------------------------------------------------------------------
-- set_product_instance_lifecycle: the only way lifecycle_state changes,
-- kept separate from save_monthly_money_reset_state since a lifecycle
-- transition (closing a month, pausing, archiving) is a distinct action from
-- an ordinary state edit and shouldn't require carrying a revision/state
-- payload just to flip one column.
-- ---------------------------------------------------------------------------
create or replace function public.set_product_instance_lifecycle(
  p_instance_id uuid,
  p_lifecycle_state text
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

  if p_lifecycle_state not in ('active', 'completed', 'paused', 'archived') then
    raise exception 'Invalid lifecycle state "%"', p_lifecycle_state using errcode = '22023';
  end if;

  select user_id into v_owner from public.product_instances where id = p_instance_id;
  if v_owner is null or v_owner <> v_user_id then
    raise exception 'Not found' using errcode = '42501';
  end if;

  update public.product_instances
  set lifecycle_state = p_lifecycle_state,
      completed_at = case when p_lifecycle_state = 'completed' then now() else completed_at end,
      updated_at = now()
  where id = p_instance_id and user_id = v_user_id;
end;
$$;

revoke all on function public.set_product_instance_lifecycle(uuid, text) from public;
grant execute on function public.set_product_instance_lifecycle(uuid, text) to authenticated;
