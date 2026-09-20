-- Vehicle Maintenance Companion: service history, paperwork dates, glove box
-- details, and opt-in reminders.
--
-- SERVICE HISTORY
-- vmc_service_events is one row per time a job was done: the date, the
-- mileage if known, who did it and what it cost if the person chose to say.
-- Until now only the latest last-done fact was kept on the maintenance item
-- and every completion overwrote the one before it. The item still carries
-- last_done_at / last_done_mileage, because the due engine reads them; the
-- application keeps that pair equal to the latest active event for the item.
-- The backfill below turns every existing last-done fact into one event so
-- nothing already recorded is lost, and history starts complete.
--
-- PAPERWORK
-- vmc_renewals is one row per date the person wants to keep an eye on
-- (registration, insurance, inspection, warranty). It records the date and
-- where the paper is kept. It never stores the document itself.
--
-- GLOVE BOX DETAILS
-- Seven optional text columns on vmc_vehicles: plate, VIN, tyre size, oil
-- specification, insurer, policy number, roadside number. All typed by the
-- person, none looked up or verified.
--
-- REMINDERS
-- vmc_notification_preferences mirrors Alongside's: one row per instance,
-- reminders off by default, `notified` is the send-once ledger written only
-- by the cron evaluator with the service role.
--
-- Additive only. No delete policy on any new table: a row leaves by status.

begin;

-- ------------------------------------------------- glove box details
alter table public.vmc_vehicles
  add column if not exists plate text,
  add column if not exists vin text,
  add column if not exists tyre_size text,
  add column if not exists oil_spec text,
  add column if not exists insurer text,
  add column if not exists policy_number text,
  add column if not exists roadside_phone text;

-- ------------------------------------------------- service events
create table if not exists public.vmc_service_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  vehicle_id uuid not null references public.vmc_vehicles(id) on delete cascade,
  item_id uuid references public.vmc_maintenance_items(id) on delete set null,
  task_name text not null,
  done_on date not null,
  mileage integer,
  shop text,
  cost_minor bigint check (cost_minor is null or cost_minor >= 0),
  note text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vmc_service_events_instance_idx
  on public.vmc_service_events (product_instance_id, status);
create index if not exists vmc_service_events_vehicle_idx
  on public.vmc_service_events (vehicle_id, done_on desc);
create index if not exists vmc_service_events_item_idx
  on public.vmc_service_events (item_id);

alter table public.vmc_service_events enable row level security;

drop policy if exists "Users can view their own VMC service events" on public.vmc_service_events;
create policy "Users can view their own VMC service events"
on public.vmc_service_events for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own VMC service events" on public.vmc_service_events;
create policy "Users can insert their own VMC service events"
on public.vmc_service_events for insert to authenticated
with check (auth.uid() = user_id and public._vmc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own VMC service events" on public.vmc_service_events;
create policy "Users can update their own VMC service events"
on public.vmc_service_events for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Backfill: one event for each item that already has a last-done fact. Runs
-- only when the table is empty, so re-running this migration never doubles
-- the history.
insert into public.vmc_service_events
  (user_id, product_instance_id, vehicle_id, item_id, task_name, done_on, mileage, created_at, updated_at)
select i.user_id, i.product_instance_id, i.vehicle_id, i.id, i.task_name, i.last_done_at, i.last_done_mileage, now(), now()
from public.vmc_maintenance_items i
where i.last_done_at is not null
  and not exists (select 1 from public.vmc_service_events);

-- ------------------------------------------------- renewals
create table if not exists public.vmc_renewals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  vehicle_id uuid not null references public.vmc_vehicles(id) on delete cascade,
  kind text not null check (kind in ('registration', 'insurance', 'inspection', 'warranty', 'other')),
  label text,
  due_on date not null,
  where_kept text,
  note text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vmc_renewals_instance_idx
  on public.vmc_renewals (product_instance_id, status);
create index if not exists vmc_renewals_vehicle_idx
  on public.vmc_renewals (vehicle_id, due_on);

alter table public.vmc_renewals enable row level security;

drop policy if exists "Users can view their own VMC renewals" on public.vmc_renewals;
create policy "Users can view their own VMC renewals"
on public.vmc_renewals for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own VMC renewals" on public.vmc_renewals;
create policy "Users can insert their own VMC renewals"
on public.vmc_renewals for insert to authenticated
with check (auth.uid() = user_id and public._vmc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own VMC renewals" on public.vmc_renewals;
create policy "Users can update their own VMC renewals"
on public.vmc_renewals for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------- reminders
create table if not exists public.vmc_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  product_instance_id uuid not null unique references public.product_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reminders_enabled boolean not null default false,
  show_detail boolean not null default false,
  quiet_start_hour smallint not null default 21 check (quiet_start_hour between 0 and 23),
  quiet_end_hour smallint not null default 8 check (quiet_end_hour between 0 and 23),
  timezone text not null default 'UTC',
  notified jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vmc_notification_preferences_user_id_idx
  on public.vmc_notification_preferences (user_id);

alter table public.vmc_notification_preferences enable row level security;

drop policy if exists "Users can view their own VMC reminder preferences" on public.vmc_notification_preferences;
create policy "Users can view their own VMC reminder preferences"
on public.vmc_notification_preferences for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own VMC reminder preferences" on public.vmc_notification_preferences;
create policy "Users can insert their own VMC reminder preferences"
on public.vmc_notification_preferences for insert to authenticated
with check (auth.uid() = user_id and public._vmc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own VMC reminder preferences" on public.vmc_notification_preferences;
create policy "Users can update their own VMC reminder preferences"
on public.vmc_notification_preferences for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
