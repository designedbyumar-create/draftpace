# SEO Foundation

Written at the point development was frozen (October 2026) to hand off a
working technical foundation plus a real keyword/topic map, before the
focus shifts to distribution, content, backlinks, and parasite SEO. This
is not a checklist that was executed top to bottom; it is the record of
an audit that found the foundation already largely correct, the handful
of real gaps it closed, and the architecture that was already there to
build on.

## What was already solid before this pass

Worth stating plainly, because it changes what "SEO work" means from
here: this was not a greenfield SEO buildout. The technical foundation
was already built with real reasoning behind it, not defaults:

- **Redirects** (`next.config.ts`): a working permanent-redirect system
  already existed for 19 renamed guides, with the apex/www redirect
  deliberately left to Vercel's own domain config rather than duplicated
  here (a documented infinite-loop trap if it had been).
- **`robots.ts`**: disallows `/app`, `/admin`, `/api/` (all session-gated
  or non-page), explicitly names every major AI crawler rather than
  trusting a wildcard, and points at the real sitemap.
- **`sitemap.ts`**: honest `lastModified` (never a fabricated "now" on
  every deploy), real priority tiering with stated reasoning (hubs above
  articles, the free product above paid ones), hreflang for the US/UK
  guide twins, and already excludes thin/dead-end pages and redirect
  targets from being indexed at all.
- **Canonical tags**: present on every real marketing page (one
  false-seeming gap, `/blog`, is a redirect with nothing to canonicalize).
- **Structured data** (`src/lib/structuredData.ts`): Organization,
  WebSite, Person, WebApplication, Article, FAQPage, BreadcrumbList and
  CollectionPage builders already existed, already wired into real pages,
  already honest (no fabricated ratings or review counts, per the
  `softwareApplicationStructuredData` comment, which says so directly).
- **Per-guide metadata discipline**: every one of 137 guides already
  carries a `primaryQuery` field (2 to 12 lowercase words), and
  `guideMeta.test.ts` already fails the build if two guides collide on
  the same query or if one is missing. Keyword cannibalization across the
  guides layer was already a solved, tested problem before this pass.
- **Image alt text**: every `alt=""` found in an audit sweep was a
  genuinely decorative image (icons beside text that already names the
  thing, a gallery thumbnail inside a button that already carries an
  `aria-label`, an abstract area mark explicitly commented "Decorative").
  Nothing here needed fixing.

## Changes made in this pass

1. **`/store` → `/shop` permanent redirect** (`next.config.ts`). The old
   pre-Phase-1 catalog route was deleted months ago but Google still had
   `draftpace.com/store?category=habits` indexed with real impressions
   (Search Console). It was hard-404ing. Now it 308s to the real catalog.
