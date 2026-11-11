# Personal Finance Companion: the 101-pin idea bank (shared brief)

Read this whole file before you start. You are one of seven agents; each builds a slice of a bank of 101 Pinterest pin IDEAS (not images yet) for ONE product, **Personal Finance Companion** (shop slug `personal-finance-companion`), for Draftpace's own Pinterest account. This is the same process that made the 101 Homeschooling Companion pins, and the visual style is locked: the same mockup-and-scene pin style (look at `creative/pinterest/homeschool/reference-mockup.png` and the finished homeschool pins in `creative/out/homeschool/pins/`), now in this product's own world and colours (forest `#0d3b2e`, soft `#dbe8e2`, wash `#eef4f1`, paper `#fafbf9`, ruled lines `#c8d6cd`, one warm pop at most). Nothing is rendered in this step: you write ideas, and each idea says what will be drawn.

## Who we are pinning to
US adults whose money is scattered (read `creative/pinterest/strategy/personal-finance-companion.md`, "Who pins this" and the product's world: a tabbed financial binder, the 81-page Printable Finance Companion workbook, register pages with real column headers, confidence labels, a subscription list with renewal dates, a bank CSV turning into a tidy table, a bill split between two people, one next move instead of a to-do wall, jars/ranges/ladders). Keep it apart from **Monthly Money Reset** (free; this month, one safe-to-spend number): avoid a pin that is only a big "available" figure, a month-calendar grid or cash envelopes.

## What a pin must link to
Exactly one of: a guide on our site (`/guides/<slug>`, in `src/content/guides.ts`, find it by slug) or the product (`/shop/personal-finance-companion`, listing `src/shop/products/personal-finance-companion.ts`). A pin's words, items and numbers come from what that link leads to: the guide's own text, tables, lists and examples; the product listing; the real app behaviour the guide describes; or the printed workbook (text in `creative/out/pfc/book.txt`, made by `node pinterest/pfc/merge.mjs` on first run, or decode it yourself with `pdftotext`).

The 23 guides that lead to this product (each mentions it; use these and only these as `guide` links):
- `how-much-of-your-money-is-actually-safe-to-spend`: How much money is safe to spend after your bills? (five steps, one number left)
- `how-to-find-every-subscription-you-are-paying-for`: How to find all your subscriptions, including annual ones (twelve month statement sweep; Apple and Google lists, PayPal, old cards, free trials)
- `available-balance-vs-current-balance`: Available vs current balance: which one can you spend?
- `why-budgeting-apps-stop-working-after-two-months`: Why budgets get dropped, and what one that lasts needs (five tests)
- `you-missed-a-payment-what-to-do-next`: You missed a payment. What to do in the next 48 hours
- `sort-out-your-finances-after-a-life-change`: Sort out your finances after a job change, move or divorce (six steps; payday gap, autopays, old 401(k), COBRA, joint accounts)
- `what-to-check-before-each-direct-debit-date`: Before your bills come out: a two minute autopay check
- `can-you-afford-it-before-you-buy-it`: How to know if you can afford something before you buy it ($42 and $480 examples, installment plans)
- `how-to-budget-for-beginners`: How to make a monthly budget for the first time ($3,240 example month)
- `how-to-build-a-first-1000-emergency-fund`: How to build your first $1,000 emergency fund
- `how-to-save-money-fast`: How to find $200 this month without a big life change (seven moves)
- `how-to-cancel-subscriptions`: How to cancel a subscription that is hard to cancel (where cancel buttons hide, what to say, card issuer stops a charge)
- `debt-snowball-vs-avalanche`: Debt snowball vs avalanche: which costs less, which sticks (three-debt example)
- `monthly-bills-list`: Monthly bills list: include the bills that are not monthly ($612 every three months is $204 a month)
- `organize-your-finances-from-scratch`: How to organize your finances when everything is scattered (ten minute starting page)
- `split-bills-with-a-partner-or-roommate`: How to split bills with a partner or roommate: 3 methods (equal, by income, by room)
- `subscription-tracker-what-to-track`: Subscription tracker: the six fields that catch renewals
- `bank-statement-csv-to-budget`: How to import a bank statement CSV: check the file first
- `financial-binder-what-to-include`: Financial binder: what to include and how often to update (seven sections)
- `sinking-funds-explained`: Sinking funds explained: save for costs you can see coming ($600 example)
- `50-30-20-rule-where-it-breaks`: The 50/30/20 rule: who it fits and where it breaks
- `budget-for-variable-bills`: How to budget for bills that change every month (twelve month example)
- `credit-card-minimum-payments-how-long`: How long paying only the minimum takes on credit card debt ($3,000 at 24 percent)

Product facts (from the listing and the guides' own product paragraphs; use only these): all seven areas (accounts, income, bills, subscriptions, transactions, debt, savings); one Available Money figure with its working one tap away (a month-level estimate, Preliminary while a bill has no due date); a payoff plan from balances, rates and minimums (smallest first or highest rate first, an extra amount; a debt with no rate is named as left out); tick a bill paid for the month; a typical month written out (what comes in, goes out, set aside for goals, left); Attention inbox of real gaps only; Coming up (next 14 days, pay days included); subscriptions with amount, frequency, renewal date and a decision (Keep, Reviewing, Planned cancellation, Cancelled), annual charges divided by 12; Shared Responsibility (a share 1 to 99, settled date, one-page PDF statement, the other person needs no account); import by pasted notes, text file or CSV (up to 2 MB, mapped columns, reviewed before it counts); savings goals including emergency fund and sinking fund; an 81-page Printable Finance Companion workbook (US Letter and A4; sections, five labels, ten minute quick reference card, twelve monthly review spreads, variable bills worksheet, debt method comparison, subscription inventory, sinking funds worksheet, net worth snapshot done by hand). The app's real screens: `creative/public/screens/personal-finance-companion-{bills,debt,printables,records}.png` (390 px wide; they carry a Next.js dev badge to crop; rows are demo data), and more can be captured later from the real components with stub data (Available Money banner, Coming up, Attention, Subscriptions, Payoff plan, Typical month, CSV mapping, the Shared Responsibility statement PDF), exactly as was done for homeschool.

## Hard rules (the same truth rules as every Draftpace pin)
- No invented words, numbers, claims, features or requirements. Anything on a pin is copied from the cited source, or is a cut that keeps its words. Not financial, tax or legal advice. NEVER claim: bank linking or syncing, that it reads your bank, that it cancels anything or contacts anyone, net worth calculation (the workbook page is handwritten), investment tracking, tax preparation, automatic categorising, reminders or notifications unless in the listing, or a weekly figure. Where a guide states a limit (a month-level estimate, not until-payday; you type everything in), keep the limit.
- Where a figure or name is a guide's own made-up example, set `flags: ["example-tag"]`.
- Guide pin = "Free guide" on the pin; product pin = the product line with its price. Never put a price or a discount in a headline. (The listing's price needs the owner's check; do not state any price anywhere.)
- Don't copy an existing pin: the 42 Personal Finance Companion pins already made are in `creative/pinterest/strategy/personal-finance-companion.json` (`pins[].title`). You may reuse a guide, but with a NEW angle and a NEW headline.

## Formats (angles) to spread across
`mockup-app`: an app-store style promo pin like the homeschool reference (dark brand panel, app icon and name, a big two-tone headline, 3 to 4 feature rows, a large tilted phone showing a REAL app screen, a prop); `mockup-printable`: a REAL page of the workbook (or the Shared Responsibility statement) on a desk/binder/clipboard, tilted, with a headline. Others: `checklist`, `how-to-steps`, `myth-vs-truth`, `question`, `comparison` (this not that, paper vs app, equal vs by income), `scenario` (a relatable moment from a guide's own example), `infographic` (the seven sections, a typical month, jars, ladders, ranges, a 14-day strip), `template-preview` (a fill-in register from a guide), `quote-card`, `before-after`. Use at least 7 different angles in your slice and no single angle for more than a third of it. Visuals come from this product's world (the 7 archetypes in the strategy JSON: binder-tabs, workbook-fan, tracker-sheet, intake, side-by-side, one-card, measure) with kitchen-table and desk props; avoid repeating the homeschool scenes where a finance prop fits better (binder, folders, register pages, jars, receipts, a calculator, index tabs, a coffee mug, sticky notes).

## What you deliver
1. Write your slice to `creative/pinterest/pfc/ideas/<slice>.json`, a JSON array, one object per idea:
```json
{
  "slice": "subscriptions",
  "angle": "question",
  "headline": "Subscription Tracker: The Six Fields That Catch Renewals",
  "sub": "one real supporting line, or null",
  "items": ["real items shown on the pin, each copied from the source"],
  "link": { "kind": "guide", "slug": "subscription-tracker-what-to-track" },
  "proof": ["exact contiguous substrings copied from the source file that the pin's sub/items come from (so they can be grepped)"],
  "proofFile": "src/content/guides.ts",
  "query": "the Pinterest search phrase this pin should be found by (what a US adult types)",
  "board": "board name",
  "when": "evergreen | or the months it peaks",
  "visual": "one or two sentences: what is drawn, which layout/archetype, which props; for mockups: which real screen, workbook page or captured screen",
  "flags": [],
  "reserve": false
}
```
`link.kind` is `"guide"` or `"shop"` (product pins: `{ "kind": "shop", "slug": "personal-finance-companion" }`).
2. Headline Pinterest-searchable (the search words first), at most 90 characters, plain US English, no exclamation marks, no em dashes. `query` a real phrase people type ("subscription tracker", "how to split bills with a partner"), not marketing words. `board` one of: Subscriptions and Renewals; Monthly Bills and Due Dates; Debt Payoff; Savings and Sinking Funds; Safe to Spend and Budgeting; Organize Your Finances; Financial Binder and Printables; Splitting Bills; Money After a Life Change (new boards may be proposed, give the name only).
3. Check with grep that every string in `proof` really occurs in `proofFile` (guides.ts may wrap strings or use curly quotes: quote the exact characters; `proofFile` for the printed workbook is `"book"`, for the listing `src/shop/products/personal-finance-companion.ts`). The merge check (`node pinterest/pfc/merge.mjs --check`) verifies that a pin linked to a guide quotes THAT guide when `proofFile` is `src/content/guides.ts`. Optionally `proofExtra: [{ "file": "...", "proof": ["..."] }]` for a second source.
4. You may do 1 to 3 WebSearch calls (load with ToolSearch "select:WebSearch") on what US adults search/pin in your topic; put 1 to 3 lines and URLs in `creative/pinterest/pfc/ideas/<slice>.research.md`. Ideas must still be grounded in OUR content. Do not spend long on it.
5. Mark your weakest ideas `reserve: true` (the slice count below is what is needed; give 2 extra as reserves).
6. Do not edit any other file; do not commit. Reply with: counts per angle, how many reserves, and anything you could not ground in real content.

## Slices (ideas needed, plus 2 reserves each)
- **product (20)**: mockups of the product itself, all `link.kind: "shop"`: `mockup-app` with real screens and captured screens, `mockup-printable` with real workbook pages (81 pages: read `book.txt`; name the real page titles) and the shared statement. Proof from the listing, the workbook text, or the guides' own product paragraphs. At most 10 of them mockup-app.
- **subscriptions (11)**: guides `how-to-find-every-subscription-you-are-paying-for`, `subscription-tracker-what-to-track`, `how-to-cancel-subscriptions`.
- **bills (13)**: guides `monthly-bills-list`, `budget-for-variable-bills`, `what-to-check-before-each-direct-debit-date`, `you-missed-a-payment-what-to-do-next`.
- **debt (9)**: guides `debt-snowball-vs-avalanche`, `credit-card-minimum-payments-how-long` (plus up to 2 product pins about the payoff plan if the guide's own product paragraph supports them).
- **savings (16)**: guides `how-to-build-a-first-1000-emergency-fund`, `sinking-funds-explained`, `how-to-save-money-fast`, `50-30-20-rule-where-it-breaks`, `can-you-afford-it-before-you-buy-it`, `how-much-of-your-money-is-actually-safe-to-spend`, `available-balance-vs-current-balance`.
- **organize (14)**: guides `organize-your-finances-from-scratch`, `financial-binder-what-to-include`, `why-budgeting-apps-stop-working-after-two-months`, `how-to-budget-for-beginners`.
- **partners (18)**: guides `split-bills-with-a-partner-or-roommate` (about 7), `bank-statement-csv-to-budget` (about 5), `sort-out-your-finances-after-a-life-change` (about 3), and about 3 TIMELY pins from any guide (January fresh start and budget-binder season, holiday spending and the January card bill, a year-end financial check; say the months in `when`).

Keep the slice's pins on spread-out guides where you can (no guide more than 5 pins in your slice unless it is the only guide, and no two pins with the same visual idea). Ideas that quote the same sentence of a guide should differ in angle and headline.
