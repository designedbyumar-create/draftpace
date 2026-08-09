"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Bank, Wallet, CalendarCheck, RotateCcw, Clock, CreditCard, Target, ChevronRight, Layers3 } from "@/design-system/Icon";
import { formatCurrency } from "@/lib/currency";
import { describeResultError } from "@/product-framework/result";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listAccounts } from "../domain/accounts";
import { listIncomeSources } from "../domain/incomeSources";
import { listBills } from "../domain/bills";
import { listSubscriptions } from "../domain/subscriptions";
import { listTransactions } from "../domain/transactions";
import { listDebts } from "../domain/debts";
import { listSavingsGoals } from "../domain/savingsGoals";
import { countUnreviewedCandidates } from "../domain/extractionCandidates";
import { resolveSafeDeepLink } from "../deepLinks";
import { deriveAttentionItems, summarizeAttentionByArea, type AttentionInputs } from "../attention";
import { summarizeAccounts, isStale } from "./accounts/accountLogic";
import { summarizeIncome } from "./income/incomeLogic";
import { summarizeBills } from "./bills/billLogic";
import { summarizeSubscriptions } from "./subscriptions/subscriptionLogic";
import { summarizeTransactions } from "./transactions/transactionLogic";
import { summarizeDebts } from "./debt/debtLogic";
import { summarizeSavings } from "./savings/savingsLogic";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const CURRENCY = "USD";

/**
 * Records — the coherent home for all seven direct sections. Each card
 * reads the same deterministic per-area summary the section's own page
 * computes (accountLogic/billLogic/etc.) — real balances, real monthly
 * totals, real progress — never a record count standing in for financial
 * state. "Needs a look" badges come from the same attention.ts derivation
 * Attention itself uses, so this is never a second opinion of what's
 * outstanding, just a second place it's visible.
 */
