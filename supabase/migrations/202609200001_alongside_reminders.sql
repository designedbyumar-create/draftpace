-- Alongside: reminders, opt-in.
--
-- One row per product instance, and a row only exists once somebody has
-- chosen something on the Settings screen. reminders_enabled defaults to
-- false so nothing is ever sent on a person's behalf that they did not
-- ask for. A reminder is only ever sent for a date the person chose
-- themselves (see reminders.ts); this table holds the choices about
-- *how*, never the dates.
--
-- `notified` is the send-once ledger: a map of "<item id>:<next_at>" to
-- the time it was sent, written by the cron evaluator with the service
-- role and pruned as it goes. Keying on next_at means moving a date
-- earns a fresh reminder, and nothing else does.
--
-- Additive only. No delete policy, like every other als_ table.

begin;

create table if not exists public.als_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  product_instance_id uuid not null unique references public.product_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reminders_enabled boolean not null default false,
  -- Off by default: a lock screen is a public surface, and a title like
  -- "Call the clinic about the referral" is not everyone's to read.
  show_detail boolean not null default false,
  -- Local hours, 0-23. Nothing is sent from quiet_start_hour up to
  -- quiet_end_hour; it waits and goes out afterwards. Equal values mean
  -- no quiet hours.
  quiet_start_hour smallint not null default 21 check (quiet_start_hour between 0 and 23),
  quiet_end_hour smallint not null default 8 check (quiet_end_hour between 0 and 23),
  -- IANA zone name, never a raw UTC offset, so quiet hours survive DST.
  timezone text not null default 'UTC',
  notified jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists als_notification_preferences_user_id_idx on public.als_notification_preferences (user_id);

alter table public.als_notification_preferences enable row level security;

drop policy if exists "Users can view their own reminder preferences" on public.als_notification_preferences;
create policy "Users can view their own reminder preferences"
on public.als_notification_preferences for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can insert their own reminder preferences" on public.als_notification_preferences;
create policy "Users can insert their own reminder preferences"
on public.als_notification_preferences for insert to authenticated
with check (auth.uid() = user_id and public._als_owns_instance(product_instance_id));

drop policy if exists "Users can update their own reminder preferences" on public.als_notification_preferences;
create policy "Users can update their own reminder preferences"
on public.als_notification_preferences for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;
