# Architecture

The whole system, in one read. If you only read one document, read this one.

---

## The shape of it

One Next.js application. Four layers, each of which knows nothing about the
one above it.

```
  Public site        Marketing, Shop, /free. Anonymous.
  ─────────────────────────────────────────────────────
  Platform           Identity, entitlements, library, settings. Signed in.
  ─────────────────────────────────────────────────────
  Product framework  Registry, contracts, theming, PWA manifests.
  ─────────────────────────────────────────────────────
  Products           Nine of them. Each owns its data and its domain logic.
```

The critical property: **the framework does not know what a product is.**
Families and capabilities are open, namespaced strings (`"companion.next-action"`,
`"learning.lesson"`), never a closed TypeScript union. Nothing in the shell
says `if (family === "companion")`. A learning product or an automation tool
can be added later without renaming anything.

## Where the boundaries are

| Layer | Owns | Never touches |
|---|---|---|
| Platform | Accounts, entitlements, product instances, the shell | A product's own tables |
| Framework | Registration, validation, theming, routing contracts | Any product's domain logic |
| Product | Its own table prefix, its own screens, its own printables | Another product's data, ever |

`docs/DATA-BOUNDARIES.md` has the full rules.

## How a product registers

One file describes a product. One line adds it to the catalogue.

```
src/products/<slug>/definition.ts    Zod-validated metadata: name, family,
                                     accent, capabilities, PWA identity.
src/products/manifest.ts             One import, one array entry. Nothing else.
```

The definition holds **metadata only** — never a secret, never user data. From
it the framework derives the product's theme, its routes, its PWA manifest at
`/app/products/<slug>/manifest.webmanifest`, and its place in the library.

Adding a second product means one import and one array entry. If a change to
the framework is ever needed to add a product, the framework is wrong.

## How a person gets a product

This is the path that takes money, so it is worth knowing exactly.

```
  1. Shop page             Signed out? -> /signup, then back here.
  2. Get Lifetime Access   Overlay checkout opens on draftpace.com.
                           The link carries the buyer's Draftpace user id.
  3. Payment               Lemon Squeezy takes it. As merchant of record,
                           they handle VAT/GST. No card touches Draftpace.
  4. order_created         Webhook -> HMAC signature verified.
                           user id read from custom data.
                           product resolved from an explicit variant map,
                           never from the payload's own claims.
  5. Grant                 grant_purchased_product, service-role only.
                           Creates the entitlement + product instance.
  6. /app/welcome/<slug>   Waits for the grant rather than racing it.
                           Polls a read-only endpoint until it lands.
```

Steps 4 and 5 are the security boundary. `docs/COMMERCE.md` covers the whole
flow, including what happens when a step fails.

**Two identifiers, not one.** A Buy Link ends in a variant *UUID*; the webhook
carries a *numeric* variant id. They are not interchangeable, and confusing
them charges a customer and grants them nothing. Both live in code, with
per-deployment env overrides for a test-mode staging environment.

## How data is protected

**Row-level security, on every table, scoped to `auth.uid()`.** Isolation is
enforced by the database, not by application code, so an application bug
cannot leak one account's rows to another — the query is refused.

`/app/**` requires a real, server-verified session, re-checked on every
request in `src/proxy.ts`. A client-side check is never the gate.

Products are isolated from each other by table prefix and by policy. There is
no shared user-data table for a product to over-read.

## How it looks like an app

Each product serves **its own** manifest, scoped to its own routes, with its
own name, theme colour and icon. A browser installs whatever manifest the
current page links, so installing from inside Travel Companion installs
*Travel Companion*, with its own icon and its own window — not Draftpace.

- iOS has no install prompt. Safari installs from the Share sheet, reading
  the page's meta tags, so the instruction *is* the control there.
- Chromium fires `beforeinstallprompt`, which needs a controlling service
  worker with a fetch handler.
- Offline navigation serves the app's own offline page, network-first with a
  cache fallback. Navigations are never cached, because `/app` is per-user.

## What runs on a schedule

Three cron evaluators, each with its own shared secret so rotating one cannot
affect another.

| Route | Does |
|---|---|
| `/api/notifications/cron` | Reminders across users |
| `/api/notifications/cron-hmc` | Home Base's own evaluator |
| `/api/notifications/cron-life-updates` | Writes to the Updates feed for the four products with no push infrastructure |

## What holds it together

The test suite is not about coverage. It guards the class of bug that no type
error and no failing build would ever find:

- a shop claim that stopped being true of the product
- a product with a live checkout and no way to grant it
- two products installing the same home-screen icon
- a service worker that never registers
- fabricated data appearing anywhere

Each of those has been a real bug in this repository. Each now fails CI.

## Deliberate limits

Written down so they are choices rather than oversights.

- **One application, not a monorepo.** Internal boundaries are kept clean
  enough to extract later, but the split is not worth its cost yet.
- **No AI features.** Nothing here generates content or infers intent.
- **No bank or live API sync.** Every figure is one a person entered.
- **No cross-product data sharing.** Even where it would be convenient.
- **Theme modes are exactly `system | light | dark`.** Nothing else.
