"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductDefinition } from "@/product-framework/definition";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Compass, Bell, WarningCircle, Clock, ArrowRight, CheckCircle2, Layers3 } from "@/design-system/Icon";
import GuidedTour, { type TourStep } from "@/products/monthly-money-reset/components/GuidedTour";
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
import { computeCapabilities, type CapabilityRow, type FinancialPictureInputs } from "../companion/capability";
import { resolveDominantAction, type DominantAction } from "../companion/dominantAction";
import { deriveAttentionItems, type AttentionItem } from "../attention";
import { summarizeFreshness } from "../freshness";
import { summarizeRecentChanges } from "../recentChanges";
import { resolveSafeDeepLink } from "../deepLinks";
import { readSnoozed, writeSnoozed, snoozeUntil } from "./attentionSnooze";
import ExplainBreakdown from "./companion/ExplainBreakdown";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const STATUS_TONE: Record<CapabilityRow["status"], "success" | "warning" | "neutral"> = {
  ready: "success",
  needsInfo: "warning",
  waiting: "neutral",
};

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
    targetId: "pfc-tour-next-action",
    title: "One thing to do next",
    body: "Never a to-do list. Just the single most useful next step, derived from what's actually missing or overdue in your records.",
  },
  {
    targetId: "pfc-tour-attention",
    title: "Needs a look",
    body: "Everything here comes from a real gap in a real record: a missing due date, a stale balance. Fix the record and the item leaves on its own.",
  },
  {
    targetId: "pfc-tour-available-money",
    title: "Available Money",
    body: "What's genuinely free to spend, after protected money and upcoming obligations. Tap \"How Draftpace got this\" on any figure to see the exact breakdown.",
  },
];

