/**
 * The life areas the Companion Series is organised by.
 *
 * WHY AREAS AND NOT SITUATIONS
 *
 * The needs taxonomy in src/content/needs.ts was written for a
 * hypothetical catalogue of generic productivity tools. The catalogue
 * that actually got built is organised by life domain, and six of seven
 * products ended up in a single need bucket while three buckets stayed
 * empty. People arrive thinking "my money is a mess" or "we are going to
 * Japan in October", never "I need to follow through", so this is the
 * shape that matches how somebody actually turns up.
 *
 * TWO TIERS, ON PURPOSE
 *
 * The Companion Series is the substantial tier: one product, one domain,
 * one hard problem, bought once and owned. A second, lighter tier of
 * small products is planned. Keeping the tiers explicit means a small
 * product can be added later without renaming anything or pretending it
 * is the same size of thing as a Companion.
 */

export interface AreaCluster {
  title: string;
  blurb: string;
  slugs: string[];
}

export interface LifeArea {
  slug: string;
  /** Short label, used in navigation and filters. */
  label: string;
  /** The situation in the reader's own words, not ours. */
  situation: string;
  /**
   * The longer version, written in the first person, for the Need help
   * finder. It has to sound like something somebody would actually say
   * about their own week, not like a category description.
   */
  inTheirWords: string;
  /**
   * Three things the Companion for this area actually does. Every line
   * has to be true of the shipped product: this is the page where a
   * reader decides whether we understand their problem, so an
   * aspirational line here costs more than a missing one.
   */
  whatHelps: string[];
  /**
   * The homepage hero's button label for this area.
   *
   * The hero used to carry one static "See the full product" under a
   * heading that already said the product's name, so the single control
   * in the most valuable position on the site said nothing about what
   * was behind it. This is that label, written per area and phrased as
   * the thing a reader would actually want to see, not as the product's
   * name a second time.
   */
  heroCta: string;
  /**
   * Three guides to start with, in order: the ones that best answer what
   * somebody in this situation is most likely to be searching for. Shown
   * on the homepage and on the Companion's own page, so the Companion and
   * the guides that lead to it link to each other. Never a UK-locale
   * guide, and always a guide filed under this area; areas.test.ts holds
   * both.
   */
  startHere: string[];
  /**
   * Two or three sentences at the top of the area's hub page, for a
   * person in this situation. What the guides cover and where to begin.
   */
  intro: string;
  /**
   * The area's guides grouped by the task or situation they answer, first
   * group first. Every guide filed under the area sits in exactly one
   * cluster; areas.test.ts holds that.
   */
  clusters: AreaCluster[];
  /** Product slugs, in the order they should be offered. */
  productSlugs: string[];
}

