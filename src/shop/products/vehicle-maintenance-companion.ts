import type { ShopProductInput } from "../definition";

/**
 * Vehicle Maintenance Companion's real public Shop listing, same
 * "creating this file is the release gate" pattern as its siblings.
 *
 * WHAT THE LISTING IS ALLOWED TO CLAIM
 *
 * This product's own definition.ts is load-bearing here, not background
 * reading. This listing must never imply any of the following, because
 * none of them exist:
 *
 *   1. A real factory maintenance schedule for any specific make or
 *      model. vehicleKnowledge.ts is a short, hand-written list of
 *      typical starting intervals, always labelled "typical", never a
 *      claim about what a real manufacturer actually specifies.
 *   2. A repair shop, a mechanic, or a booking of any kind. This product
 *      never contacts anyone on a person's behalf.
 *   3. Live vehicle data of any kind: no VIN lookup, no odometer sync, no
 *      connection to a car, a dealer, or a manufacturer's own systems.
 *      Every figure it shows traces to something a person typed in.
 *   4. Notifications of any kind. The product's own definition declares
 *      notifications: { supported: false }.
 *
 * $18 launch price, $23 regular, the same tier as Travel Companion and
 * Homeschooling Companion, two other single-purpose Companions of
 * comparable scope.
 */
