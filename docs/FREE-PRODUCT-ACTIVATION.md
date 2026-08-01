# Free product activation

How a customer goes from "Add free to my library" on the public Shop to a
working product instance, and how that grant is kept safe. Monthly Money
Reset is the first product to use this path; the mechanism is written to be
reusable by a future free product without code changes, only a new row in
`free_activatable_products`.

## The flow

```
/shop/monthly-money-reset
  "Add free to my library" → <Link href="/app/activate/monthly-money-reset">  (safe GET)

/app/activate/monthly-money-reset                                            (safe GET)
  Under /app/**, so src/proxy.ts already redirects a signed-out visitor to
  /login?redirectTo=/app/activate/monthly-money-reset and back again —
  no bespoke auth-redirect code needed here.
  Renders a confirmation card with a real <form method="POST">.

POST /api/products/[productSlug]/activate                                    (the only mutation)
  Re-verifies the session (defense in depth beyond proxy.ts), calls
  grant_free_product(slug, cycleKey), responds 303 to
  /app/products/monthly-money-reset/start.
```

No GET request, `<Link>` prefetch, crawler visit, or link preview can grant
anything — only an explicit form submission reaches the route that mutates
data, and that route only accepts POST.

## Why the database, not the registry, decides eligibility

The TypeScript `productRegistry` describes what a product *is* for shell/UI
purposes. It is not consulted by the database at all. `grant_free_product`
looks up `product_slug` in `public.free_activatable_products` — a table with
exactly one row today (`monthly-money-reset`, version `0.1.0`) — and takes
the product *version* from that row, never from the caller. A request calling
the RPC directly with an arbitrary slug (bypassing the app entirely) gets
"Product is not eligible for free activation," and there is no parameter
through which a version can be supplied or spoofed.

## Why writes go through functions, not direct table access

`entitlements`, `product_instances`, and `monthly_money_reset_states` grant
`select` to `authenticated` (RLS-scoped to `auth.uid() = user_id`) and
nothing else — no `insert`/`update` grant exists on these tables for that
role at all. The only way to write is through `grant_free_product` and
`save_monthly_money_reset_state`, both `security definer` functions that
resolve `auth.uid()` internally and manually verify row ownership (since a
definer function bypasses RLS, the check inside the function *is* the
enforcement). This means the write path can't be reached by calling
`supabase.from('entitlements').insert(...)` from the browser console — it
simply fails with a permission error before any function logic runs.

## Idempotency and retries

`grant_free_product` is safe to call repeatedly for the same user and cycle:
`on conflict (user_id, product_slug) do update ... returning id` and the
equivalent for `product_instances` mean a retried request (network hiccup,
a user hitting the confirmation form twice) returns the same entitlement and
instance rather than erroring or creating a duplicate. The initial
`monthly_money_reset_states` row is only inserted `on conflict ... do
nothing`, so it's never reset by a retry.

## Concurrency on later writes

`save_monthly_money_reset_state` requires the caller's last-known
`revision`. If another write already advanced it (a second tab, a second
device), the update matches zero rows and the function returns the current
state with `conflict: true` instead of overwriting it. The client is
expected to reload that state and either discard its local draft or
re-apply just the fields the user actually changed — see
`docs/products/MONTHLY-MONEY-RESET-STATES.md` for the client-side contract.

## Applying the migration

The migration file is `supabase/migrations/202608010001_monthly_money_reset.sql`.
It is **additive only** — no existing table is touched, altered, or dropped.

**This has not been applied to any Supabase project by this change.** To
apply it once you've reviewed it:

```bash
# with the Supabase CLI, from the project root, against the linked project
supabase db push

# or paste the file's contents into the Supabase dashboard's SQL editor
# for your project and run it there
```

After applying, verify:

```sql
select * from public.free_activatable_products;
-- expect exactly one row: monthly-money-reset, 0.1.0, true

select has_table_privilege('authenticated', 'public.entitlements', 'INSERT');
-- expect false
```

No credential values are required to review or apply this file — it contains
no secrets.

## What was not built in this phase

Checkout, payment, and subscription logic — this path is free-grant only.
Revocation UI (the schema has `revoked_at`/`is_active` on `entitlements` for
future use, but nothing in this phase sets them). A generic multi-product
activation UI — the confirmation page and route are written for one product
today, structured so a second free product needs a new allowlist row and a
new product-framework registration, not new activation code.
