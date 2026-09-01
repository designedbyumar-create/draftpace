-- Home Base: cron schedule for the reminder evaluator. Additive only,
-- and deliberately a SEPARATE pg_cron job from PFC's own
-- 'pfc-notifications-hourly' (202608090002) - a distinct job name, a
-- distinct Vault secret, and a distinct target URL, so a problem with
-- this evaluator can never affect PFC's working notification pipeline.
--
-- Same net.http_get-not-http_post reasoning as PFC's identical migration:
-- the target route only exports GET, and Vercel Hobby's cron only allows
-- once-daily schedules via vercel.json, incompatible with hourly
-- reminder evaluation, hence Supabase's own pg_cron + pg_net as the
-- wake-up trigger instead.
--
-- The 15000ms timeout mirrors PFC's own tuned value as a starting
-- estimate, not a re-measurement against Home Base's real evaluator cost
-- (this environment has no live traffic to measure against yet) -
-- revisit once real usage data exists.
--
-- The Vault secret itself ('hmc_cron_secret') is looked up by name at
-- run time, so this migration is safe to commit with no real secret in
-- it. Its value must be created once, manually, via the Supabase SQL
-- editor (e.g. select vault.create_secret('<value>', 'hmc_cron_secret');)
-- and must exactly match the HMC_CRON_SECRET env var the target route
-- reads.

begin;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'hmc-notifications-hourly',
    '0 * * * *',
    $$
    select net.http_get(
      url := 'https://draftpace.com/api/notifications/cron-hmc',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets where name = 'hmc_cron_secret'
        )
      ),
      timeout_milliseconds := 15000
    ) as request_id;
    $$
  );

commit;
