"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import Tabs, { TabPanel } from "@/design-system/Tabs";
import { ArrowLeft, Archive, RotateCcw, Wrench, WarningCircle, User, Plus, LinkSimple, Home } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../../setupStateData";
import { listThings, updateThing, archiveThing } from "../../domain/things";
import { listMaintenanceTasks, createMaintenanceTask, markMaintenanceTaskDone } from "../../domain/maintenanceTasks";
import { listMaintenanceLog } from "../../domain/maintenanceLog";
import { listProblems } from "../../domain/problems";
import { listServiceProviders } from "../../domain/serviceProviders";
import { listThingDocuments, createThingDocument } from "../../domain/thingDocuments";
import { THING_TYPE_BY_ID } from "../../thingTypes";
import { STATUS_LABEL, STATUS_TONE } from "../shared/lifecycle";
import type { Thing, MaintenanceTask, MaintenanceLogEntry, Problem, ServiceProvider, ThingDocument } from "../../state";
import ThingFormSheet, { thingFormValuesToPatch, type ThingFormValues } from "./ThingFormSheet";
import MaintenanceTaskFormSheet, {
  maintenanceTaskFormValuesToPatch,
  type MaintenanceTaskFormValues,
} from "../maintenance/MaintenanceTaskFormSheet";
import ThingDocumentFormSheet, { thingDocumentFormValuesToPatch, type ThingDocumentFormValues } from "./ThingDocumentFormSheet";

type LoadStatus = "loading" | "ready" | "no-instance" | "not-found" | "error";

const TABS = [
  { id: "identity", label: "Identity" },
  { id: "care", label: "Care" },
  { id: "history", label: "History" },
  { id: "records", label: "Records" },
  { id: "people", label: "People" },
];

const SEVERITY_LABEL: Record<string, string> = { minor: "Minor", moderate: "Moderate", urgent: "Urgent" };

function typeLabel(type: string): string {
  return THING_TYPE_BY_ID[type]?.label ?? "Other";
}

/**
 * A Thing's own memory: identity, ongoing care, history of what's been
 * done, its documents, and who's worked on it. Everything here reads from
 * the same domain functions the flat sections already use, filtered to
 * this one Thing client-side (small per-home data volumes, same pattern
 * RecordsModule and MaintenanceModule already use).
 */
