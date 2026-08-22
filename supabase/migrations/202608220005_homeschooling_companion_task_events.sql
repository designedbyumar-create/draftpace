-- Homeschooling Companion: what actually happened.
--
-- Phase 2. One table, because Today itself is derived on read and never
-- stored: materialising a day's tasks would create a second source of
-- truth that goes stale the moment a parent changes the plan.
--
-- WHAT THIS TABLE IS FOR
--
-- Two jobs, and the second one is the product. It tells Today what has
-- already been dealt with, and it is the permanent record of a child's
-- education. The first job is housekeeping. The second is the thing a
-- parent is buying, and it is why nothing here is ever deleted and why
-- the columns snapshot rather than reference.
--
-- WHY position_label AND source ARE COPIED IN
--
-- A parent moves through their curriculum and edits their plan. If this
-- table pointed at the current position instead of recording the one
-- that was true on the day, then a record of March would silently
-- rewrite itself in June. "Unit 3, Lesson 12" is what they did on the
-- fourth, whatever the child is on now. History that changes when the
-- present changes is not history.
--
-- STILL NOT A GRADEBOOK. There is no score column and there will not be
-- one. difficulty and help_needed describe how a session went, in the
-- parent's own terms, and both are optional: a parent who only ever taps
-- Done must get a complete product, because most of them will.

begin;

create table if not exists public.hsc_task_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  child_id uuid not null references public.hsc_children(id) on delete cascade,
  subject text not null,
  -- Nullable: a parent working from their own plan has no curriculum row
  -- and their record is no less real for it.
  curriculum_id uuid references public.hsc_curricula(id) on delete set null,
  -- Snapshots, per the note above. Never resolved through a join.
  position_label text,
  source text not null check (source in ('publisher', 'parent', 'draftpace')),
  -- The day it happened, in the family's own reckoning. A date and not a
  -- timestamp: "we did maths on Tuesday" is the fact, and the minute it
  -- was recorded is noise that would only ever cause an off-by-one at
  -- midnight in the wrong timezone.
  on_date date not null,
  state text not null check (state in ('done', 'not-completed')),
  difficulty text check (difficulty is null or difficulty in ('easy', 'about-right', 'difficult')),
  help_needed text check (help_needed is null or help_needed in ('none', 'a-little', 'a-lot')),
  -- Learning history is private by default, per the founder's decision.
  visibility text not null default 'private' check (visibility in ('private', 'shareable')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One record per subject per child per day. Tapping Done twice is not
  -- two lessons, and the second tap corrects the first.
  unique (child_id, subject, on_date)
);

create index if not exists hsc_task_events_child_date_idx
  on public.hsc_task_events (child_id, on_date desc);
create index if not exists hsc_task_events_instance_idx
  on public.hsc_task_events (product_instance_id, on_date desc);

alter table public.hsc_task_events enable row level security;

drop policy if exists "hsc select hsc_task_events" on public.hsc_task_events;
create policy "hsc select hsc_task_events"
on public.hsc_task_events for select to authenticated using (auth.uid() = user_id);

drop policy if exists "hsc insert hsc_task_events" on public.hsc_task_events;
create policy "hsc insert hsc_task_events"
on public.hsc_task_events for insert to authenticated
with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id));

drop policy if exists "hsc update hsc_task_events" on public.hsc_task_events;
create policy "hsc update hsc_task_events"
on public.hsc_task_events for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
