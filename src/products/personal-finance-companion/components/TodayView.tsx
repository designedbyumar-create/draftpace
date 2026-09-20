import Link from "next/link";
import type { ReactNode } from "react";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { ArrowRight, CheckCircle2, Layers3 } from "@/design-system/Icon";
import { formatCurrency } from "@/lib/currency";
import { resolveSafeDeepLink } from "../deepLinks";
import type { BalanceAllocation, CapabilityRow } from "../companion/capability";
import type { DominantAction } from "../companion/dominantAction";
import type { AttentionItem } from "../attention";
import type { ComingUpItem, ComingUpKind } from "../comingUp";
import { badgeDay, badgeMonth } from "../dates";
import type { FreshnessSummary } from "../freshness";
import type { RecentChangeSummary } from "../recentChanges";
import type { MonthLedger } from "../monthLedger";
import type { SavingsGoal } from "../state";
import { progressPercent } from "./savings/savingsLogic";
import ExplainBreakdown from "./companion/ExplainBreakdown";
import Figure from "./shared/Figure";

const STATUS_TONE: Record<CapabilityRow["status"], "success" | "warning" | "neutral"> = {
  ready: "success",
  needsInfo: "warning",
  waiting: "neutral",
};

const GROUP = "overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)]";
const ROW_LINK = "flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[var(--surface-muted)]";
const ARROW_BUTTON =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-contrast)]";

const KIND_LABEL: Record<ComingUpKind, string> = {
  bill: "Bill",
  debt: "Debt",
  subscription: "Subscription",
  income: "Payday",
};

export interface TodayViewProps {
  todayLabel: string;
  availableMoney: CapabilityRow | undefined;
  allocation: BalanceAllocation | null;
  /** Every capability row, for the "how these are worked out" disclosure. */
  capabilities: CapabilityRow[];
  dominantAction: DominantAction | null;
  visibleAttentionItems: AttentionItem[];
  snoozedCount: number;
  onSnooze: (id: string) => void;
  onClearSnoozed: () => void;
  unreviewedImportCount: number;
  freshness: FreshnessSummary[];
  recentChanges: RecentChangeSummary[];
  companionMessage: string;
  monthLedger: MonthLedger | null;
  comingUp: ComingUpItem[];
  goals: SavingsGoal[];
}

function SectionTitle({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between px-1 pb-2.5">
      <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-[var(--text)]">{title}</h2>
      {meta && <span className="text-[13px] text-[var(--muted)]">{meta}</span>}
    </div>
  );
}

/**
 * The filled banner every other thing on the screen is quieter than. The
 * figure is Available Money, and under it the bar shows where the rest of
 * the balance is going: the four parts always add up to the balance, so
 * the widths are true, and they come from the same totals as the figure.
 */
