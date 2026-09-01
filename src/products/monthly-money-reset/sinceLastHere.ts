import { computeSafeToSpend } from "./calculations";
import { formatCurrency } from "./currency";
import type { MonthlyMoneyResetState } from "./state";

/**
 * "Since You Were Last Here" — a restrained, purely factual summary of what
 * changed since the last check-in confirmation. Every fact here is derived
 * directly from state; nothing is inferred or invented. See the MMR
 * redesign plan, Phase 4.
 */
export type FreshnessTier = "fresh" | "aging" | "stale";

export type SinceLastHere = {
  /** Ordered by priority: Safe-to-Spend delta, days since confirmed, bills, income, freshness statement last. */
  facts: string[];
  tier: FreshnessTier;
  /** Safe-to-Spend is currently negative — may raise visual weight, but Next Action stays the one dominant action; this surface never duplicates it. */
  elevated: boolean;
  daysSinceConfirmed: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
/** Matches the product's weekly check-in cadence — see docs/products/monthly-money-reset-blueprint.md. No stricter cadence signal exists yet. */
const STALE_AFTER_DAYS = 7;
const AGING_AFTER_DAYS = 3;

function freshnessStatement(tier: FreshnessTier): string {
  switch (tier) {
    case "fresh":
      return "Everything here reflects what you last confirmed.";
    case "aging":
      return "A few things may have changed since you last confirmed.";
    case "stale":
      return "This may be behind what's actually happened — a check-in would bring it current.";
  }
}

/**
 * Pure and independently testable: no clock reads, no randomness. Returns
 * null whenever there's nothing true and new to say — no prior confirmation
 * to compare against, or confirmed today with nothing changed since.
 */
export function computeSinceLastHere(state: MonthlyMoneyResetState, now: Date = new Date()): SinceLastHere | null {
  const lastConfirmedAt = state.lastConfirmedAt;
  if (!lastConfirmedAt) return null;

  const confirmedTime = new Date(lastConfirmedAt).getTime();
  const daysSinceConfirmed = Math.max(0, Math.floor((now.getTime() - confirmedTime) / DAY_MS));

  const billsSince = state.bills.filter(
    (bill) => bill.status === "paid" && bill.paidDate && new Date(bill.paidDate).getTime() > confirmedTime
  );
  const incomeSince = state.income.filter(
    (entry) => entry.status === "received" && entry.receivedDate && new Date(entry.receivedDate).getTime() > confirmedTime
  );

  const priorCheckIn = [...state.checkIns].reverse().find((entry) => entry.date === lastConfirmedAt);
  const priorSafeToSpend = priorCheckIn?.safeToSpendAtMinorUnits ?? null;
  const currentSafeToSpend = computeSafeToSpend(state).safeToSpend;
  const delta = priorSafeToSpend !== null ? currentSafeToSpend - priorSafeToSpend : null;

  const nothingChanged = (delta === null || delta === 0) && billsSince.length === 0 && incomeSince.length === 0;
  if (daysSinceConfirmed === 0 && nothingChanged) return null;

  const tier: FreshnessTier = daysSinceConfirmed >= STALE_AFTER_DAYS ? "stale" : daysSinceConfirmed >= AGING_AFTER_DAYS ? "aging" : "fresh";

  const facts: string[] = [];

  if (delta !== null && delta !== 0) {
    facts.push(
      `Safe-to-Spend has ${delta > 0 ? "gone up" : "gone down"} ${formatCurrency(Math.abs(delta), state.currency)} since your last check-in.`
    );
  }

  facts.push(
    daysSinceConfirmed === 0
      ? "Last confirmed today."
      : daysSinceConfirmed === 1
        ? "Last confirmed 1 day ago."
        : `Last confirmed ${daysSinceConfirmed} days ago.`
  );

  if (billsSince.length === 1) {
    facts.push(`${billsSince[0].name || "A bill"} was paid.`);
  } else if (billsSince.length > 1) {
    facts.push(`${billsSince.length} bills were paid.`);
  }

  if (incomeSince.length === 1) {
    facts.push(`${incomeSince[0].name || "Income"} was received.`);
  } else if (incomeSince.length > 1) {
    facts.push(`${incomeSince.length} income sources were received.`);
  }

  facts.push(freshnessStatement(tier));

  return { facts, tier, elevated: currentSafeToSpend < 0, daysSinceConfirmed };
}
