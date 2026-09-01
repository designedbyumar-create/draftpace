"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import Tabs, { TabPanel } from "@/design-system/Tabs";
import { ArrowLeft, Archive, RotateCcw, WarningCircle, Plus, LinkSimple, Home } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../../setupStateData";
import { listHomeItems, updateHomeItem, archiveHomeItem } from "../../domain/homeItems";
import { listMaintenanceTasks, createMaintenanceTask } from "../../domain/maintenanceTasks";
import { listMaintenanceLog } from "../../domain/maintenanceLog";
import { listProblems } from "../../domain/problems";
import { listServiceProviders } from "../../domain/serviceProviders";
import { listHomeItemDocuments, createHomeItemDocument } from "../../domain/homeItemDocuments";
import { HOME_ITEM_TYPE_BY_ID } from "../../homeKnowledge";
import { STATUS_LABEL, STATUS_TONE } from "../shared/lifecycle";
import CategoryIcon from "../shared/CategoryIcon";
import type { HomeItem, MaintenanceTask, MaintenanceLogEntry, Problem, ServiceProvider, HomeItemDocument } from "../../state";
import HomeItemFormSheet, { homeItemFormValuesToPatch, type HomeItemFormValues } from "./HomeItemFormSheet";
import MaintenanceTaskFormSheet, {
  maintenanceTaskFormValuesToPatch,
  type MaintenanceTaskFormValues,
} from "../maintenance/MaintenanceTaskFormSheet";
import HomeItemDocumentFormSheet, { homeItemDocumentFormValuesToPatch, type HomeItemDocumentFormValues } from "./HomeItemDocumentFormSheet";
import CareActionSheet, { HOME_BASE_CURRENCY } from "../care/CareActionSheet";
import { formatCurrency } from "@/lib/currency";
import { describeElapsed, daysBetween, describeCareStatus, describeSeasonalCareStatus } from "../../homeVoice";
import { findCareTemplate, findCareTemplateByTaskName, categoryOfType, identityFieldsFor, type HomeItemIdentityField } from "../../homeKnowledge";
import ReportProblemSheet from "../problems/ReportProblemSheet";
import ResolveProblemSheet from "../problems/ResolveProblemSheet";

type LoadStatus = "loading" | "ready" | "no-instance" | "not-found" | "error";

/**
 * Every tab this surface can show. Which of them actually appear is
 * decided per item: a tab with nothing behind it is a promise of
 * content that is not there, and five of those on a newly added fridge
 * makes the product feel emptier than showing one honest panel would.
 *
 * Identity and Care always appear, because both are always actionable
 * even when blank. The rest earn their place by having something in
 * them.
 */
const ALL_TABS = [
  { id: "identity", label: "Identity" },
  { id: "care", label: "Care" },
  { id: "history", label: "History" },
  { id: "records", label: "Records" },
  { id: "people", label: "People" },
] as const;

const SEVERITY_LABEL: Record<string, string> = { minor: "Minor", moderate: "Moderate", urgent: "Urgent" };

function typeLabel(type: string): string {
  return HOME_ITEM_TYPE_BY_ID[type]?.label ?? "Other";
}

/**
 * One item's own memory: identity, ongoing care, history of what has been
 * done, its documents, and who has worked on it. Everything here reads
 * from the same domain functions Home uses, filtered to this one item
 * client-side (small per-home data volumes, the same pattern Home
 * already uses).
 */
