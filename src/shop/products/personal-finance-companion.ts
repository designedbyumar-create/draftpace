import type { ShopProductInput } from "../definition";

/**
 * Personal Finance Companion's real public Shop listing. Before this file
 * existed, this product's own definition.ts documented that its entire
 * release gate was the absence of this file: creating it is what makes
 * /shop/personal-finance-companion resolve and the product reachable by a
 * real customer for the first time. See docs/SHOP.md and
 * docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md.
 *
 * $28 launch price, $35 regular. The fifth of the seven paid products to
 * get a real price, see the pricing plan's Phase 5. purchaseAction.href
 * stays intentionally omitted: with no href and access "paid", GetAction
 * already renders the correct "Checkout opens soon" pending state rather
 * than a dead or fake link, exactly the mechanism this listing needs
 * until LEMON_SQUEEZY_PFC_CHECKOUT_URL is set, which this phase
 * deliberately leaves alone.
 */
export const personalFinanceCompanionShopProduct: ShopProductInput = {
  id: "personal-finance-companion",
  slug: "personal-finance-companion",
  publicationStatus: "published",
  title: "Personal Finance Companion",
  promise:
    "One always-current picture of your accounts, income, bills, subscriptions, transactions, debt, and savings, with exactly one useful next move at a time.",
  problem:
    "Money information is scattered across bank apps, statements, memory, and habit. Nothing tells you, in one place, what is actually available to spend right now, what is coming due, or what quietly changed. A spreadsheet only knows what you remembered to update.",
  audience: [
    "You have more than one account, bill, or income source and want them tracked in one real place, not five apps.",
    "You want a next step handed to you, not a dashboard you have to interpret yourself every time.",
    "You are fine entering your own numbers in exchange for a picture that is always current, not a guess.",
  ],
  audienceExclusions: [
    "You want automatic bank syncing. Everything here is entered by you, on purpose, so nothing reads your real bank credentials.",
    "You want investment tracking or tax preparation. This is day-to-day money awareness, not a portfolio tool.",
    "You want the app to tell you how to spend. It shows the picture and the next useful move; the decisions stay yours.",
  ],
  // Emptied by the content collapse: each objection was answered again in
  // faqs a few hundred pixels below, and the Shop page rendered both.
  // Both now live in `questions`, answered once each.
  objections: [],
  // Emptied by the content collapse: all four were near-verbatim copies
  // of a problemsSolved solution, rendered separately on the Shop page
  // and again in the Library manual.
  outcomes: [],
  problemsSolved: [
    {
      problem: "Your money is scattered across bank apps, statements, memory, and habit.",
      solution: "One dominant Available Money figure you can actually trust, with the full breakdown one tap away.",
    },
    {
      problem: "You only find out something's wrong after it's already become a problem.",
      solution:
        "A real Attention inbox: only genuine gaps in your own records, never a fabricated task to make the list look useful.",
    },
    {
      problem: "You can't tell if a number reflects your real bank balance or just your own tracking.",
      solution:
        "Debt and Savings you can optionally link to the account that holds them, without ever mixing up a linked balance with a goal you're tracking by hand.",
    },
    {
      problem: "Reviewing a statement means re-entering everything by hand.",
      solution: "Import a bank statement, a note, or a CSV, and review what changed before it becomes part of your picture.",
    },
    {
      problem: "You split bills with somebody and neither of you can remember what was actually squared up last time.",
      solution:
        "Mark a bill or subscription shared, set your share of it, and tick it settled when it is genuinely settled. A generated statement says what is settled and what is still owed.",
    },
  ],
  howItWorks: [
    "Add what you have across the seven areas: accounts, income, bills, subscriptions, transactions, debt, and savings. Skip anything you do not have yet.",
    "The Companion asks about one area at a time and only continues once it has enough to be useful, never a giant form up front.",
    "Available Money and every other figure recompute live from exactly what you have entered, with a full breakdown behind each one.",
    "Attention surfaces only real gaps: a bill missing a due date, a balance that has gone stale. Fix the record and the item clears itself.",
    "Mark any bill or subscription shared, say what share of it is yours, and tick it settled when it actually is. A statement you can print says what has and has not been squared up.",
    "Come back anytime. The Companion resumes exactly where you left off; nothing is ever lost between visits.",
  ],
  access: "paid",
  // Launch pricing, Phase 5 of the pricing plan: $29 actual, marked up
  // 20% to a $35 regular price, then a net 20% off (30% off, netted
  // down by 10 points) for the $28 this actually charges today.
  // Priced as a lifetime licence at a standing 50% off the list price.
  // The list price is what the product is worth to somebody who needs it;
  // the discount is the launch position, not a countdown. These two
  // numbers must match the Lemon Squeezy variant exactly, or a customer
  // reads one figure and is charged another.
  price: { amount: 49, currency: "USD" },
  compareAtPrice: { amount: 99, currency: "USD" },
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "All seven areas: accounts, income, bills, subscriptions, transactions, debt, and savings",
    "The guided Companion, plus direct access to every area for a quick edit",
    "A real Attention inbox derived from your own records, never fabricated",
    "\"How Draftpace got this\" breakdowns on every figure",
    "Optional account linking for debt and savings, without ever deriving a goal from a linked balance",
    "Paste-notes, text file, and CSV import with a review step before anything is confirmed",
    "Shared Responsibility: a per-bill shared flag and split, a manually ticked settled date, and a generated statement of what is settled and what is still owed",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "Your accounts and their current balances",
    "Income sources, expected or received",
    "Bills and subscriptions, with amounts and due dates",
    "Transactions as they happen, or imported from a statement",
    "Debt and savings goals, optionally linked to an account",
  ],
  expectedOutputs: [
    "An Available Money figure, explained line by line",
    "One dominant next action at a time",
    "A real Attention inbox of genuine gaps",
    "A complete, always-current financial picture across all seven areas",
    "A printable statement of what you and the person you split bills with have and have not settled",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so it is there if you come back on something else.",
  privacyNotes:
    "Your financial entries are private to your account. Draftpace does not sell your data or use it for advertising, and never reads your real bank credentials. This is a planning aid, not financial advice.",
  faqs: [],

  /**
   * Every worry, asked once, tagged with the moment it matters. Three
   * objections and five faqs collapsed to eight questions: "seven
   * categories sounds like a lot of setup" and "what if I only use some
   * of the seven areas" were the same question before and after buying,
   * so it is one question tagged with both stages.
   */
  questions: [
    {
      question: "Worried it becomes another app you stop opening?",
      answer:
        "It opens on exactly one next action, worked out from what is actually missing or overdue in your own records. There is no list demanding a full review before it will tell you anything.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does seven areas mean a lot of setup before it is any use?",
      answer:
        "Nothing is required. Add what you have, skip what you do not, and add the rest later from Settings without starting over. The Companion asks about one area at a time and stops as soon as it has enough to be useful.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Can you trust a number you cannot see the math behind?",
      answer:
        "Every figure has a \"How Draftpace got this\" breakdown, line by line, from your own records. Nothing here is a guess dressed up as a number.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Does it connect to my bank?",
      answer:
        "No. You add the numbers yourself. It never reads your bank account, your card, or your credentials, because there is no connection to read them through.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this a one-time purchase or a subscription?",
      answer: "One time. You pay once and keep it, the same as every paid product on Draftpace unless a listing says otherwise.",
      stage: ["deciding"],
    },
    {
      question: "How is linking a debt or savings goal to an account different from tracking it by hand?",
      answer:
        "Linking is optional and purely a reference. A savings goal's progress is always what you recorded toward it, never derived from the linked account's balance, so a linked figure can never quietly become your goal.",
      stage: ["owning"],
    },
    {
      question: "Does marking a bill shared involve the other person's account?",
      answer:
        "No. Shared is a flag on your own record, with your share of it as a percentage. The other person never gets a login, and settled is something you tick yourself, never something worked out for you.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your figures save privately and follow you to whatever device you next sign in on.",
      stage: ["deciding"],
    },
  ],

  /**
   * How people describe this before they know a product like this exists.
   * Sourced, not invented: the subscriptions and scattered-finances
   * PROBLEM_ENTRIES clusters in src/content/askdp.ts, plus the titles of
   * money guides already written from the same research.
   */
  searchedProblems: [
    {
      phrase: "My finances are scattered across too many apps",
      answer:
        "One place holding accounts, income, bills, subscriptions, transactions, debt and savings, with a single figure for what is actually available.",
    },
    {
      phrase: "I keep getting charged for subscriptions I forgot about",
      answer:
        "Subscriptions are their own area, with amounts and renewal dates, and a missing renewal date shows up in Attention rather than being quietly ignored.",
    },
    {
      phrase: "I have no idea where my money went",
      answer:
        "Transactions you enter or import, reviewed before anything joins your picture, so what you are looking at is what actually happened.",
    },
    {
      phrase: "How do couples split bills without arguing about it",
      answer:
        "A shared flag and your share on each bill, a settled tick you control, and a statement you can both read that says what is squared up.",
    },
    {
      phrase: "I need to sort out my finances after a move or a job change",
      answer:
        "Add what is true now. Every figure recomputes from your own records, so a changed situation does not mean rebuilding a spreadsheet.",
    },
    {
      phrase: "My spreadsheet is out of date and I do not trust it",
      answer:
        "Attention names the specific stale or missing record, so bringing it current is a short list of real gaps rather than a full audit.",
    },
  ],

  /**
   * What an owner opens the manual to do, each row linking to the screen
   * it happens on.
   */
  tasks: [
    {
      label: "See what's actually available to spend",
      answer: "Overview opens on Available Money, with the line-by-line breakdown one tap away.",
      destination: "workspace",
    },
    {
      label: "Find out what needs fixing in my records",
      answer: "Attention lists only genuine gaps: a bill with no due date, a balance that has gone stale. Fixing the record clears the item.",
      destination: "attention",
    },
    {
      label: "Split a bill with somebody and keep track of it",
      answer: "Open the bill, mark it shared and set your share. Tick settled when it genuinely is, and the date is kept.",
      destination: "bills",
    },
    {
      label: "Print what we have and haven't settled",
      answer: "The Shared Responsibility statement lists every shared bill and subscription with its settled state.",
      destination: "printables",
    },
    {
      label: "Bring in a bank statement without retyping it",
      answer: "Paste it, upload a text file or a CSV, then review every change before any of it joins your picture.",
      destination: "records",
    },
    {
      label: "Stop tracking an area I don't use",
      answer: "Nothing is required. Leave an area empty, or add it later from Settings when it becomes relevant.",
      destination: "settings",
    },
  ],

  relatedGuideSlugs: [],
  relatedProductSlugs: ["monthly-money-reset", "personal-life-affairs-companion", "alongside"],
  needGroups: ["getting-organized"],
  seo: {
    title: "Personal Finance Companion: your always-current money picture",
    description:
      "Accounts, income, bills, subscriptions, transactions, debt, and savings, in one always-current picture with exactly one useful next move at a time.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
