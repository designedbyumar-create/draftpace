-- Homeschooling Companion: observations.
--
-- Phase 3. One table, and the smallest one in the product.
--
-- WHAT AN OBSERVATION IS FOR
--
-- Task events record that maths happened on Tuesday. An observation is
-- the parent noticing something: that she finally got fractions, that he
-- reads better lying on the floor, that a bad week was a cold and not a
-- problem. It is the part of a homeschool that no curriculum captures
-- and that a parent forgets within a fortnight.
--
-- It is also the most sensitive text in the product, which is why it is
-- private by default and stays private until the parent says otherwise,
-- one observation at a time. A note that a child cried during maths is
-- useful to the parent and belongs nowhere else, and it must not be
-- swept into a printed record by a setting made months earlier about
-- something else.
--
-- Deliberately not attached to a subject or a task. Most of what a
-- parent notices does not belong to a lesson, and forcing it to would
-- mean the ones that matter most go unwritten.

begin;

create table if not exists public.hsc_observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  child_id uuid not null references public.hsc_children(id) on delete cascade,
  -- The family's own day, matching hsc_task_events. See its note on why
  -- this is a date and not a timestamp.
  on_date date not null,
  note text not null,
  visibility text not null default 'private' check (visibility in ('private', 'shareable')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hsc_observations_child_date_idx
  on public.hsc_observations (child_id, on_date desc);
create index if not exists hsc_observations_instance_idx
  on public.hsc_observations (product_instance_id, on_date desc);

alter table public.hsc_observations enable row level security;

drop policy if exists "hsc select hsc_observations" on public.hsc_observations;
create policy "hsc select hsc_observations"
on public.hsc_observations for select to authenticated using (auth.uid() = user_id);

drop policy if exists "hsc insert hsc_observations" on public.hsc_observations;
create policy "hsc insert hsc_observations"
on public.hsc_observations for insert to authenticated
with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id));

drop policy if exists "hsc update hsc_observations" on public.hsc_observations;
create policy "hsc update hsc_observations"
on public.hsc_observations for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
