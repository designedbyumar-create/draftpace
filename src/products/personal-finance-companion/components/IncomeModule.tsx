"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Wallet, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listIncomeSources, createIncomeSource, updateIncomeSource, archiveIncomeSource } from "../domain/incomeSources";
import type { IncomeSource } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import IncomeFormSheet, { incomeFormValuesToPatch, type IncomeFormValues } from "./income/IncomeFormSheet";
import { summarizeIncome, resolveDominantAction, describeIncomeIncompleteness } from "./income/incomeLogic";
import { describeResultError } from "@/product-framework/result";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

export default function IncomeModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
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
    const result = await listIncomeSources(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setSources(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: IncomeFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your account. Try reloading the page.";
    if (editingSource) {
      const result = await updateIncomeSource(editingSource.id, incomeFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      setSources((prev) => prev.map((s) => (s.id === result.data.id ? result.data : s)));
      return null;
    }
    const result = await createIncomeSource(instanceId, incomeFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    setSources((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(source: IncomeSource) {
    const result = await archiveIncomeSource(source.id);
    if (result.ok) setSources((prev) => prev.map((s) => (s.id === result.data.id ? result.data : s)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading income…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Wallet}
        title="Couldn't load your income"
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
    return <EmptyState icon={Wallet} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = sources.filter((s) => s.status !== "archived");
  const archived = sources.filter((s) => s.status === "archived");
  const summary = summarizeIncome(sources);
  const dominantAction = resolveDominantAction(sources);

  return (
    <SectionShell
      icon={Wallet}
      title="Income"
      purpose="What's coming in, and how confident to be about it."
      onAdd={() => {
        setEditingSource(null);
        setFormOpen(true);
      }}
      addLabel="Add income"
      summary={
        <StatRow>
          <StatTile label="Monthly total" value={formatCurrency(summary.totalMonthlyEquivalentMinorUnits, "USD")} />
          <StatTile label="Sources" value={String(summary.activeCount)} />
          <StatTile label="Estimated" value={String(summary.estimatedCount)} tone="muted" />
          <StatTile label="Next expected" value={summary.nextExpectedDate ?? "—"} tone="muted" />
        </StatRow>
      }
      dominantAction={
        dominantAction?.kind === "add-first" ? (
          <p className="text-[13px] leading-relaxed text-[var(--text)]">
            No income sources yet. Add one directly, and Draftpace will start building your income picture.
          </p>
        ) : dominantAction?.kind === "add-amount" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] leading-relaxed text-[var(--text)]">
              {dominantAction.source.name}
              {" "}doesn&apos;t have an amount yet, so it isn&apos;t counted in your total.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingSource(dominantAction.source);
                setFormOpen(true);
              }}
            >
              Add amount
            </Button>
          </div>
        ) : null
      }
    >
      {active.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No income sources yet"
          description="Add a paycheck, freelance income, or anything else that regularly brings money in."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add income
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((source) => (
            <IncomeCard
              key={source.id}
              source={source}
              onEdit={() => {
                setEditingSource(source);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(source)}
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
            {showArchived ? "Hide" : "Show"}{" "}{archived.length} closed{" "}{archived.length === 1 ? "source" : "sources"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((source) => (
                <IncomeCard key={source.id} source={source} onEdit={() => {}} onArchive={() => {}} readOnly />
              ))}
            </ul>
          )}
        </div>
      )}

      <IncomeFormSheet
        open={formOpen}
        source={editingSource}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        triggerRef={addButtonRef}
      />
    </SectionShell>
  );
}

const FREQUENCY_LABEL: Record<IncomeSource["frequency"], string> = {
  weekly: "weekly",
  biweekly: "every two weeks",
  semiMonthly: "twice a month",
  monthly: "monthly",
  irregular: "irregular",
};

function IncomeCard({
  source,
  onEdit,
  onArchive,
  readOnly = false,
}: {
  source: IncomeSource;
  onEdit: () => void;
  onArchive: () => void;
  readOnly?: boolean;
}) {
  const incompleteMessage = describeIncomeIncompleteness(source);
  const effectiveStatus = incompleteMessage ? "confirmedIncomplete" : source.status;

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex flex-wrap items-start gap-2">
            <p className="min-w-0 text-[14px] font-semibold text-[var(--text)]">{source.name}</p>
            <Badge tone={STATUS_TONE[effectiveStatus]}>{STATUS_LABEL[effectiveStatus]}</Badge>
            {source.confidence === "estimated" && <Badge tone="info">Estimated</Badge>}
          </div>
          <p className="mt-1 text-[20px] font-semibold leading-tight text-[var(--text)]">
            {source.amountMinorUnits !== null
              ? formatCurrency(source.amountMinorUnits, source.currency)
              : source.amountRangeMinorUnits
                ? `${formatCurrency(source.amountRangeMinorUnits.min, source.currency)} – ${formatCurrency(source.amountRangeMinorUnits.max, source.currency)}`
                : "No amount yet"}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {FREQUENCY_LABEL[source.frequency]}
            {source.nextExpectedDate ? ` · next ${source.nextExpectedDate}` : ""}
          </p>
          {incompleteMessage && <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--warning)]">{incompleteMessage}</p>}
        </button>
        {!readOnly && (
          <Button size="sm" variant="ghost" onClick={onArchive}>
            Close
          </Button>
        )}
      </div>
    </li>
  );
}
