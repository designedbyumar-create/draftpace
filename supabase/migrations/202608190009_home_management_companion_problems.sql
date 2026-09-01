-- Home Base v2: hmc_problems, the object for something currently broken
-- or reported (a leaking faucet), distinct from planned Maintenance (a
-- filter changed on a schedule). Additive only.
--
-- Deliberately uses `resolution_status` for the open/scheduled/resolved
-- lifecycle, NOT `status`, see src/products/home-management-companion/
-- domain/repository.ts's createRecordRepository().archive() hardcodes a
-- write to a column literally named `status` (the shared active/
-- needsReview/archived lifecycle every hmc_ record type carries). Reusing
-- `status` for Problems' own open/scheduled/resolved lifecycle would
-- silently collide with that generic archive path, so Problems get both
-- columns: the shared `status`/`needs_review_reason`/`source`/
-- `import_session_id` fields every record type has (so the generic
-- repository factory still works unmodified), and a second, independent
-- `resolution_status` for the founder's actual open -> scheduled ->
-- resolved workflow.
--
-- snoozed_until lands here now (Phase 2 adds the matching column to
-- hmc_maintenance_tasks) so both attention-eligible entities are ready
-- for the same snooze guard clause in attention.ts at the same time.
--
-- Wrapped in an explicit transaction, same reasoning as every prior
-- migration in this product.

begin;

create table if not exists public.hmc_problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  thing_id uuid references public.hmc_things(id) on delete set null,
  provider_id uuid references public.hmc_service_providers(id) on delete set null,
  title text not null,
  description text,
  resolution_status text not null default 'open' check (resolution_status in ('open', 'scheduled', 'resolved')),
  severity text not null default 'moderate' check (severity in ('minor', 'moderate', 'urgent')),
  effort text not null default 'moderate' check (effort in ('quick', 'moderate', 'bigJob')),
  estimated_cost_minor bigint,
  actual_cost_minor bigint,
  scheduled_at date,
  resolved_at date,
  snoozed_until timestamptz,
  notes text,
  status text not null default 'active' check (status in ('active', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport')),
  import_session_id uuid references public.hmc_import_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hmc_problems_user_id_idx on public.hmc_problems (user_id);
create index if not exists hmc_problems_instance_idx on public.hmc_problems (product_instance_id);
create index if not exists hmc_problems_thing_idx on public.hmc_problems (thing_id);
create index if not exists hmc_problems_provider_idx on public.hmc_problems (provider_id);
create index if not exists hmc_problems_resolution_status_idx on public.hmc_problems (resolution_status);

alter table public.hmc_problems enable row level security;
drop policy if exists "Users can view their own Home Base problems" on public.hmc_problems;
create policy "Users can view their own Home Base problems"
on public.hmc_problems for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own Home Base problems" on public.hmc_problems;
create policy "Users can insert their own Home Base problems"
on public.hmc_problems for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own Home Base problems" on public.hmc_problems;
create policy "Users can update their own Home Base problems"
on public.hmc_problems for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
