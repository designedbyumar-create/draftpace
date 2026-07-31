import { ProductDefinitionInput } from "../definition";

/**
 * Internal Workspace Fixture — proves the leanest navigation subset (just
 * start/workspace/history, no setup or settings) and Workspace-family
 * capabilities. No real behavior; see docs/DATA-BOUNDARIES.md for the
 * fixture rules.
 */
export const internalWorkspaceFixture: ProductDefinitionInput = {
  id: "internal-workspace-fixture",
  slug: "internal-workspace-fixture",
  title: "Internal Workspace Fixture",
  tagline: "Proves the Tool/Workspace family: structured input and saved output.",
  family: "workspace",
  version: "0.1.0",
  status: "draft",
  access: { model: "free" },
  capabilities: ["workspace.structured-input", "workspace.saved-output"],
  navigation: ["start", "workspace", "history"],
  workspaceLabel: "Build",
  setup: { required: false, skippable: true },
  history: { enabled: true, kinds: ["saved-work"] },
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: true,
};
