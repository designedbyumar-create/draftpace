import { describe, expect, it } from "vitest";
import { deriveAttentionItems, scoreAttentionUrgency } from "./attention";
import type { Thing, MaintenanceTask, Problem } from "./state";

const NOW = new Date("2026-06-15T12:00:00Z");

function isoDaysAgo(days: number, from: Date = NOW): string {
  const date = new Date(from);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function isoDaysFromNow(days: number, from: Date = NOW): string {
  return isoDaysAgo(-days, from);
}

function makeTask(overrides: Partial<MaintenanceTask> = {}): MaintenanceTask {
  return {
    id: "task-1",
    applianceId: null,
    name: "Change HVAC filter",
    cadenceDays: 90,
    lastDoneAt: null,
    documentLink: null,
    notes: null,
    snoozedUntil: null,
    status: "active",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: isoDaysAgo(5) + "T00:00:00Z",
    updatedAt: isoDaysAgo(5) + "T00:00:00Z",
    ...overrides,
  };
}

function makeThing(overrides: Partial<Thing> = {}): Thing {
  return {
    id: "thing-1",
    name: "Water heater",
    type: "water-heater",
    brand: null,
    model: null,
    location: null,
    purchaseDate: null,
    installDate: null,
    warrantyExpiresAt: null,
    documentLink: null,
    notes: null,
    status: "active",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: isoDaysAgo(30) + "T00:00:00Z",
    updatedAt: isoDaysAgo(30) + "T00:00:00Z",
    ...overrides,
  };
}

function makeProblem(overrides: Partial<Problem> = {}): Problem {
  return {
    id: "problem-1",
    thingId: null,
    providerId: null,
    title: "Kitchen faucet is leaking",
    description: null,
    resolutionStatus: "open",
    severity: "moderate",
    effort: "moderate",
    estimatedCostMinorUnits: null,
    actualCostMinorUnits: null,
    scheduledAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    notes: null,
    status: "active",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: isoDaysAgo(2) + "T00:00:00Z",
    updatedAt: isoDaysAgo(2) + "T00:00:00Z",
    ...overrides,
  };
}

describe("deriveAttentionItems: maintenance tasks", () => {
  it("flags a task that has never been logged", () => {
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [makeTask()], problems: [] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("maintenanceDue");
    expect(items[0].urgency).toBe("needsResolution");
    expect(items[0].message).toContain("never been logged");
  });

  it("flags an overdue task with the correct day count", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(100) });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [task], problems: [] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].message).toBe("Change HVAC filter is 10 days overdue.");
  });

  it("says 'due today' when the cadence lands exactly on today", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(90) });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [task], problems: [] }, NOW);
    expect(items[0].message).toBe("Change HVAC filter is due today.");
  });

  it("does not flag a task that is not yet due", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(10) });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [task], problems: [] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("excludes archived tasks even when overdue", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(200), status: "archived" });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [task], problems: [] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("excludes an overdue task that is still snoozed", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(100), snoozedUntil: isoDaysFromNow(3) + "T00:00:00.000Z" });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [task], problems: [] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("includes an overdue task once its snooze has lapsed", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(100), snoozedUntil: isoDaysAgo(1) + "T00:00:00.000Z" });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [task], problems: [] }, NOW);
    expect(items).toHaveLength(1);
  });
});

