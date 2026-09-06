import { describe, expect, it } from "vitest";
import { deriveAttentionItems, deriveHomeState, scoreAttentionUrgency } from "./attention";
import type { HomeItem, MaintenanceTask, MaintenanceLogEntry, Problem } from "./state";

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
    careTemplateId: null,
    status: "active",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: isoDaysAgo(5) + "T00:00:00Z",
    updatedAt: isoDaysAgo(5) + "T00:00:00Z",
    ...overrides,
  };
}

function makeHomeItem(overrides: Partial<HomeItem> = {}): HomeItem {
  return {
    id: "item-1",
    name: "Water heater",
    type: "water-heater",
    brand: null,
    model: null,
    location: null,
    purchaseDate: null,
    installDate: null,
    warrantyExpiresAt: null,
    buySpec: null,
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

const EMPTY = { homeItems: [], maintenanceTasks: [], problems: [] };

describe("deriveAttentionItems: care", () => {
  it("surfaces a task that has never been logged, without calling it a failure", () => {
    const items = deriveAttentionItems({ ...EMPTY, maintenanceTasks: [makeTask()] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("maintenanceDue");
    expect(items[0].title).toBe("Change HVAC filter");
    expect(items[0].detail).toBe("Not logged yet, usually every 3 months");
  });

  it("states elapsed time and the usual interval instead of a countdown", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(120) });
    const items = deriveAttentionItems({ ...EMPTY, maintenanceTasks: [task] }, NOW);
    expect(items[0].detail).toBe("Last done 4 months ago, usually every 3 months");
  });

  it("never uses the word overdue anywhere in its output", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(221) });
    const items = deriveAttentionItems({ ...EMPTY, maintenanceTasks: [task] }, NOW);
    expect(JSON.stringify(items).toLowerCase()).not.toContain("overdue");
  });

  it("does not surface a task that is not yet due", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(10) });
    expect(deriveAttentionItems({ ...EMPTY, maintenanceTasks: [task] }, NOW)).toHaveLength(0);
  });

  it("excludes archived tasks even when long past due", () => {
    const task = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(200), status: "archived" });
    expect(deriveAttentionItems({ ...EMPTY, maintenanceTasks: [task] }, NOW)).toHaveLength(0);
  });

  it("excludes a task that is still snoozed, and includes it once the snooze lapses", () => {
    const snoozed = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(100), snoozedUntil: isoDaysFromNow(3) + "T00:00:00.000Z" });
    expect(deriveAttentionItems({ ...EMPTY, maintenanceTasks: [snoozed] }, NOW)).toHaveLength(0);

    const lapsed = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(100), snoozedUntil: isoDaysAgo(1) + "T00:00:00.000Z" });
    expect(deriveAttentionItems({ ...EMPTY, maintenanceTasks: [lapsed] }, NOW)).toHaveLength(1);
  });
});

describe("deriveAttentionItems: urgency comes from real consequence", () => {
  it("treats a just-due safety job as more urgent than a long-neglected cosmetic one", () => {
    // Dryer vent is a fire risk (consequence 2) and is exactly due.
    const dryerVent = makeTask({
      id: "vent",
      name: "Clean the dryer vent",
      careTemplateId: "dryer.vent",
      cadenceDays: 365,
      lastDoneAt: isoDaysAgo(365),
    });
    // Detergent drawer is cosmetic (consequence 0) and is a year late.
    const drawer = makeTask({
      id: "drawer",
      name: "Clean the detergent drawer",
      careTemplateId: "washer.detergent-drawer",
      cadenceDays: 30,
      lastDoneAt: isoDaysAgo(395),
    });

    const items = deriveAttentionItems({ ...EMPTY, maintenanceTasks: [drawer, dryerVent] }, NOW);
    expect(items[0].entityId).toBe("vent");
    expect(items[0].urgency).toBe("soon");
    expect(items.find((i) => i.entityId === "drawer")?.urgency).toBe("canWait");
  });

  it("falls back to the template matched by task name when no template id is stored", () => {
    const byName = makeTask({ name: "Clean the dryer vent", careTemplateId: null, cadenceDays: 365, lastDoneAt: isoDaysAgo(365) });
    expect(deriveAttentionItems({ ...EMPTY, maintenanceTasks: [byName] }, NOW)[0].urgency).toBe("soon");
  });

  it("scores an unknown, hand-written task neutrally rather than guessing", () => {
    const custom = makeTask({ name: "Polish the doorknobs", careTemplateId: null, cadenceDays: 90, lastDoneAt: isoDaysAgo(95) });
    expect(deriveAttentionItems({ ...EMPTY, maintenanceTasks: [custom] }, NOW)[0].urgency).toBe("canWait");
  });
});