export default function ThingDetailModule() {
  const params = useParams<{ thingId: string }>();
  const thingId = params.thingId;

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [things, setThings] = useState<Thing[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [logEntries, setLogEntries] = useState<MaintenanceLogEntry[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [documents, setDocuments] = useState<ThingDocument[]>([]);
  const [activeTab, setActiveTab] = useState("identity");
  const [editOpen, setEditOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [documentFormOpen, setDocumentFormOpen] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);

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
    const [thingsResult, tasksResult, logResult, problemsResult, providersResult, documentsResult] = await Promise.all([
      listThings(found.id),
      listMaintenanceTasks(found.id),
      listMaintenanceLog(found.id),
      listProblems(found.id),
      listServiceProviders(found.id),
      listThingDocuments(found.id),
    ]);
    if (!thingsResult.ok) {
      setErrorMessage(describeResultError(thingsResult.error));
      setStatus("error");
      return;
    }
    if (!thingsResult.data.some((t) => t.id === thingId)) {
      setStatus("not-found");
      return;
    }
    setThings(thingsResult.data);
    setTasks(tasksResult.ok ? tasksResult.data : []);
    setLogEntries(logResult.ok ? logResult.data : []);
    setProblems(problemsResult.ok ? problemsResult.data : []);
    setProviders(providersResult.ok ? providersResult.data : []);
    setDocuments(documentsResult.ok ? documentsResult.data : []);
    setStatus("ready");
  }, [thingId]);

  useEffect(() => {
    load();
  }, [load]);

  const thing = useMemo(() => things.find((t) => t.id === thingId) ?? null, [things, thingId]);
  const thingTasks = useMemo(() => tasks.filter((t) => t.applianceId === thingId && t.status !== "archived"), [tasks, thingId]);
  const thingLog = useMemo(
    () => logEntries.filter((entry) => entry.applianceId === thingId).sort((a, b) => (a.performedAt < b.performedAt ? 1 : -1)),
    [logEntries, thingId]
  );
  const thingProblems = useMemo(() => problems.filter((p) => p.thingId === thingId && p.status !== "archived"), [problems, thingId]);
  const openProblems = thingProblems.filter((p) => p.resolutionStatus !== "resolved");
  const resolvedProblems = thingProblems.filter((p) => p.resolutionStatus === "resolved");
  const thingDocuments = useMemo(() => documents.filter((d) => d.thingId === thingId && d.status !== "archived"), [documents, thingId]);
  const providerById = useMemo(() => new Map(providers.map((p) => [p.id, p])), [providers]);
  const linkedProviders = useMemo(() => {
    const ids = new Set(thingProblems.map((p) => p.providerId).filter((id): id is string => Boolean(id)));
    return Array.from(ids)
      .map((id) => providerById.get(id))
      .filter((p): p is ServiceProvider => Boolean(p));
  }, [thingProblems, providerById]);

  async function handleSaveThing(values: ThingFormValues) {
    if (!thing) return { ok: false as const, message: "Thing not loaded yet." };
    const result = await updateThing(thing.id, thingFormValuesToPatch(values));
    if (!result.ok) return { ok: false as const, message: describeResultError(result.error) };
    setThings((prev) => prev.map((t) => (t.id === result.data.id ? result.data : t)));
    return { ok: true as const, thing: result.data };
  }

  async function handleToggleArchive() {
    if (!thing) return;
    setArchiving(true);
    const result = thing.status === "archived" ? await updateThing(thing.id, { status: "active" }) : await archiveThing(thing.id);
    setArchiving(false);
    if (result.ok) setThings((prev) => prev.map((t) => (t.id === result.data.id ? result.data : t)));
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

  async function handleMarkDone(task: MaintenanceTask) {
    if (!instanceId) return;
    setCompletingTaskId(task.id);
    const result = await markMaintenanceTaskDone(task, instanceId);
    setCompletingTaskId(null);
    if (result.ok) {
      setTasks((prev) => prev.map((t) => (t.id === result.data.id ? result.data : t)));
      load();
    }
  }

  async function handleSaveDocument(values: ThingDocumentFormValues): Promise<string | null> {
    if (!instanceId || !thing) return "Couldn't find your home. Try reloading the page.";
    const patch = thingDocumentFormValuesToPatch(values);
    if (typeof patch === "string") return patch;
    const result = await createThingDocument(instanceId, { ...patch, thingId: thing.id });
    if (!result.ok) return describeResultError(result.error);
    setDocuments((prev) => [...prev, result.data]);
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
        title="Couldn't load this thing"
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

  if (status === "not-found" || !thing) {
    return (
      <EmptyState
        icon={Home}
        title="This thing isn't here anymore"
        description="It may have been removed."
        action={
          <Link href="/app/products/home-management-companion/things">
            <Button size="sm" variant="secondary">
              Back to Things
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="pb-20 lg:pb-0">
      <Link
        href="/app/products/home-management-companion/things"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft size={14} aria-hidden />
        Things
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] text-[var(--muted)]">{typeLabel(thing.type)}</p>
          <h1 className="mt-1 text-xl font-semibold text-[var(--text)]">{thing.name}</h1>
          {(thing.brand || thing.model) && (
            <p className="mt-1 text-[13px] text-[var(--muted)]">{[thing.brand, thing.model].filter(Boolean).join(" ")}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {thing.status !== "active" && <Badge tone={STATUS_TONE[thing.status]}>{STATUS_LABEL[thing.status]}</Badge>}
          <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} idPrefix="thing-detail" />

        <div className="mt-5">
          <TabPanel id="identity" activeId={activeTab} idPrefix="thing-detail">
            <div className="flex flex-col gap-4">
              <Surface className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Type" value={typeLabel(thing.type)} />
                <Field label="Location" value={thing.location} />
                <Field label="Brand" value={thing.brand} />
                <Field label="Model" value={thing.model} />
                <Field label="Purchased" value={thing.purchaseDate} />
                <Field label="Installed" value={thing.installDate} />
                <Field label="Warranty expires" value={thing.warrantyExpiresAt} />
              </Surface>
              {thing.notes && (
                <Surface>
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Notes</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text)]">{thing.notes}</p>
                </Surface>
              )}
              {thing.documentLink && (
                <a
                  href={thing.documentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
                >
                  <LinkSimple size={14} aria-hidden />
                  Manual or receipt link
                </a>
              )}
              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  iconLeft={thing.status === "archived" ? <RotateCcw size={13} aria-hidden /> : <Archive size={13} aria-hidden />}
                  onClick={handleToggleArchive}
                  disabled={archiving}
                >
                  {archiving ? "Working…" : thing.status === "archived" ? "Restore this thing" : "Archive this thing"}
                </Button>
              </div>
            </div>
          </TabPanel>

          <TabPanel id="care" activeId={activeTab} idPrefix="thing-detail">
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Maintenance</p>
                  <Button size="sm" variant="ghost" iconLeft={<Plus size={13} aria-hidden />} onClick={() => setTaskFormOpen(true)}>
                    Add task
                  </Button>
                </div>
                {thingTasks.length === 0 ? (
                  <p className="mt-2 text-[13px] text-[var(--muted)]">No recurring tasks tied to this thing yet.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {thingTasks.map((task) => (
                      <li key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-3.5">
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--text)]">{task.name}</p>
                          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                            Every {task.cadenceDays} {task.cadenceDays === 1 ? "day" : "days"} ·{" "}
                            {task.lastDoneAt ? `Last done ${task.lastDoneAt}` : "Never logged"}
                          </p>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => handleMarkDone(task)} disabled={completingTaskId === task.id}>
                          {completingTaskId === task.id ? "Marking…" : "Mark done"}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Open problems</p>
                {openProblems.length === 0 ? (
                  <p className="mt-2 text-[13px] text-[var(--muted)]">Nothing currently broken here.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {openProblems.map((problem) => (
                      <li key={problem.id} className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning-soft)] p-3.5">
                        <div className="flex items-center gap-2">
                          <WarningCircle className="h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden />
                          <p className="text-[13px] font-semibold text-[var(--text)]">{problem.title}</p>
                        </div>
                        <p className="mt-1 text-[12px] text-[var(--muted)]">{SEVERITY_LABEL[problem.severity]} severity</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </TabPanel>

          <TabPanel id="history" activeId={activeTab} idPrefix="thing-detail">
            {thingLog.length === 0 && resolvedProblems.length === 0 ? (
              <EmptyState icon={Wrench} title="No history yet" description="Completed maintenance and resolved problems will show up here." />
            ) : (
              <ul className="flex flex-col gap-2">
                {thingLog.map((entry) => (
                  <li key={entry.id} className="rounded-lg border border-[var(--border)] p-3.5">
                    <p className="text-[13px] font-semibold text-[var(--text)]">{entry.description}</p>
                    <p className="mt-0.5 text-[12px] text-[var(--muted)]">{entry.performedAt}</p>
                  </li>
                ))}
                {resolvedProblems.map((problem) => (
                  <li key={problem.id} className="rounded-lg border border-[var(--border)] p-3.5">
                    <p className="text-[13px] font-semibold text-[var(--text)]">{problem.title}, resolved</p>
                    {problem.resolvedAt && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{problem.resolvedAt}</p>}
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>

          <TabPanel id="records" activeId={activeTab} idPrefix="thing-detail">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Documents</p>
              <Button size="sm" variant="ghost" iconLeft={<Plus size={13} aria-hidden />} onClick={() => setDocumentFormOpen(true)}>
                Add document
              </Button>
            </div>
            {thingDocuments.length === 0 ? (
              <p className="mt-2 text-[13px] text-[var(--muted)]">No warranty, receipt, or manual saved here yet.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {thingDocuments.map((doc) => (
                  <li key={doc.id} className="rounded-lg border border-[var(--border)] p-3.5">
                    <a
                      href={doc.documentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] font-semibold text-[var(--text)] hover:text-[var(--primary)] hover:underline"
                    >
                      {doc.label || doc.kind}
                    </a>
                    <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                      {doc.kind.charAt(0).toUpperCase() + doc.kind.slice(1)}
                      {doc.documentDate && ` · ${doc.documentDate}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>

          <TabPanel id="people" activeId={activeTab} idPrefix="thing-detail">
            {linkedProviders.length === 0 ? (
              <EmptyState icon={User} title="No service history linked yet" description="Providers who've worked on this thing show up here once a problem lists them." />
            ) : (
              <ul className="flex flex-col gap-2">
                {linkedProviders.map((provider) => (
                  <li key={provider.id} className="rounded-lg border border-[var(--border)] p-3.5">
                    <p className="text-[13px] font-semibold text-[var(--text)]">{provider.name}</p>
                    {provider.phone && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{provider.phone}</p>}
                  </li>
                ))}
              </ul>
            )}
          </TabPanel>
        </div>
      </div>

      <ThingFormSheet open={editOpen} thing={thing} instanceId={instanceId} onClose={() => setEditOpen(false)} onSave={handleSaveThing} />
      <MaintenanceTaskFormSheet
        open={taskFormOpen}
        task={null}
        things={things.filter((t) => t.status !== "archived")}
        defaultApplianceId={thing.id}
        onClose={() => setTaskFormOpen(false)}
        onSave={handleSaveTask}
      />
      <ThingDocumentFormSheet open={documentFormOpen} onClose={() => setDocumentFormOpen(false)} onSave={handleSaveDocument} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">{label}</p>
      <p className="mt-1 text-[13px] text-[var(--text)]">{value || <span className="text-[var(--faint)]">Not set</span>}</p>
    </div>
  );
}
