import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * markMaintenanceTaskDone is the single write path for "this got done".
 * These tests pin the thing that matters: a completion always leaves the
 * home's memory behind it, and never records a completion it failed to
 * log.
 */

const createLog = vi.fn();
const updateTask = vi.fn();
const updateProvider = vi.fn();

vi.mock("./maintenanceLog", () => ({ createMaintenanceLogEntry: (...a: unknown[]) => createLog(...a) }));
vi.mock("./serviceProviders", () => ({ updateServiceProvider: (...a: unknown[]) => updateProvider(...a) }));
vi.mock("./repository", () => ({
  createRecordRepository: () => ({
    list: vi.fn(),
    create: vi.fn(),
    update: (...a: unknown[]) => updateTask(...a),
    archive: vi.fn(),
  }),
}));

const { markMaintenanceTaskDone } = await import("./maintenanceTasks");
type Task = import("../state").MaintenanceTask;

const task = {
  id: "task-1",
  applianceId: "item-1",
  name: "Clean the dryer vent",
  cadenceDays: 365,
  lastDoneAt: null,
  documentLink: null,
  notes: null,
  snoozedUntil: "2026-09-01T00:00:00.000Z",
  careTemplateId: "dryer.vent",
  status: "active",
  needsReviewReason: null,
  source: "manual",
  importSessionId: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
} as Task;

beforeEach(() => {
  createLog.mockReset().mockResolvedValue({ ok: true, data: { id: "log-1" } });
  updateTask.mockReset().mockResolvedValue({ ok: true, data: task });
  updateProvider.mockReset().mockResolvedValue({ ok: true, data: {} });
});

describe("markMaintenanceTaskDone", () => {
  it("records who did it, what it cost and what they said, not just a date", async () => {
    await markMaintenanceTaskDone(task, "instance-1", {
      performedAt: "2026-08-20",
      providerId: "provider-9",
      costMinorUnits: 18500,
      notes: "Belt is wearing, worth watching",
    });

    expect(createLog).toHaveBeenCalledTimes(1);
    const [, entry] = createLog.mock.calls[0];
    expect(entry).toMatchObject({
      taskId: "task-1",
      applianceId: "item-1",
      description: "Clean the dryer vent",
      performedAt: "2026-08-20",
      providerId: "provider-9",
      costMinorUnits: 18500,
      notes: "Belt is wearing, worth watching",
    });
  });

  it("keeps a provider's last-used date in step with the work they did", async () => {
    await markMaintenanceTaskDone(task, "instance-1", { performedAt: "2026-08-20", providerId: "provider-9" });
    expect(updateProvider).toHaveBeenCalledWith("provider-9", { lastUsedAt: "2026-08-20" });
  });

  it("does not touch any provider when the work was done by the owner", async () => {
    await markMaintenanceTaskDone(task, "instance-1", { performedAt: "2026-08-20" });
    expect(updateProvider).not.toHaveBeenCalled();
    expect(createLog.mock.calls[0][1]).toMatchObject({ providerId: null, performedBy: null, costMinorUnits: null });
  });

  it("advances the task and clears any snooze once it is genuinely done", async () => {
    await markMaintenanceTaskDone(task, "instance-1", { performedAt: "2026-08-20" });
    expect(updateTask).toHaveBeenCalledWith("task-1", { lastDoneAt: "2026-08-20", snoozedUntil: null });
  });

  it("never marks a task done when the history entry failed to save", async () => {
    createLog.mockResolvedValue({ ok: false, error: { kind: "network", message: "offline" } });
    const result = await markMaintenanceTaskDone(task, "instance-1", { performedAt: "2026-08-20" });
    expect(result.ok).toBe(false);
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("defaults to today when no date is given", async () => {
    await markMaintenanceTaskDone(task, "instance-1");
    const today = new Date().toISOString().slice(0, 10);
    expect(createLog.mock.calls[0][1]).toMatchObject({ performedAt: today });
  });
});
