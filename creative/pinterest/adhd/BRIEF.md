# ADHD Life Companion: the 101-pin idea bank (shared brief)

Read this whole file before you start. You are one of seven agents; each builds a slice of a bank of 101 Pinterest pin IDEAS (not images yet) for ONE product, **ADHD Life Companion** (shop slug `alongside`, table prefix `als_`), for Draftpace's own Pinterest account. This is the same process that made the 101 Homeschooling, Personal Finance Companion and Home Base pins; the visual style is locked: the same mockup-and-scene pin style (see `creative/pinterest/homeschool/reference-mockup.png` and the finished pins in `creative/out/homeschool/pins/`, `creative/out/pfc/pins/`, `creative/out/homebase/pins/`), now in this product's own world and colours (mulberry `#86586a`, strong `#5f3d4b`, soft `#f1e7eb`, wash `#f7f1f3`, ink `#231a1f`; butter sticky notes, kraft envelopes, cream index cards as the warm props). Nothing is rendered in this step: you write ideas, and each idea says what will be drawn.

## Who we are pinning to
Read `creative/pinterest/strategy/alongside.md` ("Who pins this", "What wins", "The visual world", "Archetypes"). Adults with ADHD or executive function that works like it, who have been made to feel more behind by planners and to-do apps; people with brain fog (long covid, concussion, chronic illness, grief, new parenthood, menopause, depression); anyone who has avoided one phone call for three weeks; anyone with a bag of unopened mail. Tone: gentle, specific, never shaming. Nothing here is a countdown, a score or a failure. The pin goes from many things to one thing. Never use the words lazy, fix, cure, treat or symptoms as a promise.

## What a pin must link to
Exactly one of: a guide on our site (`/guides/<slug>`, in `src/content/guides.ts`, find it by slug) or the product (`/shop/alongside`, listing `src/shop/products/alongside.ts`). A pin's words, items and numbers come from what that link leads to: the guide's own text, lists, scripts and examples; the product listing; the real app behaviour the guide describes (the playbooks in `src/products/alongside/playbooks/*.ts` hold the exact prompts, choices and wording); or the printed 9-page "The Alongside Book" (text in `creative/out/adhd/assets/book.txt`, made by `node pinterest/adhd/capture/book.mjs`; its proofFile is `"book"`).

The 19 guides that lead to this product (use these and only these as `guide` links; each carries one paragraph on the product that is allowed as proof for product claims):
- `how-to-make-a-phone-call-you-have-been-avoiding`: How to make a phone call you keep avoiding
- `scripts-for-the-admin-calls-everyone-dreads`: What to say on admin calls: opening lines and scripts
- `how-to-say-no-or-give-bad-news-on-the-phone`: How to say no, or give bad news, on the phone
- `the-email-you-keep-not-sending-and-how-to-chase-a-reply`: The email you keep not sending: first lines and follow-ups
- `task-paralysis-what-to-do-in-the-next-ten-minutes`: ADHD task paralysis: what to do in the next ten minutes
- `first-physical-step-20-examples`: First physical step: 20 examples for stuck admin tasks
- `executive-dysfunction-is-not-procrastination`: Executive dysfunction vs procrastination: the difference
- `why-you-keep-thinking-about-a-task-and-not-doing-it`: Why you keep thinking about a task and not doing it
- `why-to-do-lists-make-it-worse`: Why to-do lists do not work when starting is the problem
- `how-to-deal-with-something-you-have-put-off`: How to deal with something you have put off for months
- `how-to-start-when-everything-is-overdue`: Everything is overdue: how to pick the first thing
- `paperwork-pile-where-to-start`: Paperwork pile you are avoiding: where to start
- `why-you-keep-missing-bill-due-dates`: Why you keep missing bill due dates (and a better system)
- `a-weekly-reset-that-survives-a-bad-week`: A weekly reset that survives a bad week
- `why-you-abandon-planners-and-how-to-come-back`: Why you stop using planners, and how to come back
- `how-to-restart-a-project-you-gave-up-on`: How to restart a project you gave up on
- `time-blindness-planning`: ADHD time blindness: how to plan when later never comes
- `life-admin-with-brain-fog`: Life admin with brain fog: long covid, illness, grief
- `diagnosed-with-adhd-as-an-adult`: Diagnosed with ADHD as an adult: the admin that follows

