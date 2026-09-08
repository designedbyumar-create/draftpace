# Commerce

How money becomes an entitlement. The one flow in Draftpace where a mistake
costs a real person real money, so it is documented in full.

## Why Lemon Squeezy

They are **merchant of record**, not a payment processor. That means they are
the legal seller: they collect and remit VAT/GST in every jurisdiction, handle
invoices, and take on the compliance. Stripe would leave all of that with us.

The trade is control. The checkout is a cross-origin iframe, so its interior
cannot be styled beyond a logo, the dashboard's design settings, and the
`button_color` each link carries. That was judged the right trade: it is
roughly twenty seconds of a purchase, and the alternative is tax registration
in every market.

## The flow

```
Shop page ──> signed out? /signup, then back
   │
   ├─ Get Lifetime Access
   │     Overlay opens on draftpace.com (lemon.js + ?embed=1).
   │     The link carries:
   │       checkout[custom][user_id]   who is buying
   │       checkout[email]             prefilled
   │       button_color                the product's accent
   │       checkout[success_url]       /app/welcome/<slug>
   │
   ├─ Payment taken by Lemon Squeezy. No card reaches Draftpace.
   │
   ├─ order_created webhook ──> /api/lemon-squeezy/webhook
   │     1. Verify HMAC signature.        Wrong -> 401, nothing happens.
   │     2. Read user_id from custom_data. Missing -> 400.
   │     3. Resolve product from an explicit numeric-variant map,
   │        never from the payload's own claims. Unknown -> 400.
   │     4. grant_purchased_product (service-role only).
   │
   └─ /app/welcome/<slug>
         Entitlement there  -> "Payment complete", one way in.
         Not yet            -> waits, polling a read-only endpoint.
         Past ~40s          -> says so honestly, offers support.
```

## The two identifiers

The single most expensive confusion available here.

| | Looks like | Where it lives | Used for |
|---|---|---|---|
| **Buy Link** | `.../checkout/buy/84f4a4ea-…` | `src/shop/lemonSqueezyCheckout.ts` | Opening the checkout |
| **Variant id** | `2102751` | `src/shop/lemonSqueezyVariants.ts` | Recognising the purchase in the webhook |

They identify the same variant and are **not interchangeable**. One cannot be
computed from the other. Get the numeric id from Lemon Squeezy → Products →
the product's menu → Copy variant ID.

A product with a Buy Link and no variant id **takes the money and grants
nothing**: the payment succeeds and the webhook rejects the event. Tests fail
if that state ever ships.

## Why these live in code

Both are identifiers, not secrets. The Buy Link is rendered into the page for
anyone to read; the variant id arrives in a payload. Holding them in code means
adding a product is one change in one file rather than a code change plus a
deployment-config change somebody has to remember — and env-only meant the map
was empty in any deployment where nobody had set eight variables, which fails
in exactly the silent way above.

What makes the webhook safe is the signature check plus resolving the product
from an explicit map. Env vars still override, for a staging deployment
pointed at test mode, where the ids are genuinely different objects.

**The one real secret is `LEMON_SQUEEZY_WEBHOOK_SECRET`.** Without it the route
returns 503 and nothing is ever granted.

## Test mode is a different store

Test-mode products are separate objects with their own numeric variant ids and
their own webhook. Testing with the toggle on will not match the ids in code,
and the grant will fail — which looks like a bug and is not one. Either test in
live mode and refund yourself, or set the env overrides on a staging deployment.

## Prices

Hardcoded in `src/shop/products/<slug>.ts`. **Not** fetched from Lemon Squeezy.

Change Lemon Squeezy first, then the code, then deploy. The reverse promises a
price the checkout will not honour.

Two tiers, both at 50% off list: **$49 from $99**, **$34 from $69**.
`src/shop/products/index.test.ts` holds the intended figures in one table, so
a price move is one edit rather than eight.

## Known gaps

- **Refunds do not revoke access.** Only `order_created` is handled. Revoke by
  hand (see `RUNBOOK.md`) or implement `order_refunded`.
- **No subscriptions.** Every product is a one-time purchase, by design.
- **No dunning, no invoicing, no tax reporting** in this codebase. All of that
  is Lemon Squeezy's, which is the point of using them.
