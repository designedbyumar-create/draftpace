-- Personal Finance Companion: the seven canonical financial record tables.
-- Additive only — no existing table is touched. See
-- docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md for the full
-- design and the reconciliation against Monthly Money Reset's schema.
--
-- Single source of truth rule (non-negotiable, see the launch spec's
-- section 10): there is exactly one row per financial fact. Companion's
-- guided setup and each record's own direct-section screen both read and
-- write these exact tables through the exact same service functions
-- (src/products/personal-finance-companion/domain/*.ts) — there is no
-- separate "Companion copy" anywhere in this schema.
--
-- Deliberately NOT modeled as one JSONB blob per user (Monthly Money
-- Reset's pattern for its own small, single-screen state). These seven
-- record types are independently queryable, filterable, and potentially
-- numerous (CSV import alone can add hundreds of transactions per user),
-- which a single JSON blob does not scale to or allow RLS/indexing on
-- individual rows for. Normalized tables, one per record type, matches
-- the launch specification's own section 21 proposal.
--
-- Mutation model, matching Monthly Money Reset's established convention:
-- `authenticated` is granted select only on every table below. Every
-- insert/update/archive goes through the security definer functions in
-- 202608080003_personal_finance_companion_domain_functions.sql, which
-- independently verify auth.uid() ownership — RLS is not the only gate,
-- consistent with save_monthly_money_reset_state's defense-in-depth
-- pattern.
--
-- Lifecycle and provenance columns are identical in shape across all
-- seven tables (see interface RecordLifecycle / RecordProvenance in the
-- launch specification section 20): `status`, `needs_review_reason`,
-- `source`, `import_session_id`. Money is bigint minor units throughout,
-- matching Monthly Money Reset's `*_cents` convention exactly (see
-- src/products/monthly-money-reset/currency.ts).

-- ---------------------------------------------------------------------------
-- Shared lifecycle/provenance shape, spelled out per table rather than via
-- inheritance (Postgres table inheritance interacts poorly with RLS policy
-- inheritance and is not used elsewhere in this repository) — each CREATE
-- TABLE below repeats the same four columns verbatim by convention, not by
-- a shared parent table.
--
--   status                text not null default 'draft'
--                          check (status in ('draft','confirmedIncomplete','ready','needsReview','archived'))
--   needs_review_reason    text
--   source                 text not null default 'manual'
--                          check (source in ('manual','pastedNotes','textFile','csvImport','futureBankImport'))
--   import_session_id      uuid references public.import_sessions(id) on delete set null
--
-- import_sessions is created in 202608080002, after these tables, since a
-- CSV/notes import session references *these* tables' rows only loosely
-- (via extraction_candidates, not a direct FK) — the FK direction here is
-- record -> import_session (which import created/last-touched this row),
-- not the reverse, so import_sessions must exist before these tables'
-- FK can be added. To avoid a forward-reference ordering problem, the
-- import_session_id FK constraint is added in 202608080002 via ALTER TABLE
-- once import_sessions exists, not inline here.

create table if not exists public.pfc_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'cash', 'digitalWallet', 'other')),
  current_balance_minor bigint not null default 0,
  currency text not null default 'USD',
  available_for_spending boolean not null default true,
  balance_as_of_date date not null default current_date,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'confirmedIncomplete', 'ready', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport', 'futureBankImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pfc_income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  amount_minor bigint,
  amount_range_min_minor bigint,
  amount_range_max_minor bigint,
  frequency text not null check (frequency in ('weekly', 'biweekly', 'semiMonthly', 'monthly', 'irregular')),
  next_expected_date date,
  confidence text not null default 'estimated' check (confidence in ('confirmed', 'estimated')),
  gross_or_net text not null default 'unknown' check (gross_or_net in ('gross', 'net', 'unknown')),
  currency text not null default 'USD',
  status text not null default 'draft' check (status in ('draft', 'confirmedIncomplete', 'ready', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport', 'futureBankImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_minor is not null or (amount_range_min_minor is not null and amount_range_max_minor is not null))
);

create table if not exists public.pfc_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  category text not null default 'other',
  amount_minor bigint,
  amount_range_min_minor bigint,
  amount_range_max_minor bigint,
  is_variable boolean not null default false,
  due_rule jsonb not null default '{}'::jsonb,
  frequency text not null default 'monthly' check (frequency in ('monthly', 'quarterly', 'annual', 'custom')),
  essential boolean not null default true,
  funded boolean not null default false,
  currency text not null default 'USD',
  status text not null default 'draft' check (status in ('draft', 'confirmedIncomplete', 'ready', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport', 'futureBankImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pfc_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  amount_minor bigint,
  frequency text not null default 'monthly' check (frequency in ('monthly', 'annual', 'custom')),
  renewal_date date,
  decision text not null default 'reviewing' check (decision in ('keep', 'reviewing', 'plannedCancellation', 'cancelled')),
  currency text not null default 'USD',
  status text not null default 'draft' check (status in ('draft', 'confirmedIncomplete', 'ready', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport', 'futureBankImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transactions mostly skip draft/confirmedIncomplete (launch spec section
-- 10) but keep the same five-value status column for consistency across
-- all seven tables and to represent needsReview (unresolved duplicate or
-- transfer flag) and archived (excluded from spending, kept visible).
create table if not exists public.pfc_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  account_id uuid not null references public.pfc_accounts(id) on delete cascade,
  occurred_on date not null,
  description text not null,
  amount_minor bigint not null,
  direction text not null check (direction in ('debit', 'credit')),
  currency text not null default 'USD',
  category text,
  pending_or_cleared text not null default 'cleared' check (pending_or_cleared in ('pending', 'cleared')),
  external_id text,
  transfer_pair_id uuid references public.pfc_transactions(id) on delete set null,
  excluded_from_spending boolean not null default false,
  status text not null default 'ready' check (status in ('draft', 'confirmedIncomplete', 'ready', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport', 'futureBankImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pfc_debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  type text not null check (type in ('creditCard', 'personalLoan', 'studentLoan', 'autoLoan', 'mortgage', 'other')),
  balance_minor bigint not null,
  currency text not null default 'USD',
  interest_rate numeric(6, 3),
  minimum_payment_minor bigint not null default 0,
  due_date date,
  promotional_rate numeric(6, 3),
  promotional_expiry date,
  balance_as_of_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'confirmedIncomplete', 'ready', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport', 'futureBankImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pfc_savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  name text not null,
  type text not null default 'generalGoal' check (type in ('emergencyFund', 'generalGoal', 'sinkingFund')),
  target_amount_minor bigint not null,
  saved_amount_minor bigint not null default 0,
  target_date date,
  recurring boolean not null default false,
  currency text not null default 'USD',
  status text not null default 'draft' check (status in ('draft', 'confirmedIncomplete', 'ready', 'needsReview', 'archived')),
  needs_review_reason text,
  source text not null default 'manual' check (source in ('manual', 'pastedNotes', 'textFile', 'csvImport', 'futureBankImport')),
  import_session_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes: every table by user_id (matching Monthly Money Reset's
-- entitlements_user_id_idx-style convention), plus the specific lookups
-- each direct section and Workspace calculation will actually run.
-- ---------------------------------------------------------------------------
create index if not exists pfc_accounts_user_id_idx on public.pfc_accounts (user_id);
create index if not exists pfc_accounts_instance_idx on public.pfc_accounts (product_instance_id);

create index if not exists pfc_income_sources_user_id_idx on public.pfc_income_sources (user_id);
create index if not exists pfc_income_sources_instance_idx on public.pfc_income_sources (product_instance_id);

create index if not exists pfc_bills_user_id_idx on public.pfc_bills (user_id);
create index if not exists pfc_bills_instance_idx on public.pfc_bills (product_instance_id);

create index if not exists pfc_subscriptions_user_id_idx on public.pfc_subscriptions (user_id);
create index if not exists pfc_subscriptions_instance_idx on public.pfc_subscriptions (product_instance_id);

create index if not exists pfc_transactions_user_id_idx on public.pfc_transactions (user_id);
create index if not exists pfc_transactions_instance_idx on public.pfc_transactions (product_instance_id);
create index if not exists pfc_transactions_account_idx on public.pfc_transactions (account_id);
create index if not exists pfc_transactions_occurred_on_idx on public.pfc_transactions (occurred_on);

create index if not exists pfc_debts_user_id_idx on public.pfc_debts (user_id);
create index if not exists pfc_debts_instance_idx on public.pfc_debts (product_instance_id);

create index if not exists pfc_savings_goals_user_id_idx on public.pfc_savings_goals (user_id);
create index if not exists pfc_savings_goals_instance_idx on public.pfc_savings_goals (product_instance_id);

-- ---------------------------------------------------------------------------
-- RLS: identical pattern to every existing table in this project —
-- auth.uid() = user_id directly, no wrapping helper function. Select-only
-- for authenticated; every write goes through a security definer function
-- (next migration) that re-verifies ownership independently of RLS.
-- ---------------------------------------------------------------------------
alter table public.pfc_accounts enable row level security;
drop policy if exists "Users can view their own PFC accounts" on public.pfc_accounts;
create policy "Users can view their own PFC accounts"
on public.pfc_accounts for select to authenticated using (auth.uid() = user_id);

alter table public.pfc_income_sources enable row level security;
drop policy if exists "Users can view their own PFC income sources" on public.pfc_income_sources;
create policy "Users can view their own PFC income sources"
on public.pfc_income_sources for select to authenticated using (auth.uid() = user_id);

alter table public.pfc_bills enable row level security;
drop policy if exists "Users can view their own PFC bills" on public.pfc_bills;
create policy "Users can view their own PFC bills"
on public.pfc_bills for select to authenticated using (auth.uid() = user_id);

alter table public.pfc_subscriptions enable row level security;
drop policy if exists "Users can view their own PFC subscriptions" on public.pfc_subscriptions;
create policy "Users can view their own PFC subscriptions"
on public.pfc_subscriptions for select to authenticated using (auth.uid() = user_id);

alter table public.pfc_transactions enable row level security;
drop policy if exists "Users can view their own PFC transactions" on public.pfc_transactions;
create policy "Users can view their own PFC transactions"
on public.pfc_transactions for select to authenticated using (auth.uid() = user_id);

alter table public.pfc_debts enable row level security;
drop policy if exists "Users can view their own PFC debts" on public.pfc_debts;
create policy "Users can view their own PFC debts"
on public.pfc_debts for select to authenticated using (auth.uid() = user_id);

alter table public.pfc_savings_goals enable row level security;
drop policy if exists "Users can view their own PFC savings goals" on public.pfc_savings_goals;
create policy "Users can view their own PFC savings goals"
on public.pfc_savings_goals for select to authenticated using (auth.uid() = user_id);
