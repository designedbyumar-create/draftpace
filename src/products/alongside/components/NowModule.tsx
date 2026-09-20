"use client";

import { useState } from "react";
import EmptyState from "@/design-system/EmptyState";
import GuidedTour, { type TourStep } from "@/components/platform/GuidedTour";
import { useFirstRunTour } from "@/components/platform/useFirstRunTour";
import { Compass } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { deriveAttention } from "../attention";
import { isOpenToWork, type LifeItem } from "../life";
import { playbooksFor } from "../playbooks";
import type { OutcomeKind, Playbook } from "../playbook";
import { recordOutcome, type FinishResult, type RunRecord } from "../domain/alongsideData";
import CompanionRun from "./CompanionRun";
import PlaybookChooser from "./PlaybookChooser";
import StartCompanion from "./StartCompanion";
import AddItemForm from "./AddItemForm";
import NowView from "./NowView";
import { useAlongside } from "./useAlongside";
import { ALONGSIDE_SLUG } from "../instanceData";
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
/**
 * Four steps that all survive an empty first visit, which is the only
 * state a first-run tour ever actually runs in. The Now heading and the
 * three rail destinations are on screen whether or not anything has been
 * recorded; nothing here points at a card that needs data to exist.
 */
const TOUR_STEPS: TourStep[] = [
  {
    targetId: "alongside-tour-now",
    title: "This screen is allowed to be empty",
    body: "When nothing is worth raising, it says so and stops. There is no list filling the space, no streak, and nothing here counts against you.",
  },
  {
    targetId: "alongside-tour-help",
    title: "Start with one hard thing",
    body: "Help me with something is the way in when you have not recorded anything yet. Say what you need to do, a call you have been avoiding say, and it walks you through that one thing.",
  },
  {
    targetId: "rail-life",
    title: "Where things you put down live",
    body: "Anything you record goes here, including the things that are not due yet. Nothing in Life is ever overdue.",
  },
  {
    targetId: "rail-workspace",
    title: "Come back here when you want the next thing",
    body: "Now shows the single thing most worth your attention, chosen from what you already said mattered. One thing, never a wall of them.",
  },
];

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
  /** Things set down with "Not now" for as long as this screen is open. Never stored. */
  const [skipped, setSkipped] = useState<string[]>([]);
  /** The item being marked sorted, so its button can say so. */
  const [sorting, setSorting] = useState<string | null>(null);
  // No setup step in this product, so the tour waits only for the screen
  // to have loaded: an owner arriving with nothing recorded is exactly
  // who it is for.
  const { tourOn, finishTour } = useFirstRunTour(ALONGSIDE_SLUG, status === "ready");

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

  const now = new Date();
  const attention = deriveAttention({ items }, now);
  const byId = new Map(items.map((item) => [item.id, item]));
  // Sorted already, most worth mentioning first. Only one is ever shown;
  // "Not now" sets it down for as long as this screen is open, and writes
  // nothing.
  const current = attention.signals.find((signal) => !skipped.includes(signal.itemId) && byId.has(signal.itemId)) ?? null;
  const currentItem = current ? (byId.get(current.itemId) ?? null) : null;

  async function markSorted(item: LifeItem) {
    setStartError(null);
    setSorting(item.id);
    const result = await recordOutcome(instanceId as string, item, "resolved", null);
    setSorting(null);
    if (!result.ok) {
      setStartError(describeResultError(result.error));
      return;
    }
    replaceItem(result.data);
    setClosing("Recorded.");
  }

  if (adding) {
    return (
      <div className="mx-auto w-full max-w-md py-4">
        <AddItemForm
          instanceId={instanceId}
          onAdded={(item) => {
            addItem(item);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </div>
    );
  }

  return (
    <>
      {tourOn && <GuidedTour steps={TOUR_STEPS} onFinish={finishTour} labelPrefix="alongside" />}
      <NowView
        signal={current && currentItem ? { line: current.line, item: currentItem } : null}
        setDown={!attention.quiet && current === null}
        canWork={Boolean(currentItem && isOpenToWork(currentItem, now) && playbooksFor(currentItem.kind).length > 0)}
        chooser={
          currentItem && choosing === currentItem.id ? (
            <PlaybookChooser
              item={currentItem}
              onPick={(playbook) => pickPlaybook(currentItem, playbook)}
              onCancel={() => setChoosing(null)}
            />
          ) : null
        }
        closing={closing}
        startError={startError}
        sorting={Boolean(sorting)}
        onDoThis={() => currentItem && openItem(currentItem)}
        onNotNow={() => current && setSkipped((ids) => [...ids, current.itemId])}
        onSorted={() => currentItem && markSorted(currentItem)}
        onShowAgain={() => setSkipped([])}
        onKeep={() => setAdding(true)}
        onHelp={() => setStarting(true)}
      />
    </>
  );
}
