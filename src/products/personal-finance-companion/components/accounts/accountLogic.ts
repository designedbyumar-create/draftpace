import type { Account } from "../../state";

/**
 * The exact number of days before a balance is flagged needs review is a
 * genuinely open product decision (launch spec section 30). Kept as one
 * named, documented constant rather than hardcoded inline, so the real
 * threshold can be changed in one place once that decision is made — not
 * invented as a permanent product behavior here.
 */
export const BALANCE_STALENESS_DAYS = 30;

export function daysSince(dateIso: string, now: Date = new Date()): number {
  const then = new Date(`${dateIso}T00:00:00Z`);
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function isStale(account: Account, now: Date = new Date()): boolean {
  if (account.status === "archived") return false;
  return daysSince(account.balanceAsOfDate, now) > BALANCE_STALENESS_DAYS;
}

export type AccountsSummary = {
  totalAvailableMinorUnits: number;
  totalProtectedMinorUnits: number;
  activeCount: number;
  oldestBalanceDate: string | null;
};

export function summarizeAccounts(accounts: Account[]): AccountsSummary {
  const active = accounts.filter((a) => a.status !== "archived");
  let totalAvailableMinorUnits = 0;
  let totalProtectedMinorUnits = 0;
  let oldestBalanceDate: string | null = null;

  for (const account of active) {
    if (account.availableForSpending) totalAvailableMinorUnits += account.currentBalanceMinorUnits;
    else totalProtectedMinorUnits += account.currentBalanceMinorUnits;
    if (!oldestBalanceDate || account.balanceAsOfDate < oldestBalanceDate) oldestBalanceDate = account.balanceAsOfDate;
  }

  return { totalAvailableMinorUnits, totalProtectedMinorUnits, activeCount: active.length, oldestBalanceDate };
}

/** The one dominant next action: the single oldest stale balance, or "add an account" if none exist. Never a rotating tip. */
export type AccountsDominantAction =
  | { kind: "add-first" }
  | { kind: "update-stale"; account: Account; daysStale: number }
  | null;

export function resolveDominantAction(accounts: Account[], now: Date = new Date()): AccountsDominantAction {
  const active = accounts.filter((a) => a.status !== "archived");
  if (active.length === 0) return { kind: "add-first" };

  const stale = active
    .filter((a) => isStale(a, now))
    .sort((a, b) => (a.balanceAsOfDate < b.balanceAsOfDate ? -1 : 1));

  if (stale.length > 0) {
    return { kind: "update-stale", account: stale[0], daysStale: daysSince(stale[0].balanceAsOfDate, now) };
  }
  return null;
}

/** The specific, non-generic explanation shown for a record that isn't ready — per the launch spec's "state the fact, explain the consequence, offer the next action" tone shape. */
export function describeAccountIncompleteness(account: Account, now: Date = new Date()): string | null {
  if (isStale(account, now)) {
    const days = daysSince(account.balanceAsOfDate, now);
    return `This balance was last confirmed ${days} days ago. Update it if it has changed.`;
  }
  return null;
}
