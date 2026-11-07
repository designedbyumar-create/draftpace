# Homeschooling Companion: the 101-pin idea bank (shared brief)

Read this whole file before you start. You are one of seven agents; each builds a slice of a bank of 101 Pinterest pin ideas for ONE product, **Homeschooling Companion** (shop slug `homeschooling-companion`), for Draftpace's own Pinterest account. The owner is changing approach: one product at a time, many pins, every pin a different angle, and some in "mockup style".

## Who we are pinning to
US homeschooling parents. Concretely (from `creative/pinterest/strategy/homeschooling-companion.md`): a parent who already chose a curriculum on purpose and wants the record kept, not a new curriculum; a parent teaching two or three children at one table whose records have blurred together; a family in a state that asks for a notice, a log, a portfolio or a yearly evaluation, saving pins before the review; a first-year homeschooler, often starting mid-year, working out the paperwork order; a parent who writes on paper some weeks and on a phone other weeks; a parent of a reluctant reader.

## What a pin must link to
Exactly one of: a guide on our site (`/guides/<slug>`, the guide is in `src/content/guides.ts`, find it by slug) or the product (`/shop/homeschooling-companion`, the listing is `src/shop/products/homeschooling-companion.ts`). A pin's words, items and numbers come from what that link leads to: the guide's own text/tables/lists, the product listing, the product's real data, or the printed book "The Homeschool Year" (30 pages, real text at `/tmp/claude-0/-home-user-draftpace/3601f45e-71e9-5dd0-a897-05358699fd6f/scratchpad/hsbook/book.txt`; the PDF is `book.pdf` beside it and `pdftoppm -r 80 -png` rasterises pages: page list: handbook chapters 01-06, then the working pages: the year at a glance, a week at a time, the daily log, one subject over a term, the reading log, things worth remembering, days schooled, then six check sheets).
The 17 homeschool guides: homeschool-record-keeping-requirements-by-state, homeschool-record-keeping-template, what-goes-in-a-homeschool-portfolio, how-to-catch-up-on-homeschool-records, how-to-check-if-your-child-learned-something, preparing-for-a-homeschool-evaluation, homeschool-attendance-what-to-track, simple-homeschool-record-keeping-system, how-long-to-keep-homeschool-records, homeschool-weekly-plan-with-a-spare-day, four-day-homeschool-week, homeschool-notice-of-intent-explained, do-you-have-to-count-homeschool-days-or-hours, how-to-start-homeschooling-first-month-paperwork, homeschool-record-keeping-for-multiple-children, homeschool-reading-log, homeschool-subject-not-working-what-to-change-first.
The product's real screens (`creative/public/screens/homeschooling-companion-kids.png`, `-record.png`, `-workspace.png`) carry a Next.js dev badge ("N") that must be cropped; their rows are demo data. Product facts: listing inclusions (the 30-page book; six chapters; undated working pages; six printable check sheets of eight questions with the answer key at the back; unlimited children each with their own curriculum, subjects, plan and checks; a starting outline from your own answers; a curriculum-neutral list of 71 topics; My Homeschool Record, a printable record per child generated on your own device; your state's requirements set line by line against what you've recorded; a private real account).

