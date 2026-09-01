-- Alongside: life items, their history, and Companion runs.
--
-- Phase 1 of the approved product definition
-- (docs/products/ADHD-LIFE-COMPANION-PROPOSAL.md, built under the
-- confirmed name Alongside). Additive only. Nothing here touches any
-- existing table, and this product shares no schema with its four
-- siblings beyond product_instances and entitlements.
--
-- THE BOUNDARY, ENFORCED IN THE SCHEMA
--
-- The other four Companions each own a subject: money, a home, papers, a
-- child's learning. This one owns doing. That distinction is the whole
-- reason it can exist alongside them rather than overlapping them, so it
-- is written into the columns rather than left to the interface.
--
-- There is no amount, no account number, no provider, no policy number,
-- no address and no due date supplied by anybody but the user. This
-- table records that somebody needs to sort out a problem with their
-- electricity bill. Personal Life Affairs records the electricity
-- account. Adding a money column here would quietly turn this into a
-- worse version of a product the founder already sells.
--
-- THE FOUR SHAPES
--
--   commitment   something to do
--   waiting      something somebody else owes you
--   thread       something started and not finished
--   reference    something to keep hold of
--
-- Waiting is the one that earns its place. Software that files "chase
-- the insurer" under things-to-do converts a fact about somebody else
-- into a personal failure, every time the list is opened. Here it is a
-- different kind of row and it is never counted as actionable.
--
-- WHAT IS DELIBERATELY ABSENT
--
-- No streak, no completion percentage, no score, no adherence, no
-- attempt counter. A person who did not get to something is not recorded
-- as having failed at it: the "did not get to it" outcome writes no row
-- in any table here, which is asserted by a test and is the reason
-- als_item_events exists as an append-only record of things that
-- happened rather than a log of things that did not.
--
-- NO DIAGNOSIS. Nothing here stores, asks for, or infers a diagnosis,
-- medication, symptom or severity. The product is built for how these
-- difficulties feel; it never claims to know why somebody has them.

begin;

-- Ownership helper, mirroring public._hsc_owns_instance. Separate
-- function per product so one product's RLS can never be widened by a
-- change made for another.
create or replace function public._als_owns_instance(p_instance_id uuid)
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

-- ----------------------------------------------------------- life items
create table if not exists public.als_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  kind text not null check (kind in ('commitment', 'waiting', 'thread', 'reference')),
  -- The user's own words, always. Nothing rewrites this, expands it,
  -- tidies it or infers a category from it.
  title text not null,
  note text,

  -- WHEN, AND WHO DECIDED
  --
  -- next_at is the only date in the product and it is never inferred
  -- from a bill, a letter or a pattern. user_chosen_date records whether
  -- the person picked it themselves, because "you said you would come
  -- back to this" and "coming up in a few days" are different sentences
  -- and only one of them is honest about where the date came from.
  next_at timestamptz,
  user_chosen_date boolean not null default false,
  -- Set only for the handful of things that genuinely come round again.
  -- Resolving one of these rolls it forward instead of closing it, so
  -- nobody has to set it up a second time.
  every_months integer check (every_months is null or (every_months >= 1 and every_months <= 60)),

  -- WAITING
  -- Free text on purpose. "The council", "Sarah", "them". A contact
  -- record would be a different product.
  waiting_on text,

  -- THREADS
  --
  -- The externalised context that makes resuming possible. Somebody who
  -- comes back to a half finished thing after three weeks has lost the
  -- state, not the ability, and these two columns are where the state is
  -- kept so it does not have to be reconstructed from memory.
  last_touched_at timestamptz,
  left_off_note text,
  next_step text,

  -- Closed, never deleted, in a product whose whole subject is things
  -- people find hard to finish. There is no delete policy on this table.
  status text not null default 'open' check (status in ('open', 'done', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists als_items_instance_open_idx
  on public.als_items (product_instance_id, status);
-- Attention is derived on read, every time, from these two columns.
create index if not exists als_items_attention_idx
  on public.als_items (product_instance_id, next_at)
  where status = 'open';

-- --------------------------------------------------------- item history
-- Append only, and written in the past tense about things that actually
-- happened. "Sorted", "Waiting on Sarah", "Made progress: got through to
-- the right team".
--
-- The line is snapshotted rather than regenerated, for the same reason
-- the other products snapshot theirs: history that rewrites itself when
-- the present changes is not history. If somebody renames an item or
-- changes who they are waiting on, what the log said last March still
-- says what it said last March.
create table if not exists public.als_item_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  item_id uuid not null references public.als_items(id) on delete cascade,
  -- Nullable: an event can happen without a Companion run behind it.
  run_id uuid,
  line text not null,
  -- Snapshot of what the item was called at the time.
  item_title text not null,
  outcome text check (
    outcome is null
    or outcome in ('resolved', 'progress', 'waiting', 'next-step', 'other')
  ),
  occurred_at timestamptz not null default now()
);

-- Note the absence of 'not-yet' from that check constraint. It is not an
-- oversight and it is not a validation detail: an abandoned attempt
-- writes nothing here, so the constraint makes the rule structural
-- rather than something a future contributor can helpfully break by
-- adding an attempts counter.

create index if not exists als_item_events_item_idx
  on public.als_item_events (item_id, occurred_at desc);

-- -------------------------------------------------------- companion runs
-- One walk through one playbook. item_id is nullable because opening the
-- Companion directly, with nothing recorded behind it, is a first class
-- way to use this product: somebody who has one phone call to make today
-- has not asked for a system, and should not have to build one first.
create table if not exists public.als_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  item_id uuid references public.als_items(id) on delete set null,
  -- The key from the library in code. Not a foreign key, because
  -- playbooks are versioned content in the repository, not user data.
  playbook_key text not null,
  -- Snapshot, so an old run still reads correctly after a playbook is
  -- retitled or retired.
  playbook_title text not null,
  outcome text check (
    outcome is null
    or outcome in ('resolved', 'progress', 'waiting', 'next-step', 'not-yet', 'other')
  ),
  outcome_detail text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'open' check (status in ('open', 'finished', 'left')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 'not-yet' IS allowed here, unlike on the events table, and the
-- difference is the point. A run that ended without the thing happening
-- is a fact about a conversation the person had with the product, and it
-- stays inside that conversation. It never becomes a mark against the
-- item, never touches last_touched_at, and never appears in the history
-- somebody reads back to themselves.

create index if not exists als_runs_item_idx
  on public.als_runs (item_id, started_at desc);

-- --------------------------------------------------------- run answers
-- What the person wrote or chose at each step, kept so a run survives a
-- closed tab, a lost signal and a fortnight. Resuming a half finished
-- run is not a convenience feature in this product.
--
-- WHAT IS NOT STORED HERE
--
-- The suggested wording from a playbook is never written into this
-- table, and never leaves the browser. It exists to get somebody past
-- the first fifteen seconds of a phone call, and a record of which
-- opening line a person needed in order to ring their energy supplier is
-- not something this product should be holding. Only what the user
-- typed or chose themselves is stored.
create table if not exists public.als_run_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  run_id uuid not null references public.als_runs(id) on delete cascade,
  step_key text not null,
  answer text,
  skipped boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, step_key)
);

commit;
