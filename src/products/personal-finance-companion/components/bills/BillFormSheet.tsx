"use client";

import { useState } from "react";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import Toggle from "@/design-system/Toggle";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import RecordFormSheet from "../shared/RecordFormSheet";
import { toMinorUnits, fromMinorUnits } from "@/lib/currency";
import type { Bill } from "../../state";

const FREQUENCIES: { value: Bill["frequency"]; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
];

type DueDateType = "dayOfMonth" | "specificDate" | "recurrenceDescription" | "none";

export interface BillFormValues {
  name: string;
  category: string;
  amountMajorUnits: string;
  currency: string;
  isVariable: boolean;
  dueDateType: DueDateType;
  dueDayOfMonth: string;
  dueSpecificDate: string;
  dueRecurrenceDescription: string;
  frequency: Bill["frequency"];
  essential: boolean;
  funded: boolean;
}

function defaultValues(bill: Bill | null): BillFormValues {
  if (!bill) {
    return {
      name: "",
      category: "",
      amountMajorUnits: "",
      currency: "USD",
      isVariable: false,
      dueDateType: "none",
      dueDayOfMonth: "",
      dueSpecificDate: "",
      dueRecurrenceDescription: "",
      frequency: "monthly",
      essential: true,
      funded: true,
    };
  }
  const rule = bill.dueRule;
  return {
    name: bill.name,
    category: bill.category,
    amountMajorUnits: bill.amountMinorUnits !== null ? String(fromMinorUnits(bill.amountMinorUnits, bill.currency)) : "",
    currency: bill.currency,
    isVariable: bill.isVariable,
    dueDateType: rule ? (("dayOfMonth" in rule ? "dayOfMonth" : "specificDate" in rule ? "specificDate" : "recurrenceDescription") as DueDateType) : "none",
    dueDayOfMonth: rule && "dayOfMonth" in rule ? String(rule.dayOfMonth) : "",
    dueSpecificDate: rule && "specificDate" in rule ? rule.specificDate : "",
    dueRecurrenceDescription: rule && "recurrenceDescription" in rule ? rule.recurrenceDescription : "",
    frequency: bill.frequency,
    essential: bill.essential,
    funded: bill.funded,
  };
}

/**
 * Add/edit form for a bill. A bill with no due date is still saved and
 * still shown — see billLogic.ts's describeBillIncompleteness — this form
 * just makes "none" an explicit, honest choice rather than a required field.
 */
