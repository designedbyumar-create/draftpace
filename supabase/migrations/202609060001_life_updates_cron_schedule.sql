-- Cron schedule for the combined "life updates" evaluator
-- (/api/notifications/cron-life-updates) — the four products with no
-- push infrastructure of their own (Alongside, Homeschooling Companion,
-- Travel Companion, Personal Life Affairs Companion). A deliberately
-- separate pg_cron job from PFC's (202608090002) and Home Base's
-- (202608190005) own schedules — a distinct job name, a distinct Vault
-- secret, and a distinct target URL, so a problem here can never affect
-- either product's working push pipeline.
--
-- Same net.http_get-not-http_post reasoning as those two migrations: the
-- target route only exports GET, and Vercel Hobby's cron only allows
-- once-daily schedules via vercel.json, incompatible with hourly
-- evaluation, hence pg_cron + pg_net as the wake-up trigger instead.
--
-- The Vault secret itself ('life_updates_cron_secret') is looked up by
-- name at run time, so this migration is safe to commit with no real
-- secret in it. Its value must be created once, manually, via the
-- Supabase SQL editor (e.g. select vault.create_secret('<value>',
-- 'life_updates_cron_secret');) and must exactly match the
-- LIFE_UPDATES_CRON_SECRET env var the target route reads.

begin;

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select
  cron.schedule(
    'life-updates-hourly',
    '0 * * * *',
    $$
    select net.http_get(
      url := 'https://draftpace.com/api/notifications/cron-life-updates',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets where name = 'life_updates_cron_secret'
        )
      ),
      timeout_milliseconds := 15000
    ) as request_id;
    $$
  );

commit;
