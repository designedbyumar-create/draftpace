import { describe, expect, it } from "vitest";
import { currentSeasonId, deriveSeasons, seasonOfMonth, seasonSpan } from "./seasons";
import type { HomeItem, MaintenanceTask } from "./state";
import { HOME_ITEM_TYPES } from "./homeKnowledge";

const item = (id: string, name: string, location: string | null = null): HomeItem =>
  ({ id, name, type: "furnace", brand: null, location, status: "active" }) as unknown as HomeItem;

const task = (over: Partial<MaintenanceTask> & { id: string; name: string }): MaintenanceTask =>
  ({
    applianceId: null,
    cadenceDays: 365,
    lastDoneAt: null,
    snoozedUntil: null,
    careTemplateId: null,
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
    ...over,
  }) as unknown as MaintenanceTask;

// A seasonal template from the real knowledge base, so this cannot drift from it.
const seasonalTemplate = HOME_ITEM_TYPES.flatMap((type) => type.care).find(
  (template) => template.months && template.months.length > 0 && template.months.every((month) => month >= 9 && month <= 11)
);
const NOW = new Date("2026-09-20T12:00:00Z");

describe("seasons", () => {
  it("puts December, January and February in winter", () => {
    expect([12, 1, 2].map(seasonOfMonth)).toEqual(["winter", "winter", "winter"]);
    expect(currentSeasonId(NOW)).toBe("autumn");
    expect(seasonSpan("winter")).toBe("December to February");
  });

  it("has a real autumn template to test against", () => {
    expect(seasonalTemplate, "no seasonal template with months in September to November").toBeDefined();
  });

  it("places a seasonal job under the month the app already says it is due, in exactly one season", () => {
    const t = task({ id: "t1", name: seasonalTemplate!.taskName, careTemplateId: seasonalTemplate!.id, lastDoneAt: "2025-09-01", applianceId: "i1" });
    const seasons = deriveSeasons({ homeItems: [item("i1", "Furnace", "Basement")], maintenanceTasks: [t] }, NOW);
    const holding = seasons.filter((s) => s.jobs.length > 0);
    expect(holding.map((s) => s.id)).toEqual(["autumn"]);
    const job = holding[0].jobs[0];
    expect(job.title).toBe(seasonalTemplate!.taskName);
    expect(job.about).toBe("Furnace, Basement");
    expect(seasonalTemplate!.months).toContain(Number(job.dueIso.slice(5, 7)));
  });

  it("keeps a seasonal job whose month has already come in this season, marked due now, until it is done", () => {
    const month = Math.min(...seasonalTemplate!.months!);
    const late = new Date(Date.UTC(2026, 10, 25, 12)); // 25 November, after every autumn month has begun
    const t = task({ id: "t1", name: seasonalTemplate!.taskName, careTemplateId: seasonalTemplate!.id, lastDoneAt: "2025-09-01" });
    const autumn = deriveSeasons({ homeItems: [], maintenanceTasks: [t] }, late).find((s) => s.id === "autumn")!;
    expect(autumn.jobs).toHaveLength(1);
    expect(autumn.jobs[0].dueNow).toBe(true);
    expect(autumn.jobs[0].monthLabel).toBe("November");
    expect(month).toBeGreaterThanOrEqual(9);
  });

  it("leaves a job that has never been logged and is not tied to a month to Home, not to any season", () => {
    const t = task({ id: "t2", name: "Some routine job", cadenceDays: 90 });
    const seasons = deriveSeasons({ homeItems: [], maintenanceTasks: [t] }, NOW);
    expect(seasons.every((s) => s.jobs.length === 0)).toBe(true);
  });

  it("places a routine job in the season its next due date falls in", () => {
    const t = task({ id: "t3", name: "Replace the filter", cadenceDays: 90, lastDoneAt: "2026-09-10" }); // due 9 December
    const seasons = deriveSeasons({ homeItems: [], maintenanceTasks: [t] }, NOW);
    expect(seasons.find((s) => s.id === "winter")!.jobs.map((j) => j.title)).toEqual(["Replace the filter"]);
    expect(seasons.find((s) => s.id === "autumn")!.jobs).toHaveLength(0);
  });

  it("does not list an overdue routine job in a season, because that is Home's to show", () => {
    const t = task({ id: "t4", name: "Overdue routine", cadenceDays: 30, lastDoneAt: "2026-06-01" });
    const seasons = deriveSeasons({ homeItems: [], maintenanceTasks: [t] }, NOW);
    expect(seasons.every((s) => s.jobs.length === 0)).toBe(true);
  });

  it("skips archived tasks", () => {
    const t = task({ id: "t5", name: "Old", cadenceDays: 90, lastDoneAt: "2026-09-10", status: "archived" });
    expect(deriveSeasons({ homeItems: [], maintenanceTasks: [t] }, NOW).every((s) => s.jobs.length === 0)).toBe(true);
  });

  it("handles winter across the new year", () => {
    const december = new Date(Date.UTC(2026, 11, 20, 12));
    const t = task({ id: "t6", name: "January job", cadenceDays: 60, lastDoneAt: "2026-11-15" }); // due 14 January 2027
    const winter = deriveSeasons({ homeItems: [], maintenanceTasks: [t] }, december).find((s) => s.id === "winter")!;
    expect(winter.jobs).toHaveLength(1);
    expect(winter.jobs[0].monthLabel).toBe("January");
  });

  it("sorts jobs by month and then by date", () => {
    const a = task({ id: "a", name: "B job", cadenceDays: 100, lastDoneAt: "2026-09-10" });
    const b = task({ id: "b", name: "A job", cadenceDays: 90, lastDoneAt: "2026-09-10" });
    const winter = deriveSeasons({ homeItems: [], maintenanceTasks: [a, b] }, NOW).find((s) => s.id === "winter")!;
    expect(winter.jobs.map((j) => j.title)).toEqual(["A job", "B job"]);
  });
});
