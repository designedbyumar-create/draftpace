import { describe, expect, it } from "vitest";
import { deriveReminderCandidates } from "./deriveReminders";
import { diffReminders, type ExistingReminderSummary } from "./diffReminders";
import { resolveEligibility, isWithinQuietHours } from "./eligibility";
import type { Appliance, MaintenanceTask, Problem } from "../state";
import type { HomeManagementCompanionNotificationPreferences } from "../notificationPreferences";

const NOW = new Date("2026-06-15T12:00:00Z");

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
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
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
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z",
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
    createdAt: "2026-06-10T00:00:00Z",
    updatedAt: "2026-06-10T00:00:00Z",
    ...overrides,
  };
}

describe("deriveReminderCandidates", () => {
  it("wraps attention items with the right entity type and a dedupeKey matching the attention item id", () => {
    const task = makeTask();
    const candidates = deriveReminderCandidates({ appliances: [], maintenanceTasks: [task], problems: [] }, NOW);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].kind).toBe("maintenanceDue");
    expect(candidates[0].entityType).toBe("maintenanceTask");
    expect(candidates[0].entityId).toBe("task-1");
    expect(candidates[0].dedupeKey).toBe("maintenanceDue:task-1");
    expect(candidates[0].nextEligibleAt).toEqual(NOW);
  });

  it("maps a warranty item to the appliance entity type", () => {
    const appliance = makeAppliance({ warrantyExpiresAt: "2026-06-20" });
    const candidates = deriveReminderCandidates({ appliances: [appliance], maintenanceTasks: [], problems: [] }, NOW);
    expect(candidates[0].entityType).toBe("appliance");
    expect(candidates[0].kind).toBe("warrantyExpiring");
  });

  it("maps a problem to the problem entity type", () => {
    const candidates = deriveReminderCandidates({ appliances: [], maintenanceTasks: [], problems: [makeProblem()] }, NOW);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].entityType).toBe("problem");
    expect(candidates[0].kind).toBe("problem");
    expect(candidates[0].dedupeKey).toBe("problem:problem-1");
  });

  it("produces no candidates when nothing is due", () => {
    const task = makeTask({ lastDoneAt: "2026-06-10" });
    const candidates = deriveReminderCandidates({ appliances: [], maintenanceTasks: [task], problems: [] }, NOW);
    expect(candidates).toHaveLength(0);
  });

  it("produces zero candidates for a snoozed task, and zero for a snoozed problem, single source of truth with attention.ts", () => {
    const snoozedTask = makeTask({ lastDoneAt: "2026-01-01", snoozedUntil: "2026-06-20T00:00:00.000Z" });
    expect(deriveReminderCandidates({ appliances: [], maintenanceTasks: [snoozedTask], problems: [] }, NOW)).toHaveLength(0);

    const snoozedProblem = makeProblem({ snoozedUntil: "2026-06-20T00:00:00.000Z" });
    expect(deriveReminderCandidates({ appliances: [], maintenanceTasks: [], problems: [snoozedProblem] }, NOW)).toHaveLength(0);
  });
});

describe("diffReminders", () => {
  it("inserts a candidate with no matching existing dedupeKey", () => {
    const candidates = deriveReminderCandidates({ appliances: [], maintenanceTasks: [makeTask()], problems: [] }, NOW);
    const { toInsert, toCancelIds } = diffReminders(candidates, []);
    expect(toInsert).toHaveLength(1);
    expect(toCancelIds).toHaveLength(0);
  });

  it("leaves an existing scheduled reminder untouched when its candidate still exists", () => {
    const candidates = deriveReminderCandidates({ appliances: [], maintenanceTasks: [makeTask()], problems: [] }, NOW);
    const existing: ExistingReminderSummary[] = [{ id: "row-1", dedupeKey: "maintenanceDue:task-1", status: "scheduled" }];
    const { toInsert, toCancelIds } = diffReminders(candidates, existing);
    expect(toInsert).toHaveLength(0);
    expect(toCancelIds).toHaveLength(0);
  });

  it("cancels a scheduled reminder whose underlying condition resolved", () => {
    const existing: ExistingReminderSummary[] = [{ id: "row-1", dedupeKey: "maintenanceDue:task-1", status: "scheduled" }];
    const { toCancelIds } = diffReminders([], existing);
    expect(toCancelIds).toEqual(["row-1"]);
  });

  it("never touches an already-delivered or already-cancelled row", () => {
    const existing: ExistingReminderSummary[] = [
      { id: "row-1", dedupeKey: "maintenanceDue:task-1", status: "delivered" },
      { id: "row-2", dedupeKey: "warrantyExpiring:appliance-1", status: "cancelled" },
    ];
    const { toCancelIds } = diffReminders([], existing);
    expect(toCancelIds).toHaveLength(0);
  });
});

describe("eligibility", () => {
  const basePreferences: HomeManagementCompanionNotificationPreferences = {
    categories: { maintenanceDue: true, warrantyExpiring: false },
    privacyLevel: "normal",
    timezone: "UTC",
  };

  it("is eligible when the category is on and outside quiet hours", () => {
    const daytime = new Date("2026-06-15T14:00:00Z");
    const result = resolveEligibility("maintenanceDue", basePreferences, daytime);
    expect(result).toEqual({ eligible: true });
  });

  it("is ineligible when the category is off", () => {
    const daytime = new Date("2026-06-15T14:00:00Z");
    const result = resolveEligibility("warrantyExpiring", basePreferences, daytime);
    expect(result).toEqual({ eligible: false, reason: "categoryDisabled" });
  });

  it("is ineligible during quiet hours even with the category on", () => {
    const nighttime = new Date("2026-06-15T23:00:00Z");
    const result = resolveEligibility("maintenanceDue", basePreferences, nighttime);
    expect(result).toEqual({ eligible: false, reason: "quietHours" });
  });

  it("treats 21:00-08:00 local as quiet hours", () => {
    expect(isWithinQuietHours(new Date("2026-06-15T21:00:00Z"), "UTC")).toBe(true);
    expect(isWithinQuietHours(new Date("2026-06-15T07:59:00Z"), "UTC")).toBe(true);
    expect(isWithinQuietHours(new Date("2026-06-15T08:00:00Z"), "UTC")).toBe(false);
    expect(isWithinQuietHours(new Date("2026-06-15T20:59:00Z"), "UTC")).toBe(false);
  });
});
