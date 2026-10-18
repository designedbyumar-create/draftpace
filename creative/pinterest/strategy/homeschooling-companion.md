# Homeschooling Companion: Pinterest visual strategy

Right now every Draftpace pin uses the same template: a serif headline, generic flat icons and a product card. This brief replaces that template, for this product only, with pictures from a homeschooling parent's own world. That world is the kitchen table, the working pages, the binder, the state map and the cork board. Every pin keeps its existing headline. Every other word on a pin is copied from the product's code, its listing, its handbook or its guides. The machine-readable version, with the content and source for every pin, is `homeschooling-companion.json` next to this file.

## Who saves these pins

- A parent who already chose a curriculum on purpose and wants a record kept, not a new curriculum.
- A parent teaching two or three children at one table, whose records have started to blur together.
- A family in a state that asks for a notice, a log, a portfolio or an evaluation, saving pins before the review.
- A first-year homeschooler, often starting mid-year, working out the paperwork order.
- A parent who uses paper some weeks and a phone other weeks.
- A parent of a reluctant reader who wants a reading list that stays gentle.

## What wins on Pinterest in this niche

- **Printable previews.** Searches for homeschool record keeping, portfolio pages and reading logs return pins that show the page itself: forms, logs and trackers laid out so you can see the columns ([record keeping ideas](https://www.pinterest.com/ideas/homeschool-record-keeping/936385755161/), [portfolio printables](https://www.pinterest.com/ideas/homeschool-portfolio-printables-free/910537095540/), [reading logs for kids](https://www.pinterest.com/ideas/reading-log-for-kids/909702563379/)). Attendance trackers are box grids with a running total ([Walking by the Way](https://www.walkingbytheway.com/blog/calendar-homeschool/), [Templacity](https://templacity.com/wp-content/uploads/free/homeschool-attendance/Homeschool-Attendance-Tracker-A4.pdf)).
- **The state map.** The colour-coded map of regulation levels (none, low, moderate, high), first published by HSLDA and reproduced widely, is the reference image this audience already knows ([AOP](https://www.aop.com/blog/homeschool-regulations-map), [SheKnows](https://www.sheknows.com/parenting/articles/1018417/which-states-are-best-for-homeschooling/)). Our own data has the same four levels.
- **The binder.** Portfolio advice is built around a three-ring binder with tabbed dividers per subject or per child ([Abeka](https://www.abeka.com/blog/put-together-homeschool-portfolio/), [The Unlikely Homeschool](https://www.theunlikelyhomeschool.com/2012/05/annual-portfolio-part-2.html), [Homeschool Fox](https://homeschoolfox.com/blog/how-to-build-a-homeschool-portfolio)).
- **Numbered steps for beginners.** "How to start homeschooling" content that ranks is a numbered step list ([K12](https://learningstore.k12.com/blogs/articles-and-guides/how-to-start-homeschooling-a-step-by-step-guide-for-beginners), [Homeschool Fox](https://homeschoolfox.com/blog/how-to-get-started-with-homeschooling-for-the-first-time)).
- **A gap we can fill: the four-day week.** Weekly schedule printables are everywhere, but a Pinterest search found almost none built for four days. Nearly all assume Monday to Friday ([example](https://www.pinterest.com/pin/weekly-homeschool-schedule-free-printable--974396069351921158/), [another](https://www.pinterest.com/pin/719239002986628821/)). A board with one deliberately empty day will stand out.
- **General pin craft:**
  - Use 2:3 at 1000 x 1500 ([Pinterest specs](https://help.pinterest.com/en/business/article/pinterest-product-specs)).
  - Put the headline at the top, the visual in the middle and the details at the bottom. Keep the bottom-right corner clear for Pinterest's own controls ([Pinterest creative best practices](https://business.pinterest.com/creative-best-practices/)).
  - Show the product in context ([Pinterest Create](https://create.pinterest.com/fundamentals/)).
  - Keep layouts clean, readable and structured; that matters more than looking pretty ([Pinterest educator guidance](https://community.pinterest.biz/t/best-strategies-on-pinterest-for-educators/42531)).
  - Use short, high-contrast phrases and one clear focal point ([Schedulala](https://schedulala.com/blog/pinterest-pin-design-best-practices)).
  - Use light grounds. Tailwind found white and light grey dominate top pins, and only 4% of viral designs were built on a brand palette ([Tailwind](https://www.tailwindapp.com/blog/pinterest-pin-design-tips)).
- **Context.** Pinterest's 2026 parenting report says searches for educational activities rose 280% and screen-free activities rose 200%, with routine charts in demand ([Pinterest Newsroom](https://newsroom.pinterest.com/en-gb/news/parenting-trend-report-2026/)). That backs a paper-and-pencil look.

**A limit on this research:** the page fetcher could not reach external hosts in this session. Everything above comes from search-result summaries, not from looking at the top pins directly. No source gave save or click numbers for homeschool pins specifically. Test the archetypes against each other once they are live.

## The look

- **Ground:** cream paper (#fbfaf7 and #f5f1ea from the handbook) with ink type.
- **Accent:** the product's plum (#6a4a72, with its scale #4a3350, #8e6f95 and #f1ebf2).
- **Props:** warm, natural colours that sit beside plum: oak, kraft, cork, pencil ochre, sage and dusty rose.
- **No primaries and no cartoons.** The product definition says its colour must never read as children's software.
- **Handwriting:** pencil-grey Newsreader italic for written entries, or plain scribble lines where there are no real words to show.
- **Screens:** real screenshots only, inside a simple phone or laptop frame.

## The seven archetypes

**1. The working page on the table.** One real page from The Homeschool Year lies on the oak table, slightly rotated, with its printed title and column heads readable. A pencil lies across it and a mug or book stack overlaps a corner. The headline sits above it and one line sits below. This is the printable preview the niche saves most. It covers the reading log, days schooled, the daily log, things worth remembering and the full set of pages. The page structures come straight from `printables/handbook.tsx`.

**2. The state tile map.** Fifty-one equal squares (the 50 states plus DC) in the standard tile-grid layout. Each square is filled by its level from `HOMESCHOOL_STATE_REQUIREMENTS`: None is cream with a plum outline, then pale, mid and deep plum. Under it sits a legend with the real counts: None 8, Low 15, Moderate 19, High 9. A picked state gets an ink outline and an inset: either a crop of the real Kids screen or the printed "What your state asks for." page. "Laws change. Confirm with your state." always appears.

**3. The portfolio binder.** An open three-ring binder with staggered divider tabs. The right-hand page carries real content: the guide's five portfolio contents, the printed record cover, the state page, the printed log, or the record's three include boxes in their real default state. For more than one child, draw two binders side by side.

**4. Numbered index cards on the cork board.** Three to five white index cards, each with a large serif number and one line copied from a guide or handbook list. They are held on with push pins and washi tape, with a child's drawing pinned in one gap. Variants: two cards side by side for a comparison, or a staircase of cards for "go back one step". Use this for the first-month order, notice-of-intent steps, what to change first and the short-day list.

**5. The four-day week board.** Day columns from Monday to Friday plus an empty, hatched "Spare day". Subject tiles sit on the days the product's own weekday pattern gives them (`WEEKDAYS_BY_FREQUENCY` in `today.ts`). Variants: a wall calendar for month views (October against March, or June with blank months behind it), or one lane per child. This is the format the feed lacks.

**6. The kitchen-table scene with the real app.** A full illustrated room: a cork board, a clock or a calendar on the wall, and the table across the lower half. A phone propped against the picture books shows one of the three real screenshots. Variants: morning (hard thing first), evening (catch-up evidence spread out), three place settings (several children), and the reading rug (a child lying on the floor reading). Use it for product pins and for anything about how the day feels.

**7. The parent's clipboard.** A kraft clipboard holding a real check sheet: eight numbered questions from `CHECK_SHEETS`, with the bottom folded back so "Answers" is hidden. Beside it are the four real result pills (Looked solid, Mixed, Worth another look, Not enough to say), with the relevant one filled in. A topic tick-list variant covers "tick what you are teaching".

## Pins and archetypes

Draftpace account, in posting order. No two pins next to each other share an archetype.

| Pin | Headline | Archetype |
|---|---|---|
| homeschool/pin-3.1 | Homeschool Record Keeping Requirements, State by State | state-tile-map |
| homeschool/pin-3.2 | State Homeschool Requirements Shown Beside Your Own Records | portfolio-binder |
| homeschool/pin-3.3 | What a Homeschool Notice of Intent Is, and How to Find Yours | index-cards |
| homeschool/pin-3.4 | Pick Your State and See a Plain Summary | state-tile-map |
| homeschool/pin-3.5 | Do You Have to Count Homeschool Days or Hours? | index-cards |
| homeschool/pin-4.1 | What Actually Goes in a Homeschool Portfolio | portfolio-binder |
| homeschool/pin-4.2 | A Printed Homeschool Record for One Child | home-scene |
| homeschool/pin-4.3 | Preparing for a Homeschool Evaluation in an Evening | index-cards |
| homeschool/pin-4.4 | What Prints on a Homeschool Record Is Up to You | portfolio-binder |
| homeschool/pin-4.5 | A Record Is Not an Assessment | working-page |
| homeschool/pin-5.1 | How to Check Whether Your Child Actually Learned Something | check-clipboard |
| homeschool/pin-5.2 | A Short Check You Run at Home, Marked by You | home-scene |
| homeschool/pin-5.3 | Four Questions Is the Floor | index-cards |
| homeschool/pin-5.4 | A Check That Can Say "Not Enough to Say" | check-clipboard |
| homeschool/pin-5.5 | Wait a Week, Then Ask Them to Explain It | week-board |
| homeschool/pin-6.1 | How to Start Homeschooling: The First-Month Paperwork Order | index-cards |
| homeschool/pin-6.2 | Already Have a Curriculum? Homeschooling Companion Stays Out of the Way | home-scene |
| homeschool/pin-6.3 | Keeping Homeschool Records for More Than One Child | portfolio-binder |
| homeschool/pin-6.4 | A Starting Outline You Can Change, Keep, or Throw Away | week-board |
| homeschool/pin-6.5 | You Can Begin Before You Have Everything Figured Out | working-page |
| homeschool/pin-7.1 | The Four-Day Homeschool Week: How to Set One Up | week-board |
| homeschool/pin-7.2 | A Homeschool Handbook and Working Pages, Undated So It Starts When You Do | working-page |
| homeschool/pin-7.3 | Decide in Advance What a Short Day Looks Like | index-cards |
| homeschool/pin-7.4 | Put the Hard Thing First | home-scene |
| homeschool/pin-7.5 | Only One of Them Still Wants to Be Doing This in March | week-board |
| homeschool/pin-8.1 | The Homeschool Reading Log: What to Write and Why Abandoned Books Belong on It | working-page |
| homeschool/pin-8.2 | A Printable Reading Log With Space for Books You Did Not Finish | home-scene |
| homeschool/pin-8.3 | Three Columns Are Enough for a Reading Log | index-cards |
| homeschool/pin-8.4 | Things Worth Remembering: A Dated Page for What You Notice | working-page |
| homeschool/pin-8.5 | A Child Who Is Allowed to Stop Keeps Starting | home-scene |
| homeschool/pin-9.1 | Homeschool Attendance: What to Track and What Is Pointless | week-board |
| homeschool/pin-9.2 | A Days Schooled Page: One Box Per Day | working-page |
| homeschool/pin-9.3 | How to Catch Up on Homeschool Records You Have Not Kept | home-scene |
| homeschool/pin-9.4 | Days Are Counted From What You Recorded | portfolio-binder |
| homeschool/pin-9.5 | Reconstructing a Year of Attendance in June Is Impossible | week-board |
| homeschool/pin-10.1 | When a Homeschool Subject Is Not Working: What to Change First | index-cards |
| homeschool/pin-10.2 | Worth Going Over Again: How a Hard Session Comes Back | home-scene |
| homeschool/pin-10.3 | Go Back One Step | index-cards |
| homeschool/pin-10.4 | Tick What You Are Actually Teaching | check-clipboard |
| homeschool/pin-10.5 | You Cannot Keep Everything, and You Do Not Need To | portfolio-binder |

Maple & Main Finds:

| Pin | Headline | Archetype |
|---|---|---|
| Pin-mm-homeschooling-companion-01 | Homeschool records that keep up with you | home-scene |
| Pin-mm-homeschooling-companion-02 | By March, can you remember what you covered in October? | week-board |
| Pin-mm-homeschooling-companion-03 | Homeschool planner pages for the whole year | working-page |
| Pin-mm-homeschooling-companion-04 | POV: three kids, three curriculums, one kitchen table | home-scene |
| Pin-mm-homeschooling-companion-05 | Inside the 30 page Homeschool Year book | portfolio-binder |
| Pin-mm-homeschooling-companion-06 | Know what your state asks you to keep, before someone checks | state-tile-map |
| Pin-mm-homeschooling-companion-07 | Did it actually stick? | check-clipboard |
| Pin-mm-homeschooling-companion-08 | Check learning without turning the table into an exam hall | index-cards |
| Pin-mm-homeschooling-companion-09 | Paper some weeks, screen other weeks. Both count. | home-scene |
| Pin-mm-homeschooling-companion-10 | Keeps up with the curriculum you chose | week-board |

## Notes on truth

- **State facts.** Facts about a particular state come from `HOMESCHOOL_STATE_REQUIREMENTS` (Oregon, Pennsylvania) or, for pin 3.5 only, from the days-or-hours guide's own side-by-side cards (Pennsylvania's 180 days or 900/990 hours, and Texas's lack of a minimum). The product's data table does not carry those day and hour figures. If you want product data only, swap 3.5 for an empty days-schooled grid.
- **No invented numbers.** Wherever the real format would show a count ("12 days logged"), the pill is drawn blank or says "Nothing recorded yet". The month and total lines on the days-schooled page stay empty.
- **Example rows are labelled as examples at their source.** These are the reading log rows, the Maya and Leo rows and the template week. The reading log rows name two real books (Winn-Dixie, Wild Robot). If you'd rather not show real titles, draw them as pencil scribbles.
- **Demo data.** Names and dates shown on screens (Ava, Leo, October 2026) are the demo data in the real screenshots.
- **What the pins don't claim.** Nothing implies lessons, a curriculum or legal advice, or that children have accounts.
