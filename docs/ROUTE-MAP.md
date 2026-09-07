# Route Map

The live application. Nine real products ship, and the sentence this
document used to end on ("no product exists in production yet") stopped
being true a long time before it was corrected here. Re-derive the
route list from `npm run build`'s route table rather than trusting this
file if the two disagree.

## Access model

| Area | Protection | Indexing |
|---|---|---|
| Public (`/`, `/shop`, `/guides`, `/help-with`, `/how-it-works`, `/about`, `/trust`, `/support`, `/accessibility`, `/careers`, `/blog`, `/casestudy`, `/privacy`, `/terms`, `/cookies`) | None | Indexable |
| Auth (`/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/onboarding`) | None | `noindex` |
| Platform (`/app/**`) | Real session required — verified server-side in `src/proxy.ts` (redirects to `/login?redirectTo=...` before any protected content is served) and again in `src/app/app/layout.tsx` as defense in depth | `noindex` |
| Admin (`/admin/**`) | Gated independently by `isAdminEnabled()` (local dev, or explicit `DRAFTPACE_ADMIN_PREVIEW=true`) *and* a real session, both re-checked per request via `export const dynamic = "force-dynamic"` | `noindex` |
| API (`/api/**`) | Per-route: webhooks verify their provider's signature, cron routes verify their secret, product routes require a session | Disallowed in `robots.ts` |

## Public

| Route | Purpose |
|---|---|
| `/` | The real public homepage — platform explanation, product families, shared capabilities, trust principles, account CTA |
| `/shop`, `/shop/[productSlug]` | The catalogue and each product's own listing, rendered from `src/shop/products/*.ts` |
| `/guides`, `/guides/[guideSlug]` | The guides layer (`src/content/guides.ts`), clustered by life area |
| `/help-with`, `/help-with/[needSlug]`, `/help-with/about-ask-dp` | Ask DP: the knowledge hub, per-situation pages, and the page explaining what it is |
| `/how-it-works`, `/about`, `/trust`, `/accessibility`, `/support`, `/careers`, `/blog`, `/casestudy` | Platform and company pages |
| `/privacy`, `/terms`, `/cookies` | Legal |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/onboarding` | Auth flow, on the shared design system |
| `/offline` | The PWA offline fallback |

## Authenticated platform (`/app`)

| Route | Purpose |
|---|---|
| `/app` | Platform Home — one focal block, then owned products grouped by life area (`src/content/areas.ts`), each tile showing that product's own current summary via `productSummary.ts` |
| `/app/library` | The shelf — every owned product led by its real screens |
| `/app/library/[productSlug]` | That product's manual. For a product with `tasks` on its listing this is a task index ("what do you want to do?"), each row linking to the screen it happens on, plus the owning half of its `questions`. The older prose shape still renders for the two internal layout fixtures, which have no tasks |
| `/app/notifications` | Inbox, real browser permission flow, quiet hours, per-product controls (not built) |
| `/app/account` | Identity, sessions, security, sign-out (real); data export, deletion, 2FA (not built) |
| `/app/settings` | Theme, working text-scale and reduce-motion overrides, locale/timezone (detected, read-only), reminder time |
| `/app/billing` | Owned products; payment method / billing history (not built) |
| `/app/support` | Contact entries routed to email; in-app case tracking not built |
| `/app/activate/[productSlug]`, `/app/redeem` | Free-product activation and code redemption |

### Product destinations

`/app/products/[productSlug]/<destination>` is the universal product
shell. A product declares which destinations it has in its own
`definition.ts`; the shell never branches on product or family name.

Every declared destination must have a folder here, because a declared
destination is a link somebody taps and a missing folder is a 404 that
no type error and no build failure would catch. Three of them shipped
missing once, which is why `src/product-framework/productRoutes.test.ts`
now asserts the mapping, and why `contentCollapse.test.ts` asserts the
same thing for the manual's task links.

The destinations that exist today: `accounts`, `affairs`, `attention`,
`bills`, `debt`, `help`, `history`, `import`, `income`, `kids`, `life`,
`maintenance`, `members`, `people`, `printables`, `progress`,
`providers`, `record`, `records`, `savings`, `settings`, `setup`,
`setup-centre`, `start`, `subscriptions`, `timeline`, `transactions`,
`trip`, `vehicles`, `workspace`. Plus the nested
`item/[itemId]`, `kids/[childId]`, `kids/[childId]/check`, and each
product's own `manifest.webmanifest`.

## API (`/api`)

| Route | Purpose |
|---|---|
| `/api/lemon-squeezy/webhook`, `/api/stripe/webhook` | Purchase webhooks |
| `/api/billing-portal` | Billing portal hand-off |
| `/api/notifications/cron`, `/cron-hmc`, `/cron-life-updates` | Scheduled evaluators that write the in-app updates feed |
| `/api/notifications/subscribe`, `/unsubscribe`, `/test` | Browser push subscription management |
| `/api/products/[productSlug]/activate` | Free-product activation |
| `/api/products/[productSlug]/printables/[assetId]` | Printable asset delivery |
| `/api/redeem` | Code redemption |

## Internal (`/admin`)

| Route | Data |
|---|---|
| `/admin` | Overview — real counts (registered products/families) + section index |
| `/admin/products` | Real — reads `productRegistry` |
| `/admin/product-families` | Real — reads `familyRegistry` |
| `/admin/operations` | Real feature-flag state; jobs/webhooks honestly empty |
| `/admin/customers`, `/admin/entitlements`, `/admin/commerce`, `/admin/communications`, `/admin/support`, `/admin/analytics`, `/admin/audit` | Honest "not built yet" states — no fabricated customers, orders, or metrics |

No Product Studio (definition authoring UI) exists — out of scope per the brief.

## Indexing implementation

- `robots.ts` disallows `/app`, `/admin`, `/api`.
- `sitemap.ts` (`src/app/sitemap.ts`) is generated, not hand-listed: the
  static public pages, plus every published shop listing, every guide and
  every guide-area hub that has guides, plus only the `/help-with` needs
  that actually have a product behind them. Draft, archived and dev
  fixtures never reach it.
- `/app/**` and `/admin/**` layouts, and the `(auth)` route group, set
  `robots: { index: false, follow: false }`.
