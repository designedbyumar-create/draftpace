"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Compass, Plus } from "@/design-system/Icon";
import { deriveAttention, QUIET_LINE } from "../attention";
import { isOpenToWork, type LifeItem } from "../life";
import { playbooksFor } from "../playbooks";
import type { OutcomeKind, Playbook } from "../playbook";
import type { FinishResult, RunRecord } from "../domain/alongsideData";
import CompanionRun from "./CompanionRun";
import PlaybookChooser from "./PlaybookChooser";
import StartCompanion from "./StartCompanion";
import AddItemForm from "./AddItemForm";
import { useAlongside } from "./useAlongside";
import { beginRun, findResumableRun } from "./useResumableRun";

interface Running {
  playbook: Playbook;
  item: LifeItem | null;
  run: RunRecord;
  directTitle: string | null;
}

/**
 * Now.
 *
 * What the product says when somebody opens it. Every signal here traces
 * to a fact that was stored: a date somebody set, a check-in that came
 * due, a thread gone quiet. Alongside never invents a deadline or a
 * sense of urgency on its own; a date only appears here because the
 * person put it there, whether by choosing it directly or by telling the
 * Companion who they are waiting on.
 *
 * QUIET IS A REAL ANSWER
 *
 * When nothing needs them, this screen says so and stops. It does not
 * fill the space with suggestions, a summary of the week, or a count of
 * what is outstanding. A product for people who are already carrying too
 * much has to be capable of saying there is nothing right now and
 * meaning it.
 *
 * Deliberately absent: a count of anything, a streak, a completion
 * figure, a red badge, and any sentence beginning with "you still
 * have not".
 *
 * ONE THING, NOT A LIST TO EVALUATE
 *
 * deriveAttention already sorts every signal by weight, most worth
 * mentioning first. This screen shows only that first one by default.
 * The rest are a click away, never dropped, but not dumped on screen at
 * once: the audience research behind this product found that a long
 * list makes the exact state this product exists for, task paralysis,
 * worse rather than better, because evaluating several somewhat-urgent
 * things costs real energy before anything gets done. Showing one
 * thing is the fix, not showing everything more clearly. See the
 * "task paralysis" guide, and the Companion callout on it, which
 * already claims this screen works this way.
 */
export default function NowModule() {
  const { status, errorMessage, instanceId, items, replaceItem, addItem } = useAlongside();
  const [running, setRunning] = useState<Running | null>(null);
  const [adding, setAdding] = useState(false);
  const [starting, setStarting] = useState(false);
  /** Which item is being matched to a playbook. One at a time, like everything else here. */
  const [choosing, setChoosing] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  /** Collapsed to the one top signal by default. See "ONE THING, NOT A LIST TO EVALUATE" above. */
  const [showAll, setShowAll] = useState(false);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState
        icon={Compass}
        title="Nothing to show yet"
        description="This product has not been set up on your account."
      />
    );
  }
  if (status === "error") {
    return <EmptyState icon={Compass} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  function finish(result: FinishResult, outcome: OutcomeKind) {
    if (result.item) replaceItem(result.item);
    setRunning(null);
    // Said once, in the past tense, about the thing rather than the
    // person. Nothing is said at all when they did not get to it.
    setClosing(outcome === "not-yet" ? null : "Recorded.");
  }

  /**
   * Opening the Companion for an item that already has a run sitting
   * open picks that run back up instead of asking again what is in the
   * way. This is the resume path: skip the chooser entirely when there
   * is something to return to.
   */
  async function openItem(item: LifeItem) {
    setStartError(null);
    setOpening(true);
    const resumable = await findResumableRun(instanceId as string, item.id);
    setOpening(false);
    if (resumable) {
      setChoosing(null);
      setRunning({ playbook: resumable.playbook, item, run: resumable.run, directTitle: null });
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
    setRunning({ playbook, item, run: started.data, directTitle: null });
  }

  async function startDirect(playbook: Playbook, title: string | null) {
    setStarting(false);
    setOpening(true);
    const started = await beginRun(instanceId as string, playbook, null);
    setOpening(false);
    if (!started.ok) {
      setStartError("Couldn't start that. Try again.");
      return;
    }
    setRunning({ playbook, item: null, run: started.data, directTitle: title });
  }

  if (running) {
    return (
      <CompanionRun
        instanceId={instanceId}
        playbook={running.playbook}
        item={running.item}
        run={running.run}
        directTitle={running.directTitle}
        onFinished={finish}
        onLeft={() => setRunning(null)}
        onItemUpdated={replaceItem}
      />
    );
  }

  if (starting) {
    return <StartCompanion onStart={startDirect} onCancel={() => setStarting(false)} />;
  }

  if (opening) {
    return <p className="text-[13px] text-[var(--faint)]">Opening...</p>;
  }

  const attention = deriveAttention({ items }, new Date());
  const byId = new Map(items.map((item) => [item.id, item]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Now</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {attention.quiet ? QUIET_LINE : "Worth a look"}
        </h1>
        {attention.quiet && (
          <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
            Anything you have recorded is still here in Life.
          </p>
        )}
      </header>

      {closing && <p className="text-[13px] text-[var(--muted)]">{closing}</p>}
      {startError && <p className="text-[13px] text-[var(--danger)]">{startError}</p>}

      {!attention.quiet && (() => {
        // Sorted already, most worth mentioning first (deriveAttention's
        // own weight sort). Collapsed to that one by default; the rest
        // stay a click away rather than vanishing.
        const visible = showAll ? attention.signals : attention.signals.slice(0, 1);
        const hiddenCount = attention.signals.length - visible.length;
        return (
          <>
            <ul className="flex flex-col gap-3">
              {visible.map((signal) => {
                const item = byId.get(signal.itemId);
                if (!item) return null;
                const available = playbooksFor(item.kind);
                return (
                  <li
                    key={signal.itemId}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {signal.line}
                    </p>
                    <p className="mt-1.5 text-[16px] leading-6 text-[var(--text)]">{item.title}</p>
                    {item.leftOffNote && (
                      <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{item.leftOffNote}</p>
                    )}
                    {/* A waiting item gets no button until the day it is
                        worth chasing. Before then somebody else has the
                        ball; after then, chasing is the action. */}
                    {isOpenToWork(item, new Date()) &&
                      available.length > 0 &&
                      (choosing === item.id ? (
                        <PlaybookChooser
                          item={item}
                          onPick={(playbook) => pickPlaybook(item, playbook)}
                          onCancel={() => setChoosing(null)}
                        />
                      ) : (
                        <div className="mt-3">
                          <Button size="sm" variant="secondary" onClick={() => openItem(item)}>
                            Do this with me
                          </Button>
                        </div>
                      ))}
                  </li>
                );
              })}
            </ul>
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="self-start text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
              >
                {hiddenCount === 1 ? "1 more thing" : `${hiddenCount} more things`}
              </button>
            )}
            {showAll && attention.signals.length > 1 && (
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="self-start text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
              >
                Back to just the one
              </button>
            )}
          </>
        );
      })()}

      {adding ? (
        <AddItemForm
          instanceId={instanceId}
          onAdded={(item) => {
            addItem(item);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setAdding(true)} iconLeft={<Plus size={14} aria-hidden />}>
            Keep something
          </Button>
          {/* Opening the Companion with nothing behind it is a first
              class path. Somebody with one phone call to make today has
              not asked for a system and should not have to build one. */}
          <Button variant="ghost" onClick={() => setStarting(true)}>
            Help me with something
          </Button>
        </div>
      )}
    </div>
  );
}
