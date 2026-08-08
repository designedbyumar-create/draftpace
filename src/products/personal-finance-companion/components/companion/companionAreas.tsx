"use client";

import type { RefObject } from "react";
import { Bank, Wallet, CalendarCheck, RotateCcw, Clock, CreditCard, Target } from "@/design-system/Icon";
import type { DraftpaceIcon } from "@/design-system/Icon";
import { formatCurrency } from "@/lib/currency";
import { describeResultError } from "@/product-framework/result";
import type { Result } from "@/product-framework/result";
import type { Account, Bill, Debt, FinancialArea, IncomeSource, SavingsGoal, Subscription, Transaction } from "../../state";
import type { CapabilityRow } from "../../companion/capability";

import { listAccounts, createAccount, updateAccount, archiveAccount } from "../../domain/accounts";
import { listIncomeSources, createIncomeSource, updateIncomeSource, archiveIncomeSource } from "../../domain/incomeSources";
import { listBills, createBill, updateBill, archiveBill } from "../../domain/bills";
import { listSubscriptions, createSubscription, updateSubscription, archiveSubscription } from "../../domain/subscriptions";
import { listTransactions, createTransaction, updateTransaction, archiveTransaction } from "../../domain/transactions";
import { listDebts, createDebt, updateDebt, archiveDebt } from "../../domain/debts";
import { listSavingsGoals, createSavingsGoal, updateSavingsGoal, archiveSavingsGoal } from "../../domain/savingsGoals";

import AccountFormSheet, { accountFormValuesToPatch, type AccountFormValues } from "../accounts/AccountFormSheet";
import IncomeFormSheet, { incomeFormValuesToPatch, type IncomeFormValues } from "../income/IncomeFormSheet";
import BillFormSheet, { billFormValuesToPatch, type BillFormValues } from "../bills/BillFormSheet";
import SubscriptionFormSheet, { subscriptionFormValuesToPatch, type SubscriptionFormValues } from "../subscriptions/SubscriptionFormSheet";
import TransactionFormSheet, { transactionFormValuesToPatch, type TransactionFormValues } from "../transactions/TransactionFormSheet";
import DebtFormSheet, { debtFormValuesToPatch, type DebtFormValues } from "../debt/DebtFormSheet";
import SavingsFormSheet, { savingsFormValuesToPatch, type SavingsFormValues } from "../savings/SavingsFormSheet";

import { describeAccountIncompleteness } from "../accounts/accountLogic";
import { describeIncomeIncompleteness } from "../income/incomeLogic";
import { describeBillIncompleteness, describeDueRule } from "../bills/billLogic";
import { describeDecisionNote } from "../subscriptions/subscriptionLogic";
import { describeDebtIncompleteness } from "../debt/debtLogic";
import { describeSavingsIncompleteness } from "../savings/savingsLogic";

/**
 * The per-area configuration Companion's generic AreaStep reads from — one
 * small adapter per financial area, each wiring the exact same
 * list/create/update/archive functions and the exact same FormSheet
 * component the direct section already uses (see components/<area>/ and
 * domain/<area>.ts). This is intentionally the one place Companion's
 * "orient/ask/explain/confirm/save/reflect/continue" chrome differs by
 * area — a bounded, closed set of seven, not the kind of open-ended
 * family switch statement CLAUDE.md's platform-framework rule forbids.
 */

export interface AreaFormProps<T> {
  open: boolean;
  editing: T | null;
  instanceId: string;
  accounts: Account[];
  onClose: () => void;
  onSaved: (record: T) => void;
  triggerRef: RefObject<HTMLElement | null>;
}

export interface AreaConfig<T extends { id: string; status: string; createdAt: string }> {
  area: FinancialArea;
  icon: DraftpaceIcon;
  title: string;
  /** Explicit, not derived by stripping a trailing "s" from title — that breaks for "Income" ("incom"). */
  singularNoun: string;
  pluralNoun: string;
  purpose: string;
  askPrompt: string;
  whyText: string;
  addLabel: string;
  emptyDescription: string;
  unlockMessage: string;
  capabilityKey: CapabilityRow["key"];
  list: (instanceId: string) => Promise<Result<T[]>>;
  archive: (id: string) => Promise<Result<T>>;
  summarize: (record: T) => { title: string; detail: string; incomplete: string | null };
  renderForm: (props: AreaFormProps<T>) => React.ReactNode;
}

