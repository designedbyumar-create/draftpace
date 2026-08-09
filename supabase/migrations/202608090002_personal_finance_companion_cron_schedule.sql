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
--
-- net.http_get, not net.http_post: the route (src/app/api/notifications/
-- cron/route.ts) only exports GET. This migration originally used
-- http_post, which the route rejects with 405 before the auth/evaluator
-- logic ever runs — live production proof (owner, 2026-08-10) confirmed
-- the scheduled job itself succeeds (cron.job_run_details: succeeded) while
-- the actual HTTP call it made returned 405 (net._http_response), and that
-- switching to a manual net.http_get with the same bearer header returns
-- 200. No body/Content-Type is sent since GET has none.
--
-- timeout_milliseconds := 15000: pg_net's default request timeout is
-- 5000ms. Live production proof (owner's manual test, 2026-08-10) showed
-- the evaluator's real execution duration is ~5.4s once there is at least
-- one instance to evaluate — comfortably past that default, which is
-- exactly what caused pg_net to report a timeout on an earlier manual
-- attempt even though Vercel's own logs showed the request completed with
-- a 200. 15000ms gives headroom as instancesEvaluated grows without
-- changing anything about the evaluator's own logic, auth, or cadence.

begin;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'pfc-notifications-hourly',
    '0 * * * *',
    $$
    select net.http_get(
      url := 'https://draftpace.com/api/notifications/cron',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets where name = 'pfc_cron_secret'
        )
      ),
      timeout_milliseconds := 15000
    ) as request_id;
    $$
  );

commit;
