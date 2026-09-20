/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { productThemeStyle, hasProductGround } from "./themeExtension";
import { productDefinitionSchema, type ProductGroundTones } from "./definition";

const modules = import.meta.glob("../products/*/definition.ts", { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

const declared = Object.entries(modules).flatMap(([path, mod]) =>
  Object.values(mod)
    .filter((value): value is { title: string; theme: { ground?: unknown } } =>
      Boolean(value && typeof value === "object" && "theme" in value && "title" in value),
    )
    .map((definition) => ({ path, definition })),
);

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const withGround = declared.filter(({ definition }) => definition.theme.ground);

describe("a product's own ground", () => {
  it("is declared by at least one product, or every check below passes on nothing", () => {
    expect(withGround.length).toBeGreaterThan(0);
  });

  for (const { path, definition } of withGround) {
    const theme = definition.theme as unknown as {
      ground: { light: ProductGroundTones; dark: ProductGroundTones };
      accentScale: { base: string; strong: string; contrast: string };
      accentScaleDark?: { base: string; strong: string; contrast: string };
    };

    for (const mode of ["light", "dark"] as const) {
      const g = theme.ground[mode];
      const accent = mode === "dark" ? (theme.accentScaleDark ?? theme.accentScale) : theme.accentScale;
      const name = `${definition.title} (${path}), ${mode}`;

      it(`${name}: body text is comfortably readable on the page and on a surface`, () => {
        expect(contrast(g.text, g.appBg), "text on page").toBeGreaterThanOrEqual(7);
        expect(contrast(g.text, g.surface), "text on surface").toBeGreaterThanOrEqual(7);
      });

      it(`${name}: secondary and helper text stay above 4.5:1, so quiet never means faint`, () => {
        for (const ground of [g.appBg, g.surface]) {
          expect(contrast(g.muted, ground), `muted on ${ground}`).toBeGreaterThanOrEqual(4.5);
          expect(contrast(g.faint, ground), `faint on ${ground}`).toBeGreaterThanOrEqual(4.5);
        }
      });

      it(`${name}: the accent is readable as text, and its button label is readable on it`, () => {
        expect(contrast(accent.base, g.surface), "accent as text").toBeGreaterThanOrEqual(4.5);
        expect(contrast(accent.contrast, accent.base), "label on button").toBeGreaterThanOrEqual(4.5);
        expect(contrast(accent.strong, g.surface), "strong accent as text").toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it("is emitted as a light and a dark value for every token, and only when declared", () => {
    const definition = withGround[0].definition as unknown as { theme: Parameters<typeof productThemeStyle>[0] };
    const style = productThemeStyle(definition.theme) as Record<string, string>;
    for (const token of ["app-bg", "surface", "surface-muted", "surface-strong", "text", "muted", "faint", "border", "border-strong"]) {
      expect(style[`--product-ground-${token}-light`], `${token} light`).toBeTruthy();
      expect(style[`--product-ground-${token}-dark`], `${token} dark`).toBeTruthy();
    }
    const plain = productThemeStyle({ accent: "#123456" } as Parameters<typeof productThemeStyle>[0]) as Record<string, string>;
    expect(Object.keys(plain).filter((key) => key.startsWith("--product-ground"))).toEqual([]);
    expect(hasProductGround({} as Parameters<typeof hasProductGround>[0])).toBe(false);
  });

  it("is refused when only one theme is authored", () => {
    const definition = withGround[0].definition as unknown as { theme: { ground: { light: unknown } } };
    const half = { ...definition, theme: { ...definition.theme, ground: { light: definition.theme.ground.light } } };
    expect(productDefinitionSchema.safeParse(half).success).toBe(false);
  });

  it("reaches the page: both shells carry the attribute, and the stylesheet picks the pair in all three theme states", () => {
    for (const shell of ["ProductShell.tsx", "ProductRailShell.tsx"]) {
      const source = readFileSync(join(process.cwd(), "src/components/product-shell", shell), "utf8");
      expect(source, `${shell} never marks a declaring product`).toContain("data-product-ground");
      expect(source).toContain("hasProductGround(definition.theme)");
    }
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toContain("[data-product-theme][data-product-ground] {");
    expect(css).toContain(':root[data-theme="dark"] [data-product-theme][data-product-ground]');
    expect(css).toContain(':root:not([data-theme="light"]) [data-product-theme][data-product-ground]');
    const tokens = ["app-bg", "surface", "surface-muted", "surface-strong", "text", "muted", "faint", "border", "border-strong"];
    for (const token of tokens) {
      expect(css, `${token} light`).toContain(`--${token}: var(--product-ground-${token}-light);`);
      expect(css, `${token} dark`).toContain(`--${token}: var(--product-ground-${token}-dark);`);
    }
  });
});
