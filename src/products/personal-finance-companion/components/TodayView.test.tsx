import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TodayView, { type TodayViewProps } from "./TodayView";
import type { AttentionItem } from "../attention";
import type { BalanceAllocation } from "../companion/capability";
import type { ComingUpItem } from "../comingUp";
import type { MonthLedger } from "../monthLedger";
import type { SavingsGoal } from "../state";

const item = (id: string, message: string): AttentionItem => ({
  id,
  kind: "billMissingDueDate",
  urgency: "needsResolution",
  area: "bills",
  entityId: id,
  message,
  deepLink: "/app/products/personal-finance-companion/bills",
});

function render(overrides: Partial<TodayViewProps> = {}) {
  const props: TodayViewProps = {
    todayLabel: "Monday 21 September",
    availableMoney: undefined,
    allocation: null,
    capabilities: [],
    comingUp: [],
    goals: [],
    dominantAction: null,
    visibleAttentionItems: [],
    snoozedCount: 0,
    onSnooze: () => {},
    onClearSnoozed: () => {},
    unreviewedImportCount: 0,
    freshness: [],
    recentChanges: [],
    companionMessage: "Run a regular review with Companion",
    monthLedger: null,
    ...overrides,
  };
  return renderToStaticMarkup(<TodayView {...props} />).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'");
}
const occurrences = (text: string, needle: string) => text.split(needle).length - 1;

const ALLOCATION: BalanceAllocation = {
  totalMinorUnits: 522018,
  availableMinorUnits: 132518,
  billsAndSubscriptionsMinorUnits: 181000,
  debtMinimumsMinorUnits: 8500,
  protectedMinorUnits: 200000,
};

describe("Today: the next action is not listed twice", () => {
  const first = item("bill:1", "Car insurance needs a due date.");
  const second = item("bill:2", "Internet needs a due date.");

  it("says the dominant sentence once, not again under Also worth a look", () => {
    const text = render({ dominantAction: { message: first.message, deepLink: first.deepLink }, visibleAttentionItems: [first, second] });
    expect(occurrences(text, first.message)).toBe(1);
    expect(occurrences(text, second.message)).toBe(1);
  });

  it("does not claim you are caught up while a next action is showing", () => {
    const text = render({ dominantAction: { message: first.message, deepLink: first.deepLink }, visibleAttentionItems: [first] });
    expect(text).not.toContain("You're caught up.");
    expect(text).not.toContain("Also worth a look");
  });

  it("says caught up when there is nothing", () => {
    expect(render()).toContain("You're caught up.");
  });

  it("lists everything when the next action is about something else", () => {
    const text = render({ dominantAction: { message: "Continue building your financial picture with Companion.", deepLink: "/x" }, visibleAttentionItems: [first, second] });
    expect(text).toContain(first.message);
    expect(text).toContain(second.message);
  });
});

describe("Today: the hero", () => {
  it("shows the available figure and where the rest of the balance goes, in four named parts", () => {
    const text = render({ allocation: ALLOCATION });
    expect(text).toContain("Available to spend");
    expect(text).toContain("$1,325.18");
    for (const label of ["Available", "Bills and subscriptions", "Debt minimums", "Protected"]) expect(text).toContain(label);
    expect(text).toContain("$1,810.00");
    expect(text).toContain("From $5,220.18 across your accounts");
  });

  it("says so, in words, when what is owed out is more than what is available, and draws no bar", () => {
    const html = renderToStaticMarkup(<TodayView {...({ todayLabel: "x", availableMoney: undefined, allocation: { ...ALLOCATION, availableMinorUnits: -5000 }, capabilities: [], comingUp: [], goals: [], dominantAction: null, visibleAttentionItems: [], snoozedCount: 0, onSnooze: () => {}, onClearSnoozed: () => {}, unreviewedImportCount: 0, freshness: [], recentChanges: [], companionMessage: "", monthLedger: null } as TodayViewProps)} />);
    expect(html).toContain("come to more than what you have available");
    expect(html).not.toContain('aria-label="Where your balance goes"');
    expect(html).toContain("−$50");
  });

  it("asks for an account instead of inventing a figure", () => {
    const text = render({ availableMoney: { key: "availableMoney", label: "Available Money", status: "waiting", detail: "Waiting for an account", valueMinorUnits: null, explain: null } });
    expect(text).toContain("Waiting for an account. Add an account to see this.");
  });

  it("carries a Preliminary flag only when the figure has a caveat", () => {
    const row = (caveat: string | null) => ({ key: "availableMoney" as const, label: "Available Money", status: "ready" as const, detail: "Ready", valueMinorUnits: 1, explain: { lineItems: [], totalMinorUnits: 1, basedOn: [], caveat } });
    expect(render({ allocation: ALLOCATION, availableMoney: row("1 bill is still missing a due date, so this figure is preliminary.") })).toContain("Preliminary");
    expect(render({ allocation: ALLOCATION, availableMoney: row(null) })).not.toContain("Preliminary");
  });
});

describe("Today: what is coming, the month and the goals", () => {
  const coming: ComingUpItem[] = [
    { id: "a", date: "2026-09-24", title: "Visa minimum", kind: "debt", amountMinorUnits: 8500, area: "debt" },
    { id: "b", date: "2026-09-28", title: "Salary", kind: "income", amountMinorUnits: 420000, area: "income" },
    { id: "c", date: "2026-10-01", title: "Rent", kind: "bill", amountMinorUnits: null, area: "bills" },
  ];

  it("lists dated items with a calendar badge, a plain kind, and a plus only on pay", () => {
    const text = render({ comingUp: coming });
    expect(text).toContain("SEP 24 Visa minimum Debt $85.00");
    expect(text).toContain("SEP 28 Salary Payday +$4,200.00");
    expect(text).toContain("OCT 1 Rent Bill No amount yet");
  });

  it("says what belongs here when nothing is dated, rather than showing an empty box", () => {
    expect(render()).toContain("Nothing dated in the next 14 days.");
  });

  const ledger: MonthLedger = { incoming: [], outgoing: [], setAside: [], incomingTotal: 420000, outgoingTotal: 189500, setAsideTotal: 96396, leftOver: 134104, notes: ["1 bill has no amount yet and is not counted."] };

  it("shows a typical month, its three parts and its notes, only when there is one", () => {
    const text = render({ monthLedger: ledger });
    for (const label of ["A typical month", "Going out", "Set aside for goals", "Left over"]) expect(text).toContain(label);
    expect(text).toContain("of $4,200.00 coming in");
    expect(text).toContain("1 bill has no amount yet and is not counted.");
    expect(render()).not.toContain("A typical month");
  });

  it("shows goals with what is saved and the target, and none when there are none", () => {
    const goal = { id: "g", name: "Emergency fund", status: "ready", targetAmountMinorUnits: 1000000, savedAmountMinorUnits: 200000 } as SavingsGoal;
    const text = render({ goals: [goal] });
    expect(text).toContain("Emergency fund of $10,000.00 $2,000.00");
    expect(render()).not.toContain("Goals");
    expect(render({ goals: [{ ...goal, status: "archived" } as SavingsGoal] })).not.toContain("Goals");
  });
});
