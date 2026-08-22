-- Homeschooling Companion: what a child is working on, and the family's
-- own questions.
--
-- Phase 4. Two tables, and they are the socket the check plugs into.
--
-- hsc_child_topics: what this child is covering right now, per subject,
-- against the taxonomy that lives in code. This is the one hinge that
-- makes a check possible without parsing a document: the parent ticks
-- what they are actually doing, once, in about five seconds, and that
-- replaces an entire ingestion pipeline.
--
-- It is a table rather than a column on hsc_curriculum_nodes because a
-- family building their own plan has no nodes, and their child is no
-- less busy for it. All three modes land here.
--
-- hsc_items: the family's own question bank.
--
-- The Companion does not supply questions in v1 and may never supply
-- them for most subjects. It supplies the structure around a check: the
-- taxonomy, the recording, the confidence floor, and the interpretation.
-- Questions come from the parent, from the curriculum they already own,
-- or later from a subject pack, and all three land in this table against
-- the same topic keys so one history spans them.
--
-- A question a parent writes is their data, which is why it is a row and
-- not code. The taxonomy is the opposite: identical for everybody, in
-- code, reviewable in a pull request.
--
-- pack_id is present and unused. It is the whole of the future subject
-- product integration: a pack's questions arrive as rows carrying one,
-- filtered by what the family is entitled to, and nothing else about the
-- Companion changes. Build the socket now, and the plug fits later.

begin;

create table if not exists public.hsc_child_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  child_id uuid not null references public.hsc_children(id) on delete cascade,
  subject text not null,
  -- Into the taxonomy in code. Validated in shape only: the taxonomy can
  -- gain topics without a migration, and a key it no longer knows is
  -- dropped on read rather than guessed at.
  topic_key text not null check (topic_key ~ '^[a-z][a-z0-9.-]*$'),
  -- "current" is what the child is on now; "covered" is what they have
  -- moved past. Both are checkable, and the difference is what lets a
  -- parent ask about recent learning or about earlier work.
  --
  -- "removed" is how a tick is taken back. This product has no delete
  -- policy on any table, deliberately, because it holds a child's
  -- educational record and a record one mis-tap from gone is not a
  -- record. A topic tag is part of that record: the printed Book says
  -- what was covered. So unticking sets this instead of deleting, and
  -- the row stops being read everywhere.
  state text not null default 'current' check (state in ('current', 'covered', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, topic_key)
);

create table if not exists public.hsc_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  -- Nullable on purpose: a question about equivalent fractions is worth
  -- reusing for a second child, and a family should not have to type it
  -- twice.
  child_id uuid references public.hsc_children(id) on delete set null,
  topic_key text not null check (topic_key ~ '^[a-z][a-z0-9.-]*$'),
  -- Where this question came from. Shown on every check, every time, so
  -- a parent never has to wonder whether the product wrote it.
  source text not null check (source in ('parent', 'curriculum', 'pack')),
  -- Set only on a pack question. The entitlement filter, and nothing
  -- else, decides whether a family sees it.
  pack_id text,
  kind text not null default 'short-answer'
    check (kind in ('short-answer', 'multiple-choice', 'true-false', 'numeric', 'parent-scored')),
  prompt text not null,
  -- Null for a parent-scored question, where the parent decides whether
  -- the answer was right. Not every useful question has a key.
  expected_answer text,
  choices jsonb,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hsc_child_topics_child_idx on public.hsc_child_topics (child_id, state);
create index if not exists hsc_items_topic_idx on public.hsc_items (product_instance_id, topic_key, status);

alter table public.hsc_child_topics enable row level security;
alter table public.hsc_items enable row level security;

do $$
declare t text;
begin
  foreach t in array array['hsc_child_topics', 'hsc_items'] loop
    execute format('drop policy if exists "hsc select %1$s" on public.%1$I', t);
    execute format('create policy "hsc select %1$s" on public.%1$I for select to authenticated using (auth.uid() = user_id)', t);
    execute format('drop policy if exists "hsc insert %1$s" on public.%1$I', t);
    execute format('create policy "hsc insert %1$s" on public.%1$I for insert to authenticated with check (auth.uid() = user_id and public._hsc_owns_instance(product_instance_id))', t);
    execute format('drop policy if exists "hsc update %1$s" on public.%1$I', t);
    execute format('create policy "hsc update %1$s" on public.%1$I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

commit;
