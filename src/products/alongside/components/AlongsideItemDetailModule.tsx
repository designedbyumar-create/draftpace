"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import EmptyState from "@/design-system/EmptyState";
import { ArrowLeft, Layers3 } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findAlongsideInstanceId } from "../instanceData";
import {
  loadItems,
  loadItemEvents,
  updateItem,
  recordOutcome,
  type ItemEvent,
  type RunRecord,
} from "../domain/alongsideData";
import { deriveAttention } from "../attention";
import {
  describeDaysSince,
  daysSince,
  isOpenToWork,
  KIND_LABEL,
  resumeContext,
  type LifeItem,
} from "../life";
import { playbooksFor } from "../playbooks";
import type { Playbook } from "../playbook";
import CompanionRun from "./CompanionRun";
import PlaybookChooser from "./PlaybookChooser";
import { beginRun, findResumableRun } from "./useResumableRun";

type LoadStatus = "loading" | "ready" | "no-instance" | "not-found" | "error";

/**
 * One thing, on its own page.
 *
 * Life shows a card that can only be partially inspected: the most
 * recent line, a couple of quick actions. This is where the whole of it
 * lives, everything that has happened to it, and everywhere it can be
 * changed by hand rather than through a run.
 *
 * The edit fields here are the other half of the point that Now already
 * makes about dates: Alongside never invents a deadline, but a person's
 * own explicit intention to be reminded is not an invented one. Setting
 * or changing a date here is exactly that intention, recorded.
 */
