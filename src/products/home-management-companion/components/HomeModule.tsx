"use client";

import type { TourStep } from "@/components/platform/GuidedTour";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Home, Plus } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listHomeItems, createHomeItem } from "../domain/homeItems";
import { listMaintenanceTasks, snoozeMaintenanceTask, updateMaintenanceTask } from "../domain/maintenanceTasks";
import { listServiceProviders } from "../domain/serviceProviders";
import { listMaintenanceLog } from "../domain/maintenanceLog";
import { listProblems, snoozeProblem } from "../domain/problems";
import {
  deriveHomeState,
  HOME_BAND_LIMIT,
  type AttentionItem,
  type HomeState,
  type HomeStateInputs,
} from "../attention";
import { describeHomeHeadline, DEFAULT_SNOOZE_DAYS } from "../homeVoice";
import type { MaintenanceTask, Problem, ServiceProvider } from "../state";
import HomeView, { HomeHeader } from "./HomeView";
import HomeItemFormSheet, { homeItemFormValuesToPatch, type HomeItemFormValues } from "./home/HomeItemFormSheet";
import CareActionSheet from "./care/CareActionSheet";
import ReportProblemSheet from "./problems/ReportProblemSheet";
import ResolveProblemSheet from "./problems/ResolveProblemSheet";
import MaintenanceTaskFormSheet, {
  maintenanceTaskFormValuesToPatch,
  type MaintenanceTaskFormValues,
} from "./maintenance/MaintenanceTaskFormSheet";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * The five conditions a home can honestly be in.
 *
 * The page changes character with the house rather than swapping rows
 * inside an identical layout. The one that matters most is "settled",
 * because it is where the product spends most of its life: it has to
 * look finished rather than like a page whose content failed to load.
 */
type HomeMood = "unknown" | "settled" | "upcoming" | "todo" | "wrong";

function moodOf(home: HomeState): HomeMood {
  if (home.nothingTracked) return "unknown";
  if (home.somethingWrong.length > 0) return "wrong";
  if (home.worthTakingCareOf.length > 0) return "todo";
  if (home.comingUp.length > 0) return "upcoming";
  return "settled";
}

/**
 * A quiet home gets room; a busy one gets rhythm. Nothing needing action
 * is not a reason to leave a screen looking sparse, and eight things
 * needing action is not the moment for generous whitespace.
 */
const MOOD_LAYOUT: Record<HomeMood, { gap: string; headline: string }> = {
  unknown: { gap: "gap-8", headline: "text-[28px] sm:text-[34px]" },
  settled: { gap: "gap-9", headline: "text-[28px] sm:text-[34px]" },
  upcoming: { gap: "gap-8", headline: "text-[27px] sm:text-[32px]" },
  todo: { gap: "gap-7", headline: "text-[25px] sm:text-[29px]" },
  wrong: { gap: "gap-6", headline: "text-[25px] sm:text-[29px]" },
};

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "empty-state",
    title: "Nothing needs you yet",
    body:
      "Home only speaks up when something is genuinely due. Until you have recorded what is in your home, there is nothing honest for it to say, and it will not invent anything to fill the space.",
  },
  {
    targetId: "rail-workspace",
    title: "What needs doing, in a sentence",
    body:
      "This is the one screen that answers whether anything needs you right now. Not a dashboard to interpret: a sentence.",
  },
  {
    targetId: "rail-history",
    title: "What was already taken care of",
    body:
      "Every job you record lands here with who did it and what it cost, so the question three years from now has an answer.",
  },
];

/**
 * Home: the whole product on one surface.
 *
 * There is deliberately no separate Attention, Things or Maintenance
 * destination. Those were three screens answering one question, which
 * left the person deciding where to look before they could find out
 * whether anything needed them. Home answers it instead, in one read:
 * what is wrong, what is worth doing, what is coming, what was handled,
 * and then what is simply in the house.
 *
 * Everything above the contents list is derived (attention.ts), never
 * stored, so it can never disagree with the records underneath it.
 */
