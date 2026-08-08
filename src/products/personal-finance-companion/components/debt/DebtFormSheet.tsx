"use client";

import { useState } from "react";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import RecordFormSheet from "../shared/RecordFormSheet";
import { toMinorUnits, fromMinorUnits } from "@/lib/currency";
import type { Debt } from "../../state";

const DEBT_TYPES: { value: Debt["type"]; label: string }[] = [
  { value: "creditCard", label: "Credit card" },
  { value: "personalLoan", label: "Personal loan" },
  { value: "studentLoan", label: "Student loan" },
  { value: "autoLoan", label: "Auto loan" },
  { value: "mortgage", label: "Mortgage" },
  { value: "other", label: "Other" },
];

export interface DebtFormValues {
  name: string;
  type: Debt["type"];
  balanceMajorUnits: string;
  currency: string;
  interestRate: string;
  minimumPaymentMajorUnits: string;
  dueDate: string;
}

function defaultValues(debt: Debt | null): DebtFormValues {
  if (!debt) {
    return { name: "", type: "creditCard", balanceMajorUnits: "", currency: "USD", interestRate: "", minimumPaymentMajorUnits: "", dueDate: "" };
  }
  return {
    name: debt.name,
    type: debt.type,
    balanceMajorUnits: String(fromMinorUnits(debt.balanceMinorUnits, debt.currency)),
    currency: debt.currency,
    interestRate: debt.interestRate !== null ? String(debt.interestRate) : "",
    minimumPaymentMajorUnits: String(fromMinorUnits(debt.minimumPaymentMinorUnits, debt.currency)),
    dueDate: debt.dueDate ?? "",
  };
}

/**
 * Add/edit form for a debt. Interest rate is optional here on purpose —
 * see debtLogic.ts's describeDebtIncompleteness, a debt without one is
 * still fully saved and visible, just missing what it needs for a payoff
 * timeline this product doesn't calculate anyway.
 */
export default function DebtFormSheet({
  open,
  debt,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  debt: Debt | null;
  onClose: () => void;
  onSave: (values: DebtFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<DebtFormValues>(() => defaultValues(debt));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed whenever a different (or no) debt opens, or the sheet is
  // freshly reopened in "add" mode — RecordFormSheet returns null while
  // closed, but doesn't unmount this component, so a cancelled draft would
  // otherwise silently carry over into the next "Add" flow.
  const [wasOpen, setWasOpen] = useState(open);
  const [seededFor, setSeededFor] = useState(debt?.id ?? null);
  const justOpened = open && !wasOpen;
  if (wasOpen !== open) setWasOpen(open);
  if (open && (justOpened || (debt?.id ?? null) !== seededFor)) {
    setSeededFor(debt?.id ?? null);
    setValues(defaultValues(debt));
    setError(null);
  }

  const isEdit = debt !== null;

  async function handleSave() {
    setError(null);
    if (!values.name.trim()) {
      setError("Enter a name for this debt.");
      return;
    }
    const balance = Number(values.balanceMajorUnits);
    if (values.balanceMajorUnits.trim() === "" || Number.isNaN(balance) || balance < 0) {
      setError("Enter a balance of zero or more.");
      return;
    }
    const minimumPayment = Number(values.minimumPaymentMajorUnits);
    if (values.minimumPaymentMajorUnits.trim() === "" || Number.isNaN(minimumPayment) || minimumPayment < 0) {
      setError("Enter a minimum payment of zero or more.");
      return;
    }
    if (values.interestRate.trim() !== "") {
      const rate = Number(values.interestRate);
      if (Number.isNaN(rate) || rate < 0) {
        setError("Enter an interest rate of zero or more, or leave it blank if you don't know it yet.");
        return;
      }
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
      title={isEdit ? `Edit ${debt.name}` : "Add a debt"}
      description={isEdit ? undefined : "A credit card, loan, or anything else you owe money on."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="md" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add debt"}
          </Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <Input
        label="Name"
        placeholder="e.g. Visa card"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        autoFocus
      />
      <Select label="Type" value={values.type} onChange={(e) => setValues((v) => ({ ...v, type: e.target.value as Debt["type"] }))}>
        {DEBT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <Input
          label="Balance"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="0.00"
          value={values.balanceMajorUnits}
          onChange={(e) => setValues((v) => ({ ...v, balanceMajorUnits: e.target.value }))}
          hint={isEdit ? "Saving updates today as the new balance date." : undefined}
        />
        <Input
          label="Currency"
          value={values.currency}
          maxLength={3}
          onChange={(e) => setValues((v) => ({ ...v, currency: e.target.value.toUpperCase() }))}
        />
      </div>
      <Input
        label="Interest rate (%)"
        type="number"
        inputMode="decimal"
        step="0.01"
        placeholder="Leave blank if you don't know it yet"
        value={values.interestRate}
        onChange={(e) => setValues((v) => ({ ...v, interestRate: e.target.value }))}
      />
      <Input
        label="Minimum payment"
        type="number"
        inputMode="decimal"
        step="0.01"
        placeholder="0.00"
        value={values.minimumPaymentMajorUnits}
        onChange={(e) => setValues((v) => ({ ...v, minimumPaymentMajorUnits: e.target.value }))}
      />
      <Input
        label="Due date"
        type="date"
        value={values.dueDate}
        onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
        hint="Optional"
      />
    </RecordFormSheet>
  );
}

export function debtFormValuesToPatch(values: DebtFormValues, refreshBalanceDate: boolean) {
  const patch: Record<string, unknown> = {
    name: values.name.trim(),
    type: values.type,
    balanceMinorUnits: toMinorUnits(Number(values.balanceMajorUnits), values.currency),
    currency: values.currency,
    interestRate: values.interestRate.trim() !== "" ? Number(values.interestRate) : null,
    minimumPaymentMinorUnits: toMinorUnits(Number(values.minimumPaymentMajorUnits), values.currency),
    dueDate: values.dueDate.trim() || null,
    status: "ready",
  };
  if (refreshBalanceDate) patch.balanceAsOfDate = new Date().toISOString().slice(0, 10);
  return patch;
}
