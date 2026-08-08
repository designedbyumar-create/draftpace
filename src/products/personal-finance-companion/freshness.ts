import type { Account, Debt } from "./state";
import { isStale as isAccountStale, daysSince } from "./components/accounts/accountLogic";

/**
 * Data freshness, made useful rather than alarmist (launch spec Stage E
 * §E7): a plain count grouped by domain — "2 balances may need
 * refreshing" — never "Your data is stale!" and never one line per
 * record. Staleness logic differs per domain because the domains differ:
 * a checking account balance goes stale faster than a debt balance, which
 * changes only with a statement or a payment, so debt gets its own
 * (longer) window rather than reusing the account threshold wholesale.
 */

export const DEBT_BALANCE_STALENESS_DAYS = 45;

export interface FreshnessInputs {
  accounts: Account[];
  debts: Debt[];
}

export interface FreshnessSummary {
  domain: "accounts" | "debt";
  message: string;
  count: number;
}

export function summarizeFreshness(inputs: FreshnessInputs, now: Date = new Date()): FreshnessSummary[] {
  const summaries: FreshnessSummary[] = [];

  const staleAccounts = inputs.accounts.filter((a) => a.status !== "archived" && isAccountStale(a, now));
  if (staleAccounts.length > 0) {
    summaries.push({
      domain: "accounts",
      count: staleAccounts.length,
      message: `${staleAccounts.length} ${staleAccounts.length === 1 ? "balance" : "balances"} may need refreshing`,
    });
  }

  const staleDebts = inputs.debts.filter((d) => d.status !== "archived" && daysSince(d.balanceAsOfDate, now) > DEBT_BALANCE_STALENESS_DAYS);
  if (staleDebts.length > 0) {
    summaries.push({
      domain: "debt",
      count: staleDebts.length,
      message: `${staleDebts.length} debt ${staleDebts.length === 1 ? "balance" : "balances"} may need refreshing`,
    });
  }

  return summaries;
}
