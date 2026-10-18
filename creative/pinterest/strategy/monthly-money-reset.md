# Monthly Money Reset: Pinterest visual strategy

Right now every product's pins use the same template: a serif headline, generic flat icons and a product card. This brief gives Monthly Money Reset a look of its own, taken from the paper side of month-to-month money: kraft envelopes holding bill money back, a wall calendar with bill stickers and paydays, a torn till receipt that shows the working, a price tag on a coffee cup, a jar on the counter, and a one-page printout under a fridge magnet. Everything is flat vector illustration and typography, plus the product's one real screenshot. There are no photos, no AI images and no stock.

The full plan is in `monthly-money-reset.json` next to this file. It lists every pin's content and where each word and number comes from.

## Who saves these pins

- People living paycheck to paycheck. They can open the banking app and still not know what is really theirs to spend.
- Freelancers and tipped, gig or commission workers, whose pay lands on different days in different amounts.
- People who have started and dropped a budget more than once and dread catching up.
- Beginners who save one-page budget sheets and weekly money check-in lists.
- Savers working toward a first $1,000. Many of them also save cash-envelope and savings-tracker pins.
- Anyone resetting at the end of a month or before holiday spending, who wants to start from today's balance.

## How this differs from Personal Finance Companion

Personal Finance Companion covers the whole financial picture: accounts, debt payoff, subscriptions, statement imports. Its pins should stay in that world, with ledgers, accounts and payoff curves. Monthly Money Reset is one month and one number, and its pins always show paper on a kitchen table.

Three things never appear on a Monthly Money Reset pin:

- A bank logo or account feed. The product never connects to a bank.
- A debt chart.
- Category grids. The product's own line is "nothing to categorise".

## What wins in this niche

I found no public, measured comparison of pin formats for budgeting. The findings below combine Pinterest's own guidance, Pinterest search figures as reported by others, and what the niche's top sellers and templates look like. Treat them as direction and check them against our own analytics.

One limit on the research: the page fetcher could not reach any site from this environment. Each point below therefore comes from search-result summaries of the linked pages, not from reading the pages in full.

