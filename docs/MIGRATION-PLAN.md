# Migration Plan — Product-Layer Reset (Phase 1)

Full history is preserved via Git (`git log`, `git show <commit>^:<path>`) —
nothing below is unrecoverable, it's removed from the working tree only.

## Deleted — old product implementation

| Path | Reason |
|---|---|
| `content/systems/**` | Old product content, both packs `coming_soon`, never a real product |
| `src/lib/systems/**` (types, runtime, validateSystem, loadSystems, categories, blueprints, index) | Presented as generic, actually Companion-only vocabulary (`paths`, `rhythmOptions`, `companionTone`) |
| `src/lib/planners.ts` | Thin adapter over `lib/systems`; `sections` was always `[]` |
| `src/components/planner/PlannerRenderer.tsx` | Zero importers — already dead |
| `src/components/system-runtime/**` (11 files) | Companion-only runtime UI over deleted content |
| `src/components/system/SystemVisuals.tsx` | Store/Companion visual widgets |
| `src/components/money-momentum/MoneyMomentumSavingsSystem.tsx` | Orphaned (0 route imports), 1,094 lines of finance-only logic |
| `src/lib/moneyMomentumSavings.ts` | Only consumer was the file above |
| `.mm-*` CSS in `src/app/globals.css` (lines 113–2373, ~437 selectors) | Exclusive consumer was `MoneyMomentumSavingsSystem.tsx`, confirmed via grep before deletion |
| `src/app/dashboard/**` (layout, page, drafts/, explore/, library/, planner/, progress/, settings/) | Entire old dashboard tree, superseded by `/app/**` |
| `src/app/store/page.tsx` | Old catalog UI over the deleted engine |
| `src/app/library/page.tsx` | Redirect stub to `/store` |
| `src/app/api/checkout/route.ts`, `src/components/app/CheckoutButton.tsx` | Founder-directed deletion; both already orphaned and coupled to deleted pricing data; commerce will be rebuilt against real entitlements |

## Deleted — old marketing implementation

| Path | Reason |
|---|---|
| `src/components/marketing/homepage/**` (9 files: Hero, Features, HowItWorks, PlannerCategories, PricingPreview, Testimonials, CTASection, DashboardPreview, FeaturedPlanners) | Confirmed zero importers — disconnected since the "coming soon" pivot |
| `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx` | Confirmed zero importers |
| `src/app/about/page.tsx` | Content scan confirmed heavy old-direction claims: "200+ planners in the store," Gumroad/Etsy purchase model |
| `src/app/support/page.tsx` | FAQ referenced dead dashboard structure ("Dashboard → Drafts → Purchases tab") — actively misleading if kept |
| `src/app/pricing/page.tsx` | Entire page built around the old planner-marketplace pricing tiers (à la carte planners, membership, Gumroad/Etsy redemption) |
| `src/app/features/page.tsx` | Entire page built around old planner-marketplace feature claims, including fabricated stats ("2,400+ planners started this week") |

## Preserved and relocated

| Old path | New path | Why |
|---|---|---|
| `src/components/ui/Icon.tsx` | `src/design-system/Icon.tsx` | Already Phosphor-only, already typed, zero finance/planner naming |
| `src/components/providers/ThemeProvider.tsx` | `src/design-system/theme/ThemeProvider.tsx` | Domain-neutral mechanism, updated to `system \| light \| dark` |
| `src/components/theme/ThemeToggle.tsx` | `src/design-system/theme/ThemeToggle.tsx` | Same, updated to the 3-mode control |
| `src/components/app/AppShell.tsx` | Split into `src/design-system/shell/PlatformShell.tsx` (chrome: nav, header, `AppCard`/`AppBadge`/`InstallPromptCard`) and `src/design-system/shell/AuthGate.tsx` (session/onboarding guard, now reusable by both `/app` and `/admin`) | The chrome pattern was sound; the nav items and the guard being fused together was not reusable for the admin shell or the product shell |

## Preserved unchanged

- `src/app/page.tsx` (production waitlist), `src/app/api/waitlist/route.ts`,
  `supabase/migrations/202607050001_launch_subscribers.sql`
- `src/lib/supabase.ts`, `src/lib/server-auth.ts`
- `src/app/login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`,
  `auth/callback/page.tsx` (redirect targets updated from `/dashboard` to
  `/app`, logic otherwise untouched)
- `src/app/privacy/page.tsx`, `terms/page.tsx`, `cookies/page.tsx`,
  `src/app/careers/page.tsx`, `src/app/blog/page.tsx`
- `public/manifest.webmanifest`, `public/sw.js`,
  `src/components/providers/PWARegister.tsx`, `src/app/offline/page.tsx`
  (all updated to reference `/app` instead of `/dashboard`; PWA mechanism
  itself untouched)
- `src/components/marketing/ui/**` (`MarketingButton`, `MarketingPill`,
  `MarketingLayout`) — **not** deleted despite being marketing-specific,
  because `careers/page.tsx` and `blog/page.tsx` (preserved, content-clean)
  still import `MarketingButton`. Deleting it would have broken preserved
  pages. The `--marketing-*` CSS tokens it depends on are left in
  `globals.css` for the same reason. This is flagged as Phase 2 work, not
  silently carried forward — see `DECISIONS.md`.

## Edited (not deleted, not relocated)

| Path | Change |
|---|---|
| `src/app/onboarding/page.tsx` | Removed the "pick a starter planner" step (imported the deleted `lib/planners`, and was exactly the "product-specific onboarding assumption" called out for removal). Kept the real Supabase `user_metadata` preference-writing. Theme step updated to `system/light/dark`. Redirect target `/dashboard/*` → `/app`. |
| `src/app/sitemap.ts` | Removed `lib/planners` import and the planner-URL mapping; trimmed the static route list to what's actually preserved |
| `src/app/robots.ts` | `disallow` changed from `/dashboard` to `/app`, `/admin` |
| `middleware.ts` | Rewritten for the launch-mode contract (`ROUTE-MAP.md`) instead of a flat allowlist |
| `public/manifest.webmanifest` | `start_url`/shortcuts moved to `/app`; `description` and `categories` de-financialized |
| `public/sw.js` | Cached-shell paths and push-notification URL fallback moved to `/app` |
| `src/app/auth/callback/page.tsx` | Redirect target `/dashboard` → `/app` |
| `src/app/offline/page.tsx` | Copy generalized (no longer references "planners"/"checkout") |
| `src/components/providers/AppProviders.tsx` | Import path updated for relocated `ThemeProvider` |

## Not touched, out of scope for this phase

`src/app/api/billing-portal/route.ts`, `src/app/api/stripe/webhook/route.ts`,
`src/app/api/notifications/**` — commerce/notification stubs, not named for
deletion, not coupled to anything deleted, left as-is pending the future
entitlement rebuild.
