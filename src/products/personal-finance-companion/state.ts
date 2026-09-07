import { z } from "zod";

/**
 * Personal Finance Companion's canonical record schemas, the TypeScript
 * side of supabase/migrations/202608080001_personal_finance_companion_records.sql.
 * Field naming matches Monthly Money Reset's convention (`amountMinorUnits`,
 * a generic minor-units name, not `amountCents`) even though the database
 * columns use a `_minor` suffix, see src/lib/currency.ts. Validation is
 * boundary-only (parsed when data comes back from Supabase, not on every
 * keystroke), matching the lesson documented on MMR's incomeEntrySchema:
 * a stricter-than-write schema breaks autosave of an in-progress, not-yet-
 * complete entry. See docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md.
 */

const moneyMinorUnits = z.number().int();
const isoDate = z.string().min(1);

export const recordLifecycleStatusSchema = z.enum(["draft", "confirmedIncomplete", "ready", "needsReview", "archived"]);
export type RecordLifecycleStatus = z.infer<typeof recordLifecycleStatusSchema>;

export const recordSourceSchema = z.enum(["manual", "pastedNotes", "textFile", "csvImport", "futureBankImport"]);
export type RecordSource = z.infer<typeof recordSourceSchema>;

const recordLifecycleFields = {
  status: recordLifecycleStatusSchema,
  needsReviewReason: z.string().nullable(),
};

const recordProvenanceFields = {
  source: recordSourceSchema,
  importSessionId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
};

/**
 * Shared Responsibility (Trump Card Memo, absorbing the founder-proposed
 * Couple Finance Companion into a feature of this product): a bill or
 * subscription can be flagged shared with another person, at a split
 * this account's own share of. `sharedSplitPercent` is only ever set
 * alongside `shared: true`, see the matching DB check constraint in
 * 202609060003_personal_finance_companion_shared_responsibility.sql.
 * `settled`/`settledAt` are manually ticked, not computed: there is no
 * automatic cycle boundary to reset them against (this product's
 * cycleModel is "continuous"), so re-ticking settled after new shared
 * activity is how a fresh reconciliation period starts.
 */
const sharedResponsibilityFields = {
  shared: z.boolean(),
  sharedSplitPercent: z.number().int().min(1).max(99).nullable(),
  settled: z.boolean(),
  settledAt: isoDate.nullable(),
};

export const accountSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(["checking", "savings", "cash", "digitalWallet", "other"]),
  currentBalanceMinorUnits: moneyMinorUnits,
  currency: z.string().min(1),
  availableForSpending: z.boolean(),
  balanceAsOfDate: isoDate,
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type Account = z.infer<typeof accountSchema>;

export const incomeSourceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  amountMinorUnits: moneyMinorUnits.nullable(),
  amountRangeMinorUnits: z.object({ min: moneyMinorUnits, max: moneyMinorUnits }).nullable(),
  frequency: z.enum(["weekly", "biweekly", "semiMonthly", "monthly", "irregular"]),
  nextExpectedDate: isoDate.nullable(),
  confidence: z.enum(["confirmed", "estimated"]),
  grossOrNet: z.enum(["gross", "net", "unknown"]),
  currency: z.string().min(1),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type IncomeSource = z.infer<typeof incomeSourceSchema>;

export const billDueRuleSchema = z.union([
  z.object({ dayOfMonth: z.number().int().min(1).max(31) }),
  z.object({ specificDate: isoDate }),
  z.object({ recurrenceDescription: z.string().min(1) }),
]);

export const billSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.string(),
  amountMinorUnits: moneyMinorUnits.nullable(),
  amountRangeMinorUnits: z.object({ min: moneyMinorUnits, max: moneyMinorUnits }).nullable(),
  isVariable: z.boolean(),
  dueRule: billDueRuleSchema.nullable(),
  frequency: z.enum(["monthly", "quarterly", "annual", "custom"]),
  essential: z.boolean(),
  funded: z.boolean(),
  currency: z.string().min(1),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
  ...sharedResponsibilityFields,
});
export type Bill = z.infer<typeof billSchema>;

export const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  amountMinorUnits: moneyMinorUnits.nullable(),
  frequency: z.enum(["monthly", "annual", "custom"]),
  renewalDate: isoDate.nullable(),
  decision: z.enum(["keep", "reviewing", "plannedCancellation", "cancelled"]),
  currency: z.string().min(1),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
  ...sharedResponsibilityFields,
});
export type Subscription = z.infer<typeof subscriptionSchema>;

