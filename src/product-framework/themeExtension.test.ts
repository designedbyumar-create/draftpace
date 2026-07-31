import { describe, expect, it } from "vitest";
import { productThemeStyle } from "./themeExtension";

describe("productThemeStyle", () => {
  it("produces only scoped, product-prefixed CSS custom properties", () => {
    const style = productThemeStyle({ accent: "#ff0000", dataVisualizationPalette: ["#111", "#222"] });
    const keys = Object.keys(style);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(key.startsWith("--product-")).toBe(true);
    }
  });

  it("produces an empty style object for an empty theme extension", () => {
    expect(productThemeStyle({})).toEqual({});
  });

  it("never emits a global selector or bare CSS property — only custom properties", () => {
    const style = productThemeStyle({ accent: "#000" });
    for (const key of Object.keys(style)) {
      expect(key.startsWith("--")).toBe(true);
    }
  });
});