function AccountAreaForm({ open, editing, instanceId, onClose, onSaved, triggerRef }: AreaFormProps<Account>) {
  async function handleSave(values: AccountFormValues): Promise<string | null> {
    if (editing) {
      const balanceChanged = Math.round(Number(values.balanceMajorUnits) * 100) !== editing.currentBalanceMinorUnits;
      const result = await updateAccount(editing.id, accountFormValuesToPatch(values, balanceChanged));
      if (!result.ok) return describeResultError(result.error);
      onSaved(result.data);
      return null;
    }
    const result = await createAccount(instanceId, accountFormValuesToPatch(values, true));
    if (!result.ok) return describeResultError(result.error);
    onSaved(result.data);
    return null;
  }
  return <AccountFormSheet open={open} account={editing} onClose={onClose} onSave={handleSave} triggerRef={triggerRef} />;
}

export const accountsAreaConfig: AreaConfig<Account> = {
  area: "accounts",
  icon: Bank,
  title: "Accounts",
  singularNoun: "account",
  pluralNoun: "accounts",
  purpose: "Where money currently sits — the foundation for available cash.",
  askPrompt: "Where does your everyday money sit?",
  whyText: "Available and protected money are treated differently when Draftpace builds your current picture.",
  addLabel: "Add account",
  emptyDescription: "Add a checking account, savings, cash, or a digital wallet.",
  unlockMessage: "You've added enough account information for Draftpace to begin showing Available Money.",
  capabilityKey: "availableMoney",
  list: listAccounts,
  archive: archiveAccount,
  summarize: (a) => ({
    title: a.name,
    detail: `${formatCurrency(a.currentBalanceMinorUnits, a.currency)} · updated ${a.balanceAsOfDate}`,
    incomplete: describeAccountIncompleteness(a),
  }),
  renderForm: (props) => <AccountAreaForm {...props} />,
};