- **Savings challenges and trackers are reliable savers.** In coverage of Pinterest's 2023 predictions, searches for bi-weekly savings challenges more than tripled, and envelope-challenge searches were reported up 145% ([AOL](https://www.aol.com/trending-budget-challenges-could-saving-140000273.html), [AOL Finance](https://www.aol.com/finance/biweekly-money-saving-challenges-start-215003301.html); both are secondary reports). The printables sold for this are jars, thermometers and charts you colour in as savings grow ([Payhip tracker bundle](https://payhip.com/b/d2EYg), [Gumroad savings trackers](https://artbylara.gumroad.com/l/savingstrackers)).
- **Cash envelopes are an instantly recognised money aesthetic.** Cash stuffing passed 700 million TikTok views ([Tom's Guide](https://tomsguide.com/news/what-is-cash-stuffing-tiktoks-budgeting-trend-explained)), and the 100-envelope challenge is one of its most popular formats ([MoneyManagement.org](https://www.moneymanagement.org/blog/cash-stuffing-challenge)). We borrow the envelope only as a picture of money held back, which is what "protected" means in the product. We never show a cash system.
- **Number-led, outcome-led headlines beat labels.** Tailwind recommends benefit-led wording over generic topic titles ([Tailwind](https://www.tailwindapp.com/blog/pinterest-pin-design-tips)). Advice to finance bloggers is to promise a specific result, such as "save $1,000 in 6 months", in a vertical, light, warm-accented pin ([Business Journalism](https://businessjournalism.org/?p=70233)).
- **Checklists and one-page sheets are a standard saved format.** Budget-checklist pin templates follow a title, five short items and a footer. One generic template is literally titled "Monthly Money Reset" ([htmlcsstoimage template](https://htmlcsstoimage.com/templates/details/budget-checklist-post/pinterest-pin.md)). Holiday budget planners are pinned from early autumn, and planners recommend starting in October ([A Cultivated Nest](https://acultivatednest.com/free-printable-holiday-budget-planners/), [Mums Make Lists](https://www.mumsmakelists.com/christmas-planner/)).
- **Pinterest's format rules:**
  - Use 2:3 (1000x1500).
  - Keep copy short and readable on a phone.
  - Put the product or service front and centre rather than abstract lifestyle imagery.
  - Use a subtle logo on every pin, and keep it out of the lower-right corner, where Pinterest's icons sit.
  - Avoid too much text, small text and script fonts.

  Sources: [Pinterest Business community: product sellers](https://community.pinterest.biz/t/the-best-pin-formats-and-practices-for-product-sellers/1319), [Pinterest Business community: text overlays](https://community.pinterest.biz/t/designing-pins-text-overlays-dos-donts/661), [SocialKit](https://socialk.it/en/blog/pinterest-pin-design-best-practices).
- **Context:** Pinterest Predicts 2026 names no money or budgeting trend ([Social Media Today](https://www.socialmediatoday.com/news/pinterest-publishes-2026-trend-predictions-report/807452/)). The seasonal pulls for this niche are month end, the holidays and January.

## The look

- **Setting:** a kitchen table and fridge door on a Sunday evening, seen from above or straight on.
- **Colour:** the product's own tokens from `theme.ts`, with nothing new added.
  - Forest `#173c32` for the Number panel and headline ink.
  - Sage `#96a58f` and `#dce2d7` for paydays and money received.
  - Ivory `#f5f0e8` and paper `#fffdf9` for the table and sheets.
  - Clay `#b86f4a` as the single warm accent: envelope bands, bill stickers, price tags and the ringed tightest day.
  - Kraft is clay-soft deepened, not a new hue.
- **Mood:** calm and practical. The pins show figures with their working, never a score or a streak.
- **Text:** each headline stays as written. Every other word is copied from the pin's own description, the Shop listing, a guide or the product's code. Every figure is one of three kinds:
  - **The real demo account's numbers.** These come from `DEMO_STATE` in `creative/src/ui-adapter/monthlyMoneyReset.tsx`, and I ran them through the real calculation code: safe to spend $43.65, about $10.91 a week, tightest day Oct 20 at $343.65.
  - **The Shop mockup's example.** $1,850 minus $900 minus $350 leaves $600. The pin labels it "Example".
  - **A guide's worked example.** The pin labels it "Example from the guide".

## The seven archetypes

**1. The receipt (`safe-to-spend-receipt`).** A deep-forest panel with a torn till receipt hanging from a slot, exactly as the product draws its Safe-to-Spend card. Each row has a label, a dotted leader and a monospaced figure, with a double rule above the bold total.

- Why it works: it is the "here's the math" pin the money niche saves, and it is the product's real signature.
- Use for: safe to spend, restarting from today, the check-in result, "no bank linking", and savings taken off first.

**2. Held-back envelopes (`held-back-envelopes`).** A top-down flat-lay of kraft envelopes, each with a label window showing a name, an amount and a due date. Sealed ones carry a clay band. One open envelope at the front shows what is left to spend.

- Why it works: it borrows the cash-envelope look the audience stops on.
- What the labels show: real bill and reserve names from the demo account, or the product's real spending groups (Essentials, Flexible, Personal).
- Use for: protecting bills, holding savings back first, and three spending groups instead of forty categories.

**3. Bill calendar with the tightest day (`tightest-day-calendar`).** A wall-calendar page in a binder clip. Bills are clay stickers and paydays are sage stickers, each on its date, with one day ringed by hand. Under the grid, a balance line steps down to the product's own chip, for example "Tightest Oct 20 $343.65".

- Why it works: bill calendars are a staple printable, and a date is more concrete than an average.
- Use for: the tightest day, paycheck to paycheck, irregular pay, bills due, and starting again on day one.

**4. The price-tag test (`price-tag-test`).** A coffee cup, a grocery bag or a rail of kraft swing tags, beside stacked result tickets: if you buy, what's left, per week, and a verdict.

- Why it works: it answers the audience's real search, "can I afford this?", with numbers.
- Where the figures come from: only guide examples or the mockup's "$600.00 to $558.00".
- Use for: overspending, mental maths at the checkout, and the yearly cost of subscriptions.

**5. On the fridge (`fridge-printable`).** The canvas is a fridge door. A printed sheet or ruled index card hangs under magnets, sometimes with a kitchen timer, a sticky note, or a phone showing the real Progress screenshot.

- Why it works: checklists and one-page sheets are what this audience saves to reuse.
- Why it's honest: the product really makes a one-page PDF for the fridge.
- Use for: the four real check-in questions, step lists, the ten-minute month-end review, and the PDF itself.

**6. Turn the page (`page-turn`).** Two sheets side by side with a clay arrow between them. On the left, a greyed, curling old month, a shoebox of receipts or a fat 12-tab binder. On the right, a crisp new page. The right page shows one of these:

- the real carry-forward toggles;
- the four starting-balance choices: Suggested, Actual balance, Custom amount, Start fresh;
- the real Progress screen.

A three-card variant handles "in 3 steps" pins.

- Why it works: reset and fresh-start pins are seasonal drivers, and a before/after is the simplest story to read at a glance.
- Use for: closing the month, restarting, and one page versus a whole system.

**7. The jar (`savings-jar`).** A mason jar with a tick scale up to $1,000, fill bands for each deposit, and coins dropping in. Two variants:

- **Irregular income:** six uneven pay stubs feed a "holding account" jar.
- **Tracker:** four colour-in cells, with no money amounts.

Why it works: savings trackers and challenge charts are among the most-pinned money printables, and $1,000 is a reachable, specific goal.

Limit: the product holds a reserve back but does not track a savings goal. The jar is therefore used only with a guide's own numbers, or in the tracker variant with the pin's own words.

## Pins and archetypes

No two neighbouring pins share an archetype, either in id order or in publish-date order. Draftpace's 40 pins (waves 2 to 4; wave 5 has none for this product) split: on the fridge 9, receipt 7, envelopes 6, calendar 6, page turn 5, price tag 4, jar 3. Maple & Main's 10 pins split: calendar 2, fridge 2, page turn 2, and one each of receipt, envelopes, price tag and jar.

### Draftpace (waves 2 to 4)

| Pin | Headline on the pin | Archetype | What is drawn from real data |
|---|---|---|---|
| mmr/pin-3.1 | How to Budget on Irregular Income, Month by Month | The jar | Example from the guide: deposits Jan $2,900, Feb $1,850, Mar $4,100, Apr $2,300, May $3,350, Jun $2,700; You pay yourself $2,300 every month; Holding account after: $1,500, $1,050, $2,850, $2,850, $3,900, $4,300 |
| mmr/pin-3.2 | Count Only What Has Arrived | The receipt | Money available right now $1,842.50; + Income received $900.00 (Freelance work); - Ordinary spending recorded $145.85; ... |
| mmr/pin-3.3 | Paid Different Every Month? Do These 4 Things First | On the fridge | Count only money that has arrived.; List the bills that cannot slip.; Find the tightest day.; ... |
| mmr/pin-3.4 | Variable Income Budget: Plan From What Has Arrived | Held-back envelopes | Stub, received: Freelance work $900.00; Envelope: Electricity $94.00, Oct 14; Envelope: Mobile phone $85.00, Oct 20; ... |
| mmr/pin-3.5 | Why Budgeting With Expected Income Backfires | Bill calendar with the tightest day | Example from the guide: pay transfers land on the 1st and 15th; Rent leaves on the 3rd; The low point is the 4th; ... |
| mmr/pin-4.1 | Weekly Money Check-in: 4 Questions in 5 Minutes | On the fridge | Has any income changed or come in?; Has a bill changed or been paid?; Is there spending you haven't added yet?; ... |
| mmr/pin-4.2 | A Weekly Budget Check-in You Can Actually Keep Up | The receipt | Check-in complete; Safe-to-Spend $43.65; What changed; ... |
| mmr/pin-4.3 | Why You Quit Budgeting After Two Months (and What Helps) | Bill calendar with the tightest day | Week 1: A true picture; Week 2: A true picture again; Week 3: Wrong, and you can't say by how much; ... |
| mmr/pin-4.4 | A Simple Weekly Budget Review for People Who Hate Budgeting | Turn the page | 1. Answer four questions; 2. Add only what changed; 3. See your next move; ... |
| mmr/pin-4.5 | Missed a Week of Budgeting? How to Pick It Back Up | On the fridge | Sticky note: You skipped a week. Maybe two.; If you fall behind, don't rebuild the gap. Restart from today's balance and go forward.; Phone (real screen): This is a record of what actually happened, not a competition. Nothing here tracks streaks or penalizes a quiet week. |
| mmr/pin-5.1 | Can I Afford This? Check Before You Buy | The price-tag test | Example: $600 safe to spend, four weeks to payday, a normal week costs about $110; Nothing: $600 left, $150 a week, Room to spare; A $42 item: $558 left, $139.50 a week, Fine; ... |
| mmr/pin-5.2 | How to Stop Overspending Without Tracking Every Coffee | Held-back envelopes | Essentials $138.40 of $600.00; Flexible $0.00 of $300.00; Personal $7.45 of $150.00; ... |
| mmr/pin-5.3 | Before You Buy It: 4 Questions to Ask | On the fridge | Is this money already spoken for?; Would it leave me short before payday?; What is my tightest day?; ... |
| mmr/pin-5.4 | Stop Overspending: Check First, Decide Second | The price-tag test | Example: Groceries $42.00; Safe-to-Spend would change from $600.00 to $558.00. |
| mmr/pin-5.5 | Small Purchases Add Up: See the Real Cost Before You Spend | Bill calendar with the tightest day | October 2026; Electricity $94.00, Oct 14; Mobile phone $85.00, Oct 20; ... |
| mmr/pin-6.1 | End of Month Money Review in 10 Minutes | On the fridge | Write down every balance (2 minutes); Compare with the start of the month (1 minute); Check that every bill was paid (3 minutes); ... |
| mmr/pin-6.2 | Close One Month, Start the Next | The receipt | October 2026; Bills handled 2 of 4; Check-ins 1; ... |
| mmr/pin-6.3 | What to Carry Into Next Month (and What to Leave Behind) | Held-back envelopes | Carries over: Recurring income, Recurring bills, Your reserve or cushion; Stays behind: One-off purchases, Last month's spending detail |
| mmr/pin-6.4 | How to Reset Your Budget at the Start of a Month | Bill calendar with the tightest day | October 2026 page tearing away, November 2026 underneath; Carried stickers: Recurring income, Recurring bills; Starting point: Suggested, Actual balance, Custom amount, Start fresh |
| mmr/pin-6.5 | How to Do a Monthly Money Reset Without the Guilt | Turn the page | Left page: How did this month go? (optional); Right page: One thing that worked this month and one thing to change next month; Phone (real screen): This is a record of what actually happened, not a competition. |
| mmr/pin-7.1 | Your Budget Failed. How to Restart This Month | The receipt | Example from the guide: the 18th, three weeks of nothing logged; Checking account today $1,640; Card balance you'll pay in full on the 25th $410; ... |
| mmr/pin-7.2 | Budget Reset: Start Over Without Redoing Everything | Turn the page | Left: a shoebox of old receipts, set aside; Right: This month, Money coming in, Protect what must be paid, Set your spending view, Review |
| mmr/pin-7.3 | Before You Give Up on Budgeting, Try This | On the fridge | Forget last month.; Enter today's balance.; Add the bills still coming.; ... |
| mmr/pin-7.4 | How to Restart Budgeting Without Catching Up on Old Spending | Bill calendar with the tightest day | Past weeks greyed out; Day 1: Do the sum and write the number down; Day 3: Jot each purchase since day one as a single line; ... |
| mmr/pin-7.5 | Fell Off Your Budget? You Can Start From Today | Turn the page | Left page: The old month is over.; Right page: Actual balance (highlighted), Suggested, Custom amount, Start fresh |
| mmr/pin-8.1 | One-Page Monthly Budget You Can Actually Keep Up | The receipt | Example from the guide: Take-home pay $3,240; Fixed bills $1,828; Groceries and getting around $580; ... |
| mmr/pin-8.2 | Save Your Monthly Budget as a One-Page PDF, Free | On the fridge | MONTHLY MONEY RESET, October 2026; SAFE TO SPEND NOW $43.65; About $10.91 a week for the rest of the month.; ... |
| mmr/pin-8.3 | What Belongs on a One-Page Budget | Held-back envelopes | Safe to spend: $43.65; About how much per week: $10.91; What is protected: Bills not yet paid $179.00, Reserve still held $300.00; ... |
| mmr/pin-8.4 | How to Make a One-Page Monthly Budget in 3 Steps | On the fridge | 1. Add your numbers; 2. See the picture; 3. Save the page |
| mmr/pin-8.5 | Why a One-Page Budget Beats a 12 Tab Spreadsheet | Turn the page | Left: a binder with twelve tabs; Right: one page; A single page, updated weekly, is easier to keep than a spreadsheet that needs a Sunday. |
| mmr/pin-9.1 | How to Build Your First $1,000 Emergency Fund | The jar | Example from the guide: $25 every week: 40 weeks; $50 every week: 20 weeks; $100 every two weeks: 20 weeks (10 paychecks); ... |
| mmr/pin-9.2 | Budget Tool That Holds Savings Back Before You Spend | Held-back envelopes | Reserve still held: Car repairs $200.00; Reserve still held: Gifts $100.00; Savings transfers made: Emergency fund $500.00; ... |
| mmr/pin-9.3 | 4 Ways to Save Money This Month Without Big Changes | The price-tag test | Look at every recurring charge.; Move a small amount first.; Trim one flexible group.; ... |
| mmr/pin-9.4 | Emergency Fund Budget: Set Savings Aside First | The receipt | Money available right now $1,842.50; + Income received $900.00; - Ordinary spending recorded $145.85; ... |
| mmr/pin-9.5 | Why $1,000 Is a Good First Emergency Fund Goal | The jar | Example from the guide: a $410 tax refund; Sell a bike for $180; $590 on day one; ... |
| mmr/pin-10.1 | Bills Due Soon? Protect That Money Before You Spend It | Held-back envelopes | Sealed: Electricity $94.00, Oct 14; Sealed: Mobile phone $85.00, Oct 20; Band: Protected bills not yet paid $179.00; ... |
| mmr/pin-10.2 | Budget Without Linking Your Bank: Type It, See It | The receipt | Money available right now $1,850.00; - Protected bills not yet paid $900.00; - Reserve still held $350.00; ... |
| mmr/pin-10.3 | How to Find Every Subscription You Are Paying For | The price-tag test | Example from the guide: Video streaming $15.49 monthly, $185.88 a year; Music streaming $10.99 monthly, $131.88 a year; Cloud storage $2.99 monthly, $35.88 a year; ... |
| mmr/pin-10.4 | Monthly Bills Budget: Protect What Must Be Paid | Bill calendar with the tightest day | October 2026; Rent $1,450.00, Oct 1, paid; Car insurance $124.00, Oct 5, paid; ... |
| mmr/pin-10.5 | How to Cancel a Subscription That Is Hard to Cancel | On the fridge | Example from the guide: Service and amount: Streaming plan, $15.49 a month; When you cancelled: The 9th, 8:40 pm, on the website; Confirmation: Email with reference CX-48213, screenshot saved; ... |

### Maple & Main Finds

| Pin | Headline on the pin | Archetype | What is drawn from real data |
|---|---|---|---|
| Pin-mm-monthly-money-reset-01 | How much can I actually spend this month? One number. | The receipt | Example: SAFE TO SPEND NOW $600.00; Money available right now $1,850.00; Income received $0.00; ... |
| Pin-mm-monthly-money-reset-02 | The balance looks fine. The bill coming Friday says otherwise. | Held-back envelopes | Slip: Money available right now $1,842.50; Sealed: Electricity $94.00, Oct 14; Sealed: Mobile phone $85.00, Oct 20; ... |
| Pin-mm-monthly-money-reset-03 | A budget for people who hate budgeting | On the fridge | One number, nothing to categorise; A short weekly check-in; A way back in after weeks away |
| Pin-mm-monthly-money-reset-04 | POV: the month looks fine until the 23rd | Bill calendar with the tightest day | The 23rd ringed on a month calendar (no amount: the date is the headline's, not product data); It names your tightest day and how low you'd get, ahead of time. |
| Pin-mm-monthly-money-reset-05 | Small money wins for this month | The jar | Know your safe-to-spend; Protect the bills first; Spot your tightest day; ... |
| Pin-mm-monthly-money-reset-06 | Paycheck to paycheck? Find your tightest day first | Bill calendar with the tightest day | October 2026; Electricity $94.00, Oct 14; Mobile phone $85.00, Oct 20; ... |
| Pin-mm-monthly-money-reset-07 | Fell off budgeting by month two? Again? | Turn the page | Left: month two, a shoebox of unsorted receipts; Right (real screen): This is a record of what actually happened, not a competition. |
| Pin-mm-monthly-money-reset-08 | What a five minute money check-in looks like | On the fridge | Any income in, or changed?; Any bill changed, or paid?; Spending you haven't added? |
| Pin-mm-monthly-money-reset-09 | Me doing mental math in the checkout line | The price-tag test | Coffee shop $7.45; Tag: Safe to spend $43.65 |
| Pin-mm-monthly-money-reset-10 | A money app that isn't a whole budget system | Turn the page | Left: a binder with twelve tabs (a whole budget system); Right card: Safe-to-Spend, Weekly check-ins, Tightest day, Your next useful move |

## What is not grounded yet

- **No real screenshot of the main screen.** `creative/public/screens/` has only `monthly-money-reset-progress.png`. The Safe-to-Spend card, Quick Add and check-in screens exist only as the Shop page's hand-built mockups (illustrative numbers) or must be redrawn from the real component. Capturing `workspace` and `check-in` screens on the demo account would let more pins carry a real screen.
- **The demo account's weekly figure is small.** It is about $10.91 a week, because the demo's safe-to-spend is $43.65. That is real, but it may read oddly on a pin. Where a pin needs a friendlier number it uses the mockup's $600 / $150-a-week example, labelled "Example".
- **Maple pin 04 cannot show an amount.** Its headline names "the 23rd". No product data has a tightest day on the 23rd, so the calendar rings the date with no amount.
- **One pin uses a figure from mid-month as if it were the close.** Pin 6.2 shows $43.65 as the close-out figure, but that is the demo state on Oct 8, not a real month-end close. It should be captioned as the demo month, not as a closing total.
- **The research is indirect.** Pinterest search figures come from secondary coverage, and none of the sources measured saves by pin format. Re-check against Pinterest Analytics after the first batch.
