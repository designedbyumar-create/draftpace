import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

/**
 * The guards behind the first-run tour.
 *
 * The bug these exist for: Monthly Money Reset's first tour step
 * spotlights "Since you were last here", a surface computeSinceLastHere()
 * suppresses whenever there is no prior confirmed check-in, which is
 * always true on a first visit. The old component answered a missing
 * target by dimming the entire screen and centring the popover, so the
 * first thing a new owner ever saw was a tour step describing something
 * that was not on the page.
 *
 * A first-run tour runs against an empty product by definition, so an
 * absent target is the normal case rather than an edge case.
 */

const TOUR = path.resolve(process.cwd(), "src/components/platform/GuidedTour.tsx");
const source = readFileSync(TOUR, "utf8");

/**
 * The tour renders through a portal into document.body, which is outside
 * the shell root carrying `data-product-theme` and the accent pairs.
 * Custom properties inherit down the DOM and a portal is not a
 * descendant, so without carrying the theme across, a steel product's
 * tour showed a teal "Next" button: the platform accent, inside a
 * product, which is the exact mistake the two button registers exist to
 * prevent. Confirmed live before this guard was written (the button
 * computed rgb(86, 83, 73), Vehicle Maintenance Companion's own
 * #565349, only after the fix).
 */
describe("GuidedTour carries the product's accent across its portal", () => {
  it("portals into document.body, which is why the theme has to be copied at all", () => {
    expect(source).toContain("createPortal(");
    expect(source).toContain("document.body");
  });

  it("copies the shell's own accent custom properties onto the portal root", () => {
    expect(source).toContain("PRODUCT_THEME_ATTRIBUTE");
    expect(source).toContain('name.startsWith("--product-")');
    expect(source).toContain("{...productTheme}");
  });

  it("copies nothing when there is no product shell on the page", () => {
    // A platform-level caller must keep the platform accent, not inherit
    // whatever product happened to render last.
    expect(source).toContain("if (!host) return {};");
  });
});

describe("GuidedTour skips steps it cannot point at", () => {
  it("resolves its steps against the live document rather than trusting the list", () => {
    expect(source).toContain("resolveTarget(s.targetId) !== null");
  });

  it("finishes instead of opening when no step has a target on the page", () => {
    expect(source).toMatch(/liveSteps\.length === 0\) onFinish\(\)/);
  });

  it("never falls back to dimming the whole screen with nothing spotlighted", () => {
    // The old fallback. Its return renders only when a rect exists now.
    expect(source).not.toContain('className="fixed inset-0 bg-[var(--overlay)]"');
    expect(source).toContain("if (!mounted || !step || !rect) return null;");
  });

  it("ignores a target that is in the DOM but has no box, so a responsive duplicate cannot win", () => {
    expect(source).toContain("rect.width > 0 && rect.height > 0");
    expect(source).toContain('[data-tour-id="');
  });

  it("counts steps for the reader out of the ones actually shown", () => {
    expect(source).toContain("of {liveSteps.length}");
  });
});

/**
 * A tour step naming an id that exists nowhere is a typo nobody sees until
 * a real owner runs the tour, at which point the step silently vanishes
 * (which is the correct behaviour, and exactly why it needs a test).
 */
describe("every tour step points at an id that exists in its own product", () => {
  const PRODUCTS = path.resolve(process.cwd(), "src/products");

  function sourcesOf(dir: string, acc: string[] = []): string[] {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) sourcesOf(p, acc);
      else if (p.endsWith(".tsx")) acc.push(p);
    }
    return acc;
  }

  const products = readdirSync(PRODUCTS, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  // Targets a product does not render itself: the two shells mark every
  // destination, and EmptyState is what a first-run screen usually is.
  const sharedSource = [
    "src/components/product-shell/ProductRailShell.tsx",
    "src/components/product-shell/ProductShell.tsx",
    "src/design-system/EmptyState.tsx",
  ]
    .map((f) => readFileSync(path.resolve(process.cwd(), f), "utf8"))
    .join("\n");

  it("checks at least one product with a tour", () => {
    const withTours = products.filter((slug) =>
      sourcesOf(path.join(PRODUCTS, slug)).some((f) => /targetId:\s*"/.test(readFileSync(f, "utf8")))
    );
    expect(withTours.length).toBeGreaterThan(0);
  });

  it("finds a matching id for every targetId", () => {
    for (const slug of products) {
      const dir = path.join(PRODUCTS, slug);
      if (!existsSync(dir)) continue;
      const files = sourcesOf(dir);
      const all = files.map((f) => readFileSync(f, "utf8")).join("\n");
      const targets = [...all.matchAll(/targetId:\s*"([^"]+)"/g)].map((m) => m[1]);
      for (const target of targets) {
        const inProduct = all.includes(`id="${target}"`) || all.includes(`data-tour-id="${target}"`);
        // The shared rail marks every destination with data-tour-id, so a
        // step may legitimately point at navigation rather than at
        // something the product itself renders.
        const inShell =
          (target.startsWith("rail-") && sharedSource.includes("data-tour-id={`rail-${id}`}")) ||
          sharedSource.includes(`data-tour-id="${target}"`);
        expect(
          inProduct || inShell,
          `${slug} has a tour step targeting "${target}" but nothing carries that id`
        ).toBe(true);
      }
    }
  });
});
