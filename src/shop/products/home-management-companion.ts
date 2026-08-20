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
 * price is deliberately omitted (TODO_SET_REAL_PRICE), same convention as
 * PFC: formatPrice() renders "Price not yet set" rather than a fabricated
 * $0.00, and GetAction renders "Checkout opens soon" until
 * LEMON_SQUEEZY_HMC_CHECKOUT_URL is set.
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
  objections: [
    {
      worry: "Worried it becomes another app nagging you with a list?",
      answer:
        "It shows one or two things worth your attention and says so in a sentence. When nothing needs you, it tells you your home is in good shape and leaves it there. A screen that always has something on it is a screen you stop believing.",
    },
    {
      worry: "Think setting this up sounds like an evening you do not have?",
      answer:
        "Setup is tapping what you have from a list, not typing. It comes with a printable book you can carry round the house to gather model numbers away from a screen, and you can stop at any point. One water heater with a date on it is already worth more than forty blank rows.",
    },
    {
      worry: "Not sure it can know how often anything is really due?",
      answer:
        "It knows because somebody wrote it down: a hand-built list of 121 kinds of thing found in homes and the care each one needs, including which jobs belong to which month. Nothing is inferred by a model, and every date it shows traces to something you entered.",
    },
    {
      worry: "Already behind on everything and expecting to be told so?",
      answer:
        "It never says overdue and never keeps score. A job you have not done yet is described by when it was last done and how often it usually comes round, and you can push anything back without it counting against you.",
    },
  ],
  outcomes: [
    "One page that answers whether anything needs you, in a sentence, instead of a dashboard you have to interpret.",
    "The expensive, forgettable jobs raised before they become repairs: the filter, the flush, the gutters, the shutoff you have never located.",
    "Seasonal work raised in the month it belongs to, not three hundred and sixty five days after you last thought about it.",
    "A record of who came out, what they did, and what it cost, so the question three years from now has an answer.",
    "The two-in-the-morning facts written down once: where the water shuts off, how many turns, and which tool it takes.",
  ],
  howItWorks: [
    "Tell it whether you own or rent, then tap what your home has. Twelve areas, from the kitchen and the boiler to the garden, damp and pests, and the papers.",
    "It suggests the care each one usually needs and you untick anything that does not apply. Nothing is created without you confirming it.",
    "Already have notes somewhere? Paste them in and it will pull out what it recognises for you to confirm, line by line.",
    "Home shows what needs you now, what is coming up, and what has recently been handled. When there is nothing, it says so.",
    "When something is worth doing you can act on it or push it back. Acting records what actually happened: who did it, what it cost, and anything worth remembering next time.",
    "Something broken rather than due? Say what is wrong in a sentence and it works out what you mean and treats it as its own kind of problem.",
  ],
  access: "paid",
  // TODO_SET_REAL_PRICE: no price object yet, see the file doc comment.
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "The twelve areas of a home: kitchen, laundry, heating and cooling, water, power, safety, structure, grounds and garden, pests and damp, everyday things, papers, and renting",
    "A hand-built care schedule covering 121 kinds of thing, including the jobs that belong to a season rather than a timer",
    "The Home Survey: a printable book in US Letter and A4, for gathering what you own away from a screen",
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
    "A sentence about your home's condition, and one or two things worth doing",
    "Care and seasonal work raised when it is due, never a permanent list",
    "A history of what has been done, by whom, and what it cost",
    "A printable survey of your home you can fill in by hand",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so it is there if you come back on something else.",
  privacyNotes:
    "Your home records are private to your account. Draftpace does not sell your data or use it for advertising, and nothing here is read by an AI model. Home Base is a tracking aid, not a substitute for your manuals or a professional inspection, and anything involving gas, electricity, structure or water is a job for somebody qualified. Deliberately, it is not a place to keep passwords or alarm codes.",
  faqs: [
    {
      question: "Is this a one-time purchase or a subscription?",
      answer: "One time. You pay once and keep it, the same way every paid product on Draftpace works unless a listing says otherwise.",
    },
    {
      question: "Does it scan receipts or warranty cards automatically?",
      answer:
        "No. You add the details yourself, on purpose. There is no camera scan, no document upload, and no AI reading your paperwork.",
    },
    {
      question: "Is this useful if I rent?",
      answer:
        "Yes, and it adjusts. Tell it you rent and it stops asking about the roof and the gutters and starts asking about the things that cost a renter money: the notice deadline, the deposit, and what you reported to the landlord and when.",
    },
    {
      question: "What if I only enter a few things at first?",
      answer:
        "That is the expected way to use it. It works from whatever you have given it and never demands a complete picture before it will say anything useful.",
    },
    {
      question: "How does it decide what to show me?",
      answer:
        "By how much it would cost you to leave it: how serious the consequence is, how far past its usual point it has gone, and how much work it is. A smoke alarm outranks a dusty vent, and it will say why.",
    },
    {
      question: "Can I use it with my partner or a housemate?",
      answer: "Not yet. Home Base is built around a single account for now, and there is no sharing or assigning between people.",
    },
    {
      question: "Can I track more than one property?",
      answer: "Not yet. Home Base is built around a single home for now.",
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your home records save privately and follow you across devices.",
    },
  ],
  relatedGuideSlugs: [],
  relatedProductSlugs: ["personal-finance-companion"],
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
