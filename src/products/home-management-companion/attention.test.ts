import { describe, expect, it } from "vitest";
import { deriveAttentionItems } from "./attention";
import type { Appliance, MaintenanceTask } from "./state";

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
    status: "active",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: isoDaysAgo(5) + "T00:00:00Z",
    updatedAt: isoDaysAgo(5) + "T00:00:00Z",
    ...overrides,
  };
}

function makeAppliance(overrides: Partial<Appliance> = {}): Appliance {
  return {
    id: "appliance-1",
    name: "Water heater",
    category: "appliance",
    brand: null,
    model: null,
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

describe("deriveAttentionItems: maintenance tasks", () => {
  it("flags a task that has never been logged", () => {
    const items = deriveAttentionItems({ appliances: [], maintenanceTasks: [makeTask()] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("maintenanceDue");
    expect(items[0].urgency).toBe("needsResolution");
    expect(items[0].message).toContain("never been logged");
  });

  it("flags an overdue task with the correct day count", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(100) });
    const items = deriveAttentionItems({ appliances: [], maintenanceTasks: [task] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].message).toBe("Change HVAC filter is 10 days overdue.");
  });

  it("says 'due today' when the cadence lands exactly on today", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(90) });
    const items = deriveAttentionItems({ appliances: [], maintenanceTasks: [task] }, NOW);
    expect(items[0].message).toBe("Change HVAC filter is due today.");
  });

  it("does not flag a task that is not yet due", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(10) });
    const items = deriveAttentionItems({ appliances: [], maintenanceTasks: [task] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("excludes archived tasks even when overdue", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(200), status: "archived" });
    const items = deriveAttentionItems({ appliances: [], maintenanceTasks: [task] }, NOW);
    expect(items).toHaveLength(0);
  });
});

describe("deriveAttentionItems: appliance warranties", () => {
  it("flags a warranty expiring within the window", () => {
    const appliance = makeAppliance({ warrantyExpiresAt: isoDaysFromNow(15) });
    const items = deriveAttentionItems({ appliances: [appliance], maintenanceTasks: [] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("warrantyExpiring");
    expect(items[0].urgency).toBe("worthAWhile");
    expect(items[0].message).toBe("Water heater's warranty expires in 15 days.");
  });

  it("does not flag a warranty expiring well in the future", () => {
    const appliance = makeAppliance({ warrantyExpiresAt: isoDaysFromNow(45) });
    const items = deriveAttentionItems({ appliances: [appliance], maintenanceTasks: [] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("flags an already-expired warranty with a past-tense message", () => {
    const appliance = makeAppliance({ warrantyExpiresAt: isoDaysAgo(5) });
    const items = deriveAttentionItems({ appliances: [appliance], maintenanceTasks: [] }, NOW);
    expect(items[0].message).toBe("Water heater's warranty expired 5 days ago.");
  });

  it("ignores an appliance with no warranty date on file", () => {
    const appliance = makeAppliance({ warrantyExpiresAt: null });
    const items = deriveAttentionItems({ appliances: [appliance], maintenanceTasks: [] }, NOW);
    expect(items).toHaveLength(0);
  });

  it("excludes archived appliances even with an expiring warranty", () => {
    const appliance = makeAppliance({ warrantyExpiresAt: isoDaysFromNow(5), status: "archived" });
    const items = deriveAttentionItems({ appliances: [appliance], maintenanceTasks: [] }, NOW);
    expect(items).toHaveLength(0);
  });
});
