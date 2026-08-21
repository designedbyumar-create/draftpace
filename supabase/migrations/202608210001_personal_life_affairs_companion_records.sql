-- In Order (Personal Life Affairs Companion): the core tables.
--
-- Additive only. Nothing here touches any existing table, and this
-- product shares no schema with PFC or Home Base beyond the platform's
-- own product_instances and entitlements.
--
-- THE SHAPE, AND WHY IT IS NOT A DOCUMENT STORE
--
-- pla_items holds one row per thing the person has told us about: an
-- executor, a policy, where the deed is. It stores WHERE something is
-- and WHO it concerns, never the thing itself and never a credential.
-- That is a deliberate product boundary, not an oversight: the paper
-- binders this product competes with cannot be vaults either, and the
-- platform rule against storing anything that opens a house holds here
-- too.
--
-- pla_steps is the important one. A step is an instance of a knowledge-
-- base entry for this person: "name a backup executor". Its state is
-- richer than done/not-done because an always-downloadable document has
-- to be honest about itself. Four states:
--   pending      never addressed
--   confirmed    answered, and true as of confirmed_at
--   notRelevant  the person said this does not apply, silenced forever
--   open         deliberately left unfinished, and printed as such
--
-- confirmed_at is separate from updated_at on purpose. The product's
-- whole claim is that the picture is CURRENT, so it must know when a
-- human last asserted that a fact is still true, distinct from when the
-- row was last written by anything.
--
-- pla_profile holds the intake answers that decide which steps exist at
-- all. Every column is nullable: not answering is always allowed, and an
-- unanswered profile simply offers the broadest set.
--
-- pla_events records life events (moved, divorced, new child). They are
-- kept as rows rather than derived, because an event must be able to
-- invalidate confirmations that were true before it happened, and that
-- needs a timestamp of its own.

begin;

-- Ownership helper, mirroring public._hmc_owns_instance. Separate
-- function per product so one product's RLS can never be widened by a
-- change made for another.
create or replace function public._pla_owns_instance(p_instance_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.product_instances pi
    where pi.id = p_instance_id and pi.user_id = auth.uid()
  );
$$;

create table if not exists public.pla_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null unique references public.product_instances(id) on delete cascade,
  -- Intake answers. Nullable means "not asked yet", which is distinct
  -- from false meaning "asked, and no".
  has_children boolean,
  has_dependants_with_extra_needs boolean,
  partnered boolean,
  owns_home boolean,
  has_employer_retirement boolean,
  has_business boolean,
  has_pets boolean,
  has_life_insurance boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pla_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  -- Open validated string, same pattern as hmc_things.type: new record
  -- kinds must never require a schema migration.
  kind text not null check (kind ~ '^[a-z][a-z0-9-]*$'),
  label text not null,
  -- Where it is, who holds it, how to reach them. Never the document,
  -- never a password, never an account number.
  whereabouts text,
  person_name text,
  person_contact text,
  notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pla_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  -- References a knowledge-base entry id, validated as a string rather
  -- than a foreign key: the knowledge base lives in code, not the DB, so
  -- it can be extended without a migration.
  step_key text not null check (step_key ~ '^[a-z][a-z0-9.-]*$'),
  state text not null default 'pending' check (state in ('pending', 'confirmed', 'notRelevant', 'open')),
  -- When a human last asserted this is still true. Never written by
  -- anything except an explicit confirmation.
  confirmed_at timestamptz,
  -- Set when an event or interval makes a past confirmation stale.
  needs_recheck_reason text,
  item_id uuid references public.pla_items(id) on delete set null,
  notes text,
  snoozed_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_instance_id, step_key)
);

create table if not exists public.pla_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  kind text not null check (kind ~ '^[a-z][a-z0-9-]*$'),
  occurred_on date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists pla_profile_user_id_idx on public.pla_profile (user_id);
create index if not exists pla_items_instance_idx on public.pla_items (product_instance_id);
create index if not exists pla_steps_instance_idx on public.pla_steps (product_instance_id);
create index if not exists pla_steps_state_idx on public.pla_steps (product_instance_id, state);
create index if not exists pla_events_instance_idx on public.pla_events (product_instance_id);

commit;
