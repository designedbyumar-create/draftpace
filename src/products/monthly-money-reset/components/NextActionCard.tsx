"use client";

import Button from "@/design-system/Button";
import { Check, Plus, WarningCircle, X } from "@/design-system/Icon";
import type { NextAction, Preferences } from "../state";
import type { NextActionUrgency } from "../nextAction";
import { checkInDayLabel, nextCheckInDate } from "../nextAction";

type TieredNextAction = NextAction & { urgency: NextActionUrgency };

/**
 * One dominant next action, visually weighted by real urgency — never
 * decorative, never the same treatment for "Safe-to-Spend is negative" and
 * "do your weekly check-in." Critical gets a tinted, bordered card that
 * actually looks like it needs attention now; attention gets a quieter
 * accent; routine is nearly as quiet as all-clear. All-clear always
 * explains why, and always names the next check-in day so a quiet state
 * still feels informative, not empty.
 */
export default function NextActionCard({
  nextAction,
  checkInDay,
  onDismiss,
  onAct,
}: {
  nextAction: TieredNextAction | null;
  checkInDay: Preferences["checkInDay"];
  onDismiss: () => void;
  onAct: () => void;
}) {
  if (!nextAction) {
    return (
      <div className="rounded-2xl border border-[var(--border)] p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Your next move</p>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/15 text-[var(--success)]">
            <Check size={14} aria-hidden />
          </span>
          <p className="text-[14px] font-semibold text-[var(--text)]">Nothing needs attention right now</p>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
          Everything you&apos;ve added is accounted for and this week&apos;s check-in is done. Check in again{" "}
          {checkInDayLabel(checkInDay)}
          {" "}
          <span className="text-[var(--faint)]">
            ({nextCheckInDate(checkInDay).toLocaleDateString("en-US", { month: "short", day: "numeric" })})
          </span>
          .
        </p>
      </div>
    );
  }

  const tone = TONE[nextAction.urgency];

  return (
    <div className={`rounded-2xl border p-6 ${tone.container}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${tone.eyebrow}`}>
          {tone.eyebrowLabel}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss this recommendation"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
        >
          <X size={12} aria-hidden />
        </button>
      </div>
      <div className="mt-2 flex items-start gap-2.5">
        {nextAction.urgency === "critical" && (
          <WarningCircle size={20} className={`mt-0.5 shrink-0 ${tone.eyebrow}`} aria-hidden />
        )}
        <p className="text-[17px] font-semibold text-[var(--text)]">{nextAction.label}</p>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{nextAction.reason}</p>
      <Button size="md" className="mt-4" iconLeft={<Plus size={13} aria-hidden />} onClick={onAct}>
        {nextAction.id === "weekly-check-in" ? "Start check-in" : "Add what changed"}
      </Button>
    </div>
  );
}

const TONE: Record<NextActionUrgency, { container: string; eyebrow: string; eyebrowLabel: string }> = {
  critical: {
    container: "border-[var(--danger)] bg-[var(--danger-soft)]",
    eyebrow: "text-[var(--danger)]",
    eyebrowLabel: "Needs attention now",
  },
  attention: {
    container: "border-[var(--warning)]/50 bg-[var(--warning-soft)]",
    eyebrow: "text-[var(--warning)]",
    eyebrowLabel: "Worth a look",
  },
  routine: {
    container: "border-[var(--border)]",
    eyebrow: "text-[var(--faint)]",
    eyebrowLabel: "Your next move",
  },
};