export const vehicleMaintenanceCompanionShopProduct: ShopProductInput = {
  id: "vehicle-maintenance-companion",
  slug: "vehicle-maintenance-companion",
  publicationStatus: "published",
  title: "Vehicle Maintenance Companion",
  promise:
    "The intervals you actually know, kept against the vehicles you actually own, so you always know what's due and can put it in writing before a shop touches your car.",
  problem:
    "A car's real maintenance history lives across a glovebox folder, a dealer's own system you cannot access, and whatever a mechanic told you two years ago. Nobody remembers the exact interval they were quoted, so every visit starts from zero, and \"while we had it up on the lift\" is how a routine oil change becomes a much larger bill. A generic manufacturer schedule you found online is not what anyone actually agreed to for this vehicle, this driving, this history.",
  audience: [
    "You own more than one vehicle, or a vehicle with a maintenance history you already know by heart but have never written down anywhere.",
    "You have bought a used car or inherited one, and its real service history is genuinely unknown to you.",
    "You do a lot of towing, short trips, or driving in heat, dust or cold, and know that shortens some of your normal intervals.",
    "You have been surprised at a shop counter by work you did not ask for.",
    "You want one place that says what is due, instead of a mental estimate every time you drop the car off.",
  ],
  audienceExclusions: [
    "You want it to look up your vehicle's real factory schedule for you. It has no connection to any manufacturer's data and never will; every interval it stores is one you entered or copied from a short, clearly-labelled list of typical starting points.",
    "You want it to book a shop, order parts, or contact anyone on your behalf. It does none of that.",
    "You want it to read your car's odometer or connect to the vehicle itself. There is no such connection anywhere in this product. You tell it your mileage.",
    "You want push notifications when something becomes due. It does not send them yet, and does not pretend to.",
    "You want a full record of every repair ever done. This is about what is due next, not a general vehicle history log.",
  ],
  objections: [
    {
      worry: "Worried this claims to know your car's real maintenance schedule?",
      answer:
        "It does not, deliberately. The starting points it offers are hand-written, generic rules of thumb, always labelled \"typical,\" and every one becomes an ordinary, editable number the moment you use it. Your own manual, or your own mechanic, is always the real source. This just means you are not stuck typing a number from nothing.",
    },
    {
      worry: "Bought a used car with no real history?",
      answer:
        "That is a distinct, named path in the product, not an afterthought. Marking a vehicle's history unknown skips asking for a last-done date or mileage it does not honestly have. Every item on it reads as nothing to judge yet, never as an invented \"already overdue,\" until you record a real fact against it.",
    },
    {
      worry: "Do a lot of towing or short trips?",
      answer:
        "Severe duty is a one-time toggle per job, not per vehicle, because oil changes and tire rotations do not shorten at the same rate as everything else on the car. It halves whichever interval you actually entered; it never substitutes a different number of its own.",
    },
    {
      worry: "Skeptical of yet another maintenance app that never gets used?",
      answer:
        "There is exactly one main screen: what is due, ranked, across every vehicle you own. No streaks, no score, no manufactured urgency for things that are not actually due. A day with nothing due says so plainly.",
    },
    {
      worry: "Worried about surprise work at the shop counter?",
      answer:
        "This is the reason the Service Boundary exists: a dated, mileage-stamped document stating exactly what you are requesting today and what is explicitly not authorized without a further conversation. It states your own choice, made in the app before you hand it over.",
    },
  ],
  outcomes: [
    "One ranked view of what is due, across every vehicle you own, computed from the intervals and facts you actually recorded.",
    "A place to keep the exact interval you were quoted, instead of relying on memory or a generic number found online.",
    "A one-time severe-duty toggle per job, so towing or short-trip driving is accounted for without inventing a second interval table.",
    "A distinct, honest path for a used or inherited vehicle: nothing is assumed already done, and nothing reads as overdue until a real fact says so.",
    "A dated, mileage-stamped Service Boundary document you can hand to a shop, stating what is requested today and what is not authorized.",
    "A quiet, honest screen on the days nothing is due, rather than an invented task filling the space.",
  ],
  problemsSolved: [
    {
      problem: "Nobody remembers the exact interval they were quoted for this specific vehicle.",
      solution: "A place to type it in once, and keep it, editable, against that vehicle for good.",
    },
    {
      problem: "A used or inherited car has no honest service history to check.",
      solution: "A distinct unknown-history path: nothing is assumed done, nothing reads as overdue without a real fact.",
    },
    {
      problem: "\"While we had it up on the lift\" turns a routine visit into a much larger bill.",
      solution: "A dated, mileage-stamped Service Boundary stating what is requested today and what is not authorized.",
    },
    {
      problem: "Towing or short-trip driving shortens some intervals, but not all of them equally.",
      solution: "A one-time severe-duty toggle per job that halves only the interval you actually entered.",
    },
  ],
  howItWorks: [
    "Add a vehicle: what you call it, and its identity if you want it. Say once whether you actually know its service history.",
    "Track a maintenance item on it: start from a short list of typical jobs and intervals, or write your own from scratch. Every interval is yours to change, before or after saving.",
    "Turn on severe duty for a specific job if hard use shortens it. It halves that job's own interval; nothing else changes.",
    "If you know the vehicle's history, record when a job was last done, by date, mileage, or both. If you do not, that job waits, honestly, until you have a real fact.",
    "Due shows one ranked view of what needs attention across every vehicle, most urgent first, and says plainly when nothing does.",
    "Mark a job done the day you actually do it, and its due date resets from that real fact.",
    "Before a shop visit, generate a Service Boundary: choose what you are requesting today, and everything else prints as not authorized without a further conversation.",
  ],
  access: "paid",
  price: { amount: 18, currency: "USD" },
  compareAtPrice: { amount: 23, currency: "USD" },
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "Due: one ranked view of what needs attention across every vehicle you own, computed fresh, never a manual checklist",
    "Vehicles: as many as you own, each with its own maintenance items and its own service-history status",
    "A short, hand-written list of typical starting intervals for common jobs, always labelled typical, always editable",
    "A one-time severe-duty toggle per maintenance item, not per vehicle",
    "A distinct unknown-history path for a used or inherited vehicle",
    "The Service Boundary: a dated, mileage-stamped printable stating what is requested today and what is not authorized",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "A vehicle's label and, if you want it, its year, make and model",
    "Whether you actually know that vehicle's service history",
    "The maintenance jobs you want to track, and their real intervals",
    "Whether hard use shortens a specific job's interval",
    "The date and mileage a job was last done, when you know it",
  ],
  expectedOutputs: [
    "One ranked list of what is due or due soon, across every vehicle you own",
    "A clear, separate list of items with nothing to judge yet, never guessed",
    "A dated, mileage-stamped Service Boundary document, ready to hand to a shop",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so a vehicle you set up on a laptop is there on your phone at the shop. Nothing is ever silently deleted; removing a vehicle or an item archives it rather than erasing the record.",
  privacyNotes:
    "Your vehicles and maintenance records are private to your account. Draftpace does not sell your data or use it for advertising, and nothing here is read by an AI model: there is no model provider anywhere in this product. It has no connection to any vehicle, dealer, or manufacturer system, and cannot look up or share anything about your car beyond what you typed in yourself.",
  faqs: [
    {
      question: "Is this a one-time purchase or a subscription?",
      answer: "One time. You pay once and keep it, the same way every paid product on Draftpace works.",
    },
    {
      question: "Does it know my car's actual factory maintenance schedule?",
      answer:
        "No, and it is not trying to. It offers a short, hand-written list of typical starting intervals for common jobs, always labelled \"typical,\" and copying one onto your vehicle makes it an ordinary, editable number from that point on. Your own manual or mechanic is always the real source.",
    },
    {
      question: "I bought a used car with no service records. What happens?",
      answer:
        "You mark that vehicle's history unknown when you add it. Nothing is asked about when a job was last done, and every item on it reads as nothing to judge yet, honestly, until you record a real fact against it. It never guesses that something is already overdue.",
    },
    {
      question: "What does severe duty actually change?",
      answer:
        "It is a one-time toggle on a specific maintenance item, not the whole vehicle. Turning it on halves whichever interval you entered for that job; it never substitutes a different, hardcoded number of its own, and it never changes any other job on the same vehicle.",
    },
    {
      question: "What is the Service Boundary?",
      answer:
        "A document you generate before a shop visit: a dated, mileage-stamped statement of exactly what you are requesting today, with everything else you track on that vehicle listed as not authorized without a further conversation. It states your own choice, decided in the app, not a recommendation from Draftpace about what your car needs.",
    },
    {
      question: "Does it connect to my car or read my actual odometer?",
      answer: "No. There is no connection to any vehicle, dealer, or manufacturer system anywhere in this product. You enter your own mileage.",
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your vehicles save privately and follow you across devices.",
    },
  ],
  relatedGuideSlugs: [],
  relatedProductSlugs: ["home-management-companion", "personal-life-affairs-companion"],
  needGroups: ["keeping-something-moving"],
  seo: {
    title: "Vehicle Maintenance Companion: know what's due, in writing before a shop touches your car",
    description:
      "Track the maintenance intervals you actually know, across every vehicle you own, and generate a dated Service Boundary before a shop visit. No factory-schedule claims, no vehicle connection, no AI.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
