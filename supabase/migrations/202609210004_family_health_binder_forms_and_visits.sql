-- Family Health Binder: the answers every form asks, entered once.
--
-- What this adds, all typed by the person and none of it looked up,
-- verified or checked against anything:
--
--   fhb_family_members  emergency contact, insurance, caregiver notes, and
--                       the day the medication list was last checked. A new
--                       relationship, 'parent', for the adult child who
--                       keeps a parent's binder.
--   fhb_medical_facts   a 'condition' kind, and a start and stop date on a
--                       medication so a stopped one leaves the printed pages
--                       without being erased.
--   fhb_providers       doctors, specialists, a dentist and a pharmacy, with
--                       a phone number each.
--   fhb_immunizations   which vaccine, and the day it was given. A record of
--                       what was typed in. It never says what is due,
--                       because schedules differ and are not verified here.
--   fhb_visits          an appointment: the questions to ask before it and
--                       what was said or decided after it.
--
-- Additive except for two widened check constraints. No delete policy on
-- any new table: a row leaves by status.

begin;

-- ------------------------------------------------- members
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.fhb_family_members'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%relationship%'
  loop
    execute format('alter table public.fhb_family_members drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.fhb_family_members
  add constraint fhb_family_members_relationship_check
  check (relationship in ('self', 'spouse', 'child', 'parent', 'other'));

alter table public.fhb_family_members
  add column if not exists emergency_name text,
  add column if not exists emergency_phone text,
  add column if not exists insurer text,
  add column if not exists insurance_member_id text,
  add column if not exists insurance_group text,
  add column if not exists caregiver_notes text,
  add column if not exists medications_checked_on date;

-- ------------------------------------------------- facts
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.fhb_medical_facts'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%kind%'
  loop
    execute format('alter table public.fhb_medical_facts drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.fhb_medical_facts
  add constraint fhb_medical_facts_kind_check
  check (kind in ('medication', 'allergy', 'condition', 'history'));

alter table public.fhb_medical_facts
  add column if not exists started_on date,
  add column if not exists stopped_on date;

-- ------------------------------------------------- providers
create table if not exists public.fhb_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  family_member_id uuid not null references public.fhb_family_members(id) on delete cascade,
  kind text not null check (kind in ('doctor', 'specialist', 'dentist', 'pharmacy', 'other')),
  name text not null,
  phone text,
  note text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fhb_providers_member_idx
  on public.fhb_providers (family_member_id, status);

alter table public.fhb_providers enable row level security;

drop policy if exists "Users can view their own providers" on public.fhb_providers;
create policy "Users can view their own providers"
on public.fhb_providers for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own providers" on public.fhb_providers;
create policy "Users can insert their own providers"
on public.fhb_providers for insert to authenticated
with check (auth.uid() = user_id and public._fhb_owns_instance(product_instance_id));

drop policy if exists "Users can update their own providers" on public.fhb_providers;
create policy "Users can update their own providers"
on public.fhb_providers for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------- immunizations
create table if not exists public.fhb_immunizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  family_member_id uuid not null references public.fhb_family_members(id) on delete cascade,
  vaccine text not null,
  given_on date not null,
  note text,
  visibility text not null default 'summary' check (visibility in ('summary', 'private')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fhb_immunizations_member_idx
  on public.fhb_immunizations (family_member_id, status);

alter table public.fhb_immunizations enable row level security;

drop policy if exists "Users can view their own immunizations" on public.fhb_immunizations;
create policy "Users can view their own immunizations"
on public.fhb_immunizations for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own immunizations" on public.fhb_immunizations;
create policy "Users can insert their own immunizations"
on public.fhb_immunizations for insert to authenticated
with check (auth.uid() = user_id and public._fhb_owns_instance(product_instance_id));

drop policy if exists "Users can update their own immunizations" on public.fhb_immunizations;
create policy "Users can update their own immunizations"
on public.fhb_immunizations for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------- visits
create table if not exists public.fhb_visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  family_member_id uuid not null references public.fhb_family_members(id) on delete cascade,
  visit_on date not null,
  with_whom text,
  reason text not null,
  questions text,
  notes text,
  visibility text not null default 'summary' check (visibility in ('summary', 'private')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fhb_visits_member_idx
  on public.fhb_visits (family_member_id, status);

alter table public.fhb_visits enable row level security;

drop policy if exists "Users can view their own visits" on public.fhb_visits;
create policy "Users can view their own visits"
on public.fhb_visits for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own visits" on public.fhb_visits;
create policy "Users can insert their own visits"
on public.fhb_visits for insert to authenticated
with check (auth.uid() = user_id and public._fhb_owns_instance(product_instance_id));

drop policy if exists "Users can update their own visits" on public.fhb_visits;
create policy "Users can update their own visits"
on public.fhb_visits for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
