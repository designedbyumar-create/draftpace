/**
 * Bespoke mobile mockups for Personal Finance Companion's Shop page,
 * following the pattern its siblings established: recreations of the
 * shipped product UI, not screenshots and not a generic template.
 *
 * What is drawn maps to what ships. Screen 1 is TodayView: the hero
 * banner with where the balance goes, the next thing to look at, and what
 * is coming up. Screen 2 is BillsModule: bills as a list you tick off for
 * the month. Screen 3 is the payoff plan on the Debt screen. The bottom
 * bar is the real one: Today, Companion, Attention, Records.
 *
 * Every figure is worked out by the same functions the product uses, from
 * a small set of sample records (balanceAllocation, deriveComingUp,
 * leftToPay, comparePayoff), so a drawing cannot show a sum the product
 * would not produce, and the four parts of the hero bar really do add up
 * to the balance. Every colour comes from the product's own definition,
 * and every phrase drawn is asserted against the component that says it
 * (personalFinanceCompanionVisuals.test.ts).
 *
 * The sample people and amounts are illustrative and internally
 * consistent, never presented as real account data.
 */
import type { ReactNode } from "react";
import { Bell, Compass, Layers3, User } from "@/design-system/Icon";
import { formatCurrency } from "@/lib/currency";
import { personalFinanceCompanionDefinition as definition } from "@/products/personal-finance-companion/definition";
import { balanceAllocation, type FinancialPictureInputs } from "@/products/personal-finance-companion/companion/capability";
import { deriveAttentionItems } from "@/products/personal-finance-companion/attention";
import { deriveComingUp } from "@/products/personal-finance-companion/comingUp";
import { badgeDay, badgeMonth, formatTodayLabel } from "@/products/personal-finance-companion/dates";
import { comparePayoff, formatMonth, payoffInputs } from "@/products/personal-finance-companion/components/debt/payoffPlan";
import { leftToPay, periodOf } from "@/products/personal-finance-companion/components/bills/billPaid";
import { paidDayLabel } from "@/products/personal-finance-companion/components/bills/PaidToggle";
import { summarizeBills } from "@/products/personal-finance-companion/components/bills/billLogic";
import { resolveDominantAction } from "@/products/personal-finance-companion/companion/dominantAction";
import { computeCapabilities } from "@/products/personal-finance-companion/companion/capability";
import type { BillPayment } from "@/products/personal-finance-companion/state";
import PhoneFrame from "../PhoneFrame";

const theme = definition.theme;
const ground = theme?.ground?.light;
const accent = theme?.accentScale;
const hero = theme?.hero?.light;
if (!ground || !accent || !hero) throw new Error("Personal Finance Companion must declare its ground, accent scale and hero.");

const DESK = ground.appBg;
const SURFACE = ground.surface;
const SUNKEN = ground.surfaceStrong;
const INK = ground.text;
const MUTED = ground.muted;
const RULE = ground.border;
const STRONG_RULE = ground.borderStrong;
const ACCENT = accent.base;
const ACCENT_LABEL = accent.contrast;
const NARRATIVE = theme?.narrativeFont ?? "inherit";
const HERO_INK = hero.ink;
const HERO_TO = hero.to;
const HERO_BACKGROUND = `radial-gradient(120% 90% at 85% -10%, ${hero.from} 0%, ${hero.mid} 55%, ${hero.to} 100%)`;

