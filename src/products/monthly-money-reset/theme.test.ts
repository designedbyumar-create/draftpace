import { describe, expect, it } from "vitest";
import { monthlyMoneyResetThemeVars } from "./theme";
import { monthlyMoneyResetDefinition } from "./definition";
import { validateProductDefinition } from "@/product-framework/definition";

describe("Monthly Money Reset's accent source", () => {
  it("declares neither accent nor accentScale in its definition", () => {
    // This is the one intentional exception documented on theme.ts and in
    // definition.ts's own comment: MMR's real identity is --mmr-* below,
    // not the shared productThemeStyle() mechanism. A future accidental
    // `accent` re-added here would silently create the second,
    // disconnected colour system this test exists to catch.
    const resolved = validateProductDefinition(monthlyMoneyResetDefinition);
    expect(resolved.theme.accent).toBeUndefined();
    expect(resolved.theme.accentScale).toBeUndefined();
  });

  it("provides a genuinely distinct light and dark scale, which a single accentScale value could not express", () => {
    const light = monthlyMoneyResetThemeVars("light") as Record<string, string>;
    const dark = monthlyMoneyResetThemeVars("dark") as Record<string, string>;
    expect(light["--mmr-forest-900"]).not.toBe(dark["--mmr-forest-900"]);
    expect(light["--mmr-clay"]).not.toBe(dark["--mmr-clay"]);
  });

  it("keeps every token namespaced under --mmr-, so it can never collide with a shared platform or another product's token", () => {
    for (const key of Object.keys(monthlyMoneyResetThemeVars("light"))) {
      expect(key.startsWith("--mmr-")).toBe(true);
    }
  });
});