export const LIFE_AREAS: LifeArea[] = [
  {
    slug: "money",
    label: "Money",
    situation: "You are never quite sure what is actually safe to spend.",
    inTheirWords:
      "I have money in the account but I do not know how much of it is really mine to spend, because I cannot remember everything that is still coming out.",
    whatHelps: [
      "One number for what is genuinely safe to spend, after what is already committed.",
      "Bills, subscriptions and debts held in one place instead of across four bank apps.",
      "A single next move when something needs attention, rather than a dashboard to interpret.",
    ],
    heroCta: "See what is free to spend",
    startHere: [
      "how-much-of-your-money-is-actually-safe-to-spend",
      "you-missed-a-payment-what-to-do-next",
      "how-to-find-every-subscription-you-are-paying-for",
    ],
    intro:
      "These guides are for the point where you have money in the account and still cannot say how much of it is yours to spend. They cover working out a safe number, building a budget that survives a bad month, and dealing with subscriptions, debt and missed payments. The three start here guides are the place to begin; the rest are for when you need them.",
    clusters: [
      {
        title: "Working out what is safe to spend",
        blurb: "Start here to separate the balance you see from the money that is already spoken for.",
        slugs: [
          "how-much-of-your-money-is-actually-safe-to-spend",
          "available-balance-vs-current-balance",
          "can-you-afford-it-before-you-buy-it",
          "monthly-bills-list",
          "what-to-check-before-each-direct-debit-date",
        ],
      },
      {
        title: "A budget that survives a bad month",
        blurb: "Plain methods for setting a budget up, and for coming back to it after it slips.",
        slugs: [
          "how-to-budget-for-beginners",
          "50-30-20-rule-where-it-breaks",
          "budget-for-variable-bills",
          "how-to-budget-with-irregular-income",
          "why-budgeting-apps-stop-working-after-two-months",
          "how-to-start-over-after-budget-failure",
          "end-of-month-money-review",
        ],
      },
      {
        title: "Getting scattered finances in order",
        blurb: "For when accounts, statements and shared costs are spread everywhere and need one home.",
        slugs: [
          "organize-your-finances-from-scratch",
          "bank-statement-csv-to-budget",
          "financial-binder-what-to-include",
          "sort-out-your-finances-after-a-life-change",
          "split-bills-with-a-partner-or-roommate",
        ],
      },
      {
        title: "Finding and cancelling subscriptions",
        blurb: "How to list every recurring charge, including the annual ones, and end the ones you do not want.",
        slugs: [
          "how-to-find-every-subscription-you-are-paying-for",
          "subscription-tracker-what-to-track",
          "how-to-cancel-subscriptions",
        ],
      },
      {
        title: "Missed payments, debt and savings",
        blurb: "What to do after a payment slips, how to compare ways of paying debt down, and how to build a cushion.",
        slugs: [
          "you-missed-a-payment-what-to-do-next",
          "credit-card-minimum-payments-how-long",
          "debt-snowball-vs-avalanche",
          "how-to-build-a-first-1000-emergency-fund",
          "how-to-save-money-fast",
          "sinking-funds-explained",
        ],
      },
    ],
    // Personal Finance Companion first, deliberately. Every marketing
    // surface that shows one product per area takes productSlugs[0], so
    // while Monthly Money Reset led this list the highest-value slot on
    // the site (the hero's Money panel) advertised the free product and
    // the paid flagship was invisible there. The free product has its own
    // page now, at /free, rather than a slot it was winning by costing
    // nothing.
    productSlugs: ["personal-finance-companion", "monthly-money-reset"],
  },
  {
    slug: "home",
    label: "Home",
    situation: "The house needs things done and nobody is holding the list.",
    inTheirWords:
      "Something in this house needs doing and I only ever find out when it becomes a problem. The model number is behind the fridge and the last service date is nowhere.",
    whatHelps: [
      "Every appliance, system and provider recorded once, with the details you actually need later.",
      "What is worth taking care of now, worked out from real dates rather than a nagging schedule.",
      "Snooze and skip that genuinely change what you get asked about again.",
    ],
    heroCta: "See what a house needs",
    startHere: [
      "home-maintenance-checklist-by-month",
      "how-to-make-a-home-binder",
      "first-week-after-buying-a-house",
    ],
    intro:
      "A house asks for attention on its own schedule, and most of us learn what is due only when something fails. These guides cover what to check and when, what to record about each appliance and system, and what to do in a first week in a new place. The three start here guides are the place to begin.",
    clusters: [
      {
        title: "Keeping up with maintenance",
        blurb: "Start here for what a house needs across the year, how often, and how to note it down.",
        slugs: [
          "home-maintenance-checklist-by-month",
          "how-often-home-systems-need-servicing",
          "home-maintenance-you-skip-that-costs-the-most",
          "how-often-change-furnace-filter",
          "home-maintenance-log-template",
        ],
      },
      {
        title: "Building a home binder",
        blurb: "What to gather about the house itself so you can find it in a hurry.",
        slugs: [
          "how-to-make-a-home-binder",
          "where-is-my-water-shutoff",
          "what-to-keep-after-a-home-repair",
        ],
      },
      {
        title: "New to a house or a rental",
        blurb: "What to do, find and document when the place is newly yours or newly rented.",
        slugs: [
          "first-week-after-buying-a-house",
          "inherited-a-house-where-to-start",
          "moving-into-a-rental-what-to-document",
        ],
      },
      {
        title: "Appliances, models and warranties",
        blurb: "How to find model numbers, and what to write down when you buy something.",
        slugs: [
          "how-to-find-the-model-number-on-any-appliance",
          "what-to-record-when-you-buy-an-appliance",
          "appliance-warranties-what-to-track",
        ],
      },
      {
        title: "Getting ready for the cold months",
        blurb: "Jobs that belong to a season, and are easier to finish before the weather turns.",
        slugs: [
          "fall-home-maintenance-checklist",
          "winterize-your-house-checklist",
        ],
      },
    ],
    productSlugs: ["home-management-companion"],
  },
  {
    slug: "mind-and-focus",
    label: "Mind and focus",
    situation: "You know what to do and still cannot make yourself start.",
    inTheirWords:
      "I know exactly what I need to do. It has been on my mind for three weeks. I still cannot make myself pick up the phone and do it.",
    whatHelps: [
      "Somewhere to put a thing down that will bring it back when it actually matters.",
      "Eight walked-through procedures for the things that are hardest to start, including a hard phone call.",
      "Leaving something half finished records nothing at all. There is no streak and no score.",
    ],
    heroCta: "See how it helps you start",
    startHere: [
      "how-to-make-a-phone-call-you-have-been-avoiding",
      "task-paralysis-what-to-do-in-the-next-ten-minutes",
      "paperwork-pile-where-to-start",
    ],
    intro:
      "These guides are for the tasks you understand perfectly well and still cannot begin. They give you small first moves, ways to sort a pile that has grown, scripts for calls and messages, and routes back after you have dropped a system. The three start here guides are the place to begin. Read one, do the first step, and stop there if you need to.",
    clusters: [
      {
        title: "Starting when you are stuck",
        blurb: "Start here for a first step small enough to do in the next ten minutes.",
        slugs: [
          "task-paralysis-what-to-do-in-the-next-ten-minutes",
          "first-physical-step-20-examples",
          "executive-dysfunction-is-not-procrastination",
          "why-you-keep-thinking-about-a-task-and-not-doing-it",
          "why-to-do-lists-make-it-worse",
        ],
      },
      {
        title: "Sorting a pile that has grown",
        blurb: "How to choose a first thing when everything is late or has been put off for months.",
        slugs: [
          "paperwork-pile-where-to-start",
          "how-to-start-when-everything-is-overdue",
          "how-to-deal-with-something-you-have-put-off",
          "why-you-keep-missing-bill-due-dates",
        ],
      },
      {
        title: "Calls and messages you dread",
        blurb: "Opening lines and plain scripts for the hard phone call and the email that will not send.",
        slugs: [
          "how-to-make-a-phone-call-you-have-been-avoiding",
          "scripts-for-the-admin-calls-everyone-dreads",
          "how-to-say-no-or-give-bad-news-on-the-phone",
          "the-email-you-keep-not-sending-and-how-to-chase-a-reply",
        ],
      },
      {
        title: "Coming back after a lapse",
        blurb: "How to return to a routine or a project without starting from zero.",
        slugs: [
          "a-weekly-reset-that-survives-a-bad-week",
          "why-you-abandon-planners-and-how-to-come-back",
          "how-to-restart-a-project-you-gave-up-on",
        ],
      },
      {
        title: "Admin in a hard season",
        blurb: "For adult diagnoses, brain fog and planning when later never seems to arrive.",
        slugs: [
          "diagnosed-with-adhd-as-an-adult",
          "life-admin-with-brain-fog",
          "time-blindness-planning",
        ],
      },
    ],
    productSlugs: ["alongside"],
  },
  {
    slug: "family-and-learning",
    label: "Family and learning",
    situation: "You are teaching at home and cannot account for the year.",
    inTheirWords:
      "It is March and I could not tell you what we covered in October, or whether the fractions ever stuck. If somebody asked me to account for this year I would be guessing.",
    whatHelps: [
      "A dated record of what you actually did, built as you go rather than reconstructed later.",
      "Short checks you run at home to find out honestly whether something landed.",
      "A printable record per child, and a printed handbook that works with a pencil alone.",
    ],
    heroCta: "See what it records",
    startHere: [
      "homeschool-record-keeping-requirements-by-state",
      "simple-homeschool-record-keeping-system",
      "how-to-start-homeschooling-first-month-paperwork",
    ],
    intro:
      "Homeschooling comes with paperwork that is easy to postpone and hard to rebuild later. These guides cover the rules that apply where you live, a record system you will actually keep, attendance and weekly rhythm, and how to check that something was learned. The three start here guides are the place to begin. Rules vary by state, so confirm yours locally.",
    clusters: [
      {
        title: "Starting out and the rules",
        blurb: "Start here for what to file in the first month and where to find your state's requirements.",
        slugs: [
          "how-to-start-homeschooling-first-month-paperwork",
          "homeschool-record-keeping-requirements-by-state",
          "homeschool-notice-of-intent-explained",
        ],
      },
      {
        title: "A record system you will keep",
        blurb: "Simple layouts for records, a reading log and several children, plus how to catch up.",
        slugs: [
          "simple-homeschool-record-keeping-system",
          "homeschool-record-keeping-template",
          "homeschool-record-keeping-for-multiple-children",
          "homeschool-reading-log",
          "how-to-catch-up-on-homeschool-records",
          "how-long-to-keep-homeschool-records",
        ],
      },
      {
        title: "Attendance and the weekly rhythm",
        blurb: "Counting days and hours, and a week with room in it for the ones that go wrong.",
        slugs: [
          "do-you-have-to-count-homeschool-days-or-hours",
          "homeschool-attendance-what-to-track",
          "four-day-homeschool-week",
          "homeschool-weekly-plan-with-a-spare-day",
        ],
      },
      {
        title: "Checking what was learned",
        blurb: "Ways to test understanding at home, and what to gather for a portfolio or evaluation.",
        slugs: [
          "how-to-check-if-your-child-learned-something",
          "homeschool-subject-not-working-what-to-change-first",
          "what-goes-in-a-homeschool-portfolio",
          "preparing-for-a-homeschool-evaluation",
        ],
      },
    ],
    productSlugs: ["homeschooling-companion"],
  },
  {
    slug: "affairs-and-endings",
    label: "Affairs and endings",
    situation: "Somebody would need to find all of it, and nobody could.",
    inTheirWords:
      "If something happened to me tomorrow, nobody would know where the will is, which pension is with whom, or who to call first. I keep meaning to sort it out.",
    whatHelps: [
      "A sequenced way in, so the job has a beginning instead of being a folder of blank forms.",
      "A record of what exists and where it is kept, never the documents themselves.",
      "A printed book somebody could actually follow if they had to.",
    ],
    heroCta: "See what goes in the book",
    startHere: [
      "what-to-do-when-a-parent-dies",
      "how-to-find-someones-accounts-after-they-die",
      "the-if-something-happens-to-me-file",
    ],
    intro:
      "These guides help you get your own affairs findable, and help you when you are dealing with someone else's. They cover what to write down, who should hold which role, and the order of steps after a death. The three start here guides are the place to begin. If you are in the first days after a loss, go straight to the section on after a death.",
    clusters: [
      {
        title: "Getting your own affairs findable",
        blurb: "Start here for what to write down so someone could find it all if they had to.",
        slugs: [
          "the-if-something-happens-to-me-file",
          "what-to-write-down-in-case-something-happens-to-you",
          "life-admin-binder-what-goes-in-it",
          "hospital-for-two-weeks-what-would-someone-need-to-find",
          "which-documents-to-keep-and-where-to-put-them",
        ],
      },
      {
        title: "After a death, in order",
        blurb: "The first steps, who to tell, and how to look for a will, in the order they are usually done.",
        slugs: [
          "what-to-do-when-a-parent-dies",
          "what-to-do-when-a-parent-dies-uk",
          "who-to-tell-when-someone-dies",
          "where-to-look-for-a-will",
          "named-executor-what-you-agreed-to",
          "named-executor-what-you-agreed-to-uk",
        ],
      },
      {
        title: "Tracing accounts and access",
        blurb: "How to search for accounts, digital services and boxes when nothing was written down.",
        slugs: [
          "how-to-find-someones-accounts-after-they-die",
          "digital-accounts-after-a-death",
          "safe-deposit-box-and-spare-keys-who-can-open-it",
        ],
      },
      {
        title: "People, roles and decisions",
        blurb: "Who decides, who cares for children or pets, and how to keep forms up to date.",
        slugs: [
          "emergency-contact-and-medical-decision-maker",
          "who-would-raise-your-children-guardian-checklist",
          "what-happens-to-your-pets-if-something-happens-to-you",
          "beneficiary-forms-override-your-will",
          "talking-to-your-parents-about-their-affairs",
          "update-your-paperwork-after-a-life-change",
        ],
      },
    ],
    productSlugs: ["personal-life-affairs-companion"],
  },
  {
    slug: "travel",
    label: "Travel",
    situation: "One flight moves and you cannot remember what else it touches.",
    inTheirWords:
      "The flight moved three hours and I am standing in an airport trying to remember what else I booked around the old time. The confirmations are in six different inboxes.",
    whatHelps: [
      "Everything the trip depends on in one place, with the connections between it recorded once.",
      "Change one thing and see exactly what was built on top of it, handled one at a time.",
      "A printable trip book, blank and structured, for when the phone is at four percent.",
    ],
    heroCta: "See what one change touches",
    startHere: [
      "flight-delayed-with-a-connection-what-to-do-first",
      "travel-document-checklist",
      "flight-changed-what-else-is-affected",
    ],
    intro:
      "A trip is a chain of bookings, and one change can touch several of them. These guides cover what to do when plans move, what to carry and print before you leave, how to lay out a trip, and how to pack. The three start here guides are the place to begin. Keep the ones for a delay or loss where you can reach them offline.",
    clusters: [
      {
        title: "When plans change on the road",
        blurb: "Start here for a delay, a schedule change, a missing booking or a lost document.",
        slugs: [
          "flight-delayed-with-a-connection-what-to-do-first",
          "flight-changed-what-else-is-affected",
          "hotel-cannot-find-your-reservation",
          "lost-passport-wallet-or-phone-abroad-what-to-have-ready",
        ],
      },
      {
        title: "Documents and the days before",
        blurb: "What to carry, what to print and what to check before you leave.",
        slugs: [
          "travel-document-checklist",
          "first-international-trip-checklist",
          "what-to-keep-on-paper-when-you-travel",
          "night-before-you-travel-checklist",
        ],
      },
      {
        title: "Laying out the trip",
        blurb: "Itineraries, multi-stop plans, road trips and group travel without a tangle of tabs.",
        slugs: [
          "how-to-write-a-one-page-trip-itinerary",
          "organising-a-multi-stop-trip-without-a-spreadsheet",
          "road-trip-planning-checklist",
          "how-to-plan-a-group-trip",
        ],
      },
      {
        title: "Packing lists",
        blurb: "Lists by trip length, bag size and who is traveling.",
        slugs: [
          "packing-list-for-a-week-away",
          "carry-on-only-packing-list",
          "packing-and-planning-for-a-trip-with-kids-or-a-baby",
        ],
      },
    ],
    productSlugs: ["travel-companion"],
  },
  {
    slug: "vehicles",
    label: "Vehicles",
    situation: "You cannot remember what interval you were actually quoted, or when anything was last done.",
    inTheirWords:
      "I know I should be tracking this vehicle's maintenance, but the interval I was quoted is written on a receipt somewhere, if anywhere, and I only ever check once it becomes a problem.",
    whatHelps: [
      "Your own maintenance intervals, kept per vehicle, never a hardcoded factory schedule.",
      "One ranked view of what is due across every vehicle you own, computed from what you actually recorded.",
      "A dated, mileage-stamped document you can hand to a shop, stating what is requested today and what is not.",
    ],
    heroCta: "See how due is worked out",
    startHere: [
      "what-to-tell-a-mechanic-before-work-starts",
      "used-car-no-service-records-what-to-do",
      "what-is-due-on-my-car-right-now",
    ],
    intro:
      "Most of us cannot say when a car was last serviced or what interval a shop quoted. These guides cover working out what is due from your own records, talking to a mechanic, starting from nothing on a used car, and keeping the paperwork in order. The three start here guides are the place to begin.",
    clusters: [
      {
        title: "Working out what is due",
        blurb: "Start here to find what maintenance is due, from your manual and your own log.",
        slugs: [
          "what-is-due-on-my-car-right-now",
          "car-maintenance-by-mileage-start-with-your-manual",
          "car-maintenance-log-what-to-write-down",
          "two-cars-one-household-maintenance",
          "winter-car-prep-checklist",
        ],
      },
      {
        title: "Starting out and the shop",
        blurb: "For a car that is new to you and for the conversation before any work begins.",
        slugs: [
          "what-to-tell-a-mechanic-before-work-starts",
          "used-car-no-service-records-what-to-do",
          "first-car-checklist-for-new-drivers",
        ],
      },
      {
        title: "Paperwork and service history",
        blurb: "Renewal dates, what lives in the glove box and how to present a history when you sell.",
        slugs: [
          "car-paperwork-dates-organizer",
          "glove-box-checklist-what-to-keep",
          "selling-your-car-with-a-service-history",
        ],
      },
    ],
    productSlugs: ["vehicle-maintenance-companion"],
  },
  {
    slug: "family-health",
    label: "Family health",
    situation: "Everyone's medications and allergies live only in your own memory.",
    inTheirWords:
      "I am the one who remembers everyone's medications and allergies, and if I had to reconstruct it at an intake desk right now, I would be guessing at half of it.",
    whatHelps: [
      "Every person's allergies, medications, vaccines, doctors and insurance, entered once and changeable any time.",
      "A structured symptom timeline, onset, duration and severity as real fields, not a memory reconstructed later.",
      "The page each moment needs: a forms sheet for school and camp, a caregiver sheet, an emergency card and a visit page.",
    ],
    heroCta: "See what the forms sheet holds",
    startHere: [
      "what-goes-in-a-family-health-binder",
      "school-and-camp-health-forms-what-to-have-ready",
      "doctor-appointment-prep-checklist",
    ],
    intro:
      "Anyone who keeps the family's health details in their head is one busy morning from guessing at an intake desk. These guides cover what to record for each person, how to prepare for a visit, and what to hand to a sitter, school or relative. They are for organizing information, not for medical advice. The three start here guides are the place to begin.",
    clusters: [
      {
        title: "Building the family health binder",
        blurb: "Start here for what to record once about each person, and where it lives.",
        slugs: [
          "what-goes-in-a-family-health-binder",
          "medication-list-what-to-write-down",
          "emergency-contact-information-sheet",
        ],
      },
      {
        title: "Getting ready for a doctor visit",
        blurb: "Checklists for the day before, a new practice, your questions and your symptom notes.",
        slugs: [
          "doctor-appointment-prep-checklist",
          "new-doctor-intake-what-to-bring",
          "questions-to-bring-to-the-doctor",
          "symptom-notes-for-a-doctor-visit",
        ],
      },
      {
        title: "Handing information to someone else",
        blurb: "What to give a school, a camp, a sitter or a relative, and what to leave off.",
        slugs: [
          "school-and-camp-health-forms-what-to-have-ready",
          "babysitter-and-grandparent-info-sheet",
          "what-to-leave-off-a-health-page-you-hand-over",
          "caring-for-a-parent-and-kids-one-place",
        ],
      },
    ],
    productSlugs: ["family-health-binder"],
  },
];

export function getAreaBySlug(slug: string): LifeArea | undefined {
  return LIFE_AREAS.find((area) => area.slug === slug);
}

/** Which area a product belongs to, for cross-linking from a product page back to its shelf. */
export function getAreaForProduct(productSlug: string): LifeArea | undefined {
  return LIFE_AREAS.find((area) => area.productSlugs.includes(productSlug));
}
