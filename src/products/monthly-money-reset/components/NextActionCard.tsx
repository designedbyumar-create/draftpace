"use client";

import Button from "@/design-system/Button";
import { CalendarCheck, Check, Plus, WarningCircle, X } from "@/design-system/Icon";
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
      <div className="rounded-[24px] border border-[var(--mmr-line)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Your next move</p>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]">
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
  const isCheckIn = nextAction.id === "weekly-check-in";
  const Glyph = nextAction.urgency === "critical" ? WarningCircle : isCheckIn ? CalendarCheck : Plus;

  return (
    <div className={`rounded-[24px] border p-5 sm:p-6 ${tone.container}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone.chip}`}
            aria-hidden
          >
            <Glyph size={16} />
          </span>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${tone.eyebrow}`}>{tone.eyebrowLabel}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss this recommendation"
          className="-mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--faint)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <X size={14} aria-hidden />
        </button>
      </div>
      <p className="mt-4 text-[19px] font-semibold leading-snug tracking-[-0.01em] text-[var(--text)]">{nextAction.label}</p>
      <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[var(--muted)]">{nextAction.reason}</p>
      <Button
        variant="commit"
        size="lg"
        fullWidth
        className="mt-5"
        iconLeft={<Plus size={14} aria-hidden />}
        onClick={onAct}
      >
        {isCheckIn ? "Start check-in" : "Add what changed"}
      </Button>
    </div>
  );
}

const TONE: Record<NextActionUrgency, { container: string; eyebrow: string; eyebrowLabel: string; chip: string }> = {
  critical: {
    container: "border-[var(--danger)] bg-[var(--danger-soft)]",
    eyebrow: "text-[var(--danger)]",
    eyebrowLabel: "Needs attention now",
    chip: "bg-[var(--danger)] text-[var(--primary-contrast)]",
  },
  attention: {
    container: "border-[color-mix(in_srgb,var(--warning)_50%,transparent)] bg-[var(--warning-soft)]",
    eyebrow: "text-[var(--warning)]",
    eyebrowLabel: "Worth a look",
    chip: "bg-[var(--warning)] text-[var(--primary-contrast)]",
  },
  routine: {
    container: "border-[var(--mmr-line)] bg-[var(--surface)]",
    eyebrow: "text-[var(--faint)]",
    eyebrowLabel: "Your next move",
    chip: "bg-[var(--mmr-sage-pale)] text-[var(--mmr-forest-800)]",
  },
};
