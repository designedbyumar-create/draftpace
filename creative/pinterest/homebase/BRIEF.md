# Home Base: the 101-pin idea bank (shared brief)

Read this whole file before you start. You are one of seven agents; each builds a slice of a bank of 101 Pinterest pin IDEAS (not images yet) for ONE product, **Home Base** (shop slug `home-management-companion`), for Draftpace's own Pinterest account. This is the same process that made the 101 Homeschooling Companion pins and the 101 Personal Finance Companion pins; the visual style is locked: the same mockup-and-scene pin style (see `creative/pinterest/homeschool/reference-mockup.png` and the finished pins in `creative/out/homeschool/pins/` and `creative/out/pfc/pins/`), now in this product's own world and colours (sage `#4f7a5c`, strong `#3d6149`, soft `#e6ede2`, paper `#f4f2ec`/`#fbfaf6`, ink `#1a2420`; ochre `#8a5a11` only for "needs a look" and safety, kraft tan for filters and cards, muted slate blue only for water). Nothing is rendered in this step: you write ideas, and each idea says what will be drawn.

## Who we are pinning to
US homeowners and renters (read `creative/pinterest/strategy/home-management-companion.md`, "Who pins this" and "The visual world"): first-time homeowners in the week after closing, northern-state homeowners pinning fall and winterizing lists, people who keep forgetting maintenance, home-binder makers who print checklists, renters moving in who want the deposit back, and whoever gets asked "where's the water shutoff?" and "what size is the filter?". Calm competence: the feeling of finally knowing where things are. No red, no countdowns, no disaster drama; a frozen pipe is a diagram.

## What a pin must link to
Exactly one of: a guide on our site (`/guides/<slug>`, in `src/content/guides.ts`, find it by slug) or the product (`/shop/home-management-companion`, listing `src/shop/products/home-management-companion.ts`). A pin's words, items and numbers come from what that link leads to: the guide's own text, tables, lists and examples; the product listing; the real app behaviour the guide describes; or the printed Home Survey workbook (36 pages, text in `creative/out/homebase/book.txt`, made by `node pinterest/homebase/merge.mjs` on first run, or decode it yourself with `pdftotext`).

The 17 guides that lead to this product (use these and only these as `guide` links):
- `home-maintenance-you-skip-that-costs-the-most`: Home maintenance jobs that cost the most to skip (nine jobs, how often each is due, what a missed one turns into)
- `how-often-home-systems-need-servicing`: Home maintenance schedule: how often to service each system (heating, cooling, water, structure, safety; seasonal jobs; your own manual wins)
- `what-to-record-when-you-buy-an-appliance`: What to write down when you buy an appliance (brand, model, serial number, purchase date, warranty end)
- `first-week-after-buying-a-house`: New house checklist: what to do in the first week (shutoffs, meter readings, alarms, appliance labels, inspection report)
- `home-maintenance-checklist-by-month`: Home maintenance checklist by month (January to December; jobs that cause damage if skipped; US, northern hemisphere)
- `what-to-keep-after-a-home-repair`: What to keep after a home repair, besides the invoice (what was wrong, what was replaced, what comes next)
- `appliance-warranties-what-to-track`: How to keep track of appliance warranties (what to record at purchase, the service condition that catches people out)
- `inherited-a-house-where-to-start`: Inherited a house with no records? Where to start (dating what you have, typical service lives, what to check first)
- `how-to-find-the-model-number-on-any-appliance`: How to find the model number on any appliance (where the data plate hides; what to do when the label has worn away)
- `fall-home-maintenance-checklist`: Fall home maintenance checklist by month (September, October, November in order)
- `winterize-your-house-checklist`: Winterize your house: jobs to finish before the first freeze
- `home-maintenance-log-template`: Home maintenance log template (four fields and one note: date, what was done, who did it, what it cost)
- `how-often-change-furnace-filter`: How often to change a furnace filter (and the size to note)
- `where-is-my-water-shutoff`: Where is your main water shutoff? (where the valve is, two valve types, a stuck valve, the one page to write it on)
- `how-to-make-a-home-binder`: How to make a home binder: what goes in and what stays out (five sections)
- `moving-into-a-rental-what-to-document`: Moving into a rental: what to document on day one (dated photos, lease dates, deposit, a log of what you report)
- `life-admin-binder-what-goes-in-it`: Life admin binder: what to include, in 8 sections

