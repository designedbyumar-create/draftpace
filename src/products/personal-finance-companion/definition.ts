import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Personal Finance Companion — the foundation-stage registration for the
 * paid product defined in full by the launch specification (see
 * docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md for the
 * reconciliation this registration is built from).
 *
 * Follows hidden-access-test's exact "real but unreleased" pattern
 * (src/products/hidden-access-test/definition.ts): devFixture is false
 * (a real product, registered in every environment, not excluded from
 * production the way a framework-testing fixture is), access.model is
 * "paid", and — critically — there is deliberately no
 * src/shop/products/personal-finance-companion.ts entry, so /shop never
 * lists it and /shop/personal-finance-companion 404s. That is the entire
 * release-gating mechanism for this stage (launch spec phase 12): no new
 * gating infrastructure was built, because none was needed. The only way
 * in is a manual grant_admin_product call (service-role only), exactly
 * like hidden-access-test.
 *
 * cycleModel is "continuous": unlike Monthly Money Reset, this product has
 * no monthly reset concept — exactly one instance ever, found by most
 * recently created rather than by matching today's cycle key. See
 * src/product-framework/definition.ts's productCycleModelSchema comment.
 */
export const personalFinanceCompanionDefinition: ProductDefinitionInput = {
  id: "personal-finance-companion",
  slug: "personal-finance-companion",
  title: "Personal Finance Companion",
  tagline: "See what is safe to spend, what is coming due, and what actually happened with your money — one place, always current.",
  family: "companion",
  version: "0.1.0",
  status: "draft",
  access: { model: "paid" },
  cycleModel: "continuous",
  // Provisional: reuses Draftpace's own neutral brand icons/colors for
  // local installability testing only, per the explicit instruction not
  // to invent final product artwork this session. Real icon assets and
  // final theme/background colors are a separate, later decision — see
  // docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md's PWA section.
  pwa: {
    name: "Personal Finance Companion",
    shortName: "Finance",
    description: "Personal Finance Companion by Draftpace: accounts, income, bills, subscriptions, transactions, debt, and savings, in one always-current picture.",
    themeColor: "#0e6e75",
    backgroundColor: "#f4f2ec",
    icons: [
      { src: "/logo/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    provisionalBranding: true,
  },
  capabilities: ["companion.context", "companion.next-action"],
  navigation: [
    "start",
    "setup",
    "workspace",
    "accounts",
    "income",
    "bills",
    "subscriptions",
    "transactions",
    "debt",
    "savings",
    "setup-centre",
    "history",
    "settings",
  ],
  // Once setup is complete, every direct section plus the Setup Centre is
  // always reachable — matching the launch spec's information architecture
  // (section 5: each direct section is "independently reachable", the
  // Setup Centre is "the returning user's management surface"). Start and
  // Setup recede to secondary/contextual, matching Monthly Money Reset's
  // own primaryNavigation override for the identical reason.
  primaryNavigation: [
    "workspace",
    "accounts",
    "income",
    "bills",
    "subscriptions",
    "transactions",
    "debt",
    "savings",
    "setup-centre",
    "history",
    "settings",
  ],
  workspaceLabel: "Workspace",
  startRoute: "start",
  setup: {
    required: false,
    skippable: true,
    completedLabel: "Add another source",
  },
  modules: [
    { id: "personal-finance-companion.companion", destination: "start" },
    { id: "personal-finance-companion.workspace", destination: "workspace" },
    { id: "personal-finance-companion.settings", destination: "settings" },
    { id: "personal-finance-companion.setup", destination: "setup" },
    { id: "personal-finance-companion.accounts", destination: "accounts" },
    { id: "personal-finance-companion.income", destination: "income" },
    { id: "personal-finance-companion.bills", destination: "bills" },
    { id: "personal-finance-companion.subscriptions", destination: "subscriptions" },
    { id: "personal-finance-companion.transactions", destination: "transactions" },
    { id: "personal-finance-companion.debt", destination: "debt" },
    { id: "personal-finance-companion.savings", destination: "savings" },
    { id: "personal-finance-companion.setup-centre", destination: "setup-centre" },
  ],
  permissions: [],
  events: [],
  layouts: ["responsive"],
  // "shell-only": the installed app shell and static/product UI may be
  // cached; financial reads/writes require connectivity. See the offline
  // contract in docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md —
  // this product deliberately does not get "local-edits" (an optimistic
  // offline write queue), since no conflict-safe mechanism for one exists
  // in this repository yet and financial data must never imply a save
  // succeeded when it did not.
  offline: "shell-only",
  // Declarative only at this stage — no push-sending platform exists yet
  // (see the PWA/notification-readiness audit). Left false rather than a
  // premature true, since nothing behind this flag is real yet.
  notifications: { supported: false },
  progressModel: { kind: "custom" },
  history: { enabled: true, kinds: ["import", "confirmation", "correction", "archive"] },
  settingsSections: ["currency", "date-format", "planning-cadence", "financial-month-start", "privacy-blur", "import-retention"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
