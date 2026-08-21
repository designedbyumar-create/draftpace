-- In Order: the Life Affairs Map.
--
-- WHY THIS MIGRATION EXISTS
--
-- The product shipped recording that a step was DONE. It never recorded
-- WHAT the person answered. pla_items was created for exactly that and
-- had zero writes and zero reads. A document promising "everything the
-- people you love would need to find" printed an instruction and a date
-- and contained nothing findable.
--
-- This migration makes pla_items the source of truth. pla_steps is
-- demoted to what it always actually was: a log of interactions, plus
-- the home for action steps that happen outside the product.
--
-- THE SHAPE OF A RECORD
--
-- Five reserved columns (label, whereabouts, person_name, person_contact,
-- notes) carry the fields every kind of record needs and that anything
-- else may want to query. Everything kind-specific goes in `fields`,
-- validated per kind in TypeScript rather than by a DB constraint. This
-- is the same open-string discipline as hmc_things.type and
-- ProductFamilyId: a new kind of affair must never require a migration.
--
-- WHAT IS DERIVED AND NOT STORED
--
-- next_review_at is stored, because it is a date the app computes once
-- and may later want to query. "Needs review" is NOT stored: it is
-- next_review_at <= now, evaluated fresh every read. A stored review
-- flag would need a job to flip it, and the day that job failed the
-- product would quietly tell somebody their affairs were current when
-- they were not. The whole claim of this product is currency, so the
-- currency check is never allowed to go stale itself.
--
-- STILL NOT A VAULT. pla_items records what exists, where it is, who
-- knows about it, and what someone should do. Never a credential, never
-- an account number, never an uploaded document.

begin;

-- ------------------------------------------------------------- pla_items
alter table public.pla_items add column if not exists area text;
alter table public.pla_items add column if not exists origin_step_key text;
alter table public.pla_items add column if not exists fields jsonb not null default '{}'::jsonb;
alter table public.pla_items add column if not exists established_at timestamptz;
alter table public.pla_items add column if not exists last_confirmed_at timestamptz;
alter table public.pla_items add column if not exists review_interval_months integer;
alter table public.pla_items add column if not exists next_review_at timestamptz;

-- The original check allowed only active/archived, which cannot express
-- a record the person started and did not finish, or one they decided
-- does not apply. Both are real answers and the document has to be able
-- to print them honestly.
update public.pla_items set status = 'established' where status = 'active';

alter table public.pla_items drop constraint if exists pla_items_status_check;
alter table public.pla_items add constraint pla_items_status_check
  check (status in ('established', 'incomplete', 'notApplicable', 'archived'));
alter table public.pla_items alter column status set default 'established';

-- ------------------------------------------------------------- pla_steps
-- "I'm not sure" is a real answer and is not the same as no. It leaves a
-- genuine unresolved state that the product may return to later, without
-- nagging and without being counted as a refusal.
alter table public.pla_steps drop constraint if exists pla_steps_state_check;
alter table public.pla_steps add constraint pla_steps_state_check
  check (state in ('pending', 'confirmed', 'notRelevant', 'open', 'unsure'));

-- Every confirmation recorded before this migration is a date with no
-- answer behind it. Marking them is what lets the product be honest
-- about them rather than either deleting somebody's history or printing
-- an empty entry as though it were knowledge.
alter table public.pla_steps add column if not exists legacy_confirmation boolean not null default false;
update public.pla_steps set legacy_confirmation = true where state = 'confirmed';

-- -------------------------------------------------------- pla_item_links
-- Relationships between records: the home insurance is FOR the house,
-- the solicitor KNOWS ABOUT the will, the guardian IS RESPONSIBLE FOR
-- the child. Stored as a graph rather than denormalised onto each row,
-- because the same person is attached to several things and a copy of
-- their phone number in five places goes wrong in five places.
create table if not exists public.pla_item_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  from_item_id uuid not null references public.pla_items(id) on delete cascade,
  to_item_id uuid not null references public.pla_items(id) on delete cascade,
  relation text not null check (relation ~ '^[a-z][a-z0-9-]*$'),
  created_at timestamptz not null default now(),
  unique (from_item_id, to_item_id, relation)
);

-- ---------------------------------------------------- pla_item_revisions
-- What changed, and when. The review loop asks whether something is
-- still true; when the answer is no, the product has to be able to say
-- what it used to be. A single updated_at cannot do that.
--
-- snapshot holds the record as it was AFTER this change, so replaying
-- the rows forward reconstructs the record at any past date. Rows are
-- append only and there is no update or delete policy on this table.
create table if not exists public.pla_item_revisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  item_id uuid not null references public.pla_items(id) on delete cascade,
  change_kind text not null check (change_kind in ('established', 'updated', 'confirmed', 'markedNotApplicable', 'archived')),
  summary text,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pla_items_step_idx on public.pla_items (product_instance_id, origin_step_key);
create index if not exists pla_items_review_idx on public.pla_items (product_instance_id, next_review_at);
create index if not exists pla_item_links_from_idx on public.pla_item_links (from_item_id);
create index if not exists pla_item_links_to_idx on public.pla_item_links (to_item_id);
create index if not exists pla_item_revisions_item_idx on public.pla_item_revisions (item_id, created_at desc);

commit;
