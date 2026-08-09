"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bank, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listAccounts, createAccount, updateAccount, archiveAccount } from "../domain/accounts";
import type { Account } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import AccountFormSheet, { accountFormValuesToPatch, type AccountFormValues } from "./accounts/AccountFormSheet";
import { summarizeAccounts, resolveDominantAction, describeAccountIncompleteness } from "./accounts/accountLogic";
import { describeResultError } from "@/product-framework/result";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

// The moduleRegistry contract passes `definition`, unused here — Accounts
// doesn't need product-level metadata, only the entitled instance it
// resolves for itself below.
export default function AccountsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  // Button (design-system) isn't a forwardRef component, so the trigger
  // ref for focus-return-on-close wraps it rather than attaching directly.
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
    const result = await listAccounts(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setAccounts(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: AccountFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your account. Try reloading the page.";
    if (editingAccount) {
      const balanceChanged =
        Math.round(Number(values.balanceMajorUnits) * 100) !== editingAccount.currentBalanceMinorUnits;
      const result = await updateAccount(editingAccount.id, accountFormValuesToPatch(values, balanceChanged));
      if (!result.ok) return describeResultError(result.error);
      setAccounts((prev) => prev.map((a) => (a.id === result.data.id ? result.data : a)));
      return null;
    }
    const result = await createAccount(instanceId, accountFormValuesToPatch(values, true));
    if (!result.ok) return describeResultError(result.error);
    setAccounts((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(account: Account) {
    const result = await archiveAccount(account.id);
    if (result.ok) setAccounts((prev) => prev.map((a) => (a.id === result.data.id ? result.data : a)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading accounts…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Bank}
        title="Couldn't load your accounts"
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
    return <EmptyState icon={Bank} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = accounts.filter((a) => a.status !== "archived");
  const archived = accounts.filter((a) => a.status === "archived");
  const summary = summarizeAccounts(accounts);
  const dominantAction = resolveDominantAction(accounts);

  return (
    <SectionShell
      icon={Bank}
      title="Accounts"
      purpose="Where money currently sits: the foundation for available cash."
      onAdd={() => {
        setEditingAccount(null);
        setFormOpen(true);
      }}
      addLabel="Add account"
      summary={
        <StatRow>
          <StatTile label="Available" value={formatCurrency(summary.totalAvailableMinorUnits, "USD")} />
          <StatTile label="Protected" value={formatCurrency(summary.totalProtectedMinorUnits, "USD")} />
          <StatTile label="Accounts" value={String(summary.activeCount)} />
          <StatTile label="Oldest balance" value={summary.oldestBalanceDate ?? "—"} tone="muted" />
        </StatRow>
      }
      dominantAction={
        dominantAction?.kind === "add-first" ? (
          <p className="text-[13px] leading-relaxed text-[var(--text)]">
            No accounts yet. Add one directly, and Draftpace will use it to figure out what&apos;s actually safe to spend.
          </p>
        ) : dominantAction?.kind === "update-stale" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] leading-relaxed text-[var(--text)]">
              This balance was last confirmed {dominantAction.daysStale} days ago. Update it if it has changed.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingAccount(dominantAction.account);
                setFormOpen(true);
              }}
            >
              Update {dominantAction.account.name}
            </Button>
          </div>
        ) : null
      }
    >
      {active.length === 0 ? (
        <EmptyState
          icon={Bank}
          title="No accounts yet"
          description="Add one directly, or paste a note that mentions a balance and Draftpace will find it."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add account
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={() => {
                setEditingAccount(account);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(account)}
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
            {showArchived ? "Hide" : "Show"} {archived.length} closed {archived.length === 1 ? "account" : "accounts"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((account) => (
                <AccountCard key={account.id} account={account} onEdit={() => {}} onArchive={() => {}} readOnly />
              ))}
            </ul>
          )}
        </div>
      )}

      <AccountFormSheet
        open={formOpen}
        account={editingAccount}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        triggerRef={addButtonRef}
      />
    </SectionShell>
  );
}

const ACCOUNT_TYPE_LABEL: Record<Account["type"], string> = {
  checking: "Checking",
  savings: "Savings",
  cash: "Cash",
  digitalWallet: "Digital wallet",
  other: "Other",
};

function AccountCard({
  account,
  onEdit,
  onArchive,
  readOnly = false,
}: {
  account: Account;
  onEdit: () => void;
  onArchive: () => void;
  readOnly?: boolean;
}) {
  const incompleteMessage = describeAccountIncompleteness(account);
  const effectiveStatus = incompleteMessage ? "needsReview" : account.status;

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-[var(--text)]">{account.name}</p>
            <Badge tone={STATUS_TONE[effectiveStatus]}>{STATUS_LABEL[effectiveStatus]}</Badge>
            {!account.availableForSpending && <Badge tone="info">Protected</Badge>}
          </div>
          <p className="mt-1 text-[20px] font-semibold leading-tight text-[var(--text)]">
            {formatCurrency(account.currentBalanceMinorUnits, account.currency)}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {ACCOUNT_TYPE_LABEL[account.type]} · updated {account.balanceAsOfDate}
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
