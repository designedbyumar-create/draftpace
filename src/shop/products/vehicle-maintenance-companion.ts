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
 *   4. Notifications the person did not switch on. Reminders exist, but
 *      they are opt-in, off until chosen in Settings, and only ever for a
 *      job that reached an interval or a date the person recorded.
 *   5. Documents stored or checked. Paperwork records a date and where the
 *      paper is kept; nothing is uploaded and nothing is verified.
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
    "You want it to store or scan your documents. It records a date and where the paper is kept, and nothing is uploaded.",
    "You want fuel logging or a running cost analysis. It keeps the cost of each service if you enter one, and adds up only those.",
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
      problem: "You have no proof the car was looked after when it is time to sell it.",
      solution:
        "Every service you record is kept with its day, mileage, who did it and what it cost, and prints as a service record that says plainly it is your own.",
    },
    {
      problem: "Registration, insurance and the inspection all come round on different days.",
      solution: "Record each date and where the paper is. They show on Due as they get close, and go on a one-page glove box card with your registration plate, tire size and roadside number.",
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
    "Add a vehicle: what you call it and what it runs on. That is all it needs. Add as many as you own; a strip of plates on Due shows which one needs you, and one tap narrows the view to it.",
    "Get its usual jobs in one tap. Its fuel type, its age and its mileage choose a short list of typical jobs to start from, or you can type them in from your own manual.",
    "Track a maintenance item on it: start from a short list of typical jobs and intervals, or write your own from scratch. Every interval is yours to change, before or after saving.",
    "Turn on severe duty for a specific job if hard use shortens it. It halves that job's own interval; nothing else changes.",
    "If you know the vehicle's history, record when a job was last done, by date, mileage, or both. If you do not, that job waits, honestly, until you have a real fact.",
    "Due shows one ranked view of what needs attention across every vehicle, most urgent first, and says plainly when nothing does.",
    "Say a job was done with the real day and mileage, and who did it and what it cost if you want. Its due date resets from that fact, the vehicle's mileage moves up with it, and the service is kept in History.",
    "Add the dates that belong to the vehicle, such as registration, insurance, an inspection or a warranty ending, and where the paper is kept. They show on Due as they get close.",
    "Switch reminders on in Settings if you want one. Off by default, and only for a job that reached its interval or a date you recorded.",
    "Before a shop visit, generate a Service Boundary: choose what you are requesting today, add anything else you are asking for, set the most you will agree to without a call, and everything else prints as not authorized. Printing a service record for a buyer, or a glove box card, works the same way.",
  ],
  access: "paid",
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
    "Due: one ranked view of what needs attention across every vehicle you own, computed fresh, never a manual checklist",
    "Vehicles: as many as you own, each with its own maintenance items, a plate on a strip so you can see which one needs you, and its own service-history status",
    "Usual jobs for a vehicle in one tap, chosen from its fuel type, age, mileage and hard use, or typed in from your own manual in one table",
    "A short, hand-written list of typical starting intervals for common jobs, always labelled typical, always editable",
    "A one-time severe-duty toggle per maintenance item, not per vehicle, that you can change any time",
    "History: every service kept with its day, mileage, shop, cost and note, by year",
    "Paperwork: registration, insurance, inspection and warranty dates with where the paper is kept, and the details for a glove box card",
    "Starter lists you can add in one go, before winter, before a long drive, once a year, or by the miles",
    "Opt-in reminders for a job that reached its interval and a date that is close",
    "A distinct unknown-history path for a used or inherited vehicle",
    "The Service Boundary: a dated, mileage-stamped printable stating what is requested today, the most you will agree to without a call, and that anything else is not authorized",
    "A printable service record for a buyer, and a one-page glove box card",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "A vehicle's label and, if you want it, its year, make and model",
    "Whether you actually know that vehicle's service history",
    "The maintenance jobs you want to track, and their real intervals",
    "Whether hard use shortens a specific job's interval",
    "The date and mileage a job was last done, when you know it",
    "Each service as it happens: the day, the mileage, who did it and what it cost, if you want",
    "The dates that belong to the vehicle, and where the paper is kept",
  ],
  expectedOutputs: [
    "One ranked list of what is due or due soon, across every vehicle you own",
    "A clear, separate list of items with nothing to judge yet, never guessed",
    "A dated, mileage-stamped Service Boundary document, ready to hand to a shop",
    "A service record by vehicle and by year, which you can print for a buyer",
    "A glove box card with the details and dates you recorded",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so a vehicle you set up on a laptop is there on your phone at the shop. Nothing is ever silently deleted; closing a vehicle, stopping a job or removing a service takes it out of view rather than erasing it.",
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
        "It is a one-time toggle on a specific job, not on the whole vehicle, because an oil change and a tire rotation do not shorten at the same rate. Turning it on halves whichever interval you entered for that one job. It never substitutes a hardcoded number of its own and never touches anything else on the car.",
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
        "Only if you switch it on, in Settings. It is off by default. When it is on you get one notification at most once an hour, only for a job that reached the interval you set or a date you recorded that is close, and each thing only once. Quiet hours are yours to set, and what is due is always worked out fresh when you open it.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Will it keep my service history for when I sell the car?",
      answer:
        "It keeps every service you record, with the day, the mileage, who did it and what it cost if you entered one, and prints them oldest first as a service record. The page says it is your own record, not a dealer or shop history, because that is what it is.",
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
      answer: "Say what was done, on which day and at what mileage. Its next due date resets from that real fact, and the service is kept in History.",
      destination: "workspace",
    },
    {
      label: "Print my service history for a buyer",
      answer: "Choose the vehicle in History and print the service record. It lists everything you recorded, oldest first.",
      destination: "history",
    },
    {
      label: "Keep registration and insurance dates in view",
      answer: "Record each date and where the paper is on Paperwork. They show on Due as they get close.",
      destination: "paperwork",
    },
    {
      label: "Put a limit in writing before a shop visit",
      answer: "Make the Service Boundary. Choose what you are requesting, add a limit you will not go over without a call; everything else prints as not authorized.",
      destination: "printables",
    },
  ],

  relatedGuideSlugs: [],
  relatedProductSlugs: ["home-management-companion", "personal-life-affairs-companion"],
  needGroups: ["keeping-something-moving"],
  seo: {
    title: "Vehicle Maintenance Companion: know what's due, in writing before a shop touches your car",
    description:
      "Track the maintenance intervals you actually know across every vehicle you own, keep the service history, and generate a dated Service Boundary before a shop visit. No factory-schedule claims, no vehicle connection, no AI.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
