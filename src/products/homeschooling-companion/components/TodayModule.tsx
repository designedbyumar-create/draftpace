"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { CalendarCheck, Check } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { staggerContainer, staggerItem, settleVariant } from "@/design-system/motion";
import { findHomeschoolInstanceId, HOMESCHOOLING_COMPANION_SLUG } from "../instanceData";
import {
  loadChildren,
  loadCurricula,
  loadPlan,
  loadPositions,
  loadTaskEvents,
  recordWork,
} from "../domain/learningData";
import { dateKey, deriveToday, describeTask, type TaskEvent, type TodayTask } from "../today";
import { SOURCE_LABEL, type Child, type Curriculum, type PlanEntry, type Position } from "../learning";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Today. The one surface where the children meet, because "what are we
 * doing today" is the only household question this product has.
 *
 * Grouped by child and never interleaved: a parent should not have to
 * work out whose maths this is.
 *
 * Recording is one tap. The follow-up underneath it is optional, always
 * skippable, and the product is complete without it. Most parents will
 * only ever tap Done, and turning a homeschool into data entry is how
 * this category loses people.
 */
export default function TodayModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [plan, setPlan] = useState<PlanEntry[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  /** The task just recorded, offered a follow-up. Cleared on the next action. */
  const [asking, setAsking] = useState<TodayTask | null>(null);
  /** The subject just marked done, so its line gets the one-time settle beat rather than every visit replaying it. */
  const [justRecordedKey, setJustRecordedKey] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    const found = await findHomeschoolInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    setInstanceId(found.id);
    const [childrenResult, planResult, curriculaResult, positionsResult, eventsResult] = await Promise.all([
      loadChildren(found.id),
      loadPlan(found.id),
      loadCurricula(found.id),
      loadPositions(found.id),
      loadTaskEvents(found.id),
    ]);
    if (!childrenResult.ok) {
      setErrorMessage(describeResultError(childrenResult.error));
      setStatus("error");
      return;
    }
    setChildren(childrenResult.data);
    setPlan(planResult.ok ? planResult.data : []);
    setCurricula(curriculaResult.ok ? curriculaResult.data : []);
    setPositions(positionsResult.ok ? positionsResult.data : []);
    setEvents(eventsResult.ok ? eventsResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = new Date();
  const today = dateKey(now);

  async function record(
    task: TodayTask,
    state: "done" | "not-completed",
    extra: { difficulty?: TaskEvent["difficulty"]; helpNeeded?: TaskEvent["helpNeeded"] } = {}
  ) {
    if (!instanceId) return;
    const key = `${task.childId}:${task.subject}`;
    setPending(key);
    setErrorMessage(null);
    const result = await recordWork(instanceId, {
      childId: task.childId,
      subject: task.subject,
      onDate: today,
      state,
      curriculumId: task.curriculumId,
      positionLabel: task.positionLabel,
      source: task.source,
      ...extra,
    });
    setPending(null);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    const refreshed = await loadTaskEvents(instanceId);
    if (refreshed.ok) setEvents(refreshed.data);
    // Offered once, after the tap that recorded the work. Answering it
    // is another write through this same function, and without the
    // second condition that write reopened the panel it had just
    // closed, leaving the parent unable to dismiss it at all.
    setAsking(state === "done" && extra.difficulty === undefined ? task : null);
    // The settle beat marks genuine completion only, never "did not get
    // to it": that outcome is not a smaller version of done.
    setJustRecordedKey(state === "done" ? key : null);
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={CalendarCheck} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={CalendarCheck} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const view = deriveToday({ children, plan, curricula, positions, events }, now);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Today</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {children.length === 0
            ? "Nobody added yet."
            : view.nothingPlanned
              ? "Nothing planned yet."
              : view.nothingOutstanding
                ? "Nothing left for today."
                : "What we are doing today."}
        </h1>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      {children.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Start with a child"
          description="Everything in this product belongs to a child, so today has nobody to be about yet."
        />
      ) : view.nothingPlanned ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            No subjects are set up yet, so there is nothing to put here. You can add some on a child&rsquo;s page, and
            you can also just record what you did without any plan at all.
          </p>
          <div className="mt-4">
            <Button size="sm" href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids`}>
              Go to your children
            </Button>
          </div>
        </div>
      ) : (
        view.days.map((day) => (
          <section key={day.child.id} aria-label={`Today for ${day.child.name}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2
                className="text-[18px] text-[var(--text)]"
                style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
              >
                {day.child.name}
              </h2>
              <Link
                href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids/${day.child.id}`}
                className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
              >
                Their page
              </Link>
            </div>

            {day.tasks.length === 0 ? (
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                {/* A day off is a normal day, and neither of these is a
                    failure to do something. */}
                {day.recorded.length > 0
                  ? "That is everything for today."
                  : day.restDay
                    ? "Nothing scheduled today."
                    : "Nothing scheduled today."}
              </p>
            ) : (
              <motion.div
                className="mt-2 flex flex-col gap-2.5"
                initial="hidden"
                animate="visible"
                variants={staggerContainer(Boolean(reduceMotion))}
              >
                {day.tasks.map((task) => {
                  const key = `${task.childId}:${task.subject}`;
                  const busy = pending === key;
                  return (
                    <motion.div
                      key={key}
                      variants={staggerItem(Boolean(reduceMotion))}
                      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="text-[15px] font-semibold text-[var(--text)]">{task.subject}</h3>
                        {/* Where it came from, on every task, every time. */}
                        <span className="text-[11px] font-semibold text-[var(--primary)]">
                          {SOURCE_LABEL[task.source]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[13px] text-[var(--muted)]">{describeTask(task)}</p>
                      {task.reason && (
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
                          Worth going over again. {task.reason}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" disabled={busy} onClick={() => record(task, "done")}>
                          {busy ? "Saving..." : "Done"}
                        </Button>
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => record(task, "not-completed")}>
                          Did not get to it
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {day.recorded.length > 0 && (
              <ul className="mt-2.5 flex flex-col gap-1">
                {day.recorded.map((entry) => {
                  const line = (
                    <>
                      <Check size={14} aria-hidden className="shrink-0 text-[var(--primary)]" />
                      {entry.subject}
                      {entry.state === "not-completed" && <span className="text-[var(--faint)]">, not finished</span>}
                    </>
                  );
                  const key = `${entry.childId}:${entry.subject}`;
                  if (key !== justRecordedKey) {
                    return (
                      <li key={entry.subject} className="flex items-center gap-2 text-[12.5px] text-[var(--muted)]">
                        {line}
                      </li>
                    );
                  }
                  return (
                    <motion.li
                      key={entry.subject}
                      initial="hidden"
                      animate="visible"
                      variants={settleVariant(Boolean(reduceMotion))}
                      className="flex items-center gap-2 text-[12.5px] text-[var(--muted)]"
                    >
                      {line}
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </section>
        ))
      )}

      {asking && (
        <div
          role="status"
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          style={{ borderLeftWidth: 3, borderLeftColor: "var(--primary)" }}
        >
          {/* The subject exactly as the parent typed it. Lowercasing turned
              "Maths with Nana" into "maths with nana". */}
          <p className="text-[14px] text-[var(--text)]">How did {asking.subject} go?</p>
          <p className="mt-0.5 text-[12px] text-[var(--faint)]">
            Only if it is worth saying. It changes what comes next, and skipping it changes nothing.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["easy", "Easy"],
                ["about-right", "About right"],
                ["difficult", "Difficult"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant="secondary"
                onClick={() => {
                  const task = asking;
                  setAsking(null);
                  record(task, "done", { difficulty: value });
                }}
              >
                {label}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setAsking(null)}>
              Skip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
