# Product-discovery campaign: Personal Finance Companion & Homeschooling Companion

First acquisition-campaign pass for the two prioritized Companions. No new applications were created, none of the 137 guides were rewritten, and the other six Companions are unchanged (verified below, not just claimed). Everything here comes from reading this repository's own real product definitions, page code, and existing analytics, plus web research on real competitor positioning and real user language where it was findable. Where research could not confirm something (no Reddit threads surfaced, no live Capterra/G2 data), that gap is stated rather than papered over.

## 1. Current visitor journey (as it existed before this branch)

```
Guide (money or family-and-learning area)
  -> reads the full article
  -> ends in a text-only "Handover" panel: a label, the product title,
     the same promise sentence already used in the hero, and a
     "See what it does" link. No image, no proof, just prose repeated
     a second time.
  -> /shop/{slug}
       hero: a static, hand-drawn recreation of the product's real
       screens (ProductScreenCarousel) + title + promise + price +
       buy button + 4 output bullets
       DetailTabs below: What's included / Is it for you? / How it
       works / Questions
  -> GetAction button
       signed out -> /signup?redirectTo=... -> back to the product page
       signed in  -> CheckoutButton (Lemon Squeezy overlay)
  -> webhook grants the entitlement
  -> /app, the product's own first-run tour
```

A second, separate asset already existed but was never on this path: **LiveDemo** (`src/components/public/home/LiveDemos.tsx`), a small working recreation of each product built from the product's own real logic (the debt payoff comparison for Personal Finance Companion, the per-child daily check-off for Homeschooling Companion), not a screenshot. It was reachable only from the homepage: scroll past the hero, find the right row among all eight Companions in an accordion, click the caret to open it. Nothing on the two products' own pages, and nothing in any guide, pointed to it.

## 2. Concrete problems vs. design opinions

Kept separate on purpose, per the brief. "Concrete" below means: traceable to the actual rendered order of real fields in the real code, not a stylistic preference.

**Concrete (verified in code):**

1. The only real, working, logic-grounded demonstration of either product's claims (LiveDemo) had zero path to it from either product's own Shop page or from any guide that hands a reader to that product. Grep confirmed `LiveDemo` was imported in exactly three places before this branch: the homepage accordion, a second, unused legacy homepage component, and the `/how-it-works` page. Not the Shop page, not the guide `Handover`.
2. Personal Finance Companion's hero promise listed seven account-type nouns ("accounts, income, bills, subscriptions, transactions, debt, and savings") before stating any single concrete number, and introduced the product's actual headline feature name, "Available Money" (used verbatim in `problemsSolved[0]` and the `tasks` list), only three bullet points later in "What you end up with," with no definition anywhere above it.
3. Homeschooling Companion's single most differentiating structural fact, that every child's plan, record and checks are kept entirely separate (the product's own `audience` field names this explicitly, and a real "record keeping with multiple kids" thread on a homeschooling forum confirms it's a named, recurring pain point, see Section 3), appeared nowhere in the hero promise. A first-time visitor had to reach the second audience bullet to learn it.
4. The guide `Handover` panel's body text was the identical sentence already shown in the Shop page hero. It repeated a claim rather than adding a second, different kind of evidence for it.

**Design opinions (not asserted as defects, offered as judgment calls in the messaging proposal below):**

- Whether "Available Money" as a proper noun is the clearest possible label is a stylistic question the product's own UI has already answered; this pass works within that existing name rather than relitigating it.
- Whether the homepage accordion is the right primary home for LiveDemo is unchanged and untouched; this pass adds a second, closer-to-intent home for it, it doesn't argue the first one is wrong.

## 3. Market research: real competitor positioning, real user language

Web search only; no search-volume numbers are claimed or invented anywhere in this document. Where a search didn't surface independent evidence (several Reddit queries returned no threads), that's stated below rather than hidden.

