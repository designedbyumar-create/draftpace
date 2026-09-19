"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Minus, RotateCcw } from "@/design-system/Icon";
import { settleVariant, staggerContainer, staggerItem } from "@/design-system/motion";
import { SOURCE_LABEL } from "../learning";
import { describeTask, type ChildDay, type TaskEvent, type TodayTask, type TodayView } from "../today";

/**
 * The Day Sheet: today as a school register. One sheet per child, one ruled
 * row per subject, one round tap to mark it done. Presentational only: the
 * loading, recording and follow-up logic stay in TodayModule, so this can be
 * rendered from plain data.
 *
 * Children stay grouped and never interleaved, so nobody has to work out
 * whose maths a row is. The source of every task is on the row, every time.
 */

const DIFFICULTIES = [
  ["easy", "Easy"],
  ["about-right", "About right"],
  ["difficult", "Difficult"],
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number][0];

const SHEET =
  "overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(26,22,29,0.04),0_14px_28px_-20px_rgba(74,51,80,0.22)]";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function TodayHeader({ heading, dateLabel }: { heading: string; dateLabel: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">Today</p>
        <p className="text-[12.5px] text-[var(--muted)]">{dateLabel}</p>
      </div>
      <h1
        className="mt-2 text-[32px] leading-[1.1] tracking-[-0.015em] text-[var(--text)] [text-wrap:balance]"
        style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
      >
        {heading}
      </h1>
    </div>
  );
}

/** The round control. 44px to touch, 30px to see, so the tap is easy and the row stays light. */
function Tick({
  state,
  busy,
  label,
  onPress,
  animate,
}: {
  state: "open" | "done" | "skipped";
  busy?: boolean;
  label: string;
  onPress?: () => void;
  animate?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const face =
    state === "done"
      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]"
      : state === "skipped"
        ? "border-dashed border-[var(--border-strong)] text-[var(--faint)]"
        : "border-[color-mix(in_srgb,var(--primary)_65%,transparent)] text-transparent group-hover/tick:bg-[var(--primary-soft)] group-hover/tick:text-[var(--primary)]";

  const circle = (
    <span
      className={`relative flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 transition-colors ${face} ${
        busy ? "opacity-60" : ""
      }`}
    >
      {busy ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" aria-hidden />
      ) : state === "skipped" ? (
        <Minus size={14} aria-hidden />
      ) : (
        <Check size={17} aria-hidden />
      )}
    </span>
  );

  if (!onPress) {
    return (
      <span className="flex h-11 w-11 items-center justify-center" aria-hidden>
        {animate ? (
          <motion.span initial="hidden" animate="visible" variants={settleVariant(Boolean(reduceMotion))}>
            {circle}
          </motion.span>
        ) : (
          circle
        )}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={busy}
      aria-label={label}
      className="group/tick flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-wait"
    >
      {circle}
    </button>
  );
}

function TaskRow({
  task,
  busy,
  onDone,
  onNotCompleted,
}: {
  task: TodayTask;
  busy: boolean;
  onDone: () => void;
  onNotCompleted: () => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.li
      layout={reduceMotion ? false : "position"}
      variants={staggerItem(Boolean(reduceMotion))}
      className="grid grid-cols-[44px_minmax(0,1fr)] gap-x-2.5 border-b border-[var(--border)] py-3 pl-2.5 pr-4 last:border-b-0"
    >
      <Tick state="open" busy={busy} label={`Mark ${task.subject} done`} onPress={onDone} />
      <div className="min-w-0 pt-[3px]">
        <h3 className="text-[16px] font-semibold leading-snug text-[var(--text)]">{task.subject}</h3>
        <p className="mt-0.5 text-[13.5px] leading-snug text-[var(--muted)]">{describeTask(task)}</p>
        {task.reason && (
          <p className="mt-2.5 flex items-start gap-2 rounded-xl bg-[var(--product-wash,var(--primary-soft))] px-3 py-2 text-[12.5px] leading-[1.45] text-[var(--text)]">
            <RotateCcw size={14} aria-hidden className="mt-[2px] shrink-0 text-[var(--primary)]" />
            <span>
              <span className="font-semibold">Worth going over again.</span> {task.reason}
            </span>
          </p>
        )}
        <div className="mt-1 flex items-center justify-between gap-3">
          {/* Where it came from, on every task, every time. */}
          <span className="text-[11.5px] font-semibold text-[var(--primary)]">{SOURCE_LABEL[task.source]}</span>
          <button
            type="button"
            onClick={onNotCompleted}
            disabled={busy}
            className="-mb-1 -mr-2 min-h-8 rounded-full px-2.5 text-[12px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-50"
          >
            Did not get to it
          </button>
        </div>
      </div>
    </motion.li>
  );
}

