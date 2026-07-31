import { ProductDefinitionInput } from "../definition";

/**
 * Internal Learning Fixture — proves a different navigation subset (no
 * "settings") and Learning-family capabilities. No real behavior; see
 * docs/DATA-BOUNDARIES.md for the fixture rules.
 */
export const internalLearningFixture: ProductDefinitionInput = {
  id: "internal-learning-fixture",
  slug: "internal-learning-fixture",
  title: "Internal Learning Fixture",
  family: "learning",
  version: "0.1.0",
  status: "draft",
  access: { model: "free" },
  capabilities: ["learning.lesson", "learning.assessment", "learning.completion"],
  navigation: ["start", "setup", "workspace", "progress", "history"],
  workspaceLabel: "Learn",
  setup: { required: true, skippable: false },
  history: { enabled: true, kinds: ["completed-lesson"] },
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: true,
};
