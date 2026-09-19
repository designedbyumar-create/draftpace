"use client";

import FirstRunTour from "@/components/platform/FirstRunTour";
import type { TourStep } from "@/components/platform/GuidedTour";
import { useCallback, useEffect, useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { CalendarCheck } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeschoolInstanceId, HOMESCHOOLING_COMPANION_SLUG } from "../instanceData";
import {
  loadChildren,
  loadCurricula,
  loadPlan,
  loadPositions,
  loadTaskEvents,
  recordWork,
} from "../domain/learningData";
import { dateKey, deriveToday, type TaskEvent, type TodayTask } from "../today";
import type { Child, Curriculum, PlanEntry, Position } from "../learning";
import { TodayDays, TodayHeader } from "./TodayView";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "empty-state",
    title: "Today starts empty on purpose",
    body:
      "Nothing is planned until you add a child and say what they are learning. This screen never invents a curriculum for you.",
  },
  {
    targetId: "rail-kids",
    title: "Start by adding a child",
    body:
      "Each child gets their own subjects and their own plan. You decide what they learn; this only keeps track of it.",
  },
  {
    targetId: "rail-workspace",
    title: "One page each morning",
    body:
      "Today shows what this day looks like per child, and says nothing at all on the days you are not schooling.",
  },
  {
    targetId: "rail-record",
    title: "The record you could hand to somebody",
    body:
      "What you actually did, dated as it happened, ready to print per child if your state ever asks.",
  },
];

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
    return (
      <EmptyState icon={CalendarCheck} title="Nothing to show yet" description="This product has not been set up on your account." />
    );
  }
  if (status === "error") {
    return (
      <EmptyState icon={CalendarCheck} title="Couldn't load this" description={errorMessage ?? "Try again."} />
    );
  }

  const view = deriveToday({ children, plan, curricula, positions, events }, now);

  return (
    <div className="flex flex-col gap-6">
      <FirstRunTour slug={HOMESCHOOLING_COMPANION_SLUG} steps={TOUR_STEPS} />
      <TodayHeader
        heading={
          children.length === 0
            ? "Nobody added yet."
            : view.nothingPlanned
              ? "Nothing planned yet."
              : view.nothingOutstanding
                ? "Nothing left for today."
                : "What we are doing today."
        }
        dateLabel={now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      />

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
          // The instruction named a destination and then left somebody to
          // find it. A first screen that says what to do next should be
          // the thing that takes you there.
          action={
            <Button href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids`} variant="commit" size="sm">
              Add your first child
            </Button>
          }
        />
      ) : view.nothingPlanned ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            No subjects are set up yet, so there is nothing to put here. You can add some on a child&rsquo;s page, and
            you can also just record what you did without any plan at all.
          </p>
          <div className="mt-4">
            <Button variant="action" size="sm" href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids`}>
              Go to your children
            </Button>
          </div>
        </div>
      ) : (
        <TodayDays
          view={view}
          childHref={(childId) => `/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids/${childId}`}
          pendingKey={pending}
          asking={asking}
          justRecordedKey={justRecordedKey}
          onDone={(task) => record(task, "done")}
          onNotCompleted={(task) => record(task, "not-completed")}
          onDifficulty={(task, value) => {
            setAsking(null);
            record(task, "done", { difficulty: value });
          }}
          onSkipAsking={() => setAsking(null)}
        />
      )}
    </div>
  );
}
