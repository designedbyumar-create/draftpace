# Route Map

## Launch-mode contract

`src/product-framework/environment.ts` (`getLaunchMode()`), enforced in
`src/proxy.ts`:

| Launch mode | When active | What's reachable |
|---|---|---|
| `waitlist` | Default whenever `NODE_ENV === "production"` and `NEXT_PUBLIC_LAUNCH_MODE` is unset. **This is the real production default.** | `/`, `/api/waitlist`, static assets, `/manifest.webmanifest`, `/sw.js`, `/robots.txt`, `/sitemap.xml`. Everything else redirects to `/`. |
| `beta` | Automatic whenever `NODE_ENV !== "production"` (local dev), or explicit `NEXT_PUBLIC_LAUNCH_MODE=beta` on a real deployment. | Everything in `waitlist`, plus auth routes (`/login`, `/signup`, `/forgot-password`, `/auth/callback`), the preserved public content pages (`/careers`, `/blog`, `/privacy`, `/terms`, `/cookies`, `/offline`), and all of `/app/**`. |
| `full` | Explicit `NEXT_PUBLIC_LAUNCH_MODE=full` only. | Same as `beta` today — reserved for when real public product-discovery routes exist. |

`/admin/**` is gated **independently** of launch mode by `isAdminEnabled()`
(local dev, or explicit `DRAFTPACE_ADMIN_PREVIEW=true`) — it does not open
just because launch mode is `beta` or `full`.

## Public (built)

| Route | Status |
|---|---|
| `/` | Production waitlist page — preserved unchanged |
| `/api/waitlist` | Preserved unchanged |
| `/login`, `/signup`, `/forgot-password`, `/auth/callback` | Preserved, redirect targets updated to `/app` |
| `/careers`, `/blog` | Preserved (no old-direction content) |
| `/privacy`, `/terms`, `/cookies` | Preserved (legal copy) |
| `/offline` | Preserved (PWA offline fallback), copy generalized |

## Public (documented, not built this phase)

`/products`, `/products/[productSlug]`, `/categories/[categorySlug]`,
`/solutions/[solutionSlug]`, `/pricing`, `/learn`, `/activate/[token]`
(real verification — a scaffold-only stub may exist, see below).

The old `/about`, `/support`, `/pricing`, `/features`, `/store` pages were
**deleted**, not carried forward — they were built entirely around the
abandoned "planner marketplace + Gumroad/Etsy" direction. Rebuilding these is
future public-acquisition work against the new product framework, not a
restoration of the old files.

## Authenticated platform (built)

| Route | Purpose |
|---|---|
| `/app` | Platform Home — session-gated, lists registered products, no fabricated data |
| `/app/library` | Registered products with structural state, session-gated |
| `/app/products/[productSlug]/start` | Product cover / entry surface |
| `/app/products/[productSlug]/setup` | Product-specific configuration (structural placeholder) |
| `/app/products/[productSlug]/workspace` | **Canonical live-work route** — the product's main surface, label varies per family (`workspaceLabel`) |
| `/app/products/[productSlug]/progress` | Family-appropriate progress (structural placeholder — no percentages/streaks invented) |
| `/app/products/[productSlug]/history` | Sessions/runs/results (structural placeholder) |
| `/app/products/[productSlug]/settings` | Product-specific settings (structural placeholder) |

A product only gets the destinations it declares (or its family default) —
the shell does not force all six on every product. See the fixtures for
products using fewer than six.

## Authenticated platform (documented, not built this phase)

`/app/notifications`, `/app/account`, `/app/settings` (platform-level),
`/app/billing`, `/app/support`.

## Internal (built, scaffolding only)

| Route | Purpose |
|---|---|
| `/admin` | Static overview of the four future admin products — no data, no actions |

## Internal (documented, not built this phase)

`/admin/products`, `/admin/product-families`, `/admin/customers`,
`/admin/entitlements`, `/admin/operations`, `/admin/analytics`,
`/admin/audit`.

## Indexing

- `/app/**` and `/admin/**` layouts set `robots: { index: false, follow:
  false }`.
- `robots.ts` disallows `/app`, `/admin`, `/api`.
- `sitemap.ts` lists only the preserved static public pages above — no
  product, fixture, or catalog URLs (there is no catalog left to enumerate).
