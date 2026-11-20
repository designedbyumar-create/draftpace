# Post-rebuild SEO audit: the 137-guide library, 2026-11-17

Audited against the real content that shipped to `main` in commit `583503f` ("Rebuild all 137 guides with useful visuals and worksheets"), using a fresh Search Console export (`draftpace.com-Performance-on-Search-2026-11-17.zip`, Last 6 months, US, Web text-based search). Every number below is computed from the actual `GUIDES` array (post-revision-merge, i.e. what the site actually renders) or from the GSC export's own rows, not estimated. Findings are split into **verified** (checked against the real data/files) and **recommended** (a judgment call for you to weigh), the same discipline the last audit used.

## 0. What the GSC export can and can't tell us right now

- **It mostly predates the rebuild.** The rebuild merged into `main` today (2026-11-17), the same day as this export's cutoff. A "Last 6 months" window is almost entirely measuring the *old* content's performance. Nothing here should be read as "the rebuild worked" or "the rebuild didn't work" — it's too early for Google to have recrawled, let alone re-ranked, any of it.
- **It's a thin, partial export.** `Pages.csv` lists only 20 URLs and sums to 112 impressions; `Countries.csv` reports 372 total impressions for the same period. GSC's UI export caps rows, so this is the *top* slice, not the full picture — treat absence from these lists as "not in the visible top rows," not "zero."
- **The domain is still pre-authority.** 372 impressions and 1 click over 6 months, average position ~24.6 across devices (but most individual pages sit at position 45-95 — page 5+). This matches the October finding from the prior audit almost exactly: this is a new-domain crawl-and-trust problem, not something any amount of on-page rewriting fixes quickly. I'm stating that plainly so the recommendations below aren't oversold.
- One real signal worth keeping: a **Product rich result** (`Search appearance: Product snippets`) is already appearing at position 3 for something in `/shop`. It got the impression but 0 clicks — a real, if tiny, CTR gap worth a look later, but outside this audit's scope (guides, not shop).

## 1. Structural audit (all 137, machine-checked)

Run via the project's own test runner against the live `GUIDES` export, same method as the prior audit.

| Check | Result |
|---|---|
| Guides present | 137/137 |
| FAQ block present | 137/137 |
| Broken `related`/`next`/inline links | 0 |
| Duplicate `primaryQuery` | 0 |
| Duplicate `dek` | 0 |
| Meta description out of the 120-158 char range | 0 (actual range: 129-155) |
| Title over 60 characters | 0 |
| Printable worksheet exists on disk | 137/137 (135 under `library/`, plus the 2 flagship ones) |
| Word count | min 894, max 1,734, avg 1,188 — nothing thin |

**9 guides have no `sources` array**: `simple-homeschool-record-keeping-system`, `can-you-afford-it-before-you-buy-it`, `life-admin-the-work-nobody-teaches-you`, `why-productivity-tools-fail-at-life-admin`, `how-to-save-money-fast`, `how-to-start-over-after-budget-failure`, `end-of-month-money-review`, `home-maintenance-log-template`, `how-to-say-no-or-give-bad-news-on-the-phone`. I checked all 9 for the kind of claim that would need one (named regulator, law, percentage, statute) — **zero matches**. These are organizing/behavioral method pieces, not factual-claim pieces. Consistent with the site's own stated rule (cite only where you make a checkable claim). Not a gap.

**2 guides have zero `related` picks**: `life-admin-the-work-nobody-teaches-you` and `why-productivity-tools-fail-at-life-admin`. Both are `SERIES`-tagged (not filed under a life area) and point at each other via `next`. That's a deliberate 2-part series, not an orphan, but it's the thinnest link profile in the corpus — every area-filed guide gets 2-3 curated `related` picks and these get none. Worth adding one or two `related` picks each into a concrete execution guide (e.g. `how-to-make-a-phone-call-you-have-been-avoiding`, `the-if-something-happens-to-me-file`) so a reader who lands on the conceptual pair has somewhere to act, not just the other half of the pair.

