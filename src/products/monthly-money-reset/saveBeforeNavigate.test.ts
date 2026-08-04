import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regression coverage for the MMR reliability pass, 2026-08-04: several
 * actions (Setup's final save, Settings' pause and reset, History's
 * month-close) used to call router.push()/complete a lifecycle transition
 * unconditionally, regardless of whether the save they depended on actually
 * succeeded. This repo has no component-render test harness (no jsdom, no
 * Playwright — see the P0 incident report), so this guards the invariant
 * structurally: every consequential navigation call must be textually
 * preceded, in the same function, by an early return gated on the save
 * result. It will not catch a logic bug inside the gate, but it will catch
 * the exact regression class this pass fixed — an unconditional call
 * reappearing ungated.
 */

const componentsRoot = join(process.cwd(), "src/products/monthly-money-reset/components");

function readComponent(name: string): string {
  return readFileSync(join(componentsRoot, name), "utf-8");
}

describe("SetupModule: navigation to Workspace is gated on the final save", () => {
  const source = readComponent("SetupModule.tsx");

  it("checks forceSave()'s result before advancing a step or navigating", () => {
    expect(source).toContain("const stepSaved = await forceSave();");
    expect(source).toContain("if (!stepSaved) return;");
    expect(source).toContain("const finished = await forceSave();");
    expect(source).toContain("if (!finished) return;");
  });

  it("the Workspace navigation appears after its gate, not before it", () => {
    const gateIndex = source.indexOf("if (!finished) return;");
    const navIndex = source.indexOf("router.push(`/app/products/${definition.slug}/workspace`)");
    expect(gateIndex).toBeGreaterThan(-1);
    expect(navIndex).toBeGreaterThan(-1);
    expect(gateIndex).toBeLessThan(navIndex);
  });
});

describe("SettingsModule: pause and reset are gated on their save/RPC result", () => {
  const source = readComponent("SettingsModule.tsx");

  it("pauseProduct checks setProductInstanceLifecycle's result before navigating", () => {
    const callIndex = source.indexOf("setProductInstanceLifecycle(instanceId, \"paused\")");
    const gateIndex = source.indexOf("if (!result.ok)");
    const navIndex = source.indexOf('router.push("/app/library")');
    expect(callIndex).toBeGreaterThan(-1);
    expect(gateIndex).toBeGreaterThan(callIndex);
    expect(navIndex).toBeGreaterThan(gateIndex);
  });

  it("resetCurrentMonth checks forceSave's result before navigating to Setup", () => {
    const gateIndex = source.indexOf("if (!ok) {");
    const navIndex = source.indexOf("router.push(`/app/products/${definition.slug}/setup`)");
    expect(gateIndex).toBeGreaterThan(-1);
    expect(navIndex).toBeGreaterThan(-1);
    expect(gateIndex).toBeLessThan(navIndex);
  });
});

describe("HistoryModule: month-close navigation only follows a fully-ok close sequence", () => {
  const source = readComponent("HistoryModule.tsx");

  it("gates navigation on result.status === \"ok\" from runCloseSequence", () => {
    expect(source).toContain('result.status === "ok"');
    const gateIndex = source.indexOf('result.status === "ok"');
    const navIndex = source.indexOf("router.push(`/app/products/${definition.slug}/setup`)");
    expect(gateIndex).toBeGreaterThan(-1);
    expect(navIndex).toBeGreaterThan(gateIndex);
  });

  it("delegates the actual sequencing to the tested runCloseSequence function, not inline fire-and-forget calls", () => {
    expect(source).toContain("runCloseSequence(");
    expect(source).not.toMatch(/setProductInstanceLifecycle\(instanceId, "completed"\);\s*\n\s*const newCycleKey/);
  });
});

describe("QuickAddModal and CheckInModal: apply is awaited and gates the close", () => {
  it("QuickAddModal only closes the dialog once onApply resolves true", () => {
    const source = readComponent("QuickAddModal.tsx");
    expect(source).toContain("const ok = await onApply(next);");
    expect(source).toMatch(/if \(ok\) \{\s*\n\s*onClose\(\);/);
  });

  it("CheckInModal only closes the dialog once onApply resolves true", () => {
    const source = readComponent("CheckInModal.tsx");
    expect(source).toContain("const ok = await onApply({");
    expect(source).toMatch(/if \(ok\) \{\s*\n\s*onClose\(\);/);
  });
});
