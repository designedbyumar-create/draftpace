-- Home Management Companion ("Home Base"): the four core record tables.
-- Additive only — no existing table is touched.
--
-- Follows Personal Finance Companion's established, proven pattern for
-- this shape of data (independent, normalized, per-record-type tables,
-- not a single JSONB blob): `authenticated` gets direct RLS-enforced
-- select/insert/update, gated by auth.uid() = user_id plus an ownership
-- helper function that verifies product_instance_id belongs to the same
-- user — see 202608080001_personal_finance_companion_records.sql and
-- 202608080003_personal_finance_companion_write_access.sql, which this
-- migration mirrors directly rather than reinventing.
--
-- Lifecycle/provenance columns (status, needs_review_reason, source,
-- import_session_id) are included now, even though CSV/paste-notes import
-- (the only source of a non-'manual' value) doesn't ship until a later
-- phase — matching PFC's own table shape avoids a follow-up ALTER TABLE
-- once import lands. import_session_id is a bare uuid with no FK yet,
-- same as PFC's own tables (hmc_import_sessions doesn't exist yet).
--
-- Wrapped in an explicit transaction, same reasoning as PFC's migrations.

begin;

create table if not exists public.hmc_appliances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  category text not null default 'appliance' check (category in ('appliance', 'system', 'other')),
  brand text,
  model text,
  purchase_date date,
  install_date date,
  warranty_expires_at date,
  document_link text,
  notes text,
  status text not null default 'active' check (status in ('active', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hmc_maintenance_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  appliance_id uuid references public.hmc_appliances(id) on delete set null,
  name text not null,
  cadence_days integer not null check (cadence_days > 0),
  last_done_at date,
  document_link text,
  notes text,
  status text not null default 'active' check (status in ('active', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per completed maintenance event, whether tied to a recurring
-- task or logged as a one-off. Marking a task "done" (Attention/Workspace,
-- a later phase) inserts here and updates the task's last_done_at in the
-- same domain-layer call, never as two independent client writes.
create table if not exists public.hmc_maintenance_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  task_id uuid references public.hmc_maintenance_tasks(id) on delete set null,
  appliance_id uuid references public.hmc_appliances(id) on delete set null,
  description text not null,
  cost_minor bigint,
  performed_at date not null default current_date,
  performed_by text,
  notes text,
  status text not null default 'active' check (status in ('active', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hmc_service_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  category text,
  phone text,
  email text,
  last_used_at date,
  notes text,
  status text not null default 'active' check (status in ('active', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists hmc_appliances_user_id_idx on public.hmc_appliances (user_id);
create index if not exists hmc_appliances_instance_idx on public.hmc_appliances (product_instance_id);

create index if not exists hmc_maintenance_tasks_user_id_idx on public.hmc_maintenance_tasks (user_id);
create index if not exists hmc_maintenance_tasks_instance_idx on public.hmc_maintenance_tasks (product_instance_id);
create index if not exists hmc_maintenance_tasks_appliance_idx on public.hmc_maintenance_tasks (appliance_id);

create index if not exists hmc_maintenance_log_user_id_idx on public.hmc_maintenance_log (user_id);
create index if not exists hmc_maintenance_log_instance_idx on public.hmc_maintenance_log (product_instance_id);
create index if not exists hmc_maintenance_log_task_idx on public.hmc_maintenance_log (task_id);
create index if not exists hmc_maintenance_log_performed_at_idx on public.hmc_maintenance_log (performed_at);

create index if not exists hmc_service_providers_user_id_idx on public.hmc_service_providers (user_id);
create index if not exists hmc_service_providers_instance_idx on public.hmc_service_providers (product_instance_id);

-- ---------------------------------------------------------------------------
-- Ownership helper (mirrors public._pfc_owns_instance exactly)
-- ---------------------------------------------------------------------------
create or replace function public._hmc_owns_instance(p_instance_id uuid)
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

revoke all on function public._hmc_owns_instance(uuid) from public;
grant execute on function public._hmc_owns_instance(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS: select/insert/update, identical pattern to PFC's own tables.
-- ---------------------------------------------------------------------------
alter table public.hmc_appliances enable row level security;
drop policy if exists "Users can view their own Home Base appliances" on public.hmc_appliances;
create policy "Users can view their own Home Base appliances"
on public.hmc_appliances for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own Home Base appliances" on public.hmc_appliances;
create policy "Users can insert their own Home Base appliances"
on public.hmc_appliances for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own Home Base appliances" on public.hmc_appliances;
create policy "Users can update their own Home Base appliances"
on public.hmc_appliances for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.hmc_maintenance_tasks enable row level security;
drop policy if exists "Users can view their own Home Base maintenance tasks" on public.hmc_maintenance_tasks;
create policy "Users can view their own Home Base maintenance tasks"
on public.hmc_maintenance_tasks for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own Home Base maintenance tasks" on public.hmc_maintenance_tasks;
create policy "Users can insert their own Home Base maintenance tasks"
on public.hmc_maintenance_tasks for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own Home Base maintenance tasks" on public.hmc_maintenance_tasks;
create policy "Users can update their own Home Base maintenance tasks"
on public.hmc_maintenance_tasks for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.hmc_maintenance_log enable row level security;
drop policy if exists "Users can view their own Home Base maintenance log" on public.hmc_maintenance_log;
create policy "Users can view their own Home Base maintenance log"
on public.hmc_maintenance_log for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own Home Base maintenance log" on public.hmc_maintenance_log;
create policy "Users can insert their own Home Base maintenance log"
on public.hmc_maintenance_log for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own Home Base maintenance log" on public.hmc_maintenance_log;
create policy "Users can update their own Home Base maintenance log"
on public.hmc_maintenance_log for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.hmc_service_providers enable row level security;
drop policy if exists "Users can view their own Home Base service providers" on public.hmc_service_providers;
create policy "Users can view their own Home Base service providers"
on public.hmc_service_providers for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own Home Base service providers" on public.hmc_service_providers;
create policy "Users can insert their own Home Base service providers"
on public.hmc_service_providers for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own Home Base service providers" on public.hmc_service_providers;
create policy "Users can update their own Home Base service providers"
on public.hmc_service_providers for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
