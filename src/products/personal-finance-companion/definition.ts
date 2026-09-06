import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Personal Finance Companion, one of Draftpace's real, live, paid
 * products (see docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md for
 * the original reconciliation this registration is built from). It has
 * since launched publicly: src/shop/products/personal-finance-companion.ts
 * is registered and its Shop page is live. An earlier version of this
 * comment described a hidden, pre-launch stage (following
 * hidden-access-test's pattern) that no longer reflects reality; kept only
 * as a note so nobody re-hides a shipped product chasing a stale comment.
 *
 * cycleModel is "continuous": unlike Monthly Money Reset, this product has
 * no monthly reset concept, exactly one instance ever, found by most
 * recently created rather than by matching today's cycle key. See
 * src/product-framework/definition.ts's productCycleModelSchema comment.
 */
export const personalFinanceCompanionDefinition: ProductDefinitionInput = {
  id: "personal-finance-companion",
  slug: "personal-finance-companion",
  title: "Personal Finance Companion",
  tagline:
    "See what is safe to spend, what is coming due, and what actually happened with your money, in one place that is always current.",
  family: "companion",
  version: "0.1.0",
  status: "active",
  access: { model: "paid" },
  cycleModel: "continuous",
  // Real theme/background colors: petrol, this product's own identity
  // (see docs/PRODUCT-PLATFORM.md's design-system pass). Icons are still
  // Draftpace's neutral brand assets, real per-product icon artwork
  // remains a separate, later decision, so provisionalBranding stays
  // true for icons specifically, tracked in the manifest route/settings
  // destination per its own doc comment in product-framework/definition.ts.
  pwa: {
    name: "Personal Finance Companion",
    shortName: "Finance",
    description: "Personal Finance Companion by Draftpace: accounts, income, bills, subscriptions, transactions, debt, and savings, in one always-current picture.",
    themeColor: "#2e4a4d",
    backgroundColor: "#f4f2ec",
    icons: [
      { src: "/logo/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    provisionalBranding: true,
  },
  capabilities: ["companion.context", "companion.next-action"],
  // Deliberately excludes "setup": that destination is Phase 8's
  // autosave/resume infrastructure probe (SetupModule.tsx), not a real
  // onboarding screen, and nothing in this product ever calls
  // setProductInstanceLifecycle to mark setup_complete, so declaring
  // "setup" here trapped resolveLifecycleNavigation() in its permanent
  // "setup in progress" branch (see navigationResolver.ts's state 2), on
  // top of everTouched being separately stuck false (fixed in migration
  // 202608090003). setup-centre is, and always was, the real returning-
  // user management surface the launch spec describes, this changes
  // nothing about that.
  navigation: [
    "start",
    "workspace",
    "attention",
    "records",
    "accounts",
    "income",
    "bills",
    "subscriptions",
    "transactions",
    "debt",
    "savings",
    "setup-centre",
    "printables",
    "history",
    "settings",
  ],
  // Today / Companion / Attention / Records: the four things a returning
  // user actually comes back for. The seven direct sections remain fully
  // routable (Records is their real home, with its own internal
  // navigation) and still land in the shell's "More" menu as a fallback;
  // Settings is deliberately secondary, not a primary tab.
  primaryNavigation: ["workspace", "start", "attention", "records"],
  workspaceLabel: "Today",
  destinationLabels: { start: "Companion" },
  startRoute: "start",
  setup: {
    required: false,
    skippable: true,
    completedLabel: "Add another source",
  },
  modules: [
    { id: "personal-finance-companion.companion", destination: "start" },
    { id: "personal-finance-companion.workspace", destination: "workspace" },
    { id: "personal-finance-companion.attention", destination: "attention" },
    { id: "personal-finance-companion.records", destination: "records" },
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
    { id: "personal-finance-companion.printables", destination: "printables" },
  ],
  permissions: [],
  events: [],
  // Petrol: this product's first real accent identity. Declaring the full
  // scale (not just `accent`) is what actually re-themes it, per
  // themeExtension.ts's own comment, every shared component already
  // reads --primary and friends, so this one block turns the whole
  // product petrol without touching any component. Before this, PFC had
  // no accent declared at all, the one product the design-system audit
  // found with zero visual identity of its own.
  theme: {
    accentScale: {
      base: "#2e4a4d",
      strong: "#22383a",
      soft: "#e4ebea",
      contrast: "#ffffff",
      wash: "#f2f6f5",
    },
    motionPersonality: "calm",
  },
  layouts: ["responsive"],
  // "shell-only": the installed app shell and static/product UI may be
  // cached; financial reads/writes require connectivity. See the offline
  // contract in docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md ,
  // this product deliberately does not get "local-edits" (an optimistic
  // offline write queue), since no conflict-safe mechanism for one exists
  // in this repository yet and financial data must never imply a save
  // succeeded when it did not.
  offline: "shell-only",
  // Declarative only at this stage, no push-sending platform exists yet
  // (see the PWA/notification-readiness audit). Left false rather than a
  // premature true, since nothing behind this flag is real yet.
  notifications: { supported: false },
  progressModel: { kind: "custom" },
  history: { enabled: true, kinds: ["import", "confirmation", "correction", "archive"] },
  settingsSections: ["currency", "date-format", "planning-cadence", "financial-month-start", "privacy-blur", "import-retention"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
