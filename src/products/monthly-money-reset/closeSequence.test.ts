import { describe, expect, it, vi } from "vitest";
import { buildClosedState, runCloseSequence, type CloseSequenceDeps } from "./closeSequence";
import { createEmptyState } from "./state";

/**
 * Regression coverage for the MMR reliability pass, 2026-08-04. The previous
 * month-close implementation ignored the result of every step but the last,
 * so a save failure could leave the old cycle marked "completed" with no
 * next cycle ever created, and a dropped response after a successful
 * carry-forward write could silently duplicate it on retry. These tests
 * exercise the extracted, dependency-injected sequence directly — no
 * browser, no React, no network.
 */

const previous = createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" });

const baseParams = {
  productSlug: "monthly-money-reset",
  instanceId: "instance-old",
  previous,
  reflection: "Went fine",
  choices: {
    recurringIncome: true,
    recurringBills: true,
    spendingGroups: true,
    reservePreference: true,
    checkInPreference: true,
  },
  newCycleKey: "2026-09",
  newCycleLabel: "September 2026",
  closedAt: "2026-08-31T23:00:00.000Z",
};

function makeDeps(overrides: Partial<CloseSequenceDeps> = {}): CloseSequenceDeps {
  return {
    saveClosedState: vi.fn().mockResolvedValue(true),
    setLifecycle: vi.fn().mockResolvedValue({ ok: true }),
    startNextCycle: vi.fn().mockResolvedValue({ status: "ok", instanceId: "instance-new" }),
    saveNextCycleState: vi.fn().mockResolvedValue({ status: "ok", revision: 1 }),
    ...overrides,
  };
}

describe("buildClosedState", () => {
  it("sets closedAt and the completion summary from the given inputs", () => {
    const closed = buildClosedState({
      previous,
      reflection: "A good month",
      choices: baseParams.choices,
      closedAt: "2026-08-31T23:00:00.000Z",
    });
    expect(closed.cycle.closedAt).toBe("2026-08-31T23:00:00.000Z");
    expect(closed.completion.closedAt).toBe("2026-08-31T23:00:00.000Z");
    expect(closed.completion.reflection).toBe("A good month");
    expect(closed.completion.carryForward).toEqual(baseParams.choices);
  });

  it("omits reflection rather than storing an empty string", () => {
    const closed = buildClosedState({ previous, reflection: "", choices: baseParams.choices, closedAt: "2026-08-31T23:00:00.000Z" });
    expect(closed.completion.reflection).toBeUndefined();
  });
});

describe("runCloseSequence — happy path", () => {
  it("calls every step exactly once, in order, and returns the new instance id", async () => {
    const deps = makeDeps();
    const result = await runCloseSequence(deps, baseParams);

    expect(result).toEqual({ status: "ok", nextInstanceId: "instance-new" });
    expect(deps.saveClosedState).toHaveBeenCalledTimes(1);
    expect(deps.setLifecycle).toHaveBeenCalledTimes(1);
    expect(deps.setLifecycle).toHaveBeenCalledWith("instance-old", "completed");
    expect(deps.startNextCycle).toHaveBeenCalledTimes(1);
    expect(deps.startNextCycle).toHaveBeenCalledWith("monthly-money-reset", "2026-09");
    expect(deps.saveNextCycleState).toHaveBeenCalledTimes(1);
  });

  it("saves the carry-forward state against the new instance at revision 1, never the old instance", async () => {
    const deps = makeDeps();
    await runCloseSequence(deps, baseParams);
    const call = (deps.saveNextCycleState as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.instanceId).toBe("instance-new");
    expect(call.expectedRevision).toBe(1);
    expect(call.state.cycle.cycleKey).toBe("2026-09");
  });
});