export default function HomeItemDetailModule() {
  const params = useParams<{ itemId: string }>();
  const itemId = params.itemId;

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [items, setItems] = useState<HomeItem[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [logEntries, setLogEntries] = useState<MaintenanceLogEntry[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [documents, setDocuments] = useState<HomeItemDocument[]>([]);
  const [activeTab, setActiveTab] = useState("identity");
  const [editOpen, setEditOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [documentFormOpen, setDocumentFormOpen] = useState(false);
  const [actionTask, setActionTask] = useState<MaintenanceTask | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [resolvingProblem, setResolvingProblem] = useState<Problem | null>(null);
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
    const [itemsResult, tasksResult, logResult, problemsResult, providersResult, documentsResult] = await Promise.all([
      listHomeItems(found.id),
      listMaintenanceTasks(found.id),
      listMaintenanceLog(found.id),
      listProblems(found.id),
      listServiceProviders(found.id),
      listHomeItemDocuments(found.id),
    ]);
    if (!itemsResult.ok) {
      setErrorMessage(describeResultError(itemsResult.error));
      setStatus("error");
      return;
    }
    if (!itemsResult.data.some((t) => t.id === itemId)) {
      setStatus("not-found");
      return;
    }
    setItems(itemsResult.data);
    setTasks(tasksResult.ok ? tasksResult.data : []);
    setLogEntries(logResult.ok ? logResult.data : []);
    setProblems(problemsResult.ok ? problemsResult.data : []);
    setProviders(providersResult.ok ? providersResult.data : []);
    setDocuments(documentsResult.ok ? documentsResult.data : []);
    setStatus("ready");
  }, [itemId]);

  useEffect(() => {
    load();
  }, [load]);

  const item = useMemo(() => items.find((t) => t.id === itemId) ?? null, [items, itemId]);

  /**
   * Which identity facts this kind of thing actually has, plus anything
   * already filled in regardless of category, so narrowing the list can
   * never hide a value somebody deliberately entered.
   */
  const identityFields = useMemo(() => {
    const labels: Record<HomeItemIdentityField, string> = {
      brand: "Brand",
      model: "Model",
      purchaseDate: "Purchased",
      installDate: "Installed",
      warrantyExpiresAt: "Warranty expires",
    };
    const relevant = new Set(identityFieldsFor(item ? categoryOfType(item.type) : null));
    return (Object.keys(labels) as HomeItemIdentityField[])
      .filter((field) => relevant.has(field) || Boolean(item?.[field]))
      .map((field) => ({ field, label: labels[field] }));
  }, [item]);
  const itemTasks = useMemo(() => tasks.filter((t) => t.applianceId === itemId && t.status !== "archived"), [tasks, itemId]);
  const itemLog = useMemo(
    () => logEntries.filter((entry) => entry.applianceId === itemId).sort((a, b) => (a.performedAt < b.performedAt ? 1 : -1)),
    [logEntries, itemId]
  );
  const itemProblems = useMemo(() => problems.filter((p) => p.thingId === itemId && p.status !== "archived"), [problems, itemId]);
  const openProblems = itemProblems.filter((p) => p.resolutionStatus !== "resolved");
  const resolvedProblems = itemProblems.filter((p) => p.resolutionStatus === "resolved");
  const itemDocuments = useMemo(() => documents.filter((d) => d.thingId === itemId && d.status !== "archived"), [documents, itemId]);
  const providerById = useMemo(() => new Map(providers.map((p) => [p.id, p])), [providers]);
  /**
   * Who has actually worked on this, and what they did.
   *
   * Drawn from real events rather than only from problems, because most
   * work on a home is scheduled care rather than something breaking, and
   * a people panel that only knew about breakages would be empty for a
   * well-kept house. This is the answer to "who did this last time, and
   * would I use them again": their own record on this one object.
   */
  const peopleOnThisItem = useMemo(() => {
    const byProvider = new Map<string, { provider: ServiceProvider; events: MaintenanceLogEntry[] }>();
    for (const entry of itemLog) {
      if (!entry.providerId) continue;
      const provider = providerById.get(entry.providerId);
      if (!provider) continue;
      const existing = byProvider.get(provider.id);
      if (existing) existing.events.push(entry);
      else byProvider.set(provider.id, { provider, events: [entry] });
    }
    return Array.from(byProvider.values()).sort((a, b) => b.events.length - a.events.length);
  }, [itemLog, providerById]);

  const hasHistory = itemLog.length > 0 || resolvedProblems.length > 0;
  const visibleTabs = useMemo(
    () =>
      ALL_TABS.filter((tab) => {
        if (tab.id === "history") return hasHistory;
        if (tab.id === "records") return itemDocuments.length > 0;
        if (tab.id === "people") return peopleOnThisItem.length > 0;
        return true;
      }).map((tab) => ({ id: tab.id, label: tab.label })),
    [hasHistory, itemDocuments.length, peopleOnThisItem.length]
  );

  // A tab can disappear underneath the selection, for instance when the
  // last document on an item is archived while Records is open.
  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeTab)) setActiveTab("identity");
  }, [visibleTabs, activeTab]);

  async function handleSaveThing(values: HomeItemFormValues) {
    if (!item) return { ok: false as const, message: "Not loaded yet. Try again in a moment." };
    const result = await updateHomeItem(item.id, homeItemFormValuesToPatch(values));
    if (!result.ok) return { ok: false as const, message: describeResultError(result.error) };
    setItems((prev) => prev.map((t) => (t.id === result.data.id ? result.data : t)));
    return { ok: true as const, item: result.data };
  }

  async function handleToggleArchive() {
    if (!item) return;
    setArchiving(true);
    const result = item.status === "archived" ? await updateHomeItem(item.id, { status: "active" }) : await archiveHomeItem(item.id);
    setArchiving(false);
    if (result.ok) setItems((prev) => prev.map((t) => (t.id === result.data.id ? result.data : t)));
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


  async function handleSaveDocument(values: HomeItemDocumentFormValues): Promise<string | null> {
    if (!instanceId || !item) return "Couldn't find your home. Try reloading the page.";
    const patch = homeItemDocumentFormValuesToPatch(values);
    if (typeof patch === "string") return patch;
    const result = await createHomeItemDocument(instanceId, { ...patch, thingId: item.id });
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
        title="Couldn't load this"
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

  if (status === "not-found" || !item) {
    return (
      <EmptyState
        icon={Home}
        title="This isn't here anymore"
        description="It may have been removed."
        action={
          <Link href="/app/products/home-management-companion/workspace">
            <Button size="sm" variant="secondary">
              Back to your home
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="pb-20 lg:pb-0">
      <Link
        href="/app/products/home-management-companion/workspace"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft size={14} aria-hidden />
        Your home
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          <CategoryIcon type={item.type} size={19} />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--faint)]">{typeLabel(item.type)}</p>
            <h1
              className="mt-1 text-[24px] font-medium leading-[1.15] tracking-[-0.01em] text-[var(--text)] sm:text-[28px]"
              style={{ fontFamily: "var(--product-narrative-font)", textWrap: "balance" }}
            >
              {item.name}
            </h1>
            {(item.brand || item.model) && (
              <p className="mt-1 text-[13px] text-[var(--muted)]">{[item.brand, item.model].filter(Boolean).join(" ")}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.status !== "active" && <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>}
          <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Tabs tabs={visibleTabs} activeId={activeTab} onChange={setActiveTab} idPrefix="item-detail" />

        <div className="mt-5">
          <TabPanel id="identity" activeId={activeTab} idPrefix="item-detail">
            <div className="flex flex-col gap-4">
              <Surface className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Type" value={typeLabel(item.type)} />
                <Field label="Location" value={item.location} />
                {identityFields.map(({ field, label }) => (
                  <Field key={field} label={label} value={item[field]} />
                ))}
              </Surface>
              {item.notes && (
                <Surface>
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Notes</h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text)]">{item.notes}</p>
                </Surface>
              )}
              {item.documentLink && (
                <a
                  href={item.documentLink}
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
                  iconLeft={item.status === "archived" ? <RotateCcw size={13} aria-hidden /> : <Archive size={13} aria-hidden />}
                  onClick={handleToggleArchive}
                  disabled={archiving}
                >
                  {archiving ? "Working…" : item.status === "archived" ? "Restore this" : "Archive this"}
                </Button>
              </div>
            </div>
          </TabPanel>

          <TabPanel id="care" activeId={activeTab} idPrefix="item-detail">
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Maintenance</h2>
                  <Button size="sm" variant="ghost" iconLeft={<Plus size={13} aria-hidden />} onClick={() => setTaskFormOpen(true)}>
                    Add task
                  </Button>
                </div>
                {itemTasks.length === 0 ? (
                  <p className="mt-2 text-[13px] text-[var(--muted)]">Nothing recurring set up for this yet.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {itemTasks.map((task) => (
                      <li key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] p-3.5">
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--text)]">{task.name}</p>
                          <p className="mt-0.5 text-[12px] text-[var(--muted)]">{describeCareFor(task)}</p>
                        </div>
                        <Button size="sm" variant="secondary" onClick={() => setActionTask(task)}>
                          Action
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Open problems</h2>
                  <Button size="sm" variant="ghost" iconLeft={<Plus size={13} aria-hidden />} onClick={() => setReportOpen(true)}>
                    Report a problem
                  </Button>
                </div>
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
                        <p className="mt-1 text-[12px] text-[var(--muted)]">
                          {SEVERITY_LABEL[problem.severity]}
                          {problem.resolutionStatus === "scheduled" && problem.scheduledAt && ` · someone's coming ${problem.scheduledAt}`}
                        </p>
                        <div className="mt-2.5">
                          <Button size="sm" onClick={() => setResolvingProblem(problem)}>
                            Take a look
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </TabPanel>

          <TabPanel id="history" activeId={activeTab} idPrefix="item-detail">
            <ul className="flex flex-col gap-2">
              {itemLog.map((entry) => (
                <li key={entry.id} className="rounded-lg border border-[var(--border)] p-3.5">
                  <p className="text-[13px] font-semibold text-[var(--text)]">{entry.description}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                    {describeEvent(entry, entry.providerId ? providerById.get(entry.providerId)?.name ?? null : null)}
                  </p>
                  {entry.notes && <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--text)]">{entry.notes}</p>}
                </li>
              ))}
              {resolvedProblems.map((problem) => (
                <li key={problem.id} className="rounded-lg border border-[var(--border)] p-3.5">
                  <p className="text-[13px] font-semibold text-[var(--text)]">{problem.title}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                    {problem.resolvedAt ? `Sorted ${describeElapsed(daysBetween(problem.resolvedAt, new Date()))}` : "Sorted"}
                  </p>
                </li>
              ))}
            </ul>
          </TabPanel>

          <TabPanel id="records" activeId={activeTab} idPrefix="item-detail">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">Documents</h2>
              <Button size="sm" variant="ghost" iconLeft={<Plus size={13} aria-hidden />} onClick={() => setDocumentFormOpen(true)}>
                Add document
              </Button>
            </div>
            {itemDocuments.length === 0 ? (
              <p className="mt-2 text-[13px] text-[var(--muted)]">No warranty, receipt, or manual saved here yet.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {itemDocuments.map((doc) => (
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

          <TabPanel id="people" activeId={activeTab} idPrefix="item-detail">
            <ul className="flex flex-col gap-2.5">
              {peopleOnThisItem.map(({ provider, events }) => (
                <li key={provider.id} className="rounded-lg border border-[var(--border)] p-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[14px] font-semibold text-[var(--text)]">{provider.name}</p>
                    {provider.phone && <p className="text-[12px] text-[var(--muted)]">{provider.phone}</p>}
                  </div>
                  <ul className="mt-2 flex flex-col gap-1">
                    {events.map((entry) => (
                      <li key={entry.id} className="text-[12px] text-[var(--muted)]">
                        {entry.description} · {describeElapsed(daysBetween(entry.performedAt, new Date()))}
                        {entry.costMinorUnits !== null && ` · ${formatCurrency(entry.costMinorUnits, HOME_BASE_CURRENCY)}`}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </TabPanel>
        </div>
      </div>

      <HomeItemFormSheet open={editOpen} item={item} instanceId={instanceId} onClose={() => setEditOpen(false)} onSave={handleSaveThing} />
      <MaintenanceTaskFormSheet
        open={taskFormOpen}
        task={null}
        items={items.filter((t) => t.status !== "archived")}
        defaultApplianceId={item.id}
        onClose={() => setTaskFormOpen(false)}
        onSave={handleSaveTask}
      />
      <HomeItemDocumentFormSheet open={documentFormOpen} onClose={() => setDocumentFormOpen(false)} onSave={handleSaveDocument} />
      <ReportProblemSheet
        open={reportOpen}
        instanceId={instanceId}
        items={items}
        defaultItemId={item.id}
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

/** One factual line about an event: when, who, and what it cost. Same shape the History surface uses. */
function describeEvent(entry: MaintenanceLogEntry, provider: string | null): string {
  const parts = [describeElapsed(daysBetween(entry.performedAt, new Date()))];
  const who = provider ?? entry.performedBy;
  parts.push(who ? `by ${who}` : "by you");
  if (entry.costMinorUnits !== null) parts.push(formatCurrency(entry.costMinorUnits, HOME_BASE_CURRENCY));
  return parts.join(" · ");
}

/** The same wording Home uses for a job, so an item never describes its care differently. */
function describeCareFor(task: MaintenanceTask): string {
  const template = findCareTemplate(task.careTemplateId) ?? findCareTemplateByTaskName(task.name);
  if (template?.months?.length) return describeSeasonalCareStatus(task.lastDoneAt, template.months, new Date());
  return describeCareStatus(task.lastDoneAt, task.cadenceDays, new Date());
}
