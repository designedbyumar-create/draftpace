import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards for the design-system consolidation done before the production
 * freeze. Each of these encodes a rule that was actually broken at least
 * once, not a hypothetical one.
 */

const ROOT = join(process.cwd(), "src");
const GLOBALS = readFileSync(join(ROOT, "app/globals.css"), "utf8");

/** Token prefixes set as inline styles at runtime, never in globals.css. */
const RUNTIME_SCOPED = ["--product", "--mmr", "--area"];

/** Every .tsx under the given src-relative directories, recursively. */
function tsxUnder(...dirs: string[]): { path: string; source: string }[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".tsx")) found.push(full);
    }
  };
  for (const dir of dirs) walk(join(ROOT, dir));
  return found.map((path) => ({ path, source: readFileSync(path, "utf8") }));
}

/**
 * Token names a component may legitimately reference: everything
 * globals.css declares, plus the font variables next/font injects onto
 * <html> from src/lib/fonts.ts. Read from fonts.ts rather than allowed by
 * prefix, so deleting a font there still fails this test.
 */
function declaredTokens(): Set<string> {
  const fonts = readFileSync(join(ROOT, "lib/fonts.ts"), "utf8");
  return new Set([
    ...[...GLOBALS.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]),
    ...[...fonts.matchAll(/variable:\s*"(--[a-z0-9-]+)"/gi)].map((m) => m[1]),
  ]);
}

describe("design tokens", () => {
  /**
   * The bug this catches really happened: two components referenced
   * var(--on-primary,#fff), a token that was never declared. CSS silently
   * used the #fff fallback, which is correct in light and wrong in dark
   * (where --primary is a light teal needing dark text). A fallback makes
   * a missing token invisible, so nothing surfaced it.
   */
  it("never references a custom property that globals.css does not declare", () => {
    const declared = declaredTokens();
    const offenders: string[] = [];

    for (const { path, source } of tsxUnder("app", "components", "design-system")) {
      for (const [, token] of source.matchAll(/var\((--[a-z0-9-]+)\s*[,)]/gi)) {
        // Scoped tokens injected at runtime as inline styles rather than
        // declared globally: productThemeStyle() and each product's own
        // ThemeScope set --product-*/--mmr-*, and the guides layer's
        // areaIdentity() sets --area/--area-soft per life area. All are
        // legitimately absent from globals.css.
        if (RUNTIME_SCOPED.some((prefix) => token === prefix || token.startsWith(`${prefix}-`))) continue;
        if (!declared.has(token)) offenders.push(`${path.replace(ROOT, "src")}: ${token}`);
      }
    }

    expect(offenders, `undeclared tokens:\n${offenders.join("\n")}`).toEqual([]);
  });

  /**
   * Three theme blocks exist (light, [data-theme="dark"], and the
   * prefers-color-scheme copy for [data-theme="system"]). A colour
   * declared in only one of the two dark blocks renders one theme's text
   * on the other theme's ground for anybody on the default "system"
   * setting.
   */
  it("declares every dark-mode token in both the explicit-dark and system-dark blocks", () => {
    const explicitDark = GLOBALS.split('html[data-theme="dark"] {')[1]?.split("\n}")[0] ?? "";
    const systemDark = GLOBALS.split('html[data-theme="system"] {')[1]?.split("\n  }")[0] ?? "";
    expect(explicitDark).not.toBe("");
    expect(systemDark).not.toBe("");

    const names = (block: string) => new Set([...block.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]));
    const inExplicit = names(explicitDark);
    const inSystem = names(systemDark);

    expect([...inExplicit].filter((t) => !inSystem.has(t))).toEqual([]);
    expect([...inSystem].filter((t) => !inExplicit.has(t))).toEqual([]);
  });

  it("declares the brand-ink set in light and both dark blocks", () => {
    for (const token of ["--brand-ink", "--brand-ink-soft", "--brand-ink-contrast"]) {
      const declarations = [...GLOBALS.matchAll(new RegExp(`^\\s*${token}\\s*:`, "gim"))];
      expect(declarations.length, `${token} should be declared 3 times`).toBe(3);
    }
  });

  /**
   * The primary button's gradient must follow whatever accent is in
   * scope: brand teal on marketing, and each product's own accent inside
   * /app/products, where productThemeStyle() reassigns --primary.
   *
   * Two things are asserted, and the second is the subtle one. A custom
   * property containing var(--primary) is substituted where it is
   * DECLARED, so declaring the gradient on html bakes in html's teal and
   * inherits it into every product shell, turning every product's button
   * Draftpace teal. It therefore has to be a real property in a class,
   * which resolves against the button itself. That regression was real,
   * caught in the browser, and this is the guard against it returning.
   */
  it("derives the primary button gradient from --primary, as a class rather than a token", () => {
    const rule = GLOBALS.match(/\.btn-fill-primary\s*\{([^}]+)\}/)?.[1] ?? "";
    expect(rule).toContain("background-image");
    expect(rule).toContain("var(--primary)");
    // #fff / #000 are the mix partners that make the light and shade
    // stops; a full 6-digit hex would mean a literal accent was pasted in.
    expect(rule).not.toMatch(/#[0-9a-f]{6}/i);

    // The gradient must NOT be reintroduced as a custom property.
    expect(GLOBALS).not.toMatch(/--btn-(primary|secondary)-bg\s*:/);
  });
});

