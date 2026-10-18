# Home Base on Pinterest: a visual strategy

The machine-readable version of this brief, with every pin's content and sources, is
`creative/pinterest/strategy/home-management-companion.json`.

## The problem with the current pins

Every product's pins come from one template (`creative/src/compositions/formats/finds-pin.tsx`): a serif headline, generic thick-outline icons (`house`, `calendar`, `toolbox`, `water`) and a product card. A Home Base pin looks like a travel pin or a finance pin. People saving home-maintenance content are looking for *their house*: the furnace, the shutoff, the filter, the fridge with the list on it. This brief gives Home Base its own world.

## Who pins this

- First-time homeowners in the week after closing, keys in hand, with no idea what the house needs.
- Homeowners in freezing northern US states, pinning fall and winterizing lists in September and October.
- People who keep forgetting home maintenance and want to be told what needs them this week.
- Home-binder makers who print checklists and fill them in by hand.
- Renters moving into a flat who want the deposit back and the notice date remembered.
- Whoever in the house gets asked "where's the water shutoff?" and "what size is the filter?"

## What wins in this niche

I couldn't open Pinterest from this environment: pinterest.com and business.pinterest.com were blocked by the network proxy. So none of this comes from sampling live top pins. It comes from web search across Pinterest's published guidance, pin-marketing tools and the printables that dominate the niche. Treat the vendor figures as directional.

