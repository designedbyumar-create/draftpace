"use client";

import { useState } from "react";
import Input from "@/design-system/Input";
import Select from "@/design-system/Select";
import Toggle from "@/design-system/Toggle";
import Button from "@/design-system/Button";
import Alert from "@/design-system/Alert";
import RecordFormSheet from "../shared/RecordFormSheet";
import { toMinorUnits, fromMinorUnits } from "@/lib/currency";
import type { Account, Transaction } from "../../state";

export interface TransactionFormValues {
  accountId: string;
  occurredOn: string;
  description: string;
  amountMajorUnits: string;
  currency: string;
  direction: Transaction["direction"];
  category: string;
  pendingOrCleared: Transaction["pendingOrCleared"];
  excludedFromSpending: boolean;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultValues(transaction: Transaction | null, defaultAccountId: string): TransactionFormValues {
  if (!transaction) {
    return {
      accountId: defaultAccountId,
      occurredOn: today(),
      description: "",
      amountMajorUnits: "",
      currency: "USD",
      direction: "debit",
      category: "",
      pendingOrCleared: "cleared",
      excludedFromSpending: false,
    };
  }
  return {
    accountId: transaction.accountId,
    occurredOn: transaction.occurredOn,
    description: transaction.description,
    amountMajorUnits: String(fromMinorUnits(transaction.amountMinorUnits, transaction.currency)),
    currency: transaction.currency,
    direction: transaction.direction,
    category: transaction.category ?? "",
    pendingOrCleared: transaction.pendingOrCleared,
    excludedFromSpending: transaction.excludedFromSpending,
  };
}

/**
 * Add/edit form for a manually-entered transaction. No CSV import here —
 * see domain/transactions.ts's canonical-path comment, manual entry and a
 * future CSV importer both call the same create/update functions. Marking
 * a transaction "Exclude from spending" is the manual path's transfer
 * handling (e.g. moving money between your own accounts) — it stays
 * visible in the ledger but drops out of spending/income totals, rather
 * than requiring a full transfer-pair matching flow.
 */
export default function TransactionFormSheet({
  open,
  transaction,
  accounts,
  onClose,
  onSave,
  triggerRef,
}: {
  open: boolean;
  transaction: Transaction | null;
  accounts: Account[];
  onClose: () => void;
  onSave: (values: TransactionFormValues) => Promise<string | null>;
  triggerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [values, setValues] = useState<TransactionFormValues>(() => defaultValues(transaction, accounts[0]?.id ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed whenever a different (or no) transaction opens, or the sheet
  // is freshly reopened in "add" mode — RecordFormSheet returns null while
  // closed, but doesn't unmount this component, so a cancelled draft would
  // otherwise silently carry over into the next "Add" flow.
  const [wasOpen, setWasOpen] = useState(open);
  const [seededFor, setSeededFor] = useState(transaction?.id ?? null);
  const justOpened = open && !wasOpen;
  if (wasOpen !== open) setWasOpen(open);
  if (open && (justOpened || (transaction?.id ?? null) !== seededFor)) {
    setSeededFor(transaction?.id ?? null);
    setValues(defaultValues(transaction, accounts[0]?.id ?? ""));
    setError(null);
  }

  const isEdit = transaction !== null;
  const noAccounts = accounts.length === 0;

  async function handleSave() {
    setError(null);
    if (!values.accountId) {
      setError("Choose an account.");
      return;
    }
    if (!values.description.trim()) {
      setError("Enter a description for this transaction.");
      return;
    }
    const parsed = Number(values.amountMajorUnits);
    if (values.amountMajorUnits.trim() === "" || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!values.occurredOn) {
      setError("Choose a date.");
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
      title={isEdit ? "Edit transaction" : "Add a transaction"}
      description={isEdit ? undefined : "Something that actually happened — money in or out of one of your accounts."}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button size="md" onClick={handleSave} disabled={saving || noAccounts}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add transaction"}
          </Button>
        </>
      }
    >
      {error && <Alert tone="danger">{error}</Alert>}
      {noAccounts && <Alert tone="warning">Add an account first — a transaction has to belong to one.</Alert>}
      <Select label="Account" value={values.accountId} onChange={(e) => setValues((v) => ({ ...v, accountId: e.target.value }))}>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name}
          </option>
        ))}
      </Select>
      <Input
        label="Description"
        placeholder="e.g. Grocery run"
        value={values.description}
        onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        autoFocus
      />
      <div className="grid grid-cols-[1fr_2fr_1fr] gap-3">
        <Select label="Type" value={values.direction} onChange={(e) => setValues((v) => ({ ...v, direction: e.target.value as Transaction["direction"] }))}>
          <option value="debit">Spending</option>
          <option value="credit">Income</option>
        </Select>
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
      <Input label="Date" type="date" value={values.occurredOn} onChange={(e) => setValues((v) => ({ ...v, occurredOn: e.target.value }))} />
      <Input
        label="Category"
        placeholder="Optional"
        value={values.category}
        onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
      />
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Exclude from spending</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">On for a transfer between your own accounts — stays visible, doesn&apos;t count as spending or income.</p>
        </div>
        <Toggle
          checked={values.excludedFromSpending}
          onChange={(checked) => setValues((v) => ({ ...v, excludedFromSpending: checked }))}
          label="Exclude from spending"
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Cleared</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">Off while it&apos;s still pending on the account.</p>
        </div>
        <Toggle
          checked={values.pendingOrCleared === "cleared"}
          onChange={(checked) => setValues((v) => ({ ...v, pendingOrCleared: checked ? "cleared" : "pending" }))}
          label="Cleared"
        />
      </div>
    </RecordFormSheet>
  );
}

export function transactionFormValuesToPatch(values: TransactionFormValues) {
  return {
    accountId: values.accountId,
    occurredOn: values.occurredOn,
    description: values.description.trim(),
    amountMinorUnits: toMinorUnits(Number(values.amountMajorUnits), values.currency),
    direction: values.direction,
    currency: values.currency,
    category: values.category.trim() || null,
    pendingOrCleared: values.pendingOrCleared,
    excludedFromSpending: values.excludedFromSpending,
    status: "ready",
  };
}