export default function RecordsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<AttentionInputs | null>(null);
  const [unreviewedImportCount, setUnreviewedImportCount] = useState(0);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const found = await findPersonalFinanceCompanionInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    const [accounts, incomeSources, bills, subscriptions, transactions, debts, savingsGoals, unreviewedCount] = await Promise.all([
      listAccounts(found.id),
      listIncomeSources(found.id),
      listBills(found.id),
      listSubscriptions(found.id),
      listTransactions(found.id),
      listDebts(found.id),
      listSavingsGoals(found.id),
      countUnreviewedCandidates(found.id),
    ]);
    const results = [accounts, incomeSources, bills, subscriptions, transactions, debts, savingsGoals];
    const failed = results.find((r) => !r.ok);
    if (failed && !failed.ok) {
      setErrorMessage(describeResultError(failed.error));
      setStatus("error");
      return;
    }
    setRecords({
      accounts: accounts.ok ? accounts.data : [],
      incomeSources: incomeSources.ok ? incomeSources.data : [],
      bills: bills.ok ? bills.data : [],
      subscriptions: subscriptions.ok ? subscriptions.data : [],
      transactions: transactions.ok ? transactions.data : [],
      debts: debts.ok ? debts.data : [],
      savingsGoals: savingsGoals.ok ? savingsGoals.data : [],
    });
    setUnreviewedImportCount(unreviewedCount.ok ? unreviewedCount.data : 0);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = useMemo(() => new Date(), []);
  const attentionByArea = useMemo(() => {
    if (!records) return new Map<string, number>();
    const items = deriveAttentionItems(records, now);
    return new Map(summarizeAttentionByArea(items).map((row) => [row.area, row.count]));
  }, [records, now]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading Records…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Layers3}
        title="Couldn't load Records"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance" || !records) {
    return <EmptyState icon={Layers3} title="No product instance found" description="This shouldn't happen for an owner — contact support." />;
  }

  const accountsSummary = summarizeAccounts(records.accounts);
  const incomeSummary = summarizeIncome(records.incomeSources);
  const billsSummary = summarizeBills(records.bills);
  const subscriptionsSummary = summarizeSubscriptions(records.subscriptions);
  const transactionsSummary = summarizeTransactions(records.transactions);
  const debtSummary = summarizeDebts(records.debts);
  const savingsSummary = summarizeSavings(records.savingsGoals);

  const anyStaleAccount = records.accounts.some((a) => a.status !== "archived" && isStale(a, now));

  const totalRecords =
    accountsSummary.activeCount +
    incomeSummary.activeCount +
    billsSummary.activeCount +
    subscriptionsSummary.activeCount +
    transactionsSummary.activeCount +
    debtSummary.activeCount +
    savingsSummary.activeCount;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Records</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          {totalRecords === 0 ? "Nothing recorded yet across any area." : "What's actually true right now, area by area."}
        </p>
      </div>

      {unreviewedImportCount > 0 && (
        <Surface className="flex items-center gap-3">
          <Layers3 className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[var(--text)]">
              {unreviewedImportCount} imported {unreviewedImportCount === 1 ? "record" : "records"} waiting for review.
            </p>
            <p className="text-[12px] text-[var(--muted)]">Nothing from an import becomes part of your picture until you confirm it.</p>
          </div>
          <Link href={resolveSafeDeepLink({ kind: "companionResume" })}>
            <Button size="sm" variant="secondary">
              Review
            </Button>
          </Link>
        </Surface>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AreaCard
          href="/app/products/personal-finance-companion/accounts"
          icon={Bank}
          label="Accounts"
          attentionCount={attentionByArea.get("accounts") ?? 0}
        >
          {accountsSummary.activeCount === 0 ? (
            <EmptyLine>Add an account to see what's available to spend.</EmptyLine>
          ) : (
            <>
              <Headline>{formatCurrency(accountsSummary.totalAvailableMinorUnits, CURRENCY)}</Headline>
              <DetailLine>
                available across {accountsSummary.activeCount} {accountsSummary.activeCount === 1 ? "account" : "accounts"}
                {accountsSummary.totalProtectedMinorUnits > 0 && ` · ${formatCurrency(accountsSummary.totalProtectedMinorUnits, CURRENCY)} protected`}
              </DetailLine>
              {anyStaleAccount && <WarningLine>A balance hasn't been updated recently.</WarningLine>}
            </>
          )}
        </AreaCard>

        <AreaCard
          href="/app/products/personal-finance-companion/income"
          icon={Wallet}
          label="Income"
          attentionCount={attentionByArea.get("income") ?? 0}
        >
          {incomeSummary.activeCount === 0 ? (
            <EmptyLine>Add an income source to see what's expected.</EmptyLine>
          ) : (
            <>
              <Headline>{formatCurrency(incomeSummary.totalMonthlyEquivalentMinorUnits, CURRENCY)}<Unit>/mo</Unit></Headline>
              <DetailLine>
                {incomeSummary.nextExpectedDate ? `Next expected ${incomeSummary.nextExpectedDate}` : `${incomeSummary.activeCount} source${incomeSummary.activeCount === 1 ? "" : "s"}`}
                {incomeSummary.irregularCount > 0 && ` · ${incomeSummary.irregularCount} irregular`}
              </DetailLine>
            </>
          )}
        </AreaCard>

        <AreaCard
          href="/app/products/personal-finance-companion/bills"
          icon={CalendarCheck}
          label="Bills"
          attentionCount={attentionByArea.get("bills") ?? 0}
        >
          {billsSummary.activeCount === 0 ? (
            <EmptyLine>Add a bill to track what's coming due.</EmptyLine>
          ) : (
            <>
              <Headline>{formatCurrency(billsSummary.totalMonthlyEquivalentMinorUnits, CURRENCY)}<Unit>/mo</Unit></Headline>
              <DetailLine>{billsSummary.activeCount} tracked</DetailLine>
              {billsSummary.missingDueDateCount > 0 && (
                <WarningLine>
                  {billsSummary.missingDueDateCount} missing a due date
                </WarningLine>
              )}
              {billsSummary.unfundedEssentialCount > 0 && (
                <WarningLine>{billsSummary.unfundedEssentialCount} essential unfunded</WarningLine>
              )}
            </>
          )}
        </AreaCard>

        <AreaCard
          href="/app/products/personal-finance-companion/subscriptions"
          icon={RotateCcw}
          label="Subscriptions"
          attentionCount={attentionByArea.get("subscriptions") ?? 0}
        >
          {subscriptionsSummary.activeCount === 0 ? (
            <EmptyLine>Add a subscription to track recurring cost.</EmptyLine>
          ) : (
            <>
              <Headline>{formatCurrency(subscriptionsSummary.totalMonthlyEquivalentMinorUnits, CURRENCY)}<Unit>/mo</Unit></Headline>
              <DetailLine>{subscriptionsSummary.activeCount} active</DetailLine>
              {subscriptionsSummary.reviewingCount > 0 && <WarningLine>{subscriptionsSummary.reviewingCount} still marked Review</WarningLine>}
              {subscriptionsSummary.plannedCancellationCount > 0 && (
                <DetailLine>{subscriptionsSummary.plannedCancellationCount} planned to cancel</DetailLine>
              )}
            </>
          )}
        </AreaCard>

        <AreaCard
          href="/app/products/personal-finance-companion/transactions"
          icon={Clock}
          label="Transactions"
          attentionCount={attentionByArea.get("transactions") ?? 0}
        >
          {transactionsSummary.activeCount === 0 ? (
            <EmptyLine>Log a transaction to start a real ledger.</EmptyLine>
          ) : (
            <>
              <Headline>{formatCurrency(transactionsSummary.totalSpendingMinorUnits, CURRENCY)}</Headline>
              <DetailLine>
                logged spending · {transactionsSummary.activeCount} {transactionsSummary.activeCount === 1 ? "entry" : "entries"}
              </DetailLine>
              {transactionsSummary.mostRecentDate && <DetailLine>Last logged {transactionsSummary.mostRecentDate}</DetailLine>}
            </>
          )}
        </AreaCard>

        <AreaCard
          href="/app/products/personal-finance-companion/debt"
          icon={CreditCard}
          label="Debt"
          attentionCount={attentionByArea.get("debt") ?? 0}
        >
          {debtSummary.activeCount === 0 ? (
            <EmptyLine>No debt on file.</EmptyLine>
          ) : (
            <>
              <Headline>{formatCurrency(debtSummary.totalBalanceMinorUnits, CURRENCY)}</Headline>
              <DetailLine>
                owed across {debtSummary.activeCount} {debtSummary.activeCount === 1 ? "debt" : "debts"}
                {debtSummary.totalMinimumPaymentMinorUnits > 0 && ` · ${formatCurrency(debtSummary.totalMinimumPaymentMinorUnits, CURRENCY)}/mo minimum`}
              </DetailLine>
              {debtSummary.missingInterestRateCount > 0 && <WarningLine>{debtSummary.missingInterestRateCount} missing an interest rate</WarningLine>}
            </>
          )}
        </AreaCard>

        <AreaCard
          href="/app/products/personal-finance-companion/savings"
          icon={Target}
          label="Savings"
          attentionCount={attentionByArea.get("savings") ?? 0}
        >
          {savingsSummary.activeCount === 0 ? (
            <EmptyLine>Add a savings goal to start tracking progress.</EmptyLine>
          ) : (
            <>
              <Headline>
                {formatCurrency(savingsSummary.totalSavedMinorUnits, CURRENCY)}
                {savingsSummary.totalTargetMinorUnits > 0 && (
                  <Unit> of {formatCurrency(savingsSummary.totalTargetMinorUnits, CURRENCY)}</Unit>
                )}
              </Headline>
              {savingsSummary.totalTargetMinorUnits > 0 && (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{
                      width: `${Math.max(0, Math.min(100, (savingsSummary.totalSavedMinorUnits / savingsSummary.totalTargetMinorUnits) * 100))}%`,
                    }}
                  />
                </div>
              )}
              <DetailLine>{savingsSummary.activeCount} {savingsSummary.activeCount === 1 ? "goal" : "goals"}</DetailLine>
              {savingsSummary.missingTargetDateCount > 0 && <WarningLine>{savingsSummary.missingTargetDateCount} missing a target date</WarningLine>}
            </>
          )}
        </AreaCard>
      </div>
    </div>
  );
}

function AreaCard({
  href,
  icon: Icon,
  label,
  attentionCount,
  children,
}: {
  href: string;
  icon: typeof Bank;
  label: string;
  attentionCount: number;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Surface className="flex h-full flex-col gap-2 transition hover:border-[var(--primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <Icon size={15} aria-hidden />
            </div>
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">{label}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {attentionCount > 0 && <Badge tone="warning">{attentionCount} needs a look</Badge>}
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--faint)]" />
          </div>
        </div>
        <div>{children}</div>
      </Surface>
    </Link>
  );
}

function Headline({ children }: { children: React.ReactNode }) {
  return <p className="text-[22px] font-semibold tabular-nums leading-tight text-[var(--text)]">{children}</p>;
}

function Unit({ children }: { children: React.ReactNode }) {
  return <span className="text-[13px] font-medium text-[var(--muted)]">{children}</span>;
}

function DetailLine({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-[var(--muted)]">{children}</p>;
}

function WarningLine({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-[var(--warning)]">{children}</p>;
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-[var(--muted)]">{children}</p>;
}
