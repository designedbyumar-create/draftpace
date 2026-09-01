-- Home Base: reminders + delivery ledger. Additive only.
-- Mirrors PFC's identical pfc_reminders / pfc_notification_deliveries
-- pair (202608090001), scoped down to Home Base's two kinds and three
-- lifecycle states (no snooze/acknowledge - no UI drives those
-- transitions yet, see reminders.ts's own comment).
--
-- hmc_notification_deliveries is the actual send-once guarantee: its
-- unique (user_id, dedupe_key) constraint is what the evaluator's
-- claim-then-send upsert relies on. No insert/update/delete policy for
-- `authenticated` - only the service-role client (server-side cron
-- evaluator) ever writes there.

begin;

create table if not exists public.hmc_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  entity_type text check (entity_type in ('appliance', 'maintenanceTask')),
  entity_id uuid,
  kind text not null check (kind in ('maintenanceDue', 'warrantyExpiring')),
  dedupe_key text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'delivered', 'cancelled')),
  next_eligible_at timestamptz not null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_instance_id, dedupe_key)
);

create index if not exists hmc_reminders_user_id_idx on public.hmc_reminders (user_id);
create index if not exists hmc_reminders_instance_idx on public.hmc_reminders (product_instance_id);
create index if not exists hmc_reminders_eligible_idx on public.hmc_reminders (status, next_eligible_at);

alter table public.hmc_reminders enable row level security;

drop policy if exists "Users can view their own Home Base reminders" on public.hmc_reminders;
create policy "Users can view their own Home Base reminders"
on public.hmc_reminders for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own Home Base reminders" on public.hmc_reminders;
create policy "Users can insert their own Home Base reminders"
on public.hmc_reminders for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own Home Base reminders" on public.hmc_reminders;
create policy "Users can update their own Home Base reminders"
on public.hmc_reminders for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));

-- No DELETE policy - rows are only ever soft-cancelled, never deleted.

-- ---------------------------------------------------------------------------
-- hmc_notification_deliveries - append-only, service-role write only.
-- ---------------------------------------------------------------------------
create table if not exists public.hmc_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_ids uuid[] not null default '{}',
  push_subscription_id uuid references public.push_subscriptions(id) on delete set null,
  dedupe_key text not null,
  outcome text not null check (outcome in ('sent', 'failed', 'skipped')),
  failure_reason text,
  delivered_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists hmc_notification_deliveries_user_id_idx on public.hmc_notification_deliveries (user_id);

alter table public.hmc_notification_deliveries enable row level security;

drop policy if exists "Users can view their own Home Base notification deliveries" on public.hmc_notification_deliveries;
create policy "Users can view their own Home Base notification deliveries"
on public.hmc_notification_deliveries for select to authenticated using (auth.uid() = user_id);

-- Deliberately no insert/update/delete policy for `authenticated` - only
-- the service-role client (server-side cron evaluator) writes here, and
-- service-role bypasses RLS entirely, so no policy is needed for it.

commit;
