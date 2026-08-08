"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Compass } from "@/design-system/Icon";
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
import { computeCapabilities, type CapabilityRow, type FinancialPictureInputs } from "../companion/capability";
import { deriveAttentionItems, type AttentionItem } from "../attention";
import ExplainBreakdown from "./companion/ExplainBreakdown";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const STATUS_TONE: Record<CapabilityRow["status"], "success" | "warning" | "neutral"> = {
  ready: "success",
  needsInfo: "warning",
  waiting: "neutral",
};

/**
 * "Your financial picture" — the deterministic Workspace surface
 * Companion's "See my current picture" links to. Reads only from
 * capability.ts/attention.ts; invents nothing of its own.
 */
export default function WorkspaceModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<FinancialPictureInputs | null>(null);

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
    const [accounts, incomeSources, bills, subscriptions, transactions, debts, savingsGoals] = await Promise.all([
      listAccounts(found.id),
      listIncomeSources(found.id),
      listBills(found.id),
      listSubscriptions(found.id),
      listTransactions(found.id),
      listDebts(found.id),
      listSavingsGoals(found.id),
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
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading your financial picture…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Compass}
        title="Couldn't load your financial picture"
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
    return <EmptyState icon={Compass} title="No product instance found" description="This shouldn't happen for an owner — contact support." />;
  }

  const capabilities = computeCapabilities(records);
  const attentionItems = deriveAttentionItems(records);
  const anyData = Object.values(records).some((list) => list.length > 0);

  if (!anyData) {
    return (
      <EmptyState
        icon={Compass}
        title="Nothing recorded yet"
        description="Once you add a few accounts, bills, or income sources, your current picture appears here."
        action={
          <Link href="/app/products/personal-finance-companion/start">
            <Button size="sm">Start with Companion</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Your financial picture</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">Deterministic, built only from what you've recorded — never a guess.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {capabilities.map((row) => (
          <Surface key={row.key} className="flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">{row.label}</p>
              <Badge tone={STATUS_TONE[row.status]}>{row.status === "waiting" ? "Waiting" : row.status === "needsInfo" ? row.detail : "Ready"}</Badge>
            </div>
            <p className="mt-1.5 text-[22px] font-semibold tabular-nums text-[var(--text)]">
              {row.valueMinorUnits !== null ? formatCurrency(row.valueMinorUnits, "USD") : "—"}
            </p>
            {row.explain && <ExplainBreakdown breakdown={row.explain} currency="USD" label={row.label} valueMinorUnits={row.valueMinorUnits ?? 0} />}
          </Surface>
        ))}
      </div>

      {attentionItems.length > 0 && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Needs a look</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {attentionItems.slice(0, 8).map((item: AttentionItem) => (
              <li key={item.id}>
                <Link
                  href={item.deepLink}
                  className="block rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] font-medium text-[var(--text)] hover:border-[var(--primary)]"
                >
                  {item.message}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-[var(--border)] pt-4">
        <Link href="/app/products/personal-finance-companion/start">
          <Button size="sm" variant="secondary">
            Continue with Companion
          </Button>
        </Link>
      </div>
    </div>
  );
}
