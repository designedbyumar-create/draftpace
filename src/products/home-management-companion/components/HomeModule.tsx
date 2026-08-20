"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Home, Plus, ChevronRight, CheckCircle2, WarningCircle, Clock } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listHomeItems, createHomeItem } from "../domain/homeItems";
import { listMaintenanceTasks, snoozeMaintenanceTask, updateMaintenanceTask } from "../domain/maintenanceTasks";
import { listServiceProviders } from "../domain/serviceProviders";
import { listMaintenanceLog } from "../domain/maintenanceLog";
import { listProblems, snoozeProblem } from "../domain/problems";
import {
  deriveHomeState,
  itemHref,
  HOME_BAND_LIMIT,
  type AttentionItem,
  type HomeState,
  type HomeStateInputs,
} from "../attention";
import { describeHomeHeadline, DEFAULT_SNOOZE_DAYS } from "../homeVoice";
import { HOME_ITEM_TYPE_BY_ID } from "../homeKnowledge";
import CategoryIcon from "./shared/CategoryIcon";
import type { HomeItem, MaintenanceTask, Problem, ServiceProvider } from "../state";
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
  const addRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setErrorMessage(null);
    const found = await findHomeManagementCompanionInstanceId();
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
      return;
    }
    if (!tasksResult.ok) {
      setErrorMessage(describeResultError(tasksResult.error));
      setStatus("error");
      return;
    }
    setProviders(providersResult.ok ? providersResult.data : []);
    setInputs({
      homeItems: itemsResult.data,
      maintenanceTasks: tasksResult.data,
      problems: problemsResult.ok ? problemsResult.data : [],
      recentEvents: logResult.ok ? logResult.data : [],
    });
    setStatus("ready");
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
    return <EmptyState icon={Home} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const activeItems = inputs.homeItems.filter((i) => i.status !== "archived");

  if (home.nothingTracked) {
    return (
      <div className="flex flex-col gap-6 pb-24 lg:pb-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Header headline="Home Base doesn't know your home yet" />
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
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAddOpen(true)}>
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

  return (
    <div className={`flex flex-col ${layout.gap} pb-24 lg:pb-0`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Header
          headline={describeHomeHeadline({ wrong: home.somethingWrong.length, worthDoing: home.worthTakingCareOf.length })}
          size={layout.headline}
        />
        <Button size="sm" variant="secondary" onClick={() => setReportOpen(true)}>
          Something&apos;s wrong
        </Button>
      </div>

      {home.somethingWrong.length > 0 && (
        <Band label="Something's wrong">
          {home.somethingWrong.map((item) => (
            <Row
              key={item.id}
              item={item}
              tone="warning"
              actions={
                <>
                  <Button size="sm" disabled={pendingId === item.id} onClick={() => setResolvingProblem(problemsById.get(item.entityId) ?? null)}>
                    Take a look
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={pendingId === item.id}
                    onClick={() => runProblemAction(item, (p) => snoozeProblem(p, DEFAULT_SNOOZE_DAYS))}
                  >
                    {pendingId === item.id ? "Snoozing…" : "Snooze"}
                  </Button>
                </>
              }
            />
          ))}
        </Band>
      )}

      {care.length > 0 && (
        <Band label="Worth taking care of">
          {care.map((item) => (
            <Row
              key={item.id}
              item={item}
              onOpen={item.kind === "maintenanceDue" ? () => setEditingTask(tasksById.get(item.entityId) ?? null) : undefined}
              actions={
                item.kind === "maintenanceDue" && instanceId ? (
                  <>
                    <Button size="sm" disabled={pendingId === item.id} onClick={() => setActionTask(tasksById.get(item.entityId) ?? null)}>
                      Action
                    </Button>
                    <Button size="sm" variant="secondary" disabled={pendingId === item.id} onClick={() => runTaskAction(item, (t) => snoozeMaintenanceTask(t, DEFAULT_SNOOZE_DAYS))}>
                      {pendingId === item.id ? "Snoozing…" : "Snooze"}
                    </Button>
                  </>
                ) : null
              }
            />
          ))}
          {hiddenCare > 0 && (
            <button type="button" onClick={() => setShowAllCare(true)} className="self-start text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
              {hiddenCare} more, when you get to {hiddenCare === 1 ? "it" : "them"}
            </button>
          )}
        </Band>
      )}

      {home.comingUp.length > 0 && (
        <Band label="Coming up">
          {home.comingUp.slice(0, HOME_BAND_LIMIT).map((item) => (
            <PlainRow key={item.id} title={item.title} detail={item.detail} href={item.href} icon={<Clock className="h-4 w-4 shrink-0 text-[var(--faint)]" aria-hidden />} />
          ))}
        </Band>
      )}

      {home.recentlyHandled.length > 0 && (
        <Band label="Recently handled">
          {home.recentlyHandled.slice(0, 3).map((entry) => (
            <PlainRow
              key={entry.id}
              title={entry.title}
              detail={entry.when}
              href={null}
              icon={<CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden />}
            />
          ))}
        </Band>
      )}

      {/* Deliberately not a green box with a tick. A settled home is the
          normal state, not an achievement, and congratulating somebody for
          it is the first step toward keeping score. Just a plain sentence,
          in the product's own voice. */}
      {closingLine && (
        <p
          className="text-[15px] leading-relaxed text-[var(--muted)]"
          style={{ fontFamily: "var(--product-narrative-font)" }}
        >
          {closingLine}
        </p>
      )}

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">In your home</p>
          <div ref={addRef} className="hidden lg:block">
            <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAddOpen(true)}>
              Add something
            </Button>
          </div>
        </div>
        {activeItems.length === 0 ? (
          <p className="mt-2 text-[13px] text-[var(--muted)]">Nothing in your home yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {activeItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={itemHref(item.id)}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-colors duration-[var(--dur)] ease-[var(--ease-out)] hover:border-[var(--primary)]"
                >
                  <CategoryIcon type={item.type} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[var(--text)]">{item.name}</p>
                    <p className="mt-0.5 text-[12px] text-[var(--muted)]">{describeItem(item)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--faint)]" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)]/96 px-4 pt-3 backdrop-blur lg:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
      >
        <Button fullWidth iconLeft={<Plus size={15} aria-hidden />} onClick={() => setAddOpen(true)}>
          Add something
        </Button>
      </div>

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
        onClose={() => setReportOpen(false)}
        onSaved={load}
      />
      <ResolveProblemSheet
        open={resolvingProblem !== null}
        problem={resolvingProblem}
        instanceId={instanceId}
        providers={providers}
        onClose={() => setResolvingProblem(null)}
        onSaved={load}
      />
      <CareActionSheet
        open={actionTask !== null}
        task={actionTask}
        instanceId={instanceId}
        providers={providers}
        onClose={() => setActionTask(null)}
        onSaved={load}
      />
      <MaintenanceTaskFormSheet
        open={editingTask !== null}
        task={editingTask}
        items={activeItems}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
      />
    </div>
  );
}

function describeItem(item: HomeItem): string {
  const type = HOME_ITEM_TYPE_BY_ID[item.type]?.label;
  return [type, item.brand, item.location].filter(Boolean).join(" · ") || "In your home";
}

/**
 * The one place the product speaks rather than reports. Set in the
 * product's narrative face at a size that reads as a sentence, because
 * the same words at label size read as a heading and the difference is
 * the whole point.
 */
function Header({ headline, size = "text-[26px] sm:text-[30px]" }: { headline: string; size?: string }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)]">Your home</p>
      <h1
        className={`mt-1.5 font-medium leading-[1.15] tracking-[-0.01em] text-[var(--text)] ${size}`}
        style={{ fontFamily: "var(--product-narrative-font)", textWrap: "balance" }}
      >
        {headline}
      </h1>
    </div>
  );
}

