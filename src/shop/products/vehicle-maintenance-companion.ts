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
  // Emptied by the content collapse: four of these five were answered a
  // second time in faqs, and the Shop page rendered both. All of them
  // now live in `questions`, answered once each and tagged with the
  // moment they matter.
  objections: [],
  // Emptied by the content collapse: four of these six restated a
  // problemsSolved solution nearly word for word. The two that said
  // something new are now paired with the problem they answer.
  outcomes: [],
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
    {
      problem: "Every maintenance app eventually becomes a list of manufactured urgency you stop opening.",
      solution:
        "One screen: what is due, ranked, across every vehicle. No streak, no score, and a plain \"nothing is due\" on the days that is true.",
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
  faqs: [],

  /**
   * Every worry, asked once, tagged with the moment it matters. Five
   * objections and seven faqs collapsed to eight questions: each
   * objection had a near-identical faq beneath it (the factory-schedule
   * pair, the used-car pair, the severe-duty pair, the Service Boundary
   * pair), and the Shop page rendered both.
   */
  questions: [
    {
      question: "Does it know my car's real factory maintenance schedule?",
      answer:
        "No, and it is not trying to. What it offers is a short, hand-written list of typical starting intervals for common jobs, always labelled typical, and copying one onto your vehicle makes it an ordinary editable number from that point on. Your own manual or your own mechanic is always the real source. This just means you are not typing a number from nothing.",
      stage: ["deciding", "owning"],
    },
    {
      question: "I bought a used car with no service records. What happens?",
      answer:
        "You mark that vehicle's history unknown when you add it, and it stops asking for a last-done date it does not honestly have. Every item on it reads as nothing to judge yet until you record a real fact, and it never guesses that something is already overdue on a car it knows nothing about.",
      stage: ["deciding", "owning"],
    },
    {
      question: "I tow, or drive short trips. What does severe duty actually change?",
      answer:
        "It is a one-time toggle on a specific job, not on the whole vehicle, because an oil change and a tyre rotation do not shorten at the same rate. Turning it on halves whichever interval you entered for that one job. It never substitutes a hardcoded number of its own and never touches anything else on the car.",
      stage: ["deciding", "owning"],
    },
    {
      question: "What is the Service Boundary, and what is it for?",
      answer:
        "A dated, mileage-stamped document you generate before a shop visit: exactly what you are requesting today, with everything else you track on that vehicle listed as not authorized without a further conversation. It states your own choice, decided before you hand the keys over, not a recommendation from Draftpace about what your car needs.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it connect to my car or read my odometer?",
      answer:
        "No. There is no connection to any vehicle, dealer, or manufacturer system anywhere in this product, and no VIN lookup. You enter your own mileage, which is also why nothing here can be wrong about your car without you having typed it.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Will it nag me with manufactured urgency?",
      answer:
        "There is one main screen: what is due, ranked, across every vehicle you own. No streak, no score, and on a day when nothing is due it says exactly that and stops.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it send me a reminder when something comes due?",
      answer:
        "No, and it does not pretend to. Nothing is sent to you. What is due is worked out fresh each time you open it, from the intervals and dates you recorded.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this a one-time purchase, and do I need an account?",
      answer:
        "One time, and yes. The account is what keeps your vehicles private and there on your phone at the shop after you set them up on a laptop.",
      stage: ["deciding"],
    },
  ],

  /**
   * How people describe this before they know a product like this exists.
   * There were no PROBLEM_ENTRIES or guides for vehicles when this was
   * written, so these come from research done for it rather than from
   * the existing knowledge layer: the two recurring owner situations
   * (a used car with no records, and unauthorised work at the counter)
   * and the widely documented fact that a large share of drivers meet
   * the severe-service definition without knowing the term. Every answer
   * describes only what the product actually does.
   */
  searchedProblems: [
    {
      phrase: "I bought a used car with no maintenance records",
      answer:
        "Mark its history unknown and nothing is assumed done. Items wait, honestly, until you have a real fact to record against them.",
    },
    {
      phrase: "How do I stop a shop doing work I didn't authorize",
      answer:
        "Hand them a dated, mileage-stamped page saying what you are requesting today and that nothing else is authorized without a conversation first.",
    },
    {
      phrase: "How often should I really change the oil if I tow or drive short trips",
      answer:
        "Enter the interval you actually believe, then turn on severe duty for that one job to halve it. Nothing here overrides your number with its own.",
    },
    {
      phrase: "I can't remember what interval the mechanic quoted me",
      answer:
        "Type it in once against that vehicle. It is kept, editable, and it is what the due date is computed from from then on.",
    },
    {
      phrase: "What maintenance is due on my car right now",
      answer:
        "One ranked view across every vehicle you own, worked out from your intervals and your recorded dates and mileage, never from a guess.",
    },
    {
      phrase: "I have two cars and lose track of which needs what",
      answer:
        "Both sit in the same ranked list, most urgent first, each item saying which vehicle it belongs to.",
    },
  ],

  /**
   * What an owner opens the manual to do, each row linking to the screen
   * it happens on.
   */
  tasks: [
    {
      label: "See what's due right now",
      answer: "Due ranks everything across every vehicle, most urgent first, and says plainly when nothing is.",
      destination: "workspace",
    },
    {
      label: "Add a vehicle",
      answer: "What you call it, its identity if you want it, and whether you actually know its service history.",
      destination: "vehicles",
    },
    {
      label: "Track a job and set its real interval",
      answer: "Start from a typical interval or write your own. Either way it is your number and stays editable.",
      destination: "vehicles",
    },
    {
      label: "Account for towing or short trips",
      answer: "Turn on severe duty for that one job. It halves the interval you entered and touches nothing else.",
      destination: "vehicles",
    },
    {
      label: "Record that I had something done",
      answer: "Mark it done on the day. Its next due date resets from that real fact, not from an estimate.",
      destination: "workspace",
    },
    {
      label: "Put a limit in writing before a shop visit",
      answer: "Generate the Service Boundary. Choose what you are requesting; everything else prints as not authorized.",
      destination: "printables",
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
