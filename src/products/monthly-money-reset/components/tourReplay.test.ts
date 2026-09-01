import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * WorkspaceModule can't be rendered in this test environment (no jsdom —
 * same constraint as NextActionCard's wiring tests in nextAction.test.ts),
 * so the tour-replay mechanism is verified structurally: a `?tour=1` query
 * param must force the tour on and then be stripped from the URL, without
 * touching the first-use localStorage flag that the normal first-visit
 * trigger reads and writes.
 */
describe("Guided tour replay wiring", () => {
  it("WorkspaceModule forces the tour on from a ?tour=1 query param and clears it from the URL", () => {
    const source = readFileSync(new URL("./WorkspaceModule.tsx", import.meta.url), "utf-8");
    expect(source).toContain('searchParams.get("tour") === "1"');
    expect(source).toContain("setTourOn(true)");
    expect(source).toContain("router.replace(`/app/products/${definition.slug}/workspace`)");
  });

  it("a replay does not reset or corrupt the first-use tour flag", () => {
    const source = readFileSync(new URL("./WorkspaceModule.tsx", import.meta.url), "utf-8");
    // The replay branch returns before ever touching localStorage — the
    // first-use flag read/write below it stays exactly as it was.
    expect(source).toContain("if (replayRequested) {");
    const replayBranch = source.slice(source.indexOf("if (replayRequested) {"), source.indexOf("const key = `draftpace-tour-"));
    expect(replayBranch).not.toContain("localStorage");
  });

  it("Settings links to the replay trigger", () => {
    const source = readFileSync(new URL("./SettingsModule.tsx", import.meta.url), "utf-8");
    expect(source).toContain("/workspace?tour=1");
    expect(source).toContain("Replay tour");
  });
});
