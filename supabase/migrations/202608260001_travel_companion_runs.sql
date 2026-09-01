-- Travel Companion: Companion Mode runs and their answers.
--
-- Phase 3 of the approved proposal
-- (docs/products/TRAVEL-COMPANION-PROPOSAL.md): the shared engine
-- (src/components/product-shell/companion/) proven with one real
-- situation end to end, resume included from the start rather than
-- fixed afterward. Alongside's own build found that mistake live; this
-- product does not repeat it.
--
-- Same shape as als_runs / als_run_answers, deliberately: a run belongs
-- to a booking (nullable, since a run started with nothing behind it
-- from the front door is a first class path here too), and answers are
-- append-only per step, one row per step key.

begin;

create table if not exists public.trv_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  booking_id uuid references public.trv_bookings(id) on delete set null,
  playbook_key text not null,
  -- Snapshotted, so a run opened today still reads correctly after the
  -- playbook is retitled or retired.
  playbook_title text not null,
  outcome text check (
    outcome is null or outcome in ('resolved', 'progress', 'waiting', 'next-step', 'not-yet', 'other')
  ),
  outcome_detail text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  -- "left" is resumable too, same as Alongside's own: leaving mid-run is
  -- not failure, and must not become unresumable as a side effect of
  -- being recorded honestly.
  status text not null default 'open' check (status in ('open', 'finished', 'left')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trv_runs_booking_idx
  on public.trv_runs (booking_id, started_at desc);

create table if not exists public.trv_run_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  run_id uuid not null references public.trv_runs(id) on delete cascade,
  step_key text not null,
  answer text,
  skipped boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, step_key)
);

commit;
