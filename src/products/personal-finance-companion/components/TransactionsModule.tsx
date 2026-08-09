"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { findPersonalFinanceCompanionInstanceId } from "../setupStateData";
import { listTransactions, createTransaction, updateTransaction, archiveTransaction } from "../domain/transactions";
import { listAccounts } from "../domain/accounts";
import type { Account, Transaction } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import TransactionFormSheet, { transactionFormValuesToPatch, type TransactionFormValues } from "./transactions/TransactionFormSheet";
import { summarizeTransactions, resolveDominantAction } from "./transactions/transactionLogic";
import { describeResultError } from "@/product-framework/result";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

export default function TransactionsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
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
    const [transactionsResult, accountsResult] = await Promise.all([listTransactions(found.id), listAccounts(found.id)]);
    if (!transactionsResult.ok) {
      setErrorMessage(describeResultError(transactionsResult.error));
      setStatus("error");
      return;
    }
    if (!accountsResult.ok) {
      setErrorMessage(describeResultError(accountsResult.error));
      setStatus("error");
      return;
    }
    setTransactions(transactionsResult.data);
    setAccounts(accountsResult.data.filter((a) => a.status !== "archived"));
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: TransactionFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your account. Try reloading the page.";
    if (editingTransaction) {
      const result = await updateTransaction(editingTransaction.id, transactionFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      setTransactions((prev) => prev.map((t) => (t.id === result.data.id ? result.data : t)));
      return null;
    }
    const result = await createTransaction(instanceId, transactionFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    setTransactions((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(transaction: Transaction) {
    const result = await archiveTransaction(transaction.id);
    if (result.ok) setTransactions((prev) => prev.map((t) => (t.id === result.data.id ? result.data : t)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading transactions…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Clock}
        title="Couldn't load your transactions"
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
    return <EmptyState icon={Clock} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = [...transactions.filter((t) => t.status !== "archived")].sort((a, b) => (a.occurredOn < b.occurredOn ? 1 : -1));
  const archived = transactions.filter((t) => t.status === "archived");
  const summary = summarizeTransactions(transactions);
  const dominantAction = resolveDominantAction(transactions);
  const accountNameById = new Map(accounts.map((a) => [a.id, a.name]));

  return (
    <SectionShell
      icon={Clock}
      title="Transactions"
      purpose="What actually happened: the basis for spending awareness."
      onAdd={() => {
        setEditingTransaction(null);
        setFormOpen(true);
      }}
      addLabel="Add transaction"
      summary={
        <StatRow>
          <StatTile label="Spending" value={formatCurrency(summary.totalSpendingMinorUnits, "USD")} />
          <StatTile label="Income" value={formatCurrency(summary.totalIncomeMinorUnits, "USD")} />
          <StatTile label="Recorded" value={String(summary.activeCount)} />
          <StatTile label="Most recent" value={summary.mostRecentDate ?? "—"} tone="muted" />
        </StatRow>
      }
      dominantAction={
        dominantAction?.kind === "add-first" ? (
          <p className="text-[13px] leading-relaxed text-[var(--text)]">
            No transactions recorded yet. Add one to start building your spending picture. This isn&apos;t the same as having spent nothing.
          </p>
        ) : null
      }
    >
      {active.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No transactions yet"
          description="Add what actually happened: money in or out of one of your accounts."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)} disabled={accounts.length === 0}>
                Add transaction
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              accountName={accountNameById.get(transaction.accountId) ?? "Unknown account"}
              onEdit={() => {
                setEditingTransaction(transaction);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(transaction)}
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
            {showArchived ? "Hide" : "Show"} {archived.length} removed {archived.length === 1 ? "transaction" : "transactions"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  accountName={accountNameById.get(transaction.accountId) ?? "Unknown account"}
                  onEdit={() => {}}
                  onArchive={() => {}}
                  readOnly
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <TransactionFormSheet
        open={formOpen}
        transaction={editingTransaction}
        accounts={accounts}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        triggerRef={addButtonRef}
      />
    </SectionShell>
  );
}

function TransactionCard({
  transaction,
  accountName,
  onEdit,
  onArchive,
  readOnly = false,
}: {
  transaction: Transaction;
  accountName: string;
  onEdit: () => void;
  onArchive: () => void;
  readOnly?: boolean;
}) {
  const amountColor = transaction.excludedFromSpending
    ? "text-[var(--muted)]"
    : transaction.direction === "credit"
      ? "text-[var(--success)]"
      : "text-[var(--text)]";
  const amountPrefix = transaction.direction === "credit" ? "+" : "−";

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex flex-wrap items-start gap-2">
            <p className="min-w-0 text-[14px] font-semibold text-[var(--text)]">{transaction.description}</p>
            <Badge tone={STATUS_TONE[transaction.status]}>{STATUS_LABEL[transaction.status]}</Badge>
            {transaction.excludedFromSpending && <Badge tone="info">Excluded</Badge>}
            {transaction.pendingOrCleared === "pending" && <Badge tone="neutral">Pending</Badge>}
          </div>
          <p className={`mt-1 text-[20px] font-semibold leading-tight ${amountColor}`}>
            {amountPrefix}
            {formatCurrency(transaction.amountMinorUnits, transaction.currency)}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {transaction.occurredOn} · {accountName}
            {transaction.category ? ` · ${transaction.category}` : ""}
          </p>
        </button>
        {!readOnly && (
          <Button size="sm" variant="ghost" onClick={onArchive}>
            Remove
          </Button>
        )}
      </div>
    </li>
  );
}
