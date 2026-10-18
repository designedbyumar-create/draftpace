# Vehicle Maintenance Companion: Pinterest visual strategy

The current pins all use one template: a serif headline, generic flat icons (a car, a wrench, a calendar) and a product card. That is why they look like every other product's pins. This plan replaces the template with seven pin types drawn from the car owner's own world: the odometer, the glove box, the clipboard at the shop counter, the log on the passenger seat, the licence plate, the frosted windscreen and the open trunk. Every word on a pin comes from the pin's own CSV row or Maple entry, the listing, a guide, or the product's code. The machine-readable plan, with the source of each item, is in `vehicle-maintenance-companion.json`.

## Who pins this

- New drivers, and parents setting up a teen's first car.
- People who just bought or inherited a used car with no service records.
- Two-car households that cannot say which car needs what.
- People who dread the shop counter and have been charged for work they did not ask for.
- Owners who tow, drive short trips, or deal with dust, heat or cold.
- Sellers who want to show the car was looked after.
- Whoever in the house does the winter prep.

## What wins on Pinterest in this niche

1. **Saves go to information people want to keep.** Checklists, step lists and infographics are the formats that get saved. One agency A/B test reported 35% more saves for infographic pins and no change in clicks. That is a single uncontrolled test, so treat it as a hint, not proof. ([Laura Rike case study](https://blog.laurarike.com/infographics-increased-pinterest-saves/), [Venngage, infographic formulas](https://venngage.com/blog/6-formulas-for-the-perfect-pinterest-infographic/), [Tailwind, pin design tips](https://www.tailwindapp.com/blog/pinterest-pin-design-tips))
2. **The car niche's own shapes.** Car infographic boards are built around a few recurring formats:
   - labelled car or engine-bay diagrams with numbered callouts
   - maintenance-by-mileage charts (the "30-60-90" pattern)
   - "what to keep in your car" lists, often pinned by parents for a teen's first car ("Car Essentials For New Drivers", "First Car Checklist")

   ([Pinterest ideas: diagram of under the hood](https://www.pinterest.com/ideas/diagram-of-under-the-hood-of-a-car/940739067333/), [Car Infographics board](https://www.pinterest.com/youramazingcar/car-infographics/), [Buy Auto Parts car infographics board](https://www.pinterest.com/buyautoparts/car-infographics/), [Visual guide to car maintenance pin](https://www.pinterest.com/pin/a-visual-guide-to-car-maintenance-infographic-cars-transportation--2251868546579250/), [Pinterest ideas: must haves in your car](https://www.pinterest.com/ideas/must-haves-in-your-car/925675481062/), [carVertical on 30-60-90](https://www.carvertical.com/en/blog/car-maintenance-schedule), [ConsumerAffairs checklist by mileage](https://www.consumeraffairs.com/automotive/car-maintenance-checklist-by-mileage.html), [Regit maintenance basics infographic](https://www.regit.cars/car-advice/maintaining-your-car/infographic-car-maintenance-basics))
3. **Printable log and binder mockups dominate "car maintenance log".** These show a ruled page with date, mileage, service and cost columns, a binder, or a paperwork kit. Some sellers make cute or pink versions. ([Etsy: car maintenance log printable](https://www.etsy.com/market/car_maintenance_log_printable), [Etsy: car paperwork organizer](https://www.etsy.com/market/car_paperwork_organizer), [Nifty Mom vehicle binder](https://niftymom.com/2015/02/vehicle-records-binder-organization-free-printables/), [vehicle documents binder pin](https://www.pinterest.com/pin/for-the-home--72831718952507148/))
4. **Winter kit checklists are a seasonal staple.** ([GEICO vehicle safety kit](https://www.geico.com/information/safety/auto/vehicle-safety-kit/))
5. **The audience leans warm and personal.** Pinterest data cited by AOL: "cozy car interior" searches up 55%, "girly car accessories" up 140%. This supports a warm palette over chrome-and-red garage graphics. ([AOL](https://www.aol.com/decorating-cars-interior-heres-cute-141600830.html))
6. **Mechanics of a pin that works:**
   - **Size:** 2:3 at 1000x1500 ([Marpipe](https://www.marpipe.com/ad-glossary/2-3-aspect-ratio-pinterest)).
   - **Overlay text:**
     - Short, high-contrast and readable on a phone. Avoid too much text, small type and script fonts ([Pinterest community: text overlays](https://community.pinterest.biz/t/designing-pins-text-overlays-dos-donts/661)).
     - Aim for about 3 to 7 words in the headline. Pinterest's ad spec allows at most 10 words of overlay ([Pinterest ad specs](https://help.pinterest.com/en/business/article/pinterest-product-specs), [PinBoostr](https://pinboostr.com/pinterest-pin-design-tips-create-pins-that-get-clicked/)).
   - **Lower-right corner:** keep it empty, because Pinterest's own icons cover it ([Pinterest community: formats for product sellers](https://community.pinterest.biz/t/the-best-pin-formats-and-practices-for-product-sellers/1319)).

**How the research shapes the plan.** Keep the headline short, so long CSV titles go on the pin as a shorter cut that keeps the title's own words. Let the body of the pin carry a real list worth saving. Draw objects people recognise at thumbnail size. One thing the niche loves that we will not use: dashboard warning-light charts. The product reads nothing from the car, so no pin shows a lit warning lamp, an OBD plug or a car-to-phone signal.

**Limits of this research.** The sandbox could not open Pinterest, Tailwind or the case-study pages directly; the network proxy refused them. The findings above come from search-result summaries of those pages. No source gave per-pin save or click numbers for car pins, and Pinterest Predicts 2026 has no car-maintenance trend.

## Look and feel

- **Accent:** the product's own burnt amber (#b45309), the colour of an amber dash lamp and a manila shop tag.
- **Supporting colours:** the printables' warm paper and ink, and graphite for tyres, road and dashboard. Winter pins add only a pale frost.
- **Type:** headlines in a sturdy heavy sans, not the serif. Every number, date and field label in the monospace the app already uses for mileage.
- **Mood:** calm workshop, in writing. No alarm red and no "your car is in danger".
- **Cars:** always generic, with no badge and no real model.

## The seven pin types

**1. The page at the shop counter** (`service-boundary-ticket`). A clipboard tilted on a counter holding the Service Boundary page, keys with a manila repair tag beside it, and the car up on a two-post lift in the bay behind. It is the moment people dread, shown as a printable they can hold. The page carries only the real printed strings, for example "Anything not listed above is not authorized." and "please call me before any further work begins". Product pins add the real Print screen.

**2. The log page on the passenger seat** (`printed-page`). A ruled page seen from above, slightly rotated, with a pen across it: a spiral log, the Service record printout, the glove box card, the "From your manual" table, or a paperwork tracker. This is the printable mockup the "car maintenance log" search expects. Column names come from the real printables. Rows come from the demo data in the real screenshots, or from the guides' example tables, marked "example" on the pin.

**3. The odometer and the road ahead** (`odometer-and-road`). An instrument cluster across the top, its odometer the focal point. A road winds down the pin with mile-marker posts, one timeline step on each. This turns the mileage chart, the first week with a car, and paperwork lead times into a journey. Typical mileages appear only where the mileage guide gives them, always captioned "typical" and "your manual wins".

**4. The glove box, opened and labelled** (`glove-box-open`). The hatch drops open under a band of dashboard, its contents fanned out with thin leader lines to their names: registration, insurance card, owner's manual, roadside card, tyre gauge, pen. A small kitchen drawer underneath holds what stays at home. This is the "what to keep in your car" flat-lay, drawn flat so every item reads at thumbnail size.

**5. The car, with numbered callouts** (`car-callouts`). A big generic car with numbered accent circles on its parts and labels below, the niche's labelled-diagram infographic. Each topic gets its own variant:

- frosted, with the boot open on the winter kit
- up on the lift
- towing a trailer through dust
- a wordless sign in the window for a sale
- the driver's door open for day one with a first car

**6. Side by side** (`side-by-side`). Two (or up to four) things split down the middle, answering "which one?" at a glance:

- the sedan and the van from the guide's example
- odometer versus calendar ("whichever comes first")
- "Have a look at it" versus a specific request, on two manila key tags
- glove box versus kitchen drawer
- the four starter lists as four key tags on one ring

**7. Headline on a licence plate** (`plate-strip`). The headline is embossed on a big plate. Under it sits a strip of small plates with the product's real lamps: filled dot for due, ring for close, empty ring for clear. Plates carry only vehicle labels ("Family car", "Commuter", from the real screenshots) or the headline, never a realistic registration number.

## Pins and their type

Neighbouring pins never share a type.

| Account | Pin | On-pin headline | Type |
|---|---|---|---|
| Draftpace | vehicle/pin-2.1 | What to Tell a Mechanic Before the Work Starts | car-callouts (on the lift) |
| Draftpace | vehicle/pin-2.2 | A Page to Hand the Shop Before They Touch the Car | service-boundary-ticket |
| Draftpace | vehicle/pin-2.3 | Call Me Before Any Further Work | side-by-side (two key tags) |
| Draftpace | vehicle/pin-2.4 | The Most You Will Agree to Without a Call | service-boundary-ticket |
| Draftpace | vehicle/pin-2.5 | Anything Else Needs a Call First | car-callouts (on the lift) |
| Draftpace | vehicle/pin-3.1 | You Bought a Used Car With No Service Records | odometer-and-road |
| Draftpace | vehicle/pin-3.2 | Nothing Is Assumed Overdue | printed-page |
| Draftpace | vehicle/pin-3.3 | The First Week With a Used Car | car-callouts |
| Draftpace | vehicle/pin-3.4 | Do You Know This Vehicle's History? | side-by-side |
| Draftpace | vehicle/pin-3.5 | Nothing Is Assumed | plate-strip |
| Draftpace | vehicle/pin-4.1 | Car Maintenance Log: What to Write Down | printed-page |
| Draftpace | vehicle/pin-4.2 | Every Service, Newest First, by Year | odometer-and-road |
| Draftpace | vehicle/pin-4.3 | Selling Your Car? Bring the Service History | car-callouts (for sale) |
| Draftpace | vehicle/pin-4.4 | A Service Record You Can Hand to a Buyer | printed-page |
| Draftpace | vehicle/pin-4.5 | A Record You Can Hand Over | glove-box-open |
| Draftpace | vehicle/pin-5.1 | Car Maintenance by Mileage | odometer-and-road |
| Draftpace | vehicle/pin-5.2 | Type Your Manual's Intervals Once | printed-page |
| Draftpace | vehicle/pin-5.3 | Miles, Months, or Both | side-by-side |
| Draftpace | vehicle/pin-5.4 | Severe Duty Halves the Interval, With One Tap | car-callouts (towing) |
| Draftpace | vehicle/pin-5.5 | Your Manual First | glove-box-open |
| Draftpace | vehicle/pin-6.1 | Winter Car Prep Checklist | car-callouts (frost, kit) |
| Draftpace | vehicle/pin-6.2 | Four Starter Lists | side-by-side (four key tags) |
| Draftpace | vehicle/pin-6.3 | Three Things the Cold Is Hard On | car-callouts (close-up) |
| Draftpace | vehicle/pin-6.4 | Usual Jobs in One Tap | odometer-and-road |
| Draftpace | vehicle/pin-6.5 | Cold Is Hard on Batteries, Tires and Wipers | printed-page |
| Draftpace | vehicle/pin-7.1 | Two Cars, One Household | side-by-side |
| Draftpace | vehicle/pin-7.2 | Every Car on One Strip | plate-strip |
| Draftpace | vehicle/pin-7.3 | Which Car Needs What | printed-page |
| Draftpace | vehicle/pin-7.4 | Add a Vehicle in One Short Screen | plate-strip |
| Draftpace | vehicle/pin-7.5 | One Strip for Every Car You Own | side-by-side |
| Draftpace | vehicle/pin-8.1 | What to Keep in Your Glove Box | glove-box-open |
| Draftpace | vehicle/pin-8.2 | A Glove Box Card You Print Yourself | printed-page |
| Draftpace | vehicle/pin-8.3 | Three Papers Worth Having in the Car | side-by-side |
| Draftpace | vehicle/pin-8.4 | Glove Box Details, Typed by You | plate-strip |
| Draftpace | vehicle/pin-8.5 | Glove Box Organization: Keep It Short | glove-box-open |
| Draftpace | vehicle/pin-9.1 | Car Paperwork Dates: Registration, Insurance, Inspection | car-callouts |
| Draftpace | vehicle/pin-9.2 | A Date and Where the Paper Is | glove-box-open |
| Draftpace | vehicle/pin-9.3 | What to Write Next to Each Date | printed-page |
| Draftpace | vehicle/pin-9.4 | Paperwork Dates Show Up on Due | odometer-and-road (days) |
| Draftpace | vehicle/pin-9.5 | Where Is the Paper? | side-by-side |
| Draftpace | vehicle/pin-10.1 | First Car Checklist for New Drivers | car-callouts (door open) |
| Draftpace | vehicle/pin-10.2 | Log a Service: Date, Miles, What Was Done | printed-page |
| Draftpace | vehicle/pin-10.3 | Week One With Your First Car | odometer-and-road |
| Draftpace | vehicle/pin-10.4 | Reminders You Switch On Yourself | side-by-side |
| Draftpace | vehicle/pin-10.5 | Start the Record Today | printed-page |
| Maple | Pin-mm-vehicle-maintenance-companion-01 | Write down the interval the mechanic quoted. Once. | odometer-and-road (windscreen sticker) |
| Maple | Pin-mm-vehicle-maintenance-companion-02 | "While we had it up on the lift..." | service-boundary-ticket |
| Maple | Pin-mm-vehicle-maintenance-companion-03 | Bought a used car with no service history? | side-by-side |
| Maple | Pin-mm-vehicle-maintenance-companion-04 | POV: the shop asks your mileage at the last oil change | printed-page |
| Maple | Pin-mm-vehicle-maintenance-companion-05 | Selling your car? Show it was looked after | car-callouts |
| Maple | Pin-mm-vehicle-maintenance-companion-06 | A car app that doesn't cry wolf | plate-strip |
| Maple | Pin-mm-vehicle-maintenance-companion-07 | Towing, short trips, heat or dust? | car-callouts (towing) |
| Maple | Pin-mm-vehicle-maintenance-companion-08 | Car care for people who don't speak mechanic | printed-page |
| Maple | Pin-mm-vehicle-maintenance-companion-09 | POV: the dealer says it's due. Your manual says it isn't. | side-by-side |
| Maple | Pin-mm-vehicle-maintenance-companion-10 | Everything about your car, in one tidy place | glove-box-open |

## Watch-outs

- **No screenshot of the Due screen.** `creative/public/screens/` has only the Vehicles, History and Print screens. The plate strip, its lamps and "Nothing is due right now." are drawn from `DueScreen.tsx` and the two-cars guide, not from a capture. A real Due capture would let 7.2, 7.5 and Maple 06 show the screen itself.
- **Numbers are examples or demo data.** Every mileage and date on a pin is either the demo account visible in the real screenshots or a guide's own example table, which the guides label as made up. Pins that use a guide example print a small "example" label. Typical intervals appear only on 5.1, captioned "typical".
- **Names in guide examples.** Brand-like names in the guide examples ("Civic", "Kwik Brakes") are left off the pins.
- **Stale price comment.** The listing file's header comment still says "$18 launch price, $23 regular". The actual price fields are $34 (list $69), which matches the CSV descriptions. The pins follow the price fields.