2. **JSON-LD escaping gap closed.** `jsonLd()` exists in
   `structuredData.ts` specifically to escape `<` so a value can never
   truncate its own `<script>` tag, but every real call site was bypassing
   it with raw `JSON.stringify`. Fixed all 7 (sitewide Organization/
   WebSite, the homepage, About, the case study, and the Shop product
   page's Product + FAQ schema). The Shop product page was the one with
   genuine risk: its schema is built from editorial product copy, not
   hardcoded strings.
3. **`CollectionPage` + `BreadcrumbList` added to `/shop` and `/guides`.**
   Every area hub already had this (`collectionStructuredData`); the two
   top-level index pages, one level up, did not. Generalized
   `collectionStructuredData` itself in the process: it used to hardcode
   `/guides/${slug}` into every item's URL, which was correct for guides
   and would have been silently wrong the moment it was reused for Shop
   products. It now takes each item's own full path. Added a test that
   fails with a named, specific message if that regresses (verified: broke
   it on purpose, watched it fail, restored it).
4. Added a visible two-item breadcrumb (`Home / Shop`, `Home / Guides`) to
   both index pages, because the structured data's own rule, already
   enforced throughout this codebase, is that BreadcrumbList markup must
   match what a reader can actually see.

## Remaining issues (that genuinely matter)

- **Google Search Console isn't verified yet.** Separate from this pass,
  still open: no `google-site-verification` TXT record currently exists
  in DNS (confirmed directly), and the code already supports the
  alternative HTML-tag method (`GOOGLE_SITE_VERIFICATION` env var in
  `src/app/layout.tsx`) but that variable isn't set anywhere either. Pick
  one method and finish it; both exist and work, neither is done.
- **`/guides/available-balance-vs-current-balance` is the single highest-
  impression page in Search Console (13) sitting at position 57.** That
  gap, real interest but weak ranking, is the one concrete "quick win"
  candidate in the current data. It is a content/authority question
  (internal links, depth, maybe external links), not an infrastructure
  one, so it's named here rather than acted on in this pass.

## Keyword and topic architecture

The ownership system already exists; it was built into the content model
rather than kept in a spreadsheet. `primaryQuery` on every guide and
`searchedProblems` on every product are the same real, natural-language
search phrases a visitor would actually type, sourced once in
`src/content/askdp.ts` and reused rather than re-invented per surface.
What follows is that system assembled into the mapping the brief asked
for, not a new one invented on top of it.

**Structure**: Home → 8 life areas → product(s) under each area → guide
cluster under each area (137 guides total) → individual guide. One
exception: Money is the only area with two products (Monthly Money Reset,
free, and Personal Finance Companion, paid) sharing one cluster of 26
guides, because they solve the same situation at two different depths
rather than two different situations.

| Area (hub URL) | Product(s) → target URL | Primary intent | Guide cluster | Long-tail sources |
|---|---|---|---|---|
| Money (`/guides/money`) | Monthly Money Reset → `/free`; Personal Finance Companion → `/shop/personal-finance-companion` | "You are never quite sure what is actually safe to spend" | 26 guides | "available balance vs current balance", "budget with irregular income", "debt snowball or avalanche", "how couples split bills" |
| Home (`/guides/home`) | Home Base → `/shop/home-management-companion` | "The house needs things done and nobody is holding the list" | 16 guides | "lost the manual, receipt and warranty", "how often do home systems need servicing", "just bought a house what needs doing" |
| Mind and focus (`/guides/mind-and-focus`) | ADHD Life Companion → `/shop/alongside` | "You know what to do and still cannot make yourself start" | 19 guides | "I have brain fog and can't face life admin", "left something half finished", "not procrastination, to-do lists make it worse" |
| Family and learning (`/guides/family-and-learning`) | Homeschooling Companion → `/shop/homeschooling-companion` | "You are teaching at home and cannot account for the year" | 17 guides | "what homeschool records am I required to keep", "how do I know if my child learned something", "homeschool portfolio" |
| Affairs and endings (`/guides/affairs-and-endings`) | Personal Life Affairs Companion → `/shop/personal-life-affairs-companion` | "Somebody would need to find all of it, and nobody could" | 20 guides | "what to write down in case something happens to me", "named executor, do not know what that involves", "pension goes to whoever is on the form" |
| Travel (`/guides/travel`) | Travel Companion → `/shop/travel-companion` | "One flight moves and you cannot remember what else it touches" | 15 guides | "flight changed, what else is affected", "hotel cannot find my reservation", "what to keep on paper when I travel" |
| Vehicles (`/guides/vehicles`) | Vehicle Maintenance Companion → `/shop/vehicle-maintenance-companion` | "You cannot remember what interval you were quoted, or when anything was last done" | 11 guides | "bought a used car with no maintenance records", "stop a shop doing work I didn't authorize" |
| Family health (`/guides/family-health`) | Family Health Binder → `/shop/family-health-binder` | "Everyone's medications and allergies live only in your own memory" | 11 guides | "what should I bring to a doctor's appointment", "camp and school health forms every year" |

Full guide-level `primaryQuery` ownership (all 137, each unique, each
tested) lives in `src/content/guides.ts`, not duplicated here, since a
static copy in a doc would drift from the enforced source the moment one
guide changes.

**What the guide cluster sizes say, read carefully**: Money (26) and
Affairs and endings (20) are the deepest clusters, Vehicles and Family
health the thinnest (11 each), not because they matter less, but because
they're the newest two products (vehicle-maintenance-companion and
family-health-binder shipped later than the rest). That's a content
backlog to be aware of, not a gap to close before unfreezing.

## GSC observations

