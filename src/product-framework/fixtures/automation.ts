import { ProductDefinitionInput } from "../definition";

/**
 * Internal Automation Fixture — proves a lean navigation subset (no
 * "progress") and Automation-family capabilities. No real behavior; see
 * docs/DATA-BOUNDARIES.md for the fixture rules.
 */
export const internalAutomationFixture: ProductDefinitionInput = {
  id: "internal-automation-fixture",
  slug: "internal-automation-fixture",
  title: "Internal Automation Fixture",
  family: "automation",
  version: "0.1.0",
  status: "draft",
  access: { model: "free" },
  capabilities: ["automation.trigger", "automation.action", "automation.run-history"],
  navigation: ["start", "setup", "workspace", "history"],
  workspaceLabel: "Automate",
  setup: { required: true, skippable: true },
  history: { enabled: true, kinds: ["run"] },
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: true,
};
