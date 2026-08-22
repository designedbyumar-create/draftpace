-- Homeschooling Companion: checks.
--
-- Phase 5. Four tables, and between them they hold the only thing in
-- this product that could ever be mistaken for a judgement about a
-- child. So they are built so that it cannot be.
--
-- THERE IS NO SCORE COLUMN, ANYWHERE.
--
-- Not on the check, not on the result. A check stores which questions
-- were asked, what the parent marked, and a per topic standing that is
-- one of four words. A total would be a grade, a grade invites
-- comparison, and comparison is the thing a homeschooling parent is
-- already anxious about. If a future contributor wants a number here,
-- the answer is no, and this comment is why.
--
-- "not-enough-to-say" IS A REAL STORED STANDING.
--
-- A topic with three answers behind it gets that and nothing else,
-- whatever those answers were. It is recorded rather than omitted so
-- that history shows the product was asked and honestly declined, which
-- is a different thing from never having looked.
--
-- Answers are marked by the parent. A short answer question about a
-- nine year old's reasoning cannot be scored by string comparison, and
-- pretending otherwise would produce exactly the false precision the
-- rest of this file exists to prevent.

begin;

create table if not exists public.hsc_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  child_id uuid not null references public.hsc_children(id) on delete cascade,
  -- What the parent asked for. Kept because "recent learning" in March
  -- meant something different from "recent learning" in June.
  scope text not null check (scope in ('recent', 'topic', 'earlier')),
  topic_keys text[] not null default '{}',
  -- Reproducibility: the same child, topics and seed assemble the same
  -- check. Stored so a check can be explained after the fact.
  seed text not null,
  state text not null default 'open' check (state in ('open', 'finished', 'abandoned')),
  visibility text not null default 'private' check (visibility in ('private', 'shareable')),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.hsc_check_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  check_id uuid not null references public.hsc_checks(id) on delete cascade,
  item_id uuid references public.hsc_items(id) on delete set null,
  topic_key text not null,
  ordinal integer not null default 0,
  -- Snapshotted, like everything else in this product that a record
  -- depends on. A question edited in June must not rewrite what was
  -- actually asked in March.
  prompt text not null,
  expected_answer text,
  created_at timestamptz not null default now(),
  unique (check_id, ordinal)
);

create table if not exists public.hsc_check_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  check_id uuid not null references public.hsc_checks(id) on delete cascade,
  check_item_id uuid not null references public.hsc_check_items(id) on delete cascade,
  topic_key text not null,
  -- What the child said, if the parent wrote it down. Optional, always.
  response text,
  -- Marked by the parent, who is the only one in a position to.
  mark text not null check (mark in ('right', 'not-right', 'skipped')),
  created_at timestamptz not null default now(),
  unique (check_id, check_item_id)
);

create table if not exists public.hsc_check_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  check_id uuid not null references public.hsc_checks(id) on delete cascade,
  child_id uuid not null references public.hsc_children(id) on delete cascade,
  topic_key text not null,
  standing text not null check (
    standing in ('looked-solid', 'mixed', 'worth-another-look', 'not-enough-to-say')
  ),
  -- Counts, not a score. How much evidence there was, so a reader can
  -- see why the product said what it said.
  answered integer not null default 0,
  right_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (check_id, topic_key)
);

create index if not exists hsc_checks_child_idx on public.hsc_checks (child_id, created_at desc);
create index if not exists hsc_check_items_check_idx on public.hsc_check_items (check_id, ordinal);
create index if not exists hsc_check_answers_check_idx on public.hsc_check_answers (check_id);
create index if not exists hsc_check_results_child_topic_idx
  on public.hsc_check_results (child_id, topic_key, created_at desc);

alter table public.hsc_checks enable row level security;
alter table public.hsc_check_items enable row level security;
alter table public.hsc_check_answers enable row level security;
alter table public.hsc_check_results enable row level security;

do $$
declare t text;
begin
  foreach t in array array['hsc_checks', 'hsc_check_items', 'hsc_check_answers', 'hsc_check_results'] loop
    execute format('drop policy if exists "hsc select %1$s" on public.%1$I', t);
    execute format('create policy "hsc select %1$s" on public.%1$I for select to authenticated using (auth.uid() = user_id)', t);
    execute format('drop policy if exists "hsc insert %1$s" on public.%1$I', t);
    execute format('create policy "hsc insert %1$s" on public.%1$I for insert to authenticated with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id))', t);
    execute format('drop policy if exists "hsc update %1$s" on public.%1$I', t);
    execute format('create policy "hsc update %1$s" on public.%1$I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

commit;
