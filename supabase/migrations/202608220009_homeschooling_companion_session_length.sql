-- Homeschooling Companion: how long a session usually is.
--
-- One column. A starting outline says "about 35 minutes, 4 days a week",
-- and the days half already had somewhere to live while the minutes half
-- did not. Without this the outline would show a parent a number and
-- then quietly forget it, which is the kind of small dishonesty that
-- makes somebody stop trusting a product.
--
-- Nullable, because a parent who never wanted an outline has no reason
-- to have an opinion about it and must not be asked for one.

begin;

alter table public.hsc_plan
  add column if not exists minutes_per_session integer
  check (minutes_per_session is null or (minutes_per_session > 0 and minutes_per_session <= 480));

commit;
