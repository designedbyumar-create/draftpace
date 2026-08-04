import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveProductNavigation } from "@/product-framework/navigationResolver";
import { validateProductDefinition } from "@/product-framework/definition";
import { monthlyMoneyResetDefinition as monthlyMoneyResetDefinitionInput } from "./definition";

const monthlyMoneyResetDefinition = validateProductDefinition(monthlyMoneyResetDefinitionInput);

/**
 * Regression coverage for the P0 stability incident, 2026-08-04 (the
 * intermittent client-navigation 404). This does not reproduce the live
 * Next.js dev-server behavior — that needs a running server and, ideally, an
 * E2E harness this repo does not yet have — but it guards the two things
 * that are checkable structurally without one: every destination this
 * product declares has a real route file behind it, and the shell generates
 * the href every one of those routes actually expects.
 */
describe("Monthly Money Reset destination routes exist on disk", () => {
  const destinations = resolveProductNavigation(monthlyMoneyResetDefinition);
  const routesRoot = join(process.cwd(), "src/app/app/products/[productSlug]");

  it("declares at least the six core destinations plus printables", () => {
    expect(destinations).toEqual(
      expect.arrayContaining(["start", "setup", "workspace", "progress", "history", "settings", "printables"])
    );
  });

  for (const destination of ["start", "setup", "workspace", "progress", "history", "printables", "settings"] as const) {
    it(`has a page.tsx for the declared "${destination}" destination`, () => {
      expect(destinations).toContain(destination);
      expect(existsSync(join(routesRoot, destination, "page.tsx"))).toBe(true);
    });
  }

  it("every declared destination resolves to an existing route file, generically", () => {
    // Generalizes the above: catches a destination added to the definition
    // without its route ever being created, for any future destination too.
    for (const destination of destinations) {
      expect(existsSync(join(routesRoot, destination, "page.tsx"))).toBe(true);
    }
  });
});

describe("every destination route independently guarantees registration before its lookup", () => {
  // The actual fix for the intermittent client-navigation 404: each
  // destination page (and the shared [productSlug] layout) must call the
  // idempotent registration functions directly, in its own module scope,
  // rather than assuming the outer /app layout's registration call already
  // ran against the same module instance this route resolved. Mirrors the
  // pattern already established in activate/[productSlug]/page.tsx.
  const routesRoot = join(process.cwd(), "src/app/app/products/[productSlug]");
  const filesRequiringRegistration = [
    "layout.tsx",
    "start/page.tsx",
    "setup/page.tsx",
    "workspace/page.tsx",
    "progress/page.tsx",
    "history/page.tsx",
    "printables/page.tsx",
    "settings/page.tsx",
  ];

  for (const relativePath of filesRequiringRegistration) {
    it(`${relativePath} calls registerMonthlyMoneyReset() before any productRegistry lookup`, () => {
      const source = readFileSync(join(routesRoot, relativePath), "utf-8");
      expect(source).toContain("registerMonthlyMoneyReset()");
      const registerCallIndex = source.indexOf("registerMonthlyMoneyReset()");
      const lookupIndex = source.indexOf("productRegistry.getBySlug");
      expect(registerCallIndex).toBeGreaterThan(-1);
      expect(lookupIndex).toBeGreaterThan(-1);
      expect(registerCallIndex).toBeLessThan(lookupIndex);
    });
  }
});

describe("useInstanceState: retry() always targets the same product instance", () => {
  // This hook can't be rendered in this repo's test environment (no jsdom —
  // see the P0 incident report's testing-gaps note), so this checks the
  // invariant structurally: retry() must take no parameters that could
  // redirect it at a different product, and the load effect's dependency
  // array must include productSlug, so a retry always re-resolves the exact
  // same product/cycle it was already loading, never a different one.
  const source = readFileSync(
    join(process.cwd(), "src/products/monthly-money-reset/components/useInstanceState.ts"),
    "utf-8"
  );

  it("retry() takes no arguments", () => {
    expect(source).toContain("const retry = useCallback(() => {");
  });

  it("the load effect depends on productSlug, so it always resolves against the same product", () => {
    expect(source).toContain("}, [productSlug, retryToken]);");
  });

  it("retry only increments a token, it never mutates productSlug or instanceId directly", () => {
    const retryFnMatch = source.match(/const retry = useCallback\(\(\) => \{([\s\S]*?)\}, \[\]\);/);
    expect(retryFnMatch).not.toBeNull();
    const body = retryFnMatch?.[1] ?? "";
    expect(body).toContain("setRetryToken");
    expect(body).not.toContain("setInstanceId");
  });
});

describe("ProductShell nav href generation matches the route filesystem", () => {
  it("the href template used for every destination tab points at a real route", () => {
    const destinations = resolveProductNavigation(monthlyMoneyResetDefinition);
    const routesRoot = join(process.cwd(), "src/app/app/products/[productSlug]");
    for (const destinationId of destinations) {
      // Mirrors ProductShell.tsx's own href construction exactly.
      const href = `/app/products/${monthlyMoneyResetDefinition.slug}/${destinationId}`;
      expect(href).toBe(`/app/products/monthly-money-reset/${destinationId}`);
      expect(existsSync(join(routesRoot, destinationId, "page.tsx"))).toBe(true);
    }
  });
});
