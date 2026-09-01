-- Home Base: the few facts about a home that shape what the product
-- asks, as opposed to the things inside it.
--
-- Tenure is the first and the reason this exists. Owning and renting are
-- genuinely different products: a renter has no roof, no septic tank and
-- no gutters, but does have a lease with a notice deadline and a deposit
-- that turns on move-in photographs. The knowledge layer already flags
-- which of its 121 types apply without owning the place, and nothing has
-- been able to read that flag because nothing knew which kind of home
-- this is.
--
-- A table rather than a column on an existing row, because this is a
-- distinct idea that will grow. Region is the obvious next one: seasonal
-- care is only correct if the product knows roughly where the house is,
-- since blowing out irrigation lines in October is right in Minnesota
-- and meaningless in Phoenix.
--
-- One row per instance, enforced by the unique constraint, same singleton
-- shape as hmc_notification_preferences. Every column is nullable: not
-- answering a question is always allowed, and an unanswered profile
-- behaves exactly as the product did before it existed.

begin;

create table if not exists public.hmc_home_profile (
  id uuid primary key default gen_random_uuid(),
  product_instance_id uuid not null unique references public.product_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tenure text check (tenure is null or tenure in ('own', 'rent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hmc_home_profile_user_id_idx on public.hmc_home_profile (user_id);

alter table public.hmc_home_profile enable row level security;

drop policy if exists "Users can view their own Home Base home profile" on public.hmc_home_profile;
create policy "Users can view their own Home Base home profile"
on public.hmc_home_profile for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own Home Base home profile" on public.hmc_home_profile;
create policy "Users can insert their own Home Base home profile"
on public.hmc_home_profile for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own Home Base home profile" on public.hmc_home_profile;
create policy "Users can update their own Home Base home profile"
on public.hmc_home_profile for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