**Country scope was applied narrowly.** The rebuild added a new `scopeCountry` field specifically to stop claiming a false locale/hreflang pair on US-only content (good instinct — this was a real gap in the old corpus). But it's only set on 2 guides (`where-to-look-for-a-will`, `who-to-tell-when-someone-dies`). I scanned the other 135 for the same signal (mentions of IRS, Medicare, state law, probate court, etc. with no `locale` or `scopeCountry` at all) and found **19 more plausible candidates**: `how-to-find-someones-accounts-after-they-die`, `homeschool-record-keeping-requirements-by-state`, `homeschool-record-keeping-template`, `beneficiary-forms-override-your-will`, `which-documents-to-keep-and-where-to-put-them`, `what-to-keep-after-a-home-repair`, `sort-out-your-finances-after-a-life-change`, `homeschool-attendance-what-to-track`, `simple-homeschool-record-keeping-system`, `how-long-to-keep-homeschool-records`, `moving-into-a-rental-what-to-document`, `organize-your-finances-from-scratch`, `financial-binder-what-to-include`, `paperwork-pile-where-to-start`, `homeschool-notice-of-intent-explained`, `do-you-have-to-count-homeschool-days-or-hours`, `emergency-contact-and-medical-decision-maker`, `safe-deposit-box-and-spare-keys-who-can-open-it`, `what-happens-to-your-pets-if-something-happens-to-you`. This is a heuristic list, not a verdict — each needs a human read to confirm it's genuinely US-only before tagging it, same as the 2 that already got it. **I did not tag these myself**; it's an editorial call on each one, not a mechanical fix.

## 2. Two real copy bugs found and fixed

Reading the worksheet call-to-action line for all 135 library articles (not just the handful below), two were grammatically broken:

- **`car-maintenance-by-mileage-start-with-your-manual`**: the link text and worksheet `<title>`/`<h1>` read *"Open the free **from the manufacturer** maintenance schedule"* / *"From the manufacturer maintenance schedule"* — not valid English, looks like a dropped word from the generation step.
- **`safe-deposit-box-and-spare-keys-who-can-open-it`**: read *"Open the free **safe, box** and spare-key access record"* — a stray comma splitting "safe-deposit box" into two things.

Both are fixed in this PR, in the live content (`library.generated.json`, `library-info.generated.json`) and the two already-generated static worksheet HTML files (`public/guides/print/library/*.html`), since those are pre-rendered files the JSON fix alone wouldn't touch. I scanned all 135 CTA lines for the same pattern and found no others — this was two isolated slips, not a systemic template bug. The other 133 are well-written and genuinely distinct from each other (not a cloned template with slugs swapped in), which is worth saying plainly since it's the easy failure mode for 137 auto-assembled sentences.

## 3. Deep read: the 5 highest-signal articles

I read the full body of the GSC's top-impression legacy pages (`doctor-appointment-prep-checklist`, `car-maintenance-by-mileage-start-with-your-manual`, `homeschool-notice-of-intent-explained`, `monthly-bills-list`) plus the other flagship interactive one (`four-day-homeschool-week`), against real on-page SEO and E-E-A-T criteria, not just the structural checklist above.

**What's genuinely strong, worth naming so it doesn't get lost in the "what's lacking" list:**
- Real primary sources with retrieval dates (AHRQ, IHI, Florida Statutes §1002.41, NC DOA, FTC, NHTSA, CFPB, Sonlight, NYC Public Schools), each annotated with exactly what it supports and what it doesn't ("not a national rule," "not permission to wait 30 days anywhere else"). This is the actual substance of E-E-A-T — not a trust badge, but every claim traceable and scoped correctly.
- Invented examples are labeled as invented, every time, in-line ("This example is invented," "An invented adult follow-up"). No guide lets a fabricated scenario pass as evidence.
- The product handoff at the end of each (Family Health Binder, Homeschooling Companion) is soft and conditional ("Check its current features and choose it only if it fits how you work") — not a pitch wedged into an organic result, which is exactly the tone a page competing on trust needs.

**Concrete, evidence-backed gaps (not style opinions):**

1. **`doctor-appointment-prep-checklist`'s title doesn't match its own best-performing query.** GSC's single largest query across the *entire* export is **"doctor visit checklist" — 35 impressions**, more than every other page and query combined besides it. The page's title, H1, `primaryQuery`, and meta description all say "doctor **appointment** checklist." The phrase "doctor visit checklist" appears exactly once, inside the dek. Google is already showing this page for the exact high-volume phrase it isn't optimized for, at position 61.8. This is the single highest-leverage, best-evidenced change available in the whole corpus: work "visit" into the title/H1/meta alongside "appointment" (both appear as real search behavior in the query list — "doctor appointment checklist" also gets impressions, just fewer), rather than picking one and dropping the other.
2. **`homeschool-notice-of-intent-explained` doesn't use the phrasing people actually search.** The GSC query list for this page's topic includes "**letter of intent** to homeschool," "**declaration of intent** to homeschool," and two state-specific variants ("tennessee intent to homeschool form," "intent to homeschool florida"). The article is well-matched to the Florida query already (it uses Florida as its own worked example) but never once uses the phrases "letter of intent" or "declaration" anywhere in the body — only "notice." These are real synonyms some states use for the identical document; a reader arriving from one of those searches gets no on-page confirmation they're in the right place. Worth one sentence near the top naming the synonyms directly.
3. **`car-maintenance-by-mileage-start-with-your-manual`'s title drops a word its own `primaryQuery` and dek use.** `primaryQuery` is "car maintenance **schedule** by mileage"; the dek says "maintenance **schedule**"; the title says "Car maintenance **by mileage**: read your own schedule" — "schedule" is pushed to the back half, after a colon, rather than appearing in the keyword phrase itself. Minor compared to #1, but same category of gap: the exact phrase being targeted doesn't appear intact in the H1.

