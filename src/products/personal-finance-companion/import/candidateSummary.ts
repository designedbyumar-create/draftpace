import { formatCurrency } from "@/lib/currency";
import type {
  AccountCandidatePayload,
  BillCandidatePayload,
  DebtCandidatePayload,
  ExtractionCandidate,
  IncomeCandidatePayload,
  SavingsGoalCandidatePayload,
  SubscriptionCandidatePayload,
  TransactionCandidatePayload,
  UnsupportedCandidatePayload,
} from "./types";

/**
 * Human-language rendering for a candidate card (launch spec D7) — never
 * a raw JSON dump. One function per type, all pure and testable.
 */

export const CANDIDATE_TYPE_LABEL: Record<ExtractionCandidate["candidateType"], string> = {
  account: "account",
  income: "income source",
  bill: "bill",
  subscription: "subscription",
  transaction: "transaction",
  debt: "debt",
  savingsGoal: "savings goal",
  unsupported: "unrecognized entry",
};

function dayOrdinal(day: number): string {
  if (day % 10 === 1 && day !== 11) return `${day}st`;
  if (day % 10 === 2 && day !== 12) return `${day}nd`;
  if (day % 10 === 3 && day !== 13) return `${day}rd`;
  return `${day}th`;
}

export interface CandidateSummaryLine {
  title: string;
  lines: string[];
}

export function summarizeCandidate(candidate: ExtractionCandidate): CandidateSummaryLine {
  const currency = "USD";
  switch (candidate.candidateType) {
    case "account": {
      const p = candidate.payload as AccountCandidatePayload;
      return {
        title: p.name,
        lines: [p.balanceMajorUnits !== undefined ? formatCurrency(Math.round(p.balanceMajorUnits * 100), currency) : "No balance found"],
      };
    }
    case "income": {
      const p = candidate.payload as IncomeCandidatePayload;
      return {
        title: p.name,
        lines: [
          p.amountMajorUnits !== undefined ? formatCurrency(Math.round(p.amountMajorUnits * 100), currency) : "No amount found",
          p.dayOfMonth !== undefined ? `Expected on the ${dayOrdinal(p.dayOfMonth)}` : "No expected date found",
        ],
      };
    }
    case "bill": {
      const p = candidate.payload as BillCandidatePayload;
      return {
        title: p.name,
        lines: [
          p.amountMajorUnits !== undefined ? formatCurrency(Math.round(p.amountMajorUnits * 100), currency) : "No amount found",
          p.dayOfMonth !== undefined ? `Due on the ${dayOrdinal(p.dayOfMonth)}` : "No due date found",
          "Monthly",
        ],
      };
    }
    case "subscription": {
      const p = candidate.payload as SubscriptionCandidatePayload;
      return {
        title: p.name,
        lines: [
          p.amountMajorUnits !== undefined ? formatCurrency(Math.round(p.amountMajorUnits * 100), currency) : "No amount found",
          p.dayOfMonth !== undefined ? `Renews around the ${dayOrdinal(p.dayOfMonth)}` : "No renewal date found",
        ],
      };
    }
    case "debt": {
      const p = candidate.payload as DebtCandidatePayload;
      return {
        title: p.name,
        lines: [
          p.balanceMajorUnits !== undefined ? `${formatCurrency(Math.round(p.balanceMajorUnits * 100), currency)} balance` : "No balance found",
          p.minimumPaymentMajorUnits !== undefined
            ? `${formatCurrency(Math.round(p.minimumPaymentMajorUnits * 100), currency)} minimum`
            : "No minimum payment found",
        ],
      };
    }
    case "savingsGoal": {
      const p = candidate.payload as SavingsGoalCandidatePayload;
      return {
        title: p.name,
        lines: [
          `${p.savedAmountMajorUnits !== undefined ? formatCurrency(Math.round(p.savedAmountMajorUnits * 100), currency) : "$0"} of ${
            p.targetAmountMajorUnits !== undefined ? formatCurrency(Math.round(p.targetAmountMajorUnits * 100), currency) : "an unknown target"
          }`,
        ],
      };
    }
    case "transaction": {
      const p = candidate.payload as TransactionCandidatePayload;
      return {
        title: p.description,
        lines: [
          p.amountMajorUnits !== undefined ? formatCurrency(Math.round(p.amountMajorUnits * 100), currency) : "No amount found",
          p.occurredOn ?? "No date found",
        ],
      };
    }
    case "unsupported": {
      const p = candidate.payload as UnsupportedCandidatePayload;
      return { title: "Not recognized", lines: [p.rawText] };
    }
  }
}