Product facts (from the listing, the guides' own product paragraphs and the playbooks; use only these): write something down once, or open the Companion; say what it is in one line; it is one of four kinds: something to do, waiting on someone, ongoing, or worth having to hand (a detail you will need again); Now shows what deserves attention and, when nothing does, honestly says so ("Nothing needs you right now"); Do this with me opens a walkthrough that asks one question at a time (an opening line, prompts, a closing question); the walkthroughs are: Make a phone call, Make a difficult phone call, Send the email, Follow something up, Break something down, Pick something back up, Sort out a billing problem, Book an appointment and be ready for it; a suggested opening line you use or replace with your own; "call now or name one exact time today"; if you close a walkthrough it reopens at the question you left, earlier answers intact; "How it went": Sorted closes the item, Waiting on someone turns it into waiting with a check-back date, Did not get to it changes nothing and adds nothing to the history, Made progress asks what is worth remembering and shows it back in Where you left off; Life holds everything in four groups with an edit page; one opt-in web push reminder on a date you chose, off by default, with quiet hours and a lock screen that says nothing about the item unless you allow it; the printed Alongside Book (nine undated pages: How this works, Commitments register, Waiting on someone register, Ongoing thread, Reference, Weekly review...). Real app screens: `creative/public/screens/alongside-{help,life,workspace}.png` (390 px wide; they carry a Next.js dev badge to crop); more can be captured later from the real components with stub data (Now with one card, a walkthrough question, the opening-line step, "How it went", Where you left off, Life's four groups, the reminder settings).

Exclusions (NEVER claim): diagnosis, treatment, therapy, medication or symptom tracking (it has no field for any of them, and says it is not a diagnosis or treatment or medical advice); a habit tracker, streaks, a score, a percentage, or marking anything late or overdue; remembering bill, account or policy details, documents, photos or amounts (it holds your own notes only; you type a reference number in yourself); sending email, reading your inbox, scanning mail, placing a call, or calling anyone for you; email reminders, or any reminder on something without a date you chose; AI chat; sharing with a partner, family or clinician (single account); timing you; anything that says it will make starting easy or cure procrastination.

## Hard rules (the same truth rules as every Draftpace pin)
- No invented words, numbers, claims, features or requirements. Anything on a pin is copied from the cited source, or is a cut that keeps its words. Keep each guide's own limits and its "not a diagnosis" lines. Not medical advice.
- Where a figure, name or scenario is a guide's own made-up example, set `flags: ["example-tag"]`.
- Guide pin = "Free guide" on the pin; product pin = the product line with its real price (read from the listing automatically). Never put a price or a discount in a headline.
- Don't copy an existing pin: the 43 ADHD pins already made are in `creative/pinterest/strategy/alongside.json` (`pins[].title`). You may reuse a guide, but with a NEW angle and a NEW headline. The merge check rejects repeats.