export default function WorkspaceModule({ definition }: { definition?: ProductDefinition }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<FinancialPictureInputs | null>(null);
  const [unreviewedImportCount, setUnreviewedImportCount] = useState(0);
  const [snoozed, setSnoozed] = useState<Record<string, string>>({});
  const [tourOn, setTourOn] = useState(false);

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
    setSnoozed(readSnoozed());
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const slug = definition?.slug ?? "personal-finance-companion";
  const replayRequested = searchParams.get("tour") === "1";

  useEffect(() => {
    if (status !== "ready" || typeof window === "undefined") return;

    // An explicit replay (Settings -> Replay tour) always starts the tour
    // and is cleared from the URL immediately so a refresh doesn't
    // re-trigger it — same pattern as Monthly Money Reset's own tour.
    if (replayRequested) {
      setTourOn(true);
      router.replace(`/app/products/${slug}/workspace`);
      return;
    }

    const key = `draftpace-tour-${slug}`;
    if (window.localStorage.getItem(key)) return;
    const timer = window.setTimeout(() => setTourOn(true), 550);
    return () => window.clearTimeout(timer);
  }, [status, replayRequested, router, slug]);

  const finishTour = useCallback(() => {
    setTourOn(false);
    if (typeof window !== "undefined") window.localStorage.setItem(`draftpace-tour-${slug}`, "1");
  }, [slug]);

  const now = useMemo(() => new Date(), []);

  const capabilities = useMemo(() => (records ? computeCapabilities(records) : []), [records]);
  const allAttentionItems = useMemo(() => (records ? deriveAttentionItems(records, now) : []), [records, now]);
  const dominantAction: DominantAction | null = useMemo(
    () => (records ? resolveDominantAction(capabilities, allAttentionItems, unreviewedImportCount) : null),
    [records, capabilities, allAttentionItems, unreviewedImportCount]
  );
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
            <Button size="sm">Start with Companion</Button>
          </Link>
        }
      />
    );
  }

  const availableMoney = capabilities.find((row) => row.key === "availableMoney");
  const secondaryCapabilities = capabilities.filter((row) => row.key !== "availableMoney");

  let companionMessage = "Run a regular review with Companion";
  if (capabilities.some((row) => row.status === "waiting")) {
    companionMessage = "Continue setting up your financial picture";
  } else if (capabilities.some((row) => row.status === "needsInfo") || allAttentionItems.length > 0 || unreviewedImportCount > 0) {
    companionMessage = "Review missing information with Companion";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Your financial picture</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">Deterministic, built only from what you've recorded, never a guess.</p>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-6">
          {dominantAction ? (
            <Surface id="pfc-tour-next-action" elevated className="flex flex-col gap-3 border-l-4 border-l-[var(--primary)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">What to do next</p>
              <p className="text-[15px] font-semibold leading-snug text-[var(--text)]">{dominantAction.message}</p>
              <Link href={dominantAction.deepLink} className="self-start">
                <Button size="sm" iconRight={<ArrowRight size={14} aria-hidden />}>
                  Take care of this
                </Button>
              </Link>
            </Surface>
          ) : (
            <Surface id="pfc-tour-next-action" elevated className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden />
              <div>
                <p className="text-[15px] font-semibold text-[var(--text)]">You're caught up.</p>
                <p className="text-[13px] text-[var(--muted)]">Nothing needs your attention right now.</p>
              </div>
            </Surface>
          )}

          <div id="pfc-tour-attention">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">
                <Bell className="h-3.5 w-3.5" /> Needs a look {visibleAttentionItems.length > 0 && `(${visibleAttentionItems.length})`}
              </p>
              {snoozedCount > 0 && (
                <button
                  type="button"
                  onClick={clearSnoozed}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-[var(--muted)] hover:text-[var(--primary)]"
                >
                  {snoozedCount} snoozed, show all
                </button>
              )}
            </div>

            {visibleAttentionItems.length === 0 ? (
              <p className="mt-2 text-[13px] text-[var(--muted)]">You're caught up. Nothing waiting on you.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {visibleAttentionItems.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex items-start gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    <WarningCircle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${item.urgency === "needsResolution" ? "text-[var(--warning)]" : "text-[var(--faint)]"}`}
                      aria-hidden
                    />
                    <div className="flex-1">
                      <Link href={item.deepLink} className="text-[13px] font-medium text-[var(--text)] hover:text-[var(--primary)] hover:underline">
                        {item.message}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => snoozeItem(item.id)}
                      className="shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--muted)]"
                      title="Hide for 7 days on this device"
                      aria-label={`Snooze: ${item.message}`}
                    >
                      Snooze
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {visibleAttentionItems.length > 0 && (
              <Link
                href={`/app/products/personal-finance-companion/attention`}
                className="mt-2 inline-block text-[12px] font-semibold text-[var(--primary)] hover:underline"
              >
                {visibleAttentionItems.length > 3 ? `View all ${visibleAttentionItems.length} in Attention` : "Open Attention"}
              </Link>
            )}
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
        </div>

        <div className="flex flex-col gap-6">
          {availableMoney && (
            <Surface id="pfc-tour-available-money" elevated>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">{availableMoney.label}</p>
                <Badge tone={STATUS_TONE[availableMoney.status]}>
                  {availableMoney.status === "waiting" ? "Waiting" : availableMoney.status === "needsInfo" ? availableMoney.detail : "Ready"}
                </Badge>
              </div>
              <p className="mt-1.5 text-[30px] font-semibold tabular-nums text-[var(--text)]">
                {availableMoney.valueMinorUnits !== null ? formatCurrency(availableMoney.valueMinorUnits, "USD") : "—"}
              </p>
              {availableMoney.explain && (
                <ExplainBreakdown breakdown={availableMoney.explain} currency="USD" label={availableMoney.label} valueMinorUnits={availableMoney.valueMinorUnits ?? 0} />
              )}
            </Surface>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {secondaryCapabilities.map((row) => (
              <Surface key={row.key} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">{row.label}</p>
                  <Badge tone={STATUS_TONE[row.status]}>{row.status === "waiting" ? "Waiting" : row.status === "needsInfo" ? row.detail : "Ready"}</Badge>
                </div>
                <p className="mt-1.5 text-[20px] font-semibold tabular-nums text-[var(--text)]">
                  {row.valueMinorUnits !== null ? formatCurrency(row.valueMinorUnits, "USD") : "—"}
                </p>
                {row.explain && <ExplainBreakdown breakdown={row.explain} currency="USD" label={row.label} valueMinorUnits={row.valueMinorUnits ?? 0} />}
              </Surface>
            ))}
          </div>

          {(freshness.length > 0 || recentChanges.length > 0) && (
            <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-3.5">
              {freshness.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">
                    <Clock className="h-3.5 w-3.5" /> Freshness
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-0.5">
                    {freshness.map((item) => (
                      <li key={item.domain} className="text-[13px] text-[var(--muted)]">
                        {item.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recentChanges.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">Recently</p>
                  <ul className="mt-1.5 flex flex-col gap-0.5">
                    {recentChanges.map((item) => (
                      <li key={item.area} className="text-[13px] text-[var(--muted)]">
                        {item.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] pt-4 lg:col-span-2">
          <Link href="/app/products/personal-finance-companion/start">
            <Button size="sm" variant="secondary" iconRight={<ArrowRight size={14} aria-hidden />}>
              {companionMessage}
            </Button>
          </Link>
        </div>
      </div>

      {tourOn && <GuidedTour steps={TOUR_STEPS} onFinish={finishTour} />}
    </div>
  );
}
