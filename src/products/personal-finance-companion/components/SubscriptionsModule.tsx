"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCcw, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { liftProps, settleVariant } from "@/design-system/motion";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listSubscriptions, createSubscription, updateSubscription, archiveSubscription } from "../domain/subscriptions";
import { computeSharedSplit } from "../domain/sharedResponsibility";
import type { Subscription } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import SubscriptionFormSheet, { subscriptionFormValuesToPatch, type SubscriptionFormValues } from "./subscriptions/SubscriptionFormSheet";
import { summarizeSubscriptions, resolveDominantAction, describeDecisionNote } from "./subscriptions/subscriptionLogic";
import { describeResultError } from "@/product-framework/result";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const DECISION_LABEL: Record<Subscription["decision"], string> = {
  keep: "Keep",
  reviewing: "Still deciding",
  plannedCancellation: "Planned to cancel",
  cancelled: "Cancelled",
};

export default function SubscriptionsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);

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
    setInstanceId(found.id);
    const result = await listSubscriptions(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setSubscriptions(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: SubscriptionFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your account. Try reloading the page.";
    if (editingSubscription) {
      const result = await updateSubscription(editingSubscription.id, subscriptionFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      setSubscriptions((prev) => prev.map((s) => (s.id === result.data.id ? result.data : s)));
      return null;
    }
    const result = await createSubscription(instanceId, subscriptionFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    setSubscriptions((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(subscription: Subscription) {
    const result = await archiveSubscription(subscription.id);
    if (result.ok) setSubscriptions((prev) => prev.map((s) => (s.id === result.data.id ? result.data : s)));
  }

  async function handleToggleSettled(subscription: Subscription) {
    const result = await updateSubscription(subscription.id, {
      settled: !subscription.settled,
      settledAt: !subscription.settled ? new Date().toISOString() : null,
    });
    if (result.ok) setSubscriptions((prev) => prev.map((s) => (s.id === result.data.id ? result.data : s)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading subscriptions…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={RotateCcw}
        title="Couldn't load your subscriptions"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance") {
    return <EmptyState icon={RotateCcw} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = subscriptions.filter((s) => s.status !== "archived");
  const archived = subscriptions.filter((s) => s.status === "archived");
  const summary = summarizeSubscriptions(subscriptions);
  const dominantAction = resolveDominantAction(subscriptions);

  return (
    <SectionShell
      icon={RotateCcw}
      title="Subscriptions"
      purpose="Optional recurring charges that renew on their own, kept visibly distinct from bills."
      onAdd={() => {
        setEditingSubscription(null);
        setFormOpen(true);
      }}
      addLabel="Add subscription"
      summary={
        <StatRow>
          <StatTile label="Monthly total" value={formatCurrency(summary.totalMonthlyEquivalentMinorUnits, "USD")} />
          <StatTile label="Active" value={String(summary.activeCount)} />
          <StatTile label="Still deciding" value={String(summary.reviewingCount)} tone="muted" />
          <StatTile label="Planned to cancel" value={String(summary.plannedCancellationCount)} tone="muted" />
        </StatRow>
      }
      dominantAction={
        dominantAction?.kind === "add-first" ? (
          <p className="text-[13px] leading-relaxed text-[var(--text)]">
            No subscriptions yet. Add one directly to start tracking what renews on its own.
          </p>
        ) : dominantAction?.kind === "decide" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] leading-relaxed text-[var(--text)]">
              You&apos;re still deciding on {dominantAction.subscription.name}.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingSubscription(dominantAction.subscription);
                setFormOpen(true);
              }}
            >
              Decide
            </Button>
          </div>
        ) : null
      }
    >
      {active.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No subscriptions yet"
          description="Add a streaming service, app, or membership that renews on its own."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add subscription
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={() => {
                setEditingSubscription(subscription);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(subscription)}
              onToggleSettled={() => handleToggleSettled(subscription)}
            />
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            {showArchived ? "Hide" : "Show"}{" "}{archived.length} closed{" "}{archived.length === 1 ? "subscription" : "subscriptions"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onEdit={() => {}}
                  onArchive={() => {}}
                  onToggleSettled={() => {}}
                  readOnly
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <SubscriptionFormSheet
        open={formOpen}
        subscription={editingSubscription}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        triggerRef={addButtonRef}
      />
    </SectionShell>
  );
}

function SubscriptionCard({
  subscription,
  onEdit,
  onArchive,
  onToggleSettled,
  readOnly = false,
}: {
  subscription: Subscription;
  onEdit: () => void;
  onArchive: () => void;
  onToggleSettled: () => void;
  readOnly?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const decisionNote = describeDecisionNote(subscription);
  const split =
    subscription.shared && subscription.amountMinorUnits !== null && subscription.sharedSplitPercent !== null
      ? computeSharedSplit(subscription.amountMinorUnits, subscription.sharedSplitPercent)
      : null;

  return (
    <motion.li
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
      {...liftProps(Boolean(reduceMotion))}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex flex-wrap items-start gap-2">
            <p className="min-w-0 text-[14px] font-semibold text-[var(--text)]">{subscription.name}</p>
            <Badge tone={STATUS_TONE[subscription.status]}>{STATUS_LABEL[subscription.status]}</Badge>
            <Badge tone={subscription.decision === "plannedCancellation" ? "warning" : "neutral"}>
              {DECISION_LABEL[subscription.decision]}
            </Badge>
            {subscription.shared && <Badge tone="primary">Shared</Badge>}
          </div>
          <p className="mt-1 text-[20px] font-semibold leading-tight text-[var(--text)]">
            {subscription.amountMinorUnits !== null ? formatCurrency(subscription.amountMinorUnits, subscription.currency) : "No amount yet"}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--muted)]">
            {/*
              Annual gets a badge and monthly stays plain text on
              purpose: a monthly charge is frequent enough to stay in
              mind on its own, and an annual one is exactly the charge a
              three-month view never shows. The visual difference is the
              point, not decoration.
            */}
            {subscription.frequency === "annual" ? (
              <Badge tone="info">Annual</Badge>
            ) : (
              subscription.frequency
            )}
            {subscription.renewalDate ? ` · renews ${subscription.renewalDate}` : ""}
          </p>
          {split && (
            <p className="mt-1.5 text-[12px] text-[var(--muted)]">
              Your share {formatCurrency(split.yourShareMinorUnits, subscription.currency)} · Their share{" "}
              {formatCurrency(split.otherShareMinorUnits, subscription.currency)}
            </p>
          )}
          {decisionNote && <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--muted)]">{decisionNote}</p>}
        </button>
        {!readOnly && (
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Button size="sm" variant="ghost" onClick={onArchive}>
              Close
            </Button>
            {subscription.shared && (
              <SettleToggle settled={subscription.settled} onToggle={onToggleSettled} reduceMotion={Boolean(reduceMotion)} />
            )}
          </div>
        )}
      </div>
    </motion.li>
  );
}

/** The manually-ticked settle action for a shared bill/subscription, same behavior as BillsModule.tsx's own SettleToggle. */
function SettleToggle({ settled, onToggle, reduceMotion }: { settled: boolean; onToggle: () => void; reduceMotion: boolean }) {
  if (settled) {
    return (
      <motion.span key="settled" initial="hidden" animate="visible" variants={settleVariant(reduceMotion)} className="inline-flex">
        <Button size="sm" variant="secondary" onClick={onToggle}>
          Settled
        </Button>
      </motion.span>
    );
  }
  return (
    <Button size="sm" variant="ghost" onClick={onToggle}>
      Mark settled
    </Button>
  );
}