Three months of real data, 83 total impressions, 1 click. Per the brief's
own instruction, this is early evidence, not a strategy input.

**What it does tell us**: guides are being crawled and surfaced for
genuinely on-topic queries (banking terms matching Personal Finance
Companion guides, travel and homeschool queries matching their own
clusters), confirming the guide-to-intent mapping above is already
working as designed, not just in theory. The homepage and several
category pages (`/shop`, `/about`, `/how-it-works`) are also appearing.
Devices skew mobile. Countries are broad and unconcentrated (17 countries
represented from 1-6 impressions each), which reads as early, undirected
discovery rather than any real geographic signal yet.

**What it does not tell us**: anything about keyword volume, anything
about which of the 137 guides or 9 products will actually perform,
anything that should change the architecture above. A handful of queries
ranking at position 80-100 with 1 impression each is Google's crawler
finding the page, not a ranking signal worth reacting to.

**One real artifact found while investigating this data**: Search
Console also showed `www.draftpace.com/store?category=habits` indexed,
confirming Google had crawled the pre-rename site on both the www
subdomain and the old route. The www redirect was already correct
(Vercel-level, confirmed live); the `/store` route is the one this pass
fixed.

## Parasite SEO foundation

Not a content calendar, an intent map: which of the real search phrases
already captured in `searchedProblems` suit which external platform, so
distribution work later has somewhere real to start rather than a blank
page.

- **Pinterest**: the checklist- and list-shaped guides are the natural
  fit: "travel document checklist," "home maintenance checklist by
  month," "winterize your house checklist," "moving into a rental what to
  document." These are inherently save-and-return content, and the
  guides' own metadata is already pre-built for this
  (`max-image-preview: large` is explicitly set on every guide's robots
  meta for exactly this reason).
- **Quora**: the direct-question phrases translate almost verbatim:
  "How do I make an if-something-happens-to-me file," "What should I
  bring to a doctor's appointment," "How often should I really change the
  oil." Quora's native format is the question itself; these `searchedProblems`
  entries already are that question.
- **Reddit**: the first-person, struggle-framed phrases fit community
  answers better than literal titles, like "I hate budgeting and I've tried
  everything," "I have brain fog and can't face life admin," "I keep
  getting charged for subscriptions I forgot about." The right unit here
  is a genuine, specific answer in a relevant subreddit (r/personalfinance,
  r/ADHD, r/homeschool) that happens to link to the deeper guide when it
  adds real value, never a dropped link with no answer attached.
- **Medium / Substack**: the reflective, slightly contrarian pieces, not
  the checklists: "why your available balance is lying to you," "why
  productivity tools fail at life admin." These argue a point rather than
  list steps, which is what long-form platforms reward.
- **Guest posts**: obvious per-vertical fits exist (parenting/homeschool
  blogs for Family and learning content, personal-finance blogs for
  Money, travel blogs for Travel) and are worth pursuing opportunistically
  rather than as a campaign.
- **LinkedIn**: deliberately not listed above anything specific. This is
  consumer, personal-life-admin content; forcing it onto a B2B-postured
  platform would be the "SEO theater" the brief warned against, not a
  real opportunity.

Every item above routes back to real, already-written Draftpace content
(a guide or a product page), never a new parasite-only article invented
to exist only off-site. That's deliberate: the external content earns
the right to ask for a click by being genuinely specific and useful
where it lives, not by exists purely as a funnel.

## Deferred (and why)

- **A site-wide performance audit.** Out of scope by the brief's own
  instruction ("do not turn this into a general performance refactor").
  Nothing found in this pass's spot-checks suggested an urgent Core Web
  Vitals problem, but it was not exhaustively audited either.
- **New content to fill the Vehicles/Family health guide gap.** Real, but
  it's content work for the next phase, not an infrastructure blocker.
- **A Product-level `AggregateRating` or review schema.** Deliberately
  not implemented, the same way the existing `softwareApplicationStructuredData`
  already refuses to fabricate one. Add it only when real reviews exist.
- **Restructuring the 8-area, 1-to-2-product information architecture.**
  Audited, found already coherent (one hub per product situation, guides
  clustered correctly underneath), and the brief was explicit: don't
  change IA without a real reason. None was found.