export const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  occurredOn: isoDate,
  description: z.string(),
  amountMinorUnits: moneyMinorUnits,
  direction: z.enum(["debit", "credit"]),
  currency: z.string().min(1),
  category: z.string().nullable(),
  pendingOrCleared: z.enum(["pending", "cleared"]),
  externalId: z.string().nullable(),
  transferPairId: z.string().nullable(),
  excludedFromSpending: z.boolean(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type Transaction = z.infer<typeof transactionSchema>;

export const debtSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(["creditCard", "personalLoan", "studentLoan", "autoLoan", "mortgage", "other"]),
  balanceMinorUnits: moneyMinorUnits,
  currency: z.string().min(1),
  interestRate: z.number().nullable(),
  minimumPaymentMinorUnits: moneyMinorUnits,
  dueDate: isoDate.nullable(),
  promotionalRate: z.number().nullable(),
  promotionalExpiry: isoDate.nullable(),
  balanceAsOfDate: isoDate,
  /** Optional reference to the Account this debt is also a spending source for, e.g. a credit card entered here for its balance/rate that's also used to log transactions. Never required, most debts (loans, mortgages) have no matching account. Purely a reference; no calculation reads this field yet. */
  linkedAccountId: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type Debt = z.infer<typeof debtSchema>;

export const savingsGoalSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(["emergencyFund", "generalGoal", "sinkingFund"]),
  targetAmountMinorUnits: moneyMinorUnits,
  savedAmountMinorUnits: moneyMinorUnits,
  targetDate: isoDate.nullable(),
  recurring: z.boolean(),
  currency: z.string().min(1),
  /** Optional reference to the Account actually holding this goal's money, e.g. an Emergency Fund goal pointing at the savings account it lives in. Never required. Purely a reference; savedAmountMinorUnits stays manually entered, it is not derived from the linked account's balance. */
  linkedAccountId: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type SavingsGoal = z.infer<typeof savingsGoalSchema>;

// ---------------------------------------------------------------------------
// Companion setup-state, the guided flow's own resumable progress, never a
// financial record. See supabase/migrations/..._supporting_tables.sql's
// pfc_setup_state table and docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md
// section on setup-state infrastructure (spec phase 8).
// ---------------------------------------------------------------------------

/** The seven financial areas a returning user manages directly, in the manual-setup order from the launch spec section 7. */
export const financialAreaSchema = z.enum(["accounts", "income", "bills", "subscriptions", "debt", "savings", "transactions"]);
export type FinancialArea = z.infer<typeof financialAreaSchema>;

export const areaSetupStatusSchema = z.enum(["not-started", "in-progress", "acknowledged-skip", "complete"]);
export type AreaSetupStatus = z.infer<typeof areaSetupStatusSchema>;

export const inputPathSchema = z.enum(["csv", "existingCsv", "notes", "textFile", "manual", "fromScratch", "notSure"]);
export type InputPath = z.infer<typeof inputPathSchema>;

export const setupStateSchema = z.object({
  /** Screen 0-7 of the launch spec's first-run Companion journey; 0 = orientation. */
  currentScreen: z.number().int().min(0).max(7).default(0),
  selectedInputPath: inputPathSchema.nullable().default(null),
  /** Per-area status, keyed by FinancialArea (validated at read sites via the FinancialArea type, not by the schema itself, Zod v4's enum-keyed z.record requires every key present, which is wrong for a progressively-filled map). Powers both Companion's own progress and the Setup Centre's status grid, without a second source of truth. */
  areaProgress: z.record(z.string(), areaSetupStatusSchema).default({}),
  activeImportSessionId: z.string().nullable().default(null),
  /** Index into the current review batch, so leaving mid-review and returning resumes at the same candidate, not the start of the batch. */
  candidateReviewPosition: z.number().int().min(0).default(0),
  orientation: z
    .object({
      seenAt: z.string().nullable().default(null),
      skipped: z.boolean().default(false),
    })
    .default({ seenAt: null, skipped: false }),
  completedAt: z.string().nullable().default(null),
});
export type PersonalFinanceCompanionSetupState = z.infer<typeof setupStateSchema>;

export function createEmptySetupState(): PersonalFinanceCompanionSetupState {
  return setupStateSchema.parse({});
}

export function validateSetupState(input: unknown): PersonalFinanceCompanionSetupState {
  return setupStateSchema.parse(input);
}
