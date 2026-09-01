"use client";

import { toMinorUnits } from "@/lib/currency";
import { ok, err, type Result } from "@/product-framework/result";
import { createAccount } from "./accounts";
import { createIncomeSource } from "./incomeSources";
import { createBill } from "./bills";
import { createSubscription } from "./subscriptions";
import { createTransaction } from "./transactions";
import { createDebt } from "./debts";
import { createSavingsGoal } from "./savingsGoals";
import { recordConfirmationEvent } from "./confirmationEvents";
import { updateCandidate } from "./extractionCandidates";
import type {
  AccountCandidatePayload,
  BillCandidatePayload,
  CandidatePayload,
  DebtCandidatePayload,
  ExtractionCandidate,
  IncomeCandidatePayload,
  SavingsGoalCandidatePayload,
  SubscriptionCandidatePayload,
  TransactionCandidatePayload,
} from "../import/types";

/**
 * The one bridge from a confirmed candidate to a real canonical record —
 * calls the exact same createAccount/createBill/... functions the direct
 * sections and Companion already use (domain/accounts.ts etc). There is
 * no createImportedBill() or createAIBill(): a bill created from a
 * confirmed candidate is stored in the identical pfc_bills row shape as
 * one typed by hand, differing only in its `source` provenance field.
 * Nothing here writes a record without this function being called from a
 * genuine user confirmation action in the review UI.
 */

const DEFAULT_CURRENCY = "USD";

function dayOfMonthToDueRule(day: number | undefined) {
  if (day === undefined) return null;
  return { dayOfMonth: day };
}

function nextDateForDay(day: number | undefined): string | null {
  if (day === undefined) return null;
  const now = new Date();
  const candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day));
  if (candidate.getTime() < now.getTime()) candidate.setUTCMonth(candidate.getUTCMonth() + 1);
  return candidate.toISOString().slice(0, 10);
}

export interface ConfirmCandidateInput {
  instanceId: string;
  candidate: ExtractionCandidate;
  /** The (possibly user-edited) payload to confirm — defaults to the candidate's own stored payload when the user confirmed without editing. */
  payload?: CandidatePayload;
  /** Required when candidate.candidateType === "transaction" — chosen once per CSV import session, not derivable from the row itself. */
  accountId?: string;
  source: "pastedNotes" | "textFile" | "csvImport";
}

export interface ConfirmCandidateResult {
  recordType: string;
  recordId: string;
}

