-- Homeschooling Companion: the one household-level fact this product
-- needs, which state a family homeschools in.
--
-- SAME SHAPE AS Home Base's hmc_home_profile, DELIBERATELY
--
-- State is a household fact, not a per-child one: a child added to
-- hsc_children never asks it, because re-asking the same answer for a
-- second or third child is exactly the redundant question setup.ts's
-- own doc comment says this product exists to avoid. One row per
-- instance, enforced the same way, nullable, because not answering is
-- always allowed and an unanswered household behaves exactly as the
-- product did before this table existed.
--
-- What the state actually implies (the regulation level, what a
-- portfolio needs) is not stored here at all. It lives in code, in
-- src/lib/homeschoolStateRequirements.ts, the same array the public
-- guide's state-by-state table now renders from. This table only ever
-- stores which state a household picked; what that means is derived,
-- so a correction to the facts never requires a migration.

begin;

create table if not exists public.hsc_household (
  id uuid primary key default gen_random_uuid(),
  product_instance_id uuid not null unique references public.product_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- The exact state name as it appears in
  -- HOMESCHOOL_STATE_REQUIREMENTS (e.g. "Texas", "District of
  -- Columbia"), never a two-letter code: the picker offers the same 51
  -- names the guide and the requirements table use, so a lookup can
  -- never fail on a format mismatch. Not constrained by a check here,
  -- deliberately: the 51 names are validated in application code
  -- against the same array the picker is built from, so this table
  -- never needs a migration when a name's exact wording is revisited.
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hsc_household_user_id_idx on public.hsc_household (user_id);

alter table public.hsc_household enable row level security;

drop policy if exists "Users can view their own Homeschooling household" on public.hsc_household;
create policy "Users can view their own Homeschooling household"
on public.hsc_household for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own Homeschooling household" on public.hsc_household;
create policy "Users can insert their own Homeschooling household"
on public.hsc_household for insert to authenticated
with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own Homeschooling household" on public.hsc_household;
create policy "Users can update their own Homeschooling household"
on public.hsc_household for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
