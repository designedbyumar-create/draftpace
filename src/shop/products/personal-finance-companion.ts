import type { ShopProductInput } from "../definition";

/**
 * Personal Finance Companion's real public Shop listing. Before this file
 * existed, this product's own definition.ts documented that its entire
 * release gate was the absence of this file: creating it is what makes
 * /shop/personal-finance-companion resolve and the product reachable by a
 * real customer for the first time. See docs/SHOP.md and
 * docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md.
 *
 * price is deliberately omitted (TODO_SET_REAL_PRICE): the founder hasn't
 * set one yet, and formatPrice() in shop/[productSlug]/page.tsx already
 * renders "Price not yet set" for a paid product with no price, rather
 * than a fabricated $0.00 that would read as free. purchaseAction.href is
 * also intentionally omitted: with no href and access "paid", GetAction
 * already renders the correct "Checkout opens soon" pending state rather
 * than a dead or fake link, exactly the mechanism this listing needs
 * until LEMON_SQUEEZY_PFC_CHECKOUT_URL is set.
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
  objections: [
    {
      worry: "Worried it becomes another app you stop opening?",
      answer:
        "It leads with exactly one dominant next action, derived from what is actually missing or overdue, never a to-do list demanding a full review every time you open it.",
    },
    {
      worry: "Think seven categories sounds like a lot of setup?",
      answer:
        "The guided Companion asks one thing at a time and adapts to what you already have. Skip anything you do not need; add it later from Settings without starting over.",
    },
    {
      worry: "Not sure a number you cannot see the math behind is trustworthy?",
      answer:
        "Every figure has a \"How Draftpace got this\" breakdown, line by line, from your own records. Nothing here is ever a guess dressed up as a number.",
    },
  ],
  outcomes: [
    "One dominant Available Money figure you can actually trust, with the full breakdown one tap away.",
    "A real Attention inbox: only genuine gaps in your own records, a missing due date or a stale balance, never a fabricated task.",
    "Debt and Savings you can optionally link to the account that holds them, without ever mixing up a linked balance with a goal you are tracking by hand.",
    "Import a bank statement, a pasted note, or a CSV, and review what changed before anything becomes part of your picture.",
  ],
  howItWorks: [
    "Add what you have across the seven areas: accounts, income, bills, subscriptions, transactions, debt, and savings. Skip anything you do not have yet.",
    "The Companion asks about one area at a time and only continues once it has enough to be useful, never a giant form up front.",
    "Available Money and every other figure recompute live from exactly what you have entered, with a full breakdown behind each one.",
    "Attention surfaces only real gaps: a bill missing a due date, a balance that has gone stale. Fix the record and the item clears itself.",
    "Come back anytime. The Companion resumes exactly where you left off; nothing is ever lost between visits.",
  ],
  access: "paid",
  // TODO_SET_REAL_PRICE: no price object yet, see the file doc comment.
  media: [],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "All seven areas: accounts, income, bills, subscriptions, transactions, debt, and savings",
    "The guided Companion, plus direct access to every area for a quick edit",
    "A real Attention inbox derived from your own records, never fabricated",
    "\"How Draftpace got this\" breakdowns on every figure",
    "Optional account linking for debt and savings, without ever deriving a goal from a linked balance",
    "Paste-notes, text file, and CSV import with a review step before anything is confirmed",
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
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It is tied to your sign-in, not this device, so it is there if you come back on something else.",
  privacyNotes:
    "Your financial entries are private to your account. Draftpace does not sell your data or use it for advertising, and never reads your real bank credentials. This is a planning aid, not financial advice.",
  faqs: [
    {
      question: "Is this a one-time purchase or a subscription?",
      answer: "One time. You pay once and keep it, the same way every paid product on Draftpace works unless a listing says otherwise.",
    },
    {
      question: "Does it connect to my bank?",
      answer: "No. You add the numbers yourself. Nothing here reads your bank account or card transactions directly.",
    },
    {
      question: "What happens if I only use some of the seven areas?",
      answer: "Nothing is required. Skip what you do not have, and add it later from Settings whenever it becomes relevant.",
    },
    {
      question: "How is linking a debt or savings goal to an account different from tracking it manually?",
      answer:
        "Linking is optional and purely a reference. Your Savings Goal's progress is always what you have manually recorded toward it, never derived from the linked account's balance.",
    },
    {
      question: "Do I need a Draftpace account?",
      answer: "Yes, so your financial information saves privately and follows you across devices.",
    },
  ],
  relatedGuideSlugs: [],
  relatedProductSlugs: ["monthly-money-reset"],
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