export async function confirmCandidate(input: ConfirmCandidateInput): Promise<Result<ConfirmCandidateResult>> {
  const { instanceId, candidate, source } = input;
  const payload = input.payload ?? candidate.payload;
  const provenance = { source, importSessionId: candidate.importSessionId };

  let created: Result<{ id: string }>;
  let recordType: string;

  switch (candidate.candidateType) {
    case "account": {
      const p = payload as AccountCandidatePayload;
      const currency = p.currency ?? DEFAULT_CURRENCY;
      recordType = "account";
      created = await createAccount(instanceId, {
        name: p.name,
        type: p.type ?? "other",
        currentBalanceMinorUnits: p.balanceMajorUnits !== undefined ? toMinorUnits(p.balanceMajorUnits, currency) : 0,
        currency,
        availableForSpending: true,
        balanceAsOfDate: new Date().toISOString().slice(0, 10),
        notes: null,
        status: "ready",
        ...provenance,
      });
      break;
    }
    case "income": {
      const p = payload as IncomeCandidatePayload;
      const currency = DEFAULT_CURRENCY;
      recordType = "income";
      created = await createIncomeSource(instanceId, {
        name: p.name,
        amountMinorUnits: p.amountMajorUnits !== undefined ? toMinorUnits(p.amountMajorUnits, currency) : null,
        amountRangeMinorUnits: null,
        currency,
        frequency: p.frequency ?? "monthly",
        nextExpectedDate: nextDateForDay(p.dayOfMonth),
        confidence: "estimated",
        grossOrNet: "unknown",
        status: p.amountMajorUnits !== undefined ? "ready" : "confirmedIncomplete",
        ...provenance,
      });
      break;
    }
    case "bill": {
      const p = payload as BillCandidatePayload;
      const currency = DEFAULT_CURRENCY;
      recordType = "bill";
      created = await createBill(instanceId, {
        name: p.name,
        category: "other",
        amountMinorUnits: p.amountMajorUnits !== undefined ? toMinorUnits(p.amountMajorUnits, currency) : null,
        amountRangeMinorUnits: null,
        isVariable: false,
        dueRule: dayOfMonthToDueRule(p.dayOfMonth),
        frequency: p.frequency ?? "monthly",
        essential: true,
        funded: false,
        currency,
        status: "ready",
        ...provenance,
      });
      break;
    }
    case "subscription": {
      const p = payload as SubscriptionCandidatePayload;
      const currency = DEFAULT_CURRENCY;
      recordType = "subscription";
      created = await createSubscription(instanceId, {
        name: p.name,
        amountMinorUnits: p.amountMajorUnits !== undefined ? toMinorUnits(p.amountMajorUnits, currency) : null,
        frequency: "monthly",
        renewalDate: nextDateForDay(p.dayOfMonth),
        decision: "keep",
        currency,
        status: "ready",
        ...provenance,
      });
      break;
    }
    case "debt": {
      const p = payload as DebtCandidatePayload;
      const currency = DEFAULT_CURRENCY;
      recordType = "debt";
      created = await createDebt(instanceId, {
        name: p.name,
        type: "other",
        balanceMinorUnits: p.balanceMajorUnits !== undefined ? toMinorUnits(p.balanceMajorUnits, currency) : 0,
        currency,
        interestRate: null,
        minimumPaymentMinorUnits: p.minimumPaymentMajorUnits !== undefined ? toMinorUnits(p.minimumPaymentMajorUnits, currency) : 0,
        dueDate: null,
        balanceAsOfDate: new Date().toISOString().slice(0, 10),
        status: "ready",
        ...provenance,
      });
      break;
    }
    case "savingsGoal": {
      const p = payload as SavingsGoalCandidatePayload;
      const currency = DEFAULT_CURRENCY;
      recordType = "savingsGoal";
      created = await createSavingsGoal(instanceId, {
        name: p.name,
        type: "generalGoal",
        targetAmountMinorUnits: p.targetAmountMajorUnits !== undefined ? toMinorUnits(p.targetAmountMajorUnits, currency) : 0,
        savedAmountMinorUnits: p.savedAmountMajorUnits !== undefined ? toMinorUnits(p.savedAmountMajorUnits, currency) : 0,
        targetDate: null,
        recurring: false,
        currency,
        status: "ready",
        ...provenance,
      });
      break;
    }
    case "transaction": {
      const p = payload as TransactionCandidatePayload;
      const currency = DEFAULT_CURRENCY;
      if (!input.accountId) return err({ kind: "validation", message: "An account must be chosen before confirming a transaction." });
      recordType = "transaction";
      created = await createTransaction(instanceId, {
        accountId: input.accountId,
        occurredOn: p.occurredOn ?? new Date().toISOString().slice(0, 10),
        description: p.description,
        amountMinorUnits: p.amountMajorUnits !== undefined ? Math.abs(toMinorUnits(p.amountMajorUnits, currency)) : 0,
        direction: p.direction ?? "debit",
        currency,
        category: p.category ?? null,
        pendingOrCleared: "cleared",
        externalId: null,
        transferPairId: null,
        excludedFromSpending: false,
        status: "ready",
        ...provenance,
      });
      break;
    }
    case "unsupported":
      return err({ kind: "validation", message: "This entry wasn't recognized as a supported record type." });
  }

  if (!created.ok) return err(created.error);

  const confirmationResult = await recordConfirmationEvent(instanceId, {
    candidateId: candidate.id,
    recordType,
    recordId: created.data.id,
    action: "confirm",
    newValue: payload,
  });
  if (!confirmationResult.ok) return err(confirmationResult.error);

  const candidateUpdateResult = await updateCandidate(candidate.id, {
    reviewStatus: "confirmed",
    confirmedRecordType: recordType,
    confirmedRecordId: created.data.id,
  });
  if (!candidateUpdateResult.ok) return err(candidateUpdateResult.error);

  return ok({ recordType, recordId: created.data.id });
}

export async function skipCandidate(candidate: ExtractionCandidate): Promise<Result<void>> {
  const result = await updateCandidate(candidate.id, { reviewStatus: "skipped" });
  if (!result.ok) return err(result.error);
  return ok(undefined);
}