describe("elevation", () => {
  /**
   * The bug this catches shipped and stayed invisible for a long time:
   * Tailwind cannot tell whether an arbitrary value is a colour or a
   * shadow, and for `shadow-[var(--shadow-soft)]` it guesses colour. It
   * emits `--tw-shadow-color: var(--shadow-soft); --tw-shadow:
   * var(--tw-shadow-colored)`, and since nothing sets --tw-shadow-colored
   * the element computes to `box-shadow: none`.
   *
   * Every one of the 50 shadow usages in this repo was written that way,
   * so the entire elevation system, including all button material, had
   * never actually rendered in a browser. The `shadow:` type hint is what
   * forces Tailwind to treat the value as a shadow.
   */
  it("uses the shadow: type hint on every token-valued shadow utility", () => {
    const offenders: string[] = [];
    for (const { path, source } of tsxUnder("app", "components", "design-system", "products")) {
      for (const [match] of source.matchAll(/shadow-\[var\(--[a-z0-9-]+\)\]/g)) {
        offenders.push(`${path.replace(ROOT, "src")}: ${match}`);
      }
    }
    expect(
      offenders,
      `these compute to box-shadow:none, use shadow-[shadow:var(--x)]:\n${offenders.join("\n")}`
    ).toEqual([]);
  });
});

describe("colour semantics: teal acts, ink labels", () => {
  /**
   * The rule: --primary (teal) means "you can act on this"; --brand-ink
   * means "this is a label". Before consolidation the same area chip was
   * teal on the homepage and near-black on the Shop, and 25 static
   * eyebrows spent the accent on text nobody can click.
   *
   * Scoped to the public marketing layer on purpose: inside
   * src/products/** , --primary is reassigned to that product's own
   * accent, so an eyebrow there is the product's colour, not teal, and is
   * correct as it stands.
   */
  it("keeps static eyebrow labels off the accent in the public layer", () => {
    const offenders: string[] = [];
    for (const { path, source } of tsxUnder("app/(marketing)", "components/public")) {
      for (const [match] of source.matchAll(/uppercase tracking-\[0\.1[0-9]em\][^"'`]*?text-\[var\(--primary\)\]/g)) {
        offenders.push(`${path.replace(ROOT, "src")}: ${match.trim()}`);
      }
    }
    // HowItWorksFlow's active step and LivingAnatomy's "Recalculated"
    // result are active-state indicators paired with a teal circle or
    // border, not static labels, and are written with the colour in a
    // conditional rather than inline, so they do not match this shape.
    expect(offenders, `static eyebrows still using the accent:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("uses one shared treatment for the area chips on the homepage and the Shop", () => {
    const picker = readFileSync(join(ROOT, "components/public/home/CompanionPicker.tsx"), "utf8");
    const shop = readFileSync(join(ROOT, "app/(marketing)/shop/ShopGrid.tsx"), "utf8");
    for (const source of [picker, shop]) {
      expect(source).toContain("bg-[var(--brand-ink)]");
      expect(source).toContain("text-[var(--brand-ink-contrast)]");
    }
  });
});