**Personal Finance Companion's category:**
- Monarch Money and Copilot Money both lead with "all your accounts, in one place" / "your entire financial picture in one place", and both require connecting real bank, card, and investment accounts to deliver that. YNAB leads with "assign every dollar." None of the three big players in this category let you opt out of bank-account linking.
- A smaller, more specific cluster of apps (SafeToSpend, SpendLedger, and the "Simple" app's own old pitch) compete on a different, narrower question: not "what's my balance" but "what's actually safe to spend," explicitly contrasted against apps that "only track money after it's gone." This is the same framing Draftpace's own `problemsSolved[0]` already uses ("One Available Money figure... that shows where the rest of your balance goes"), independently validated as a real, working category convention rather than an invented one.
- Several of these smaller apps lead with "no banking details required" / "stays on your device" as a trust point. Draftpace's manual-entry, no-bank-linking model is a genuine point of difference against the category's three biggest names, not a workaround to apologize for; it's worth saying plainly rather than only answering as an objection ("Does it connect to my bank?").
- On subscriptions specifically: Rocket Money and similar trackers market heavily against "forgot what I'm being charged for." No independent Reddit confirmation was found in this pass (searches returned vendor pages and app-store listings, not raw threads), so this is reported as a validated marketing angle across competing products, not as independently confirmed user sentiment.

**Homeschooling Companion's category:**
- Homeschool Planet, the clearest direct competitor found, positions itself around transcripts, grade recording, customizable grading scales, and report cards, exactly the comparison-and-measurement vocabulary Homeschooling Companion's own file deliberately bans ("behind", "grade level", "proficient", "on track"), enforced by an existing test in this repo. This is a real, confirmable point of difference, not an invented one.
- Real forum and blog discussion (Well-Trained Mind forums, Simply Charlotte Mason forums, a homeschool record-keeping blog) independently describes the same behaviors the product is actually built around: logging what happened as it happens rather than reconstructing it later, a simple weekly list, checking state requirements before choosing a method, and a forum thread specifically titled "record keeping with multiple kids," naming the exact pain point in audience bullet #2.
- Review commentary on comparable record-keeping tools names setup time as a real hesitation ("I'm just not sure I am willing to put in the time") and names ease of use as a real praise point for simpler tools. This directly supports Homeschooling Companion's own existing claim ("Nothing is required... works from whatever you give it, including nothing") being worth foregrounding rather than assuming it's self-evident.

Sources (web search, standard mode, October 2026): Monarch Money's own site and marketing pages; SafeToSpend, SpendLedger, and Simple App Store/vendor copy; Rocket Money and MindSubs vendor pages; Homeschool Planet's own site; Well-Trained Mind Forums ("record keeping with multiple kids"); Simply Charlotte Mason forum; a homeschool record-keeping blog (allinonehomeschool.com); The Old Schoolhouse product reviews.

## 4. Messaging changes (implemented)

Both changes are a single-field edit to the real `promise` text already read by the Shop page hero, the homepage accordion blurb area (where applicable), and the guide `Handover`. No new capability is claimed anywhere; both new sentences restate fields that already existed in the same product file (`problemsSolved`, `audience`, `questions`). Confirmed against this repo's own enforcement tests (banned-word lists, the no-em-dash rule, the "never connects to a real bank" requirement) — all pass, see Section 6.

**Personal Finance Companion**
- Before: "One always-current picture of your accounts, income, bills, subscriptions, transactions, debt, and savings, with exactly one useful next move at a time."
- After: "One Available Money figure that says what's actually safe to spend right now, worked out from your accounts, income, bills, subscriptions, transactions, debt and savings together, with exactly one useful next move waiting each time you open it."
- Why: leads with the concrete, already-shipped feature name and defines it in the same clause, using the "safe to spend" framing independently validated in Section 3, instead of making a first-time visitor wait three bullets for a concrete figure.

**Homeschooling Companion**
- Before: "A printed handbook and an app that remembers. You decide what your children learn; this keeps track of what you actually did, tells you the next useful thing, and helps you check whether it landed."
- After: "A printed handbook and an app that remembers, each child kept entirely separate. You decide what your children learn; this keeps track of what each one actually did, tells you the next useful thing per child, and helps you check whether it landed, never compared to anyone else's pace."
- Why: surfaces the single most differentiating, independently-validated fact (separate per-child tracking) in the first sentence instead of the second audience bullet, and states the product's real "no comparison" behavior (already answered in `questions`) as a benefit up front rather than only as a defensive FAQ answer.

## 5. Discoverability: the real demo, made reachable

New component `TryItDemo` (`src/components/public/shop/TryItDemo.tsx`) renders the existing `LiveDemo` in place, themed in the product's own real colours (reusing `posterTheme`, extracted unchanged from the homepage into `src/product-framework/posterTheme.ts` so both surfaces share one derivation instead of two copies). It is **opt-in per call site**: nothing renders it for a product that doesn't explicitly ask for it.

Two call sites, both gated to the two priority slugs only:
1. `/shop/personal-finance-companion` and `/shop/homeschooling-companion`: a new "See it work" section directly below the buy box, before the detail tabs, so it's the first thing encountered after the fold rather than requiring a trip back to the homepage.
2. The guide `Handover` panel, for guides filed under the Money or Family & Learning areas: the same demo now renders under the existing pitch, so a convinced reader sees proof in place of only a repeated sentence.

No fake or disconnected demo was built. `LiveDemo`'s own file documents that it runs the product's real logic (`comparePayoff` for the debt plan, the real check-off state machine for Homeschooling) against clearly-labeled sample data, never anyone's real records. This pass reuses that existing, already-tested component rather than authoring a new one.

The other six products' Shop pages and guide handovers render through the exact same shared code paths, gated off by the same slug check, and are confirmed unchanged by screenshot (Section 7) and by the fact that no other product file was edited.

## 6. Privacy-conscious funnel analytics (implemented)

New event, added to the existing GA4 pipeline (`src/lib/analytics/gtag.ts`, unchanged), which already documents "NEVER PASS PII HERE" and accepts only scalar values:

- `view_product_demo` — fires once when the new demo section mounts, with `product_id` and `product_slug` only.
- `interact_product_demo` — fires once, on the visitor's first click/tap/keypress inside the demo, same two scalar parameters.

This fills a real, previously-missing mid-funnel signal: the existing pipeline already had `view_product` (page load) and a checkout-click event, but nothing in between answering "did anyone actually engage with the proof, or did they scroll past it." Implemented as `ProductDemoTracker` (`src/components/analytics/ProductDemoTracker.tsx`), following the same pattern as the existing `ViewProductTracker`. It never reads or reports anything the visitor enters (the demo itself uses fixed, labeled sample data, never real account or child information), and nothing here touches checkout, pricing, Supabase auth, or Lemon Squeezy code.

## 7. Verification

- **Checkout and pricing:** not modified. Personal Finance Companion still prices at $49 (was $99, 51% off) and Homeschooling Companion at $34 (was $69, 51% off), confirmed by screenshot against the running app (Section 8's image list), and no `price`, `compareAtPrice`, `access`, or checkout-resolution code was touched in any file this branch changes.
- **Mobile presentation:** confirmed by screenshot at a 390px viewport for both priority products; the new demo section reflows to full width with no horizontal overflow.
- **The other six products:** confirmed unchanged both by code (the new render paths are gated by an explicit two-slug allowlist, and no other product's `.ts` listing file was edited) and by screenshot of Travel Companion's Shop page, which renders identically in structure to before, with no new section.
- **Links:** the new "See it work" sections and the guide `Handover` demo introduce no new outbound links; the existing "See what it does" / "Get Lifetime Access" links are untouched.
- **Page speed:** no new library was added and no new network request is introduced; `LiveDemo` was already shipped in the client bundle for the homepage, and this reuses that same component rather than adding a second implementation. A precise before/after bundle-size number could not be produced (this Next.js version's build output didn't print a per-route size table in this environment), so this is reported as "minimal by construction," not as a measured figure.
- **Quality gates**, all run against this branch:
  - `npx tsc --noEmit`: clean.
  - `npx eslint .`: 0 errors, 9 pre-existing warnings unrelated to this change (verified identical warning set against the base branch's known pattern).
  - `npm run test`: 3431 tests passed, 259 files, including all 63 Shop-listing tests (banned words, no-em-dash, bank-connection disclosure) and the full `src/content` guides suite.
  - `npm run build`: compiled successfully, all static and dynamic routes generated, including `/shop/[productSlug]` and `/guides/[guideSlug]` and their 137+ generated guide paths.

## 8. Files actually changed

- `src/product-framework/posterTheme.ts` — new. Theme-token derivation extracted unchanged from the homepage.
- `src/app/(marketing)/page.tsx` — homepage now imports `posterTheme` instead of defining it locally; behavior unchanged (same function, same inputs, same outputs), confirmed by the full homepage-adjacent test suite passing and the Travel Companion screenshot.
- `src/components/analytics/ProductDemoTracker.tsx` — new. Privacy-safe demo view/interact event wrapper.
- `src/components/public/shop/TryItDemo.tsx` — new. The reusable "See it work" panel.
- `src/app/(marketing)/shop/[productSlug]/page.tsx` — adds the gated "See it work" section.
- `src/app/(marketing)/guides/[guideSlug]/page.tsx` — `Handover` gains an optional `demo` prop, passed only for the two priority slugs.
- `src/shop/products/personal-finance-companion.ts` — `promise` field only.
- `src/shop/products/homeschooling-companion.ts` — `promise` field only.

Nothing else changed. No guide content, no pricing, no checkout logic, no account/auth code, no other product's listing.

## 9. What this does not cover

Per the brief's own scope: no new application, no rewritten guides, no change to the other six Companions beyond confirming they're untouched, no invented search-volume numbers, no fabricated video or image assets (the marketing asset briefs in this folder are concepts and scripts for someone to produce, not rendered output).
