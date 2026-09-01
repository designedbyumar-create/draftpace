import { describe, expect, it } from "vitest";
import { resolveProductDestination } from "./resolveDestination";
import { validateProductDefinition } from "./definition";
import { monthlyMoneyResetDefinition } from "@/products/monthly-money-reset/definition";
import { hiddenAccessTestDefinition } from "@/products/hidden-access-test/definition";

const definition = validateProductDefinition(monthlyMoneyResetDefinition);
const workspaceFamilyDefinition = validateProductDefinition(hiddenAccessTestDefinition);

describe("resolveProductDestination", () => {
  it("sends an owner with incomplete setup to setup, regardless of lifecycle state", () => {
    expect(
      resolveProductDestination(definition, { setupComplete: false, lifecycleState: "active" })
    ).toBe("/app/products/monthly-money-reset/setup");
  });

  it("sends a completed cycle to history once setup is done", () => {
    expect(
      resolveProductDestination(definition, { setupComplete: true, lifecycleState: "completed" })
    ).toBe("/app/products/monthly-money-reset/history");
  });

  it("sends an active, paused, or archived instance with setup done to the workspace", () => {
    for (const lifecycleState of ["active", "paused", "archived"] as const) {
      expect(resolveProductDestination(definition, { setupComplete: true, lifecycleState })).toBe(
        "/app/products/monthly-money-reset/workspace"
      );
    }
  });

  /**
   * Regression: a workspace-family product's navigation is just
   * start/workspace/history — no "setup" destination at all — but
   * setup_complete still defaults to false on every fresh instance
   * regardless of family. Sending it to /setup anyway landed the owner
   * outside their product's own nav (caught live via Phase B's
   * hidden-access-test verification, 2026-08-04).
   */
  it("never sends an owner to /setup for a product that doesn't declare it as a destination", () => {
    expect(workspaceFamilyDefinition.navigation).not.toContain("setup");
    expect(
      resolveProductDestination(workspaceFamilyDefinition, { setupComplete: false, lifecycleState: "active" })
    ).toBe("/app/products/hidden-access-test/workspace");
  });

  it("still sends a workspace-family product with setup done and a completed cycle to history", () => {
    expect(
      resolveProductDestination(workspaceFamilyDefinition, { setupComplete: false, lifecycleState: "completed" })
    ).toBe("/app/products/hidden-access-test/history");
  });
});
