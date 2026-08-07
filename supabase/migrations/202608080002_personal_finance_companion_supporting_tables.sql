-- Personal Finance Companion: import sessions, extraction candidates,
-- confirmation events, and the Companion setup-state table. Additive only.
-- See docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md.

-- ---------------------------------------------------------------------------
-- import_sessions: one row per upload or paste (CSV, pasted notes, or a
-- text file). Referenced by extraction_candidates and, loosely, by the
-- import_session_id column on each of the seven record tables (which
-- import/paste created or last touched this confirmed row).
-- ---------------------------------------------------------------------------
create table if not exists public.pfc_import_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  input_type text not null check (input_type in ('csv', 'pastedNotes', 'textFile', 'manual')),
  file_storage_path text,
  file_original_name text,
  file_size_bytes bigint,
  file_mime_type text,
  processing_status text not null default 'uploaded'
    check (processing_status in ('uploaded', 'parsing', 'extracting', 'readyForReview', 'completed', 'failed')),
  error_state text,
  deletion_state text not null default 'retained' check (deletion_state in ('retained', 'scheduledForDeletion', 'deleted')),
  detected_mapping jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pfc_import_sessions_user_id_idx on public.pfc_import_sessions (user_id);
create index if not exists pfc_import_sessions_instance_idx on public.pfc_import_sessions (product_instance_id);

alter table public.pfc_import_sessions enable row level security;
drop policy if exists "Users can view their own PFC import sessions" on public.pfc_import_sessions;
create policy "Users can view their own PFC import sessions"
on public.pfc_import_sessions for select to authenticated using (auth.uid() = user_id);

-- Now that import_sessions exists, add the FK from each of the seven
-- record tables' import_session_id column (created nullable, unconstrained,
-- in the prior migration specifically to allow this ordering).
alter table public.pfc_accounts
  add constraint pfc_accounts_import_session_fkey
  foreign key (import_session_id) references public.pfc_import_sessions(id) on delete set null;
alter table public.pfc_income_sources
  add constraint pfc_income_sources_import_session_fkey
  foreign key (import_session_id) references public.pfc_import_sessions(id) on delete set null;
alter table public.pfc_bills
  add constraint pfc_bills_import_session_fkey
  foreign key (import_session_id) references public.pfc_import_sessions(id) on delete set null;
alter table public.pfc_subscriptions
  add constraint pfc_subscriptions_import_session_fkey
  foreign key (import_session_id) references public.pfc_import_sessions(id) on delete set null;
alter table public.pfc_transactions
  add constraint pfc_transactions_import_session_fkey
  foreign key (import_session_id) references public.pfc_import_sessions(id) on delete set null;
alter table public.pfc_debts
  add constraint pfc_debts_import_session_fkey
  foreign key (import_session_id) references public.pfc_import_sessions(id) on delete set null;
alter table public.pfc_savings_goals
  add constraint pfc_savings_goals_import_session_fkey
  foreign key (import_session_id) references public.pfc_import_sessions(id) on delete set null;

-- ---------------------------------------------------------------------------
-- extraction_candidates: AI/CSV-produced candidates awaiting review, per
-- the launch spec's ExtractionCandidate/ReviewableCandidate interfaces
-- (section 20). Lives apart from the operational tables above — nothing
-- here is a confirmed financial record. payload is JSON (still
-- provisional, per spec section 21); review_status and duplicate_status
-- are real columns since Screen 5 filters and sorts on them.
-- ---------------------------------------------------------------------------
create table if not exists public.pfc_extraction_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  import_session_id uuid not null references public.pfc_import_sessions(id) on delete cascade,
  candidate_type text not null
    check (candidate_type in ('account', 'income', 'bill', 'subscription', 'transaction', 'debt', 'savingsGoal', 'unsupported')),
  payload jsonb not null default '{}'::jsonb,
  confidence text not null default 'medium' check (confidence in ('high', 'medium', 'low')),
  missing_fields text[] not null default '{}',
  ambiguity_notes text[] not null default '{}',
  source_reference text,
  duplicate_status text not null default 'none'
    check (duplicate_status in ('none', 'exactDuplicate', 'likelyDuplicate', 'possibleDuplicate', 'transferPair', 'refundMatch')),
  duplicate_of_id uuid references public.pfc_extraction_candidates(id) on delete set null,
  review_status text not null default 'unreviewed' check (review_status in ('unreviewed', 'confirmed', 'corrected', 'skipped')),
  confirmed_record_type text,
  confirmed_record_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pfc_extraction_candidates_user_id_idx on public.pfc_extraction_candidates (user_id);
create index if not exists pfc_extraction_candidates_session_idx on public.pfc_extraction_candidates (import_session_id);
create index if not exists pfc_extraction_candidates_review_status_idx on public.pfc_extraction_candidates (review_status);

alter table public.pfc_extraction_candidates enable row level security;
drop policy if exists "Users can view their own PFC extraction candidates" on public.pfc_extraction_candidates;
create policy "Users can view their own PFC extraction candidates"
on public.pfc_extraction_candidates for select to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- confirmation_events: append only. Powers both a lightweight audit trail
-- and the light History/activity view (launch spec section 14) without a
-- dedicated audit product. Never updated after insert.
-- ---------------------------------------------------------------------------
create table if not exists public.pfc_confirmation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  candidate_id uuid references public.pfc_extraction_candidates(id) on delete set null,
  record_type text not null,
  record_id uuid not null,
  action text not null check (action in ('confirm', 'correct', 'skip', 'merge', 'archive')),
  previous_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pfc_confirmation_events_user_id_idx on public.pfc_confirmation_events (user_id);
create index if not exists pfc_confirmation_events_instance_idx on public.pfc_confirmation_events (product_instance_id);
create index if not exists pfc_confirmation_events_record_idx on public.pfc_confirmation_events (record_type, record_id);

alter table public.pfc_confirmation_events enable row level security;
drop policy if exists "Users can view their own PFC confirmation events" on public.pfc_confirmation_events;
create policy "Users can view their own PFC confirmation events"
on public.pfc_confirmation_events for select to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- pfc_setup_state: the Companion guided-setup flow's own resumable state —
-- current screen, selected input path, per-area setup progress, orientation
-- seen/skipped, draft-in-progress candidate-review position. This is
-- deliberately NOT a financial record and holds no duplicate copy of any
-- account/bill/etc — it only tracks where the user is in the guided flow
-- itself. Shape mirrors monthly_money_reset_states exactly (JSONB blob +
-- schema_version + optimistic-concurrency revision), since that pattern is
-- correct for single-user session/flow state the same way it's wrong for
-- the seven record types above (see the prior migration's header comment).
-- ---------------------------------------------------------------------------
create table if not exists public.pfc_setup_state (
  id uuid primary key default gen_random_uuid(),
  product_instance_id uuid not null unique references public.product_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  schema_version integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pfc_setup_state_user_id_idx on public.pfc_setup_state (user_id);

alter table public.pfc_setup_state enable row level security;
drop policy if exists "Users can view their own PFC setup state" on public.pfc_setup_state;
create policy "Users can view their own PFC setup state"
on public.pfc_setup_state for select to authenticated using (auth.uid() = user_id);
