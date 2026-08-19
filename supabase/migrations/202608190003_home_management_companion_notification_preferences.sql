-- Home Base: notification preference architecture. Additive only.
-- Mirrors PFC's identical pfc_notification_preferences table
-- (202608080004) - a preference/consent record, not a queue or a
-- subscription table, nothing here sends anything yet. One row per
-- product instance, direct RLS insert/update (a deliberate settings-form
-- save, not a high-frequency autosave), same pattern as the records
-- migration's write policies.

begin;

create table if not exists public.hmc_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  product_instance_id uuid not null unique references public.product_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Per-category booleans, keyed by NotificationCategory (validated at
  -- read/write sites via notificationPreferences.ts's TypeScript type).
  categories jsonb not null default '{}'::jsonb,
  privacy_level text not null default 'private' check (privacy_level in ('private', 'normal', 'detailed')),
  -- Included from the start (unlike PFC's own table, which added this in a
  -- follow-up migration once its reminder engine existed) - IANA zone name,
  -- never a raw UTC offset, so a future reminder evaluator doesn't send at
  -- the wrong local hour across a DST boundary.
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hmc_notification_preferences_user_id_idx on public.hmc_notification_preferences (user_id);

alter table public.hmc_notification_preferences enable row level security;

drop policy if exists "Users can view their own Home Base notification preferences" on public.hmc_notification_preferences;
create policy "Users can view their own Home Base notification preferences"
on public.hmc_notification_preferences for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own Home Base notification preferences" on public.hmc_notification_preferences;
create policy "Users can insert their own Home Base notification preferences"
on public.hmc_notification_preferences for insert to authenticated
with check (auth.uid() = user_id and public._hmc_owns_instance(product_instance_id));

drop policy if exists "Users can update their own Home Base notification preferences" on public.hmc_notification_preferences;
create policy "Users can update their own Home Base notification preferences"
on public.hmc_notification_preferences for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
