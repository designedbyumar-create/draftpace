# Indexing priorities investigation (GSC export, 2026-10-16)

Input: `draftpace_indexing_priorities_2026-10-23.csv`, 50 URLs, every one flagged by Search Console as **"Discovered - currently not indexed"** as of 2026-10-16. The CSV's own `Verified_Live_Indexing_Status` column already states the honest limit of this pass: "Not independently verified; current URL Inspection required." That limit holds here too — **this sandbox has no live network access to draftpace.com, Google Search Console, or the URL Inspection API.** Everything below is what is actually determinable by reading the real routing, metadata, sitemap and registry code that serves each of these 50 URLs, cross-checked against the Phase 1 structural audit already done on the guides corpus (`docs/seo-audit/01-06`). Anything Google-side (crawl scheduling, perceived quality, actual rendered DOM as Googlebot sees it) is named as unverifiable, not guessed at.

## Headline finding

**For all 50 URLs, the code serves a legitimate, server-rendered, sitemap-included, non-noindexed page.** No route in this list is blocked by `robots.txt`, carries a `noindex`, is missing its canonical, is excluded from `sitemap.ts`, or renders its content client-side-only (which would hide it from a crawler that doesn't execute JS fully). Nothing found here explains "discovered, not indexed" as a code defect. "Discovered - currently not indexed" is Google's own bucket for *"we know this URL exists (from the sitemap or a link), we haven't prioritized crawling/indexing it yet"* — the expected shape for a new, low-authority domain (the Phase 1 audit's own GSC export for this site showed 327 impressions and 3 clicks across 28 days), not evidence of a technical block.

The one real, reportable asymmetry is in the P0 tier, and it is **not explained by anything in the code** — see below.

## P0 — paid Companion pages (5 of 8 flagged)

Flagged: `alongside`, `family-health-binder`, `personal-life-affairs-companion`, `travel-companion`, `vehicle-maintenance-companion`.
**Not flagged** (by omission from this CSV): `home-management-companion`, `homeschooling-companion`, `personal-finance-companion`.

Checked `src/app/(marketing)/shop/[productSlug]/page.tsx` and `src/shop/registry.ts`:

- All 8 paid products have `publicationStatus: "published"` and `access: "paid"` — identical code path through `shopRegistry.listPublishedPaid()`, which is what `sitemap.ts`'s `shopRoutes` is built from. All 8 are in the sitemap; none of the 5 flagged ones is structurally different from the 3 that aren't flagged.
- `generateMetadata` sets `alternates.canonical` to the page's own `/shop/{slug}` path for every product, and only sets `robots: { index: false, follow: false }` when `publicationStatus !== "published"` — all 8 are `published`, so all 8 get the default (indexable) `robots` behavior. No product-specific noindex anywhere.
- The page is declared `export const dynamic = "force-dynamic"` (server-rendered on every request, because it calls `createSupabaseServerClient()` to resolve a per-visitor checkout link) rather than statically generated, despite having a `generateStaticParams`. This affects caching and per-request latency, not crawlability — the HTML returned to an unauthenticated request (which is what Googlebot sends) is still fully server-rendered with the product's real title, description, price and FAQ content; there is no client-only fetch gating the content. This is also identical across all 8 products, so it cannot explain why only 5 are unindexed.
- Checked file-creation dates (`git log --diff-filter=A`) as a proxy for "how new is this listing": `alongside`, `personal-life-affairs-companion`, `travel-companion`, and all 3 unflagged products were all first committed 2026-08-31; `family-health-binder` and `vehicle-maintenance-companion` were committed 2026-09-07. Age doesn't cleanly separate the flagged from the unflagged set either — two of the flagged five are the same age as all three unflagged ones.

**Conclusion:** the 5 vs. 3 split is real but not something the code explains. It is consistent with ordinary per-URL crawl-priority variance Google applies even across structurally identical pages on the same low-authority domain — but that is a hypothesis, not a verified fact, and it's the one place in this investigation where "wait for GSC data" genuinely is the only honest next step. **Action:** run URL Inspection on each of the 5 directly (not inferable from here); if any comes back "Excluded" for a reason other than crawl prioritization (e.g., "Duplicate, Google chose different canonical" against some other URL), that would be the first real code-side lead, and is worth re-checking this document against once that data exists.

## P1 — navigation (`/free`, `/guides/home`, `/guides/vehicles`) and P1 — trust (`/trust`)

- `/free` (`src/app/(marketing)/free/page.tsx`): static `export const metadata` with `alternates.canonical: "/free"`, no `dynamic` export, no robots override. Hardcoded into `sitemap.ts`'s `staticRoutes` at `priority: 0.9` — the highest of any route after the homepage, by design (see the file's own comment: "the acquisition page... ranked above every paid listing on purpose"). Fully static, fully indexable by anything in the code.
- `/trust` (`src/app/(marketing)/trust/page.tsx`): same shape — static metadata, explicit canonical, no dynamic export, no robots override, listed in `sitemap.ts` staticRoutes.
- `/guides/home` and `/guides/vehicles`: these are **not** a separate route folder — `src/app/(marketing)/guides/[guideSlug]/page.tsx` deliberately serves both life-area hubs and individual guide articles off one dynamic segment ("the slug is resolved against areas first, then guides" — see the file's own comment). `home` and `vehicles` are both real, registered `LIFE_AREAS` slugs (`src/content/areas.ts:171`, `:505`), both have guides filed under them (confirmed against the Phase 1 inventory — e.g. `car-maintenance-by-mileage-start-with-your-manual` files under `vehicles`), so `areasWithGuides()` includes both and `sitemap.ts`'s `guideHubRoutes` emits both `/guides/home` and `/guides/vehicles`. `dynamicParams = false` and `generateStaticParams` enumerate every area slug plus every guide slug at build time, so these are statically generated, not on-demand.
- One real (minor) asymmetry found: the guide-article branch of `generateMetadata` sets `robots` **explicitly** (`{ index: true, follow: true, googleBot: {...} }`), but the area-hub branch (lines 70-87 of that file) sets no `robots` key at all. Checked both the root layout and the `(marketing)` layout for a default `robots` metadata block that might fill that gap restrictively — **neither sets one**, so Next's actual default (no robots meta tag emitted, which crawlers read as indexable) applies to the hub pages. Functionally equivalent outcome to the guide pages' explicit value, just inconsistent code style rather than a live difference in indexability. Worth tightening for consistency, not because it changes what's crawlable today.

**Conclusion:** all 4 of these P1 URLs are correctly sitemapped, canonicalized, statically or simply rendered, and carry no noindex anywhere in the code or its defaults. Same "discovered, not yet prioritized for crawl" read as the rest of this list.

## P2 — editorial (36 guide articles)

All 36 flagged slugs were checked against `docs/seo-audit/01-article-inventory.csv` (the full 137-guide inventory from the already-completed Phase 1 audit) — every one resolves to a real guide (spot-verified 3 directly; all 36 are a subset of the 137 already fully link-audited in that pass). That audit already established, for all 137 guides including these 36: 0 broken links, 0 missing `primaryQuery`, 0 orphans, explicit `robots: { index: true, follow: true, ... }`, a self-referencing canonical, and (for the 2 locale-paired guides in this set, if any) reciprocal `hreflang`. `generateStaticParams` on the guide route makes every one of the 137 a statically generated page at build time (`dynamicParams = false`), so none of this list is render-on-demand or client-only content.

**Conclusion:** nothing new to find here beyond what the Phase 1 audit already confirmed structurally sound. 36 out of 137 guides showing as not-yet-indexed, on a site with 327 total impressions across all pages in the cited 28-day window, reads as ordinary new-site crawl pacing, not a defect in this set specifically.

## P2 — supporting (`/help-with` + 4 sub-routes)

`/help-with` and `/help-with/about-ask-dp` are hardcoded into `sitemap.ts`'s `staticRoutes`. The other three — `/help-with/getting-organized`, `/help-with/keeping-something-moving`, `/help-with/planning-something-important` — go through `sitemap.ts`'s `needRoutes`, which only emits a `/help-with/{slug}` entry when some published product's `needGroups` names that slug (the file's own comment explains why: 3 of the *other*, unflagged need pages — `making-a-difficult-decision`, `getting-back-on-track`, `learning-step-by-step` — have no matching product and are deliberately left out of the sitemap for that reason, which is correct and not a bug).

Checked `needGroups` across every product file: `getting-organized` is claimed by 7 of the 9 products, `keeping-something-moving` by `travel-companion` and `vehicle-maintenance-companion`, `planning-something-important` by `travel-companion`. All three are therefore in `publishedSlugs`, all three generate a sitemap entry. **All 5 flagged `/help-with` URLs are correctly sitemapped**, contrary to what the sitemap code's own comment about "3 pages with no product" might suggest at a glance — that comment is about a different 3 need-slugs, not these.

**Conclusion:** same as above — correctly indexable by every code-side signal, "discovered, not indexed" reads as ordinary crawl pacing.

## What this investigation could not verify (needs live GSC / URL Inspection)

- Whether Googlebot's actual rendered DOM for any of these 50 URLs matches what the server sends (this sandbox cannot fetch draftpace.com or run Googlebot's renderer).
- Current `Verified_Live_Indexing_Status` for any URL — the CSV's own value for all 50 rows is already "not independently verified," and that remains true after this pass.
- Whether Google is treating any of the 5 flagged P0 pages as a duplicate of another URL and silently picking a different canonical (this is the one scenario consistent with the evidence here that *would* be a real code-adjacent issue, but it can only be confirmed via URL Inspection's "Google-selected canonical" field, not from the codebase).
- Crawl budget / scheduling decisions generally — these are Google-internal and not inferable from the repository.

## Recommended next action

Re-run URL Inspection (live, in GSC) specifically on the 5 flagged paid-product pages, since that's the one tier with an unexplained asymmetry against otherwise-identical sibling pages. For the other 45 URLs (P1 navigation/trust, P2 editorial, P2 supporting), the code gives no reason to expect a different outcome from "wait for more crawl budget as the domain's own authority builds" — consistent with `docs/seo-audit/06-remaining-roadmap.md`'s existing recommendation to re-pull Search Console in 4-6 weeks rather than acting on a 28-day, low-volume sample now.
