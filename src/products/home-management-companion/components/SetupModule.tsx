"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { ArrowLeft, ArrowRight, Check, Home, Plus } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId, markHomeManagementCompanionSetupComplete } from "../setupStateData";
import { listHomeItems, createHomeItem } from "../domain/homeItems";
import { listMaintenanceTasks, createMaintenanceTask } from "../domain/maintenanceTasks";
import type { HomeItem, MaintenanceTask } from "../state";
import ThingFormSheet, { thingFormValuesToPatch, type ThingFormValues } from "./things/ThingFormSheet";
import MaintenanceTaskFormSheet, {
  maintenanceTaskFormValuesToPatch,
  type MaintenanceTaskFormValues,
} from "./maintenance/MaintenanceTaskFormSheet";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const STEPS = [
  { step: 1, title: "Welcome to Home Base", short: "Welcome" },
  { step: 2, title: "What's in your home?", short: "Your home" },
  { step: 3, title: "Add a maintenance task", short: "Maintenance" },
] as const;

/**
 * A plain multi-step form, not PFC's adaptive Companion orchestrator.
 * Every step writes directly through the same domain functions
 * Appliances/Maintenance's own direct sections use, so there is no second
 * "setup copy" of this data anywhere, same single-source-of-truth rule
 * PFC's Companion follows, just without the conversational engine on top.
 */
export default function SetupModule() {
  const router = useRouter();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [things, setThings] = useState<HomeItem[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [thingFormOpen, setThingFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const addThingRef = useRef<HTMLDivElement>(null);
  const addTaskRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setStatus("loading");
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
    const [thingsResult, tasksResult] = await Promise.all([listHomeItems(found.id), listMaintenanceTasks(found.id)]);
    setThings(thingsResult.ok ? thingsResult.data.filter((t) => t.status !== "archived") : []);
    setTasks(tasksResult.ok ? tasksResult.data.filter((t) => t.status !== "archived") : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveThing(values: ThingFormValues) {
    if (!instanceId) return { ok: false as const, message: "Couldn't find your home. Try reloading the page." };
    const result = await createHomeItem(instanceId, thingFormValuesToPatch(values));
    if (!result.ok) return { ok: false as const, message: describeResultError(result.error) };
    setThings((prev) => [...prev, result.data]);
    return { ok: true as const, thing: result.data };
  }

  async function handleSaveTask(values: MaintenanceTaskFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your home. Try reloading the page.";
    const patch = maintenanceTaskFormValuesToPatch(values);
    if (typeof patch === "string") return patch;
    const result = await createMaintenanceTask(instanceId, patch);
    if (!result.ok) return describeResultError(result.error);
    setTasks((prev) => [...prev, result.data]);
    return null;
  }

  async function handleFinish() {
    if (!instanceId) return;
    setFinishing(true);
    const result = await markHomeManagementCompanionSetupComplete(instanceId);
    setFinishing(false);
    if (!result.ok) {
      setErrorMessage(result.message ?? "Couldn't finish setup. Try again.");
      return;
    }
    router.push("/app/products/home-management-companion/workspace");
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading setup…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Home}
        title="Couldn't load setup"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance") {
    return <EmptyState icon={Home} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
          Step {currentStep} of {STEPS.length}
        </p>
      </div>

      <div className="mb-6 hidden gap-1.5 sm:flex">
        {STEPS.map((item) => (
          <button
            key={item.step}
            type="button"
            onClick={() => setCurrentStep(item.step)}
            className={`flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
              currentStep === item.step
                ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                : "border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--muted)]">
              {currentStep > item.step ? <Check size={11} aria-hidden /> : item.step}
            </span>
            <span className="truncate text-[11px] font-semibold text-[var(--text)]">{item.short}</span>
          </button>
        ))}
      </div>

      <div className="mb-6 sm:hidden">
        <div className="flex gap-1">
          {STEPS.map((item) => (
            <div
              key={item.step}
              className={`h-1.5 flex-1 rounded-full ${
                currentStep === item.step ? "bg-[var(--primary)]" : currentStep > item.step ? "bg-[var(--primary)]/40" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
        <p className="mt-2.5 text-[13px] font-semibold text-[var(--text)]">
          Step {currentStep} of {STEPS.length} · {STEPS[currentStep - 1].short}
        </p>
      </div>

      <Surface className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--text)]">{STEPS[currentStep - 1].title}</h2>

        <div className="pb-6 sm:pb-0">
          {currentStep === 1 && (
            <div className="mt-5 flex flex-col gap-3">
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                Tell Home Base what's in your home. From there it tells
                you what&apos;s actually due, and nothing else, until it&apos;s due.
              </p>
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                Everything here is optional and editable later. Add as much or as little as you want right now.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="mt-5">
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                Add a few of the things in your home, with a warranty date if you have one.
              </p>
              {things.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2">
                  {things.map((thing) => (
                    <li key={thing.id} className="rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--text)]">
                      {thing.name}
                    </li>
                  ))}
                </ul>
              )}
              <div ref={addThingRef} className="mt-4 inline-block">
                <Button variant="secondary" size="sm" iconLeft={<Plus size={13} aria-hidden />} onClick={() => setThingFormOpen(true)}>
                  Add something
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="mt-5">
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                Add one repeating task, like changing a filter, and how often it needs doing.
              </p>
              {tasks.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2">
                  {tasks.map((task) => (
                    <li key={task.id} className="rounded-lg border border-[var(--border)] px-3.5 py-2.5 text-[13px] font-semibold text-[var(--text)]">
                      {task.name} · every {task.cadenceDays} days
                    </li>
                  ))}
                </ul>
              )}
              <div ref={addTaskRef} className="mt-4 inline-block">
                <Button variant="secondary" size="sm" iconLeft={<Plus size={13} aria-hidden />} onClick={() => setTaskFormOpen(true)}>
                  Add task
                </Button>
              </div>
            </div>
          )}

          {errorMessage && <p className="mt-4 text-[13px] text-[var(--danger)]">{errorMessage}</p>}
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-[var(--border)] pt-5">
          <Button variant="secondary" disabled={currentStep === 1} iconLeft={<ArrowLeft size={14} aria-hidden />} onClick={() => setCurrentStep((s) => s - 1)}>
            Back
          </Button>
          {currentStep < STEPS.length ? (
            <Button iconRight={<ArrowRight size={14} aria-hidden />} onClick={() => setCurrentStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button iconRight={<Check size={14} aria-hidden />} onClick={handleFinish} disabled={finishing}>
              {finishing ? "Finishing…" : "Finish setup"}
            </Button>
          )}
        </div>
      </Surface>

      <ThingFormSheet
        open={thingFormOpen}
        thing={null}
        instanceId={instanceId}
        onClose={() => setThingFormOpen(false)}
        onSave={handleSaveThing}
        triggerRef={addThingRef}
      />
      <MaintenanceTaskFormSheet
        open={taskFormOpen}
        task={null}
        things={things}
        onClose={() => setTaskFormOpen(false)}
        onSave={handleSaveTask}
        triggerRef={addTaskRef}
      />
    </div>
  );
}
