-- Family Health Binder. New product, own table prefix (fhb_).
--
-- STORAGE DECISION, SETTLED BEFORE THIS MIGRATION WAS WRITTEN
--
-- Normal Draftpace account-backed storage: Supabase + RLS, the same
-- pattern already proven by Travel Companion and Homeschooling
-- Companion, never browser-only local storage. The whole point of this
-- product is reachability in an emergency from any device, which local
-- storage cannot offer.
--
-- THE SHAPE: THREE TABLES
--
-- fhb_family_members: one row per person in the family this binder
-- covers, adults and children alike. A child is a plain row scoped
-- under the parent's own user_id, exactly like Homeschooling
-- Companion's own child records; there is no separate child account
-- anywhere in this product.
--
-- fhb_medical_facts: medications, allergies and family-history notes,
-- one table with a `kind` discriminator rather than three near-
-- identical tables, since all three are "a fact worth having on hand",
-- differing only in which of their optional fields is filled in.
--
-- fhb_symptom_events: the structured symptom timeline, kept as its own
-- table rather than folded into fhb_medical_facts because its shape is
-- genuinely different (an event with an onset and a duration, not a
-- standing fact) and because the research behind this product singles
-- out structure here specifically: onset, duration, severity and what
-- helped as real columns, never one free-text box.
--
-- VISIBILITY, ON BOTH FACT TABLES
--
-- Every fact and every symptom event carries a `visibility` of
-- 'summary' or 'private'. 'summary' rows are eligible for the Intake
-- Summary printable; 'private' rows stay in the account, reachable in
-- the app, but never printed onto a document meant to leave the house.
-- This is a real, testable distinction the application layer reads,
-- not a placeholder column.
--
-- OWNERSHIP AND LIFECYCLE, SAME POSTURE AS EVERY SIBLING
--
-- RLS on, at least one policy per table, every policy scoped to
-- auth.uid() = user_id, granted only to authenticated, instance
-- ownership additionally proven on insert via this product's own
-- _fhb_owns_instance function (a separate function per product so one
-- product's RLS can never be widened by a change made for another), and
-- no delete policy anywhere: a row leaves by status, never DELETE.

begin;

create or replace function public._fhb_owns_instance(p_instance_id uuid)
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

-- ------------------------------------------------------ family members
create table if not exists public.fhb_family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  relationship text not null default 'other' check (relationship in ('self', 'spouse', 'child', 'other')),
  date_of_birth date,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fhb_family_members_instance_idx
  on public.fhb_family_members (product_instance_id, status);

alter table public.fhb_family_members enable row level security;

drop policy if exists "Users can view their own family members" on public.fhb_family_members;
create policy "Users can view their own family members"
on public.fhb_family_members for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own family members" on public.fhb_family_members;
create policy "Users can insert their own family members"
on public.fhb_family_members for insert to authenticated
with check (auth.uid() = user_id and public._fhb_owns_instance(product_instance_id));

drop policy if exists "Users can update their own family members" on public.fhb_family_members;
create policy "Users can update their own family members"
on public.fhb_family_members for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -------------------------------------------------------- medical facts
create table if not exists public.fhb_medical_facts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  family_member_id uuid not null references public.fhb_family_members(id) on delete cascade,
  kind text not null check (kind in ('medication', 'allergy', 'history')),
  detail text not null,
  -- Medication-only fields, both null for an allergy or a history note.
  dosage text,
  frequency text,
  -- Allergy-only field, null otherwise.
  reaction text,
  visibility text not null default 'summary' check (visibility in ('summary', 'private')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fhb_medical_facts_member_idx
  on public.fhb_medical_facts (family_member_id, status);

alter table public.fhb_medical_facts enable row level security;

drop policy if exists "Users can view their own medical facts" on public.fhb_medical_facts;
create policy "Users can view their own medical facts"
on public.fhb_medical_facts for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own medical facts" on public.fhb_medical_facts;
create policy "Users can insert their own medical facts"
on public.fhb_medical_facts for insert to authenticated
with check (auth.uid() = user_id and public._fhb_owns_instance(product_instance_id));

drop policy if exists "Users can update their own medical facts" on public.fhb_medical_facts;
create policy "Users can update their own medical facts"
on public.fhb_medical_facts for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------- symptom events
create table if not exists public.fhb_symptom_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  family_member_id uuid not null references public.fhb_family_members(id) on delete cascade,
  description text not null,
  onset_at date not null,
  duration_value integer,
  duration_unit text check (duration_unit in ('hours', 'days', 'weeks')),
  severity text not null check (severity in ('mild', 'moderate', 'severe')),
  what_helped text,
  visibility text not null default 'summary' check (visibility in ('summary', 'private')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fhb_symptom_events_duration_pair
    check ((duration_value is null) = (duration_unit is null))
);

create index if not exists fhb_symptom_events_member_idx
  on public.fhb_symptom_events (family_member_id, status);

alter table public.fhb_symptom_events enable row level security;

drop policy if exists "Users can view their own symptom events" on public.fhb_symptom_events;
create policy "Users can view their own symptom events"
on public.fhb_symptom_events for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own symptom events" on public.fhb_symptom_events;
create policy "Users can insert their own symptom events"
on public.fhb_symptom_events for insert to authenticated
with check (auth.uid() = user_id and public._fhb_owns_instance(product_instance_id));

drop policy if exists "Users can update their own symptom events" on public.fhb_symptom_events;
create policy "Users can update their own symptom events"
on public.fhb_symptom_events for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
