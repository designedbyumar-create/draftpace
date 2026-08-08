import type { Subscription } from "../../state";

/** "custom" frequencies have no reliable multiplier and are excluded from the total rather than guessed. */
const MONTHLY_MULTIPLIER: Record<Exclude<Subscription["frequency"], "custom">, number> = {
  monthly: 1,
  annual: 1 / 12,
};

export function monthlyEquivalentMinorUnits(subscription: Subscription): number | null {
  if (subscription.frequency === "custom") return null;
  if (subscription.amountMinorUnits === null) return null;
  return Math.round(subscription.amountMinorUnits * MONTHLY_MULTIPLIER[subscription.frequency]);
}

export type SubscriptionsSummary = {
  totalMonthlyEquivalentMinorUnits: number;
  activeCount: number;
  reviewingCount: number;
  plannedCancellationCount: number;
};

export function summarizeSubscriptions(subscriptions: Subscription[]): SubscriptionsSummary {
  const active = subscriptions.filter((s) => s.status !== "archived" && s.decision !== "cancelled");
  let totalMonthlyEquivalentMinorUnits = 0;
  let reviewingCount = 0;
  let plannedCancellationCount = 0;

  for (const subscription of active) {
    const monthly = monthlyEquivalentMinorUnits(subscription);
    if (monthly !== null) totalMonthlyEquivalentMinorUnits += monthly;
    if (subscription.decision === "reviewing") reviewingCount += 1;
    if (subscription.decision === "plannedCancellation") plannedCancellationCount += 1;
  }

  return { totalMonthlyEquivalentMinorUnits, activeCount: active.length, reviewingCount, plannedCancellationCount };
}

export type SubscriptionsDominantAction =
  | { kind: "add-first" }
  | { kind: "decide"; subscription: Subscription }
  | null;

/** The one dominant next action: the earliest-added subscription still marked "reviewing", since that's an open decision rather than a settled state. */
export function resolveDominantAction(subscriptions: Subscription[]): SubscriptionsDominantAction {
  const active = subscriptions.filter((s) => s.status !== "archived" && s.decision !== "cancelled");
  if (active.length === 0) return { kind: "add-first" };

  const reviewing = active.filter((s) => s.decision === "reviewing").sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  if (reviewing.length > 0) return { kind: "decide", subscription: reviewing[0] };
  return null;
}

/**
 * The explicit copy boundary for a planned cancellation: Draftpace tracks
 * the decision, it never performs the cancellation itself. This must stay
 * literal and visible wherever a plannedCancellation subscription is shown
 * — it is a real product boundary, not a tone preference.
 */
export function describeDecisionNote(subscription: Subscription): string | null {
  if (subscription.decision === "plannedCancellation") {
    return "Draftpace is tracking this as planned to cancel. It won't cancel it for you — you'll still need to do that yourself.";
  }
  if (subscription.decision === "reviewing") {
    return "You're still deciding whether to keep this.";
  }
  return null;
}
