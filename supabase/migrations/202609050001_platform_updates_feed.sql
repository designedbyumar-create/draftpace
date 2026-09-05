-- A real, cross-product in-app record of what was communicated to a user,
-- independent of push notification permission. Additive only.
--
-- public.product_updates — PLATFORM-level, not product-prefixed, same
--   reasoning as push_subscriptions in 202608090001: a "here's what
--   happened" feed belongs to the account, not to one product, so a
--   future product can write here without being forced into PFC's or
--   HMC's tables or terminology.
--
--   Written by each product's own cron evaluator (Personal Finance
--   Companion, Home Management Companion today) at the exact moment it
--   computes a push payload — title/body/url copied verbatim, never
--   reconstructed later from other tables, since neither product's own
--   reminder tables persist the human-readable text. Written whether or
--   not the user actually has a push subscription, so this feed is not
--   blind to the majority of users who never grant push permission.
--
--   product_slug is a plain string, not an enum check: a hardcoded list
--   of product slugs at the schema level would be the same "family
--   switch statement" CLAUDE.md rule 2 already forbids in application
--   code, just moved into SQL.
--
--   unique (user_id, product_slug, dedupe_key), not just (user_id,
--   dedupe_key) like pfc_notification_deliveries: dedupe keys are only
--   unique within one product's own key space, so two products could
--   otherwise collide on the same key for the same user.
--
--   No insert policy for `authenticated` — only the service-role client
--   (each product's server-side cron) writes here, same reasoning as
--   pfc_notification_deliveries: a user must never forge their own
--   update history. select/update are user-scoped so a user can read
--   their own feed and mark a row acknowledged.
--
-- Wrapped in an explicit transaction — see 202608080001's identical note.

begin;

create table if not exists public.product_updates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  product_instance_id uuid references public.product_instances(id) on delete set null,
  title text not null,
  body text not null,
  url text not null,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  unique (user_id, product_slug, dedupe_key)
);

create index if not exists product_updates_user_id_idx on public.product_updates (user_id);
create index if not exists product_updates_user_unacked_idx on public.product_updates (user_id, acknowledged_at);

alter table public.product_updates enable row level security;

drop policy if exists "Users can view their own updates" on public.product_updates;
create policy "Users can view their own updates"
on public.product_updates for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can acknowledge their own updates" on public.product_updates;
create policy "Users can acknowledge their own updates"
on public.product_updates for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Deliberately no insert policy for `authenticated` — only the
-- service-role client (each product's cron evaluator) writes here, and
-- service-role bypasses RLS entirely, so no policy is needed for it.

commit;
