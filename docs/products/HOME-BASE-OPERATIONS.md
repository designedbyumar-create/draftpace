# Home Base: operational configuration

What has to be set, and where, for Home Base to actually work in a
deployed environment. Written because one item on this list can be
missing without any error appearing anywhere a person would look.

No secret values appear in this file, and none should ever be added to
it.

## The notification evaluator

Home Base's reminders are evaluated by
`/api/notifications/cron-hmc`, woken hourly by a Supabase `pg_cron` job.
It is a separate job, a separate secret, and a separate route from
Personal Finance Companion's, on purpose: a fault in one pipeline cannot
reach the other.

### The shared secret, in two places that cannot see each other

| Side | Name | Set where |
| --- | --- | --- |
| Caller | `hmc_cron_secret` | Supabase Vault, created once via the SQL editor |
| Route | `HMC_CRON_SECRET` | Vercel project environment variables |

The values must be **byte-identical**. The pg_cron job reads the Vault
secret by name at run time (see migration
`202608190005_home_management_companion_cron_schedule.sql`) and sends it
as `Authorization: Bearer <value>`. The route compares against
`Bearer ${process.env.HMC_CRON_SECRET}`.

**The failure mode this table exists for:** neither side can detect a
mismatch. The route fails closed and returns 401 to everything, the cron
job records a completed HTTP call, and the only symptom is that Home
Base notifications silently never arrive. Nothing is logged as broken.
`src/app/api/notifications/cron-hmc/route.test.ts` asserts the closed
behaviour, including that an unset variable rejects even a correct
secret.

To create the Vault secret (once, in the Supabase SQL editor):

```sql
select vault.create_secret('<the-value>', 'hmc_cron_secret');
```

Then set the same value as `HMC_CRON_SECRET` in Vercel, for the
environments the cron job targets. The job's URL is hard-coded to
`https://draftpace.com/api/notifications/cron-hmc`, so **Production is
the environment that matters**; a Preview deployment is never called by
it.

### Everything else the evaluator needs

All of these are read on the same request path. If any is missing the
route returns `{ ok: false, configured: false }` with a note naming the
gap, which is honest but only visible to whoever calls it.

- `SUPABASE_SERVICE_ROLE_KEY`: required. The evaluator reads reminders
  across users, which RLS otherwise prevents. Because service-role
  bypasses RLS, the route re-checks entitlement itself per instance.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`:
  required to send Web Push at all. Shared with PFC.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the
  ordinary client pair.

### Local development

`HMC_CRON_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` are deliberately absent
from local `.env.local`, so the evaluator returns 401 locally and cannot
send anything to real devices from a development machine. That is the
intended posture, not a misconfiguration. The route's own tests cover the
gate without needing either value.

## Checkout

`LEMON_SQUEEZY_HMC_CHECKOUT_URL` is not set. Until it is, the Shop
listing renders "Checkout opens soon" rather than a broken buy button,
and the listing carries no `price` (see `TODO_SET_REAL_PRICE` in
`src/shop/products/home-management-companion.ts`). Both are deliberate
and honest states, not bugs.

## Redeemable codes

The Etsy funnel mints codes with the service-role RPC
`generate_redeemable_codes(product_slug, version, count)` from migration
`202608190006_redeemable_codes.sql`, redeemed by users at `/app/redeem`.
The printable's activation code box is filled at generation time from the
`ACTIVATION_CODE` environment variable read by
`scripts/generate-home-survey.ts`; with none set it prints the
placeholder `XXXX-XXXX` rather than a real-looking fabricated code.

## What is deliberately not configured

- **PWA branding.** `provisionalBranding: true` in the product
  definition, using Draftpace's own neutral icons. Real Home Base
  artwork is a founder decision, not a deployment step. Personal Finance
  Companion is in the same state.
- **`hmc_appliances`.** Superseded by `hmc_things` and left in place,
  unreferenced by application code. Dropping it is an explicit,
  founder-confirmed step and is not scheduled.

## Deferred technical cleanup

Recorded here so it is not rediscovered as a surprise. None of it is
scheduled, and none of it affects behaviour today.

### `appliance_id` should become `thing_id`

`hmc_maintenance_tasks.appliance_id` and `hmc_maintenance_log.appliance_id`
are named for the entity this product used to have. Their foreign keys
were repointed at `hmc_things` in migration
`202608190013_home_management_companion_maintenance_thing_fk.sql`, so a
column called `appliance_id` now references a table called `things`. The
TypeScript field `applianceId` mirrors it through the domain layer.

This is confusing to read and correct to run. It is deliberately left
alone because renaming it is a schema migration touching two live tables
plus every domain module that maps them, which is a larger and riskier
change than the confusion costs. If it is done later, the safe order is
the one this product already used for the Things cutover: add the new
column, backfill, reconcile, cut the domain layer over, verify, and only
then drop the old column as a separate founder-confirmed step.

Files carrying the name today: `state.ts`, `attention.ts`,
`domain/maintenanceTasks.ts`, `domain/maintenanceLog.ts`,
`domain/problems.ts`, `domain/confirmCandidate.ts`, three components, and
`src/app/api/notifications/cron-hmc/route.ts`.

### Manual cadence entry is days-only

The task form asks "Repeats every (days)", so a job that belongs to a
season rather than an interval cannot be entered by hand as one. The
curated templates in `homeKnowledge.ts` carry `months` and are handled
correctly end to end, including in Home's wording and the printable's
year calendar; this affects only tasks somebody adds manually. Left
alone as a scope decision, not an oversight.

### Two rows of stale test data

One item is stored with type `washer` where the current matcher resolves
its name to `dishwasher`, and another with the custom type
`basement-water-heater` where the matcher now resolves `water-heater`.
Both predate fixes to the matcher and are the author's own test data.
They are left untouched by instruction; nothing in the code depends on
correcting them.
