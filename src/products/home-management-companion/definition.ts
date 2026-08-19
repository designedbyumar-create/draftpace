import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Home Management Companion ("Home Base") — foundation-stage registration.
 * Same "real but unreleased" pattern as Personal Finance Companion's own
 * definition.ts: devFixture is false (a real product, registered in every
 * environment), access.model is "paid", and there is deliberately no
 * src/shop/products/home-management-companion.ts entry yet (added in a
 * later phase) — until then the only way in is a manual
 * grant_admin_product call, exactly like PFC and hidden-access-test were
 * during their own buildouts.
 *
 * cycleModel is "continuous": a home has no monthly reset concept, exactly
 * one instance ever. Navigation follows Monthly Money Reset's shape
 * (start/setup/workspace/.../history/settings, "setup" declared as a real
 * destination) rather than PFC's — PFC excludes "setup" only because of a
 * historical bug where nothing called setProductInstanceLifecycle to mark
 * it complete; this product's Setup module calls that correctly (see
 * Phase 1), so MMR's proven, simpler shape applies directly.
 */
export const homeManagementCompanionDefinition: ProductDefinitionInput = {
  id: "home-management-companion",
  slug: "home-management-companion",
  title: "Home Base",
  tagline: "Know what your home needs before it becomes expensive — appliances, maintenance, and warranties, always current.",
  family: "companion",
  version: "0.1.0",
  status: "draft",
  access: { model: "paid" },
  cycleModel: "continuous",
  // Provisional: reuses Draftpace's own neutral brand icons for local
  // installability testing only, per the same convention PFC used before
  // its own final artwork existed. Real icon assets are a later decision.
  pwa: {
    name: "Home Base",
    shortName: "Home Base",
    description: "Home Base by Draftpace: appliances, maintenance, and warranties, in one always-current picture of what your home needs.",
    themeColor: "#4f7a5c",
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
    "attention",
    "things",
    "maintenance",
    "providers",
    "import",
    "history",
    "settings",
  ],
  primaryNavigation: ["workspace", "attention", "things"],
  workspaceLabel: "Today",
  // The route id stays "things" (renaming a route buys nothing a person
  // can see), but no user-facing surface says that word. The v2
  // direction is that there is no generic noun at all: someone sees
  // "Refrigerator", and the place those live is simply their home.
  destinationLabels: { things: "Your home", attention: "Needs you" },
  startRoute: "start",
  setup: {
    required: true,
    skippable: true,
    completedLabel: "Manage your home",
  },
  modules: [
    { id: "home-management-companion.start", destination: "start" },
    { id: "home-management-companion.setup", destination: "setup" },
    { id: "home-management-companion.workspace", destination: "workspace" },
    { id: "home-management-companion.attention", destination: "attention" },
    { id: "home-management-companion.things", destination: "things" },
    { id: "home-management-companion.maintenance", destination: "maintenance" },
    { id: "home-management-companion.providers", destination: "providers" },
    { id: "home-management-companion.import", destination: "import" },
    { id: "home-management-companion.history", destination: "history" },
    { id: "home-management-companion.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  // Distinct from PFC's teal and Monthly Money Reset's clay so a user with
  // more than one Companion can tell them apart at a glance. Muted sage:
  // calm, "home" without leaning into either existing product's hue.
  theme: { accent: "#4f7a5c", motionPersonality: "calm", contentWidth: "narrow" },
  layouts: ["responsive"],
  // "shell-only": same reasoning as PFC — the installed shell may be
  // cached, but reads/writes require connectivity, no optimistic offline
  // write queue exists for this kind of record yet.
  offline: "shell-only",
  // A real evaluator exists now (src/app/api/notifications/cron-hmc),
  // its own separate cron job from PFC's, so this can honestly flip true.
  notifications: { supported: true },
  progressModel: { kind: "custom" },
  history: { enabled: true, kinds: ["maintenance-log"] },
  settingsSections: ["notifications", "privacy", "timezone"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