- **The niche is printable checklists, sorted by time.** Search results for home maintenance are almost all "free printable" checklists organised by month, season or year, usually as PDFs. The same items keep coming up: furnace filter, outdoor spigots before winter, gutters. Examples: [Prudent Reviews](https://prudentreviews.com/home-maintenance-checklist/), [Scattered Squirrel](https://scatteredsquirrel.com/2024/01/home-maintenance-printables/), [Free Organizing Printables](https://freeorganizingprintables.com/home-maintenance-checklist-printables/), [Onotto's 62 seasonal tasks](https://www.onotto.com/home-maintenance-checklist/). A 52-week checklist that went viral (outside Pinterest) shows the appetite for a year-long plan ([BuzzFeed](https://www.buzzfeed.com/rossyoder/weekly-home-checklist-home-maintenance-tips)).
- **Checklists, how-tos and infographics are the formats that get saved.** Tailwind and a Pinterest business community thread both name these formats ([Tailwind pin design tips](https://www.tailwindapp.com/blog/pinterest-pin-design-tips), [Pinterest Business Community](https://community.pinterest.biz/t/what-types-of-pins-have-worked-best-for-driving-traffic-to-your-blog-or-business-lately/39919)).
- **Use 2:3 at 1000×1500 with a short text overlay that reads on a phone.** Put a subtle logo on the pin, but not in the lower-right corner, because Pinterest's own icons cover it ([Pinterest Business Community: best pin formats](https://community.pinterest.biz/t/the-best-pin-formats-and-practices-for-product-sellers/1319), [text overlay dos and don'ts](https://community.pinterest.biz/t/designing-pins-text-overlays-dos-donts/661)). Tailwind suggests leaving about 20% of the image free for the text ([Tailwind course](https://www.tailwindapp.com/pinterest-marketing/course/pin-image-size-and-styles)).
- **Muted colours do well, and pins last.** Tailwind's study of over a million pins found that successful pins skew to muted whites, greys and soft hues. About 60% of pins are more than a year old, and viral pins peak 1–2 years after posting. That makes this niche evergreen, so it's worth getting the drawings right ([Simple Pin Media #411](https://www.simplepinmedia.com/analyzing-1-million-pins/)).
- **Seasonal pins need lead time.** Simple Pin Media cites Pinterest advising about 45 days ahead of a season ([Simple Pin Media](https://www.simplepinmedia.com/holiday-marketing-on-pinterest/)). SocialKit says 30–45 days ([SocialKit](https://socialk.it/en/blog/pinterest-seasonal-marketing)) and Tailwind says 60–90 days ([Tailwind](https://www.tailwindapp.com/blog/seasonal-content-on-pinterest/amp?nonamp=1)). The winterizing pins are already late for October, so they should go first.
- **Home binders are a genre of their own**: tabbed sections with the emergency page at the front ([The Homes I Have Made: Family HUB](https://thehomesihavemade.com/new-to-the-organization-toolbox-the-hub-your-ultimate-home-management-system/), [Scattered Squirrel emergency contacts printables](https://scatteredsquirrel.com/2016/10/emergency-contacts-and-home-related-information-printables/)).
- **Marking shutoffs on a plan is standard advice**, because it stops someone closing the wrong valve in an emergency ([A Buyer's Choice: identifying shut-off valves](https://abuyerschoice.com/identifying-shut-off-valves-and-breakers-in-your-home/)). That supports a labelled house drawing.
- **Renter guidance comes down to one ritual**: photograph every room wall by wall, with dates, before unpacking ([Tellus](https://resources.tellusapp.com/tenants/security-deposits/documenting-your-apartment-condition-for-deposit-protection), [Happy.co](https://webflow.happy.co/resources/tenant-move-in-inspection-checklist), [Manaky](https://manaky.com/blog/what-to-document-at-rental-move-in/)).

## The visual world

Every pin is a sheet from a drawing set of your own house. The look borrows from the Home Survey printable Home Base already ships: warm drawing paper, registration ticks in the corners, a faint squared grid, thin 2–3px lines. That is a deliberate break from the thick cartoon outlines of the shared template.

- **Colour.** Home Base sage `#4f7a5c` is the one accent, with paper `#f4f2ec`/`#fbfaf6` and ink `#1a2420`. Ochre `#8a5a11` is used only for "needs a look" and SAFETY tags, kraft tan for filters and cards, and a muted slate blue only for water and ice. There is no red and no countdown.
- **Mood.** Calm competence: the feeling of finally knowing where things are. Even the frozen pipe is drawn as a diagram, not a disaster.
- **Props.** There are 33 in the JSON, each with drawing notes: house cutaway, furnace, furnace filter with "16x25x1" on the frame, water heater, main shutoff valve (ball and gate), outdoor faucet, frozen pipe, gutter, fridge door, fridge note, Item Card, model plate, open binder, year wheel, rental floor plan, photo tiles, and more.

## The seven archetypes

**1. Labelled house cutaway.** A section through an ordinary two-storey house with a basement. Up to six callouts sit on the real spots: furnace, water heater, shutoff, gutters, outdoor faucet, dryer vent, smoke alarm. Each label is an item name and a care task taken from `homeKnowledge.ts`, or a row from the real screenshots. Only the called-out fixtures are in full colour. This is the flagship image, and it reads at thumbnail size. Renters get an apartment version with the roof and gutters drawn as ghost outlines.

**2. The year as a wheel.** Twelve wedges with January at the top. Each wedge is shaded by how many seasonal jobs it holds, using the real counts from Home Survey Plate 15: September 10, October 11, April 9, and January, July, August and December empty. A highlighted wedge pulls out to a card of real jobs. Empty months are labelled "Clear", and the plate's own line, "Nothing seasonal. A good month.", can sit in the centre. This is the month-by-month calendar the niche is built on, as one shape.

**3. The list on the fridge.** A fridge door fills the right two-thirds of the pin. A torn notepad sheet held by magnets carries 4–7 real tasks, each with a grey reason line or month tag in the product's own voice ("Last done 6 months ago, usually every 6 months"). It is the printable checklist, placed where a household actually keeps one.

**4. Close-up plate of one object.** One object drawn large with its fact printed on it: the filter showing 16x25x1, the model plate with MODEL and SERIAL, the ball valve with its lever across the pipe, the water heater with its three jobs. The Item Card or a note card overlaps it at an angle. It answers the concrete search ("what size filter?", "where's the model number?") in the picture itself.

**5. The open home binder.** The Home Survey open flat, with real tab names and one real plate on the right page: Plate 01 "If something goes wrong tonight.", Plate 15 "What belongs to which month.", Plate 18 "The home's memory." or Plate 19 "The dates that cost money to miss." This is the binder genre, filled with what the product actually prints.

**6. Then and now panels.** Two to four stacked bands, each with one label, one drawing and one real line. The examples: October's drained faucet against January's split pipe, date job against interval job, invoice against diagnosis, Tap / See / Add, Note / Print / Bring, and Walk / Write / Enter / Forget. Before/after and step-by-step are the core how-to shapes, and they read one band at a time on a phone.

**7. Renter's move-in photo walk-through.** A top-down plan of a flat with a numbered dotted route and viewfinder corners in each room, plus a row of drawn photo tiles stamped "Sep 26", the date from the guide's own example. It is the renter ritual as a map, used only for the renter pins.

## Pins and archetypes

No two consecutive pins in the Draftpace sequence share an archetype.

| Account | Pin | Headline | Archetype |
|---|---|---|---|
| Draftpace | homebase/pin-2.1 | What Is Wrong, What Is Due, What Is Done | House cutaway |
| Draftpace | homebase/pin-2.2 | Home Maintenance App With a Reason Under Every Row | Fridge list |
| Draftpace | homebase/pin-2.3 | How Often Things in Your House Actually Need Servicing | Year wheel |
| Draftpace | homebase/pin-2.4 | Ranks by What Costs Most to Ignore | House cutaway |
| Draftpace | homebase/pin-2.5 | Which Home Maintenance Jobs Matter Most, and Which Can Wait | Then and now |
| Draftpace | homebase/pin-3.1 | New Homeowner Checklist: Start With What Is in Your House | Fridge list |
| Draftpace | homebase/pin-3.2 | Set Up Your House in a Few Taps | House cutaway |
| Draftpace | homebase/pin-3.3 | First Week in a New House: What to Write Down Before You Forget | Close-up plate |
| Draftpace | homebase/pin-3.4 | New Homeowner Maintenance Made Simple: Tap, See, Add | Then and now |
| Draftpace | homebase/pin-3.5 | What to Capture in the First Week After Buying a House | House cutaway |
| Draftpace | homebase/pin-4.1 | Fall Home Maintenance Checklist by Month | Fridge list |
| Draftpace | homebase/pin-4.2 | A Home Maintenance Calendar That Matches Your House | Year wheel |
| Draftpace | homebase/pin-4.3 | Home Maintenance Checklist by Month, Minus the Jobs That Do Not Matter | Then and now |
| Draftpace | homebase/pin-4.4 | Some Months of Home Maintenance Are Empty, and That Is Fine | Year wheel |
| Draftpace | homebase/pin-4.5 | Why Seasonal Home Jobs Belong on a Calendar, Not a Timer | Then and now |
| Draftpace | homebase/pin-5.1 | Winterize Your House: Jobs to Finish Before the First Freeze | House cutaway |
| Draftpace | homebase/pin-5.2 | Printable Home Maintenance Calendar: What Belongs to Which Month | Open binder |
| Draftpace | homebase/pin-5.3 | Winterize Home Checklist: 5 Jobs Before the Cold Arrives | Fridge list |
| Draftpace | homebase/pin-5.4 | Before the Freeze, Not After the Pipe Bursts | Then and now |
| Draftpace | homebase/pin-5.5 | Before the First Freeze: Why Freeze Jobs Are Date Jobs | Year wheel |
| Draftpace | homebase/pin-6.1 | Home Maintenance Log: What to Write Every Time | Open binder |
| Draftpace | homebase/pin-6.2 | Home Maintenance Tracker That Keeps Your House's History | House cutaway |
| Draftpace | homebase/pin-6.3 | What to Write Down After Every Home Repair | Close-up plate |
| Draftpace | homebase/pin-6.4 | Stop Digging Through Drawers for the Repair Receipt | Fridge list |
| Draftpace | homebase/pin-6.5 | The Diagnosis Matters More Than the Invoice | Then and now |
| Draftpace | homebase/pin-7.1 | Furnace Filter Size: Write It Down Once, Never Guess Again | Close-up plate |
| Draftpace | homebase/pin-7.2 | Print the Item Card and Take It to the Hardware Store | House cutaway |
| Draftpace | homebase/pin-7.3 | How to Find the Model Number on Any Appliance | Close-up plate |
| Draftpace | homebase/pin-7.4 | Write the Filter Size Once: Note, Print, Bring | Then and now |
| Draftpace | homebase/pin-7.5 | The Model Number Is Behind the Fridge (and Other Home Truths) | House cutaway |
| Draftpace | homebase/pin-8.1 | Home Repair Record: Write the Problem Down First | Fridge list |
| Draftpace | homebase/pin-8.2 | Home Repair Tracker That Remembers Who You Called Last Time | Then and now |
| Draftpace | homebase/pin-8.3 | Do You Know Where Your Main Water Shutoff Is? | House cutaway |
| Draftpace | homebase/pin-8.4 | Fill In This Page Tonight: If Something Goes Wrong | Open binder |
| Draftpace | homebase/pin-8.5 | Why You Should Find Your Water Shutoff Today | Close-up plate |
| Draftpace | homebase/pin-9.1 | Home Binder: What Goes In It and What Does Not | Open binder |
| Draftpace | homebase/pin-9.2 | Home Maintenance Printable: A 36-Page Home Survey Book | House cutaway |
| Draftpace | homebase/pin-9.3 | What to Put in a Home Binder: 5 Sections That Matter | Open binder |
| Draftpace | homebase/pin-9.4 | Home Binder in Four Steps: Walk, Write, Enter, Forget | Then and now |
| Draftpace | homebase/pin-9.5 | What Not to Put in a Home Binder | Fridge list |
| Draftpace | homebase/pin-10.1 | Renter's Move-In Checklist: What to Document on Day One | Move-in walk-through |
| Draftpace | homebase/pin-10.2 | Lease and Deposit Tracker for Renters | House cutaway (apartment) |
| Draftpace | homebase/pin-10.3 | What to Document When You Move Into a Rental | Fridge list |
| Draftpace | homebase/pin-10.4 | From "Where Is the Lease?" to One Notice Date | Then and now |
| Draftpace | homebase/pin-10.5 | Rental Move In Checklist: Photograph Everything on Day One | Move-in walk-through |
| Maple | Pin-mm-home-management-companion-01 | The home checklist that just tells you what's due this week | Fridge list |
| Maple | Pin-mm-home-management-companion-02 | Is it broken, or just due? | Then and now |
| Maple | Pin-mm-home-management-companion-03 | Home maintenance for people who hate home maintenance | Fridge list |
| Maple | Pin-mm-home-management-companion-04 | POV: you remember the gutters in December | Year wheel |
| Maple | Pin-mm-home-management-companion-05 | 122 kinds of thing, one care schedule | House cutaway |
| Maple | Pin-mm-home-management-companion-06 | Start with twelve areas, not a 200-item list | Open binder |
| Maple | Pin-mm-home-management-companion-07 | That water heater you've never once thought about | Close-up plate |
| Maple | Pin-mm-home-management-companion-08 | Room by room: what your house needs and when | House cutaway |
| Maple | Pin-mm-home-management-companion-09 | Me pretending I know how often the furnace needs a service | Year wheel |
| Maple | Pin-mm-home-management-companion-10 | A home app that only speaks up when something's due | Then and now |

## Notes for whoever renders these

- **Crop the screenshots.** All three Home Base captures in `creative/public/screens/` have the Next.js dev badge (a black "N") and a "Start" bar near y≈790–840 of the 390px-wide image. Crop above or below them; the JSON gives a crop for each screen.
- **The screenshot rows are demo data.** "Dripping tap in the kitchen", "Gas engineer · $115.00" and similar rows come from the product's demo home, and the workspace screen labels some items "Example". They are real product screens, but don't present them as a customer's house.
- **Some values are the guides' own examples.** 16x25x1, Ace Plumbing, Sep 26 and the model plate's ABC1234XYZ appear in the guides as examples (the model-number guide calls its values made up). They are fine as illustrations, not as claims.
- **Never write "overdue" on a pin.** The product forbids the word (`homeVoice.ts`).
- **Keep the lower-right 200×200 empty.** That is where Pinterest's icons sit.
