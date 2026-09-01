"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { ChevronRight, Layers3 } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findInOrderInstanceId, PERSONAL_LIFE_AFFAIRS_COMPANION_SLUG } from "../instanceData";
import { archiveItem, confirmItem, loadItems, loadProfile, loadRevisions, loadSteps, updateItem } from "../domain/affairsData";
import { AFFAIR_AREA_ORDER, AFFAIR_DOMAIN_LABEL, AFFAIR_STEP_BY_KEY, type AffairArea } from "../affairsKnowledge";
import { needsReview, type AffairItem, type AffairItemRevision } from "../lifeAffairs";
import type { AffairProfile, StepRecord } from "../sequencer";
import { captureFor, type AffairItemDraft } from "../capture";
import CompanionCapture from "./CompanionCapture";
import HandoffCheckPanel from "./HandoffCheckPanel";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";
type Revision = AffairItemRevision & { label: string; area: AffairArea };

/**
 * My Affairs: what this product currently knows.
 *
 * THE ONE RULE THAT SHAPES EVERY DECISION HERE
 *
 * Only what exists is shown. No empty domains, no "not established yet"
 * rows, no ghosted placeholders for the things a person has not got to.
 * The moment a missing thing appears here as a row, this page becomes a
 * checklist with a gentler word for it, and the absence of information
 * is already handled properly on Next, one thing at a time.
 *
 * So a person with no pets sees no pets section. Not a section saying
 * they have no pets. Absent.
 *
 * NOT History, and the difference matters. This is the current state,
 * the thing you open two years later to remember what you decided.
 * History is how it got here.
 */

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatMonth(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/**
 * How a record reads in a list: what it is, then the one or two things
 * that identify it. Never every field, because a list of everything is
 * the detail page and there would then be no reason to open one.
 */
function summarise(item: AffairItem): string[] {
  const lines: string[] = [];
  if (item.personName && item.personName !== item.label) lines.push(item.personName);
  if (item.fields.relationship) lines.push(item.fields.relationship);
  if (item.fields.role) lines.push(item.fields.role);
  if (item.whereabouts) lines.push(item.whereabouts);
  return lines.slice(0, 2);
}

export default function AffairsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [items, setItems] = useState<AffairItem[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [profile, setProfile] = useState<AffairProfile>({});
  const [records, setRecords] = useState<StepRecord[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    const found = await findInOrderInstanceId();
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
    const [itemsResult, revisionsResult, profileResult, stepsResult] = await Promise.all([
      loadItems(found.id),
      loadRevisions(found.id),
      loadProfile(found.id),
      loadSteps(found.id),
    ]);
    if (!itemsResult.ok) {
      setErrorMessage(describeResultError(itemsResult.error));
      setStatus("error");
      return;
    }
    setItems(itemsResult.data);
    setRevisions(revisionsResult.ok ? revisionsResult.data : []);
    setProfile(profileResult.ok ? profileResult.data : {});
    setRecords(stepsResult.ok ? stepsResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<{ ok: true; data: AffairItem[] } | { ok: false; error: unknown }>) {
    setPending(true);
    setErrorMessage(null);
    const result = (await action()) as { ok: boolean; data?: AffairItem[]; error?: unknown };
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error as Parameters<typeof describeResultError>[0]));
      return false;
    }
    setItems(result.data ?? []);
    return true;
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Layers3} title="Nothing here yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Layers3} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const now = new Date();
  const open = items.find((i) => i.id === openId) ?? null;
  const editing = items.find((i) => i.id === editingId) ?? null;

  // ------------------------------------------------------- revising one
  if (editing) {
    const step = editing.originStepKey ? AFFAIR_STEP_BY_KEY[editing.originStepKey] : null;
    const spec = editing.originStepKey ? captureFor(editing.originStepKey) : null;
    if (step && spec) {
      return (
        <CompanionCapture
          step={step}
          spec={spec}
          editing={editing}
          pending={pending}
          onSave={async (draft: AffairItemDraft) => {
            if (!instanceId) return;
            const saved = await run(() => updateItem(instanceId, editing, draft));
            if (saved) {
              setEditingId(null);
              load();
            }
          }}
          onCancel={() => setEditingId(null)}
        />
      );
    }
  }

  // -------------------------------------------------------- one record
  if (open) {
    const step = open.originStepKey ? AFFAIR_STEP_BY_KEY[open.originStepKey] : null;
    const stale = needsReview(open, now);
    const extras = Object.entries(open.fields).filter(([, v]) => v.trim().length > 0);
    const changes = revisions.filter((r) => r.itemId === open.id);

    return (
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="self-start text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
        >
          Back to your affairs
        </button>

        {errorMessage && (
          <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
            {errorMessage}
          </p>
        )}

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
            {AFFAIR_DOMAIN_LABEL[open.area]}
          </p>
          <h1
            className="mt-2 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {open.label}
          </h1>
          {step && <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">{step.instruction}</p>}
        </div>

        <dl className="flex flex-col">
          {open.personName && open.personName !== open.label && <Row term="Who" value={open.personName} />}
          {extras.map(([key, value]) => (
            <Row key={key} term={fieldTerm(key)} value={value} />
          ))}
          {open.personContact && <Row term="How to reach them" value={open.personContact} />}
          {open.whereabouts && <Row term="Where it is" value={open.whereabouts} />}
          {open.notes && <Row term="What someone should know" value={open.notes} />}
          {open.lastConfirmedAt && <Row term="Last confirmed" value={formatDate(open.lastConfirmedAt) ?? ""} />}
          {open.nextReviewAt && (
            <Row term={stale ? "Worth checking now" : "Next worth checking"} value={formatMonth(open.nextReviewAt) ?? ""} />
          )}
        </dl>

        {open.status === "incomplete" && (
          <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[12.5px] leading-relaxed text-[var(--muted)]">
            Partly recorded. You left something open here, which is fine. It prints as exactly that.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={pending} onClick={() => setEditingId(open.id)}>
            Update
          </Button>
          {stale && instanceId && (
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={async () => {
                if (await run(() => confirmItem(instanceId, open))) load();
              }}
            >
              Still true
            </Button>
          )}
          {instanceId && (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={async () => {
                if (await run(() => archiveItem(instanceId, open))) {
                  setOpenId(null);
                  load();
                }
              }}
            >
              This no longer applies
            </Button>
          )}
        </div>

        {changes.length > 0 && (
          <section aria-label="What has changed here">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
              What has changed here
            </h2>
            <div className="mt-2 flex flex-col">
              {changes.map((change) => (
                <div key={change.id} className="border-b border-[var(--border)] py-2.5">
                  <p className="text-[13px] leading-relaxed text-[var(--text)]">{change.summary}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--faint)]">{formatDate(change.createdAt)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------- the map
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Layers3}
        title="Nothing established yet"
        description="What this product knows about your affairs appears here. Start on Next and it fills in as you go."
      />
    );
  }

  const byArea = AFFAIR_AREA_ORDER.map((area) => ({
    area,
    // Only domains with something in them. A domain listed as empty is a
    // checklist row wearing a heading.
    entries: items.filter((i) => i.area === area),
  })).filter((group) => group.entries.length > 0);

  return (
    <div className="flex flex-col gap-7">
      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">My affairs</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          What you have established so far.
        </h1>
        <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
          Everything here is in your own words. Nothing that does not apply to you appears, and nothing you have not
          got to yet is listed as missing.
        </p>
      </div>

      {byArea.map(({ area, entries }) => (
        <section key={area} aria-label={AFFAIR_DOMAIN_LABEL[area]}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
            {AFFAIR_DOMAIN_LABEL[area]}
          </h2>
          <div className="mt-2 flex flex-col">
            {entries.map((item) => {
              const stale = needsReview(item, now);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpenId(item.id)}
                  className="group flex items-center gap-3 border-b border-[var(--border)] py-3 text-left transition-colors hover:bg-[var(--surface-muted)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-[var(--text)]">{item.label}</span>
                    {summarise(item).map((line) => (
                      <span key={line} className="block text-[12.5px] leading-relaxed text-[var(--muted)]">
                        {line}
                      </span>
                    ))}
                    {stale && (
                      <span className="mt-0.5 block text-[11.5px] font-semibold text-[var(--primary)]">
                        Worth checking again
                      </span>
                    )}
                  </span>
                  <ChevronRight
                    size={15}
                    aria-hidden
                    className="shrink-0 text-[var(--faint)] transition-colors group-hover:text-[var(--muted)]"
                  />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <HandoffCheckPanel
        profile={profile}
        records={records}
        items={items}
        nextHref={`/app/products/${PERSONAL_LIFE_AFFAIRS_COMPANION_SLUG}/workspace`}
      />
    </div>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="border-b border-[var(--border)] py-2.5">
      <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">{term}</dt>
      <dd className="mt-0.5 text-[14px] leading-relaxed text-[var(--text)]">{value}</dd>
    </div>
  );
}

/** Field keys are chosen for code. The person reading has never seen them. */
const FIELD_TERM: Record<string, string> = {
  relationship: "Relationship",
  role: "What they do",
  provider: "Provider",
  purpose: "What it is for",
  renewalMonth: "Renews",
  animals: "Animals",
  tenure: "Owned or rented",
  exists: "In place",
  usesOne: "In use",
  prepaid: "Already arranged",
  copyHeldBy: "Copy also held by",
  openableBy: "Can be opened by",
  namedToReceive: "Named to receive it",
  shouldGoTo: "Should go to",
  writtenFor: "Written for",
  otherCarers: "Others involved in their care",
  discussed: "Talked about it",
};

function fieldTerm(key: string): string {
  return FIELD_TERM[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