None of these are claims that fixing them will move rankings by any particular amount — position 24-95 on a 6-month-old near-zero-authority domain is dominated by domain trust, not title wording. But they're real, checkable mismatches between what the page says and what the evidence (GSC's own query data) says people actually type, which is squarely an SEO-expert-level finding rather than a style preference.

## 4. The free worksheets: the real "what's lacking"

This is the one place I'd put real weight behind "needs improvement," because it's consistent across all 135 (not a handful), and it's the part of the system furthest below the quality bar the rest of the site sets.

Every worksheet (I read 6 across different categories: money, homeschool, health, travel, car, life-admin, plus both flagship ones) is the same bare template: a plain `<h1>`, one intro line, then a stack of `<h2>` section labels each followed by one or two empty underlined boxes to write in, a one-line disclaimer footer, and a tiny "back to the guide" link. That's it. Specifically missing, compared to the rest of the site's own design system (`src/design-system/`, which every other surface uses):

- **No brand presence at all.** No Draftpace wordmark, no logo, no product accent color (the site has a whole accent-per-life-area system everywhere else). The doctor-appointment one has a text line "DRAFTPACE / FAMILY HEALTH" — the only worksheet of 137 with any brand mark whatsoever, and it's plain text, not the logo.
- **No visual variety for different content types.** Several worksheets structurally ask for a comparison (e.g. the "status" fields on subscription/cancellation trackers) or a checklist (several say `"checkable": true` in the source article's own list blocks) — but every worksheet renders the exact same blank-line-under-a-heading layout regardless, never an actual checkbox, never an actual table, even where the article's own structured data (`kind: "table"`, `kind: "list", checkable: true`) says the content is naturally one.
- **No filled example anywhere**, even though several of the source articles go out of their way to show a filled, invented example in the article body itself (`doctor-appointment-prep-checklist`'s own "filled example" table, for instance). The worksheet that's supposed to be the practical companion piece doesn't carry that example over.

This matters for more than aesthetics: these are the pieces most likely to be printed, screenshotted, or handed to someone else (a sitter, a co-parent, a mechanic) — exactly the moment a brand mark earns a future visit, and exactly the moment a plain photocopy-looking page gets no credit for where it came from. 135 identically bare documents is also a missed differentiation opportunity against every other "free printable checklist" site, most of which at least use a colored header band or a logo.

**I did not redesign these.** That's a real design decision (how much to invest in a templated system versus hand-building a handful), not a copy fix, and it affects 135 files at once — exactly the kind of change that needs your sign-off before I touch it, per how this audit is scoped. My recommendation, in order of effort: (1) cheapest — add the Draftpace wordmark and that product's accent color to the shared template, a CSS/markup change in one place that reaches all 135; (2) next — render `checkable` list items as real checkboxes and `table` blocks as real tables instead of flattening everything to blank lines, since the underlying article data already distinguishes these; (3) biggest — a filled example row on the worksheets whose source article already wrote one, so the free sheet demonstrates itself.

## 5. Still open from the direct push to `main`

Two things found before this audit, from verifying the Codex session's push, remain unfixed as of this report and are a separate decision from the content findings above:

- `npx eslint .` fails with 19 errors from three new `scripts/*.cjs` files using `require()`.
- `npm run test` fails 4 tests in `creative/tests/film-guards.test.ts` — committed video scripts for the Creative Engine now quote stale titles/headings the rebuild renamed, and recommend a product link one rewritten guide body no longer contains.

I'm restating these because they're part of "the whole system" the way you framed the ask, even though they're not content/SEO issues — `main` isn't currently green, and the earlier message asking whether to fix these is still open.

## 6. What this PR actually changes

- `src/content/revisions/library.generated.json`, `library-info.generated.json`: the two broken worksheet-CTA/title strings, corrected.
- `public/guides/print/library/car-maintenance-by-mileage-start-with-your-manual.html`, `public/guides/print/library/safe-deposit-box-and-spare-keys-who-can-open-it.html`: the same two strings, corrected in the already-generated static files.
- This document.

Nothing else. No `primaryQuery`, title, or body-copy rewrite was made on my own judgment — items 1-3 in section 3, the `scopeCountry` list in section 1, and the worksheet system in section 4 are all presented as evidence for you to prioritize, not changes I made unilaterally, consistent with the "needs explicit review" bar the last audit used.

**Verified:** `npx tsc --noEmit` clean; `npx vitest run src/content` (78 tests, including the rebuild's own guard test) passing.
