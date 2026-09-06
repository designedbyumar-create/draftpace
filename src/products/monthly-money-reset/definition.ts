import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Monthly Money Reset, Draftpace's first real product and first free
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
  /**
   * Deliberately no `accent`/`accentScale` here. This product's real visual
   * identity is the bespoke forest/sage/ivory/clay scale in `theme.ts`
   * (`monthlyMoneyResetThemeVars`), applied as `--mmr-*` custom properties
   * by its own `ThemeScope.tsx`, never through the shared
   * `productThemeStyle()` mechanism every other themed product uses. This
   * is the one intentional exception, not an oversight or a second
   * undocumented system: MMR's design predates `accentScale` and already
   * has its own light/dark pair, which the shared scale (one set of
   * values, no light/dark split) cannot express. Declaring a decorative
   * `accent` here as well would just be a second, disconnected color that
   * nothing renders, see `themeExtension.ts`'s own comment on why
   * `accent` alone is inert.
   */
  theme: { motionPersonality: "calm", contentWidth: "wide" },
  layouts: ["responsive"],
  offline: "shell-only",
  notifications: { supported: true },
  progressModel: { kind: "momentum" },
  history: { enabled: true, kinds: ["monthly-cycle", "check-in"] },
  settingsSections: ["currency", "check-in", "privacy", "tone", "data", "reset"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
