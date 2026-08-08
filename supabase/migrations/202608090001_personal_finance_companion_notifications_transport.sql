-- Personal Finance Companion: real notification transport foundation.
-- Additive only. Stage F of the launch specification.
--
-- Three new tables plus one column added to the existing (already-applied)
-- pfc_notification_preferences table:
--
--   public.push_subscriptions   — PLATFORM-level, not PFC-prefixed. A
--     browser push subscription belongs to the account, not to one
--     product — the same device registration should be reusable by a
--     future automation/learning product without that product being
--     forced into PFC's tables or terminology (see CLAUDE.md's platform
--     vs. product-instance state boundary). Lives here only because this
--     is the first migration that needs it; ownership is by user_id alone.
--
--   public.pfc_reminders — product + entity scoped, the persistent form of
--     the ReminderMetadata contract already defined in reminders.ts.
--     Unique on (product_instance_id, dedupe_key) so re-deriving
--     date-based reminders from canonical records (bill due dates,
--     subscription renewals, etc.) on every evaluator run is naturally
--     idempotent — an upsert, never a duplicate row.
--
--   public.pfc_notification_deliveries — append-only send ledger. Its
--     unique (user_id, dedupe_key) constraint is the actual mechanism that
--     makes delivery idempotent under concurrent/duplicate cron
--     execution: the evaluator does `insert ... on conflict do nothing
--     returning id` and only calls Web Push if a row was truly inserted.
--     No RLS write policy is granted to `authenticated` — only the
--     service-role client (used exclusively by the server-side cron
--     evaluator, which has no user session to scope RLS against) can
--     write here, so a user can never forge their own "this was
--     delivered" history.
--
-- Wrapped in an explicit transaction — see 202608080001's identical note.

begin;

-- ---------------------------------------------------------------------------
-- push_subscriptions
-- ---------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_success_at timestamptz,
  last_failure_at timestamptz,
  failure_count integer not null default 0,
  revoked_at timestamptz
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users can view their own push subscriptions" on public.push_subscriptions;
create policy "Users can view their own push subscriptions"
on public.push_subscriptions for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own push subscriptions" on public.push_subscriptions;
create policy "Users can insert their own push subscriptions"
on public.push_subscriptions for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users can update their own push subscriptions" on public.push_subscriptions;
create policy "Users can update their own push subscriptions"
on public.push_subscriptions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own push subscriptions" on public.push_subscriptions;
create policy "Users can delete their own push subscriptions"
on public.push_subscriptions for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- pfc_reminders
-- ---------------------------------------------------------------------------
create table if not exists public.pfc_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_instance_id uuid not null references public.product_instances(id) on delete cascade,
  entity_type text check (entity_type in ('accounts', 'income', 'bills', 'subscriptions', 'debt', 'savings', 'transactions')),
  entity_id uuid,
  kind text not null check (kind in (
    'billMissingDetail', 'estimatedIncomeDatePassed', 'balanceStale', 'weeklyReviewDue', 'importNeedsReview',
    'billDue', 'subscriptionRenewal', 'plannedCancellation', 'debtDue', 'promotionalRateExpiry', 'userCreated'
  )),
  source text not null check (source in ('system', 'user')),
  schedule jsonb not null default '{}'::jsonb,
  note text,
  dedupe_key text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'snoozed', 'delivered', 'acknowledged', 'cancelled')),
  next_eligible_at timestamptz not null,
  snoozed_until timestamptz,
  acknowledged_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_instance_id, dedupe_key)
);

create index if not exists pfc_reminders_user_id_idx on public.pfc_reminders (user_id);
create index if not exists pfc_reminders_instance_idx on public.pfc_reminders (product_instance_id);
create index if not exists pfc_reminders_eligible_idx on public.pfc_reminders (status, next_eligible_at);

alter table public.pfc_reminders enable row level security;

drop policy if exists "Users can view their own PFC reminders" on public.pfc_reminders;
create policy "Users can view their own PFC reminders"
on public.pfc_reminders for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own PFC reminders" on public.pfc_reminders;
create policy "Users can insert their own PFC reminders"
on public.pfc_reminders for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));

-- with check also re-validates _pfc_owns_instance on the POST-update row,
-- not just auth.uid() — otherwise a caller could repoint their own
-- reminder's product_instance_id at an instance they don't own. Since
-- visibility everywhere is still gated by user_id first, that couldn't
-- leak data to anyone, but it could collide with the (product_instance_id,
-- dedupe_key) unique constraint the evaluator relies on, aborting a whole
-- batch insert of legitimate system reminders for the real owner of that
-- instance — closed here rather than left as a latent integrity/DoS gap.
drop policy if exists "Users can update their own PFC reminders" on public.pfc_reminders;
create policy "Users can update their own PFC reminders"
on public.pfc_reminders for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));

-- ---------------------------------------------------------------------------
-- pfc_notification_deliveries — append-only, service-role write only.
-- ---------------------------------------------------------------------------
create table if not exists public.pfc_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_ids uuid[] not null default '{}',
  push_subscription_id uuid references public.push_subscriptions(id) on delete set null,
  dedupe_key text not null,
  outcome text not null check (outcome in ('sent', 'failed', 'skipped')),
  failure_reason text,
  delivered_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists pfc_notification_deliveries_user_id_idx on public.pfc_notification_deliveries (user_id);

alter table public.pfc_notification_deliveries enable row level security;

drop policy if exists "Users can view their own PFC notification deliveries" on public.pfc_notification_deliveries;
create policy "Users can view their own PFC notification deliveries"
on public.pfc_notification_deliveries for select to authenticated using (auth.uid() = user_id);

-- Deliberately no insert/update/delete policy for `authenticated` — only
-- the service-role client (server-side cron evaluator) writes here, and
-- service-role bypasses RLS entirely, so no policy is needed for it.

-- ---------------------------------------------------------------------------
-- pfc_notification_preferences: add timezone (product-level mechanism per
-- Stage F — no platform-wide user profile/timezone concept exists yet, and
-- this table is already the one product-level preference row per instance;
-- see 202608080004's own header for why preferences live at this altitude).
-- IANA name (e.g. "America/New_York"), never a raw UTC offset — offsets
-- silently go wrong across a DST boundary, a zone name doesn't.
-- ---------------------------------------------------------------------------
alter table public.pfc_notification_preferences
  add column if not exists timezone text not null default 'UTC';

commit;