## Hard rules (the same truth rules as every Draftpace pin)
- No invented words, numbers, claims, features or requirements. Anything on a pin is copied from the cited source, or is a cut that keeps its words. Not legal, medical or educational advice. Never say a state "requires" something unless it is in `src/lib/homeschoolStateRequirements.ts` (use its `level` and `note` only, with the product's own caution "Laws change. Confirm with your state before relying on this."). The product is a record-keeper and planner: it has NO curriculum, NO lessons, NO grading, NO reminders/notifications unless the code shows them, NO state filing, NO co-op features.
- Where a figure or name is a guide's own made-up example, set `flags: ["example-tag"]`.
- Guide pin = "Free guide" on the pin; product pin = the product line with its price. Never put a price or a discount in a headline.
- Don't copy an existing pin: the list of the 50 homeschool pins already made is in `/tmp/claude-0/-home-user-draftpace/3601f45e-71e9-5dd0-a897-05358699fd6f/scratchpad/existing.txt`. You may reuse a guide, but with a NEW angle and a NEW headline.

## Formats (angles) to spread across
`mockup-app`: an app-store style promo pin like `creative/pinterest/homeschool/reference-mockup.png` (look at it): dark brand-colour panel, app icon + name at top, a big two-tone headline (key words in a lighter highlight colour), a column of 3-4 feature rows (small icon + label + one-line text), a large tilted phone showing the REAL app screen on the right, a prop at the foot. Use Homeschooling Companion's plum (#6a4a72, strong #4a3350, soft #f0eaf1) and ONLY its real screens, real feature wording and real printable pages.
`mockup-printable`: a paper/print mockup of a REAL page (a page of the book, or the My Homeschool Record) on a desk/binder/clipboard, tilted, with a headline.
Others: `checklist`, `how-to-steps` (numbered), `myth-vs-truth` (or "stop doing this"), `question` (a real question the guide answers, with a short answer), `comparison` (this not that, paper vs app, one child vs many), `scenario` (a relatable moment drawn from a guide's own example), `infographic` (map, levels, week board, calendar, timeline), `template-preview` (a fill-in layout from the guide), `quote-card` (a sentence the guide/book actually says), `before-after`, `seasonal`.
Use at least 7 different angles in your slice and no single angle for more than a third of it. Visuals come from the homeschooling world already planned: kitchen table, cream paper, oak, kraft, cork board, a child's drawing, pencils; the 7 archetypes in the strategy JSON (working-page, state-tile-map, portfolio-binder, index-cards, week-board, home-scene, check-clipboard) are available and you may propose new ones.

## What you deliver
1. Write your slice to `creative/pinterest/homeschool/ideas/<slice>.json`, a JSON array. One object per idea:
```json
{
  "slice": "rules",
  "angle": "question",
  "headline": "Do You Have to Count Homeschool Days or Hours?",
  "sub": "one real supporting line, or null",
  "items": ["real items shown on the pin, each copied from the source"],
  "link": { "kind": "guide", "slug": "do-you-have-to-count-homeschool-days-or-hours" },
  "proof": ["exact contiguous substrings copied from the source file that the pin's sub/items come from (so they can be grepped)"],
  "proofFile": "src/content/guides.ts",
  "query": "the Pinterest search phrase this pin should be found by (what a US homeschool parent types)",
  "board": "board name",
  "when": "evergreen | or the months it peaks",
  "visual": "one or two sentences: what is drawn, which layout/archetype, which props; for mockups: which real screen or book page",
  "flags": [],
  "reserve": false
}
```
2. Make the headline Pinterest-searchable (the search words first), at most 90 characters, in plain US English. Make `query` a real kind of phrase people type ("homeschool record keeping template", "how to start homeschooling mid year"), not marketing words. `board` should be one of: Homeschool Requirements by State, Homeschool Portfolio and Evaluation, How to Start Homeschooling, Four Day Homeschool Week, Homeschool Reading Log, Homeschool Attendance, Homeschool Help, Homeschool Assessment at Home, or a new board you propose with a short reason (Homeschool Record Keeping, Homeschool Planner Printables, Homeschool Mid-Year Reset are suggested).
3. Check with grep that every string in `proof` really occurs in `proofFile` (note guides.ts may wrap strings across lines or use curly quotes: quote the exact characters). Fix any that don't.
4. Do research too if it helps your slice: 2-4 WebSearch calls for what US homeschool parents search/pin in your topic (load it with ToolSearch "select:WebSearch"). WebFetch does not work in this session. Put 1-3 lines of what you learned and its source URLs in `creative/pinterest/homeschool/ideas/<slice>.research.md`. Ideas must still be grounded in OUR content; research only chooses the angle and the query. Say plainly when search results gave no real Pinterest data.
5. Mark your weakest ideas `reserve: true` (the slice count below is what is needed; give 2 extra as reserves).
6. Do not edit any other file; do not commit. Reply with: counts per angle, how many reserves, and anything you could not ground in real content.

