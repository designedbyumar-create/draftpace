import type { MonthlyMoneyResetState } from "./state";

/**
 * Real per-step Setup completeness — not "the user clicked Continue," but
 * "there is either genuine data or a deliberate confirmation that there's
 * nothing to add." See docs/products/monthly-money-reset-blueprint.md and
 * the MMR redesign plan, Phase 3. Step 5 (Review) has no criteria of its
 * own: it's complete exactly when steps 1-4 are, via isSetupTrulyComplete().
 */
export type SetupStepId = 1 | 2 | 3 | 4;

export type StepCompleteness =
  | { complete: true }
  | {
      complete: false;
      /** One sentence: what's missing and how it affects Safe-to-Spend. */
      missing: string;
    };

export function stepCompleteness(state: MonthlyMoneyResetState, step: SetupStepId): StepCompleteness {
  switch (step) {
    case 1:
      if (state.startingAvailableBalanceMinorUnits !== 0 || state.setup.acknowledgements.startingBalanceZeroConfirmed) {
        return { complete: true };
      }
      return {
        complete: false,
        missing: "Enter what's available right now, or confirm $0 is correct — Safe-to-Spend starts counting from this number.",
      };
    case 2:
      if (state.income.length > 0 || state.setup.acknowledgements.noOtherIncomeConfirmed) {
        return { complete: true };
      }
      return {
        complete: false,
        missing: "Add income you're still expecting, or confirm there's none — Safe-to-Spend won't count income it doesn't know about.",
      };
    case 3:
      if (
        state.bills.length > 0 ||
        state.protectedReserve.length > 0 ||
        state.setup.acknowledgements.noBillsOrReserveConfirmed
      ) {
        return { complete: true };
      }
      return {
        complete: false,
        missing: "Add what must be paid or set aside, or confirm there's nothing to protect — Safe-to-Spend can't tell what's already spoken for otherwise.",
      };
    case 4:
      if (state.spendingGroups.some((group) => group.name.trim().length > 0)) {
        return { complete: true };
      }
      return {
        complete: false,
        missing: "Name at least one spending group — Safe-to-Spend needs somewhere to point your everyday spending.",
      };
  }
}

export const SETUP_CONTENT_STEPS: readonly SetupStepId[] = [1, 2, 3, 4];

export function isSetupTrulyComplete(state: MonthlyMoneyResetState): boolean {
  return SETUP_CONTENT_STEPS.every((step) => stepCompleteness(state, step).complete);
}

/** The first content step (1-4) that still needs attention, if any. */
export function firstIncompleteStep(state: MonthlyMoneyResetState): SetupStepId | null {
  return SETUP_CONTENT_STEPS.find((step) => !stepCompleteness(state, step).complete) ?? null;
}
