import { z } from "zod";

/**
 * Monthly Money Reset's validated state. Owned entirely by the authenticated
 * user — stored behind product_instance ownership in
 * monthly_money_reset_states.state (see docs/FREE-PRODUCT-ACTIVATION.md),
 * never inlined into shared platform tables. All money fields are integer
 * minor units (see currency.ts) — never floats, never major-unit decimals.
 * See docs/products/MONTHLY-MONEY-RESET-STATES.md for the full field-by-
 * field reference.
 */

const moneyMinorUnits = z.number().int();
const isoDate = z.string().min(1);

export const incomeStatusSchema = z.enum(["expected", "received"]);
export type IncomeStatus = z.infer<typeof incomeStatusSchema>;

export const incomeEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  amountMinorUnits: moneyMinorUnits.nonnegative(),
  expectedDate: isoDate.optional(),
  status: incomeStatusSchema,
  receivedDate: isoDate.optional(),
  recurring: z.boolean().default(false),
});
export type IncomeEntry = z.infer<typeof incomeEntrySchema>;

export const billStatusSchema = z.enum(["upcoming", "paid", "skipped", "changed"]);
export type BillStatus = z.infer<typeof billStatusSchema>;

export const billEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  amountMinorUnits: moneyMinorUnits.nonnegative(),
  dueDate: isoDate.optional(),
  category: z.string().min(1).default("Other"),
  protected: z.boolean().default(true),
  status: billStatusSchema,
  paidDate: isoDate.optional(),
});
export type BillEntry = z.infer<typeof billEntrySchema>;

export const spendingGroupKindSchema = z.enum(["essentials", "flexible", "personal", "custom"]);

export const spendingGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: spendingGroupKindSchema,
  guideAmountMinorUnits: moneyMinorUnits.nonnegative().optional(),
});
export type SpendingGroup = z.infer<typeof spendingGroupSchema>;

/**
 * "spending" and "correction" are the only types computeSafeToSpend() reads
 * from this list (see calculations.ts) — bill payments, income received,
 * and savings transfers are all read from their own authoritative lists
 * (bills, income, savingsTransfers) to make double-counting structurally
 * impossible rather than something to remember not to do. The other types
 * still get logged here purely as a chronological record for History.
 */
export const activityTypeSchema = z.enum([
  "spending",
  "income_received",
  "bill_paid",
  "savings_transfer",
  "correction",
  "setup_change",
]);
export type ActivityType = z.infer<typeof activityTypeSchema>;

export const activityEntrySchema = z.object({
  id: z.string().min(1),
  type: activityTypeSchema,
  amountMinorUnits: moneyMinorUnits,
  date: isoDate,
  note: z.string().optional(),
  spendingGroupId: z.string().optional(),
  relatedBillId: z.string().optional(),
  relatedIncomeId: z.string().optional(),
  /** Client-generated key so a retried or double-tapped submission is a no-op — see appendActivity() in calculations.ts. */
  dedupeKey: z.string().optional(),
});
export type ActivityEntry = z.infer<typeof activityEntrySchema>;

export const reserveItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  amountMinorUnits: moneyMinorUnits.nonnegative(),
});
export type ReserveItem = z.infer<typeof reserveItemSchema>;

/** Money that has actually left the account — distinct from protectedReserve, which is still held. */
export const savingsTransferSchema = z.object({
  id: z.string().min(1),
  amountMinorUnits: moneyMinorUnits.nonnegative(),
  date: isoDate,
  note: z.string().optional(),
  dedupeKey: z.string().optional(),
});
export type SavingsTransfer = z.infer<typeof savingsTransferSchema>;

export const checkInSchema = z.object({
  id: z.string().min(1),
  date: isoDate,
  incomeChanged: z.boolean(),
  billsChanged: z.boolean(),
  spendingMissing: z.boolean(),
  reserveAdjusted: z.boolean(),
  feelsAccurate: z.boolean(),
});
export type CheckIn = z.infer<typeof checkInSchema>;

export const nextActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  reason: z.string().min(1),
  destination: z.string().min(1),
  dismissedAt: isoDate.optional(),
  snoozedUntil: isoDate.optional(),
});
export type NextAction = z.infer<typeof nextActionSchema>;

