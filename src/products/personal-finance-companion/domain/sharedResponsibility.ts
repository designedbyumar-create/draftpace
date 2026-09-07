/**
 * Shared Responsibility's pure math (Trump Card Memo, absorbing the
 * founder-proposed Couple Finance Companion into a feature of this
 * product): a per-bill/subscription shared flag and split percent, plus a
 * manually-ticked settled marker. No Supabase, no React, just the numbers
 * a settled/unsettled statement needs, see state.ts's
 * sharedResponsibilityFields for the schema this operates on.
 */

export type SharedSplit = {
  /** This account's own share, per `sharedSplitPercent`. */
  yourShareMinorUnits: number;
  /** The remainder, the other person's share. */
  otherShareMinorUnits: number;
};

/** `sharedSplitPercent` is this account's own share of `amountMinorUnits`, 1-99 (see the DB check constraint). */
export function computeSharedSplit(amountMinorUnits: number, sharedSplitPercent: number): SharedSplit {
  const yourShareMinorUnits = Math.round((amountMinorUnits * sharedSplitPercent) / 100);
  return { yourShareMinorUnits, otherShareMinorUnits: amountMinorUnits - yourShareMinorUnits };
}

export type SharedResponsibilityItem = {
  name: string;
  amountMinorUnits: number | null;
  currency: string;
  shared: boolean;
  sharedSplitPercent: number | null;
  settled: boolean;
  settledAt: string | null;
};

export type SettledLine = { name: string; otherShareMinorUnits: number; currency: string; settledAt: string | null };
export type UnsettledLine = { name: string; otherShareMinorUnits: number; currency: string };

export type SharedResponsibilitySummary = {
  /** Shared items with enough information to compute a split, an unfunded/incomplete bill is excluded rather than silently treated as zero. */
  sharedItemCount: number;
  unsettled: UnsettledLine[];
  settled: SettledLine[];
  /**
   * Sum of otherShareMinorUnits across `unsettled` only, grouped by
   * currency: shared bills/subscriptions are never assumed to share one
   * currency, so nothing here is ever added across two different ones.
   * In the ordinary case (everything in one currency) this has exactly
   * one key.
   */
  totalsOwedByCurrency: Record<string, number>;
};

/**
 * The one function both the in-app Shared Responsibility view and the
 * generated statement PDF call, so the two can never disagree on what's
 * owed. Only ever reads `shared` items with a real amount and split
 * percent; everything else (not shared, or shared but still missing an
 * amount) is excluded rather than assumed to be zero.
 */
export function computeSharedResponsibilitySummary(items: SharedResponsibilityItem[]): SharedResponsibilitySummary {
  const unsettled: UnsettledLine[] = [];
  const settled: SettledLine[] = [];
  const totalsOwedByCurrency: Record<string, number> = {};

  for (const item of items) {
    if (!item.shared || item.amountMinorUnits === null || item.sharedSplitPercent === null) continue;
    const { otherShareMinorUnits } = computeSharedSplit(item.amountMinorUnits, item.sharedSplitPercent);
    if (item.settled) {
      settled.push({ name: item.name, otherShareMinorUnits, currency: item.currency, settledAt: item.settledAt });
    } else {
      unsettled.push({ name: item.name, otherShareMinorUnits, currency: item.currency });
      totalsOwedByCurrency[item.currency] = (totalsOwedByCurrency[item.currency] ?? 0) + otherShareMinorUnits;
    }
  }

  return {
    sharedItemCount: unsettled.length + settled.length,
    unsettled,
    settled,
    totalsOwedByCurrency,
  };
}
