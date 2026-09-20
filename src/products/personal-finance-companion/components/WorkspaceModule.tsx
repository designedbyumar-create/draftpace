"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ProductDefinition } from "@/product-framework/definition";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Compass } from "@/design-system/Icon";
import GuidedTour, { type TourStep } from "@/components/platform/GuidedTour";
import { useFirstRunTour } from "@/components/platform/useFirstRunTour";
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
import { balanceAllocation, computeCapabilities, type FinancialPictureInputs } from "../companion/capability";
import { resolveDominantAction, type DominantAction } from "../companion/dominantAction";
import { deriveAttentionItems, type AttentionItem } from "../attention";
import { summarizeFreshness } from "../freshness";
import { summarizeRecentChanges } from "../recentChanges";
import { readSnoozed, writeSnoozed, snoozeUntil } from "./attentionSnooze";
import TodayView from "./TodayView";
import { deriveMonthLedger } from "../monthLedger";
import { deriveComingUp } from "../comingUp";
import { formatTodayLabel } from "../dates";
import { listBillPayments } from "../domain/billPayments";
import type { BillPayment } from "../state";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * "Your financial picture" — Workspace, the surface a returning user lands
 * on (launch spec Stage E). Not a seven-card dashboard: leads with exactly
 * one dominant next action (companion/dominantAction.ts), then a real
 * Attention Inbox, then the current picture, with freshness/recent
 * changes/Companion continuation as progressive disclosure below. Every
 * figure and issue here is derived live from canonical records — nothing
 * is stored specifically for this screen except which Attention items the
 * owner has snoozed, which lives in localStorage (this device only, never
 * a second source of truth for whether the underlying issue is resolved).
 */
const TOUR_STEPS: TourStep[] = [
  {
    targetId: "pfc-tour-available-money",
    title: "Available Money",
    body: "What's genuinely free to spend, after protected money, bills, subscriptions and debt minimums. The bar shows where the rest of your balance goes, and \"How these figures are worked out\" has the exact breakdown.",
  },
  {
    targetId: "pfc-tour-next-action",
    title: "One thing to do next",
    body: "Never a to-do list. Just the single most useful next step, derived from what's actually missing or overdue in your records.",
  },
  {
    targetId: "pfc-tour-attention",
    title: "Needs a look",
    body: "Everything here comes from a real gap in a real record: a missing due date, a stale balance. Fix the record and the item leaves on its own.",
  },
];

export default function WorkspaceModule({ definition }: { definition?: ProductDefinition }) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<FinancialPictureInputs | null>(null);
  const [unreviewedImportCount, setUnreviewedImportCount] = useState(0);
  const [snoozed, setSnoozed] = useState<Record<string, string>>({});
  const [payments, setPayments] = useState<BillPayment[]>([]);

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
    // Paid ticks only take bills off "Coming up"; if they cannot be read the list simply keeps every bill.
    const paymentsResult = await listBillPayments(found.id);
    setPayments(paymentsResult.ok ? paymentsResult.data : []);
    setSnoozed(readSnoozed());
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const slug = definition?.slug ?? "personal-finance-companion";
  const { tourOn, finishTour } = useFirstRunTour(slug, status === "ready");

  const now = useMemo(() => new Date(), []);

  const capabilities = useMemo(() => (records ? computeCapabilities(records) : []), [records]);
  const allAttentionItems = useMemo(() => (records ? deriveAttentionItems(records, now) : []), [records, now]);
  const dominantAction: DominantAction | null = useMemo(
    () => (records ? resolveDominantAction(capabilities, allAttentionItems, unreviewedImportCount) : null),
    [records, capabilities, allAttentionItems, unreviewedImportCount]
  );
  const allocation = useMemo(() => (records ? balanceAllocation(records) : null), [records]);
  const comingUp = useMemo(() => (records ? deriveComingUp(records, payments, now) : []), [records, payments, now]);
  const monthLedger = useMemo(() => (records ? deriveMonthLedger(records, now) : null), [records, now]);
  const freshness = useMemo(() => (records ? summarizeFreshness(records, now) : []), [records, now]);
  const recentChanges = useMemo(() => (records ? summarizeRecentChanges(records, now) : []), [records, now]);

  const visibleAttentionItems = useMemo(() => {
    const isSnoozedNow = (item: AttentionItem) => {
      const until = snoozed[item.id];
      return Boolean(until && until > now.toISOString());
    };
    return allAttentionItems
      .filter((item) => !isSnoozedNow(item))
      .sort((a, b) => (a.urgency === b.urgency ? 0 : a.urgency === "needsResolution" ? -1 : 1));
  }, [allAttentionItems, snoozed, now]);

  function snoozeItem(id: string) {
    const until = snoozeUntil(now);
    const next = { ...snoozed, [id]: until };
    setSnoozed(next);
    writeSnoozed(next);
  }

  const snoozedCount = Object.keys(snoozed).filter((id) => snoozed[id] > now.toISOString()).length;

  function clearSnoozed() {
    setSnoozed({});
    writeSnoozed({});
  }

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
    return <EmptyState icon={Compass} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const anyData = Object.values(records).some((list) => list.length > 0);

  if (!anyData) {
    return (
      <EmptyState
        icon={Compass}
        title="Nothing recorded yet"
        description="Once you add a few accounts, bills, or income sources, your current picture appears here."
        action={
          <Link href="/app/products/personal-finance-companion/start">
            <Button variant="action" size="sm">Start with Companion</Button>
          </Link>
        }
      />
    );
  }

  const availableMoney = capabilities.find((row) => row.key === "availableMoney");

  let companionMessage = "Run a regular review with Companion";
  if (capabilities.some((row) => row.status === "waiting")) {
    companionMessage = "Continue setting up your financial picture";
  } else if (capabilities.some((row) => row.status === "needsInfo") || allAttentionItems.length > 0 || unreviewedImportCount > 0) {
    companionMessage = "Review missing information with Companion";
  }

  return (
    <div className="flex flex-col gap-7">
      <TodayView
        todayLabel={formatTodayLabel(now)}
        availableMoney={availableMoney}
        allocation={allocation}
        capabilities={capabilities}
        comingUp={comingUp}
        goals={records.savingsGoals}
        dominantAction={dominantAction}
        visibleAttentionItems={visibleAttentionItems}
        snoozedCount={snoozedCount}
        onSnooze={snoozeItem}
        onClearSnoozed={clearSnoozed}
        unreviewedImportCount={unreviewedImportCount}
        freshness={freshness}
        recentChanges={recentChanges}
        companionMessage={companionMessage}
        monthLedger={monthLedger}
      />
      {tourOn && <GuidedTour steps={TOUR_STEPS} onFinish={finishTour} />}
    </div>
  );
}
