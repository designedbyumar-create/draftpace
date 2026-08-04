import { describe, expect, it } from "vitest";
import { resolveProductDestination } from "./resolveDestination";
import { validateProductDefinition } from "./definition";
import { monthlyMoneyResetDefinition } from "@/products/monthly-money-reset/definition";

const definition = validateProductDefinition(monthlyMoneyResetDefinition);

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
});
