import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Monthly Money Reset — Draftpace's first real product and first free
 * product. See docs/products/MONTHLY-MONEY-RESET.md for the full product
 * brief. devFixture is always false: this is never gated behind
 * areDevFixturesEnabled() and is registered in every environment.
 */
export const monthlyMoneyResetDefinition: ProductDefinitionInput = {
  id: "monthly-money-reset",
  slug: "monthly-money-reset",
  title: "Monthly Money Reset",
  tagline:
    "See what's safe to spend this month, protect what must be paid, and know the next useful move.",
  family: "companion",
  version: "0.1.0",
  status: "active",
  access: { model: "free" },
  capabilities: [
    "companion.context",
    "companion.next-action",
    "companion.momentum",
    "companion.recovery",
    "companion.milestones",
  ],
  navigation: ["start", "setup", "workspace", "progress", "history", "printables", "settings"],
  workspaceLabel: "This Month",
  setup: {
    required: true,
    skippable: true,
    schemaRef: "monthly-money-reset.state.v1",
    completedLabel: "Edit your plan",
  },
  dataSchemaRef: "monthly-money-reset.state.v1",
  modules: [
    { id: "monthly-money-reset.start", destination: "start" },
    { id: "monthly-money-reset.setup", destination: "setup" },
    { id: "monthly-money-reset.workspace", destination: "workspace" },
    { id: "monthly-money-reset.progress", destination: "progress" },
    { id: "monthly-money-reset.history", destination: "history" },
    { id: "monthly-money-reset.printables", destination: "printables" },
    { id: "monthly-money-reset.settings", destination: "settings" },
  ],
  permissions: [],
  events: ["monthly-money-reset.activity-added", "monthly-money-reset.month-closed"],
  theme: { accent: "#b86f4a", motionPersonality: "calm", contentWidth: "wide" },
  layouts: ["responsive"],
  offline: "shell-only",
  notifications: { supported: true },
  progressModel: { kind: "momentum" },
  history: { enabled: true, kinds: ["monthly-cycle", "check-in"] },
  settingsSections: ["currency", "check-in", "privacy", "tone", "data", "reset"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
