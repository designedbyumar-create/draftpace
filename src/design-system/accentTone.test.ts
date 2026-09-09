import { describe, expect, it } from "vitest";
import {
  deriveDarkTones,
  accentWash,
  contrastRatio,
  DARK_SURFACE,
  DARK_TONE_TARGET,
  WASH_SATURATION,
  WASH_SATURATION_WIDTH,
} from "./accentTone";
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

/**
 * The failure this guards is the one that made nine store images look
 * like one product: a pale ground mixed toward white keeps a saturated
 * accent obviously coloured and washes a desaturated one to grey, so no
 * single percentage serves the whole catalogue.
 */
describe("accentWash", () => {
  function saturation(hex: string): number {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (max === min) return 0;
    const l = (max + min) / 2;
    return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  }

  /** Petrol (S=0.25) and amber, the two ends of the catalogue's saturation range. */
  const PETROL = "#2e4a4d";
  const AMBER = "#8a5a1c";

  /** 8-bit channels cannot round-trip a saturation exactly; this is that slack, not a widened contract. */
  const ROUNDING = 0.02;

  it("closes the gap between a washed-out accent and a vivid one", () => {
    const before = Math.abs(saturation(PETROL) - saturation(AMBER));
    const petrol = saturation(accentWash(PETROL, 0.92));
    const amber = saturation(accentWash(AMBER, 0.92));
    const after = Math.abs(petrol - amber);
    expect(after, `petrol ${petrol.toFixed(3)} vs amber ${amber.toFixed(3)}`).toBeLessThanOrEqual(
      WASH_SATURATION_WIDTH + ROUNDING
    );
    expect(after).toBeLessThan(before);
  });

  it("holds every wash inside the saturation band", () => {
    for (const accent of [PETROL, AMBER, "#4d5a35", "#8d4a5c", "#606e8e"]) {
      const s = saturation(accentWash(accent, 0.92));
      expect(s, `${accent} washed to S=${s.toFixed(3)}`).toBeGreaterThanOrEqual(WASH_SATURATION[0] - ROUNDING);
      expect(s, `${accent} washed to S=${s.toFixed(3)}`).toBeLessThanOrEqual(WASH_SATURATION[1] + ROUNDING);
    }
  });

  it("leaves a low-saturation accent visibly coloured rather than grey", () => {
    expect(saturation(accentWash(PETROL, 0.92))).toBeGreaterThan(0.3);
  });

  it("honours the lightness it is asked for", () => {
    for (const target of [0.9, 0.95, 0.975]) {
      const hex = accentWash(PETROL, target);
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
      expect(Math.abs((Math.max(r, g, b) + Math.min(r, g, b)) / 2 - target)).toBeLessThan(0.01);
    }
  });

  it("keeps each product in its own hue rather than a shared tint", () => {
    expect(accentWash(PETROL, 0.92)).not.toEqual(accentWash(AMBER, 0.92));
  });
});
