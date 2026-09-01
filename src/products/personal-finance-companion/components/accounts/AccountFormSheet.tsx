"use client";

import { useState } from "react";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import Toggle from "@/design-system/Toggle";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import RecordFormSheet from "../shared/RecordFormSheet";
import { toMinorUnits, fromMinorUnits } from "@/lib/currency";
import type { Account } from "../../state";

const ACCOUNT_TYPES: { value: Account["type"]; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "cash", label: "Cash" },
  { value: "digitalWallet", label: "Digital wallet" },
  { value: "other", label: "Other" },
];

export interface AccountFormValues {
  name: string;
  type: Account["type"];
  balanceMajorUnits: string;
  currency: string;
  availableForSpending: boolean;
  notes: string;
}

function defaultValues(account: Account | null): AccountFormValues {
  if (!account) {
    return { name: "", type: "checking", balanceMajorUnits: "", currency: "USD", availableForSpending: true, notes: "" };
  }
  return {
    name: account.name,
    type: account.type,
    balanceMajorUnits: String(fromMinorUnits(account.currentBalanceMinorUnits, account.currency)),
    currency: account.currency,
    availableForSpending: account.availableForSpending,
    notes: account.notes ?? "",
  };
}

/**
 * Add/edit form for an Account. A single explicit "Save" action, per the
 * launch spec's save-behavior guidance for direct sections (never
 * Companion-style continuous autosave) — "Saved" is only ever shown after
 * the server confirms. Editing the balance always refreshes the
 * balance-as-of date to today, per the canonical model's rule (see
 * SectionShell/accountLogic.ts's staleness logic, which depends on this
 * being true every time).
 */
export default function AccountFormSheet({
  open,
  account,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: (values: AccountFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<AccountFormValues>(() => defaultValues(account));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed whenever a different (or no) account opens, or the sheet is
  // freshly reopened in "add" mode — RecordFormSheet returns null while
  // closed, but doesn't unmount this component, so a cancelled draft would
  // otherwise silently carry over into the next "Add" flow.
  const [wasOpen, setWasOpen] = useState(open);
  const [seededFor, setSeededFor] = useState(account?.id ?? null);
  const justOpened = open && !wasOpen;
  if (wasOpen !== open) setWasOpen(open);
  if (open && (justOpened || (account?.id ?? null) !== seededFor)) {
    setSeededFor(account?.id ?? null);
    setValues(defaultValues(account));
    setError(null);
  }

  const isEdit = account !== null;

  async function handleSave() {
    setError(null);
    if (!values.name.trim()) {
      setError("Enter a name for this account.");
      return;
    }
    const parsedBalance = Number(values.balanceMajorUnits);
    if (values.balanceMajorUnits.trim() === "" || Number.isNaN(parsedBalance)) {
      setError("Enter a balance of zero or more.");
      return;
    }
    if (parsedBalance < 0) {
      setError("Enter a balance of zero or more.");
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
      title={isEdit ? `Edit ${account.name}` : "Add an account"}
      description={isEdit ? undefined : "Where this money currently sits: a checking account, savings, cash, or a digital wallet."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="md" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add account"}
          </Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      <Input
        label="Name"
        placeholder="e.g. Everyday checking"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        autoFocus
      />
      <Select
        label="Type"
        value={values.type}
        onChange={(e) => setValues((v) => ({ ...v, type: e.target.value as Account["type"] }))}
      >
        {ACCOUNT_TYPES.map((t) => (
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
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Available for spending</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">Off for money you&apos;re protecting, like a reserve.</p>
        </div>
        <Toggle
          checked={values.availableForSpending}
          onChange={(checked) => setValues((v) => ({ ...v, availableForSpending: checked }))}
          label="Available for spending"
        />
      </div>
      <Input
        label="Notes"
        placeholder="Optional"
        value={values.notes}
        onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
      />
    </RecordFormSheet>
  );
}

export function accountFormValuesToPatch(values: AccountFormValues, refreshBalanceDate: boolean) {
  const patch: Record<string, unknown> = {
    name: values.name.trim(),
    type: values.type,
    currentBalanceMinorUnits: toMinorUnits(Number(values.balanceMajorUnits), values.currency),
    currency: values.currency,
    availableForSpending: values.availableForSpending,
    notes: values.notes.trim() || null,
    status: "ready",
  };
  if (refreshBalanceDate) patch.balanceAsOfDate = new Date().toISOString().slice(0, 10);
  return patch;
}
