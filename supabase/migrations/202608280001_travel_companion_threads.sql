-- Travel Companion: threads, the "waiting on someone" state, and the
-- append-only log of what happened to each one.
--
-- Phase 6 of the approved proposal (§13's "outcome can open a thread",
-- §11's "Waiting" section of Today, §16's Record model). Additive only.
--
-- WHY A THREAD IS ITS OWN TABLE, NOT A BOOKING STATUS
--
-- A booking already has booking_status ('confirmed' | 'waiting' |
-- 'cancelled'); a thread is not a fourth status value bolted onto that
-- enum, it is the actual object being waited on ("Hotel has not
-- confirmed late arrival"), with its own title, who's involved, and an
-- optional user-chosen expected-by date. A booking can be 'waiting'
-- because of exactly one open thread; the thread is what Today's own
-- Waiting section reads, and the booking's status is a one-word summary
-- of it, kept in sync by the outcome layer, not duplicated logic.
--
-- expected_by IS USER-CHOSEN ONLY
--
-- Never invented, never defaulted to "in 3 days" or any other guess.
-- Nullable, and left null unless someone actually said when they expect
-- to hear back, per the platform-wide rule against invented urgency.
--
-- trv_thread_events MIRRORS als_item_events, DELIBERATELY
--
-- Same reasoning: the line is a snapshot, not something that
-- regenerates when the present changes, so a resolved thread's closing
-- line still reads the way it did the day it was written even if the
-- thread's own title is later edited. Append-only: no update policy, no
-- delete policy, same as als_item_events.

begin;

-- ---------------------------------------------------------------- threads
create table if not exists public.trv_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  trip_id uuid not null references public.trv_trips(id) on delete cascade,
  booking_id uuid references public.trv_bookings(id) on delete set null,
  person_id uuid references public.trv_people(id) on delete set null,
  title text not null,
  who_is_involved text,
  expected_by date,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists trv_threads_trip_idx
  on public.trv_threads (trip_id, status);
create index if not exists trv_threads_booking_idx
  on public.trv_threads (booking_id)
  where booking_id is not null;

-- ---------------------------------------------------------- thread events
create table if not exists public.trv_thread_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  thread_id uuid not null references public.trv_threads(id) on delete cascade,
  -- Nullable: an event can happen without a Companion run behind it,
  -- same as als_item_events.
  run_id uuid,
  line text not null,
  outcome text check (
    outcome is null
    or outcome in ('resolved', 'progress', 'waiting', 'next-step', 'not-yet', 'other')
  ),
  occurred_at timestamptz not null default now()
);

create index if not exists trv_thread_events_thread_idx
  on public.trv_thread_events (thread_id, occurred_at);

commit;
