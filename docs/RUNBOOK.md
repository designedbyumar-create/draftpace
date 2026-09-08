# Runbook

What to do when something is wrong. Written for the version of you that is
tired and being messaged by a customer.

Every entry: the symptom you will actually see, what causes it, how to
confirm, how to fix.

---

## Somebody paid and did not get their product

**The most expensive failure here. Start at the top and stop when it matches.**

### Confirm what happened first

1. **Lemon Squeezy → Settings → Webhooks.** Every delivery is logged with the
   response code we returned. Find the order.
2. **Supabase → `entitlements`.** Search their `user_id` or email. If a row
   exists, the grant worked and the problem is elsewhere.

### Then match the response code

| Code | Means | Fix |
|---|---|---|
| **503** | `LEMON_SQUEEZY_WEBHOOK_SECRET` is not set on the deployment | Set it in Vercel, **redeploy** (it is read at startup, so setting it on a running deployment does nothing) |
| **401** | Signature mismatch | The secret in Vercel and the one on the Lemon Squeezy webhook are different. Copy it again; it is case-sensitive |
| **400 "Unrecognized variant_id"** | The product was bought but its numeric variant id is not in the map | Add it to `src/shop/lemonSqueezyVariants.ts`. A test should have caught this before release |
| **400 "Missing custom_data.user_id"** | They bought without being signed in, e.g. from Lemon Squeezy's own storefront | Grant it by hand (below), then find out how they reached a checkout without going through the Shop |
| **500** | The grant RPC failed | Read the message. Lemon Squeezy retries automatically, and the grant is safe to retry |
| **No delivery at all** | The webhook is not configured, or points at the wrong URL | Lemon Squeezy → Settings → Webhooks. It should point at `https://draftpace.com/api/lemon-squeezy/webhook` and be subscribed to `order_created` |

### Grant it by hand

Only after confirming the payment is real in Lemon Squeezy. In the Supabase
SQL editor:

```sql
select grant_purchased_product(
  p_user_id        => '<their auth.users id>',
  p_product_slug   => '<slug>',
  p_product_version=> '0.1.0',
  p_cycle_key      => to_char(now(), 'YYYY-MM'),
  p_metadata       => '{"provider":"lemon-squeezy","note":"manual grant, webhook failed"}'::jsonb
);
```

Then tell them it is fixed. They have been waiting.

---

## The welcome screen is stuck on "Setting up…"

Expected for a second or two. Past ~40 seconds it stops and offers support.

The webhook has not landed. Work the table above. Their payment succeeded —
they are not at risk of being charged twice, and the screen never tells them
otherwise.

---

## Somebody was refunded but still has the product

**Known limitation.** The webhook handles `order_created` only. Revoke it by
hand:

```sql
select revoke_entitlement(p_user_id => '<their auth.users id>', p_product_slug => '<slug>');
```

If this happens more than occasionally, handle `order_refunded` in
`src/app/api/lemon-squeezy/webhook/route.ts`.

---

## The site shows a different price than the checkout charges

Prices are hardcoded in `src/shop/products/<slug>.ts` and are **not** fetched
from Lemon Squeezy. If they diverge, a customer reads one number and is
charged another.

Fix Lemon Squeezy first, then the code, then deploy. Never the other way
round: a page promising a lower price than the checkout takes is the version
that causes chargebacks.

`src/shop/products/index.test.ts` holds the intended prices in one table.

---

## "Install" is greyed out, or nothing can be installed

Chromium needs a controlling service worker with a fetch handler.

Confirm in the browser console:

```js
await navigator.serviceWorker.getRegistrations()
```

Empty array means the worker is not registering. Check `PWARegister.tsx`
registers when `document.readyState === "complete"` — an effect that only
attaches a `load` listener runs after `load` has already fired and waits
forever. That exact bug shipped once.

On iOS this is never available: Safari has no install prompt, and the Share
sheet instruction is the real control.

---

## Offline shows the browser's error page

The service worker is not controlling the page yet. It takes control on the
*second* navigation after installing, so the first attempt after a fresh
deploy is expected to fail.

If it persists, check `public/sw.js` still has the `request.mode === "navigate"`
branch, and that the cache version was bumped.

---

## A cron did not run

Three routes, three secrets. Each returns 401 if its `Authorization: Bearer`
header does not match.

| Route | Secret |
|---|---|
| `/api/notifications/cron` | `CRON_SECRET` |
| `/api/notifications/cron-hmc` | `HMC_CRON_SECRET` |
| `/api/notifications/cron-life-updates` | `LIFE_UPDATES_CRON_SECRET` |

Check Vercel → Cron Jobs for the invocation log. The secret must match the
matching Supabase Vault secret named in the scheduling migration.

---

## Somebody cannot see a product they own

Never assume they are wrong. Check `entitlements` for their `user_id` with
`is_active = true` and `revoked_at is null`.

If the row exists and the app still says no, it is a read failure, not a
missing entitlement. The product layout deliberately shows a retry state
rather than an activation page in that case, because treating a failed read
as "not entitled" is the false-ownership-loss bug this codebase is built to
avoid.

---

## A deploy broke something

`main` is always deployable. Roll back in Vercel first, diagnose second.

Vercel → Deployments → the last good one → Promote to Production. Then work
out what happened without a customer watching.

---

## Before you ship anything

```bash
npx tsc --noEmit && npx eslint . && npm run test && npm run build
```

CI runs these too, but the gates are cheaper before a push than after one.