const NOW = new Date(2026, 8, 21, 9, 0);
const base = { currency: "USD", needsReviewReason: null, source: "manual", importSessionId: null, createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-10T00:00:00Z" };
const notShared = { shared: false, sharedSplitPercent: null, settled: false, settledAt: null };
const bill = (id: string, name: string, category: string, amountMinorUnits: number, dueRule: object | null, frequency = "monthly") => ({
  ...base,
  ...notShared,
  id,
  name,
  category,
  amountMinorUnits,
  amountRangeMinorUnits: null,
  isVariable: false,
  dueRule,
  frequency,
  essential: true,
  funded: true,
  status: "ready",
});

/** The sample the drawings are worked out from. The engine does the arithmetic; nothing below is typed in as a total. */
export const SAMPLE = {
  accounts: [
    { ...base, id: "a1", name: "Everyday account", type: "checking", currentBalanceMinorUnits: 322018, availableForSpending: true, balanceAsOfDate: "2026-09-18", notes: null, status: "ready" },
    { ...base, id: "a2", name: "Rainy day pot", type: "savings", currentBalanceMinorUnits: 200000, availableForSpending: false, balanceAsOfDate: "2026-09-18", notes: null, status: "ready" },
  ],
  incomeSources: [
    { ...base, id: "i1", name: "Salary", amountMinorUnits: 420000, amountRangeMinorUnits: null, frequency: "monthly", nextExpectedDate: "2026-09-28", confidence: "confirmed", grossOrNet: "net", status: "ready" },
  ],
  bills: [
    bill("b1", "Rent", "Housing", 145000, { dayOfMonth: 1 }),
    bill("b2", "Electric", "Utilities", 9600, { dayOfMonth: 15 }),
    bill("b4", "Internet", "Utilities", 4500, { dayOfMonth: 26 }),
    { ...bill("b3", "Car insurance", "Insurance", 61200, null, "quarterly"), status: "confirmedIncomplete" },
  ],
  subscriptions: [{ ...base, ...notShared, id: "s1", name: "Streaming", amountMinorUnits: 1500, frequency: "monthly", renewalDate: "2026-10-02", decision: "keep", status: "ready" }],
  transactions: [],
  debts: [
    { ...base, id: "d1", name: "Visa", type: "creditCard", balanceMinorUnits: 264000, interestRate: 21.9, minimumPaymentMinorUnits: 8500, dueDate: "2026-09-24", promotionalRate: null, promotionalExpiry: null, balanceAsOfDate: "2026-09-01", linkedAccountId: null, status: "ready" },
    { ...base, id: "d2", name: "Student loan", type: "studentLoan", balanceMinorUnits: 720000, interestRate: 4.5, minimumPaymentMinorUnits: 12000, dueDate: null, promotionalRate: null, promotionalExpiry: null, balanceAsOfDate: "2026-09-01", linkedAccountId: null, status: "ready" },
    { ...base, id: "d3", name: "Store card", type: "creditCard", balanceMinorUnits: 31000, interestRate: 27.9, minimumPaymentMinorUnits: 2500, dueDate: null, promotionalRate: null, promotionalExpiry: null, balanceAsOfDate: "2026-09-01", linkedAccountId: null, status: "ready" },
  ],
  savingsGoals: [],
} as unknown as FinancialPictureInputs;

const PAID: BillPayment[] = [{ id: "p1", billId: "b1", period: periodOf(NOW), paidOn: "2026-09-01" }];
const money = (minorUnits: number) => formatCurrency(minorUnits, "USD");

function StatusBar({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-between px-1 text-[10px] font-semibold" style={{ color }}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[1px] border border-current" />
        <span className="h-2 w-2 rounded-full border border-current" />
      </div>
    </div>
  );
}

/** The four destinations the product actually has, an icon over a label, the accent only on the tab you are on. */
function TabBar({ current }: { current: "Today" | "Companion" | "Attention" | "Records" }) {
  const tabs = [
    { label: "Today", Icon: Compass },
    { label: "Companion", Icon: User },
    { label: "Attention", Icon: Bell },
    { label: "Records", Icon: Layers3 },
  ] as const;
  return (
    <div className="-mx-4 -mb-4 mt-auto flex border-t" style={{ borderColor: RULE, backgroundColor: SURFACE }}>
      {tabs.map(({ label, Icon }) => (
        <span key={label} className="flex h-10 flex-1 flex-col items-center justify-center gap-px text-[7px] font-semibold" style={{ color: label === current ? ACCENT : MUTED }}>
          <Icon size={12} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame accent={ACCENT}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: DESK }}>
        <StatusBar color={INK} />
        {children}
      </div>
    </PhoneFrame>
  );
}

function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mt-3">
      <p className="text-[7.5px]" style={{ color: MUTED }}>
        {kicker}
      </p>
      <h3 className="mt-0.5 text-[15px] font-semibold leading-none tracking-[-0.02em]" style={{ color: INK }}>
        {title}
      </h3>
    </div>
  );
}

