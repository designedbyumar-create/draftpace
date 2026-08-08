import { describe, expect, it } from "vitest";
import { resolveDominantAction } from "./dominantAction";
import type { AttentionItem } from "../attention";
import type { CapabilityRow } from "./capability";

function capability(overrides: Partial<CapabilityRow> = {}): CapabilityRow {
  return {
    key: "availableMoney",
    label: "Available Money",
    status: "ready",
    detail: "Ready",
    valueMinorUnits: 100000,
    explain: null,
    ...overrides,
  };
}

function attention(kind: AttentionItem["kind"], overrides: Partial<AttentionItem> = {}): AttentionItem {
  return {
    id: `${kind}:x`,
    kind,
    urgency: "needsResolution",
    area: "bills",
    entityId: "x",
    message: `${kind} message`,
    deepLink: "/app/products/personal-finance-companion/bills",
    ...overrides,
  };
}

const READY_CAPABILITIES: CapabilityRow[] = [capability()];

describe("resolveDominantAction", () => {
  it("returns null when nothing needs attention and the picture is complete", () => {
    expect(resolveDominantAction(READY_CAPABILITIES, [], 0)).toBeNull();
  });

  it("prioritizes negative Available Money above everything else", () => {
    const capabilities = [capability({ valueMinorUnits: -500 })];
    const result = resolveDominantAction(capabilities, [attention("billMissingDueDate")], 3);
    expect(result?.message).toContain("negative");
  });

  it("prioritizes an overdue income expectation over a missing due date", () => {
    const result = resolveDominantAction(READY_CAPABILITIES, [attention("billMissingDueDate"), attention("incomeExpectationOverdue")], 0);
    expect(result?.message).toBe("incomeExpectationOverdue message");
  });

  it("prioritizes unreviewed imports over a stale account balance", () => {
    const result = resolveDominantAction(READY_CAPABILITIES, [attention("accountStale")], 2);
    expect(result?.message).toContain("2 imported records");
  });

  it("falls back to continuing Companion when a capability is still waiting", () => {
    const capabilities = [capability({ status: "waiting", valueMinorUnits: null })];
    const result = resolveDominantAction(capabilities, [], 0);
    expect(result?.message).toContain("Continue building");
  });

  it("uses singular phrasing for exactly one waiting import", () => {
    const result = resolveDominantAction(READY_CAPABILITIES, [], 1);
    expect(result?.message).toBe("1 imported record is waiting for review.");
  });
});