export default function BillFormSheet({
  open,
  bill,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  bill: Bill | null;
  onClose: () => void;
  onSave: (values: BillFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<BillFormValues>(() => defaultValues(bill));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed whenever a different (or no) bill opens, or the sheet is
  // freshly reopened in "add" mode — RecordFormSheet returns null while
  // closed, but doesn't unmount this component, so a cancelled draft would
  // otherwise silently carry over into the next "Add" flow.
  const [wasOpen, setWasOpen] = useState(open);
  const [seededFor, setSeededFor] = useState(bill?.id ?? null);
  const justOpened = open && !wasOpen;
  if (wasOpen !== open) setWasOpen(open);
  if (open && (justOpened || (bill?.id ?? null) !== seededFor)) {
    setSeededFor(bill?.id ?? null);
    setValues(defaultValues(bill));
    setError(null);
  }

  const isEdit = bill !== null;

  async function handleSave() {
    setError(null);
    if (!values.name.trim()) {
      setError("Enter a name for this bill.");
      return;
    }
    if (values.amountMajorUnits.trim() !== "") {
      const parsed = Number(values.amountMajorUnits);
      if (Number.isNaN(parsed) || parsed < 0) {
        setError("Enter an amount of zero or more, or leave it blank if it varies.");
        return;
      }
    }
    if (values.dueDateType === "dayOfMonth") {
      const day = Number(values.dueDayOfMonth);
      if (!values.dueDayOfMonth.trim() || Number.isNaN(day) || day < 1 || day > 31) {
        setError("Enter a day of the month between 1 and 31.");
        return;
      }
    }
    if (values.dueDateType === "specificDate" && !values.dueSpecificDate.trim()) {
      setError("Choose a due date.");
      return;
    }
    if (values.dueDateType === "recurrenceDescription" && !values.dueRecurrenceDescription.trim()) {
      setError("Describe when this bill is due.");
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
      title={isEdit ? `Edit ${bill.name}` : "Add a bill"}
      description={isEdit ? undefined : "Rent, utilities, insurance, or anything else billed on a schedule."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="md" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add bill"}
          </Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <Input
        label="Name"
        placeholder="e.g. Electric bill"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        autoFocus
      />
      <Input
        label="Category"
        placeholder="e.g. Utilities"
        value={values.category}
        onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
      />
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        <Input
          label="Amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          placeholder="Leave blank if it varies"
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
      <Select
        label="Frequency"
        value={values.frequency}
        onChange={(e) => setValues((v) => ({ ...v, frequency: e.target.value as Bill["frequency"] }))}
      >
        {FREQUENCIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </Select>
      <Select
        label="Due date"
        value={values.dueDateType}
        onChange={(e) => setValues((v) => ({ ...v, dueDateType: e.target.value as DueDateType }))}
      >
        <option value="none">Not set yet</option>
        <option value="dayOfMonth">A day of the month</option>
        <option value="specificDate">A specific date</option>
        <option value="recurrenceDescription">Describe it</option>
      </Select>
      {values.dueDateType === "dayOfMonth" && (
        <Input
          label="Day of month"
          type="number"
          min={1}
          max={31}
          value={values.dueDayOfMonth}
          onChange={(e) => setValues((v) => ({ ...v, dueDayOfMonth: e.target.value }))}
        />
      )}
      {values.dueDateType === "specificDate" && (
        <Input
          label="Date"
          type="date"
          value={values.dueSpecificDate}
          onChange={(e) => setValues((v) => ({ ...v, dueSpecificDate: e.target.value }))}
        />
      )}
      {values.dueDateType === "recurrenceDescription" && (
        <Input
          label="Description"
          placeholder="e.g. First business day of the quarter"
          value={values.dueRecurrenceDescription}
          onChange={(e) => setValues((v) => ({ ...v, dueRecurrenceDescription: e.target.value }))}
        />
      )}
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Amount varies</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">On for bills like utilities that change month to month.</p>
        </div>
        <Toggle checked={values.isVariable} onChange={(checked) => setValues((v) => ({ ...v, isVariable: checked }))} label="Amount varies" />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Essential</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">Something that has to be paid, not optional spending.</p>
        </div>
        <Toggle checked={values.essential} onChange={(checked) => setValues((v) => ({ ...v, essential: checked }))} label="Essential" />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Funded</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">On once you know the money for this bill is set aside.</p>
        </div>
        <Toggle checked={values.funded} onChange={(checked) => setValues((v) => ({ ...v, funded: checked }))} label="Funded" />
      </div>
    </RecordFormSheet>
  );
}

export function billFormValuesToPatch(values: BillFormValues) {
  const hasAmount = values.amountMajorUnits.trim() !== "";
  let dueRule: Record<string, unknown> | null = null;
  if (values.dueDateType === "dayOfMonth") dueRule = { dayOfMonth: Number(values.dueDayOfMonth) };
  else if (values.dueDateType === "specificDate") dueRule = { specificDate: values.dueSpecificDate };
  else if (values.dueDateType === "recurrenceDescription") dueRule = { recurrenceDescription: values.dueRecurrenceDescription.trim() };

  return {
    name: values.name.trim(),
    category: values.category.trim(),
    amountMinorUnits: hasAmount ? toMinorUnits(Number(values.amountMajorUnits), values.currency) : null,
    amountRangeMinorUnits: null,
    currency: values.currency,
    isVariable: values.isVariable,
    dueRule,
    frequency: values.frequency,
    essential: values.essential,
    funded: values.funded,
    status: "ready",
  };
}