function Group({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[9px] border" style={{ borderColor: RULE, backgroundColor: SURFACE }}>
      {children}
    </div>
  );
}

/**
 * Screen 1: Today. The banner and where the balance goes, drawn from the
 * engine: the four parts of the bar add up to the balance. Under it the
 * one thing worth a look, and the first dated things coming.
 */
export function OverviewScreenMockup() {
  const allocation = balanceAllocation(SAMPLE);
  if (!allocation) throw new Error("The sample must have an account.");
  const capabilities = computeCapabilities(SAMPLE);
  const next = resolveDominantAction(capabilities, deriveAttentionItems(SAMPLE, NOW), 0);
  const coming = deriveComingUp(SAMPLE, PAID, NOW).slice(0, 3);
  const parts = [
    { label: "Available", value: allocation.availableMinorUnits, opacity: 1 },
    { label: "Bills and subscriptions", value: allocation.billsAndSubscriptionsMinorUnits, opacity: 0.55 },
    { label: "Debt minimums", value: allocation.debtMinimumsMinorUnits, opacity: 0.34 },
    { label: "Protected", value: allocation.protectedMinorUnits, opacity: 0.18 },
  ];
  const [whole, cents] = money(allocation.availableMinorUnits).split(".");
  return (
    <Screen>
      <Heading kicker={formatTodayLabel(NOW)} title="Today" />
      <div className="mt-2.5 overflow-hidden rounded-[15px] p-3" style={{ background: HERO_BACKGROUND, color: HERO_INK, boxShadow: `0 7px 11px -10px ${HERO_TO}` }}>
        <div className="flex items-center justify-between">
          <p className="text-[7px] font-medium opacity-80">Available to spend</p>
          <span className="rounded-full px-1.5 py-[1px] text-[5.5px] font-medium" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
            Preliminary
          </span>
        </div>
        <p className="mt-1.5 leading-none tracking-[-0.03em]" style={{ fontFamily: NARRATIVE, fontSize: 28 }}>
          {whole}
          <span style={{ fontSize: 14, opacity: 0.6 }}>.{cents}</span>
        </p>
        <div className="mt-3 flex h-[5px] gap-[1.5px]">
          {parts.map((part) => (
            <span key={part.label} className="h-full first:rounded-l-full last:rounded-r-full" style={{ flex: part.value, backgroundColor: "currentColor", opacity: part.opacity }} />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">
          {parts.map((part) => (
            <div key={part.label}>
              <p className="flex items-center gap-1 text-[5.5px] opacity-75">
                <span className="h-1 w-1 rounded-[1px]" style={{ backgroundColor: "currentColor", opacity: part.opacity }} />
                {part.label}
              </p>
              <p className="text-[7.5px] font-medium tabular-nums">{money(part.value)}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 border-t pt-1.5 text-[6px] opacity-75" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
          From {money(allocation.totalMinorUnits)} across your accounts
        </p>
      </div>

      {next && (
        <div className="mt-2 flex items-center gap-1.5 rounded-[8px] border py-1.5 pl-2 pr-1.5" style={{ borderColor: RULE, backgroundColor: SURFACE }}>
          <span className="h-5 w-[1.5px] rounded-full" style={{ backgroundColor: "currentColor", color: MUTED }} />
          <div className="min-w-0 flex-1">
            <p className="text-[5.5px] font-medium" style={{ color: MUTED }}>
              Needs a look
            </p>
            <p className="text-[7px] font-semibold leading-tight" style={{ color: INK }}>
              {next.message}
            </p>
          </div>
          <span className="flex h-4 w-4 items-center justify-center rounded-full text-[7px]" style={{ backgroundColor: ACCENT, color: ACCENT_LABEL }}>
            &rarr;
          </span>
        </div>
      )}

      <div className="mt-3 flex items-baseline justify-between px-0.5">
        <p className="text-[8.5px] font-semibold tracking-[-0.01em]" style={{ color: INK }}>
          Coming up
        </p>
        <p className="text-[6px]" style={{ color: MUTED }}>
          Next 14 days
        </p>
      </div>
      <div className="mt-1">
        <Group>
          {coming.map((item, index) => (
            <div key={item.id} className="flex items-center gap-1.5 px-2 py-1.5" style={index ? { borderTop: `1px solid ${RULE}` } : undefined}>
              <div className="flex h-[22px] w-[20px] shrink-0 flex-col overflow-hidden rounded-[4px] border" style={{ borderColor: STRONG_RULE, backgroundColor: SURFACE }}>
                <span
                  className="text-center text-[4px] font-bold uppercase leading-[7px]"
                  style={item.kind === "income" ? { backgroundColor: ACCENT, color: ACCENT_LABEL } : { backgroundColor: SUNKEN, color: MUTED }}
                >
                  {badgeMonth(item.date)}
                </span>
                <span className="flex flex-1 items-center justify-center text-[8px] font-semibold leading-none" style={{ color: INK }}>
                  {badgeDay(item.date)}
                </span>
              </div>
              <p className="flex-1 text-[7.5px] font-semibold" style={{ color: INK }}>
                {item.title}
              </p>
              <p className="text-[7.5px] font-medium tabular-nums" style={{ color: item.kind === "income" ? ACCENT : INK }}>
                {item.kind === "income" ? "+" : ""}
                {money(item.amountMinorUnits ?? 0)}
              </p>
            </div>
          ))}
        </Group>
      </div>
      <TabBar current="Today" />
    </Screen>
  );
}

/**
 * Screen 2: Bills. Ticked off for the month, with what is left to pay
 * worked out from what is ticked. A bill with no due date says so, in the
 * same words the product uses.
 */
export function BillsScreenMockup() {
  const summary = summarizeBills(SAMPLE.bills);
  const left = leftToPay(SAMPLE.bills, PAID, periodOf(NOW));
  const rows = SAMPLE.bills.map((b) => ({ bill: b, payment: PAID.find((p) => p.billId === b.id) }));
  return (
    <Screen>
      <Heading kicker="What's owed on a schedule" title="Bills" />
      <div className="mt-2.5 grid grid-cols-2 overflow-hidden rounded-[9px] border" style={{ borderColor: RULE, backgroundColor: SURFACE }}>
        {[
          { label: "Monthly total", value: money(summary.totalMonthlyEquivalentMinorUnits) },
          { label: "Left to pay this month", value: money(left.leftMinorUnits) },
        ].map((stat, index) => (
          <div key={stat.label} className="px-2 py-1.5" style={index ? { borderLeft: `1px solid ${RULE}` } : undefined}>
            <p className="text-[5.5px]" style={{ color: MUTED }}>
              {stat.label}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold tabular-nums" style={{ color: INK }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 px-0.5 text-[8.5px] font-semibold tracking-[-0.01em]" style={{ color: INK }}>
        Records
      </p>
      <div className="mt-1">
        <Group>
          {rows.map(({ bill: row, payment }, index) => {
            const r = row as unknown as { name: string; category: string; amountMinorUnits: number; dueRule: { dayOfMonth?: number } | null };
            return (
              <div key={r.name} className="flex items-start gap-1.5 px-2 py-1.5" style={index ? { borderTop: `1px solid ${RULE}` } : undefined}>
                <span
                  className="mt-[1px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[7px]"
                  style={payment ? { backgroundColor: ACCENT, borderColor: ACCENT, color: ACCENT_LABEL } : { backgroundColor: SURFACE, borderColor: STRONG_RULE }}
                >
                  {payment ? "✓" : ""}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[7.5px] font-semibold leading-tight" style={{ color: payment ? MUTED : INK }}>
                    {r.name}
                  </p>
                  <p className="mt-0.5 text-[5.5px]" style={{ color: MUTED }}>
                    {payment ? paidDayLabel(payment.paidOn) : r.dueRule?.dayOfMonth ? `Due on day ${r.dueRule.dayOfMonth}` : "No due date"} · {r.category}
                  </p>
                </div>
                <p className="text-[7.5px] font-medium tabular-nums" style={{ color: INK }}>
                  {money(r.amountMinorUnits)}
                </p>
              </div>
            );
          })}
        </Group>
      </div>
      <TabBar current="Records" />
    </Screen>
  );
}

/**
 * Screen 3: the payoff plan on the Debt screen. Worked out by the same
 * simulation the product runs: the month you are debt-free, the order the
 * debts clear, and what the cheaper method saves.
 */
export function PayoffScreenMockup() {
  const { planned } = payoffInputs(SAMPLE.debts);
  const comparison = comparePayoff(planned, 10000, NOW);
  const plan = comparison.avalanche;
  return (
    <Screen>
      <Heading kicker="What you owe, and when it could be gone." title="Debt" />
      <div className="mt-2.5 rounded-[9px] border p-2.5" style={{ borderColor: RULE, backgroundColor: SURFACE }}>
        <p className="text-[8.5px] font-semibold tracking-[-0.01em]" style={{ color: INK }}>
          Payoff plan
        </p>
        <p className="mt-2 text-[6px] font-semibold" style={{ color: INK }}>
          Extra each month
        </p>
        <div className="mt-0.5 rounded-[5px] border px-1.5 py-1 text-[7px]" style={{ borderColor: STRONG_RULE, color: INK }}>
          100
        </div>
        <p className="mt-2 text-[6px] font-semibold" style={{ color: INK }}>
          Which debt gets the extra
        </p>
        <div className="mt-0.5 flex overflow-hidden rounded-[6px] border" style={{ borderColor: STRONG_RULE }}>
          <span className="flex-1 px-1 py-1 text-center text-[5.5px] font-semibold" style={{ color: MUTED }}>
            Smallest balance first
          </span>
          <span className="flex-1 px-1 py-1 text-center text-[5.5px] font-semibold" style={{ backgroundColor: ACCENT, color: ACCENT_LABEL }}>
            Highest rate first
          </span>
        </div>
        <p className="mt-3 text-[13px] leading-tight tracking-[-0.02em]" style={{ fontFamily: NARRATIVE, color: INK }}>
          Debt-free in {formatMonth(plan.debtFreeMonth ?? "2026-10")}
        </p>
        <p className="mt-0.5 text-[6px]" style={{ color: MUTED }}>
          Interest along the way: {money(plan.totalInterestMinorUnits)}
        </p>
        <div className="mt-2 overflow-hidden rounded-[6px] border" style={{ borderColor: RULE }}>
          {plan.steps.map((step, index) => (
            <div key={step.debtId} className="flex items-baseline justify-between px-2 py-1.5" style={index ? { borderTop: `1px solid ${RULE}` } : undefined}>
              <span className="text-[7px] font-medium" style={{ color: INK }}>
                {step.name}
              </span>
              <span className="text-[5.5px]" style={{ color: MUTED }}>
                Paid off {formatMonth(step.payoffMonth ?? "2026-10")}
              </span>
            </div>
          ))}
        </div>
      </div>
      <TabBar current="Records" />
    </Screen>
  );
}
