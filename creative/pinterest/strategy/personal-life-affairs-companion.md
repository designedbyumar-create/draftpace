# Personal Life Affairs Companion: Pinterest visual strategy

Pin folder `ple`. Data for the renderer: `personal-life-affairs-companion.json` in this folder.

## The problem with the current pins

Every product's pins use the same serif headline, the same flat icons (document, bank, toolbox, people) and the same product card. So a will pin looks like a car-maintenance pin. This brief gives the product a world of its own that its audience will recognise: a navy book called **My Affairs** on a shelf, a sealed will envelope, a beneficiary form with one name line highlighted, a key ring with manila tags, a deposit box, a locked phone, a pet with a care note, a filing box, and a chain of people to call.

## Who pins this

- People who have meant to "sort this out" for years and never found a first step small enough to take.
- Savers of *in case of emergency binder*, *if something happens to me file* and *life admin binder* ideas, often after giving up on a printable binder at tab 2.
- Parents of young children thinking about guardians and who is named on the pension.
- New executors, and adult children trying to find a parent's will or accounts.
- Anyone who has just moved, married, had a baby, changed jobs or separated.
- Pet owners and carers who want one note that says who steps in.
- Privacy-minded planners who will not write passwords in a binder.

## What wins in this niche (research)

- **Printables are sold with mockups.** Sellers' guides say mockups of the printable in use, plus previews of several pages, lift click-through, and treat Pinterest as the main channel for printables ([ExpertBeacon](https://expertbeacon.com/how-to-make-printables-to-sell/), [Dodo Payments](https://dodopayments.com/blogs/sell-printables-online)). This product's output really is a printed book, so the honest mockup is that book.
- **"What goes inside" is the dominant format.** Emergency and death-binder content is organised by section ([Frugal Confessions](https://www.frugalconfessions.com/financial-health/family-emergency-binder-free-printable/), [NewlyNamed](https://newlynamed.com/blogs/guides/emergency-binder-checklist)). Retail "If I Die" binders sell on their section count ([Walmart listing, 16 sections](https://www.walmart.com/ip/19376209286)).
- **Ordered steps get saved.** Most top-performing pins show how to do something, step by step ([Tailwind](https://www.tailwindapp.com/blog/wp-json/wp/v2/posts/6910)), and multi-step checklists are what people save to come back to ([Schedulala](https://schedulala.com/blog/pinterest-idea-pins-guide)). Executor kits sell a "First 90 Days" map and a notification log ([Payhip executor binder](https://payhip.com/b/nlEMD)).
- **Passwords split the niche.** Many binder printable sets include a "passwords log". Digital-legacy guidance warns against writing passwords down, especially in a will ([TechHappy digital legacy guide](https://techhappy.co.nz/wp-content/uploads/2025/12/Your-Digital-Legacy_-A-TechHappy-Guide-to-Tying-Up-Loose-Ends.pdf), [Santa Cruz PL handout](https://www.santacruzpl.org/files/docs/programs/events/TechTalks-Digital-Legacy-04282022.pdf)). This product's "where, not what" rule is the trustworthy side of that split.
- **Keeping it current is a universal tip.** Every guide says to review once a year or after a big change ([Protective](https://protective.com/learn/how-to-build-an-in-case-of-death-binder), [Frugal Confessions](https://www.frugalconfessions.com/financial-health/family-emergency-binder-free-printable/)).
- **Format basics.** Use a 2:3 vertical pin (1000x1500). Keep text short, legible and high-contrast, and avoid script fonts. Put a subtle logo on every pin, but not in the lower-right corner, which Pinterest's own icons cover. Keep the key object large and centred so it survives grid crops ([Pinterest Business Community: text overlays](https://community.pinterest.biz/t/designing-pins-text-overlays-dos-donts/661), [Pinterest Business Community: formats for product sellers](https://community.pinterest.biz/t/the-best-pin-formats-and-practices-for-product-sellers/1319), [Marpipe](https://www.marpipe.com/ad-glossary/2-3-aspect-ratio-pinterest), [Tailwind size chart](https://www.tailwindapp.com/blog/pinterest-image-size)).
- **Colour.** The product's own theme notes (`src/products/personal-life-affairs-companion/definition.ts`) record that this feed is mostly sage/teal or red/black. Navy ink on cream is the open seat. This is an in-repo observation, not one we could re-check.

**Limits of the research.** We found no save-rate or click data specific to this niche. Pinterest's own help pages and Trends data could not be loaded from this environment. The "why it gets clicked" lines are therefore best practice plus reasoning, not measurements.

## Visual world

- **Palette.** The product's real colours: ink navy `#26374f` on cream `#efebe2` and paper `#fbf8f1`. Brass `#9a7b3f` is used only for confirmed, highlighted or done things, as in the printed book. Manila is used for tags.
- **Mood.** A tidy study on a weekday morning: calm, orderly, respectful. No candles, lilies, gravestones, hourglasses or black backgrounds. No faces.
- **Rules.** Flat SVG only, plus the three real screenshots where they show the pin's subject. No tag, safe or phone ever shows a number, code or password, even a fake one.

## The seven archetypes

**1. The Book on the Shelf (`shelf-book`).** The navy *My Affairs* book with its brass ribbon is pulled out from plain spines on a shelf, or lies open at its real first page, "If you need to.". This is the printable mockup the niche expects, and the book is real. The headline sits on top, the shelf in the middle, and one real line on a paper card below. Use it for the book itself, how to keep it, and starting with your own.

**2. Inside the Binder (`inside-the-binder`).** A ring binder lies open flat, with real tab labels stepping down its edge. Where a tab doesn't apply, it is simply missing: a gap, never crossed out. This is the niche's classic "what goes inside" list, and the gaps show this product's "skip what doesn't apply" at a glance. A filing-box version covers the executor's list.

**3. The Line on the Form (`the-name-line`).** The headline sits in cream on a navy top band. Below it, a beneficiary form is pulled out over the band edge. One name line is highlighted in brass, and a sealed will envelope is tucked behind. The form carries rows copied from the guide's tables. One big document reads at thumbnail size, and the highlight shows the "form beats will" surprise without words.

**4. Where, Not What (`where-not-what`).** The object comes first and the headline sits lower, which makes these pins look different in a feed. The object might be a key ring hanging from a hook, a deposit box, a locked phone with blank passcode dots, a photo stack, or a pet with a collar tag. Manila tags carry the product's real prompts, such as *"A name, not a code. Never record the combination here."* This is the trustworthy answer to the "passwords log" printables.

**5. In This Order (`in-this-order`).** A numbered chain of cards joined by a dotted brass line, each card a "who" or "when" plus one line. It covers who to tell and when, where to search for a will, the hospital two-week timeline, and the handoff scenarios. Step-by-step is what Pinterest saves.

**6. One Question at a Time (`one-question`).** On a slate-blue ground (the only archetype off cream, so shop pins are recognisable), a large card is drawn in the app's own style. It shows one real question, its real hint and its real answer pills, such as *Yes / No / I'm not sure* or *Stop it / Keep it going*. The real screenshot appears only where it shows that step. This is the product's actual difference from every binder in the feed.

**7. Still True? (`still-true`).** A timeline strip marked 12, 24 and 36 months, with life-event stamps sitting on it (*I moved*, *I got married*, *I separated or divorced*...). Below it are the app's two real buttons, *Still true* and *Update it*. It answers the saver's worry that a binder is out of date the day it's finished.

## Pins → archetype

| Pin | Headline | Archetype |
|---|---|---|
| ple/pin-3.1 | Your Beneficiary Forms Quietly Override Your Will | The Line on the Form |
| ple/pin-3.2 | A Step That Checks Who Is Named on the Form | One Question at a Time |
| ple/pin-3.3 | The Beneficiary Form You Filled In on Your First Day | In This Order |
| ple/pin-3.4 | Update the Named Person When Your Situation Changes | Still True? |
| ple/pin-3.5 | A Form Filled In Years Ago Quietly Wins | The Line on the Form |
| ple/pin-4.1 | Where to Look for a Will When You Cannot Find One | In This Order |
| ple/pin-4.2 | Write Down Where the Will Is, in Your Own Words | One Question at a Time |
| ple/pin-4.3 | You Have Been Named Executor: What You Agreed To | Inside the Binder |
| ple/pin-4.4 | Where Does Your Executor's Authority Stand? | One Question at a Time |
| ple/pin-4.5 | Does Anyone Else Know Where It Is? | Where, Not What |
| ple/pin-5.1 | What Goes in a Life Admin Binder | Inside the Binder |
| ple/pin-5.2 | A Printable Book That Says Where Everything Is | The Book on the Shelf |
| ple/pin-5.3 | If You Were in the Hospital for Two Weeks, What Would Someone Need to Find? | In This Order |
| ple/pin-5.4 | A Page That Opens on What Someone Is Trying to Do | The Book on the Shelf (open) |
| ple/pin-5.5 | Keep It Somewhere Private | Where, Not What |
| ple/pin-6.1 | Skip What Does Not Apply to You | Inside the Binder |
| ple/pin-6.2 | Do You Own the Place You Live? One of Eight Questions | One Question at a Time |
| ple/pin-6.3 | Renters Skip the Deed, Pet-Free Skip the Pets | The Book on the Shelf |
| ple/pin-6.4 | Eight Yes or No Questions That Shape the Whole Book | One Question at a Time |
| ple/pin-6.5 | Nothing That Does Not Apply to You | Inside the Binder (filing box) |
| ple/pin-7.1 | Who Would Speak for You About Medical Care? | The Line on the Form |
| ple/pin-7.2 | Have You Talked to Them About What You Would Want? | One Question at a Time |
| ple/pin-7.3 | Who Would Raise Your Children? A Checklist for Naming Someone | The Line on the Form |
| ple/pin-7.4 | A Name Is Enough to Begin With | One Question at a Time (real screen) |
| ple/pin-7.5 | Who to Tell When Someone Dies, and in What Order | In This Order |
| ple/pin-8.1 | Can Someone Unlock Your Phone? | Where, Not What |
| ple/pin-8.2 | Where the Recovery Kit Is, Without Writing the Password | One Question at a Time |
| ple/pin-8.3 | Which Email Is Everything Registered To? | In This Order |
| ple/pin-8.4 | Stop It, Keep It Going, or Not Sure | One Question at a Time |
| ple/pin-8.5 | Where Do Your Photographs Actually Live? | Where, Not What |
| ple/pin-9.1 | After a Move, a Marriage or a New Baby: What to Look At Again | Still True? |
| ple/pin-9.2 | Tell It Something Changed, and It Finds What to Look At | One Question at a Time |
| ple/pin-9.3 | What Paperwork to Look At After a Separation or Divorce | The Line on the Form |
| ple/pin-9.4 | Still True? A Question, Not a Task You Failed | Still True? |
| ple/pin-9.5 | A Picture Goes Out of Date All at Once | In This Order |
| ple/pin-10.1 | The Safe, the Deposit Box and the Spare Key: Who Can Open Them? | Where, Not What |
| ple/pin-10.2 | A Name, Not a Code | One Question at a Time |
| ple/pin-10.3 | What Happens to Your Pets If Something Happens to You | Where, Not What |
| ple/pin-10.4 | Could Someone Pick This Up and Know What to Do? | In This Order |
| ple/pin-10.5 | Start With Your Own | The Book on the Shelf |
| Maple 01 | The 'if something happens to me' file, one question at a time | The Book on the Shelf |
| Maple 02 | Would anyone know where your will is? | Where, Not What |
| Maple 03 | ICE binder: the three things that matter most | Inside the Binder |
| Maple 04 | POV: you've meant to sort this out for six years | One Question at a Time (real screen) |
| Maple 05 | Print a book your family can actually use | The Book on the Shelf (open) |
| Maple 06 | Your beneficiary forms can override your will | The Line on the Form |
| Maple 07 | Wrote it all down once, years ago? | One Question at a Time (real screen) |
| Maple 08 | Life changes that make your paperwork wrong | Still True? |
| Maple 09 | Could someone else actually handle it if they had to? | In This Order |
| Maple 10 | A life admin binder minus the pages that aren't you | Inside the Binder |

Maple ids are `Pin-mm-personal-life-affairs-companion-01` to `-10`, from `findsPinId` in `creative/pinterest/finds-ids.ts`. No two neighbouring pins share an archetype, in either account.

## Notes for whoever builds it

- Every word on a pin is copied from the pin's own description, the listing, the linked guide or the product's code. Each pin's source is named in the JSON. Guide lines may be cut after a clause but are never reworded.
- "One Question at a Time" cards are illustrations in the app's style, not fake screenshots. A real screenshot appears only on 4.2, 5.2, 7.4, 10.4 and Maple 02, 04 and 07, where it shows the subject.
- The product records where things are and who knows. It does not store passwords or documents, write a will, contact anyone or send reminders, and no pin may suggest it does. Nothing on a pin is legal advice: legal-sounding rows (for example, beneficiary forms) are the guide's general US shape, and the example row on 9.3 stays labelled "(example)".
