import type { ShopProductInput } from "../definition";

/**
 * Home Base's real public Shop listing, same "creating this file is the
 * release gate" pattern as personal-finance-companion.ts.
 *
 * Rewritten for the v2 product. The first version of this listing sold an
 * appliance tracker with an "Attention inbox", which is neither what the
 * product does nor a destination it still has: the nine screens collapsed
 * into one Home surface, and the scope grew from appliances to the twelve
 * areas a home actually has, including the garden, damp and pests, the
 * papers, and renting. Every claim below maps to something built and live.
 *
 * Two words are deliberately absent. "Overdue" is forbidden in this
 * product's voice, because a home that has not had its filter changed is
 * not failing at anything. And the listing never calls the contents of a
 * home a "thing", the generic noun the product eliminated from every
 * surface a person sees.
 *
 * $28 launch price, $35 regular. The second of the seven paid products
 * to get a real price, see the pricing plan's Phase 2. GetAction still
 * renders "Checkout opens soon" until LEMON_SQUEEZY_HMC_CHECKOUT_URL is
 * set, which this phase deliberately leaves alone.
 */
export const homeManagementCompanionShopProduct: ShopProductInput = {
  id: "home-management-companion",
  slug: "home-management-companion",
  publicationStatus: "published",
  title: "Home Base",
  promise:
    "Home Base remembers your home so you do not have to. It knows what needs doing and when, and it stays quiet the rest of the time.",
  problem:
    "The filter size is on the filter, the model number is behind the fridge, and the last time anyone flushed the water heater is nowhere at all. Homes do not fail because people are careless. They fail because nobody could reasonably hold three hundred small facts and dates in their head, and the reminder to act arrives as a leak in the ceiling.",
  audience: [
    "You own or rent a home and would rather be told what needs you this week than keep a mental list you know is incomplete.",
    "You want the boring, expensive things caught early: the water heater, the gutters, the outside tap before the first freeze.",
    "You are willing to spend one hour writing down what you have, in exchange for never having to work out the timing again.",
  ],
  audienceExclusions: [
    "You want to photograph model numbers and warranty cards and have them read automatically. Everything here is entered by you, on purpose. There is no camera scan, no document upload, and no AI reading your paperwork.",
    "You want a full room-by-room inventory valued for insurance. This tracks what needs upkeep, not everything you own.",
    "You want to share the list with a partner or a housemate and assign jobs between you. Home Base is single-account for now.",
    "You manage more than one property.",
  ],
  // Emptied by the content collapse: every objection was answered a
  // second time in faqs, and the Shop page rendered both a few hundred
  // pixels apart. Both now live in `questions`, answered once each and
  // tagged with the moment they matter.
  objections: [],
  // Emptied by the content collapse: four of these five restated a
  // problemsSolved solution almost word for word. The fifth said
  // something new and is now paired with the problem it answers.
  outcomes: [],
  problemsSolved: [
    {
      problem: "The filter size, the model number, the last flush date, none of it lives anywhere.",
      solution: "One page that answers whether anything needs you this week, in a sentence, instead of a dashboard to interpret.",
    },
    {
      problem: "The expensive stuff, the water heater, the gutters, the outside tap, gets caught too late, as a repair.",
      solution: "The boring, expensive jobs raised before they become repairs, not after.",
    },
    {
      problem: "Seasonal work gets remembered a year too late, long after its month has passed.",
      solution: "Seasonal work raised in the month it actually belongs to.",
    },
    {
      problem: "Nobody remembers who came out, what they did, or what it cost.",
      solution:
        "A record of who came out, what they did, and what it cost, and when you report a new problem it tells you who you already used for that kind of work.",
    },
    {
      problem: "At two in the morning nobody can find the water shutoff, let alone remember which way it turns.",
      solution: "The facts that only matter in an emergency, written down once, on a page you can print and leave by the door.",
    },
    {
      problem: "You are standing in the hardware store with no idea which filter, bulb or part it takes.",
      solution:
        "A what-to-buy line on each thing, for the filter size, part number or bulb type, printed on a single card you can take with you.",
    },
  ],
  howItWorks: [
    "Tell it whether you own or rent, then tap what your home has. Twelve areas, from the kitchen and the boiler to the garden, damp and pests, and the papers.",
    "It suggests the care each one usually needs and you untick anything that does not apply. Nothing is created without you confirming it.",
    "Already have notes somewhere? Paste them in and it will pull out what it recognises for you to confirm, line by line.",
    "Home shows what needs you now, what is coming up, and what has recently been handled. When there is nothing, it says so.",
    "When something is worth doing you can act on it or push it back. Acting records what actually happened: who did it, what it cost, and anything worth remembering next time.",
    "Something broken rather than due? Say what is wrong in a sentence and it works out what you mean and treats it as its own kind of problem. If you have already used somebody for that kind of work, it says who.",
    "Print an Item Card for anything you are about to buy a part for. It carries the make, the model and the what-to-buy line, so the paper is enough on its own at the counter.",
  ],
  access: "paid",
  // Launch pricing, Phase 2 of the pricing plan: $29 actual, marked up
  // 20% to a $35 regular price, then a net 20% off (30% off, netted
  // down by 10 points) for the $28 this actually charges today.
  price: { amount: 28, currency: "USD" },
  compareAtPrice: { amount: 35, currency: "USD" },
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "The twelve areas of a home: kitchen, laundry, heating and cooling, water, power, safety, structure, grounds and garden, pests and damp, everyday things, papers, and renting",
    "A hand-built care schedule covering 122 kinds of thing, including the jobs that belong to a season rather than a timer",
    "The Home Survey: a printable book in US Letter and A4, for gathering what you own away from a screen",
    "A what-to-buy line on each thing (filter size, part number, bulb type), and a printable Item Card carrying it to the shop",
    "Provider suggestions drawn from your own history: who you last used for that category of work, never a directory",
    "Setup by tapping rather than typing, plus paste-in import if you already keep notes somewhere",
    "Somewhere to record what is currently wrong, kept separate from what is merely due",
    "Service history and costs kept against the people who did the work",
    "Reminders that reach you before something becomes expensive, in the same voice as the app",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "What your home has, tapped from a list rather than typed",
    "Dates where you have them: when something was installed, last serviced, or when a warranty ends",
    "Who you would call, once you have called them",
    "What actually happened when you did a job, so the next one lands in the right place",
  ],
  expectedOutputs: [
    "A sentence about your home's condition, and the few things worth doing",
    "Care and seasonal work raised when it is due, never a permanent list",
    "A history of what has been done, by whom, and what it cost",
    "A printable survey of your home you can fill in by hand",
    "A one-page Item Card for anything you need to buy a part for",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so it is there if you come back on something else.",
  privacyNotes:
    "Your home records are private to your account. Draftpace does not sell your data or use it for advertising, and nothing here is read by an AI model. Home Base is a tracking aid, not a substitute for your manuals or a professional inspection, and anything involving gas, electricity, structure or water is a job for somebody qualified. Deliberately, it is not a place to keep passwords or alarm codes.",
  faqs: [],

  /**
   * Every worry, asked once, tagged with the moment it matters. Four
   * objections and eight faqs collapsed to eight questions: "another app
   * nagging you with a list" and "how does it decide what to show me"
   * were the same worry answered from two directions, as were "setting
   * this up sounds like an evening you do not have" and "what if I only
   * enter a few things at first". Sharing and multiple properties are
   * one honest "not yet" rather than two.
   */
  questions: [
    {
      question: "Worried it becomes another app nagging you with a list?",
      answer:
        "It shows the few things worth your attention, in a sentence, and when nothing needs you it says your home is in good shape and stops there. What appears is ranked by what it would cost you to leave it, so a smoke alarm outranks a dusty vent, and every row states the fact that put it there.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is setting this up an evening you do not have?",
      answer:
        "Setup is tapping what you have from a list, not typing, and you can stop at any point. It works from whatever you have given it: one water heater with a date on it is already worth more than forty blank rows. There is a printable book for gathering model numbers round the house away from a screen.",
      stage: ["deciding", "owning"],
    },
    {
      question: "How can it know how often anything is really due?",
      answer:
        "Because somebody wrote it down: a hand-built list of 122 kinds of thing found in homes and the care each one needs, including which jobs belong to which month. Nothing is inferred by a model, and every date traces back to something you entered.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Already behind on everything and expecting to be told so?",
      answer:
        "It never says overdue and never keeps score. A job not done yet is described by when it was last done and how often it comes round, and you can push anything back without it counting against you.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it scan receipts or warranty cards?",
      answer:
        "No. You add the details yourself, on purpose. There is no camera scan, no document upload, and nothing here is read by an AI model.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this useful if I rent?",
      answer:
        "Yes, and it adjusts. Say you rent and it stops asking about the roof and the gutters and starts asking about what costs a renter money: the notice deadline, the deposit, and what you reported to the landlord and when.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Can I share it with a partner, or track a second property?",
      answer:
        "Not yet, on both. It is built around one account and one home for now, with no sharing or assigning between people.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this a one-time purchase, and do I need an account?",
      answer:
        "One time, and yes. You pay once and keep it, and a Draftpace account is what keeps your home records private and available on whatever device you next open.",
      stage: ["deciding"],
    },
  ],

  /**
   * How people describe this before they know a product like this exists.
   * Sourced, not invented: the four home PROBLEM_ENTRIES clusters in
   * src/content/askdp.ts and the titles of home guides already written
   * from the same research.
   */
  searchedProblems: [
    {
      phrase: "I keep forgetting home maintenance",
      answer:
        "It holds the timing for you and raises a job when it is worth doing, then goes quiet again. Nothing sits on screen permanently.",
    },
    {
      phrase: "I just bought a house and have no idea what needs doing",
      answer:
        "Tap what your home has across twelve areas and it tells you what each one needs and roughly when, before anything becomes a repair.",
    },
    {
      phrase: "How often do home systems actually need servicing",
      answer:
        "A hand-built schedule for 122 kinds of thing found in homes, including the jobs that belong to a month rather than a timer.",
    },
    {
      phrase: "I lost the manual, the receipt and the warranty",
      answer:
        "Make, model, install date, warranty end and the what-to-buy line live on the thing itself, and print onto one card when you need them.",
    },
    {
      phrase: "I don't know which filter or part my appliance takes",
      answer: "A what-to-buy line on each thing, printable as a single Item Card you can take to the counter.",
    },
    {
      phrase: "Homeownership feels like a full-time job",
      answer:
        "One page answers whether anything needs you this week. When the answer is no, it says so and leaves it there.",
    },
  ],

  /**
   * What an owner opens the manual to do, each row linking to the screen
   * it happens on.
   */
  tasks: [
    {
      label: "Find out whether anything needs me this week",
      answer: "Home answers it in a sentence, with the few things worth doing under it and nothing padding the list.",
      destination: "workspace",
    },
    {
      label: "Add what my home has",
      answer: "Tap from the list of 122 kinds of thing rather than typing. Untick any care that does not apply to yours.",
      destination: "setup",
    },
    {
      label: "Record what filter or part something takes",
      answer: "The what-to-buy line sits on the thing itself, alongside its make and model.",
      destination: "workspace",
    },
    {
      label: "Take the details to the hardware store",
      answer: "Print an Item Card. It carries the make, model and what-to-buy line, and is self-sufficient on paper.",
      destination: "printables",
    },
    {
      label: "Report something that's broken rather than due",
      answer: "Say what is wrong in a sentence. It is treated as its own kind of problem, and you are told who you used last for that kind of work.",
      destination: "workspace",
    },
    {
      label: "Look up who came out and what it cost",
      answer: "History keeps the work, the person and the cost, so the question three years from now has an answer.",
      destination: "history",
    },
    {
      label: "Bring in notes I already keep somewhere",
      answer: "Paste them in. It pulls out what it recognises and you confirm line by line before anything is created.",
      destination: "import",
    },
  ],

  relatedGuideSlugs: [],
  relatedProductSlugs: ["personal-finance-companion", "personal-life-affairs-companion", "homeschooling-companion"],
  needGroups: ["getting-organized"],
  seo: {
    title: "Home Base: know what your home needs, before it gets expensive",
    description:
      "Home Base remembers your home so you do not have to. It knows what needs doing and when, across the twelve areas a home actually has, and it stays quiet the rest of the time.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
