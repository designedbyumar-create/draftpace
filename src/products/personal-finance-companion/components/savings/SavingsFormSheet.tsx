"use client";

import { useState } from "react";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import Toggle from "@/design-system/Toggle";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import RecordFormSheet from "../shared/RecordFormSheet";
import { toMinorUnits, fromMinorUnits } from "@/lib/currency";
import type { Account, SavingsGoal } from "../../state";

const GOAL_TYPES: { value: SavingsGoal["type"]; label: string }[] = [
  { value: "emergencyFund", label: "Emergency fund" },
  { value: "generalGoal", label: "General goal" },
  { value: "sinkingFund", label: "Sinking fund" },
];

export interface SavingsFormValues {
  name: string;
  type: SavingsGoal["type"];
  targetAmountMajorUnits: string;
  savedAmountMajorUnits: string;
  currency: string;
  targetDate: string;
  recurring: boolean;
  linkedAccountId: string;
}

function defaultValues(goal: SavingsGoal | null): SavingsFormValues {
  if (!goal) {
    return {
      name: "",
      type: "generalGoal",
      targetAmountMajorUnits: "",
      savedAmountMajorUnits: "0",
      currency: "USD",
      targetDate: "",
      recurring: false,
      linkedAccountId: "",
    };
  }
  return {
    name: goal.name,
    type: goal.type,
    targetAmountMajorUnits: String(fromMinorUnits(goal.targetAmountMinorUnits, goal.currency)),
    savedAmountMajorUnits: String(fromMinorUnits(goal.savedAmountMinorUnits, goal.currency)),
    currency: goal.currency,
    targetDate: goal.targetDate ?? "",
    recurring: goal.recurring,
    linkedAccountId: goal.linkedAccountId ?? "",
  };
}

/**
 * Add/edit form for a savings goal. Target date is optional — see
 * savingsLogic.ts's monthlyContributionNeededMinorUnits, which only ever
 * computes a monthly figure when a real target date is present, never a
 * guessed one.
 */
export default function SavingsFormSheet({
  open,
  goal,
  accounts = [],
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  goal: SavingsGoal | null;
  accounts?: Account[];
  onClose: () => void;
  onSave: (values: SavingsFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<SavingsFormValues>(() => defaultValues(goal));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed whenever a different (or no) goal opens, or the sheet is
  // freshly reopened in "add" mode — RecordFormSheet returns null while
  // closed, but doesn't unmount this component, so a cancelled draft would
  // otherwise silently carry over into the next "Add" flow.
  const [wasOpen, setWasOpen] = useState(open);
  const [seededFor, setSeededFor] = useState(goal?.id ?? null);
  const justOpened = open && !wasOpen;
  if (wasOpen !== open) setWasOpen(open);
  if (open && (justOpened || (goal?.id ?? null) !== seededFor)) {
    setSeededFor(goal?.id ?? null);
    setValues(defaultValues(goal));
    setError(null);
  }

  const isEdit = goal !== null;

  // Active accounts are always offered, plus the currently-linked one even
  // if it's since been archived — otherwise the picker would silently show
  // "Not linked" for a goal that's actually still linked (that account just
  // dropped out of the active list), and saving without touching this field
  // would sever a real link the user never asked to change.
  const linkedArchivedAccount =
    goal?.linkedAccountId && !accounts.some((a) => a.id === goal.linkedAccountId && a.status !== "archived")
      ? accounts.find((a) => a.id === goal.linkedAccountId)
      : undefined;
  const visibleAccounts = [
    ...accounts.filter((a) => a.status !== "archived"),
    ...(linkedArchivedAccount ? [linkedArchivedAccount] : []),
  ];

  async function handleSave() {
    setError(null);
    if (!values.name.trim()) {
      setError("Enter a name for this goal.");
      return;
    }
    const target = Number(values.targetAmountMajorUnits);
    if (values.targetAmountMajorUnits.trim() === "" || Number.isNaN(target) || target <= 0) {
      setError("Enter a target amount greater than zero.");
      return;
    }
    const saved = Number(values.savedAmountMajorUnits);
    if (values.savedAmountMajorUnits.trim() === "" || Number.isNaN(saved) || saved < 0) {
      setError("Enter a saved amount of zero or more.");
      return;
    }
    setSaving(true);
    const failureMessage = await onSave(values);
    setSaving(false);
    if (failureMessage) {
      setError(failureMessage);
      return;
    }
    onClose();
  }

  return (
    <RecordFormSheet
      open={open}
      onClose={onClose}
      triggerRef={triggerRef}
      title={isEdit ? `Edit ${goal.name}` : "Add a savings goal"}
      description={isEdit ? undefined : "An emergency fund, a specific goal, or money set aside for a cost you can see coming."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="md" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add goal"}
          </Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <Input
        label="Name"
        placeholder="e.g. Emergency fund"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        autoFocus
      />
      <Select label="Type" value={values.type} onChange={(e) => setValues((v) => ({ ...v, type: e.target.value as SavingsGoal["type"] }))}>
        {GOAL_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-[2fr_2fr_1fr] gap-3">
        <Input
          label="Target"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={values.targetAmountMajorUnits}
          onChange={(e) => setValues((v) => ({ ...v, targetAmountMajorUnits: e.target.value }))}
        />
        <Input
          label="Saved so far"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={values.savedAmountMajorUnits}
          onChange={(e) => setValues((v) => ({ ...v, savedAmountMajorUnits: e.target.value }))}
        />
        <Input
          label="Currency"
          value={values.currency}
          maxLength={3}
          onChange={(e) => setValues((v) => ({ ...v, currency: e.target.value.toUpperCase() }))}
        />
      </div>
      <Input
        label="Target date"
        type="date"
        value={values.targetDate}
        onChange={(e) => setValues((v) => ({ ...v, targetDate: e.target.value }))}
        hint="Optional, needed for a monthly contribution figure"
      />
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Recurring</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">On for a goal that starts over once it's reached, like a sinking fund.</p>
        </div>
        <Toggle checked={values.recurring} onChange={(checked) => setValues((v) => ({ ...v, recurring: checked }))} label="Recurring" />
      </div>
      {visibleAccounts.length > 0 && (
        <Select
          label="Held in an account?"
          value={values.linkedAccountId}
          onChange={(e) => setValues((v) => ({ ...v, linkedAccountId: e.target.value }))}
          hint="Optional. Link this goal to the account actually holding the money."
        >
          <option value="">Not linked</option>
          {visibleAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
              {account.status === "archived" ? " (closed)" : ""}
            </option>
          ))}
        </Select>
      )}
    </RecordFormSheet>
  );
}

export function savingsFormValuesToPatch(values: SavingsFormValues) {
  return {
    name: values.name.trim(),
    type: values.type,
    targetAmountMinorUnits: toMinorUnits(Number(values.targetAmountMajorUnits), values.currency),
    savedAmountMinorUnits: toMinorUnits(Number(values.savedAmountMajorUnits), values.currency),
    currency: values.currency,
    targetDate: values.targetDate.trim() || null,
    recurring: values.recurring,
    linkedAccountId: values.linkedAccountId.trim() || null,
    status: "ready",
  };
}
