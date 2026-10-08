/**
 * The real-UI adapter for Monthly Money Reset. Everything imported below
 * from "@/..." is the actual Draftpace source file (see remotion.config.ts
 * and tsconfig.json: "@" points at ../src, the real app's src/), not a copy
 * or a recreation.
 *
 * The demo state below is a frozen, hand-entered copy of the exact values
 * written by scripts/product-reference/seed/seed-mmr.mjs into the real
 * local Supabase demo account on 2026-10-07 (the "Demo Account", cycle
 * October 2026). It is not a live query against that database: building a
 * Supabase client, auth session and data-fetch path into a silent video
 * renderer was judged out of scope for this MVP (see creative/README.md,
 * "Known gaps"). Every figure here reproduces the real, already-rendered
 * result: feeding this object into the real computeSafeToSpend() below
 * yields exactly $43.65, matching
 * marketing/product-reference/screens/monthly-money-reset/workspace-phone.png.
 */
import SafeToSpendCard from "@/products/monthly-money-reset/components/SafeToSpendCard";
import NextActionCard from "@/products/monthly-money-reset/components/NextActionCard";
import { computeSafeToSpend, weeklyGuideAmount } from "@/products/monthly-money-reset/calculations";
import { computeTightestDay } from "@/products/monthly-money-reset/cycleTimeline";
import { computeNextAction } from "@/products/monthly-money-reset/nextAction";
import { formatCurrency } from "@/products/monthly-money-reset/currency";
import {
  monthlyMoneyResetThemeVars,
  monthlyMoneyResetSharedTokens,
} from "@/products/monthly-money-reset/theme";
import type { MonthlyMoneyResetState } from "@/products/monthly-money-reset/state";

export { SafeToSpendCard, NextActionCard, formatCurrency };

/** Matches the real seeded cycle: October 2026, ending the 31st. */
const CYCLE_END = "2026-10-31";
/** The date this video is framed as "today." The real seed's relative dates (daysAgo()) are fixed to absolute dates below that reproduce the same computed result. */
const NOW_ISO = "2026-10-08T12:00:00.000Z";

export const DEMO_STATE: MonthlyMoneyResetState = {
  schemaVersion: 1,
  currency: "USD",
  cycle: { cycleKey: "2026-10", label: "October 2026", startedAt: "2026-10-01" },
  profile: { displayName: "Demo Account" },
  setup: {
    currentStep: 5,
    stepsCompleted: [1, 2, 3, 4, 5],
    completedAt: "2026-10-07",
    acknowledgements: {
      startingBalanceZeroConfirmed: false,
      noOtherIncomeConfirmed: true,
      noBillsOrReserveConfirmed: false,
    },
  },
  startingAvailableBalanceMinorUnits: 184250,
  income: [
    { id: "inc-salary", name: "Salary", amountMinorUnits: 320000, expectedDate: "2026-10-28", status: "expected", recurring: true },
    { id: "inc-freelance", name: "Freelance work", amountMinorUnits: 90000, expectedDate: "2026-10-15", status: "received", receivedDate: "2026-09-30", recurring: false },
  ],
  bills: [
    { id: "bill-rent", name: "Rent", amountMinorUnits: 145000, dueDate: "2026-10-01", category: "Housing", protected: true, status: "paid", paidDate: "2026-10-01" },
    { id: "bill-power", name: "Electricity", amountMinorUnits: 9400, dueDate: "2026-10-14", category: "Utilities", protected: true, status: "upcoming" },
    { id: "bill-phone", name: "Mobile phone", amountMinorUnits: 8500, dueDate: "2026-10-20", category: "Utilities", protected: true, status: "upcoming" },
    { id: "bill-insurance", name: "Car insurance", amountMinorUnits: 12400, dueDate: "2026-10-05", category: "Insurance", protected: true, status: "paid", paidDate: "2026-10-04" },
  ],
  spendingGroups: [
    { id: "grp-essentials", name: "Essentials", kind: "essentials", guideAmountMinorUnits: 60000 },
    { id: "grp-flexible", name: "Flexible", kind: "flexible", guideAmountMinorUnits: 30000 },
    { id: "grp-personal", name: "Personal", kind: "personal", guideAmountMinorUnits: 15000 },
  ],
  activity: [
    { id: "act-1", type: "spending", amountMinorUnits: 8640, date: "2026-10-07", note: "Grocery store", spendingGroupId: "grp-essentials" },
    { id: "act-2", type: "spending", amountMinorUnits: 745, date: "2026-10-06", note: "Coffee shop", spendingGroupId: "grp-personal" },
    { id: "act-3", type: "spending", amountMinorUnits: 5200, date: "2026-10-04", note: "Fuel", spendingGroupId: "grp-essentials" },
    { id: "act-4", type: "income_received", amountMinorUnits: 90000, date: "2026-09-30", note: "Freelance work", relatedIncomeId: "inc-freelance" },
    { id: "act-5", type: "bill_paid", amountMinorUnits: 145000, date: "2026-10-01", note: "Rent", relatedBillId: "bill-rent" },
    { id: "act-6", type: "savings_transfer", amountMinorUnits: 50000, date: "2026-09-29", note: "Moved to savings" },
  ],
  protectedReserve: [
    { id: "res-repairs", label: "Car repairs", amountMinorUnits: 20000 },
    { id: "res-gifts", label: "Gifts", amountMinorUnits: 10000 },
  ],
  savingsTransfers: [{ id: "sav-1", amountMinorUnits: 50000, date: "2026-09-29", note: "Emergency fund" }],
  checkIns: [
    {
      id: "chk-1",
      date: "2026-10-01",
      incomeChanged: false,
      billsChanged: false,
      spendingMissing: false,
      reserveAdjusted: false,
      feelsAccurate: true,
      safeToSpendAtMinorUnits: 61200,
    },
  ],
  recovery: {},
  completion: {},
  preferences: { checkInDay: "sunday", tone: "calm", privacyBlur: false },
  createdAt: "2026-10-01",
  updatedAt: NOW_ISO,
  lastMeaningfulActivityAt: "2026-10-07",
  lastConfirmedAt: "2026-10-01",
};

export function monthlyMoneyResetDemo() {
  const breakdown = computeSafeToSpend(DEMO_STATE);
  const now = new Date(NOW_ISO);
  const weeksRemaining = Math.max(
    1,
    Math.ceil((new Date(CYCLE_END).getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );
  const tightestDay = computeTightestDay({
    breakdown,
    today: NOW_ISO,
    cycleEndDate: CYCLE_END,
    bills: DEMO_STATE.bills,
    income: DEMO_STATE.income,
  });
  const nextAction = computeNextAction(DEMO_STATE, breakdown, now);
  const weekly = weeklyGuideAmount(breakdown.safeToSpend, weeksRemaining);
  const themeStyle = {
    ...monthlyMoneyResetThemeVars("light"),
    ...monthlyMoneyResetSharedTokens("light"),
  } as React.CSSProperties;

  return { state: DEMO_STATE, breakdown, tightestDay, nextAction, weekly, weeksRemaining, themeStyle, now: NOW_ISO };
}
