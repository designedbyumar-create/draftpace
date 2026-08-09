# Personal Finance Companion — launch blockers

Tracked separately from the foundation/build docs because this list is
specifically "what must be genuinely proven before this product can
honestly claim to be finished," not a build log. Nothing here is
resolved by writing more code — each item needs a real, observed proof.

## Open

### Real Web Push / Supabase Cron end-to-end delivery

**Status as of 2026-08-09: not proven. `ProductDefinition.notifications.supported`
must stay `false` until it is.**

What's built and verified:
- Full notification/reminder architecture (`reminders/` — derivation,
  eligibility, aggregation, privacy rendering, deduplication), all with
  unit test coverage.
- Live schema and RLS proof against the real Supabase project, including
  cross-user denial and one explicit RLS policy rejection on a forged
  insert.
- The cron evaluator's service-role client explicitly checks current
  entitlement before evaluating/sending (a real gap found and fixed
  during live-proof testing — service-role bypasses RLS, so this can't
  be assumed).
- The evaluator's own auth (`CRON_SECRET` bearer check) verified live:
  unauthenticated and wrong-secret requests correctly rejected.
- A real reminder was created, snoozed, and acknowledged live against
  the real database through its full lifecycle.
- Service-worker privacy (no `/app/**` caching) and client-bundle secret
  exposure both audited clean against the actual deployed build.

What's not proven, and why:
- **The scheduler.** Vercel Hobby only supports daily cron, which is
  incompatible with this engine's actual behavior (same-day snoozes,
  short-lead reminders, per-user timezone/quiet-hours eligibility). The
  hourly trigger was moved to Supabase Cron (`pg_cron` + `pg_net`,
  migration `202608090002_personal_finance_companion_cron_schedule.sql`),
  which requires the owner to run a one-time Vault secret setup and the
  migration itself in the Supabase SQL Editor. **The owner currently
  cannot reach the Supabase dashboard** (an `auth.supabase.io` fetch
  failure on their end — Supabase's own status page showed all systems
  operational at the time, so this looks local to their browser/network,
  not a platform outage). Until they're back in: the migration is
  committed and ready, but never applied, so no scheduled evaluation is
  happening at all.
- **Real device delivery.** No environment used for this work could
  grant real OS/browser push permission (the available automated browser
  has notifications pre-blocked at the browser-settings level) or
  confirm a notification visibly appearing and its tap reaching the
  correct destination. This has never been observed, only built and
  unit-tested.

### Required before this can flip to PASS
1. Owner regains Supabase dashboard access, creates the `pfc_cron_secret`
   Vault secret, and applies `202608090002_...cron_schedule.sql` — see
   the exact SQL Editor steps already handed to the owner directly.
2. Confirm at least one real hourly evaluator run in
   `cron.job_run_details` / `net._http_response`.
3. On a real supported browser/device: complete the consent flow, grant
   permission, confirm a push subscription persists, trigger a real send,
   and **visually observe** the notification appear and its tap land on
   the correct protected page.
4. Only then set `notifications: { supported: true }` in
   `src/products/personal-finance-companion/definition.ts`.

Do not treat this as a design/UX blocker — it does not block Stage G or
any other product-experience work. It blocks final launch hardening only.
