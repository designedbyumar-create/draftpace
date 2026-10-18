# ADHD Life Companion: Pinterest visual strategy

Product: `alongside` (ADHD Life Companion). Pin folder: `adhd`. Machine-readable version: `creative/pinterest/strategy/alongside.json`.

## The problem with the current pins

Every product's pins use the same finds-pin template: a serif headline, generic flat icons and a product card. For this product the icons are `phone`, `mind`, `clock` and `calendar`, so a pin about the unopened mail looks like a pin about a travel itinerary. This audience will click on pictures of its own desk: the mail pile, the phone it is avoiding, the email stuck at "Hi,", the sticky note, the one index card. The new pins draw those things, and fill them with the product's real words.

## Who pins this

- Adults with ADHD, or executive function that works like it, who have tried planners and to-do apps and ended up more behind.
- People with brain fog from long covid, concussion, chronic illness, grief, new parenthood, menopause or depression. The listing names them outright.
- Someone who has been avoiding one phone call for three weeks and saves "what to say" scripts.
- Someone with a bag of unopened mail who searches *paperwork organization*.
- People who save gentle systems: a weekly reset for a bad week, a planner that does not punish a missed day.

## What wins on Pinterest in this niche

- **Tall and light.** 2:3 at 1000x1500. Tailwind found viral pins are mostly vertical, image pins make up over 90% of the most viral pins, and most top pins have light backgrounds ([Tailwind, pin design tips](https://www.tailwindapp.com/blog/pinterest-pin-design-tips); [Tailwind, what to post in 2025](https://www.tailwindapp.com/blog/what-to-post-on-pinterest-in-2025)).
- **Short text overlay, small logo.** Pinterest's own community guidance says to keep the overlay brief and readable on mobile, and to keep the logo small and out of the lower-right corner, where Pinterest places its icons ([text overlay do's and don'ts](https://community.pinterest.biz/t/designing-pins-text-overlays-dos-donts/661); [best formats for product sellers](https://community.pinterest.biz/t/the-best-pin-formats-and-practices-for-product-sellers/1319)).
- **Fresh images for the same URL, evergreen topics.** Pinterest has cut distribution of re-saved content, so each link needs new images. Over 60% of saves go to pins more than a year old, and mental health and self-care are evergreen categories ([Tailwind, 2025](https://www.tailwindapp.com/blog/what-to-post-on-pinterest-in-2025); [Tailwind, Pinterest SEO 2025](https://www.tailwindapp.com/blog/pinterest-seo-in-2025)).
- **Checklists and how-tos get saved.** Business users say these earn the most saves and clicks. This is anecdotal, not Pinterest data ([Pinterest Business Community](https://community.pinterest.biz/t/what-types-of-pins-have-worked-best-for-driving-traffic-to-your-blog-or-business-lately/39919)).
- **Handwriting is having a moment.** Pinterest Predicts 2026 reports that a quarter of Gen Z and millennial users are rediscovering handwritten letters ([Social Media Today](https://www.socialmediatoday.com/news/pinterest-publishes-2026-trend-predictions-report/807452/); [PG Buzz](https://www.pgbuzz.net/lets-get-writing/)). This supports sticky notes and notepads drawn in a handwriting face.
- **Script cards are a known format for phone anxiety.** Advice in this niche says to write the opening word for word because it is the hardest part ([EWU](https://www.ewu.edu/stories/ring-ring-phone-anxiety-telephobia/)). A printable point-form "Before You Call" script card exists for exactly this ([Life Skills Advocate card](https://lifeskillsadvocate.com/before-you-call-script-card/); [their phone anxiety article](https://lifeskillsadvocate.com/blog/phone-anxiety/); see also [ADDitude](https://www.additudemag.com/add-phone-anxiety/)).
- **"Doom pile" is the niche's own word.** It stands for Didn't Organize, Only Moved ([ADDitude](https://www.additudemag.com/doom-piling-adhd-sign-clutter/); [Psychology Today](https://www.psychologytoday.com/us/blog/mythbusting-adhd/202306/is-your-adhd-making-you-a-doom-piler)). Sort-into-categories methods like the doom diamond spread as practical how-tos ([Apartment Therapy](https://www.apartmenttherapy.com/doom-diamond-method-for-decluttering-37546238)).
- **Sticky notes and one visible next step.** This is the most repeated ADHD start-up advice ([Focus Bear](https://www.focusbear.io/blog-post/unstuck-8-proven-strategies-for-adhd-paralysis-relief); [URMC](https://www.urmc.rochester.edu/behavioral-health-partners/bhp-blog/september-2025/don’t-know-where-to-begin-!-how-to-navigate-decision-paralysis); [Tiimo](https://www.tiimoapp.com/resource-hub/adhd-paralysis)).
- **Brain-dump printables are a crowded $1 to $5 category** on Etsy, Gumroad and Payhip ([Gridfiti roundup](https://gridfiti.com/brain-dump-worksheets/)). Shop pins should therefore show that this is an app (a phone, a real screen), not one more worksheet.

**Gaps.** I found no measured data on ADHD-niche pins. Pinterest and several of the sites above could not be opened from this environment, so I could not look at top pins directly. The evidence for "this, not that" and POV formats is how the niche talks, not measurement. Treat those two as experiments and compare their saves against the checklist and script-card pins.

## The visual world

The setting is a home-admin corner seen from above. It is cluttered at the edges and calm in the middle: every pin goes from many things to one thing.

**Colour.** The ground is the product's own blush-grey (`#f4f0f1` / `#f7f1f3`), so pins stay light. Mulberry `#86586a` is used only for the one thing: the circled date, the ticked box, the chosen card. The warmth comes from paper props: butter sticky notes, kraft envelopes, cream index cards.

**Type.** Headlines in Newsreader. App strings in IBM Plex Sans. Notes, pads and cards in a handwriting face, which has to be added first (see below).

**Props.** There are 33 flat-SVG props, each with drawing notes, in the JSON (`visualWorld.props`). Among them: mail pile, mail bag, sorted stacks, sticky note, sticky-note wall, index card, script card, recipe box of cards, notepad, ringing phone, Companion step card, countdown, lock screen, email compose window, wall calendar, clock at 3:30, open planner, planner shelf, folder, face-down letter, glass of water, bookmark ribbon and four life trays.

## Archetypes

**1. The opening line card** (`opening-line-card`). One index card carries a real first sentence, set large inside mulberry quote marks. It is clipped to a ringing phone or stuck to an email window. This is the script-card format the phone-anxiety niche saves, and it is this product's core promise. The lines come verbatim from each playbook's `suggestedWording` or the guide's scripts block. A variant for the "eight scripts" pin is a recipe box of eight tabbed cards, one per real playbook.

**2. Doom pile to piles** (`pile-sort`). The top half is the unopened pile, so wide it is cropped by the pin's edges. An arrow leads down to three or four neat labelled stacks, with the one to act on ringed. It uses the niche's own "doom pile" language and shows a before and after in one look. Labels come from the pin's description or the guide. For the product pin, the pile drops into the four real Life shapes.

**3. Sticky notes on the thing** (`sticky-note-wall-to-one-card`). One real object is drawn large: a monitor, laptop lid, phone, folder or mail pile. It has either a wall of notes with one index card held in front, or a single note big enough to read at thumbnail size. Every word on a note comes from a guide example, such as the nine-row to-do list, the shrinking insurance task or the restart note.

**4. The notepad checklist** (`notepad-checklist`). A spiral pad holds three or four handwritten items with tick boxes, with one object at its edge to say where this happens: a glass of water, a folder, a small phone. The pin is itself the tool, which is why checklists get saved. Items are a playbook's real prepare or check lists, or the guide list the pin links to, and never more items than the source has.

**5. One question on the phone** (`companion-step-phone`). This is the shop-link archetype: a phone frame holding a real screen, or a drawn step card that uses only real prompts, whys and choices, with one supporting prop such as a bookmark ribbon, calendar, clock or fog. It shows the product working one question at a time, and that it is an app rather than a printable.

**6. The relatable scene** (`pov-desk-scene`). A wordless domestic moment taken from a guide's own "say it's..." example:

- the planner open at a blank Thursday, under the post
- a draft whose first line was rewritten four times
- a phone on the nightstand showing the generic reminder

The headline does the talking, in a speech bubble for Maple's POV pins. This is the "that's me" recognition this niche shares.

**7. Two columns: this, not that** (`this-not-that`). The left column is struck through and the right column is circled, each headed by a small prop such as a sticky note versus a clock. Both columns come straight from tables already in the guides ("Vague versus exact", "Two kinds of reset", first-physical-step examples) or from the ready step's two real buttons. The whole idea reads in one look.

## Pins and archetypes

Neighbouring pins never share an archetype in either account.

| Account | Pin | Headline on the pin | Archetype |
|---|---|---|---|
| Draftpace | adhd/pin-4.3 | Three Piles for Any Paperwork Mountain | Doom pile to piles |
| Draftpace | adhd/pin-4.4 | Pick Something Back Up Without Rebuilding It in Your Head | One question on the phone |
| Draftpace | adhd/pin-4.5 | You Do Not Have to Do the Whole Pile | Sticky notes on the thing |
| Draftpace | adhd/pin-5.1 | How to Say No, or Give Bad News, on the Phone | Relatable scene |
| Draftpace | adhd/pin-5.2 | Decide What You Will Not Agree To Before You Dial | One question on the phone |
| Draftpace | adhd/pin-5.3 | What to Have Ready Before a Hard Call | Notepad checklist |
| Draftpace | adhd/pin-5.4 | Ready to Call? Now, or Name One Exact Time | This, not that |
| Draftpace | adhd/pin-5.5 | An Opening Line for Saying No | Opening line card |
| Draftpace | adhd/pin-6.1 | How to Write the Email You Have Been Avoiding | Sticky notes on the thing |
| Draftpace | adhd/pin-6.2 | The First Line of an Email Is the Hard Part | Opening line card |
| Draftpace | adhd/pin-6.3 | Before You Send It: Three Checks | Notepad checklist |
| Draftpace | adhd/pin-6.4 | How to Follow Up When Nobody Replied | Opening line card |
| Draftpace | adhd/pin-6.5 | Reading It a Fourth Time Does Not Make It Better | Relatable scene |
| Draftpace | adhd/pin-7.1 | Task Paralysis: What to Do in the Next Ten Minutes | Sticky notes on the thing |
| Draftpace | adhd/pin-7.2 | Which of Those Could Happen Today? One of Them, Not the List | One question on the phone |
| Draftpace | adhd/pin-7.3 | The First Physical Step: Examples for Admin You Are Stuck On | This, not that |
| Draftpace | adhd/pin-7.4 | Break Something Down in Three Questions | Notepad checklist |
| Draftpace | adhd/pin-7.5 | Small Enough That Starting Is Not a Decision | Relatable scene |
| Draftpace | adhd/pin-8.1 | How to Restart a Project You Gave Up On | Sticky notes on the thing |
| Draftpace | adhd/pin-8.2 | Leave It Halfway and Come Back to the Exact Question | One question on the phone |
| Draftpace | adhd/pin-8.3 | Three Questions Before You Restart Something | Notepad checklist |
| Draftpace | adhd/pin-8.4 | Start Again From the Beginning, or From Where You Left Off | This, not that |
| Draftpace | adhd/pin-8.5 | Leave Yourself a Note for Next Time | Sticky notes on the thing |
| Draftpace | adhd/pin-9.1 | A Weekly Reset That Survives a Bad Week | This, not that |
| Draftpace | adhd/pin-9.2 | A Task App With a Button for "Did Not Get to It" | One question on the phone |
| Draftpace | adhd/pin-9.3 | The Ten Minute Weekly Reset | Doom pile to piles |
| Draftpace | adhd/pin-9.4 | Nothing Counted: How This App Treats a Missed Week | One question on the phone |
| Draftpace | adhd/pin-9.5 | A System Has to Survive a Missed Week | Relatable scene |
| Draftpace | adhd/pin-10.1 | Why You Keep Missing Bill Due Dates | Notepad checklist |
| Draftpace | adhd/pin-10.2 | Reminders You Switch On Yourself, Only for Dates You Chose | Relatable scene |
| Draftpace | adhd/pin-10.3 | Planning When You Cannot Feel Time Pass | This, not that |
| Draftpace | adhd/pin-10.4 | What Time Today? Name One Exact Time | One question on the phone |
| Draftpace | adhd/pin-10.5 | Later Today Is Not a Time | Sticky notes on the thing |
| Maple | Pin-mm-alongside-01 | For the phone call you've been avoiding for three weeks | Opening line card |
| Maple | Pin-mm-alongside-02 | To-do lists just make me feel more behind | Sticky notes on the thing |
| Maple | Pin-mm-alongside-03 | 3 ADHD-friendly ways to start when you're stuck | Notepad checklist |
| Maple | Pin-mm-alongside-04 | POV: you put it down half finished and lost where you were | Relatable scene |
| Maple | Pin-mm-alongside-05 | What it holds, so your head doesn't have to | Doom pile to piles |
| Maple | Pin-mm-alongside-06 | A planner that never tells you that you failed | This, not that |
| Maple | Pin-mm-alongside-07 | Brain fog and a pile of life admin? | One question on the phone |
| Maple | Pin-mm-alongside-08 | Scripts for the things that are hardest to start | Opening line card |
| Maple | Pin-mm-alongside-09 | Tell me you have ADHD without telling me: same task on your mind for three weeks | Relatable scene |
| Maple | Pin-mm-alongside-10 | For the brain that's tried every planner | Sticky notes on the thing |

Each pin's real content and the file and constant it comes from are in the JSON under `pins[].content`.

## Before rendering

- **Add a handwriting font.** `creative/public/fonts` has only Inter and Space Mono, and archetypes 3, 4 and 6 need one OFL handwriting face (for example Caveat or Patrick Hand from Google Fonts).
- **Clean the real screens.** All three `creative/public/screens/alongside-*.png` captures show the Next.js dev "N" badge at the bottom left; crop or mask it. Their items (dental check, home insurance, car hire) are demo data in the real UI, so show them as UI but never quote them as claims.
- **Timers belong on guide pins only.** The time-blindness guide says the Companion does not do timers. The only timed thing in the app is the 5-second Call now countdown.
- **Price comes from the listing at render time.** It is currently $49, compare at $99. Never type it on the pin.