Product facts (from the listing and the guides' own product paragraphs; use only these): tell it whether you own or rent and tap what your home has across twelve areas (kitchen, laundry, structure, renting, boiler, garden, damp and pests, the papers and more); it suggests the care each usually needs and you untick what does not apply; nothing is created without your confirming it; paste in notes and it pulls out what it recognises for you to confirm line by line; Home shows what needs you now, what is coming up and what was recently handled, and when there is nothing it says so; a hand-built care schedule covering 122 kinds of thing, including seasonal jobs raised in the month they belong to; act on a job or push it back, and acting records who did it, what it cost and anything worth remembering; say what is broken in a sentence and it treats it as its own kind of problem and tells you who you already used for that kind of work; print an Item Card (make, model, what-to-buy line) to take to the counter; the facts that only matter in an emergency (like the water shutoff) written once on a page you can print and leave by the door; the printed 36-page "The Home Survey" workbook (walk your house once and write it all down: before you walk, the walk room by room, what it needs, the record). Real app screens: `creative/public/screens/home-management-companion-{history,seasons,workspace}.png` (390 px wide; they carry a Next.js dev badge to crop; rows are demo data); more can be captured later from the real components with stub data (Home page "needs you now", the Item Card PDF, a problem sentence, the care list for an area), exactly as was done for the other products.

Exclusions (NEVER claim): automatic reading of model numbers or warranty cards (there is no camera scan, no document upload, no AI reading your paperwork: everything is entered by you); a full room-by-room inventory valued for insurance; sharing or assigning jobs with a partner or housemate (single account); managing more than one property; reminders or notifications beyond what the listing says; that it books or contacts anyone; financial, insurance, legal or safety advice (a guide's table gives typical intervals, and "your own manual wins").

## Hard rules (the same truth rules as every Draftpace pin)
- No invented words, numbers, claims, features or requirements. Anything on a pin is copied from the cited source, or is a cut that keeps its words. Keep each guide's own limits ("your own manual wins", "US home, northern hemisphere", "typical"). Not professional, safety, legal or insurance advice.
- Where a figure or name is a guide's own made-up example, set `flags: ["example-tag"]`.
- Guide pin = "Free guide" on the pin; product pin = the product line with its real price (read from the listing automatically). Never put a price or a discount in a headline.
- Don't copy an existing pin: the 55 Home Base pins already made are in `creative/pinterest/strategy/home-management-companion.json` (`pins[].title`). You may reuse a guide, but with a NEW angle and a NEW headline.

## Formats (angles) to spread across
`mockup-app`: an app-store style promo pin like the homeschool reference (dark brand panel, app icon and name, a big two-tone headline, 3 to 4 feature rows, a large tilted phone showing a REAL app screen, a prop); `mockup-printable`: a REAL page of the Home Survey workbook (or the Item Card PDF) on a desk/binder/clipboard, tilted, with a headline. Others: `checklist`, `how-to-steps`, `myth-vs-truth`, `question`, `comparison`, `scenario` (a relatable moment from a guide's own example), `infographic` (a house cutaway, a year wheel, intervals, a month strip), `template-preview` (a fill-in log or data plate from a guide), `quote-card`, `before-after`. Use at least 7 different angles in your slice and no single angle for more than a third of it. Visuals come from this product's world (the 7 archetypes in the strategy JSON: house-cutaway, year-wheel, fridge-list, plate-closeup, survey-binder, then-and-now, move-in-walkthrough) with house props (furnace, filter, water heater, shutoff valve, outdoor tap, gutter, model plate, binder, keys, a fridge door, floor plans, photo tiles). Avoid repeating the homeschool and finance scenes.

## What you deliver
1. Write your slice to `creative/pinterest/homebase/ideas/<slice>.json`, a JSON array, one object per idea:
```json
{
  "slice": "appliances",
  "angle": "question",
  "headline": "How to Find the Model Number on Any Appliance: Where the Plate Hides",
  "sub": "one real supporting line, or null",
  "items": ["real items shown on the pin, each copied from the source"],
  "link": { "kind": "guide", "slug": "how-to-find-the-model-number-on-any-appliance" },
  "proof": ["exact contiguous substrings copied from the source file that the pin's sub/items come from (so they can be grepped)"],
  "proofFile": "src/content/guides.ts",
  "query": "the Pinterest search phrase this pin should be found by (what a US homeowner types)",
  "board": "board name",
  "when": "evergreen | or the months it peaks",
  "visual": "one or two sentences: what is drawn, which layout/archetype, which props; for mockups: which real screen, workbook page or captured screen",
  "flags": [],
  "reserve": false
}
```
`link.kind` is `"guide"` or `"shop"` (product pins: `{ "kind": "shop", "slug": "home-management-companion" }`).
2. Headline Pinterest-searchable (the search words first), at most 90 characters, plain US English, no exclamation marks, no em dashes. `query` a real phrase people type ("home maintenance checklist by month", "how often to change furnace filter"), not marketing words. `board` one of: Home Maintenance Checklists; Seasonal Home Maintenance; Appliance Records and Warranties; Home Binder and Printables; New Homeowner Checklists; Renting and Move-In; Home Safety and Shutoffs; Home Maintenance Log (new boards may be proposed, give the name only).
3. Check with grep that every string in `proof` really occurs in `proofFile` (guides.ts may wrap strings or use curly quotes: quote the exact characters; `proofFile` for the printed workbook is `"book"`, for the listing `src/shop/products/home-management-companion.ts`). The merge check (`node pinterest/homebase/merge.mjs --check`) verifies that a pin linked to a guide quotes THAT guide when `proofFile` is `src/content/guides.ts`. Optionally `proofExtra: [{ "file": "...", "proof": ["..."] }]` for a second source.
4. You may do 1 to 3 WebSearch calls (load with ToolSearch "select:WebSearch") on what US homeowners search and pin in your topic; put 1 to 3 lines and URLs in `creative/pinterest/homebase/ideas/<slice>.research.md`. Ideas must still be grounded in OUR content. Do not spend long on it.
5. Mark your weakest ideas `reserve: true` (the slice count below is what is needed; give 2 extra as reserves).
6. Do not edit any other file; do not commit. Reply with: counts per angle, how many reserves, and anything you could not ground in real content.

## Slices (ideas needed, plus 2 reserves each)
- **product (20)**: mockups of the product itself, all `link.kind: "shop"`: `mockup-app` with the three real screens and captured screens, `mockup-printable` with real Home Survey pages (36 pages: read `book.txt`; name the real page titles) and the Item Card. Proof from the listing, the workbook text, or the guides' own product paragraphs. At most 10 of them mockup-app.
- **appliances (13)**: guides `what-to-record-when-you-buy-an-appliance`, `appliance-warranties-what-to-track`, `how-to-find-the-model-number-on-any-appliance`.
- **maintenance (15)**: guides `how-often-home-systems-need-servicing`, `home-maintenance-you-skip-that-costs-the-most`, `how-often-change-furnace-filter`, `home-maintenance-log-template`, `what-to-keep-after-a-home-repair`.
- **seasonal (17)**: guides `home-maintenance-checklist-by-month`, `fall-home-maintenance-checklist`, `winterize-your-house-checklist`; TIMELY: say the months in `when` (winterizing and fall pins are in season now; spring, summer and month-by-month pins later).
- **moving (14)**: guides `first-week-after-buying-a-house`, `inherited-a-house-where-to-start`, `moving-into-a-rental-what-to-document`.
- **binder (12)**: guides `how-to-make-a-home-binder`, `life-admin-binder-what-goes-in-it`.
- **safety (10)**: guide `where-is-my-water-shutoff` (about 5), plus pins on the shutoffs and safety facts that appear in `first-week-after-buying-a-house` and `home-maintenance-you-skip-that-costs-the-most` (smoke and CO alarms, the panel, the gas shutoff, only as the guides state them).

Keep the slice's pins on spread-out guides where you can (no guide more than 5 pins in your slice unless it is the only guide, and no two pins with the same visual idea). Ideas that quote the same sentence of a guide should differ in angle and headline.
