# Monthly Money Reset — build plan

Records the approved scope and the founder corrections this build is built
against, before any implementation existed. See `docs/products/` for the
detailed product/calculation/state/QA docs written as the build progresses,
and `docs/monthly-money-reset-prototype.html` for the visual/interaction
reference this product was built from (a reference artifact only — never
shipped, never imported into the application).

## What this phase builds

Draftpace's first real, free Companion-family product: Monthly Money Reset.
Full scope, non-goals, and product position are in
`docs/products/MONTHLY-MONEY-RESET.md`.

## Founder corrections this build honors

1. **Money model.** Safe-to-Spend is `startingAvailableBalance + income
   received after the reset began − ordinary spending − bill payments −
   savings transfers made after the reset began − protected unpaid bills −
   protected reserve still held`. Expected income never counts. Marking a
   protected bill paid moves its amount from "protected unpaid" to "bill
   payments" with no net change. Money set aside but still in the account is
   part of the protected reserve, never double-subtracted as a transfer.
   Full detail: `docs/products/MONTHLY-MONEY-RESET-CALCULATIONS.md`.
2. **Activation is POST-only.** `/app/activate/monthly-money-reset` is a safe,
   side-effect-free GET page (auth-gated for free by the existing
   `src/proxy.ts` protection on `/app/**`) that renders a confirmation form.
   The actual grant only happens via `POST /api/products/[productSlug]/
   activate`. No GET request, prefetch, crawl, or preview can activate a
   product.
3. **Database-side eligibility.** `public.free_activatable_products` is an
   explicit allowlist table; the grant function looks up the product version
   from that table server-side rather than trusting a client-supplied value,
   so no caller can grant an arbitrary slug.
4. **Single source of truth + concurrency.** `product_instances` holds only
   lightweight lifecycle/query-cache fields, updated transactionally alongside
   the authoritative `monthly_money_reset_states.state`. Writes carry an
   expected `revision`; a mismatch returns a conflict instead of silently
   overwriting a newer write from another tab or device.
5. **Multi-currency.** One ISO 4217 currency per cycle, integer minor units
   for all math, `Intl.NumberFormat` for display, no conversion, confirmation
   required before changing currency on a cycle with existing entries.
6. **Registry bootstrap.** One idempotent module,
   `src/products/monthly-money-reset/register.ts`, called explicitly from
   exactly the entry points that need it — never a side effect of an
   unrelated layout, never dependent on dev fixtures being enabled.
7. **Everything else** — Money Leak Check excluded, no marketing redesign, no
   Platform Home/Library redesign beyond the real states this product needs,
   migration reviewed by the founder before being applied, screenshots added
   to the Shop listing after the built UI can be reviewed.