describe("deriveAttentionItems: warranties", () => {
  it("surfaces a warranty inside the window as information, not a job", () => {
    const item = makeHomeItem({ warrantyExpiresAt: isoDaysFromNow(15) });
    const items = deriveAttentionItems({ ...EMPTY, homeItems: [item] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("warrantyExpiring");
    expect(items[0].urgency).toBe("canWait");
    expect(items[0].detail).toBe("Warranty ends in 2 weeks");
  });

  it("does not surface a warranty expiring well in the future", () => {
    const item = makeHomeItem({ warrantyExpiresAt: isoDaysFromNow(45) });
    expect(deriveAttentionItems({ ...EMPTY, homeItems: [item] }, NOW)).toHaveLength(0);
  });

  it("uses past tense once a warranty has ended", () => {
    const item = makeHomeItem({ warrantyExpiresAt: isoDaysAgo(5) });
    expect(deriveAttentionItems({ ...EMPTY, homeItems: [item] }, NOW)[0].detail).toBe("Warranty ended 5 days ago");
  });

  it("ignores an item with no warranty date, and archived items", () => {
    expect(deriveAttentionItems({ ...EMPTY, homeItems: [makeHomeItem({ warrantyExpiresAt: null })] }, NOW)).toHaveLength(0);
    const archived = makeHomeItem({ warrantyExpiresAt: isoDaysFromNow(5), status: "archived" });
    expect(deriveAttentionItems({ ...EMPTY, homeItems: [archived] }, NOW)).toHaveLength(0);
  });

  it("deep-links a warranty to the item it belongs to", () => {
    const item = makeHomeItem({ warrantyExpiresAt: isoDaysFromNow(10) });
    expect(deriveAttentionItems({ ...EMPTY, homeItems: [item] }, NOW)[0].href).toContain("/item/item-1");
  });
});

describe("deriveAttentionItems: problems", () => {
  it("surfaces an open problem using the user's own words as the title", () => {
    const items = deriveAttentionItems({ ...EMPTY, problems: [makeProblem()] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("problem");
    expect(items[0].title).toBe("Kitchen faucet is leaking");
  });

  it("scores an urgent problem as needing attention soon", () => {
    const problem = makeProblem({ severity: "urgent", effort: "quick", estimatedCostMinorUnits: 60_000 });
    expect(deriveAttentionItems({ ...EMPTY, problems: [problem] }, NOW)[0].urgency).toBe("soon");
  });

  it("scores a minor, low-cost, big job as able to wait", () => {
    const problem = makeProblem({ severity: "minor", effort: "bigJob", estimatedCostMinorUnits: null });
    expect(deriveAttentionItems({ ...EMPTY, problems: [problem] }, NOW)[0].urgency).toBe("canWait");
  });

  it("excludes resolved, archived and snoozed problems", () => {
    expect(deriveAttentionItems({ ...EMPTY, problems: [makeProblem({ resolutionStatus: "resolved" })] }, NOW)).toHaveLength(0);
    expect(deriveAttentionItems({ ...EMPTY, problems: [makeProblem({ status: "archived" })] }, NOW)).toHaveLength(0);
    const snoozed = makeProblem({ snoozedUntil: isoDaysFromNow(3) + "T00:00:00.000Z" });
    expect(deriveAttentionItems({ ...EMPTY, problems: [snoozed] }, NOW)).toHaveLength(0);
  });

  it("gives an unattached problem no link rather than a dead route or a link to the page it is already on", () => {
    const items = deriveAttentionItems({ ...EMPTY, problems: [makeProblem({ thingId: null })] }, NOW);
    expect(items[0].href).toBeNull();
  });

  it("deep-links a problem to its item when it has one", () => {
    const items = deriveAttentionItems({ ...EMPTY, problems: [makeProblem({ thingId: "item-1" })] }, NOW);
    expect(items[0].href).toContain("/item/item-1");
  });
});

describe("deriveAttentionItems: ordering", () => {
  it("puts something broken above something merely scheduled at equal weight", () => {
    const problem = makeProblem({ severity: "moderate", effort: "moderate" });
    const task = makeTask({ name: "Polish the doorknobs", cadenceDays: 90, lastDoneAt: isoDaysAgo(91) });
    const items = deriveAttentionItems({ ...EMPTY, maintenanceTasks: [task], problems: [problem] }, NOW);
    expect(items[0].kind).toBe("problem");
  });
});

describe("scoreAttentionUrgency", () => {
  it("treats a safety job as needing attention the moment it is due", () => {
    expect(scoreAttentionUrgency({ intervalsLate: 0, consequence: 2, effort: 0, cost: 0 })).toBe("soon");
  });

  it("keeps a cosmetic job patient no matter how late it gets", () => {
    expect(scoreAttentionUrgency({ intervalsLate: 50, consequence: 0, effort: 0, cost: 0 })).toBe("canWait");
  });

  it("caps lateness so an ignored item cannot climb forever", () => {
    const twoLate = scoreAttentionUrgency({ intervalsLate: 2, consequence: 0, effort: 0, cost: 0 });
    const wildlyLate = scoreAttentionUrgency({ intervalsLate: 200, consequence: 0, effort: 0, cost: 0 });
    expect(twoLate).toBe(wildlyLate);
  });

  it("lets high effort pull a borderline score down", () => {
    expect(scoreAttentionUrgency({ intervalsLate: 0.5, consequence: 1, effort: 0, cost: 0 })).toBe("soon");
    expect(scoreAttentionUrgency({ intervalsLate: 0.5, consequence: 1, effort: 2, cost: 0 })).toBe("canWait");
  });

  it("lets real money at stake raise a problem's urgency", () => {
    expect(scoreAttentionUrgency({ intervalsLate: 0, consequence: 1, effort: 1, cost: 0 })).toBe("canWait");
    expect(scoreAttentionUrgency({ intervalsLate: 0, consequence: 1, effort: 1, cost: 2 })).toBe("soon");
  });
});

describe("deriveHomeState", () => {
  const noEvents = { ...EMPTY, recentEvents: [] };

  function makeLogEntry(overrides: Partial<MaintenanceLogEntry> = {}): MaintenanceLogEntry {
    return {
      id: "log-1",
      taskId: null,
      applianceId: null,
      description: "AC serviced",
      costMinorUnits: null,
      performedAt: isoDaysAgo(14),
      providerId: null,
      performedBy: null,
      notes: null,
      status: "active",
      needsReviewReason: null,
      source: "manual",
      importSessionId: null,
      createdAt: isoDaysAgo(14) + "T00:00:00Z",
      updatedAt: isoDaysAgo(14) + "T00:00:00Z",
      ...overrides,
    };
  }

  it("separates something wrong from care worth doing", () => {
    const state = deriveHomeState(
      { ...noEvents, problems: [makeProblem()], maintenanceTasks: [makeTask()] },
      NOW
    );
    expect(state.somethingWrong).toHaveLength(1);
    expect(state.worthTakingCareOf).toHaveLength(1);
    expect(state.worthTakingCareOf[0].kind).toBe("maintenanceDue");
  });

  it("surfaces care approaching its interval as coming up, not as due", () => {
    const soon = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(75) });
    const state = deriveHomeState({ ...noEvents, maintenanceTasks: [soon] }, NOW);
    expect(state.worthTakingCareOf).toHaveLength(0);
    expect(state.comingUp).toHaveLength(1);
    expect(state.comingUp[0].detail).toBe("Due in 2 weeks");
  });

  it("does not list something as coming up while it is already due", () => {
    const due = makeTask({ cadenceDays: 90, lastDoneAt: isoDaysAgo(120) });
    const state = deriveHomeState({ ...noEvents, maintenanceTasks: [due] }, NOW);
    expect(state.comingUp).toHaveLength(0);
    expect(state.worthTakingCareOf).toHaveLength(1);
  });

  it("reports recent work newest first and forgets old work", () => {
    const state = deriveHomeState(
      {
        ...noEvents,
        recentEvents: [
          makeLogEntry({ id: "old", description: "Gutters cleared", performedAt: isoDaysAgo(200) }),
          makeLogEntry({ id: "new", description: "AC serviced", performedAt: isoDaysAgo(3) }),
          makeLogEntry({ id: "mid", description: "Filter replaced", performedAt: isoDaysAgo(20) }),
        ],
      },
      NOW
    );
    expect(state.recentlyHandled.map((h) => h.title)).toEqual(["AC serviced", "Filter replaced"]);
    expect(state.recentlyHandled[0].when).toBe("3 days ago");
  });

  it("knows the difference between an empty home and a home with nothing due", () => {
    expect(deriveHomeState(noEvents, NOW).nothingTracked).toBe(true);
    const settled = deriveHomeState(
      { ...noEvents, homeItems: [makeHomeItem()], maintenanceTasks: [makeTask({ lastDoneAt: isoDaysAgo(1) })] },
      NOW
    );
    expect(settled.nothingTracked).toBe(false);
    expect(settled.somethingWrong).toHaveLength(0);
    expect(settled.worthTakingCareOf).toHaveLength(0);
  });

  it("counts the quiet remainder as reassurance rather than surfacing it", () => {
    const state = deriveHomeState(
      { ...noEvents, homeItems: [makeHomeItem(), makeHomeItem({ id: "item-2" })], maintenanceTasks: [makeTask()] },
      NOW
    );
    expect(state.worthTakingCareOf).toHaveLength(1);
    expect(state.restUnderControl).toBe(2);
  });
});
