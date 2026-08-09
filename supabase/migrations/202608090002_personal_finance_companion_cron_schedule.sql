-- Personal Finance Companion: hourly evaluator trigger via Supabase Cron.
-- Additive only.
--
-- Vercel Hobby only supports a once-daily cron schedule, which is
-- incompatible with the reminder engine's actual behavior — same-day
-- snoozes, short-lead date reminders, and per-user timezone/quiet-hours
-- eligibility (see reminders/eligibility.ts) all assume the evaluator gets
-- a chance to run roughly hourly, not once at a fixed UTC time every day.
-- Vercel Cron has been removed from vercel.json for that reason; this
-- migration schedules the same hourly wake-up via Supabase's own
-- pg_cron + pg_net, calling the exact same protected endpoint
-- (/api/notifications/cron) with the exact same CRON_SECRET bearer
-- token check already in that route — nothing about the evaluator's own
-- authorization, ownership, entitlement, or eligibility logic changes.
-- Supabase Cron is only ever the hourly wake-up; per-user delivery timing
-- is still entirely governed by eligibility.ts's own timezone/quiet-hours
-- check inside the evaluator, same as before.
--
-- PREREQUISITE (owner, one-time, done manually in the Supabase SQL
-- Editor before running this file — see the deployment report for the
-- exact command): a Vault secret named 'pfc_cron_secret' holding the same
-- value as the CRON_SECRET environment variable already set in Vercel.
-- This migration never contains the real secret value — the scheduled
-- job looks it up from vault.decrypted_secrets by name at RUN time, not
-- schedule-definition time, so it is safe to commit and re-run.
--
-- Wrapped in an explicit transaction — see 202608080001's identical note.
-- cron.schedule()'s job name argument doubles as its identity: scheduling
-- again under the same name replaces the previous job definition rather
-- than creating a duplicate, so this file is safely re-runnable too.

begin;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'pfc-notifications-hourly',
    '0 * * * *',
    $$
    select net.http_post(
      url := 'https://draftpace.com/api/notifications/cron',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets where name = 'pfc_cron_secret'
        ),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    ) as request_id;
    $$
  );

commit;
