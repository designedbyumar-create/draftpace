"use client";

import { useState } from "react";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import RecordFormSheet from "../shared/RecordFormSheet";
import { toMinorUnits, fromMinorUnits } from "@/lib/currency";
import type { IncomeSource } from "../../state";

const FREQUENCIES: { value: IncomeSource["frequency"]; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every two weeks" },
  { value: "semiMonthly", label: "Twice a month" },
  { value: "monthly", label: "Monthly" },
  { value: "irregular", label: "Irregular" },
];

export interface IncomeFormValues {
  name: string;
  amountMajorUnits: string;
  rangeLowMajorUnits: string;
  rangeHighMajorUnits: string;
  currency: string;
  frequency: IncomeSource["frequency"];
  nextExpectedDate: string;
  confidence: IncomeSource["confidence"];
  grossOrNet: IncomeSource["grossOrNet"];
}

function defaultValues(source: IncomeSource | null): IncomeFormValues {
  if (!source) {
    return {
      name: "",
      amountMajorUnits: "",
      rangeLowMajorUnits: "",
      rangeHighMajorUnits: "",
      currency: "USD",
      frequency: "monthly",
      nextExpectedDate: "",
      confidence: "confirmed",
      grossOrNet: "net",
    };
  }
  return {
    name: source.name,
    amountMajorUnits: source.amountMinorUnits !== null ? String(fromMinorUnits(source.amountMinorUnits, source.currency)) : "",
    rangeLowMajorUnits: source.amountRangeMinorUnits ? String(fromMinorUnits(source.amountRangeMinorUnits.min, source.currency)) : "",
    rangeHighMajorUnits: source.amountRangeMinorUnits ? String(fromMinorUnits(source.amountRangeMinorUnits.max, source.currency)) : "",
    currency: source.currency,
    frequency: source.frequency,
    nextExpectedDate: source.nextExpectedDate ?? "",
    confidence: source.confidence,
    grossOrNet: source.grossOrNet,
  };
}

/**
 * Add/edit form for an income source. Confidence is a fact the user states
 * directly, never inferred or silently upgraded from "estimated" to
 * "confirmed" elsewhere in the app. It also decides which amount fields
 * show: "Confirmed" asks for one exact figure, "Estimated" asks for a
 * low/high range instead of a single guessed number — pfc_income_sources
 * has a database check requiring one or the other, so there is no "leave
 * the amount blank entirely" state for a saved record.
 */
export default function IncomeFormSheet({
  open,
  source,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  source: IncomeSource | null;
  onClose: () => void;
  onSave: (values: IncomeFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<IncomeFormValues>(() => defaultValues(source));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed whenever a different (or no) source opens, or the sheet is
  // freshly reopened in "add" mode — RecordFormSheet returns null while
  // closed, but doesn't unmount this component, so a cancelled draft would
  // otherwise silently carry over into the next "Add" flow.
  const [wasOpen, setWasOpen] = useState(open);
  const [seededFor, setSeededFor] = useState(source?.id ?? null);
  const justOpened = open && !wasOpen;
  if (wasOpen !== open) setWasOpen(open);
  if (open && (justOpened || (source?.id ?? null) !== seededFor)) {
    setSeededFor(source?.id ?? null);
    setValues(defaultValues(source));
    setError(null);
  }

  const isEdit = source !== null;
  const isEstimated = values.confidence === "estimated";

  async function handleSave() {
    setError(null);
    if (!values.name.trim()) {
      setError("Enter a name for this income source.");
      return;
    }
    if (isEstimated) {
      const low = Number(values.rangeLowMajorUnits);
      const high = Number(values.rangeHighMajorUnits);
      if (values.rangeLowMajorUnits.trim() === "" || values.rangeHighMajorUnits.trim() === "" || Number.isNaN(low) || Number.isNaN(high)) {
        setError("Enter a low and high estimate.");
        return;
      }
      if (low < 0 || high < 0) {
        setError("Enter estimates of zero or more.");
        return;
      }
      if (low > high) {
        setError("The low estimate can't be more than the high estimate.");
        return;
      }
    } else {
      const parsed = Number(values.amountMajorUnits);
      if (values.amountMajorUnits.trim() === "" || Number.isNaN(parsed) || parsed < 0) {
        setError("Enter an amount of zero or more.");
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
      title={isEdit ? `Edit ${source.name}` : "Add an income source"}
      description={isEdit ? undefined : "A paycheck, freelance income, benefits, or anything else that regularly brings money in."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="md" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add income"}
          </Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <Input
        label="Name"
        placeholder="e.g. Main job paycheck"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        autoFocus
      />
      <Select
        label="How sure are you of this amount?"
        value={values.confidence}
        onChange={(e) => setValues((v) => ({ ...v, confidence: e.target.value as IncomeSource["confidence"] }))}
      >
        <option value="confirmed">Confirmed — this is exact</option>
        <option value="estimated">Estimated — give a range</option>
      </Select>
      {isEstimated ? (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
          <Input
            label="Low estimate"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            value={values.rangeLowMajorUnits}
            onChange={(e) => setValues((v) => ({ ...v, rangeLowMajorUnits: e.target.value }))}
          />
          <Input
            label="High estimate"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            value={values.rangeHighMajorUnits}
            onChange={(e) => setValues((v) => ({ ...v, rangeHighMajorUnits: e.target.value }))}
          />
          <Input
            label="Currency"
            value={values.currency}
            maxLength={3}
            onChange={(e) => setValues((v) => ({ ...v, currency: e.target.value.toUpperCase() }))}
          />
        </div>
      ) : (
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <Input
            label="Amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            value={values.amountMajorUnits}
            onChange={(e) => setValues((v) => ({ ...v, amountMajorUnits: e.target.value }))}
          />
          <Input
            label="Currency"
            value={values.currency}
            maxLength={3}
            onChange={(e) => setValues((v) => ({ ...v, currency: e.target.value.toUpperCase() }))}
          />
        </div>
      )}
      <Select
        label="How often"
        value={values.frequency}
        onChange={(e) => setValues((v) => ({ ...v, frequency: e.target.value as IncomeSource["frequency"] }))}
      >
        {FREQUENCIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </Select>
      <Input
        label="Next expected date"
        type="date"
        value={values.nextExpectedDate}
        onChange={(e) => setValues((v) => ({ ...v, nextExpectedDate: e.target.value }))}
        hint="Optional"
      />
      <Select
        label="Gross or net"
        value={values.grossOrNet}
        onChange={(e) => setValues((v) => ({ ...v, grossOrNet: e.target.value as IncomeSource["grossOrNet"] }))}
      >
        <option value="net">Net — after taxes and deductions</option>
        <option value="gross">Gross — before taxes and deductions</option>
        <option value="unknown">Not sure</option>
      </Select>
    </RecordFormSheet>
  );
}

export function incomeFormValuesToPatch(values: IncomeFormValues) {
  const isEstimated = values.confidence === "estimated";
  return {
    name: values.name.trim(),
    amountMinorUnits: isEstimated ? null : toMinorUnits(Number(values.amountMajorUnits), values.currency),
    amountRangeMinorUnits: isEstimated
      ? {
          min: toMinorUnits(Number(values.rangeLowMajorUnits), values.currency),
          max: toMinorUnits(Number(values.rangeHighMajorUnits), values.currency),
        }
      : null,
    currency: values.currency,
    frequency: values.frequency,
    nextExpectedDate: values.nextExpectedDate.trim() || null,
    confidence: values.confidence,
    grossOrNet: values.grossOrNet,
    status: "ready",
  };
}
