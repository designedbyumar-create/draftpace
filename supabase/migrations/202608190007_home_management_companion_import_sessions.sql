-- Home Base: import_sessions, the provenance table 202608190001 already
-- anticipated (its own comment: "import_session_id is a bare uuid with no
-- FK yet, same as PFC's own tables (hmc_import_sessions doesn't exist
-- yet)"). Additive only.
--
-- Deliberately lighter than PFC's own import schema
-- (202608080002_personal_finance_companion_supporting_tables.sql): no
-- separate hmc_extraction_candidates or hmc_confirmation_events tables.
-- Home Base has only three record types (vs PFC's seven, one of which,
-- transactions, needs its own staged-review workflow) and every one of
-- them already carries status/needs_review_reason/source/import_session_id
-- directly (202608190001). A candidate lives only in the browser during
-- the review step; nothing is written until the person confirms it, at
-- which point it is created directly as a real hmc_appliances /
-- hmc_maintenance_tasks / hmc_service_providers row with its own
-- provenance columns already filled in. This avoids a second staging
-- table (and PFC's own noted gap: unreviewed candidates that can be
-- forgotten mid-batch) for a product with a much smaller import surface.
--
-- Wrapped in an explicit transaction, same reasoning as every prior
-- migration in this product.

begin;

create table if not exists public.hmc_import_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  input_type text not null check (input_type in ('csv', 'pastedNotes', 'textFile')),
  file_original_name text,
  file_size_bytes bigint,
  file_mime_type text,
  processing_status text not null default 'extracting'
    check (processing_status in ('extracting', 'readyForReview', 'completed', 'failed')),
  error_state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hmc_import_sessions_user_id_idx on public.hmc_import_sessions (user_id);
create index if not exists hmc_import_sessions_instance_idx on public.hmc_import_sessions (product_instance_id);

alter table public.hmc_import_sessions enable row level security;
drop policy if exists "Users can view their own Home Base import sessions" on public.hmc_import_sessions;
create policy "Users can view their own Home Base import sessions"
on public.hmc_import_sessions for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own Home Base import sessions" on public.hmc_import_sessions;
create policy "Users can insert their own Home Base import sessions"
on public.hmc_import_sessions for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own Home Base import sessions" on public.hmc_import_sessions;
create policy "Users can update their own Home Base import sessions"
on public.hmc_import_sessions for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Now that import_sessions exists, add the FK from each of the four record
-- tables' import_session_id column, guarded the same way PFC's own
-- migration guards it (no native ADD CONSTRAINT IF NOT EXISTS form).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hmc_appliances_import_session_fkey'
      and conrelid = 'public.hmc_appliances'::regclass
  ) then
    alter table public.hmc_appliances
      add constraint hmc_appliances_import_session_fkey
      foreign key (import_session_id) references public.hmc_import_sessions(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hmc_maintenance_tasks_import_session_fkey'
      and conrelid = 'public.hmc_maintenance_tasks'::regclass
  ) then
    alter table public.hmc_maintenance_tasks
      add constraint hmc_maintenance_tasks_import_session_fkey
      foreign key (import_session_id) references public.hmc_import_sessions(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hmc_maintenance_log_import_session_fkey'
      and conrelid = 'public.hmc_maintenance_log'::regclass
  ) then
    alter table public.hmc_maintenance_log
      add constraint hmc_maintenance_log_import_session_fkey
      foreign key (import_session_id) references public.hmc_import_sessions(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hmc_service_providers_import_session_fkey'
      and conrelid = 'public.hmc_service_providers'::regclass
  ) then
    alter table public.hmc_service_providers
      add constraint hmc_service_providers_import_session_fkey
      foreign key (import_session_id) references public.hmc_import_sessions(id) on delete set null;
  end if;
end $$;

commit;
