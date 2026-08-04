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
  objections: [
    {
      worry: "Worried you'll abandon it like the others?",
      answer:
        "It does the keeping-up, so you don't have to. There's no daily ritual to maintain and nothing to fall behind on between check-ins.",
    },
    {
      worry: "Think a template can't fit your situation?",
      answer:
        "It asks about your situation and shows only what matters. Anything that wouldn't change your picture never shows up.",
    },
    {
      worry: "Afraid it'll judge you?",
      answer:
        "It's not a budget. Just a clear, calm picture, with no lectures and no shame for a rough week. When you fall behind it asks what changed, not why.",
    },
  ],
  outcomes: [
    "A single, trustworthy Safe-to-Spend figure that updates as the month goes on.",
    "Bills that stay protected whether they're paid yet or not, so the number never assumes money you actually owe.",
    "A short weekly check-in that keeps the picture accurate without turning into a chore.",
    "A calm way back in if you've been away for a while, no overdue-task pileup waiting for you.",
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
  media: [
    {
      src: "/products/monthly-money-reset/preview.png",
      alt: "Monthly Money Reset's This Month view, showing a Safe to Spend Now figure of $600.00, a weekly amount, a next-move check-in prompt, and a breakdown of protected bills and upcoming bills.",
    },
  ],
  compatibility: ["Works in any modern browser", "No download required", "Works on phone, tablet, or desktop"],
  inclusions: [
    "The full Safe-to-Spend calculation, with an expandable breakdown of every number that feeds into it",
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
    "A weekly spending guide",
    "One recommended next action at a time",
    "A closing summary each time you finish a month",
  ],
  savingBehavior:
    "Everything saves to your account automatically as you go. It's tied to your sign-in, not this device, so it's there if you come back on something else.",
  privacyNotes:
    "Your financial entries are private to your account. Draftpace doesn't sell your data or use it for advertising. This is a planning aid, not financial advice.",
  faqs: [
    {
      question: "Is this actually free, not a trial?",
      answer:
        "Yes. There's no payment step, no card required, and no time limit. It's a complete, narrower tool, not a crippled preview of something bigger.",
    },
    {
      question: "Does it connect to my bank?",
      answer: "No. You add the numbers yourself. Nothing here reads your bank account or card transactions.",
    },
    {
      question: "What happens if I don't open it for a few weeks?",
      answer:
        "Your information is exactly as you left it. You'll see a short recovery step asking what's changed, not a wall of overdue tasks.",
    },
    {
      question: "Do I need an account?",
      answer: "Yes, a free Draftpace account, so your information saves privately and follows you across devices.",
    },
    {
      question: "Can I use more than one currency?",
      answer:
        "Each month uses one currency you choose, and a wide range are supported. There's no automatic conversion between currencies.",
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
