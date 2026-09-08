import type { ShopProductInput } from "../definition";

/**
 * Travel Companion's real public Shop listing, same "creating this file
 * is the release gate" pattern as its five siblings.
 *
 * WHAT THE LISTING IS ALLOWED TO CLAIM
 *
 * The five locked Phase 0 boundaries in the product's own definition.ts
 * are load-bearing here, not background reading. This listing must never
 * imply any of the following, because none of them exist:
 *
 *   1. File storage. Documents are a registry (what exists, where it is
 *      kept), never an upload. The listing says so outright rather than
 *      leaving a buyer to assume a passport scan goes in.
 *   2. Money. Nothing computes an amount, a currency, a balance, or a
 *      split. There is no expense splitting in this product.
 *   3. A general dependency graph. A booking depends on at most one
 *      upstream booking, deliberately, and the change-impact walk is
 *      built on exactly that.
 *   4. Live flight status, prices, or availability. There is no external
 *      data source anywhere in this product; every line it shows traces
 *      to something the traveller recorded.
 *   5. More than eight Companion situations.
 *
 * NOT CLAIMED, BECAUSE NOT BUILT: notifications of any kind. The
 * product's own definition declares notifications: { supported: false }.
 * A travel product that implied it would alert somebody to a flight
 * change would be selling the single most valuable thing it does not do.
 *
 * $18 launch price, $23 regular. The fourth of the seven paid products
 * to get a real price, see the pricing plan's Phase 4. GetAction still
 * renders "Checkout opens soon": unlike its five siblings, this product
 * has no entry at all yet in CHECKOUT_URL_ENV_BY_SLUG
 * (src/shop/lemonSqueezyCheckout.ts), so there is no
 * LEMON_SQUEEZY_TRAVEL_CHECKOUT_URL to set until one is added. Noted
 * here rather than added, since wiring Lemon Squeezy is out of scope for
 * this pricing plan.
 */
