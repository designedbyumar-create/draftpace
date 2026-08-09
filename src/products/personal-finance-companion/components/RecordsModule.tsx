"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import {
  type DraftpaceIcon,
  Bank,
  Wallet,
  CalendarCheck,
  RotateCcw,
  Clock,
  CreditCard,
  Target,
  ChevronRight,
  Layers3,
} from "@/design-system/Icon";
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
import type { FinancialArea } from "../state";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

type AreaSummary = {
  area: FinancialArea;
  label: string;
  icon: DraftpaceIcon;
  count: number;
  detail: string;
};

/**
 * Records — the coherent home for all seven direct sections, so they read
 * as one connected picture instead of seven disconnected CRUD screens.
 * Every count here is a live read of the same canonical tables the
 * individual area pages use; nothing is cached or estimated here.
 */
export default function RecordsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [areas, setAreas] = useState<AreaSummary[] | null>(null);
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
    const active = <T extends { status: string }>(rows: T[]) => rows.filter((r) => r.status !== "archived");
    const accountsActive = accounts.ok ? active(accounts.data) : [];
    const incomeActive = incomeSources.ok ? active(incomeSources.data) : [];
    const billsActive = bills.ok ? active(bills.data) : [];
    const subscriptionsActive = subscriptions.ok ? active(subscriptions.data) : [];
    const transactionsActive = transactions.ok ? active(transactions.data) : [];
    const debtsActive = debts.ok ? active(debts.data) : [];
    const savingsActive = savingsGoals.ok ? active(savingsGoals.data) : [];

    setAreas([
      {
        area: "accounts",
        label: "Accounts",
        icon: Bank,
        count: accountsActive.length,
        detail: accountsActive.length === 0 ? "No accounts yet" : `${accountsActive.length} tracked`,
      },
      {
        area: "income",
        label: "Income",
        icon: Wallet,
        count: incomeActive.length,
        detail: incomeActive.length === 0 ? "No income sources yet" : `${incomeActive.length} source${incomeActive.length === 1 ? "" : "s"}`,
      },
      {
        area: "bills",
        label: "Bills",
        icon: CalendarCheck,
        count: billsActive.length,
        detail: billsActive.length === 0 ? "No bills yet" : `${billsActive.length} tracked`,
      },
      {
        area: "subscriptions",
        label: "Subscriptions",
        icon: RotateCcw,
        count: subscriptionsActive.length,
        detail: subscriptionsActive.length === 0 ? "No subscriptions yet" : `${subscriptionsActive.length} tracked`,
      },
      {
        area: "transactions",
        label: "Transactions",
        icon: Clock,
        count: transactionsActive.length,
        detail: transactionsActive.length === 0 ? "Nothing logged yet" : `${transactionsActive.length} logged`,
      },
      {
        area: "debt",
        label: "Debt",
        icon: CreditCard,
        count: debtsActive.length,
        detail: debtsActive.length === 0 ? "No debts on file" : `${debtsActive.length} tracked`,
      },
      {
        area: "savings",
        label: "Savings",
        icon: Target,
        count: savingsActive.length,
        detail: savingsActive.length === 0 ? "No goals yet" : `${savingsActive.length} goal${savingsActive.length === 1 ? "" : "s"}`,
      },
    ]);
    setUnreviewedImportCount(unreviewedCount.ok ? unreviewedCount.data : 0);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalRecords = useMemo(() => areas?.reduce((sum, a) => sum + a.count, 0) ?? 0, [areas]);

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

  if (status === "no-instance" || !areas) {
    return <EmptyState icon={Layers3} title="No product instance found" description="This shouldn't happen for an owner — contact support." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Records</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          {totalRecords === 0 ? "Nothing recorded yet across any area." : `${totalRecords} records across seven areas.`}
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
        {areas.map((area) => (
          <Link key={area.area} href={`/app/products/personal-finance-companion/${area.area}`}>
            <Surface className="flex items-center gap-3 transition hover:border-[var(--primary)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                <area.icon size={18} aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-[var(--text)]">{area.label}</p>
                <p className="text-[12px] text-[var(--muted)]">{area.detail}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--faint)]" />
            </Surface>
          </Link>
        ))}
      </div>
    </div>
  );
}
