"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Layers3, Plus } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { byKind, describeDaysSince, daysSince, isOpenToWork, KIND_LABEL, type ItemKind, type LifeItem } from "../life";
import { playbooksFor } from "../playbooks";
import type { Playbook } from "../playbook";
import { loadItemEvents, recordOutcome, type FinishResult, type ItemEvent, type RunRecord } from "../domain/alongsideData";
import CompanionRun from "./CompanionRun";
import PlaybookChooser from "./PlaybookChooser";
import AddItemForm from "./AddItemForm";
import { useAlongside } from "./useAlongside";
import { beginRun, findResumableRun } from "./useResumableRun";

const SECTIONS: ItemKind[] = ["commitment", "waiting", "thread", "reference"];

/**
 * The quiet line under an item, saying when it was last dealt with.
 *
 * The history line and the item's current state are often the same
 * sentence, because recording "waiting on Octopus" is what set the
 * waiting field in the first place. Printing both reads as a bug. So
 * when the event only repeats what is already on the card, the useful
 * remainder is the timing, and that is all this shows.
 */
function footnote(item: LifeItem, event: ItemEvent | undefined, now: Date): string | null {
  const visible = [item.waitingOn, item.leftOffNote, item.nextStep].filter(Boolean) as string[];

  if (event) {
    const days = daysSince(event.occurredAt, now);
    const when = days === null || days < 1 ? "today" : describeDaysSince(days);
    const repeats = visible.some((text) => event.line.includes(text));
    return repeats ? `Last dealt with ${when}` : `${event.line}, ${when}`;
  }

  const since = daysSince(item.lastTouchedAt, now);
  return since !== null && since > 0 ? `Last touched ${describeDaysSince(since)}` : null;
}

/**
 * Life.
 *
 * Everything recorded, grouped by shape rather than by urgency, so this
 * screen is a place to look things up rather than a second list of
 * demands. Now is the screen that asks for something; this one never
 * does.
 *
 * The four groups are not filters over one list. They are genuinely
 * different relationships to a thing, and keeping them apart is what
 * stops "chase the insurer" sitting in a column of personal
 * obligations for three weeks.
 */
