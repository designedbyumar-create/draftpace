import { describe, expect, it } from "vitest";
import { MARK_FILL_PERCENT, MARK_INK_PERCENT, PERSON_HUES, initialOf, personHue, personMarkStyle } from "./personColors";
import { familyHealthBinderDefinition } from "./definition";

type Rgb = [number, number, number];
const rgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
const mix = (a: Rgb, b: Rgb, aPercent: number): Rgb => a.map((v, i) => (v * aPercent + b[i] * (100 - aPercent)) / 100) as Rgb;
function luminance([r, g, b]: Rgb): number {
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("person colours", () => {
  const ground = familyHealthBinderDefinition.theme?.ground;
  if (!ground) throw new Error("the product declares no ground");

  for (const mode of ["light", "dark"] as const) {
    it(`keep a person's initial readable on its own fill in the ${mode} theme, for every hue`, () => {
      const surface = rgb(ground[mode].surface);
      const text = rgb(ground[mode].text);
      for (const hue of PERSON_HUES) {
        const fill = mix(rgb(hue), surface, MARK_FILL_PERCENT);
        const ink = mix(rgb(hue), text, MARK_INK_PERCENT);
        expect(contrast(ink, fill), `${hue} in ${mode}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it("cycle through the hues in order, and never fail on a negative or large index", () => {
    expect(personHue(0)).toBe(PERSON_HUES[0]);
    expect(personHue(PERSON_HUES.length)).toBe(PERSON_HUES[0]);
    expect(personHue(-1)).toBe(PERSON_HUES[PERSON_HUES.length - 1]);
    expect(new Set(PERSON_HUES).size).toBe(PERSON_HUES.length);
  });

  it("build the mark from the theme's own surface and text, so it follows light and dark", () => {
    const style = personMarkStyle(1);
    expect(style.backgroundColor).toContain("var(--surface)");
    expect(style.color).toContain("var(--text)");
  });

  it("take the first letter of a name, and cope with a blank one", () => {
    expect(initialOf("  amina")).toBe("A");
    expect(initialOf("")).toBe("?");
  });
});
