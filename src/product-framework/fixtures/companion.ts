import { ProductDefinitionInput } from "../definition";

/**
 * Internal Companion Fixture — proves the full six-destination navigation
 * with Companion-family capabilities. No real behavior; see
 * docs/DATA-BOUNDARIES.md for the fixture rules.
 */
export const internalCompanionFixture: ProductDefinitionInput = {
  id: "internal-companion-fixture",
  slug: "internal-companion-fixture",
  title: "Internal Companion Fixture",
  family: "companion",
  version: "0.1.0",
  status: "draft",
  access: { model: "free" },
  capabilities: ["companion.next-action", "companion.momentum", "companion.recovery"],
  navigation: ["start", "setup", "workspace", "progress", "history", "settings"],
  workspaceLabel: "Continue",
  setup: { required: true, skippable: true },
  history: { enabled: true, kinds: ["session"] },
  settingsSections: ["notifications", "reset"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: true,
};
