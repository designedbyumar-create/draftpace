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
 * price is deliberately omitted (TODO_SET_REAL_PRICE), same convention
 * as all five paid siblings: formatPrice() renders "Price not yet set"
 * rather than a fabricated figure, and GetAction renders "Checkout opens
 * soon" until LEMON_SQUEEZY_TRAVEL_CHECKOUT_URL is set.
 */
export const travelCompanionShopProduct: ShopProductInput = {
  id: "travel-companion",
  slug: "travel-companion",
  publicationStatus: "published",
  title: "Travel Companion",
  promise:
    "Everything your trip depends on, in one place, and the one thing most travel tools miss: what else moves when one thing moves. Record a change to a flight and it shows you the transfer, the check-in and the reservation that were built on it, one at a time.",
  problem:
    "A trip is easy to plan and hard to run. The planning happens once, calmly, weeks ahead. The running happens in an airport at 6am when the flight has moved three hours and you are trying to remember, from memory, what else you booked around the old time. Confirmation numbers are in six different inboxes, the transfer company's number is in a screenshot, and the only thing holding the shape of the trip together is your own head, which is the thing least available at exactly that moment.",
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
  objections: [
    {
      worry: "Already have everything in your email and a notes app?",
      answer:
        "Most people do, and it works right up until something moves. Email holds each booking on its own, with no idea that the transfer was booked around the flight. This holds the connection between them, so when one changes you are shown what was built on top of it instead of reconstructing it from memory at a gate.",
    },
    {
      worry: "Worried this is another itinerary planner?",
      answer:
        "A planner is about deciding what your trip will be. This is about running the trip once it exists and starts changing. It never suggests a destination, never fills a day for you, and every blank stays blank until you write in it.",
    },
    {
      worry: "Not going to trust an app with your passport details?",
      answer:
        "You should not, and it does not ask. It cannot store a file at all: there is no upload anywhere in the product. It records that a document exists, whose it is, and where it lives, which is what you actually need at a desk when somebody asks where it is.",
    },
    {
      worry: "Phone dies, then what?",
      answer:
        "There is a printed book included, blank and structured, covering the whole trip: bookings, travellers, documents, transport, daily pages, and the connection pages that are the point of the product. Paper does not need signal, battery, or a login.",
    },
    {
      worry: "Travelling alone with a simple trip?",
      answer:
        "Then this is probably more than you need. It earns its place when a trip has enough moving parts that one change causes another, and when somebody other than you is depending on the answer.",
    },
  ],
  outcomes: [
    "One place that holds what you booked, who it is for, and what it depends on, instead of six inboxes and a screenshot.",
    "When something moves, an immediate answer to what else it touches, walked one booking at a time rather than all at once.",
    "A confirmation number and a provider readable in three seconds at a desk, without opening an email client.",
    "Today's operational state on one screen: what is happening, what is worth knowing about tomorrow, and what you are still waiting to hear back on.",
    "An honest, quiet screen on the days a trip needs nothing from you, rather than a list filling the space anyway.",
    "A record of what actually happened, and what is worth knowing before the next trip to the same place.",
    "A printed book you can carry, so the trip does not depend on one device staying charged.",
  ],
  howItWorks: [
    "Set up a trip with a name and rough dates. That is the whole of the setup, and nothing is gated behind finishing it.",
    "Add what it is made of as you book it: destinations, travellers, flights, transfers, stays and reservations, each with its own provider and reference.",
    "For anything booked around something else, say so once with a 'this depends on' picker. Nothing is ever inferred from timing or place, because two things on the same day are not necessarily connected.",
    "Today shows the current state, derived fresh from what you recorded: what is happening now, what is worth knowing about, and what you are waiting on.",
    "When something moves, record the change. It walks down what depends on it and shows every affected booking as potentially affected, never edited for you, so you decide what actually needs doing.",
    "For each one, the Companion walks you through it: eight authored situations covering booking, flight, hotel and transport problems, plus the general ones for reorganising and letting people know.",
    "Waiting to hear back becomes a real open thread, shown on Today until it is resolved, then filed into the record with the line it closed on.",
    "Print My Trip Book whenever you want a paper copy, blank and structured, as long or short as your trip needs.",
  ],
  access: "paid",
  // TODO_SET_REAL_PRICE: no price object yet, see the file doc comment.
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "Today: the current operational state of the trip, derived fresh from what you recorded, never a manual task list",
    "Trip: destinations, bookings, documents and preparation, with a Trip Brief summarising the whole thing at a glance",
    "Booking connections: say once what a booking depends on, and the product remembers the shape of your trip for you",
    "The change-impact walk: record a change and see exactly what was built on top of it, handled one booking at a time",
    "The Companion: eight authored situations for when something goes wrong, including flight, hotel, transport and booking problems",
    "Open threads: anything you are waiting to hear back on, surfaced while it matters and filed when it is resolved",
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
  faqs: [
    {
      question: "Is this a one-time purchase or a subscription?",
      answer: "One time. You pay once and keep it, the same way every paid product on Draftpace works.",
    },
    {
      question: "Can I store my passport or tickets in it?",
      answer:
        "No, and that is deliberate rather than a limitation waiting to be fixed. It records that a document exists, whose it is, and where it is kept, for example a photo in your phone or printed in the front pocket. No product on Draftpace stores an uploaded file, and passport and visa references are the most sensitive category of data any of them would hold if it did.",
    },
    {
      question: "Does it track flight status or tell me if my flight is delayed?",
      answer:
        "No. It has no connection to any airline or booking system, and it does not send notifications of any kind yet. Everything it shows is something you recorded. What it does is far more useful once you already know about the delay: tell you what else that delay touches.",
    },
    {
      question: "What actually happens when a flight moves?",
      answer:
        "You record the new time on that booking. It then walks down everything you said was booked around it, the transfer, the check-in, the reservation that evening, and shows each one as potentially affected with its current time. It changes nothing for you. You go through them one at a time, with the Companion to help on any that need a phone call.",
    },
    {
      question: "Can it split costs between the people I am travelling with?",
      answer:
        "No. There is no amount, currency, or balance column anywhere in it, on purpose. A thread can say somebody still owes their share in your own words, but nothing here calculates it. Adding that would make this a worse version of a product we already sell.",
    },
    {
      question: "Will it plan my trip or suggest things to do?",
      answer:
        "No. It has no opinion about where you should go or what you should book, and there is no model involved anywhere in it. It is built to run a trip you have already decided on.",
    },
    {
      question: "What is My Trip Book?",
      answer:
        "A blank, structured travel planner, included, that you print and fill in by hand. Trip overview, destinations, travellers, bookings, transport, accommodation, documents, open threads and daily pages, plus the booking-connection and change-impact pages that are this product's own way of thinking. It is modular, so a trip with three destinations prints three destination pages rather than forcing a fixed planner on you.",
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your trip saves privately and follows you across devices.",
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