describe("deriveAttentionItems: thing warranties", () => {
  it("flags a warranty expiring within the window", () => {
    const thing = makeThing({ warrantyExpiresAt: isoDaysFromNow(15) });
    const items = deriveAttentionItems({ things: [thing], maintenanceTasks: [], problems: [] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("warrantyExpiring");
    expect(items[0].urgency).toBe("worthAWhile");
    expect(items[0].message).toBe("Water heater's warranty expires in 15 days.");
  });

  it("does not flag a warranty expiring well in the future", () => {
    const thing = makeThing({ warrantyExpiresAt: isoDaysFromNow(45) });
    const items = deriveAttentionItems({ things: [thing], maintenanceTasks: [], problems: [] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("flags an already-expired warranty with a past-tense message", () => {
    const thing = makeThing({ warrantyExpiresAt: isoDaysAgo(5) });
    const items = deriveAttentionItems({ things: [thing], maintenanceTasks: [], problems: [] }, NOW);
    expect(items[0].message).toBe("Water heater's warranty expired 5 days ago.");
  });

  it("ignores a thing with no warranty date on file", () => {
    const thing = makeThing({ warrantyExpiresAt: null });
    const items = deriveAttentionItems({ things: [thing], maintenanceTasks: [], problems: [] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("excludes archived things even with an expiring warranty", () => {
    const thing = makeThing({ warrantyExpiresAt: isoDaysFromNow(5), status: "archived" });
    const items = deriveAttentionItems({ things: [thing], maintenanceTasks: [], problems: [] }, NOW);
    expect(items).toHaveLength(0);
  });
});

describe("deriveAttentionItems: problems", () => {
  it("flags an open problem", () => {
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [], problems: [makeProblem()] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("problem");
    expect(items[0].message).toBe("Kitchen faucet is leaking");
  });

  it("scores an urgent, high-cost, quick-fix problem as needing resolution", () => {
    const problem = makeProblem({ severity: "urgent", effort: "quick", estimatedCostMinorUnits: 60_000 });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [], problems: [problem] }, NOW);
    expect(items[0].urgency).toBe("needsResolution");
  });

  it("scores a minor, low-cost, big-job problem as only worth a while", () => {
    const problem = makeProblem({ severity: "minor", effort: "bigJob", estimatedCostMinorUnits: null });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [], problems: [problem] }, NOW);
    expect(items[0].urgency).toBe("worthAWhile");
  });

  it("excludes a resolved problem", () => {
    const problem = makeProblem({ resolutionStatus: "resolved" });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [], problems: [problem] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("excludes an archived problem", () => {
    const problem = makeProblem({ status: "archived" });
    const items = deriveAttentionItems({ things: [], maintenanceTasks: [], problems: [problem] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("excludes a snoozed problem, and includes it again once the snooze lapses", () => {
    const snoozed = makeProblem({ snoozedUntil: isoDaysFromNow(3) + "T00:00:00.000Z" });
    expect(deriveAttentionItems({ things: [], maintenanceTasks: [], problems: [snoozed] }, NOW)).toHaveLength(0);

    const lapsed = makeProblem({ snoozedUntil: isoDaysAgo(1) + "T00:00:00.000Z" });
    expect(deriveAttentionItems({ things: [], maintenanceTasks: [], problems: [lapsed] }, NOW)).toHaveLength(1);
  });
});

describe("scoreAttentionUrgency", () => {
  it("treats a fully neutral, not-yet-due item as only worth a while", () => {
    expect(scoreAttentionUrgency({ overdueDays: 0, consequence: 0, effort: 0, cost: 0 })).toBe("worthAWhile");
  });

  it("treats high consequence as needing resolution even with no other factor", () => {
    expect(scoreAttentionUrgency({ overdueDays: 0, consequence: 2, effort: 0, cost: 0 })).toBe("needsResolution");
  });

  it("treats a large enough overdue count as needing resolution on its own", () => {
    expect(scoreAttentionUrgency({ overdueDays: 10, consequence: 0, effort: 0, cost: 0 })).toBe("needsResolution");
  });

  it("lets high effort pull a borderline score back down", () => {
    const withoutEffort = scoreAttentionUrgency({ overdueDays: 0, consequence: 1, effort: 0, cost: 0 });
    const withEffort = scoreAttentionUrgency({ overdueDays: 0, consequence: 1, effort: 2, cost: 0 });
    expect(withoutEffort).toBe("needsResolution");
    expect(withEffort).toBe("worthAWhile");
  });
});
