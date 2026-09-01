-- Personal Finance Companion: notification preference architecture.
-- Additive only. Stage C of the launch specification — see
-- docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md's "Notification
-- readiness" section for why no push-sending platform exists yet: this
-- table is the product-level preference/consent record a future real
-- platform would read from, not a queue or a subscription table. Nothing
-- here sends anything.
--
-- One row per product instance (never per financial record — preferences
-- are a product-level setting, not something to duplicate per bill). Direct
-- RLS insert/update (no RPC): this is a settings form a user fills out
-- deliberately, not a high-frequency autosave with concurrent-edit risk
-- the way pfc_setup_state is, so the simpler pattern from
-- 202608080003_personal_finance_companion_write_access.sql applies, not
-- the optimistic-concurrency RPC pattern.
--
-- Wrapped in an explicit transaction — see 202608080001's identical note.

begin;

create table if not exists public.pfc_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  product_instance_id uuid not null unique references public.product_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Per-category booleans, keyed by NotificationCategory (validated at
  -- read/write sites via the TypeScript type in notificationPreferences.ts,
  -- not by this column's shape — a Zod-validated record, same reasoning as
  -- pfc_setup_state.state's areaProgress field).
  categories jsonb not null default '{}'::jsonb,
  privacy_level text not null default 'private' check (privacy_level in ('private', 'normal', 'detailed')),
  review_rhythm text not null default 'off' check (review_rhythm in ('weekly', 'biweekly', 'monthly', 'off')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pfc_notification_preferences_user_id_idx on public.pfc_notification_preferences (user_id);

alter table public.pfc_notification_preferences enable row level security;

drop policy if exists "Users can view their own PFC notification preferences" on public.pfc_notification_preferences;
create policy "Users can view their own PFC notification preferences"
on public.pfc_notification_preferences for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own PFC notification preferences" on public.pfc_notification_preferences;
create policy "Users can insert their own PFC notification preferences"
on public.pfc_notification_preferences for insert to authenticated
with check (auth.uid() = user_id and public._pfc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own PFC notification preferences" on public.pfc_notification_preferences;
create policy "Users can update their own PFC notification preferences"
on public.pfc_notification_preferences for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
