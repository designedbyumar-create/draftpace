import { describe, expect, it } from "vitest";
import { deriveDarkTones, contrastRatio, DARK_SURFACE, DARK_TONE_TARGET } from "./accentTone";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";

ensureProductsRegistered();

/**
 * The guard the Phase 10 accessibility pass should have had. That pass
 * checked each accent against its own `contrast` token (button label
 * legibility) and never against the dark theme's ground, which is where
 * every themed product was actually failing: petrol at 1.82:1, steel at
 * 2.26:1, and nothing above 3.7:1 across the whole catalogue.
 */
describe("deriveDarkTones", () => {
  it("lifts a dark accent until it clears the dark ground", () => {
    const petrol = deriveDarkTones("#2e4a4d");
    expect(contrastRatio(petrol.base, DARK_SURFACE)).toBeGreaterThanOrEqual(DARK_TONE_TARGET);
  });

  it("keeps a near-neutral accent near-neutral instead of pushing chroma into it", () => {
    // Vehicle Maintenance's steel. Forcing a saturation floor on it turns
    // a warm grey into olive, which is a different product's colour.
    const steel = deriveDarkTones("#565349");
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(steel.base.slice(i, i + 2), 16));
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    expect(spread, `steel derived to ${steel.base}, too chromatic for a neutral accent`).toBeLessThan(40);
  });

  it("gives text that sits on the derived base enough contrast to read", () => {
    const tones = deriveDarkTones("#606e8e");
    expect(contrastRatio(tones.base, tones.contrast)).toBeGreaterThanOrEqual(4.5);
  });

  it("is deterministic", () => {
    expect(deriveDarkTones("#a8611f")).toEqual(deriveDarkTones("#a8611f"));
  });
});

describe("every themed product survives dark mode", () => {
  const themed = productRegistry.list().filter((product) => product.theme.accentScale);

  it("has themed products to check", () => {
    expect(themed.length).toBeGreaterThanOrEqual(8);
  });

  it("resolves a dark tone that clears 4.5:1 against the dark ground for every one", () => {
    for (const product of themed) {
      const scale = product.theme.accentScale!;
      const dark = product.theme.accentScaleDark ?? deriveDarkTones(scale.base);
      const ratio = contrastRatio(dark.base, DARK_SURFACE);
      expect(
        ratio,
        `${product.slug}: dark accent ${dark.base} is only ${ratio.toFixed(2)}:1 against ${DARK_SURFACE}`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps every product's light accent legible on the light ground too", () => {
    for (const product of themed) {
      const scale = product.theme.accentScale!;
      const ratio = contrastRatio(scale.base, "#ffffff");
      expect(ratio, `${product.slug}: light accent ${scale.base} is only ${ratio.toFixed(2)}:1 on white`).toBeGreaterThanOrEqual(
        4.5
      );
    }
  });
});
