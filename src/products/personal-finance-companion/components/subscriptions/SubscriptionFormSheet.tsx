"use client";

import { useState } from "react";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import RecordFormSheet from "../shared/RecordFormSheet";
import { toMinorUnits, fromMinorUnits } from "@/lib/currency";
import type { Subscription } from "../../state";

const FREQUENCIES: { value: Subscription["frequency"]; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
];

export interface SubscriptionFormValues {
  name: string;
  amountMajorUnits: string;
  currency: string;
  frequency: Subscription["frequency"];
  renewalDate: string;
  decision: Subscription["decision"];
}

function defaultValues(subscription: Subscription | null): SubscriptionFormValues {
  if (!subscription) {
    return { name: "", amountMajorUnits: "", currency: "USD", frequency: "monthly", renewalDate: "", decision: "keep" };
  }
  return {
    name: subscription.name,
    amountMajorUnits:
      subscription.amountMinorUnits !== null ? String(fromMinorUnits(subscription.amountMinorUnits, subscription.currency)) : "",
    currency: subscription.currency,
    frequency: subscription.frequency,
    renewalDate: subscription.renewalDate ?? "",
    decision: subscription.decision,
  };
}

/**
 * Add/edit form for a subscription. The "Planned to cancel" decision is
 * paired, right in the picker, with the same "Draftpace won't cancel it for
 * you" boundary shown on the card — see subscriptionLogic.ts's
 * describeDecisionNote, which this copy must stay consistent with.
 */
export default function SubscriptionFormSheet({
  open,
  subscription,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  subscription: Subscription | null;
  onClose: () => void;
  onSave: (values: SubscriptionFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<SubscriptionFormValues>(() => defaultValues(subscription));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed whenever a different (or no) subscription opens, or the sheet
  // is freshly reopened in "add" mode — RecordFormSheet returns null while
  // closed, but doesn't unmount this component, so a cancelled draft would
  // otherwise silently carry over into the next "Add" flow.
  const [wasOpen, setWasOpen] = useState(open);
  const [seededFor, setSeededFor] = useState(subscription?.id ?? null);
  const justOpened = open && !wasOpen;
  if (wasOpen !== open) setWasOpen(open);
  if (open && (justOpened || (subscription?.id ?? null) !== seededFor)) {
    setSeededFor(subscription?.id ?? null);
    setValues(defaultValues(subscription));
    setError(null);
  }

  const isEdit = subscription !== null;

  async function handleSave() {
    setError(null);
    if (!values.name.trim()) {
      setError("Enter a name for this subscription.");
      return;
    }
    if (values.amountMajorUnits.trim() !== "") {
      const parsed = Number(values.amountMajorUnits);
      if (Number.isNaN(parsed) || parsed < 0) {
        setError("Enter an amount of zero or more, or leave it blank if you're not sure.");
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
      title={isEdit ? `Edit ${subscription.name}` : "Add a subscription"}
      description={isEdit ? undefined : "A streaming service, app, or membership that renews on its own."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="md" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add subscription"}
          </Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <Input
        label="Name"
        placeholder="e.g. Streaming service"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        autoFocus
      />
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
      <Select
        label="Frequency"
        value={values.frequency}
        onChange={(e) => setValues((v) => ({ ...v, frequency: e.target.value as Subscription["frequency"] }))}
      >
        {FREQUENCIES.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </Select>
      <Input
        label="Renewal date"
        type="date"
        value={values.renewalDate}
        onChange={(e) => setValues((v) => ({ ...v, renewalDate: e.target.value }))}
        hint="Optional"
      />
      <Select
        label="Decision"
        value={values.decision}
        onChange={(e) => setValues((v) => ({ ...v, decision: e.target.value as Subscription["decision"] }))}
      >
        <option value="keep">Keep</option>
        <option value="reviewing">Still deciding</option>
        <option value="plannedCancellation">Planned to cancel</option>
        <option value="cancelled">Already cancelled</option>
      </Select>
      {values.decision === "plannedCancellation" && (
        <Alert tone="info">Draftpace will track this as planned to cancel. It won&apos;t cancel it for you.</Alert>
      )}
    </RecordFormSheet>
  );
}

export function subscriptionFormValuesToPatch(values: SubscriptionFormValues) {
  const hasAmount = values.amountMajorUnits.trim() !== "";
  return {
    name: values.name.trim(),
    amountMinorUnits: hasAmount ? toMinorUnits(Number(values.amountMajorUnits), values.currency) : null,
    currency: values.currency,
    frequency: values.frequency,
    renewalDate: values.renewalDate.trim() || null,
    decision: values.decision,
    status: "ready",
  };
}
