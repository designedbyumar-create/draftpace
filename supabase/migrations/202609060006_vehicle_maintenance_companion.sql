-- Vehicle Maintenance Companion. New product, own table prefix (vmc_).
--
-- THE SHAPE: TWO TABLES, MIRRORING WHAT THE PRODUCT ACTUALLY ASKS
--
-- vmc_vehicles: one row per vehicle a person tracks. Nothing here is a
-- VIN decoder or a valuation record; year/make/model are the person's
-- own words, kept only so a vehicle reads as itself in a list.
--
-- vmc_maintenance_items: one row per maintenance job tracked against one
-- vehicle (oil changes, tire rotation, cabin air filter, and so on).
-- Intervals are entered by the person, always: interval_miles and
-- interval_months are both nullable but a check constraint requires at
-- least one, so a job can be tracked by distance, by time, or both,
-- whichever the person actually knows. There is no universal interval
-- table baked into this schema; the client-side knowledge base
-- (vehicleKnowledge.ts) only ever proposes a starting number, labelled
-- as a generic default, and every value here is what the person kept or
-- typed themselves.
--
-- severe_duty is a one-time toggle per item, not per vehicle: whether
-- dusty, towing, short-trip or extreme-temperature use shortens a given
-- job's interval is a fact about that specific job (an oil change cares;
-- a cabin air filter mostly does not), not a single household-wide flag.
--
-- HISTORY-KNOWN, FOR THE USED-CAR AND INHERITED-VEHICLE CASE
--
-- history_known on the vehicle is what the "I don't know this vehicle's
-- history" setup path sets to false. It is read by the application
-- layer to decide whether a maintenance item may honestly claim a due
-- status at all before any last_done fact has been recorded for it: a
-- car with an unknown history has nothing to compute a boundary from,
-- and saying otherwise would be inventing a fact nobody actually knows.
--
-- OWNERSHIP AND LIFECYCLE, SAME POSTURE AS EVERY SIBLING
--
-- RLS on, at least one policy per table, every policy scoped to
-- auth.uid() = user_id, granted only to authenticated, instance
-- ownership additionally proven on insert via the product's own
-- _vmc_owns_instance function (a separate function per product so one
-- product's RLS can never be widened by a change made for another), and
-- no delete policy anywhere: a row leaves by status, never DELETE.

begin;

create or replace function public._vmc_owns_instance(p_instance_id uuid)
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

-- ----------------------------------------------------------- vehicles
create table if not exists public.vmc_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  -- "2019 Honda Civic", in the person's own words, not decoded from a VIN.
  label text not null,
  year integer,
  make text,
  model text,
  current_mileage integer,
  mileage_updated_at date,
  -- False only via the explicit "I don't know this vehicle's history"
  -- setup path (used cars, inherited vehicles). Defaults true because
  -- most vehicles are added by an owner who does know their own history.
  history_known boolean not null default true,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vmc_vehicles_instance_idx
  on public.vmc_vehicles (product_instance_id, status);

alter table public.vmc_vehicles enable row level security;

drop policy if exists "Users can view their own vehicles" on public.vmc_vehicles;
create policy "Users can view their own vehicles"
on public.vmc_vehicles for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own vehicles" on public.vmc_vehicles;
create policy "Users can insert their own vehicles"
on public.vmc_vehicles for insert to authenticated
with check (auth.uid() = user_id and public._vmc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own vehicles" on public.vmc_vehicles;
create policy "Users can update their own vehicles"
on public.vmc_vehicles for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------- maintenance items
create table if not exists public.vmc_maintenance_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  vehicle_id uuid not null references public.vmc_vehicles(id) on delete cascade,
  -- Which vehicleKnowledge.ts template this started from, if any. Null
  -- for a fully custom item the person named themselves.
  template_id text,
  task_name text not null,
  interval_miles integer,
  interval_months integer,
  severe_duty boolean not null default false,
  last_done_at date,
  last_done_mileage integer,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vmc_maintenance_items_has_interval
    check (interval_miles is not null or interval_months is not null)
);

create index if not exists vmc_maintenance_items_vehicle_idx
  on public.vmc_maintenance_items (vehicle_id, status);

alter table public.vmc_maintenance_items enable row level security;

drop policy if exists "Users can view their own maintenance items" on public.vmc_maintenance_items;
create policy "Users can view their own maintenance items"
on public.vmc_maintenance_items for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own maintenance items" on public.vmc_maintenance_items;
create policy "Users can insert their own maintenance items"
on public.vmc_maintenance_items for insert to authenticated
with check (auth.uid() = user_id and public._vmc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own maintenance items" on public.vmc_maintenance_items;
create policy "Users can update their own maintenance items"
on public.vmc_maintenance_items for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