export default function AlongsideItemDetailModule() {
  const params = useParams<{ itemId: string }>();
  const itemId = params.itemId;

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [item, setItem] = useState<LifeItem | null>(null);
  const [events, setEvents] = useState<ItemEvent[]>([]);
  const [running, setRunning] = useState<{ playbook: Playbook; run: RunRecord } | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [waitingForm, setWaitingForm] = useState(false);
  const [pending, setPending] = useState(false);

  const [titleDraft, setTitleDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [dateDraft, setDateDraft] = useState("");
  const [waitingOnDraft, setWaitingOnDraft] = useState("");

  const load = useCallback(async () => {
    const found = await findAlongsideInstanceId();
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
    const [itemsResult, eventsResult] = await Promise.all([loadItems(found.id), loadItemEvents(found.id, itemId)]);
    if (!itemsResult.ok) {
      setErrorMessage(describeResultError(itemsResult.error));
      setStatus("error");
      return;
    }
    const found2 = itemsResult.data.find((candidate) => candidate.id === itemId) ?? null;
    if (!found2) {
      setStatus("not-found");
      return;
    }
    setItem(found2);
    setEvents(eventsResult.ok ? eventsResult.data : []);
    setStatus("ready");
  }, [itemId]);

  useEffect(() => {
    load();
  }, [load]);

  function openEdit() {
    if (!item) return;
    setTitleDraft(item.title);
    setNoteDraft(item.note ?? "");
    setDateDraft(item.nextAt ? item.nextAt.slice(0, 10) : "");
    setWaitingOnDraft(item.waitingOn ?? "");
    setEditing(true);
  }

  async function saveEdit() {
    if (!item) return;
    setPending(true);
    setErrorMessage(null);
    const result = await updateItem(item.id, {
      title: titleDraft.trim() || item.title,
      note: noteDraft.trim() || null,
      nextAt: dateDraft ? new Date(`${dateDraft}T09:00:00`).toISOString() : null,
      userChosenDate: dateDraft.length > 0,
      waitingOn: item.kind === "waiting" ? waitingOnDraft.trim() || null : item.waitingOn,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setItem(result.data);
    setEditing(false);
  }

  async function markWaiting() {
    if (!item || !instanceId) return;
    setPending(true);
    setErrorMessage(null);
    const result = await recordOutcome(instanceId, item, "waiting", waitingOnDraft.trim() || null);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setItem(result.data);
    setWaitingForm(false);
    setWaitingOnDraft("");
    refreshEvents();
  }

  async function close() {
    if (!item || !instanceId) return;
    setPending(true);
    setErrorMessage(null);
    const result = await recordOutcome(instanceId, item, "resolved", null);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setItem(result.data);
    refreshEvents();
  }

  const refreshEvents = useCallback(async () => {
    if (!instanceId) return;
    const result = await loadItemEvents(instanceId, itemId);
    if (result.ok) setEvents(result.data);
  }, [instanceId, itemId]);

  async function openCompanion() {
    if (!item || !instanceId) return;
    setStartError(null);
    setOpening(true);
    const resumable = await findResumableRun(instanceId, item.id);
    setOpening(false);
    if (resumable) {
      setRunning({ playbook: resumable.playbook, run: resumable.run });
      return;
    }
    setChoosing(true);
  }

  /** The chooser only shows once openCompanion has already ruled out a resumable run, so this always creates a fresh one. */
  async function pickPlaybook(playbook: Playbook) {
    if (!item || !instanceId) return;
    setChoosing(false);
    setOpening(true);
    const started = await beginRun(instanceId, playbook, item.id);
    setOpening(false);
    if (!started.ok) {
      setStartError("Couldn't start that. Try again.");
      return;
    }
    setRunning({ playbook, run: started.data });
  }

  function finishRun() {
    setRunning(null);
    setChoosing(false);
    refreshEvents();
    load();
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance" || status === "error") {
    return (
      <EmptyState
        icon={Layers3}
        title="Couldn't load this"
        description={errorMessage ?? "This product has not been set up on your account."}
      />
    );
  }
  if (status === "not-found" || !item || !instanceId) {
    return (
      <EmptyState icon={Layers3} title="Not found" description="This may have been archived or does not exist." />
    );
  }

  if (running) {
    return (
      <CompanionRun
        instanceId={instanceId}
        playbook={running.playbook}
        item={item}
        run={running.run}
        onFinished={finishRun}
        onLeft={() => setRunning(null)}
        onItemUpdated={setItem}
      />
    );
  }

  if (opening) {
    return <p className="text-[13px] text-[var(--faint)]">Opening...</p>;
  }

  const now = new Date();
  const nextSignal = deriveAttention({ items: [item] }, now).signals[0] ?? null;
  const resume = resumeContext(item, now);
  const available = playbooksFor(item.kind);
  const since = daysSince(item.lastTouchedAt, now);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7">
      <Link
        href="/app/products/alongside/life"
        className="inline-flex w-fit items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft size={14} aria-hidden />
        Life
      </Link>

      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
          {KIND_LABEL[item.kind]}
        </p>
        {editing ? (
          <Input
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            containerClassName="mt-2"
            aria-label="Title"
          />
        ) : (
          <h1
            className="mt-2 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {item.title}
          </h1>
        )}
        {item.status === "done" && (
          <p className="mt-1 text-[13px] text-[var(--muted)]">This is sorted.</p>
        )}
      </header>

      {/* Next attention: exactly what Now would say about this one
          thing, so there is no second, drifting version of the same
          rule written for this screen. */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Next attention</p>
        <p className="mt-1.5 text-[15px] leading-6 text-[var(--text)]">
          {item.status !== "open" ? "Nothing, it is closed." : nextSignal ? nextSignal.line : "Nothing needs you about this right now."}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        {editing ? (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-semibold text-[var(--text)]">Note</span>
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                rows={3}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[14px] text-[var(--text)] outline-none focus:border-[var(--primary)]"
              />
            </label>
            {item.kind === "waiting" && (
              <Input
                label="Waiting on"
                value={waitingOnDraft}
                onChange={(event) => setWaitingOnDraft(event.target.value)}
              />
            )}
            <Input
              type="date"
              label="A day to come back to this"
              value={dateDraft}
              onChange={(event) => setDateDraft(event.target.value)}
              hint="This is your own choice, not something the product is asking for. Leave it empty to clear it."
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={saveEdit} disabled={pending}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={pending}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {item.note && <p className="text-[14px] leading-6 text-[var(--text)]">{item.note}</p>}
            {item.waitingOn && (
              <p className="text-[14px] leading-6 text-[var(--text)]">Waiting on {item.waitingOn}</p>
            )}
            {resume.leftOff && <p className="text-[14px] leading-6 text-[var(--text)]">{resume.leftOff}</p>}
            {resume.nextStep && (
              <p className="text-[14px] leading-6 text-[var(--muted)]">Next: {resume.nextStep}</p>
            )}
            {item.nextAt && (
              <p className="text-[13px] text-[var(--muted)]">
                {item.userChosenDate ? "You said you would come back to this on " : "Set for "}
                {new Date(item.nextAt).toLocaleDateString(undefined, { day: "numeric", month: "long" })}
              </p>
            )}
            {since !== null && since > 0 && (
              <p className="text-[12px] text-[var(--faint)]">Last touched {describeDaysSince(since)}</p>
            )}
            {waitingForm ? (
              <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <Input
                  label="Who are you waiting on?"
                  value={waitingOnDraft}
                  onChange={(event) => setWaitingOnDraft(event.target.value)}
                  autoFocus
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={markWaiting} disabled={pending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setWaitingForm(false)} disabled={pending}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="ghost" onClick={openEdit}>
                  Edit
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {choosing && !running && (
        <PlaybookChooser item={item} onPick={pickPlaybook} onCancel={() => setChoosing(false)} />
      )}

      {!editing && !waitingForm && (
        <div className="flex flex-wrap items-center gap-2">
          {isOpenToWork(item, now) && available.length > 0 && !choosing && (
            <Button size="sm" variant="secondary" onClick={openCompanion}>
              Do this with me
            </Button>
          )}
          {item.status === "open" && item.kind !== "reference" && (
            <Button size="sm" variant="ghost" onClick={close} disabled={pending}>
              {item.kind === "waiting" ? "They came back to me" : "It is sorted"}
            </Button>
          )}
          {item.status === "open" && item.kind !== "waiting" && item.kind !== "reference" && (
            <Button size="sm" variant="ghost" onClick={() => setWaitingForm(true)} disabled={pending}>
              Waiting on someone now
            </Button>
          )}
        </div>
      )}

      {startError && <p className="text-[13px] text-[var(--danger)]">{startError}</p>}
      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}

      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">History</p>
        {events.length === 0 ? (
          <p className="mt-2 text-[13px] text-[var(--faint)]">Nothing recorded about this yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {events.map((event) => (
              <li key={event.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                <p className="text-[14px] leading-6 text-[var(--text)]">{event.line}</p>
                <p className="mt-1 text-[12px] text-[var(--faint)]">
                  {new Date(event.occurredAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
