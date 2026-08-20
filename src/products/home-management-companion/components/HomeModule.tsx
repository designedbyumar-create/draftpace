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
import { listProblems } from "../domain/problems";
import { deriveHomeState, itemHref, HOME_BAND_LIMIT, type AttentionItem, type HomeStateInputs } from "../attention";
import { describeHomeHeadline, DEFAULT_SNOOZE_DAYS } from "../homeVoice";
import { HOME_ITEM_TYPE_BY_ID } from "../homeKnowledge";
import type { HomeItem, MaintenanceTask, ServiceProvider } from "../state";
import ThingFormSheet, { thingFormValuesToPatch, type ThingFormValues } from "./things/ThingFormSheet";
import CareActionSheet from "./care/CareActionSheet";
import MaintenanceTaskFormSheet, {
  maintenanceTaskFormValuesToPatch,
  type MaintenanceTaskFormValues,
} from "./maintenance/MaintenanceTaskFormSheet";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

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

  async function runTaskAction(item: AttentionItem, run: (task: MaintenanceTask) => Promise<unknown>) {
    const task = tasksById.get(item.entityId);
    if (!task) return;
    setPendingId(item.id);
    await run(task);
    setPendingId(null);
    await load();
  }

  async function handleAddItem(values: ThingFormValues) {
    if (!instanceId) return { ok: false as const, message: "Couldn't find your home. Try reloading the page." };
    const result = await createHomeItem(instanceId, thingFormValuesToPatch(values));
    if (!result.ok) return { ok: false as const, message: describeResultError(result.error) };
    await load();
    return { ok: true as const, thing: result.data };
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
        <Header headline="Home Base doesn't know your home yet" />
        <EmptyState
          icon={Home}
          title="Start with one thing"
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
        <ThingFormSheet
          open={addOpen}
          thing={null}
          instanceId={instanceId}
          onClose={() => {
            setAddOpen(false);
            load();
          }}
          onSave={handleAddItem}
          triggerRef={addRef}
        />
      </div>
    );
  }

  const care = showAllCare ? home.worthTakingCareOf : home.worthTakingCareOf.slice(0, HOME_BAND_LIMIT);
  const hiddenCare = home.worthTakingCareOf.length - care.length;

  return (
    <div className="flex flex-col gap-7 pb-24 lg:pb-0">
      <Header headline={describeHomeHeadline({ wrong: home.somethingWrong.length, worthDoing: home.worthTakingCareOf.length })} />

      {home.somethingWrong.length > 0 && (
        <Band label="Something's wrong">
          {home.somethingWrong.map((item) => (
            <Row key={item.id} item={item} tone="warning" />
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

      {home.somethingWrong.length === 0 && home.worthTakingCareOf.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--success-soft)] p-3.5">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden />
          <p className="text-[13px] font-medium text-[var(--text)]">Nothing needs you today.</p>
        </div>
      ) : (
        home.restUnderControl > 0 && <p className="text-[13px] text-[var(--muted)]">Everything else is under control.</p>
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
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition hover:border-[var(--primary)]"
                >
                  <div className="min-w-0">
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
      <ThingFormSheet
        open={addOpen}
        thing={null}
        instanceId={instanceId}
        onClose={() => {
          setAddOpen(false);
          load();
        }}
        onSave={handleAddItem}
        triggerRef={addRef}
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
        things={activeItems}
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

function Header({ headline }: { headline: string }) {
  return (
    <div>
      <p className="text-[13px] text-[var(--muted)]">Your home</p>
      <h1 className="mt-1 text-xl font-semibold text-[var(--text)]">{headline}</h1>
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
