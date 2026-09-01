-- Homeschooling Companion: children, curricula, and the plan.
--
-- Phase 1 of the approved proposal
-- (docs/products/HOMESCHOOLING-COMPANION-PROPOSAL.md). Additive only.
-- Nothing here touches any existing table, and this product shares no
-- schema with its three siblings beyond product_instances and
-- entitlements.
--
-- THE TIER THAT IS NEW
--
-- Every other Draftpace product hangs its rows off one product instance.
-- This one has a tier in between: instance, then child, then everything
-- else. Home Base's things owning their own documents and tasks is the
-- same shape one level shallower, and RLS follows the same pattern.
--
-- WHY VISIBILITY IS A COLUMN AND NOT A SETTING
--
-- This product holds personal information about children, which no other
-- Draftpace product does. The parent decides what appears in the printed
-- record, and those decisions are established at creation by a DEFAULT
-- here rather than applied later by application code, so the honest
-- state of a row is readable from the schema and cannot drift with a
-- refactor.
--
-- The defaults, decided by the founder:
--
--   child name          shareable    a record with no name on it is not
--                                    much of a record
--   everything else     private      age, curriculum, learning history,
--                                    observations, check results, notes
--
-- "Shareable" means eligible to appear in the parent's own generated
-- Book. It never means public, and there is no sharing mechanism in this
-- product at all.
--
-- STILL NOT A GRADEBOOK. Nothing here stores a score, a percentage, or a
-- comparison to any standard. Checks record per-topic standings in a
-- later phase, including "not enough to say".

begin;

-- Ownership helper, mirroring public._pla_owns_instance. Separate
-- function per product so one product's RLS can never be widened by a
-- change made for another.
create or replace function public._hsc_owns_instance(p_instance_id uuid)
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

-- ------------------------------------------------------------- children
create table if not exists public.hsc_children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  -- Age, not date of birth. A birth date is a high value identity field
  -- and nothing in this product needs one: age is what shapes a
  -- suggestion, and a birthday does nothing at all. Nullable because
  -- setup asks only what it will use.
  age integer check (age is null or (age >= 0 and age <= 25)),
  schooling_type text check (
    schooling_type is null
    or schooling_type in ('homeschool', 'hybrid', 'private-school', 'public-school')
  ),
  notes text,
  -- Established here, at creation, per the founder decision above.
  name_visibility text not null default 'shareable' check (name_visibility in ('private', 'shareable')),
  age_visibility text not null default 'private' check (age_visibility in ('private', 'shareable')),
  notes_visibility text not null default 'private' check (notes_visibility in ('private', 'shareable')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------ curricula
-- One shape holds all three sources. A publisher curriculum, a parent's
-- own, and a Draftpace suggestion are the same tree with a different
-- `source` and a different level of detail. That is what makes this
-- product curriculum agnostic in fact rather than only in copy.
create table if not exists public.hsc_curricula (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  child_id uuid not null references public.hsc_children(id) on delete cascade,
  source text not null check (source in ('publisher', 'parent', 'draftpace')),
  -- What the parent calls it. "Abeka Grade 4 Math", "Our science".
  title text not null,
  publisher text,
  subject text not null,
  visibility text not null default 'private' check (visibility in ('private', 'shareable')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------ curriculum tree
-- Self referencing, so unit contains topic contains objective without
-- three tables that would each need the same columns. A publisher
-- curriculum usually has one flat level of lessons and that is fine:
-- the tree is allowed to be a list.
create table if not exists public.hsc_curriculum_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  curriculum_id uuid not null references public.hsc_curricula(id) on delete cascade,
  parent_id uuid references public.hsc_curriculum_nodes(id) on delete cascade,
  kind text not null check (kind in ('unit', 'topic', 'objective', 'lesson')),
  title text not null,
  ordinal integer not null default 0,
  -- Into the taxonomy that lives in code. Nullable, because a parent who
  -- has typed "Unit 3" has given us something useful long before anybody
  -- has said which topic it is. This is the one hinge that makes a check
  -- possible without parsing a document.
  topic_key text check (topic_key is null or topic_key ~ '^[a-z][a-z0-9.-]*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------ positions
-- Where a child currently is, kept apart from the curriculum itself, so
-- that moving forward is a position write and never a mutation of what
-- is being followed.
create table if not exists public.hsc_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  child_id uuid not null references public.hsc_children(id) on delete cascade,
  curriculum_id uuid not null references public.hsc_curricula(id) on delete cascade,
  node_id uuid references public.hsc_curriculum_nodes(id) on delete set null,
  -- For the common case: "Lesson 12", typed, with no tree behind it.
  -- Thirty seconds of typing is a complete working model for everything
  -- Today needs, which is why no document parsing is being built.
  label text,
  moved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (child_id, curriculum_id)
);

-- ----------------------------------------------------------------- plan
create table if not exists public.hsc_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  child_id uuid not null references public.hsc_children(id) on delete cascade,
  subject text not null,
  days_per_week integer not null default 5 check (days_per_week between 0 and 7),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, subject)
);

create index if not exists hsc_children_instance_idx on public.hsc_children (product_instance_id, status);
create index if not exists hsc_curricula_child_idx on public.hsc_curricula (child_id, status);
create index if not exists hsc_nodes_curriculum_idx on public.hsc_curriculum_nodes (curriculum_id, parent_id, ordinal);
create index if not exists hsc_positions_child_idx on public.hsc_positions (child_id);
create index if not exists hsc_plan_child_idx on public.hsc_plan (child_id, active);

commit;
