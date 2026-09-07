import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * WorkspaceModule can't be rendered in this test environment (no jsdom —
 * same constraint as NextActionCard's wiring tests in nextAction.test.ts),
 * so the tour-replay mechanism is verified structurally.
 *
 * The trigger rules moved out of this product into
 * src/components/platform/useFirstRunTour.ts once seven more products
 * needed them, so the rules themselves are asserted there and this file
 * now checks that Monthly Money Reset consumes them rather than keeping
 * a divergent copy.
 */
const HOOK = path.resolve(process.cwd(), "src/components/platform/useFirstRunTour.ts");
const hook = readFileSync(HOOK, "utf-8");

describe("Guided tour replay wiring", () => {
  it("forces the tour on from a ?tour=1 query param and clears it from the URL", () => {
    expect(hook).toContain('searchParams.get("tour") === "1"');
    expect(hook).toContain("setTourOn(true)");
    expect(hook).toContain("router.replace(`/app/products/${slug}/${destination}`)");
  });

  it("a replay does not reset or corrupt the first-use tour flag", () => {
    // The replay branch returns before ever touching localStorage — the
    // first-use flag read/write below it stays exactly as it was.
    expect(hook).toContain("if (replayRequested) {");
    const replayBranch = hook.slice(hook.indexOf("if (replayRequested) {"), hook.indexOf("if (window.localStorage.getItem"));
    expect(replayBranch).not.toContain("localStorage");
  });

  it("Monthly Money Reset uses the shared trigger rather than its own copy", () => {
    const source = readFileSync(new URL("./WorkspaceModule.tsx", import.meta.url), "utf-8");
    expect(source).toContain('from "@/components/platform/useFirstRunTour"');
    expect(source).toContain("useFirstRunTour(definition.slug, setupDone)");
    // The old inline copy is gone, so the two can never drift apart.
    expect(source).not.toContain("draftpace-tour-");
  });

  it("Settings links to the replay trigger", () => {
    const source = readFileSync(new URL("./SettingsModule.tsx", import.meta.url), "utf-8");
    expect(source).toContain("/workspace?tour=1");
    expect(source).toContain("Replay tour");
  });
});
