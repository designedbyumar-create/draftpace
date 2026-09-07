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

describe("productThemeStyle: opting a product into its own presentation", () => {
  it("leaves every platform token alone for a product that has not opted in", () => {
    // Monthly Money Reset's shape: an accent and a personality declared,
    // no scale. It must render byte-identically to before this existed.
    const style = productThemeStyle({ accent: "#b86f4a", motionPersonality: "calm", contentWidth: "wide" });
    expect(style).toEqual({ "--product-accent": "#b86f4a" });
  });

  it("emits both tone sets as pairs once a full scale is declared", () => {
    const style = productThemeStyle({
      accent: "#4f7a5c",
      accentScale: { base: "#4f7a5c", strong: "#3d6149", soft: "#e6ede2", contrast: "#ffffff" },
    }) as Record<string, string>;
    expect(style["--product-primary-light"]).toBe("#4f7a5c");
    expect(style["--product-primary-strong-light"]).toBe("#3d6149");
    expect(style["--product-primary-soft-light"]).toBe("#e6ede2");
    expect(style["--product-primary-dark"]).toBeDefined();
    expect(style["--product-primary-dark"]).not.toBe("#4f7a5c");
  });

  /**
   * The regression that matters most here. Setting --primary inline would
   * outrank the stylesheet rule that swaps in the dark tone, which is
   * exactly how every themed product ended up pushing its light accent
   * into dark mode (petrol at 1.82:1 on the dark ground).
   */
  it("never sets --primary, --link or --focus-ring inline, so the theme rules can win", () => {
    const style = productThemeStyle({
      accentScale: { base: "#4f7a5c", strong: "#3d6149", soft: "#e6ede2", contrast: "#ffffff" },
    }) as Record<string, string>;
    expect(style["--primary"]).toBeUndefined();
    expect(style["--link"]).toBeUndefined();
    expect(style["--focus-ring"]).toBeUndefined();
  });

  it("honours an explicit accentScaleDark instead of deriving one", () => {
    const style = productThemeStyle({
      accentScale: { base: "#4f7a5c", strong: "#3d6149", soft: "#e6ede2", contrast: "#ffffff" },
      accentScaleDark: { base: "#9fd8ae", strong: "#c2e8cb", soft: "#1f2a22", contrast: "#0b120d" },
    }) as Record<string, string>;
    expect(style["--product-primary-dark"]).toBe("#9fd8ae");
    expect(style["--product-primary-contrast-dark"]).toBe("#0b120d");
  });

  it("applies the narrative face and motion only inside that opt-in", () => {
    const optedOut = productThemeStyle({ narrativeFont: "serif", motionPersonality: "calm" }) as Record<string, string>;
    expect(optedOut["--product-narrative-font"]).toBeUndefined();
    expect(optedOut["--dur"]).toBeUndefined();

    const optedIn = productThemeStyle({
      accentScale: { base: "#000", strong: "#000", soft: "#eee", contrast: "#fff" },
      narrativeFont: "serif",
      motionPersonality: "calm",
    }) as Record<string, string>;
    expect(optedIn["--product-narrative-font"]).toBe("serif");
    expect(optedIn["--dur"]).toBe("260ms");
  });

  it("slows motion for a calm product and quickens it for an energetic one", () => {
    const scale = { base: "#000", strong: "#000", soft: "#eee", contrast: "#fff" };
    const calm = productThemeStyle({ accentScale: scale, motionPersonality: "calm" }) as Record<string, string>;
    const energetic = productThemeStyle({ accentScale: scale, motionPersonality: "energetic" }) as Record<string, string>;
    expect(Number.parseInt(calm["--dur"], 10)).toBeGreaterThan(Number.parseInt(energetic["--dur"], 10));
  });
});

describe("productThemeStyle: the wash tier", () => {
  it("falls back to soft when a product hasn't computed its own wash", () => {
    const style = productThemeStyle({
      accentScale: { base: "#4f7a5c", strong: "#3d6149", soft: "#e6ede2", contrast: "#ffffff" },
    }) as Record<string, string>;
    expect(style["--product-wash-light"]).toBe("#e6ede2");
  });

  it("uses a product's own wash value when it declares one", () => {
    const style = productThemeStyle({
      accentScale: { base: "#8d4a5c", strong: "#68343f", soft: "#f5eaec", contrast: "#ffffff", wash: "#faf2f4" },
    }) as Record<string, string>;
    expect(style["--product-wash-light"]).toBe("#faf2f4");
  });

  it("always has a dark counterpart, so a wash surface is never a pale block on a dark page", () => {
    const style = productThemeStyle({
      accentScale: { base: "#8d4a5c", strong: "#68343f", soft: "#f5eaec", contrast: "#ffffff", wash: "#faf2f4" },
    }) as Record<string, string>;
    expect(style["--product-wash-dark"]).toBeDefined();
    expect(style["--product-wash-dark"]).not.toBe("#faf2f4");
  });

  it("never emits a wash for a product with no accentScale at all", () => {
    const style = productThemeStyle({ accent: "#b86f4a" }) as Record<string, string>;
    expect(style["--product-wash-light"]).toBeUndefined();
    expect(style["--product-wash-dark"]).toBeUndefined();
  });
});