export default function LifeModule() {
  const { status, errorMessage, instanceId, items, replaceItem, addItem, setErrorMessage } = useAlongside();
  const [running, setRunning] = useState<{ playbook: Playbook; item: LifeItem; run: RunRecord } | null>(null);
  const [opening, setOpening] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [choosing, setChoosing] = useState<string | null>(null);
  /**
   * The last thing that happened to each item, in the words that were
   * recorded at the time.
   *
   * Shown because it is the difference between a list of obligations and
   * a record of somebody dealing with their life. Coming back to
   * "Waiting on Octopus, they said 5 working days" is a different
   * experience from coming back to the same bare title you wrote a
   * month ago and having to reconstruct what you did about it.
   */
  const [latest, setLatest] = useState<Record<string, ItemEvent>>({});

  const refreshHistory = useCallback(async () => {
    if (!instanceId) return;
    const result = await loadItemEvents(instanceId);
    if (!result.ok) return;
    const newest: Record<string, ItemEvent> = {};
    // Already ordered newest first, so the first one seen per item wins.
    for (const event of result.data) {
      if (!newest[event.itemId]) newest[event.itemId] = event;
    }
    setLatest(newest);
  }, [instanceId]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState
        icon={Layers3}
        title="Nothing to show yet"
        description="This product has not been set up on your account."
      />
    );
  }
  if (status === "error") {
    return <EmptyState icon={Layers3} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  function finish(result: FinishResult) {
    if (result.item) replaceItem(result.item);
    setRunning(null);
    // A run that just wrote history has to be visible in it. Without
    // this the line is in the database and absent from the screen, which
    // is the same as not having written it.
    refreshHistory();
  }

  /**
   * Closing something without opening the Companion. Not everything
   * needs eight questions, and this still writes through the same
   * applyOutcome rule a run would: a recurring item rolls forward
   * instead of closing, and a real "Sorted" line lands in its history.
   */
  async function close(item: LifeItem) {
    setPending(item.id);
    setErrorMessage(null);
    const result = await recordOutcome(instanceId as string, item, "resolved", null);
    setPending(null);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    replaceItem(result.data);
    refreshHistory();
  }

  /**
   * Opening the Companion for an item that already has a run sitting
   * open picks it back up instead of asking again what is in the way.
   */
  async function openItem(item: LifeItem) {
    setStartError(null);
    setOpening(true);
    const resumable = await findResumableRun(instanceId as string, item.id);
    setOpening(false);
    if (resumable) {
      setChoosing(null);
      setRunning({ playbook: resumable.playbook, item, run: resumable.run });
      return;
    }
    setChoosing(item.id);
  }

  /** The chooser only shows once openItem has already ruled out a resumable run, so this always creates a fresh one. */
  async function pickPlaybook(item: LifeItem, playbook: Playbook) {
    setChoosing(null);
    setOpening(true);
    const started = await beginRun(instanceId as string, playbook, item.id);
    setOpening(false);
    if (!started.ok) {
      setStartError("Couldn't start that. Try again.");
      return;
    }
    setRunning({ playbook, item, run: started.data });
  }

  if (running) {
    return (
      <CompanionRun
        instanceId={instanceId}
        playbook={running.playbook}
        item={running.item}
        run={running.run}
        onFinished={finish}
        onLeft={() => setRunning(null)}
        onItemUpdated={replaceItem}
      />
    );
  }

  if (opening) {
    return <p className="text-[13px] text-[var(--faint)]">Opening...</p>;
  }

  const open = items.filter((item) => item.status === "open");
  const now = new Date();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Life</p>
          <h1
            className="mt-2 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            Everything you are holding
          </h1>
        </div>
        {!adding && (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)} iconLeft={<Plus size={14} aria-hidden />}>
            Keep something
          </Button>
        )}
      </header>

      {adding && (
        <AddItemForm
          instanceId={instanceId}
          onAdded={(item) => {
            addItem(item);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {open.length === 0 && !adding && (
        <EmptyState
          icon={Layers3}
          title="Nothing recorded yet"
          description="Anything you put here stays here until you say otherwise."
        />
      )}

      {SECTIONS.map((kind) => {
        const group = byKind(open, kind);
        if (group.length === 0) return null;
        return (
          <section key={kind} aria-label={KIND_LABEL[kind]}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              {KIND_LABEL[kind]}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {group.map((item) => {
                const available = playbooksFor(item.kind);
                return (
                  <li key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <Link
                      href={`/app/products/alongside/item/${item.id}`}
                      className="text-[15px] font-medium leading-6 text-[var(--text)] underline decoration-[var(--border)] underline-offset-4 hover:decoration-[var(--primary)]"
                    >
                      {item.title}
                    </Link>
                    {item.waitingOn && (
                      <p className="mt-1 text-[13px] text-[var(--muted)]">Waiting on {item.waitingOn}</p>
                    )}
                    {item.leftOffNote && (
                      <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{item.leftOffNote}</p>
                    )}
                    {item.nextStep && (
                      <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">Next: {item.nextStep}</p>
                    )}
                    {/* Vague on purpose past a fortnight. A precise
                        number nobody is going to act on is just a
                        reminder of how long it has been. */}
                    {footnote(item, latest[item.id], now) && (
                      <p className="mt-2 text-[12px] text-[var(--faint)]">{footnote(item, latest[item.id], now)}</p>
                    )}
                    {choosing === item.id && (
                      <PlaybookChooser
                        item={item}
                        onPick={(playbook) => pickPlaybook(item, playbook)}
                        onCancel={() => setChoosing(null)}
                      />
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {isOpenToWork(item, now) && available.length > 0 && choosing !== item.id && (
                        <Button size="sm" variant="secondary" onClick={() => openItem(item)}>
                          Do this with me
                        </Button>
                      )}
                      {item.kind !== "reference" && (
                        <Button size="sm" variant="ghost" disabled={pending === item.id} onClick={() => close(item)}>
                          {item.kind === "waiting" ? "They came back to me" : "It is sorted"}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {startError && <p className="text-[13px] text-[var(--danger)]">{startError}</p>}
      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
    </div>
  );
}