export default function HomeModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<HomeStateInputs | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showAllCare, setShowAllCare] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [actionTask, setActionTask] = useState<MaintenanceTask | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [resolvingProblem, setResolvingProblem] = useState<Problem | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [justHandledId, setJustHandledId] = useState<string | null>(null);
  const addRef = useRef<HTMLDivElement>(null);

  /** Returns the freshly fetched inputs (or null on failure) so a caller that just performed an action can derive fresh state immediately, rather than reading this render's now-stale closure over `inputs`. */
  const load = useCallback(async (): Promise<HomeStateInputs | null> => {
    setErrorMessage(null);
    const found = await findHomeManagementCompanionInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return null;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return null;
    }
    setInstanceId(found.id);
    const [itemsResult, tasksResult, problemsResult, logResult, providersResult] = await Promise.all([
      listHomeItems(found.id),
      listMaintenanceTasks(found.id),
      listProblems(found.id),
      listMaintenanceLog(found.id),
      listServiceProviders(found.id),
    ]);
    if (!itemsResult.ok) {
      setErrorMessage(describeResultError(itemsResult.error));
      setStatus("error");
      return null;
    }
    if (!tasksResult.ok) {
      setErrorMessage(describeResultError(tasksResult.error));
      setStatus("error");
      return null;
    }
    setProviders(providersResult.ok ? providersResult.data : []);
    const freshInputs: HomeStateInputs = {
      homeItems: itemsResult.data,
      maintenanceTasks: tasksResult.data,
      problems: problemsResult.ok ? problemsResult.data : [],
      recentEvents: logResult.ok ? logResult.data : [],
    };
    setInputs(freshInputs);
    setStatus("ready");
    return freshInputs;
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = useMemo(() => new Date(), []);
  const home = useMemo(() => (inputs ? deriveHomeState(inputs, now) : null), [inputs, now]);
  const tasksById = useMemo(
    () => new Map((inputs?.maintenanceTasks ?? []).map((task) => [task.id, task])),
    [inputs]
  );
  const problemsById = useMemo(
    () => new Map((inputs?.problems ?? []).map((problem) => [problem.id, problem])),
    [inputs]
  );

  async function runProblemAction(item: AttentionItem, run: (problem: Problem) => Promise<unknown>) {
    const problem = problemsById.get(item.entityId);
    if (!problem) return;
    setPendingId(item.id);
    await run(problem);
    setPendingId(null);
    await load();
  }

  async function runTaskAction(item: AttentionItem, run: (task: MaintenanceTask) => Promise<unknown>) {
    const task = tasksById.get(item.entityId);
    if (!task) return;
    setPendingId(item.id);
    await run(task);
    setPendingId(null);
    await load();
  }

  /**
   * Passed as CareActionSheet/ResolveProblemSheet's onSaved. Both sheets
   * share this one callback for either of their two outcomes ("done" or
   * "skipped", "sorted" or "booked"), but only "done"/"sorted" actually
   * write a maintenance-log entry (skipMaintenanceTask/scheduleProblem
   * do not), so the "Recently handled" list's top entry only changes on
   * a genuine completion. Comparing against the id captured before this
   * action is what tells the two apart, rather than assuming onSaved
   * always means something new landed.
   */
  async function handleActionResolved() {
    const previousTopId = home?.recentlyHandled[0]?.id;
    const fresh = await load();
    if (!fresh) return;
    const topHandled = deriveHomeState(fresh, new Date()).recentlyHandled[0];
    if (!topHandled || topHandled.id === previousTopId) return;
    setJustHandledId(topHandled.id);
    window.setTimeout(() => setJustHandledId(null), 900);
  }

  async function handleAddItem(values: HomeItemFormValues) {
    if (!instanceId) return { ok: false as const, message: "Couldn't find your home. Try reloading the page." };
    const result = await createHomeItem(instanceId, homeItemFormValuesToPatch(values));
    if (!result.ok) return { ok: false as const, message: describeResultError(result.error) };
    await load();
    return { ok: true as const, item: result.data };
  }

  async function handleSaveTask(values: MaintenanceTaskFormValues): Promise<string | null> {
    if (!editingTask) return null;
    const patch = maintenanceTaskFormValuesToPatch(values);
    if (typeof patch === "string") return patch;
    const result = await updateMaintenanceTask(editingTask.id, patch);
    if (!result.ok) return describeResultError(result.error);
    await load();
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Home}
        title="Couldn't load your home"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance" || !home || !inputs) {
    return (
      <EmptyState icon={Home} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />
    );
  }

  const activeItems = inputs.homeItems.filter((i) => i.status !== "archived");

  if (home.nothingTracked) {
    return (
      <div className="flex flex-col gap-6 pb-24 lg:pb-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <HomeHeader headline="Home Base doesn't know your home yet" />
          <Button size="sm" variant="secondary" onClick={() => setReportOpen(true)}>
            Something&apos;s wrong
          </Button>
        </div>
        <EmptyState
          icon={Home}
          title="Start anywhere"
          description="Add something in your home, and Home Base will tell you what it needs and when, so you don't have to keep track of it."
          action={
            <div ref={addRef} className="inline-flex flex-wrap justify-center gap-2">
              <Button variant="action" size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAddOpen(true)}>
                Add something
              </Button>
              <Button size="sm" variant="secondary" href="/app/products/home-management-companion/import">
                Bring in what you have
              </Button>
            </div>
          }
        />
        <HomeItemFormSheet
          open={addOpen}
          item={null}
          instanceId={instanceId}
          onClose={() => {
            setAddOpen(false);
            load();
          }}
          onSave={handleAddItem}
          triggerRef={addRef}
        />
        <ReportProblemSheet
          open={reportOpen}
          instanceId={instanceId}
          items={activeItems}
          providers={providers}
          onClose={() => setReportOpen(false)}
          onSaved={load}
        />
      </div>
    );
  }

  const care = showAllCare ? home.worthTakingCareOf : home.worthTakingCareOf.slice(0, HOME_BAND_LIMIT);
  const hiddenCare = home.worthTakingCareOf.length - care.length;
  const mood = moodOf(home);
  const layout = MOOD_LAYOUT[mood];
  // Rendered only when there is something true to say. An empty
  // paragraph still occupies a line and leaves a gap nobody asked for.
  const closingLine =
    mood === "settled" || mood === "upcoming"
      ? "Nothing needs you today."
      : home.restUnderControl > 0
        ? "Everything else is under control."
        : null;

  const actionsFor = (item: AttentionItem, tone: "warning" | "plain") => {
    if (tone === "warning") {
      return (
        <>
          <Button variant="action" size="sm" disabled={pendingId === item.id} onClick={() => setResolvingProblem(problemsById.get(item.entityId) ?? null)}>
            Take a look
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={pendingId === item.id}
            onClick={() => runProblemAction(item, (p) => snoozeProblem(p, DEFAULT_SNOOZE_DAYS))}
          >
            {pendingId === item.id ? "Snoozing…" : "Snooze"}
          </Button>
        </>
      );
    }
    if (item.kind !== "maintenanceDue" || !instanceId) return null;
    return (
      <>
        <Button variant="action" size="sm" disabled={pendingId === item.id} onClick={() => setActionTask(tasksById.get(item.entityId) ?? null)}>
          Action
        </Button>
        <Button size="sm" variant="ghost" disabled={pendingId === item.id} onClick={() => runTaskAction(item, (t) => snoozeMaintenanceTask(t, DEFAULT_SNOOZE_DAYS))}>
          {pendingId === item.id ? "Snoozing…" : "Snooze"}
        </Button>
      </>
    );
  };

  return (
    <>
      <HomeView
        home={home}
        headline={describeHomeHeadline({ wrong: home.somethingWrong.length, worthDoing: home.worthTakingCareOf.length })}
        headlineSize={layout.headline}
        gap={layout.gap}
        care={care}
        hiddenCare={hiddenCare}
        closingLine={closingLine}
        activeItems={activeItems}
        justHandledId={justHandledId}
        tour={{ steps: TOUR_STEPS }}
        actionsFor={actionsFor}
        onOpenCare={(item) => (item.kind === "maintenanceDue" ? () => setEditingTask(tasksById.get(item.entityId) ?? null) : undefined)}
        onShowAllCare={() => setShowAllCare(true)}
        onReport={() => setReportOpen(true)}
        onAdd={() => setAddOpen(true)}
        addRef={addRef}
        bandLimit={HOME_BAND_LIMIT}
      />

      {/* Closing the sheet reloads: confirming suggested care creates tasks
          inside the sheet, and Home must show them straight away rather
          than only after the person happens to navigate. */}
      <HomeItemFormSheet
        open={addOpen}
        item={null}
        instanceId={instanceId}
        onClose={() => {
          setAddOpen(false);
          load();
        }}
        onSave={handleAddItem}
        triggerRef={addRef}
      />
      <ReportProblemSheet
        open={reportOpen}
        instanceId={instanceId}
        items={activeItems}
        providers={providers}
        onClose={() => setReportOpen(false)}
        onSaved={load}
      />
      <ResolveProblemSheet
        open={resolvingProblem !== null}
        problem={resolvingProblem}
        instanceId={instanceId}
        providers={providers}
        items={activeItems}
        onClose={() => setResolvingProblem(null)}
        onSaved={handleActionResolved}
      />
      <CareActionSheet
        open={actionTask !== null}
        task={actionTask}
        instanceId={instanceId}
        providers={providers}
        onClose={() => setActionTask(null)}
        onSaved={handleActionResolved}
      />
      <MaintenanceTaskFormSheet
        open={editingTask !== null}
        task={editingTask}
        items={activeItems}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
      />
    </>
  );
}