function RecordedRow({ entry, fresh }: { entry: TaskEvent; fresh: boolean }) {
  const reduceMotion = useReducedMotion();
  const skipped = entry.state === "not-completed";
  return (
    <motion.li
      layout={reduceMotion ? false : "position"}
      className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-x-2.5 border-b border-[var(--border)] py-2 pl-2.5 pr-4 last:border-b-0">
      <Tick state={skipped ? "skipped" : "done"} label="" animate={fresh} />
      <p className="text-[14.5px] text-[var(--muted)]">
        <span>{entry.subject}</span>
        {skipped && <span className="ml-1.5 text-[12.5px] text-[var(--faint)]">Not finished</span>}
      </p>
    </motion.li>
  );
}

function FollowUp({
  task,
  onPick,
  onSkip,
}: {
  task: TodayTask;
  onPick: (value: Difficulty) => void;
  onSkip: () => void;
}) {
  return (
    <div
      role="status"
      className="mt-3 rounded-[20px] border border-[color-mix(in_srgb,var(--primary)_22%,transparent)] bg-[var(--product-wash,var(--primary-soft))] p-4"
    >
      {/* The subject exactly as the parent typed it. */}
      <p className="text-[15px] font-semibold text-[var(--text)]">How did {task.subject} go?</p>
      <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--muted)]">
        Only if it is worth saying. It changes what comes next, and skipping it changes nothing.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {DIFFICULTIES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onPick(value)}
            className="min-h-11 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-2 text-[13px] font-semibold text-[var(--text)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-2 min-h-9 rounded-full px-3 text-[12.5px] font-medium text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
      >
        Skip
      </button>
    </div>
  );
}

function ChildSheet({
  day,
  href,
  pendingKey,
  asking,
  justRecordedKey,
  onDone,
  onNotCompleted,
  onDifficulty,
  onSkipAsking,
}: {
  day: ChildDay;
  href: string;
  pendingKey: string | null;
  asking: TodayTask | null;
  justRecordedKey: string | null;
  onDone: (task: TodayTask) => void;
  onNotCompleted: (task: TodayTask) => void;
  onDifficulty: (task: TodayTask, value: Difficulty) => void;
  onSkipAsking: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const total = day.tasks.length + day.recorded.length;
  const empty = day.tasks.length === 0 && day.recorded.length === 0;

  return (
    <section aria-label={`Today for ${day.child.name}`}>
      <div className="flex items-center gap-3 px-0.5">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[16px] text-[var(--primary-strong)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {initialsOf(day.child.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2
            className="truncate text-[21px] leading-tight tracking-[-0.01em] text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {day.child.name}
          </h2>
          {total > 0 && (
            <p className="text-[12.5px] text-[var(--muted)]">
              {day.recorded.length} of {total} recorded
            </p>
          )}
        </div>
        <Link
          href={href}
          className="-mr-1 flex min-h-9 items-center gap-0.5 rounded-full pl-3 pr-2 text-[12.5px] font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          Their page
          <ChevronRight size={14} aria-hidden />
        </Link>
      </div>

      <div className={`mt-3 ${SHEET}`}>
        {empty ? (
          // A day off is a normal day, not a failure to do something.
          <p className="px-5 py-5 text-[14px] text-[var(--muted)]">Nothing scheduled today.</p>
        ) : (
          <motion.ul initial="hidden" animate="visible" variants={staggerContainer(Boolean(reduceMotion))}>
            {day.tasks.map((task) => {
              const key = `${task.childId}:${task.subject}`;
              return (
                <TaskRow
                  key={key}
                  task={task}
                  busy={pendingKey === key}
                  onDone={() => onDone(task)}
                  onNotCompleted={() => onNotCompleted(task)}
                />
              );
            })}
            {day.recorded.map((entry) => (
              <RecordedRow
                key={`${entry.childId}:${entry.subject}`}
                entry={entry}
                fresh={`${entry.childId}:${entry.subject}` === justRecordedKey}
              />
            ))}
          </motion.ul>
        )}
        {day.tasks.length === 0 && day.recorded.length > 0 && (
          <p className="border-t border-[var(--border)] px-5 py-3 text-[13px] text-[var(--muted)]">That is everything for today.</p>
        )}
      </div>

      {asking && asking.childId === day.child.id && (
        <FollowUp task={asking} onPick={(value) => onDifficulty(asking, value)} onSkip={onSkipAsking} />
      )}
    </section>
  );
}

export function TodayDays({
  view,
  childHref,
  pendingKey,
  asking,
  justRecordedKey,
  onDone,
  onNotCompleted,
  onDifficulty,
  onSkipAsking,
}: {
  view: TodayView;
  childHref: (childId: string) => string;
  pendingKey: string | null;
  asking: TodayTask | null;
  justRecordedKey: string | null;
  onDone: (task: TodayTask) => void;
  onNotCompleted: (task: TodayTask) => void;
  onDifficulty: (task: TodayTask, value: Difficulty) => void;
  onSkipAsking: () => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {view.days.map((day) => (
        <ChildSheet
          key={day.child.id}
          day={day}
          href={childHref(day.child.id)}
          pendingKey={pendingKey}
          asking={asking}
          justRecordedKey={justRecordedKey}
          onDone={onDone}
          onNotCompleted={onNotCompleted}
          onDifficulty={onDifficulty}
          onSkipAsking={onSkipAsking}
        />
      ))}
    </div>
  );
}
