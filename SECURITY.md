# Security

## Reporting a vulnerability

Email **security@draftpace.com** with what you found and how to reproduce it.
Do not open a public issue.

You will get a reply within 72 hours. If the report is valid you will be told
what the fix is and when it ships. Please give a reasonable window before
disclosing anything publicly.

## The security model, in short

**Every user's data is isolated by the database, not by the application.**
Row-level security is on for every table, and policies are scoped to
`auth.uid()`. A bug in application code cannot expose one account's rows to
another, because the query itself is refused.

**Products cannot read each other's data.** Each owns its own table prefix
and its own policies. There is no shared "user data" table that a product
could over-read from.

**`/app/**` requires a real, server-verified session** (`src/proxy.ts` via
`@supabase/ssr`), re-checked server-side on every request. A client-side
check is never the gate.

**Entitlements are granted only by verified purchase.** The one path that
creates a paid entitlement is `grant_purchased_product`, a `SECURITY DEFINER`
function callable only with the service role, from the Lemon Squeezy webhook
after its HMAC signature has been verified. No client-reachable route can
grant a paid product. The post-purchase screen at `/app/welcome/<slug>` and
its polling endpoint are strictly read-only, and a test asserts they contain
no write path.

**Card details never reach Draftpace.** Lemon Squeezy is the merchant of
record and takes payment. We receive a signed webhook, never a card.

## What is a secret and what is not

Genuinely secret, server-only, never in the client bundle:

- `SUPABASE_SERVICE_ROLE_KEY`
- `LEMON_SQUEEZY_WEBHOOK_SECRET`
- `VAPID_PRIVATE_KEY`
- `CRON_SECRET`, `HMC_CRON_SECRET`, `LIFE_UPDATES_CRON_SECRET`

Not secret, and deliberately committed to this repository:

- Lemon Squeezy Buy Links and numeric variant ids. Both are rendered into
  the page or carried in a payload, readable by anyone. What makes the
  webhook safe is the signature check plus resolving the product from an
  explicit map rather than trusting the payload.
- The Supabase anon key. It is designed to be public; row-level security is
  what protects the data behind it.

## Known limitations

Stated rather than hidden.

- **Refunds do not revoke access automatically.** The webhook handles
  `order_created` only. A refunded customer keeps their product until it is
  revoked by hand.
- **No rate limiting on auth routes** beyond what Supabase provides.
- **No formal audit log.** Admin actions are not recorded to an immutable
  trail.
