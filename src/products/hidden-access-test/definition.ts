import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Phase B's proof that the access architecture generalizes past one
 * product and one access source (docs: the ownership/routing plan's
 * Phase B). Not a devFixture — devFixture products are excluded from
 * production and labeled "Internal ... Fixture" for framework testing
 * (see docs/DATA-BOUNDARIES.md); this is a real, minimal product that's
 * simply hidden because nothing links to it. It has no Shop listing, so
 * the only way in is the canonical route (/app/products/hidden-access-test)
 * after an entitlement exists — reachable only via the service-role-only
 * grant_admin_product RPC (a one-off manual call, never self-serve). There
 * is deliberately no redemption-code system.
 */
export const hiddenAccessTestDefinition: ProductDefinitionInput = {
  id: "hidden-access-test",
  slug: "hidden-access-test",
  title: "Hidden Access Test",
  tagline: "Internal only. Proves entitlement, routing, and revocation work for a second, non-free product.",
  family: "workspace",
  version: "0.1.0",
  status: "active",
  access: { model: "paid" },
  capabilities: [],
  navigation: ["start", "workspace", "history"],
  workspaceLabel: "Build",
  setup: { required: false, skippable: true },
  modules: [
    { id: "hidden-access-test.start", destination: "start" },
    { id: "hidden-access-test.workspace", destination: "workspace" },
    { id: "hidden-access-test.history", destination: "history" },
  ],
  permissions: [],
  events: [],
  layouts: ["responsive"],
  offline: "none",
  notifications: { supported: false },
  progressModel: { kind: "custom" },
  history: { enabled: true, kinds: ["access-check"] },
  settingsSections: [],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