export const travelCompanionShopProduct: ShopProductInput = {
  id: "travel-companion",
  slug: "travel-companion",
  publicationStatus: "published",
  title: "Travel Companion",
  promise:
    "Everything your trip depends on, in one place, and the one thing most travel tools miss: what else moves when one thing moves. Record a change to a flight and it shows you the transfer, the check-in and the reservation that were built on it, one at a time.",
  problem:
    "A trip is easy to plan and hard to run. The planning happens once, weeks ahead, with time to think. The running happens in an airport at 6am when the flight has moved three hours and you are trying to remember, from memory, what else you booked around the old time. Confirmation numbers are in six different inboxes, the transfer company's number is in a screenshot, and the only thing holding the shape of the trip together is your own head, which is the thing least available at exactly that moment.",
  audience: [
    "You are travelling with other people, and you are the one everybody asks what happens next.",
    "Your trip has more than three moving parts: flights, transfers, stays and reservations that were booked around each other.",
    "You have had a delay cascade before, where the flight moving was the small problem and everything booked after it was the real one.",
    "You are travelling with children, or with somebody whose documents and requirements you are also responsible for.",
    "You want a paper copy you can hold when your phone is at four percent in a taxi.",
  ],
  audienceExclusions: [
    "You want it to store your actual documents. It does not accept uploads and never will. It records that a passport exists, whose it is, and where it is kept, never the document itself.",
    "You want it to split costs or track what anyone owes. There is no amount, currency, or balance anywhere in this product, on purpose. That is a different product's job.",
    "You want live flight status, prices, or availability. It has no connection to any airline, aggregator, or booking site. Everything it shows is something you recorded.",
    "You want it to plan the trip for you or suggest what to do. It has no opinion about your itinerary and no model involved anywhere in it.",
    "You want push notifications when something changes. It does not send them yet, and does not pretend to.",
  ],
  // Emptied by the content collapse: four of these five were answered a
  // second time in faqs, and the Shop page rendered both a few hundred
  // pixels apart. All of them now live in `questions`, answered once
  // each and tagged with the moment they matter.
  objections: [],
  // Emptied by the content collapse: four of these seven restated a
  // problemsSolved solution nearly word for word. The three that said
  // something new are now paired with the problem they answer.
  outcomes: [],
  problemsSolved: [
    {
      problem: "Confirmation numbers live in six different inboxes and a screenshot.",
      solution: "One place that holds what you booked, who it's for, and what it depends on.",
    },
    {
      problem: "When a flight moves, you're trying to remember from memory what else was booked around the old time.",
      solution: "An immediate answer to what else a change touches, walked one booking at a time.",
    },
    {
      problem: "Your phone is at four percent in a taxi, and that's the only copy of the plan.",
      solution: "A printed book you can carry, so the trip doesn't depend on one device staying charged.",
    },
    {
      problem: "You can't tell what's actually happening today versus what's just noise.",
      solution:
        "Today's operational state on one screen, and on the days a trip needs nothing from you, an honest quiet screen rather than a list filling the space anyway.",
    },
    {
      problem: "A booking crosses a time zone and you can't work out whether it's still today.",
      solution:
        "Each place carries its real timezone, worked out from what you named it, so today means today where you actually are and daylight saving cannot quietly shift it.",
    },
    {
      problem: "Somebody at a desk asks for the confirmation number and it's in one of six inboxes.",
      solution: "The reference and the provider readable in three seconds, without opening an email client.",
    },
    {
      problem: "You come back to the same place a year later and have forgotten everything you learned.",
      solution: "A dated record of what happened, and what's worth knowing before the next trip to the same place.",
    },
  ],
  howItWorks: [
    "Set up a trip with a name and rough dates. That is the whole of the setup, and nothing is gated behind finishing it.",
    "Add what it is made of as you book it: destinations, travellers, flights, transfers, stays and reservations, each with its own provider and reference.",
    "For anything booked around something else, say so once with a 'this depends on' picker. Nothing is ever inferred from timing or place, because two things on the same day are not necessarily connected.",
    "Today shows the current state, derived fresh from what you recorded: what is happening now, what is worth knowing about, and what you are waiting on.",
    "When something moves, record the change. It walks down what depends on it and shows every affected booking as potentially affected, never edited for you, so you decide what actually needs doing.",
    "For each one, the Companion walks you through it: eight authored situations covering booking, flight, hotel and transport problems, plus the general ones for reorganising and letting people know.",
    "Name a destination and it works out that place's real timezone from a small offline table, so today means today where you are. Unrecognised places are said to be undetected rather than guessed at, and you can set one by hand from the same table.",
    "Waiting to hear back becomes a real open thread, shown on Today until it is resolved, then filed into the record with the line it closed on.",
    "Print My Trip Book whenever you want a paper copy, blank and structured, as long or short as your trip needs.",
  ],
  access: "paid",
  // Launch pricing, Phase 4 of the pricing plan: $19 actual, marked up
  // 20% to a $23 regular price, then a net 20% off (30% off, netted
  // down by 10 points) for the $18 this actually charges today.
  // Priced as a lifetime licence at a standing 50% off the list price.
  // The list price is what the product is worth to somebody who needs it;
  // the discount is the launch position, not a countdown. These two
  // numbers must match the Lemon Squeezy variant exactly, or a customer
  // reads one figure and is charged another.
  price: { amount: 34, currency: "USD" },
  compareAtPrice: { amount: 69, currency: "USD" },
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "Today: the current operational state of the trip, derived fresh from what you recorded, never a manual task list",
    "Trip: destinations, bookings, documents and preparation, with a Trip Brief summarising the whole thing at a glance",
    "Booking connections: say once what a booking depends on, and the product remembers the shape of your trip for you",
    "The change-impact walk: record a change and see exactly what was built on top of it, handled one booking at a time",
    "The Companion: eight authored situations for when something goes wrong, including flight, hotel, transport and booking problems",
    "Open threads: anything you are waiting to hear back on, surfaced while it matters and filed when it is resolved",
    "Real timezones per place, from an offline lookup with a searchable manual override, so a booking across a date line is never wrongly called today",
    "People: who is travelling, their requirements, and the documents that belong to them",
    "A document registry: what exists and where it is kept, never a file, never an upload",
    "Record: what happened, dated, and what is worth knowing next time you go to the same place",
    "My Trip Book: a blank, structured, printable planner covering every part of the trip, included",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "A trip name and rough dates",
    "Bookings as you make them: what, when, who with, and the confirmation reference",
    "Which booking depends on which, said once, by you",
    "Who is travelling, and anything they need",
    "A change, when something moves",
  ],
  expectedOutputs: [
    "Today's state of the trip, in plain sentences that each trace to something you recorded",
    "What else is affected when one thing changes, listed and never auto-edited",
    "A worked-through version of a hard call with an airline, hotel or transport company",
    "A dated record of what happened, and lessons carried forward to the next trip",
    "A printable trip book, as long as your trip needs and no longer",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so a trip you set up on a laptop is there on your phone at the airport. Nothing is ever deleted: a cancelled booking or a corrected entry is archived rather than removed, and the record of what happened is never edited after the fact.",
  privacyNotes:
    "Your trip is private to your account. Draftpace does not sell your data or use it for advertising, and nothing here is read by an AI model: there is no model provider anywhere in this product. It stores no files at all, which means no passport scan, no visa PDF, and no boarding pass image can be uploaded to it even by accident. It holds no amount, currency, or balance, so it never becomes a record of what a trip cost. Suggested wording for a difficult call stays in your browser and is never saved, even after you use it.",
  faqs: [],

  /**
   * Every worry, asked once, tagged with the moment it matters. Five
   * objections and eight faqs collapsed to nine questions: "not going to
   * trust an app with your passport details" and "can I store my
   * passport or tickets in it" were the same question twice, as were the
   * itinerary-planner pair and the printed-book pair.
   */
  questions: [
    {
      question: "Already have everything in your email and a notes app?",
      answer:
        "Most people do, and it works right up until something moves. Email holds each booking on its own, with no idea the transfer was booked around the flight. This holds the connection, so when one changes you are shown what was built on top of it instead of reconstructing it at a gate.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this another itinerary planner?",
      answer:
        "A planner is about deciding what your trip will be. This is about running the trip once it exists and starts changing. It never suggests a destination, never fills a day for you, has no opinion about your itinerary, and every blank stays blank until you write in it.",
      stage: ["deciding"],
    },
    {
      question: "Can I store my passport or my tickets in it?",
      answer:
        "No, and that is deliberate rather than a gap waiting to be filled. It cannot store a file at all: there is no upload anywhere in it. It records that a document exists, whose it is, and where it is kept, a photo on your phone or printed in the front pocket, which is what you actually need when somebody asks where it is.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it track flight status or tell me my flight is delayed?",
      answer:
        "No. It has no connection to any airline or booking system, and it sends no notifications of any kind. Everything it shows is something you recorded. What it does is more useful once you already know: tell you what else that delay touches.",
      stage: ["deciding", "owning"],
    },
    {
      question: "What actually happens when a flight moves?",
      answer:
        "You record the new time on that booking. It walks down everything you said was booked around it, the transfer, the check-in, the reservation that evening, and shows each as potentially affected with its current time. It changes nothing for you. You go through them one at a time, with the Companion on any that need a phone call.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it get time zones right when I cross one?",
      answer:
        "It works the place's real timezone out from what you named it, using a small offline table of major cities and airports, so what counts as today is today where you are and daylight saving cannot quietly shift it. An unrecognised place says so rather than guessing, and you can set one by hand. There is no raw UTC offset anywhere, because an offset goes wrong twice a year.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Can it split costs between the people I am travelling with?",
      answer:
        "No. There is no amount, currency or balance column anywhere in it, on purpose. A thread can say somebody still owes their share in your own words, but nothing here calculates it. Adding that would make this a worse version of a product we already sell.",
      stage: ["deciding", "owning"],
    },
    {
      question: "What happens when my phone dies?",
      answer:
        "My Trip Book is included: a blank, structured planner you print and fill in by hand, covering the trip overview, destinations, travellers, bookings, transport, accommodation, documents, open threads and daily pages, plus the connection and change-impact pages that are this product's own way of thinking. It is modular, so three destinations print three destination pages. Paper needs no signal, battery or login.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this a one-time purchase, and do I need an account?",
      answer:
        "One time, and yes. The account is what keeps your trip private and there on your phone at the airport after you set it up on a laptop.",
      stage: ["deciding"],
    },
  ],

  /**
   * How people describe this before they know a product like this exists.
   * Sourced, not invented: the luggage-compensation question already
   * answered in src/content/askdp.ts and the titles of the travel guides
   * written from the same research.
   */
  searchedProblems: [
    {
      phrase: "My flight changed and I don't know what else is affected",
      answer:
        "Record the change and it walks down everything you said was booked around it, one booking at a time, editing nothing for you.",
    },
    {
      phrase: "My flight is delayed and I have a connection",
      answer:
        "The connection, the transfer and whatever was booked after them are shown as potentially affected, with a walked-through call for any that need one.",
    },
    {
      phrase: "How do I organise a multi-stop trip without a spreadsheet",
      answer:
        "Destinations, bookings, travellers and documents in one place, with the shape of the trip held for you rather than in your head.",
    },
    {
      phrase: "The hotel cannot find my reservation",
      answer:
        "The provider and the confirmation reference are readable in three seconds, and there is an authored walkthrough for the conversation that follows.",
    },
    {
      phrase: "I'm the one everybody asks what happens next",
      answer:
        "Today shows the current state of the trip in plain sentences, each tracing to something somebody recorded, so the answer is not in your head alone.",
    },
    {
      phrase: "What should I keep on paper when I travel",
      answer:
        "My Trip Book prints exactly that: the whole trip, structured, as long as your trip needs and no longer.",
    },
  ],

  /**
   * What an owner opens the manual to do, each row linking to the screen
   * it happens on.
   */
  tasks: [
    {
      label: "Find out what's happening today",
      answer: "Today is derived fresh from what you recorded: what is happening, what is coming, what you are waiting on.",
      destination: "workspace",
    },
    {
      label: "Add a booking",
      answer: "What, when, who with, the provider and the reference. Trip holds them all with a brief over the whole thing.",
      destination: "trip",
    },
    {
      label: "Say one booking depends on another",
      answer: "Set it once with the depends-on picker. Nothing is ever inferred from timing or place.",
      destination: "trip",
    },
    {
      label: "Deal with something that just changed",
      answer: "Record the change. It lists everything built on top of it as potentially affected, and changes none of it for you.",
      destination: "workspace",
    },
    {
      label: "Fix a place whose timezone was not detected",
      answer: "Search the same table and set it by hand. There is no raw offset to get wrong.",
      destination: "trip",
    },
    {
      label: "Print the trip to carry",
      answer: "My Trip Book, blank and structured, as long as your trip needs. Paper needs no battery.",
      destination: "printables",
    },
    {
      label: "Write down what's worth knowing next time",
      answer: "Record keeps what happened, dated, and what you would want to know before going back to the same place.",
      destination: "record",
    },
  ],

  relatedGuideSlugs: [],
  relatedProductSlugs: ["personal-life-affairs-companion", "alongside"],
  needGroups: ["planning-something-important", "keeping-something-moving"],
  seo: {
    title: "Travel Companion: know what else moves when one thing moves",
    description:
      "Hold everything your trip depends on in one place, and see exactly what is affected when a flight, transfer or stay changes. Includes a printable trip book. No uploads, no costs tracked, no AI.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