## Formats (angles) to spread across
`mockup-app`: an app-store style promo pin like the homeschool reference (dark mulberry brand panel, app icon and name, a big two-tone headline, 3 to 4 feature rows, a large tilted phone showing a REAL app screen, a prop); `mockup-printable`: a REAL page of the Alongside Book on a desk, tilted, with a headline. Others: `checklist`, `how-to-steps`, `myth-vs-truth`, `question`, `comparison`, `scenario` (a relatable moment from a guide's own example), `script-card` (an opening line on an index card), `infographic`, `template-preview`, `quote-card`, `before-after`. Use at least 7 different angles in your slice and no single angle for more than a third of it. Visuals come from this product's world (archetypes in the strategy: opening-line-card, pile-sort, sticky-note-wall-to-one-card, notepad-checklist, companion-step-phone, pov-desk-scene) with desk props (mail pile, sticky notes, index cards, phone, laptop email window, wall calendar, clock, planner, folder, notepad). Avoid repeating the homeschool, finance and home scenes.

## What you deliver
1. Write your slice to `creative/pinterest/adhd/ideas/<slice>.json`, a JSON array, one object per idea:
```json
{
  "slice": "calls",
  "angle": "script-card",
  "headline": "Phone Call Anxiety: The Opening Line to Say First",
  "sub": "one real supporting line, or null",
  "items": ["real items shown on the pin, each copied from the source"],
  "link": { "kind": "guide", "slug": "how-to-make-a-phone-call-you-have-been-avoiding" },
  "proof": ["exact contiguous substrings copied from the source file that the pin's sub/items come from (so they can be grepped)"],
  "proofFile": "src/content/guides.ts",
  "query": "the Pinterest search phrase this pin should be found by",
  "board": "board name",
  "when": "evergreen | or the months it peaks",
  "visual": "one or two sentences: what is drawn, which layout/archetype, which props; for mockups: which real screen, workbook page or captured screen",
  "flags": [],
  "reserve": false
}
```
`link.kind` is `"guide"` or `"shop"` (product pins: `{ "kind": "shop", "slug": "alongside" }`).
2. Headline Pinterest-searchable (the search words first), at most 90 characters, plain US English, no exclamation marks, no em dashes. `query` a real phrase people type ("how to make a phone call you are avoiding", "adhd task paralysis"), not marketing words. `board` one of: ADHD Task Paralysis; Phone Call Anxiety Scripts; Paperwork Organization; ADHD Planning Systems; ADHD Life Admin; Brain Fog Life Admin; Overwhelm and Overdue (new boards may be proposed, give the name only).
3. Check with grep that every string in `proof` really occurs in `proofFile` (guides.ts may wrap strings or use curly quotes: quote the exact characters; `proofFile` for the printed book is `"book"`, for the listing `src/shop/products/alongside.ts`, for a walkthrough `src/products/alongside/playbooks/<file>.ts`). The merge check (`node pinterest/adhd/merge.mjs --check`) verifies that a pin linked to a guide quotes THAT guide when `proofFile` is `src/content/guides.ts`. Optionally `proofExtra: [{ "file": "...", "proof": ["..."] }]` for a second source.
4. You may do 1 to 3 WebSearch calls (load with ToolSearch "select:WebSearch") on what people search and pin in your topic; put 1 to 3 lines and URLs in `creative/pinterest/adhd/ideas/<slice>.research.md`. Ideas must still be grounded in OUR content. Do not spend long on it.
5. Mark your weakest ideas `reserve: true` (give 2 extra as reserves on top of the count).
6. Do not edit any other file; do not commit. Reply with: counts per angle, how many reserves, and anything you could not ground in real content.

## Slices (ideas needed, plus 2 reserves each)
- **product (20)**: mockups of the product itself, all `link.kind: "shop"`: `mockup-app` with the three real screens and screens to be captured, `mockup-printable` with real Alongside Book pages (read `book.txt`, name the real page titles). Proof from the listing, the book text, the playbooks or the guides' own product paragraphs. At most 10 of them mockup-app.
- **calls (14)**: guides `how-to-make-a-phone-call-you-have-been-avoiding`, `scripts-for-the-admin-calls-everyone-dreads`, `how-to-say-no-or-give-bad-news-on-the-phone`, `the-email-you-keep-not-sending-and-how-to-chase-a-reply`. Opening lines, scripts, first lines of emails, follow-ups.
- **starting (17)**: guides `task-paralysis-what-to-do-in-the-next-ten-minutes`, `first-physical-step-20-examples`, `executive-dysfunction-is-not-procrastination`, `why-you-keep-thinking-about-a-task-and-not-doing-it`, `why-to-do-lists-make-it-worse`.
- **overdue (14)**: guides `how-to-deal-with-something-you-have-put-off`, `how-to-start-when-everything-is-overdue`, `paperwork-pile-where-to-start`, `why-you-keep-missing-bill-due-dates`.
- **systems (13)**: guides `a-weekly-reset-that-survives-a-bad-week`, `why-you-abandon-planners-and-how-to-come-back`, `how-to-restart-a-project-you-gave-up-on`, `time-blindness-planning`.
- **fog (11)**: guides `life-admin-with-brain-fog` (about 6) and `diagnosed-with-adhd-as-an-adult` (about 5); only as the guides state them, never medical.
- **timely (12)**: any of the 19 guides, angled for the season the pin will run in (put the months in `when`: November to January is now: holiday overwhelm and the post nobody opened, year-end paperwork and bills, the new-year restart and the planner you stopped using; also Sunday reset, back-to-routine, a quiet week). The words still come from the guide; the season shows in the headline hook, never as a fabricated claim, deadline or statistic.

Keep the slice's pins on spread-out guides where you can (no guide more than 5 pins in your slice unless it is the only guide, and no two pins with the same visual idea). Ideas that quote the same sentence of a guide should differ in angle and headline.
