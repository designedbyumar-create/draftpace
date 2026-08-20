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

  it("takes over the primary tokens once a full scale is declared", () => {
    const style = productThemeStyle({
      accent: "#4f7a5c",
      accentScale: { base: "#4f7a5c", strong: "#3d6149", soft: "#e6ede2", contrast: "#ffffff" },
    }) as Record<string, string>;
    expect(style["--primary"]).toBe("#4f7a5c");
    expect(style["--primary-strong"]).toBe("#3d6149");
    expect(style["--primary-soft"]).toBe("#e6ede2");
    expect(style["--focus-ring"]).toBe("#4f7a5c");
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