function Band({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">{label}</p>
      <div className="mt-2 flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Row({
  item,
  actions,
  onOpen,
  tone = "plain",
}: {
  item: AttentionItem;
  actions?: React.ReactNode;
  onOpen?: () => void;
  tone?: "plain" | "warning";
}) {
  const body = (
    <>
      <p className="text-[14px] font-semibold text-[var(--text)]">{item.title}</p>
      <p className="mt-0.5 text-[12px] text-[var(--muted)]">{item.detail}</p>
    </>
  );
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === "warning" ? "border-[var(--warning)]/30 bg-[var(--warning-soft)]" : "border-[var(--border)] bg-[var(--surface)]"
      }`}
    >
      <div className="flex items-start gap-3">
        {tone === "warning" && <WarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden />}
        <div className="min-w-0 flex-1">
          {item.href ? (
            <Link href={item.href} className="block">
              {body}
            </Link>
          ) : onOpen ? (
            <button type="button" onClick={onOpen} className="block w-full text-left">
              {body}
            </button>
          ) : (
            body
          )}
        </div>
      </div>
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

function PlainRow({ title, detail, href, icon }: { title: string; detail: string; href: string | null; icon: React.ReactNode }) {
  const body = (
    <div className="flex items-start gap-3">
      {icon}
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-0.5 text-[12px] text-[var(--muted)]">{detail}</p>
      </div>
    </div>
  );
  const className = "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5";
  if (!href) return <div className={className}>{body}</div>;
  return (
    <Link href={href} className={`${className} block transition hover:border-[var(--primary)]`}>
      {body}
    </Link>
  );
}