describe("runCloseSequence — each step gates the next", () => {
  it("stops at save-close and never touches lifecycle, next-cycle, or carry-forward", async () => {
    const deps = makeDeps({ saveClosedState: vi.fn().mockResolvedValue(false) });
    const result = await runCloseSequence(deps, baseParams);

    expect(result).toEqual({ status: "failed", step: "save-close" });
    expect(deps.setLifecycle).not.toHaveBeenCalled();
    expect(deps.startNextCycle).not.toHaveBeenCalled();
    expect(deps.saveNextCycleState).not.toHaveBeenCalled();
  });

  it("stops at lifecycle (after a confirmed close save) and never starts a next cycle", async () => {
    const deps = makeDeps({ setLifecycle: vi.fn().mockResolvedValue({ ok: false, message: "network" }) });
    const result = await runCloseSequence(deps, baseParams);

    expect(result).toEqual({ status: "failed", step: "lifecycle" });
    expect(deps.saveClosedState).toHaveBeenCalledTimes(1);
    expect(deps.startNextCycle).not.toHaveBeenCalled();
    expect(deps.saveNextCycleState).not.toHaveBeenCalled();
  });

  it("stops at start-next-cycle (after lifecycle succeeded) and never writes carry-forward", async () => {
    const deps = makeDeps({ startNextCycle: vi.fn().mockResolvedValue({ status: "error", message: "no eligibility" }) });
    const result = await runCloseSequence(deps, baseParams);

    expect(result).toEqual({ status: "failed", step: "start-next-cycle" });
    expect(deps.setLifecycle).toHaveBeenCalledTimes(1);
    expect(deps.saveNextCycleState).not.toHaveBeenCalled();
  });

  it("reports carry-forward failure on a genuine save error", async () => {
    const deps = makeDeps({ saveNextCycleState: vi.fn().mockResolvedValue({ status: "error", message: "network" }) });
    const result = await runCloseSequence(deps, baseParams);
    expect(result).toEqual({ status: "failed", step: "carry-forward" });
  });
});

describe("runCloseSequence — idempotent retry", () => {
  it("treats a conflict on the new instance's carry-forward write as success, not failure", async () => {
    // A conflict on a brand-new instance (still at revision 1) can only mean
    // an earlier, unacknowledged attempt of this same sequence already wrote
    // it — nothing else touches a fresh instance before Setup opens it.
    const deps = makeDeps({
      saveNextCycleState: vi.fn().mockResolvedValue({ status: "conflict", revision: 2, state: previous }),
    });
    const result = await runCloseSequence(deps, baseParams);
    expect(result).toEqual({ status: "ok", nextInstanceId: "instance-new" });
  });

  it("a second full call after a successful first call is safe and still resolves ok", async () => {
    // startNextCycle is documented idempotent per (user, product, cycle_key)
    // via grant_free_product — a retry naturally returns the same instance.
    const startNextCycle = vi.fn().mockResolvedValue({ status: "ok", instanceId: "instance-new" });
    const deps = makeDeps({ startNextCycle });

    const first = await runCloseSequence(deps, baseParams);
    const second = await runCloseSequence(deps, baseParams);

    expect(first).toEqual({ status: "ok", nextInstanceId: "instance-new" });
    expect(second).toEqual({ status: "ok", nextInstanceId: "instance-new" });
    expect(startNextCycle).toHaveBeenCalledTimes(2);
    // Both calls target the exact same next cycle key — never a different
    // one, so retrying never produces a second, different next instance.
    for (const call of startNextCycle.mock.calls) {
      expect(call).toEqual(["monthly-money-reset", "2026-09"]);
    }
  });

  it("retrying after a lifecycle failure does not re-run carry-forward twice with different data", async () => {
    let lifecycleCalls = 0;
    const deps = makeDeps({
      setLifecycle: vi.fn().mockImplementation(async () => {
        lifecycleCalls += 1;
        return lifecycleCalls === 1 ? { ok: false, message: "first attempt failed" } : { ok: true };
      }),
    });

    const first = await runCloseSequence(deps, baseParams);
    expect(first).toEqual({ status: "failed", step: "lifecycle" });
    expect(deps.saveNextCycleState).not.toHaveBeenCalled();

    const second = await runCloseSequence(deps, baseParams);
    expect(second).toEqual({ status: "ok", nextInstanceId: "instance-new" });
    expect(deps.saveNextCycleState).toHaveBeenCalledTimes(1);
  });
});
