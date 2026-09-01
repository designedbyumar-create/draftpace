"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Bell, WarningCircle, CheckCircle2 } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listAccounts } from "../domain/accounts";
import { listIncomeSources } from "../domain/incomeSources";
import { listBills } from "../domain/bills";
import { listSubscriptions } from "../domain/subscriptions";
import { listTransactions } from "../domain/transactions";
import { listDebts } from "../domain/debts";
import { listSavingsGoals } from "../domain/savingsGoals";
import { deriveAttentionItems, type AttentionInputs, type AttentionItem } from "../attention";
import { readSnoozed, writeSnoozed, snoozeUntil } from "./attentionSnooze";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const AREA_LABELS: Record<AttentionItem["area"], string> = {
  accounts: "Accounts",
  income: "Income",
  bills: "Bills",
  subscriptions: "Subscriptions",
  transactions: "Transactions",
  debt: "Debt",
  savings: "Savings",
};

/**
 * Attention — the signature Draftpace interaction. One deterministic list
 * of what genuinely needs a look, derived from the same rules the direct
 * sections use (attention.ts), never a second opinion. There is no
 * checklist to complete and no count to chase: an item leaves this list the
 * moment its underlying record no longer has the issue, or when it's
 * snoozed for a week on this device. Nothing here celebrates emptiness or
 * penalizes a backlog — it just tells the truth about what's outstanding.
 */
export default function AttentionModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<AttentionInputs | null>(null);
  const [snoozed, setSnoozed] = useState<Record<string, string>>({});

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
    setSnoozed(readSnoozed());
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = useMemo(() => new Date(), []);
  const allItems = useMemo(() => (records ? deriveAttentionItems(records, now) : []), [records, now]);

  const { visible, snoozedItems } = useMemo(() => {
    const isSnoozedNow = (item: AttentionItem) => {
      const until = snoozed[item.id];
      return Boolean(until && until > now.toISOString());
    };
    const visibleItems = allItems
      .filter((item) => !isSnoozedNow(item))
      .sort((a, b) => (a.urgency === b.urgency ? 0 : a.urgency === "needsResolution" ? -1 : 1));
    const snoozedNow = allItems.filter(isSnoozedNow);
    return { visible: visibleItems, snoozedItems: snoozedNow };
  }, [allItems, snoozed, now]);

  function snoozeItem(id: string) {
    const next = { ...snoozed, [id]: snoozeUntil(now) };
    setSnoozed(next);
    writeSnoozed(next);
  }

  function unsnoozeAll() {
    setSnoozed({});
    writeSnoozed({});
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading Attention…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Bell}
        title="Couldn't load Attention"
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
    return <EmptyState icon={Bell} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const needsResolution = visible.filter((item) => item.urgency === "needsResolution");
  const worthAWhile = visible.filter((item) => item.urgency === "worthAWhile");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Attention</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Everything here is derived from what you've recorded. Resolve the underlying record and the item disappears on its own.
        </p>
      </div>

      {visible.length === 0 ? (
        <Surface elevated className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden />
          <div>
            <p className="text-[15px] font-semibold text-[var(--text)]">You&apos;re caught up.</p>
            <p className="text-[13px] text-[var(--muted)]">Nothing needs a look right now.</p>
          </div>
        </Surface>
      ) : (
        <div className="flex flex-col gap-6">
          {needsResolution.length > 0 && (
            <AttentionGroup title="Needs resolution" items={needsResolution} onSnooze={snoozeItem} />
          )}
          {worthAWhile.length > 0 && <AttentionGroup title="Worth a while" items={worthAWhile} onSnooze={snoozeItem} />}
        </div>
      )}

      {snoozedItems.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3.5 py-2.5">
          <p className="text-[12px] text-[var(--muted)]">
            {snoozedItems.length}
            {" "}snoozed for now on this device.
          </p>
          <button
            type="button"
            onClick={unsnoozeAll}
            className="rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-[var(--primary)] hover:underline"
          >
            Show snoozed
          </button>
        </div>
      )}
    </div>
  );
}

function AttentionGroup({
  title,
  items,
  onSnooze,
}: {
  title: string;
  items: AttentionItem[];
  onSnooze: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
        {title} ({items.length})
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5"
          >
            <WarningCircle
              className={`mt-0.5 h-4 w-4 shrink-0 ${item.urgency === "needsResolution" ? "text-[var(--warning)]" : "text-[var(--faint)]"}`}
              aria-hidden
            />
            <div className="flex-1">
              <Link href={item.deepLink} className="text-[14px] font-medium text-[var(--text)] hover:text-[var(--primary)] hover:underline">
                {item.message}
              </Link>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--faint)]">{AREA_LABELS[item.area]}</p>
            </div>
            <button
              type="button"
              onClick={() => onSnooze(item.id)}
              className="shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--muted)]"
              title="Hide for 7 days on this device"
              aria-label={`Snooze: ${item.message}`}
            >
              Snooze
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
