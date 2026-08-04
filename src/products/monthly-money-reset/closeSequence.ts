import type { LifecycleState } from "@/product-framework/instances";
import { buildNextCycleState } from "./carryForward";
import { computeSafeToSpend } from "./calculations";
import type { SaveStateResult, StartCycleResult } from "./data";
import type { CarryForwardChoices, MonthlyMoneyResetState } from "./state";

/**
 * The month-close sequence, extracted from HistoryModule so it is testable
 * without a browser: a plain, dependency-injected function instead of a
 * closure over hook state and router calls. Each step only runs once the
 * previous one is confirmed, and the whole sequence is safe to call again
 * after a failure — see the MMR reliability pass, 2026-08-04, for the exact
 * defect this replaces (every step but "start next cycle" had its result
 * silently ignored, so a save failure could leave the old cycle marked
 * "completed" with no next cycle ever created).
 */

export type CloseSequenceDeps = {
  saveClosedState: (state: MonthlyMoneyResetState) => Promise<boolean>;
  setLifecycle: (instanceId: string, state: LifecycleState) => Promise<{ ok: boolean; message?: string }>;
  startNextCycle: (productSlug: string, cycleKey: string) => Promise<StartCycleResult>;
  saveNextCycleState: (params: {
    instanceId: string;
    expectedRevision: number;
    state: MonthlyMoneyResetState;
    setupComplete: boolean;
    safeToSpendMinorUnits: number;
    nextActionLabel: string | null;
  }) => Promise<SaveStateResult>;
};

export type CloseSequenceParams = {
  productSlug: string;
  instanceId: string;
  previous: MonthlyMoneyResetState;
  reflection: string;
  choices: CarryForwardChoices;
  newCycleKey: string;
  newCycleLabel: string;
  closedAt: string;
};

export type CloseSequenceFailureStep = "save-close" | "lifecycle" | "start-next-cycle" | "carry-forward";

export type CloseSequenceResult =
  | { status: "ok"; nextInstanceId: string }
  | { status: "failed"; step: CloseSequenceFailureStep };

export function buildClosedState(params: {
  previous: MonthlyMoneyResetState;
  reflection: string;
  choices: CarryForwardChoices;
  closedAt: string;
}): MonthlyMoneyResetState {
  const { previous, reflection, choices, closedAt } = params;
  const breakdown = computeSafeToSpend(previous);
  return {
    ...previous,
    cycle: { ...previous.cycle, closedAt },
    completion: {
      closedAt,
      closingSafeToSpendMinorUnits: breakdown.safeToSpend,
      reflection: reflection || undefined,
      carryForward: choices,
    },
  };
}

export async function runCloseSequence(
  deps: CloseSequenceDeps,
  params: CloseSequenceParams
): Promise<CloseSequenceResult> {
  const { productSlug, instanceId, previous, reflection, choices, newCycleKey, newCycleLabel, closedAt } = params;

  const closedState = buildClosedState({ previous, reflection, choices, closedAt });

  const savedClose = await deps.saveClosedState(closedState);
  if (!savedClose) return { status: "failed", step: "save-close" };

  const lifecycleResult = await deps.setLifecycle(instanceId, "completed");
  if (!lifecycleResult.ok) return { status: "failed", step: "lifecycle" };

  const nextCycleResult = await deps.startNextCycle(productSlug, newCycleKey);
  if (nextCycleResult.status !== "ok") return { status: "failed", step: "start-next-cycle" };

  const nextState = buildNextCycleState({
    previous,
    previousInstanceId: instanceId,
    cycleKey: newCycleKey,
    cycleLabel: newCycleLabel,
    choices,
  });
  const carryForwardResult = await deps.saveNextCycleState({
    instanceId: nextCycleResult.instanceId,
    expectedRevision: 1,
    state: nextState,
    setupComplete: false,
    safeToSpendMinorUnits: 0,
    nextActionLabel: null,
  });
  // A conflict on a brand-new instance almost certainly means an earlier,
  // unacknowledged attempt of this same retry already wrote the
  // carry-forward state — nothing else writes to a fresh instance before
  // Setup opens it. Treat that as success rather than getting stuck.
  if (carryForwardResult.status !== "ok" && carryForwardResult.status !== "conflict") {
    return { status: "failed", step: "carry-forward" };
  }

  return { status: "ok", nextInstanceId: nextCycleResult.instanceId };
}
