# Travel Companion: Pinterest visual strategy

The current pins share one template with every other product: a serif headline, generic flat icons and a product card. This brief gives Travel Companion its own look, built from what a traveller actually handles: suitcases, passports, boarding passes, luggage tags, departure boards, printed pages and route maps. The visuals are flat vector illustrations, typography and the product's real screenshots only. There are no photos, no AI images and no stock.

The machine-readable plan, with every pin's content and sources, is in `travel-companion.json` next to this file.

## Who saves these pins

- The person everybody in the group asks what happens next.
- Parents packing for children or a baby, with one list per child.
- People planning a first trip abroad, who check passports and entry rules and want paper copies.
- Multi-stop travellers whose flights, transfers and stays were booked around each other.
- People who have lived through one delay cascade and now save "flight delayed, what to do" pins.
- Anyone who wants a paper copy for when the phone is at four percent in a taxi.

## What wins in this niche

There is no public, measured comparison of pin formats in travel. Most of what follows is practitioner guidance plus Pinterest's own figures. Treat it as direction, then check it against our own analytics.

- **Packing content is the reliable traffic driver.** Pinterest reported that searches for "packing guide" rose 480% year over year, with over 10 billion travel saves a year ([Social Media Today](https://www.socialmediatoday.com/news/pinterest-insight-summer-travel-trends/714095/), a secondary report). Simple Pin Media says packing lists and list posts are dependable traffic for travel ([Simple Pin Media](https://www.simplepinmedia.com/?p=3213)). Travellers say they use Pinterest to decide what to pack, how much to budget and how to map out itineraries ([Skift](https://skift.com/2017/08/21/from-dreaming-to-departure-how-pinterest-reaches-travelers-throughout-the-entire-customer-journey/)).
- **Itinerary graphics and tip lists are the recommended formats.** Practitioners name itinerary graphics, how-tos and tip articles as the travel content to post, and pins that tease a list, such as "10 traveler secrets to packing smart", as the pattern ([Social Media Today best practices](https://www.socialmediatoday.com/content/social-media-best-practices-travel-pinterest), [AdvertiseMint](https://www.advertisemint.com/?p=12380)). One clear idea per pin works best ([Houfy](https://www.houfy.com/de/blog/pinterest-ideas-that-drive-vacation-rental-bookings)).
- **Checklist and printable pins are a standard category.** Template sellers build whole packs around carry-on checklists, packing lists and itinerary pages, and planner shops lead with the printed page ([carry-on checklist template](https://htmlcsstoimage.com/templates/details/carry-on-checklist.md), [travel pin templates](https://mayurik.gumroad.com/l/travelpintemplates), [Tailwind travel templates](https://www.tailwindapp.com/templates/pinterest-pins/travel)). Travel-binder bloggers sell paper backups on the grounds that "technology can fail when traveling" ([Savor and Savvy](https://savorandsavvy.com/travel-binder-printable/)).
- **Boarding-pass and ticket graphics already mean "trip".** Brands use them for trip reveals, giveaways and invitations. The label/value grid and the tear-off stub give a readable structure for a small amount of information ([Morphic](https://morphic.com/resources/how-to/design-a-boarding-pass-style-graphic), [Hongkiat](https://www.hongkiat.com/blog/boarding-pass-design/)).
- **Flight-delay advice is step-by-step.** The pages that rank for this topic are ordered steps: check status, queue and phone at once, ask for something specific, keep a record ([RACV](https://www.racv.com.au/royalauto/travel/travel-advice/what-to-do-if-flight-is-cancelled-or-delayed.html), [KAYAK](https://www.ca.kayak.com/news/what-to-do-flight-delayed/)).
- **Format rules from Pinterest:**
  - Use 2:3 (1000x1500).
  - Keep text short and readable on a phone, and make it say what the click gives you.
  - Put a subtle logo on every pin, never in the bottom-right corner, where Pinterest's icons sit.
  - Avoid script fonts and small text.
  - Sources: [Pinterest Business community: text overlays](https://community.pinterest.biz/t/designing-pins-text-overlays-dos-donts/661), [Pinterest Business community: product sellers](https://community.pinterest.biz/t/the-best-pin-formats-and-practices-for-product-sellers/1319), [SocialKit](https://socialk.it/en/blog/pin-design-best-practices).
- **New images count as fresh pins, and alt text helps.** Pinterest treats a new image as a fresh pin, and original creates earn most of the saves ([Tailwind](https://www.tailwindapp.com/pinterest-marketing/course/saves-vs-fresh-pins)). Tailwind also reports more outbound clicks on pins with alt text ([Tailwind 2025](https://www.tailwindapp.com/blog/pinterest-marketing-2025)). Re-drawing all 50 pins in new archetypes is therefore an opportunity, not a reset.
- **Context:** Pinterest Predicts 2026 points to adventure travel and highland destinations over tropical and city trips ([NBC News](https://www.nbcnews.com/select/shopping/pinterest-predicts-2026-trend-report-rcna248706)). We avoid destination imagery on purpose, so this only matters as a backdrop.

## The look

- **Setting:** the travel desk and the departure hall, seen from above or straight on.
- **Colour:**
  - The product's own teal (`#00626f`, strong `#00434d`, soft `#d9eef0`) is the "airline livery": passports, board frames, route lines and pins.
  - Travel materials supply the neutrals: kraft for tags and folders, warm white for passes and paper, and near-black teal with amber letters for the departure board.
  - One coral pop per pin, taken from the itinerary screenshot's time chips.
- **Mood:** calm competence, the feeling of having the reference ready before the desk asks. It is never frantic and never wanderlust.
- **Layout rules on every pin:**
  - Headline in the top fifth.
  - Sub line under the visual.
  - "Travel Companion" bottom-left, with the bottom-right corner left empty.
  - If a title reads "Keyword: phrase", the keyword can sit as a small eyebrow line above the rest. Both are the title's own words.
  - No price on the image, because the description already carries it.

## The seven archetypes

**1. Packing flat-lay.** An open suitcase or carry-on seen from above, with real items knolled on an even grid, each one labelled. This is the most-saved shape in travel Pinterest, and it reads like a checklist at thumbnail size. Every label comes from `STARTER_LISTS` in `packingLists.ts` or from the packing guides. For "by person", the case is split into a shared half and a personal half. Best for packing lists, carry-on, kids and baby, and the night-before bag.

**2. Luggage tags and key cards.** Three to eleven tags hang on strings from a handle or a passport strap, with one real item written on each tag. A short list becomes a travel object, and the number of tags is the payoff. For hotel topics the tags become key cards fanned beside a desk bell. Best for named options or short steps: the 11 trip kinds, the 7 kinds of to-do, what was lost, who is on a booking, and the hotel search order.

**3. Paper in hand.** This is the printable mockup. It shows the product's real printed outputs: the packing-list PDF with a ticked row struck through, My Trip Book with its real section tabs, the one-page trip card and the trip record. It also covers an index card or postcard that carries the Companion's authored wording, sometimes next to a phone with a nearly empty battery. This is how printables sell on Pinterest, and no competitor can show these exact pages. Best for printables, "keep it on paper", opening lines and "let somebody know".

**4. Passport and documents flat-lay.** An open travel folder with passports, envelopes and a wallet. Each document gets a kraft label with its real "whose / where kept" line, and the folder tabs carry the product's real document types. A passport reads as "international travel" instantly. For a lost item, one object is drawn as a dashed empty outline. Best for document checklists, where things are kept, losing something abroad, and the first-trip timeline.

**5. Departure board.** A dark split-flap board with four to nine real rows: the guide's timed steps, an itinerary with references, the nine Companion situations, place names with their time zones, or the Today sections. Delay advice is a sequence, and the board is where travellers first see a delay. The airport sign makes any ordered list read as travel. Best for flight-delay first steps, the one-page itinerary, multi-stop trips, time zones and "tomorrow, worth knowing".

**6. Boarding pass.** A single tall pass with a tear-off stub, a stack of passes, or the back of a pass covered in pen notes. Labels and values are always real: playbook prompts and choices, the trip card's own labels, the guide's booking table. There are never invented flight numbers, gates or seats. Best for the five flight-problem choices, notes for the desk, who booked what, the trip card, and one-way trips.

**7. Route map.** A dotted route between location pins on a plain map. Each pin carries a booking card, and arrows show what each booking is built on. This makes the product's one unique idea, what else moves when one thing moves, visible at a glance. The road-trip version uses a winding road and night stops. Best for multi-stop trips, "flight moved, what else", time zones, who to tell, road-trip days, and Today.

## Pins by archetype

No two pins next to each other in either account's schedule share an archetype.

| Account | Pin | Headline (unchanged) | Archetype | What it shows (real source) |
|---|---|---|---|---|
| Draftpace | 3.1 | Packing List for a Week Away, by Person | Packing flat-lay | Shared vs personal items (week-away guide) |
| Draftpace | 3.2 | Start a Packing List From the Kind of Trip | Luggage tags | The 11 starter list names (`STARTER_LISTS`) |
| Draftpace | 3.3 | A Carry-On Only Packing List | Packing flat-lay | "What stays in reach" (carry-on guide) |
| Draftpace | 3.4 | A Printable Packing List, One Section Per Person | Paper in hand | Packing PDF: Everyone, then each traveller |
| Draftpace | 3.5 | Packing List: A Starting Point, Not a Rulebook | Packing flat-lay | "The basics" in four groups |
| Draftpace | 4.1 | Travel Document Checklist: What to Carry and Where to Keep It | Documents flat-lay | Four people, one folder (documents guide) |
| Draftpace | 4.2 | Travel Document Checklist: Dates Worth a Look Before You Go | Departure board | 6 months / 3 months / 1 month / night before |
| Draftpace | 4.3 | Travel Documents Organizer: A Photo of a Passport Is Not a Backup Plan | Luggage tags | what it is / whose it is / where it is kept |
| Draftpace | 4.4 | Travel Document Checklist: Where It Is Kept, Not the File | Documents flat-lay | Real document registry screenshot + types |
| Draftpace | 4.5 | Travel Organization: Your Phone Is a Single Point of Failure | Paper in hand | The one printed page vs a dead phone |
| Draftpace | 5.1 | Your Flight Is Delayed and You Have a Connection: What to Do First | Departure board | "What to do, in order" timeline |
| Draftpace | 5.2 | Travel Problems: What Has Happened? Five Choices | Boarding pass | The five flight-problem choices on the stub |
| Draftpace | 5.3 | The Hotel Cannot Find Your Reservation: What to Say | Luggage tags (key cards) | Ways to ask them to search, in order |
| Draftpace | 5.4 | Holiday Travel Tips: Your Opening Line, Ready to Use or Replace | Paper in hand | Authored opening line on an index card |
| Draftpace | 5.5 | Flight Delay Tips: Get the Name of Who You Spoke To | Boarding pass | Pen notes on the back of a pass |
| Draftpace | 6.1 | Lost Your Passport, Wallet or Phone Abroad: What to Have Ready | Documents flat-lay | Passport, wallet, phone, one missing |
| Draftpace | 6.2 | International Travel Checklist: What Has Been Lost or Stolen? | Luggage tags | The six lost-or-stolen choices |
| Draftpace | 6.3 | Travel Checklist: Who to Tell First When Something Goes Missing | Route map | With you / waiting for you / at home |
| Draftpace | 6.4 | International Travel Checklist: Let Somebody Know, in Your Own Words | Paper in hand | Postcard with the authored message |
| Draftpace | 6.5 | Road Trip Checklist: You Choose the Words | Departure board | What to do first, by what you lost |
| Draftpace | 7.1 | How to Plan a Group Trip Without Becoming the Organizer | Boarding pass | Four passes, each "Booked by" someone |
| Draftpace | 7.2 | Family Vacation Planning: Who Is on This Booking? | Luggage tags | Name tags tied to a real booking card |
| Draftpace | 7.3 | Packing and Planning for a Trip With Kids or a Baby | Packing flat-lay | Three bags by age (kids guide) |
| Draftpace | 7.4 | Group Trip Planning: A Packing List That Adds Items for Each Child | Paper in hand | "Children" and "A baby" lists |
| Draftpace | 7.5 | Group Trip Planning: One Place Everybody Can Ask For | Departure board | Who's on each booking |
| Draftpace | 8.1 | Trip Itinerary: Many Stops, One Page | Route map | Lisbon → Porto → Madrid with "built on" |
| Draftpace | 8.2 | Add a Destination and Its Time Zone | Departure board | Places + IANA zones, world clocks |
| Draftpace | 8.3 | First International Trip Checklist | Documents flat-lay | Passport with six dated tabs |
| Draftpace | 8.4 | Travel Itinerary Planner: Today Shows Where You Are | Route map | "You are here" + real Today screen |
| Draftpace | 8.5 | First International Trip: Check Each Rule at the Source | Luggage tags | Three ways a first trip goes wrong |
| Draftpace | 9.1 | Travel Planner Printable: What to Keep on Paper When You Travel | Paper in hand | The guide's filled-in example page |
| Draftpace | 9.2 | Travel Planner: A One-Page Trip Card | Boarding pass | Who is going / Where / Getting there / Staying |
| Draftpace | 9.3 | Printable Itinerary: Print the Itinerary, Keep the Reference Beside It | Departure board | Time / place / reference rows |
| Draftpace | 9.4 | A Blank Travel Planner for When a Screen Is the Wrong Tool | Paper in hand | My Trip Book with real section tabs |
| Draftpace | 9.5 | Travel Planner Printable: Print What You Need | Luggage tags | The six lines worth printing |
| Draftpace | 10.1 | Road Trip Checklist: The Night-Before List | Paper in hand | Clipboard + sticky note by the door |
| Draftpace | 10.2 | Travel Checklist: Tomorrow, Worth Knowing | Departure board | Today / Tomorrow, worth knowing / Waiting |
| Draftpace | 10.3 | Road Trip Planning Checklist | Route map | Three driving days on a road |
| Draftpace | 10.4 | International Travel Checklist: Seven Kinds of To-Do Before You Go | Luggage tags | The seven preparation kinds |
| Draftpace | 10.5 | Travel Checklist: Short on Purpose | Packing flat-lay | Seven items in the bag you carry |
| Maple | 01 | Flight moved? See everything else it affects | Route map | Shuttle → check-in → dinner chain |
| Maple | 02 | Confirmation numbers in six different inboxes? | Documents flat-lay | Envelopes with real references |
| Maple | 03 | Group trip planning for the friend who plans everything | Luggage tags | One tag per bag |
| Maple | 04 | POV: phone at 4% in a taxi and the whole plan is on it | Paper in hand | Low-battery phone + My Trip Book |
| Maple | 05 | Multi-stop trip, zero spreadsheets | Departure board | Multi-stop rows with references |
| Maple | 06 | Crossing time zones? Today means today where you are | Route map | New York → Lisbon arc, two clocks |
| Maple | 07 | Haven't booked your flight home yet? | Boarding pass | Return stub as a dashed placeholder |
| Maple | 08 | When travel goes sideways, you're not winging it | Departure board | The nine Companion situations |
| Maple | 09 | POV: you're the one everybody asks what time we leave | Boarding pass | Family passes + real Today screen |
| Maple | 10 | Remember what you learned the last time you went | Paper in hand | Printed trip record |

## Things to watch

- **Example data.** Names and references such as Sam, Mia, Rivera, EX7KQ2 and Lisbon/Porto come from the demo trip in the real screenshots. Dana, Priya, K7QD2M and Hotel Aurora come from the guides' worked examples. They are real content of those sources, but they are examples, not customer data.
- **Shortened lines.** Long guide items are cut to their first clause, always in the source's own words.
- **Price.** The descriptions say "$34 once", which matches the listing's `price` field. A stale code comment in the listing still mentions $18. Keep the price off the images.
- **Page count.** Pin 9.4's description says "roughly 70 pages". This was not verified here, so it stays off the image.
