"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { liftProps, settleVariant } from "@/design-system/motion";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listBills, createBill, updateBill, archiveBill } from "../domain/bills";
import { computeSharedSplit } from "../domain/sharedResponsibility";
import type { Bill } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import BillFormSheet, { billFormValuesToPatch, type BillFormValues } from "./bills/BillFormSheet";
import { summarizeBills, resolveDominantAction, describeBillIncompleteness, describeDueRule } from "./bills/billLogic";
import { describeResultError } from "@/product-framework/result";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

export default function BillsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
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
    const result = await listBills(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setBills(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: BillFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your account. Try reloading the page.";
    if (editingBill) {
      const result = await updateBill(editingBill.id, billFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      setBills((prev) => prev.map((b) => (b.id === result.data.id ? result.data : b)));
      return null;
    }
    const result = await createBill(instanceId, billFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    setBills((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(bill: Bill) {
    const result = await archiveBill(bill.id);
    if (result.ok) setBills((prev) => prev.map((b) => (b.id === result.data.id ? result.data : b)));
  }

  async function handleToggleSettled(bill: Bill) {
    const result = await updateBill(bill.id, {
      settled: !bill.settled,
      settledAt: !bill.settled ? new Date().toISOString() : null,
    });
    if (result.ok) setBills((prev) => prev.map((b) => (b.id === result.data.id ? result.data : b)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading bills…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Couldn't load your bills"
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
    return <EmptyState icon={CalendarCheck} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = bills.filter((b) => b.status !== "archived");
  const archived = bills.filter((b) => b.status === "archived");
  const summary = summarizeBills(bills);
  const dominantAction = resolveDominantAction(bills);

  return (
    <SectionShell
      icon={CalendarCheck}
      title="Bills"
      purpose="What's owed on a schedule, separate from subscriptions, which renew on their own."
      onAdd={() => {
        setEditingBill(null);
        setFormOpen(true);
      }}
      addLabel="Add bill"
      summary={
        <StatRow>
          <StatTile label="Monthly total" value={formatCurrency(summary.totalMonthlyEquivalentMinorUnits, "USD")} />
          <StatTile label="Bills" value={String(summary.activeCount)} />
          <StatTile label="Missing due date" value={String(summary.missingDueDateCount)} tone="muted" />
          <StatTile label="Unfunded essentials" value={String(summary.unfundedEssentialCount)} tone="muted" />
        </StatRow>
      }
      dominantAction={
        dominantAction?.kind === "add-first" ? (
          <p className="text-[13px] leading-relaxed text-[var(--text)]">
            No bills yet. Add one directly, and Draftpace will help you plan around it.
          </p>
        ) : dominantAction?.kind === "add-due-date" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] leading-relaxed text-[var(--text)]">
              {dominantAction.bill.name}
              {" "}doesn&apos;t have a due date yet.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingBill(dominantAction.bill);
                setFormOpen(true);
              }}
            >
              Add due date
            </Button>
          </div>
        ) : null
      }
    >
      {active.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bills yet"
          description="Add rent, utilities, insurance, or anything else billed on a schedule."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add bill
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onEdit={() => {
                setEditingBill(bill);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(bill)}
              onToggleSettled={() => handleToggleSettled(bill)}
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
            {showArchived ? "Hide" : "Show"} {archived.length} closed {archived.length === 1 ? "bill" : "bills"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((bill) => (
                <BillCard key={bill.id} bill={bill} onEdit={() => {}} onArchive={() => {}} onToggleSettled={() => {}} readOnly />
              ))}
            </ul>
          )}
        </div>
      )}

      <BillFormSheet open={formOpen} bill={editingBill} onClose={() => setFormOpen(false)} onSave={handleSave} triggerRef={addButtonRef} />
    </SectionShell>
  );
}

function BillCard({
  bill,
  onEdit,
  onArchive,
  onToggleSettled,
  readOnly = false,
}: {
  bill: Bill;
  onEdit: () => void;
  onArchive: () => void;
  onToggleSettled: () => void;
  readOnly?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const incompleteMessage = describeBillIncompleteness(bill);
  const effectiveStatus = incompleteMessage ? "confirmedIncomplete" : bill.status;
  const dueDescription = describeDueRule(bill);
  const split =
    bill.shared && bill.amountMinorUnits !== null && bill.sharedSplitPercent !== null
      ? computeSharedSplit(bill.amountMinorUnits, bill.sharedSplitPercent)
      : null;

  return (
    <motion.li
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
      {...liftProps(Boolean(reduceMotion))}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex flex-wrap items-start gap-2">
            <p className="min-w-0 text-[14px] font-semibold text-[var(--text)]">{bill.name}</p>
            <Badge tone={STATUS_TONE[effectiveStatus]}>{STATUS_LABEL[effectiveStatus]}</Badge>
            {bill.essential && <Badge tone="info">Essential</Badge>}
            {bill.shared && <Badge tone="primary">Shared</Badge>}
          </div>
          <p className="mt-1 text-[20px] font-semibold leading-tight text-[var(--text)]">
            {bill.amountMinorUnits !== null ? formatCurrency(bill.amountMinorUnits, bill.currency) : "No amount yet"}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {bill.category || "Uncategorized"} · {dueDescription ?? "No due date"}
          </p>
          {split && (
            <p className="mt-1.5 text-[12px] text-[var(--muted)]">
              Your share {formatCurrency(split.yourShareMinorUnits, bill.currency)} · Their share{" "}
              {formatCurrency(split.otherShareMinorUnits, bill.currency)}
            </p>
          )}
          {incompleteMessage && <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--warning)]">{incompleteMessage}</p>}
        </button>
        {!readOnly && (
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Button size="sm" variant="ghost" onClick={onArchive}>
              Close
            </Button>
            {bill.shared && <SettleToggle settled={bill.settled} onToggle={onToggleSettled} reduceMotion={Boolean(reduceMotion)} />}
          </div>
        )}
      </div>
    </motion.li>
  );
}

/** The manually-ticked settle action for a shared bill/subscription. The settle beat (a quiet spring pop) plays only at the moment it turns on, keyed by that transition, never as ambient decoration on an already-settled item. */
function SettleToggle({ settled, onToggle, reduceMotion }: { settled: boolean; onToggle: () => void; reduceMotion: boolean }) {
  if (settled) {
    return (
      <motion.span
        key="settled"
        initial="hidden"
        animate="visible"
        variants={settleVariant(reduceMotion)}
        className="inline-flex"
      >
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
