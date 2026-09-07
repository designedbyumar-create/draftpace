import type { ShopProductInput } from "../definition";

/**
 * Monthly Money Reset's real public Shop listing. Kept in sync with
 * src/products/monthly-money-reset/definition.ts in spirit (same product,
 * same promise), but deliberately a separate model. See docs/SHOP.md and
 * docs/products/MONTHLY-MONEY-RESET.md.
 */
export const monthlyMoneyResetShopProduct: ShopProductInput = {
  id: "monthly-money-reset",
  slug: "monthly-money-reset",
  publicationStatus: "published",
  title: "Monthly Money Reset",
  promise: "See what is safe to spend this month, protect what must be paid, and know the next useful move.",
  problem:
    "You have money in an account, income arriving at different times, bills that must be protected, ordinary spending, and an amount you'd rather not touch. It's hard to know, at a glance, what's actually free to spend without doing the math yourself every time.",
  audience: [
    "You want one clear number for what's actually safe to spend, not a full budget system.",
    "You have a mix of bills, some paid automatically and some not, that you'd rather not accidentally spend past.",
    "You're fine adding a few numbers each month in exchange for not having to track everything mentally.",
  ],
  audienceExclusions: [
    "You want automatic bank syncing or transaction import. Everything here is entered by you, on purpose.",
    "You're looking for a full year-long budget or investment planning tool. This is one month at a time.",
    "You want the system to tell you what to do with your money. It shows you the picture; the decisions stay yours.",
  ],
  // Emptied by the content collapse: every objection was answered again a
  // few hundred pixels below in faqs, and the Shop page rendered both.
  // Both now live in `questions`, each answered once, tagged with the
  // moment it matters. See src/shop/definition.ts.
  objections: [],
  // Emptied by the content collapse: all four of these restated a
  // problemsSolved solution almost word for word, and the Shop page and
  // the Library manual rendered them separately, so the same sentence was
  // read twice.
  outcomes: [],
  problemsSolved: [
    {
      problem: "You don't know what's actually safe to spend without doing the math yourself, every time.",
      solution: "A single Safe-to-Spend figure that updates as the month goes on, no mental math required.",
    },
    {
      problem: "A bill you haven't paid yet still feels like money you have.",
      solution:
        "Protected bills stay held back whether they're paid or not, so the number never assumes money you actually owe.",
    },
    {
      problem: "Staying on top of it usually turns into a chore, or gets abandoned by month two.",
      solution:
        "A short weekly check-in keeps the picture accurate, and a quiet way back in if you've been away, no overdue pile-up waiting.",
    },
    {
      problem: "The month looks fine on average and still goes wrong on one particular day.",
      solution:
        "The tightest day this cycle, named with its date and the amount you'd be down to, worked out from the bill and income dates you already entered.",
    },
  ],
  howItWorks: [
    "Add the money available right now, along with any bills you need to protect and anything you'd rather not spend.",
    "Add income you're still expecting. It only counts toward Safe-to-Spend once you mark it received.",
    "Use Quick Add as the month goes on to record spending, mark a bill paid, or set money aside.",
    "Do a short weekly check-in to confirm nothing's missing.",
    "Close the month when you're ready. Recurring bills and income carry into the next one; everything else starts fresh.",
  ],
  access: "free",
  purchaseAction: { label: "Add free to my library", href: "/app/activate/monthly-money-reset" },
  // Only used by the Store list's small thumbnail (ProductVisual in
  // shop/page.tsx). The product page itself uses bespoke mobile mockups
  // (monthlyMoneyResetVisuals.tsx), not this screenshot.
  media: [
    {
      src: "/products/monthly-money-reset/preview.png",
      alt: "Monthly Money Reset's This Month view, showing a Safe to Spend Now figure of $600.00, a weekly amount, a next-move check-in prompt, and a breakdown of protected bills and upcoming bills.",
    },
  ],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "The full Safe-to-Spend calculation, with an expandable breakdown of every number that feeds into it",
    "The tightest day this cycle, shown beside Safe-to-Spend whenever your balance dips before it recovers",
    "Unlimited bills, income sources, and spending groups",
    "Weekly check-ins and a rule-based next action",
    "Month close with carry-forward into the next cycle",
    "A private, real account, not a shared demo",
  ],
  expectedInputs: [
    "The money available in your account right now",
    "Bills you want protected, with amounts and due dates",
    "Income you're still expecting this month",
    "Spending and other activity as it happens",
  ],
  expectedOutputs: [
    "A Safe-to-Spend amount, explained line by line",
    "The date this cycle runs tightest, and what you'd be down to on it",
    "A weekly spending guide",
    "One recommended next action at a time",
    "A closing summary each time you finish a month",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It's tied to your sign-in, not this device, so it's there if you come back on something else.",
  privacyNotes:
    "Your financial entries are private to your account. Draftpace doesn't sell your data or use it for advertising. This is a planning aid, not financial advice.",
  faqs: [],

  /**
   * Every worry, asked once, tagged with the moment it matters. Three
   * objections and five faqs collapsed to seven questions: "worried
   * you'll abandon it like the others" and "what happens if I don't open
   * it for a few weeks" were the same fear asked from two directions, so
   * they are one question now.
   *
   * The Shop page shows the deciding half; the Library manual shows the
   * owning half, because somebody who already has it does not need the
   * pitch answered again.
   */
  questions: [
    {
      question: "Worried you'll abandon it like every other budgeting app?",
      answer:
        "There is no daily ritual here and nothing to fall behind on. Leave it for a month and your figures are exactly as you left them: you get one short question about what changed, never a wall of overdue tasks.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Think a template can't fit your situation?",
      answer:
        "It asks about your situation and shows only what changes your picture. Anything that wouldn't move the number never appears.",
      stage: ["deciding"],
    },
    {
      question: "Afraid it'll judge you for a rough month?",
      answer:
        "It is not a budget and there is no score. When you fall behind it asks what changed, not why, and nothing in it compares one month against another.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Is this actually free, not a trial?",
      answer:
        "Free. No payment step, no card, no time limit. It is a complete, narrower tool, not a crippled preview of a paid one.",
      stage: ["deciding"],
    },
    {
      question: "Does it connect to my bank?",
      answer:
        "No. You add the numbers yourself. Nothing here reads your bank account, your card, or your transactions, and there is no provider it could read them through.",
      stage: ["deciding", "owning"],
    },
    {
      question: "Do I need an account?",
      answer:
        "Yes, a free Draftpace account, so your figures save privately and follow you to whatever device you next open them on.",
      stage: ["deciding"],
    },
    {
      question: "Can I use more than one currency?",
      answer:
        "Each cycle uses one currency you choose, from a wide list. There is no automatic conversion between currencies, so a cycle never silently mixes two.",
      stage: ["deciding", "owning"],
    },
  ],

  /**
   * How people describe this before they know a product like this exists.
   * Sourced, not invented: every phrase is a researched alias from the
   * budgeting PROBLEM_ENTRIES cluster in src/content/askdp.ts, or the
   * title of a money guide already written from the same research.
   */
  searchedProblems: [
    {
      phrase: "I hate budgeting and I've tried everything",
      answer:
        "This is not a budget. It is one number for what is safe to spend, with nothing to categorise and no plan to stick to.",
    },
    {
      phrase: "I tried YNAB or Mint and gave up",
      answer:
        "Those ask you to keep a whole system current. This asks for a few figures and does the keeping-up itself, so there is nothing to fall behind on.",
    },
    {
      phrase: "How much of my money is actually safe to spend",
      answer:
        "One figure, updated as the cycle goes on, with every number that feeds it shown line by line if you want to check the working.",
    },
    {
      phrase: "My balance says I have money but a bill is coming",
      answer:
        "Bills you protect are held back whether they are paid yet or not, so the figure never counts money you already owe.",
    },
    {
      phrase: "Why do budgeting apps stop working after two months",
      answer:
        "Because they need daily upkeep. This one has a short weekly check-in and a quiet way back in when you have been away for weeks.",
    },
    {
      phrase: "I don't know if I can afford this before I buy it",
      answer:
        "Safe-to-Spend answers exactly that, and the tightest day this cycle tells you whether the money is really there or just there today.",
    },
  ],

  /**
   * What somebody who already has this opens the manual to do. Each row
   * links straight to the screen it happens on, because the answer to
   * "how do I do this" is being taken there.
   */
  tasks: [
    {
      label: "Find out what's safe to spend right now",
      answer: "This Month opens on the figure, with the full breakdown one tap away if you want to check it.",
      destination: "workspace",
    },
    {
      label: "Protect a bill so I don't spend past it",
      answer: "Add it with its amount and due date. It is held back from Safe-to-Spend from that moment, paid or not.",
      destination: "setup",
    },
    {
      label: "Record what I spent",
      answer: "Quick Add on This Month takes a spend, a bill marked paid, or money set aside, without leaving the screen.",
      destination: "workspace",
    },
    {
      label: "See which day this cycle runs tightest",
      answer: "It sits beside Safe-to-Spend with its date, whenever your balance dips before it recovers.",
      destination: "workspace",
    },
    {
      label: "Close the month and start the next one",
      answer: "Recurring bills and income carry forward. Everything else starts clean, and the closed month stays readable.",
      destination: "progress",
    },
    {
      label: "Come back after weeks away",
      answer: "One short question about what changed, then you are current again. Nothing is marked overdue in the meantime.",
      destination: "workspace",
    },
  ],

  relatedGuideSlugs: [],
  relatedProductSlugs: [],
  needGroups: ["getting-organized"],
  seo: {
    title: "Monthly Money Reset: a free monthly Companion",
    description:
      "See what's safe to spend this month, protect what must be paid, and know the next useful move. Free, no card required.",
  },
  structuredDataEligible: true,
  availability: "available",
  devFixture: false,
};
