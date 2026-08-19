-- Home Base v2: hmc_things, the generic entity replacing the narrow
-- hmc_appliances table (an appliance/system/fixture/equipment is all
-- "a thing in the home" to the user, not four different record types).
-- Additive only: hmc_appliances is untouched, still exists, still
-- readable, and application code keeps using it until Phase 4's
-- deliberate, contained cutover. This migration only adds a new table
-- and backfills it, nothing is dropped or altered here.
--
-- The `type` column is an OPEN, validated string, not a closed CHECK
-- enum like hmc_appliances.category was. Copies the platform's own
-- pattern for exactly this problem: see
-- src/product-framework/families.ts's FAMILY_ID_PATTERN
-- (/^[a-z][a-z0-9-]*$/), a plain regex-validated string backed by a
-- registry, not z.enum(...), so new thing types (a water softener, a
-- sump pump, anything) can be added later without a schema migration.
--
-- hmc_thing_documents holds everything beyond the one warranty date and
-- one document link that stay directly on hmc_things (kept there so
-- Attention's warranty-expiry check stays a cheap single-table read,
-- no join needed): a receipt, a manual, a second warranty, etc.
--
-- Wrapped in an explicit transaction, same reasoning as every prior
-- migration in this product.

begin;

create table if not exists public.hmc_things (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  type text not null default 'other' check (type ~ '^[a-z][a-z0-9-]*$'),
  brand text,
  model text,
  location text,
  purchase_date date,
  install_date date,
  warranty_expires_at date,
  document_link text,
  notes text,
  status text not null default 'active' check (status in ('active', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport')),
  import_session_id uuid references public.hmc_import_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hmc_thing_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  thing_id uuid not null references public.hmc_things(id) on delete cascade,
  kind text not null check (kind in ('warranty', 'receipt', 'manual', 'other')),
  label text,
  document_link text not null,
  document_date date,
  notes text,
  status text not null default 'active' check (status in ('active', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport')),
  import_session_id uuid references public.hmc_import_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists hmc_things_user_id_idx on public.hmc_things (user_id);
create index if not exists hmc_things_instance_idx on public.hmc_things (product_instance_id);
create index if not exists hmc_things_type_idx on public.hmc_things (type);

create index if not exists hmc_thing_documents_user_id_idx on public.hmc_thing_documents (user_id);
create index if not exists hmc_thing_documents_instance_idx on public.hmc_thing_documents (product_instance_id);
create index if not exists hmc_thing_documents_thing_idx on public.hmc_thing_documents (thing_id);

-- ---------------------------------------------------------------------------
-- RLS: select/insert/update, identical pattern to hmc_appliances.
-- ---------------------------------------------------------------------------
alter table public.hmc_things enable row level security;
drop policy if exists "Users can view their own Home Base things" on public.hmc_things;
create policy "Users can view their own Home Base things"
on public.hmc_things for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own Home Base things" on public.hmc_things;
create policy "Users can insert their own Home Base things"
on public.hmc_things for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own Home Base things" on public.hmc_things;
create policy "Users can update their own Home Base things"
on public.hmc_things for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.hmc_thing_documents enable row level security;
drop policy if exists "Users can view their own Home Base thing documents" on public.hmc_thing_documents;
create policy "Users can view their own Home Base thing documents"
on public.hmc_thing_documents for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own Home Base thing documents" on public.hmc_thing_documents;
create policy "Users can insert their own Home Base thing documents"
on public.hmc_thing_documents for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));
drop policy if exists "Users can update their own Home Base thing documents" on public.hmc_thing_documents;
create policy "Users can update their own Home Base thing documents"
on public.hmc_thing_documents for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Backfill: every existing hmc_appliances row becomes a hmc_things row.
-- category maps 1:1 onto the new open type column as a starting seed
-- ('appliance'/'system'/'other' are all valid ^[a-z][a-z0-9-]*$ values).
-- hmc_appliances itself is left completely untouched by this statement.
-- ---------------------------------------------------------------------------
insert into public.hmc_things (
  id, user_id, product_instance_id, name, type, brand, model,
  purchase_date, install_date, warranty_expires_at, document_link, notes,
  status, needs_review_reason, source, import_session_id, created_at, updated_at
)
select
  id, user_id, product_instance_id, name, category, brand, model,
  purchase_date, install_date, warranty_expires_at, document_link, notes,
  status, needs_review_reason, source, import_session_id, created_at, updated_at
from public.hmc_appliances
on conflict (id) do nothing;

commit;