export const cycleSchema = z.object({
  cycleKey: z.string().regex(/^\d{4}-\d{2}$/),
  label: z.string().min(1),
  startedAt: isoDate,
  closedAt: isoDate.optional(),
  previousInstanceId: z.string().optional(),
});
export type Cycle = z.infer<typeof cycleSchema>;

export const setupProgressSchema = z.object({
  currentStep: z.number().int().min(1).max(5).default(1),
  stepsCompleted: z.array(z.number().int().min(1).max(5)).default([]),
  completedAt: isoDate.optional(),
});
export type SetupProgress = z.infer<typeof setupProgressSchema>;

export const checkInDaySchema = z.enum([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

export const preferencesSchema = z.object({
  checkInDay: checkInDaySchema.default("sunday"),
  tone: z.enum(["calm", "direct", "minimal"]).default("calm"),
  privacyBlur: z.boolean().default(false),
});
export type Preferences = z.infer<typeof preferencesSchema>;

export const carryForwardChoicesSchema = z.object({
  recurringIncome: z.boolean().default(true),
  recurringBills: z.boolean().default(true),
  spendingGroups: z.boolean().default(true),
  reservePreference: z.boolean().default(true),
  checkInPreference: z.boolean().default(true),
});
export type CarryForwardChoices = z.infer<typeof carryForwardChoicesSchema>;

export const completionSchema = z.object({
  closedAt: isoDate.optional(),
  closingSafeToSpendMinorUnits: moneyMinorUnits.optional(),
  reflection: z.string().optional(),
  carryForward: carryForwardChoicesSchema.optional(),
});
export type Completion = z.infer<typeof completionSchema>;

export const recoveryReasonSchema = z.enum(["inactivity", "past-due-items", "month-changed", "manual"]);

export const recoverySchema = z.object({
  triggeredAt: isoDate.optional(),
  reason: recoveryReasonSchema.optional(),
  resolvedAt: isoDate.optional(),
});
export type Recovery = z.infer<typeof recoverySchema>;

export const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

export const monthlyMoneyResetStateSchema = z.object({
  schemaVersion: z.literal(1),
  currency: z.string().regex(CURRENCY_CODE_PATTERN).default("USD"),
  cycle: cycleSchema,
  profile: z.object({ displayName: z.string().optional() }).default({}),
  setup: setupProgressSchema.default({ currentStep: 1, stepsCompleted: [] }),
  startingAvailableBalanceMinorUnits: moneyMinorUnits.default(0),
  income: z.array(incomeEntrySchema).default([]),
  bills: z.array(billEntrySchema).default([]),
  spendingGroups: z.array(spendingGroupSchema).default([]),
  activity: z.array(activityEntrySchema).default([]),
  protectedReserve: z.array(reserveItemSchema).default([]),
  savingsTransfers: z.array(savingsTransferSchema).default([]),
  checkIns: z.array(checkInSchema).default([]),
  nextAction: nextActionSchema.optional(),
  recovery: recoverySchema.default({}),
  completion: completionSchema.default({}),
  preferences: preferencesSchema.default({ checkInDay: "sunday", tone: "calm", privacyBlur: false }),
  createdAt: isoDate,
  updatedAt: isoDate,
  lastMeaningfulActivityAt: isoDate,
});

export type MonthlyMoneyResetState = z.infer<typeof monthlyMoneyResetStateSchema>;
export type MonthlyMoneyResetStateInput = z.input<typeof monthlyMoneyResetStateSchema>;

export function validateMonthlyMoneyResetState(input: unknown): MonthlyMoneyResetState {
  return monthlyMoneyResetStateSchema.parse(input);
}

/** A brand-new, empty state for a freshly created cycle — no sample data. */
export function createEmptyState(params: { cycleKey: string; cycleLabel: string; currency?: string }): MonthlyMoneyResetState {
  const now = new Date().toISOString();
  return validateMonthlyMoneyResetState({
    schemaVersion: 1,
    currency: params.currency ?? "USD",
    cycle: { cycleKey: params.cycleKey, label: params.cycleLabel, startedAt: now },
    createdAt: now,
    updatedAt: now,
    lastMeaningfulActivityAt: now,
  });
}