function Hero({ availableMoney, allocation }: { availableMoney: CapabilityRow | undefined; allocation: BalanceAllocation | null }) {
  const parts = allocation
    ? [
        { label: "Available", value: allocation.availableMinorUnits, opacity: 1 },
        { label: "Bills and subscriptions", value: allocation.billsAndSubscriptionsMinorUnits, opacity: 0.55 },
        { label: "Debt minimums", value: allocation.debtMinimumsMinorUnits, opacity: 0.34 },
        { label: "Protected", value: allocation.protectedMinorUnits, opacity: 0.18 },
      ]
    : [];
  const overspent = allocation !== null && allocation.availableMinorUnits < 0;
  const preliminary = availableMoney?.explain?.caveat ?? null;

  return (
    <section
      id="pfc-tour-available-money"
      className="relative overflow-hidden rounded-[30px] p-6"
      style={{
        color: "var(--product-hero-ink)",
        background: "radial-gradient(120% 90% at 85% -10%, var(--product-hero-from) 0%, var(--product-hero-mid) 55%, var(--product-hero-to) 100%)",
        boxShadow: "0 14px 22px -20px color-mix(in srgb, var(--product-hero-to) 60%, black)",
      }}
    >
      <span aria-hidden className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10" />
      <span aria-hidden className="absolute -right-8 -top-12 h-56 w-56 rounded-full border border-white/10" />
      <div className="relative flex items-center justify-between gap-3">
        <p className="text-[14px] font-medium opacity-80">Available to spend</p>
        {preliminary && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.12] px-2.5 py-1 text-[11.5px] font-medium">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--warning)" }} />
            Preliminary
          </span>
        )}
      </div>
      <div className="relative mt-3">
        {allocation ? (
          <Figure minorUnits={allocation.availableMinorUnits} size={60} />
        ) : (
          <span className="text-[60px] leading-none" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
            {"—"}
          </span>
        )}
      </div>

      {allocation && !overspent && (
        <>
          <div className="relative mt-6 flex h-2.5 gap-[3px]" role="img" aria-label="Where your balance goes">
            {parts
              .filter((part) => part.value > 0)
              .map((part) => (
                <span key={part.label} className="h-full first:rounded-l-full last:rounded-r-full" style={{ flex: part.value, background: "currentColor", opacity: part.opacity }} />
              ))}
          </div>
          <div className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            {parts.map((part) => (
              <div key={part.label}>
                <p className="flex items-center gap-1.5 text-[11.5px] opacity-75">
                  <span aria-hidden className="h-2 w-2 rounded-[2px] bg-current" style={{ opacity: part.opacity }} />
                  {part.label}
                </p>
                <p className="mt-0.5 text-[15px] font-medium tabular-nums">{formatCurrency(part.value, "USD")}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {overspent && (
        <p className="relative mt-5 text-[14px] leading-relaxed opacity-90">
          Bills, subscriptions and debt minimums come to more than what you have available.
        </p>
      )}
      {!allocation && availableMoney && (
        <p className="relative mt-5 text-[14px] leading-relaxed opacity-90">{availableMoney.detail}. Add an account to see this.</p>
      )}
      {allocation && (
        <div className="relative mt-5 border-t border-white/15 pt-3.5 text-[12.5px] opacity-75">
          From {formatCurrency(allocation.totalMinorUnits, "USD")} across your accounts
        </div>
      )}
    </section>
  );
}

function Leaf({ date, payday }: { date: string; payday: boolean }) {
  return (
    <div className="flex h-[46px] w-[42px] shrink-0 flex-col overflow-hidden rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)]" aria-hidden>
      <span
        className={`py-[2px] text-center text-[9px] font-bold uppercase tracking-[0.08em] ${
          payday ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "bg-[var(--surface-strong)] text-[var(--muted)]"
        }`}
      >
        {badgeMonth(date)}
      </span>
      <span className="flex flex-1 items-center justify-center text-[17px] font-semibold leading-none tabular-nums text-[var(--text)]">{badgeDay(date)}</span>
    </div>
  );
}

function GoalRing({ percent }: { percent: number }) {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden className="shrink-0">
      <circle cx="20" cy="20" r={radius} fill="none" stroke="var(--surface-strong)" strokeWidth="4" />
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

/** A typical month as one bar of income, split into what goes out, what is set aside, and what is left. */
function MonthCard({ ledger }: { ledger: MonthLedger }) {
  const parts = [
    { label: "Going out", value: ledger.outgoingTotal, background: "color-mix(in srgb, var(--text) 78%, var(--surface))" },
    { label: "Set aside for goals", value: ledger.setAsideTotal, background: "color-mix(in srgb, var(--text) 34%, var(--surface))" },
    { label: "Left over", value: ledger.leftOver, background: "var(--primary)" },
  ];
  return (
    <div className={`${GROUP} p-5`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[13px] text-[var(--muted)]">Left over</p>
          <div className="mt-1 text-[var(--text)]">
            <Figure minorUnits={ledger.leftOver} size={38} />
          </div>
        </div>
        <p className="pb-1 text-right text-[13px] text-[var(--muted)]">of {formatCurrency(ledger.incomingTotal, "USD")} coming in</p>
      </div>
      {ledger.leftOver >= 0 && ledger.incomingTotal > 0 && (
        <div className="mt-5 flex h-2.5 gap-[3px]" role="img" aria-label="How a typical month is spent">
          {parts
            .filter((part) => part.value > 0)
            .map((part) => (
              <span key={part.label} className="h-full first:rounded-l-full last:rounded-r-full" style={{ flex: part.value, background: part.background }} />
            ))}
        </div>
      )}
      <div className="mt-4">
        {parts.map((part, index) => (
          <div key={part.label} className={`flex items-center justify-between py-2.5 ${index ? "border-t border-[var(--border)]" : ""}`}>
            <span className="flex items-center gap-2.5 text-[14px] text-[var(--text)]">
              <span aria-hidden className="h-2.5 w-2.5 rounded-[3px]" style={{ background: part.background }} />
              {part.label}
            </span>
            <span className="text-[14px] tabular-nums text-[var(--text)]">{formatCurrency(Math.abs(part.value), "USD")}</span>
          </div>
        ))}
      </div>
      {ledger.notes.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 border-t border-[var(--border)] pt-3 text-[12px] leading-relaxed text-[var(--muted)]">
          {ledger.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NextRow({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div id={id} className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] py-3 pl-4 pr-3">
      {children}
    </div>
  );
}

/** Today, presentational: everything it shows is handed to it, so it renders the same in the app and in tests. */
export default function TodayView({
  todayLabel,
  availableMoney,
  allocation,
  capabilities,
  dominantAction,
  visibleAttentionItems,
  snoozedCount,
  onSnooze,
  onClearSnoozed,
  unreviewedImportCount,
  freshness,
  recentChanges,
  companionMessage,
  monthLedger,
  comingUp,
  goals,
}: TodayViewProps) {
  // The dominant action is one of the attention items said out loud; listing it again right below is the same sentence twice.
  const listed = dominantAction ? visibleAttentionItems.filter((item) => item.message !== dominantAction.message) : visibleAttentionItems;
  const activeGoals = goals.filter((goal) => goal.status !== "archived");

  return (
    <>
      <div className="px-1 pt-1">
        <p className="text-[13.5px] text-[var(--muted)]">{todayLabel}</p>
        <h1 className="mt-0.5 text-[26px] font-semibold leading-none tracking-[-0.02em] text-[var(--text)]">Today</h1>
      </div>

      <Hero availableMoney={availableMoney} allocation={allocation} />

      {dominantAction ? (
        <NextRow id="pfc-tour-next-action">
          <span aria-hidden className="h-9 w-[3px] shrink-0 rounded-full" style={{ backgroundColor: "var(--warning)" }} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium text-[var(--muted)]">Needs a look</p>
            <p className="text-[14.5px] font-semibold leading-snug tracking-[-0.01em] text-[var(--text)]">{dominantAction.message}</p>
          </div>
          <Link href={dominantAction.deepLink} className={ARROW_BUTTON} aria-label={`Take care of this: ${dominantAction.message}`}>
            <ArrowRight size={16} aria-hidden />
          </Link>
        </NextRow>
      ) : (
        <NextRow id="pfc-tour-next-action">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-semibold text-[var(--text)]">You&apos;re caught up.</p>
            <p className="text-[12.5px] text-[var(--muted)]">Nothing needs your attention right now.</p>
          </div>
        </NextRow>
      )}

      {unreviewedImportCount > 0 && (
        <NextRow>
          <Layers3 className="h-5 w-5 shrink-0 text-[var(--muted)]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[var(--text)]">
              {unreviewedImportCount} imported {unreviewedImportCount === 1 ? "record" : "records"} waiting for review.
            </p>
            <p className="text-[12.5px] text-[var(--muted)]">Nothing from an import joins your picture until you confirm it.</p>
          </div>
          <Link href={resolveSafeDeepLink({ kind: "companionResume" })}>
            <Button size="sm" variant="secondary">
              Review
            </Button>
          </Link>
        </NextRow>
      )}

      <section>
        <SectionTitle title="Coming up" meta="Next 14 days" />
        {comingUp.length === 0 ? (
          <p className="rounded-[18px] border border-dashed border-[var(--border-strong)] px-4 py-4 text-[13.5px] leading-relaxed text-[var(--muted)]">
            Nothing dated in the next 14 days. Bills with a due day, renewals, pay days and debts with a due date show up here.
          </p>
        ) : (
          <ul className={GROUP}>
            {comingUp.map((item, index) => (
              <li key={item.id} className={index ? "border-t border-[var(--border)]" : ""}>
                <Link href={resolveSafeDeepLink({ kind: "area", area: item.area })} className={ROW_LINK}>
                  <Leaf date={item.date} payday={item.kind === "income"} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--text)]">{item.title}</p>
                    <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{KIND_LABEL[item.kind]}</p>
                  </div>
                  <span className={`text-[15px] tabular-nums ${item.kind === "income" ? "font-semibold text-[var(--primary)]" : "font-medium text-[var(--text)]"}`}>
                    {item.amountMinorUnits === null ? "No amount yet" : `${item.kind === "income" ? "+" : ""}${formatCurrency(item.amountMinorUnits, "USD")}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div id="pfc-tour-attention" className="empty:hidden">
        {listed.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between px-1 pb-2.5">
              <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-[var(--text)]">Also worth a look</h2>
              {snoozedCount > 0 && (
                <button type="button" onClick={onClearSnoozed} className="text-[12.5px] font-medium text-[var(--muted)] hover:text-[var(--primary)]">
                  {snoozedCount} snoozed, show all
                </button>
              )}
            </div>
            <ul className={GROUP}>
              {listed.slice(0, 3).map((item, index) => (
                <li key={item.id} className={`flex items-center gap-3 px-4 py-3 ${index ? "border-t border-[var(--border)]" : ""}`}>
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.urgency === "needsResolution" ? "var(--warning)" : "var(--faint)" }}
                  />
                  <Link href={item.deepLink} className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-[var(--text)] hover:underline">
                    {item.message}
                  </Link>
                  <button
                    type="button"
                    onClick={() => onSnooze(item.id)}
                    className="shrink-0 rounded-md px-2 py-1.5 text-[12px] font-medium text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                    title="Hide for 7 days on this device"
                    aria-label={`Snooze: ${item.message}`}
                  >
                    Snooze
                  </button>
                </li>
              ))}
            </ul>
            <Link href="/app/products/personal-finance-companion/attention" className="mt-2 inline-block px-1 text-[13px] font-semibold text-[var(--primary)] hover:underline">
              {listed.length > 3 ? `View all ${listed.length} in Attention` : "Open Attention"}
            </Link>
          </section>
        )}
        {listed.length === 0 && snoozedCount > 0 && (
          <button type="button" onClick={onClearSnoozed} className="px-1 text-[12.5px] font-medium text-[var(--muted)] hover:text-[var(--primary)]">
            {snoozedCount} snoozed, show all
          </button>
        )}
      </div>

      {monthLedger && (
        <section>
          <SectionTitle title="A typical month" meta="Monthly equivalents" />
          <MonthCard ledger={monthLedger} />
        </section>
      )}

      {activeGoals.length > 0 && (
        <section>
          <SectionTitle title="Goals" meta="Saved so far" />
          <ul className={GROUP}>
            {activeGoals.map((goal, index) => (
              <li key={goal.id} className={index ? "border-t border-[var(--border)]" : ""}>
                <Link href={resolveSafeDeepLink({ kind: "area", area: "savings" })} className={`${ROW_LINK} py-3.5`}>
                  <GoalRing percent={progressPercent(goal) ?? 0} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[var(--text)]">{goal.name}</p>
                    <p className="mt-0.5 text-[12.5px] tabular-nums text-[var(--muted)]">of {formatCurrency(goal.targetAmountMinorUnits, "USD")}</p>
                  </div>
                  <span className="text-[15px] font-medium tabular-nums text-[var(--text)]">{formatCurrency(goal.savedAmountMinorUnits, "USD")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <details className={`${GROUP} group`}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-[15px] font-semibold text-[var(--text)]">
          How these figures are worked out
          <span aria-hidden className="text-[var(--muted)] transition-transform group-open:rotate-90">
            <ArrowRight size={16} />
          </span>
        </summary>
        <div className="border-t border-[var(--border)]">
          {capabilities.map((row, index) => (
            <div key={row.key} className={`px-4 py-3.5 ${index ? "border-t border-[var(--border)]" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-medium text-[var(--text)]">{row.label}</p>
                <Badge tone={STATUS_TONE[row.status]}>{row.status === "waiting" ? "Waiting" : row.status === "needsInfo" ? row.detail : "Ready"}</Badge>
              </div>
              <p className="mt-1 text-[18px] font-medium tabular-nums text-[var(--text)]">
                {row.valueMinorUnits !== null ? formatCurrency(row.valueMinorUnits, "USD") : "—"}
              </p>
              {row.explain && <ExplainBreakdown breakdown={row.explain} currency="USD" label={row.label} valueMinorUnits={row.valueMinorUnits ?? 0} />}
            </div>
          ))}
        </div>
      </details>

      {(freshness.length > 0 || recentChanges.length > 0) && (
        <div className="flex flex-col gap-3 rounded-[18px] border border-[var(--border)] p-4">
          {freshness.length > 0 && (
            <div>
              <p className="text-[13px] font-semibold text-[var(--text)]">Freshness</p>
              <ul className="mt-1.5 flex flex-col gap-0.5">
                {freshness.map((item) => (
                  <li key={item.domain} className="text-[13px] text-[var(--muted)]">
                    {item.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recentChanges.length > 0 && (
            <div>
              <p className="text-[13px] font-semibold text-[var(--text)]">Recently</p>
              <ul className="mt-1.5 flex flex-col gap-0.5">
                {recentChanges.map((item) => (
                  <li key={item.area} className="text-[13px] text-[var(--muted)]">
                    {item.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="pt-1">
        <Link href={resolveSafeDeepLink({ kind: "companionResume" })}>
          <Button size="sm" variant="secondary" iconRight={<ArrowRight size={14} aria-hidden />}>
            {companionMessage}
          </Button>
        </Link>
      </div>
    </>
  );
}
