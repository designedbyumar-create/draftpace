# Personal Finance Companion: Pinterest visual strategy

The data behind this brief is in `personal-finance-companion.json` next to this file: props, layouts, and every pin's content with its source.

## The problem with the current pins

Every product's pins use the same template: a serif headline, generic flat icons (wallet, chart, calendar) and a product card. A Personal Finance Companion pin could be a Travel Companion pin in a different colour. These pins should come from this product's own world.

That world is the **whole financial life, kept in order**: a tabbed financial binder, the 81-page Printable Finance Companion workbook, register pages with real column headers, confidence labels, a subscription list with renewal dates, a bank CSV turning into a tidy table, a bill split between two people, and one next move instead of a to-do wall. The product's own identity motif is `index` (`definition.ts`), so tabs, registers and labelled rows are its natural language.

This also keeps it apart from **Monthly Money Reset**. That product's world is *this month* and one safe-to-spend number. Personal Finance Companion's pins should avoid a big single "available" figure, month-calendar grids and cash envelopes.

## Who pins this

- People with several accounts, bills or income sources who want one real place, not five apps.
- Binder makers doing an end-of-year financial check, who save section pages and tracker sheets.
- People who keep getting charged for subscriptions they forgot about.
- Couples and roommates splitting rent and utilities.
- People who would rather download a bank CSV than link their bank.
- Planners who save sinking fund, variable-bill and "normal month" pages.
- People sorting out their money after a move, a job change or a breakup.

## What wins on Pinterest in this niche

I couldn't open pages directly (the fetch tool couldn't resolve hosts), so these points come from search-result summaries. None of the sources publish save or click rates for specific pin formats. Treat them as consistent practitioner and platform guidance, not measured results.