function IncomeAreaForm({ open, editing, instanceId, onClose, onSaved, triggerRef }: AreaFormProps<IncomeSource>) {
  async function handleSave(values: IncomeFormValues): Promise<string | null> {
    if (editing) {
      const result = await updateIncomeSource(editing.id, incomeFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      onSaved(result.data);
      return null;
    }
    const result = await createIncomeSource(instanceId, incomeFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    onSaved(result.data);
    return null;
  }
  return <IncomeFormSheet open={open} source={editing} onClose={onClose} onSave={handleSave} triggerRef={triggerRef} />;
}

export const incomeAreaConfig: AreaConfig<IncomeSource> = {
  area: "income",
  icon: Wallet,
  title: "Income",
  singularNoun: "income source",
  pluralNoun: "income sources",
  purpose: "What's coming in, and how confident to be about it.",
  askPrompt: "What money comes in, and when?",
  whyText: "Confirmed and estimated income are tracked separately — an estimate is useful when it's clearly marked as one, not silently treated as exact.",
  addLabel: "Add income",
  emptyDescription: "Add a paycheck, freelance income, or anything else that regularly brings money in.",
  unlockMessage: "Draftpace now knows when money is expected.",
  capabilityKey: "expectedIncome",
  list: listIncomeSources,
  archive: archiveIncomeSource,
  summarize: (s) => ({
    title: s.name,
    detail: s.amountMinorUnits !== null ? formatCurrency(s.amountMinorUnits, s.currency) : "Range given",
    incomplete: describeIncomeIncompleteness(s),
  }),
  renderForm: (props) => <IncomeAreaForm {...props} />,
};

function BillAreaForm({ open, editing, instanceId, onClose, onSaved, triggerRef }: AreaFormProps<Bill>) {
  async function handleSave(values: BillFormValues): Promise<string | null> {
    if (editing) {
      const result = await updateBill(editing.id, billFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      onSaved(result.data);
      return null;
    }
    const result = await createBill(instanceId, billFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    onSaved(result.data);
    return null;
  }
  return <BillFormSheet open={open} bill={editing} onClose={onClose} onSave={handleSave} triggerRef={triggerRef} />;
}

export const billsAreaConfig: AreaConfig<Bill> = {
  area: "bills",
  icon: CalendarCheck,
  title: "Bills",
  singularNoun: "bill",
  pluralNoun: "bills",
  purpose: "What's owed on a schedule — separate from subscriptions, which renew on their own.",
  askPrompt: "What bills come due on a schedule?",
  whyText: "A due date you don't know yet is fine — the bill still gets saved and stays visible, just marked as needing that detail.",
  addLabel: "Add bill",
  emptyDescription: "Add rent, utilities, insurance, or anything else billed on a schedule.",
  unlockMessage: "Upcoming obligations can now be compared against available money.",
  capabilityKey: "upcomingObligations",
  list: listBills,
  archive: archiveBill,
  summarize: (b) => ({
    title: b.name,
    detail: `${b.amountMinorUnits !== null ? formatCurrency(b.amountMinorUnits, b.currency) : "No amount yet"} · ${describeDueRule(b) ?? "No due date"}`,
    incomplete: describeBillIncompleteness(b),
  }),
  renderForm: (props) => <BillAreaForm {...props} />,
};

function SubscriptionAreaForm({ open, editing, instanceId, onClose, onSaved, triggerRef }: AreaFormProps<Subscription>) {
  async function handleSave(values: SubscriptionFormValues): Promise<string | null> {
    if (editing) {
      const result = await updateSubscription(editing.id, subscriptionFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      onSaved(result.data);
      return null;
    }
    const result = await createSubscription(instanceId, subscriptionFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    onSaved(result.data);
    return null;
  }
  return <SubscriptionFormSheet open={open} subscription={editing} onClose={onClose} onSave={handleSave} triggerRef={triggerRef} />;
}

export const subscriptionsAreaConfig: AreaConfig<Subscription> = {
  area: "subscriptions",
  icon: RotateCcw,
  title: "Subscriptions",
  singularNoun: "subscription",
  pluralNoun: "subscriptions",
  purpose: "Optional recurring charges that renew on their own — kept visibly distinct from bills.",
  askPrompt: "What renews on its own?",
  whyText: "Draftpace tracks a planned cancellation as a decision you made — it never cancels anything for you.",
  addLabel: "Add subscription",
  emptyDescription: "Add a streaming service, app, or membership that renews on its own.",
  unlockMessage: "Recurring optional charges are now visible separately from bills.",
  capabilityKey: "upcomingObligations",
  list: listSubscriptions,
  archive: archiveSubscription,
  summarize: (s) => ({
    title: s.name,
    detail: `${s.amountMinorUnits !== null ? formatCurrency(s.amountMinorUnits, s.currency) : "No amount yet"} · ${s.frequency}`,
    incomplete: describeDecisionNote(s),
  }),
  renderForm: (props) => <SubscriptionAreaForm {...props} />,
};

function DebtAreaForm({ open, editing, instanceId, onClose, onSaved, triggerRef }: AreaFormProps<Debt>) {
  async function handleSave(values: DebtFormValues): Promise<string | null> {
    if (editing) {
      const balanceChanged = Math.round(Number(values.balanceMajorUnits) * 100) !== editing.balanceMinorUnits;
      const result = await updateDebt(editing.id, debtFormValuesToPatch(values, balanceChanged));
      if (!result.ok) return describeResultError(result.error);
      onSaved(result.data);
      return null;
    }
    const result = await createDebt(instanceId, debtFormValuesToPatch(values, true));
    if (!result.ok) return describeResultError(result.error);
    onSaved(result.data);
    return null;
  }
  return <DebtFormSheet open={open} debt={editing} onClose={onClose} onSave={handleSave} triggerRef={triggerRef} />;
}

export const debtAreaConfig: AreaConfig<Debt> = {
  area: "debt",
  icon: CreditCard,
  title: "Debt",
  singularNoun: "debt",
  pluralNoun: "debts",
  purpose: "What's owed. No payoff calculator here — just an accurate, current picture.",
  askPrompt: "What do you owe money on?",
  whyText: "Your debt is saved even without an interest rate. The missing rate simply limits what Draftpace can calculate reliably.",
  addLabel: "Add debt",
  emptyDescription: "Add a credit card, loan, or anything else you owe money on.",
  unlockMessage: "Draftpace can now show your recorded debt total and minimum commitments.",
  capabilityKey: "debt",
  list: listDebts,
  archive: archiveDebt,
  summarize: (d) => ({
    title: d.name,
    detail: `${formatCurrency(d.balanceMinorUnits, d.currency)}${d.interestRate !== null ? ` · ${d.interestRate}% APR` : ""}`,
    incomplete: describeDebtIncompleteness(d),
  }),
  renderForm: (props) => <DebtAreaForm {...props} />,
};

function SavingsAreaForm({ open, editing, instanceId, onClose, onSaved, triggerRef }: AreaFormProps<SavingsGoal>) {
  async function handleSave(values: SavingsFormValues): Promise<string | null> {
    if (editing) {
      const result = await updateSavingsGoal(editing.id, savingsFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      onSaved(result.data);
      return null;
    }
    const result = await createSavingsGoal(instanceId, savingsFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    onSaved(result.data);
    return null;
  }
  return <SavingsFormSheet open={open} goal={editing} onClose={onClose} onSave={handleSave} triggerRef={triggerRef} />;
}

export const savingsAreaConfig: AreaConfig<SavingsGoal> = {
  area: "savings",
  icon: Target,
  title: "Savings",
  singularNoun: "savings goal",
  pluralNoun: "savings goals",
  purpose: "Money set aside on purpose — emergencies, goals, or costs seen coming.",
  askPrompt: "What are you setting money aside for?",
  whyText: "A target date lets Draftpace work out a real monthly contribution. Without one, it's still saved — just without that figure.",
  addLabel: "Add goal",
  emptyDescription: "Add an emergency fund, a specific goal, or money set aside for a cost you can see coming.",
  unlockMessage: "Draftpace can now show progress toward your recorded goals.",
  capabilityKey: "savings",
  list: listSavingsGoals,
  archive: archiveSavingsGoal,
  summarize: (g) => ({
    title: g.name,
    detail: `${formatCurrency(g.savedAmountMinorUnits, g.currency)} of ${formatCurrency(g.targetAmountMinorUnits, g.currency)}`,
    incomplete: describeSavingsIncompleteness(g),
  }),
  renderForm: (props) => <SavingsAreaForm {...props} />,
};

function TransactionAreaForm({ open, editing, instanceId, accounts, onClose, onSaved, triggerRef }: AreaFormProps<Transaction>) {
  async function handleSave(values: TransactionFormValues): Promise<string | null> {
    if (editing) {
      const result = await updateTransaction(editing.id, transactionFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      onSaved(result.data);
      return null;
    }
    const result = await createTransaction(instanceId, transactionFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    onSaved(result.data);
    return null;
  }
  return <TransactionFormSheet open={open} transaction={editing} accounts={accounts} onClose={onClose} onSave={handleSave} triggerRef={triggerRef} />;
}

export const transactionsAreaConfig: AreaConfig<Transaction> = {
  area: "transactions",
  icon: Clock,
  title: "Transactions",
  singularNoun: "transaction",
  pluralNoun: "transactions",
  purpose: "What actually happened — the basis for spending awareness.",
  askPrompt: "What's something that actually happened with your money recently?",
  whyText: "Transfers between your own accounts usually shouldn't count as spending — mark them excluded and they stay visible without skewing the total.",
  addLabel: "Add transaction",
  emptyDescription: "Add money in or out of one of your accounts.",
  unlockMessage: "Draftpace can now show your recorded spending.",
  capabilityKey: "spending",
  list: listTransactions,
  archive: archiveTransaction,
  summarize: (t) => ({
    title: t.description,
    detail: `${t.direction === "credit" ? "+" : "−"}${formatCurrency(t.amountMinorUnits, t.currency)} · ${t.occurredOn}`,
    incomplete: null,
  }),
  renderForm: (props) => <TransactionAreaForm {...props} />,
};

/** The order Companion walks the seven areas in — accounts first (the foundation), transactions last (needs at least one account to exist first). */
export const COMPANION_AREA_ORDER: FinancialArea[] = ["accounts", "income", "bills", "subscriptions", "transactions", "debt", "savings"];

/** The union every Companion orchestration component (AreaStep, CompanionModule) operates over generically — always a fully-shaped record in practice, since each area's config only ever produces/consumes its own real type internally. */
export type AreaRecord = Account | IncomeSource | Bill | Subscription | Transaction | Debt | SavingsGoal;

export const AREA_CONFIGS: Record<FinancialArea, AreaConfig<AreaRecord>> = {
  accounts: accountsAreaConfig as unknown as AreaConfig<AreaRecord>,
  income: incomeAreaConfig as unknown as AreaConfig<AreaRecord>,
  bills: billsAreaConfig as unknown as AreaConfig<AreaRecord>,
  subscriptions: subscriptionsAreaConfig as unknown as AreaConfig<AreaRecord>,
  transactions: transactionsAreaConfig as unknown as AreaConfig<AreaRecord>,
  debt: debtAreaConfig as unknown as AreaConfig<AreaRecord>,
  savings: savingsAreaConfig as unknown as AreaConfig<AreaRecord>,
};
