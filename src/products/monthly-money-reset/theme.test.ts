import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MONEY_RESET_SHARED_TOKENS, monthlyMoneyResetSharedTokens, monthlyMoneyResetThemeVars } from "./theme";
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

/**
 * The bug this covers: with no accentScale, nothing gave this product a
 * --primary, so the shell's rule left it undefined and every filled button
 * and link in it had no colour. The tokens live apart from the --mmr-* set
 * so the namespacing guard above stays true.
 */
describe("Monthly Money Reset's shared-token overrides", () => {
  for (const mode of ["light", "dark"] as const) {
    it(`overrides exactly the six shared tokens, and only those, in ${mode}`, () => {
      const vars = monthlyMoneyResetSharedTokens(mode) as Record<string, string>;
      expect(Object.keys(vars).sort()).toEqual([...MONEY_RESET_SHARED_TOKENS].sort());
      for (const token of MONEY_RESET_SHARED_TOKENS) expect(vars[token]).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it(`declares the hero panel colours in ${mode}`, () => {
      const vars = monthlyMoneyResetThemeVars(mode) as Record<string, string>;
      expect(vars["--mmr-hero"]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(vars["--mmr-hero-ink"]).toMatch(/^#[0-9a-f]{6}$/i);
    });
  }

  it("keeps button text readable on the primary in both modes", () => {
    const luminance = (hex: string) => {
      const [r, g, b] = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    for (const mode of ["light", "dark"] as const) {
      const vars = monthlyMoneyResetSharedTokens(mode) as Record<string, string>;
      const [hi, lo] = [luminance(vars["--primary"]), luminance(vars["--primary-contrast"])].sort((a, b) => b - a);
      expect((hi + 0.05) / (lo + 0.05), `${mode} primary vs its contrast colour`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("is applied by ThemeScope, not just declared", () => {
    const source = readFileSync(join(__dirname, "components", "ThemeScope.tsx"), "utf8");
    expect(source).toContain("monthlyMoneyResetSharedTokens(resolvedTheme)");
  });
});

describe("the redesigned hero components", () => {
  // Tailwind 3 silently drops `/NN` on a var() colour, which is how a
  // translucent chip rendered fully transparent. Mix explicitly instead.
  for (const file of ["SafeToSpendCard.tsx", "NextActionCard.tsx"]) {
    it(`${file} never puts an /opacity on a var() colour`, () => {
      const source = readFileSync(join(__dirname, "components", file), "utf8");
      const offenders = [...source.matchAll(/\[var\(--[a-z0-9-]+\)\]\/\d+/gi)].map((m) => m[0]);
      expect(offenders).toEqual([]);
    });
  }
});