- **Pinterest's own rules.** Use a vertical 2:3 pin at 1000x1500. Keep the overlay short and legible. Stack key messaging at the top, the visual in the middle and details at the bottom. Keep logos discreet and out of the bottom-right corner, where Pinterest's UI sits. Sources: [Pinterest creative best practices](https://business.pinterest.com/creative-best-practices/), [product specs](https://help.pinterest.com/en/business/article/pinterest-product-specs), [lower-funnel creative guide](https://business.pinterest.com/blog/lower-funnel-creative-best-practices/).
- **Saves come from useful, revisitable formats:** checklists, step-by-step guides, templates, "X ideas" lists and before/after visuals. Pins showing several pages or steps in one frame are said to earn more saves than single images. Sources: [SocialKit pin design best practices](https://socialk.it/en/blog/pinterest-pin-design-best-practices), [FirstSiteGuide pin styles](https://firstsiteguide.com/pinterest-pin-styles/).
- **Make several variations per post.** Vary the headline and the format (text-led, image-led, before/after). Source: [Tailwind, Pinterest for bloggers](https://www.tailwindapp.com/blog/pinterest-for-bloggers).
- **Printables sell on showing the actual pages.** Use multiple images of real pages and styled desk shots. Sources: [ExpertBeacon, making printables to sell](https://expertbeacon.com/how-to-make-printables-to-sell/), [Dodo Payments, selling printables](https://dodopayments.com/blogs/sell-printables-online).
- **Trackers you fill or colour in dominate money printables.** Examples are sinking-fund envelopes with a tracker on the front, savings charts and "colour a heart" trackers. Sources: [The Budget Mom sinking fund trackers](https://shop.thebudgetmom.com/products/sinking-funds-cash-envelopes-with-trackers-printable), [Frugal Confessions sinking fund trackers](https://www.frugalconfessions.com/budgets/sinking-funds-trackers-free-printables/).
- **Budget binders are still published every year**, but search interest is reported as softer and the topic is seasonal, peaking in January. Lead with sections and contents, not the word "binder". Sources: [Just a Girl and Her Blog, 2026 budget binder](https://justagirlandherblog.com/how-to-save-more-money-this-year/), [Glimpse, budget binder trend](https://meetglimpse.com/trend/budget-binder), [Side Hustle Nation on budgeting seasonality](https://www.sidehustlenation.com/etsy-printables/).
- **Couples content turns on comparing split methods** (equal, income-based, by item) and on "equal vs equitable". Sources: [Tricount](https://tricount.com/blog/the-fairest-way-to-split-bills-as-a-couple-without-the-argument), [Ellevest](https://ellevest.com/core/split-expenses), [SoFi](https://sofi.com/learn/content/how-to-split-bills-and-finances-as-a-couple/).

## Look and feel

- **Palette:** the product's forest/ink accent `#0d3b2e` with soft `#dbe8e2` and wash `#eef4f1`, on the Money Book's paper `#fafbf9` with ruled lines `#c8d6cd`.
- **Highlights:** one warm pop at most per pin, either the pink `popFor()` already gives this accent or butter yellow for the pencil.
- **Amber** only for a real "needs a look" or duplicate flag.
- **Type** matches the workbook: Newsreader for headlines, IBM Plex Sans for labels.
- **Mood:** quiet, orderly, private, like a well-kept binder on a Sunday evening. Gaps are shown honestly with Missing labels, question marks and dashed outlines.

## The seven archetypes

**1. The tabbed financial binder (`binder-tabs`).** An open three-ring binder with seven numbered index tabs, each carrying a real section name. The open page shows one section's real content, or the live Records screenshot as if the page were the app. It answers "what goes in it", which is the question binder pins exist for. Used for the binder sections, "all in one place" and the subscription decisions tab.

**2. What's inside the 81-page workbook (`workbook-fan`).** Five or six real workbook pages fanned out, each with its real title: Subscription inventory, Variable bills worksheet, Debt payoff method comparison, Sinking funds worksheet, Net worth snapshot, January: review. Three fact chips sit underneath: 81 pages, US Letter and A4, twelve monthly reviews. This is the bundle-mockup pin printable buyers click, and every title is real. I decoded the PDF to read them.

**3. One tracker sheet, filled in (`tracker-sheet`).** One register page, tilted on a desk with a pencil across the corner. It has real column headers and rows filled with the guides' own "Example only" data. The cell the pin is about (the renewal date, the high month) gets the pop colour. This is the most common money-printable format, so it carries the most pins.

**4. Statement in, tidy table out (`intake`).** A before/after: raw CSV text, pasted notes or a pile of scattered sources at the top, arrows, then a clean reviewed table or the Records screen. It uses the CSV guide's four rows (with the repeated grocery row flagged) and the app's real mapping labels. It never implies bank linking.

**5. Two sides of one bill (`side-by-side`).** A rent bar split 67/33 between two person glyphs, a settled tick and the one-page Shared Responsibility statement. It also covers snowball versus avalanche as two ladders. The figures are the split guide's own example ($1,800 rent becomes $1,200.00 and $600.00).

**6. One card, not a to-do wall (`one-card`).** One large card in front of a faded wall of blank sticky notes, or simply one record blown up. The card shows a next move built from the app's real message template ("Electric needs a due date."), a subscription whose renewal leaf is bigger than its price, a savings goal worked through to $112.50 a month, or the workbook's quick reference card. It is the most direct picture of the product's core promise.

**7. Jars, ranges and ladders (`measure`).** Guide examples made physical:
- sinking-fund jars labelled Car insurance $90.00, Car registration $10.00, Holiday gifts $37.50 and Annual subscription $8.00
- a variable bill as a low-to-high band ($60 to $122)
- the workbook's payoff ladder, shaded as debts clear
- the typical-month bar
- a 14-day heads-up strip ending on Nov 14
- 50/30/20 jars with Needs overflowing at 86%

## Pins and their archetypes

Draftpace account: 32 pins (waves 2 to 4; wave 5 has no Personal Finance Companion rows). Maple & Main: 10 pins. No two neighbouring pins share an archetype.

| Pin | Headline on the pin | Archetype |
|---|---|---|
| pfc/pin-4.4 | Bills That Change Every Month Belong in a Range | measure |
| pfc/pin-4.5 | How to Budget for Bills That Change Every Month | tracker-sheet |
| pfc/pin-5.1 | How to Organize Your Finances When Everything Is Scattered | binder-tabs |
| pfc/pin-5.2 | One Next Move at a Time, Never a To-Do Wall | one-card |
| pfc/pin-5.3 | Where Is Your Financial Information Right Now? | intake |
| pfc/pin-5.4 | From a Pile of Tabs to One Picture | binder-tabs |
| pfc/pin-5.5 | You Do Not Need Everything Ready to Start | workbook-fan |
| pfc/pin-6.1 | What to Write Down for Every Subscription | tracker-sheet |
| pfc/pin-6.2 | Subscription Tracker That Does Not Cancel Anything For You | binder-tabs |
| pfc/pin-6.3 | 4 Places a Subscription Hides Its Cancel Button | tracker-sheet |
| pfc/pin-6.4 | A Heads-Up Before an Annual Charge Renews | measure |
| pfc/pin-6.5 | The Renewal Date Is the Number That Matters | one-card |
| pfc/pin-7.1 | How Couples and Roommates Split Bills Without Keeping Score | side-by-side |
| pfc/pin-7.2 | A Bill Splitting Statement You Can Send | tracker-sheet |
| pfc/pin-7.3 | 4 Things to Agree Before You Split a Bill | side-by-side |
| pfc/pin-7.4 | Split a Bill in Three Moves: Share, Settle, Send | one-card |
| pfc/pin-7.5 | Write Down What Is Settled and What Is Owed | side-by-side |
| pfc/pin-8.1 | How to Turn a Bank Statement CSV Into a Budget | intake |
| pfc/pin-8.2 | Paste Your Notes and Get Records to Review | one-card |
| pfc/pin-8.3 | 5 Things to Check in a Bank CSV Before You Import It | tracker-sheet |
| pfc/pin-8.4 | You Map the Columns Yourself, So It Never Guesses | intake |
| pfc/pin-8.5 | No Bank Link Needed to Understand Your Spending | one-card |
| pfc/pin-9.1 | How to Make a Financial Binder: What Goes In and How Often to Update It | tracker-sheet |
| pfc/pin-9.2 | 81-Page Printable Finance Workbook, Plus the App That Keeps It Current | workbook-fan |
| pfc/pin-9.3 | What Goes in a Financial Binder: 7 Sections | binder-tabs |
| pfc/pin-9.4 | A Ten Minute Starting Path for Your Money | one-card |
| pfc/pin-9.5 | Paper Gathers, an App Keeps It Current | workbook-fan |
| pfc/pin-10.1 | The 50/30/20 Rule and Where It Breaks for Real Budgets | measure |
| pfc/pin-10.2 | See a Typical Month: Coming In, Going Out, Left Over | tracker-sheet |
| pfc/pin-10.3 | 4 Costs You Can See Coming: Sinking Fund Ideas | measure |
| pfc/pin-10.4 | How Much to Set Aside Each Month for a Goal | one-card |
| pfc/pin-10.5 | The Annual Bill Should Not Be a Surprise | tracker-sheet |
| Maple 01 | All your money in one place, not five apps | intake |
| Maple 02 | When will this debt actually be gone? | measure |
| Maple 03 | Debt snowball vs avalanche, worked out for you | side-by-side |
| Maple 04 | POV: did I pay the water bill, or just think about it? | tracker-sheet |
| Maple 05 | Splitting bills with a partner or roommate? | side-by-side |
| Maple 06 | What does a normal month really cost you? | measure |
| Maple 07 | Still re-typing your bank statement by hand? | intake |
| Maple 08 | A money tracker that only flags real problems | one-card |
| Maple 09 | Me finding a subscription I forgot I had | tracker-sheet |
| Maple 10 | Every money area, one picture | binder-tabs |

Maple ids are `Pin-mm-personal-finance-companion-01` to `-10`. Where a headline here is shorter than the CSV title, it drops only the SEO prefix (for example "Monthly Bills Tracker:"). Every other word is kept.

## Things to check before rendering

- **Pin 9.4's description doesn't match the workbook.** Its CSV description lists six steps that aren't the workbook's: "gather, write what you know, mark what you do not, find one number, fix one thing and set a rhythm". The quick reference card actually says: list accounts, note income, write required bills, list subscriptions with one decision each, mark anything uncertain, enter what's confirmed. The pin draws the real card, so the description should be corrected.
- **The price comment in the listing is stale.** The comment in `src/shop/products/personal-finance-companion.ts` still says "$28 launch price, $35 regular", but the price fields are $49 and $99, which is what the pins say. Pins take the price from the listing, so this is cosmetic.
- **Screenshot figures are demo data.** The four screenshots show demo figures ($1,744.00, Debt-free in September 2030). They're fine inside the phone frame, but none of them should be lifted into overlay text.
- **Some pins deliberately show no amounts.** Pins 10.2 and Maple 06 (typical month) draw the bar and labels without amounts, because no guide gives a worked "typical month" figure.
