"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { LifeBuoy } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import type { OutcomeKind, Playbook } from "../playbook";
import { createItem, type FinishResult, type RunRecord } from "../domain/alongsideData";
import CompanionRun from "./CompanionRun";
import StartCompanion from "./StartCompanion";
import { beginRun } from "./useResumableRun";
import { useAlongside } from "./useAlongside";

interface Running {
  playbook: Playbook;
  run: RunRecord;
  directTitle: string | null;
}

/**
 * Help.
 *
 * The direct-entry path: open the Companion with nothing recorded yet.
 * "I need to call my landlord" is how somebody actually thinks about
 * this, not "the make-a-phone-call playbook", so the screen leads with a
 * place to say what it is and asks what is going on underneath, in
 * situations rather than in Draftpace's own names for them.
 *
 * Starting from here creates no obligation. A run that begins with
 * nothing behind it only offers to remember something at the end, and
 * only when there is genuinely something worth keeping.
 */
export default function HelpModule() {
  const { status, errorMessage, instanceId, addItem, setErrorMessage } = useAlongside();
  const [running, setRunning] = useState<Running | null>(null);
  const [closing, setClosing] = useState<string | null>(null);
  const [offer, setOffer] = useState<NonNullable<FinishResult["offer"]> | null>(null);
  const [pending, setPending] = useState(false);
  const [opening, setOpening] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState
        icon={LifeBuoy}
        title="Nothing to show yet"
        description="This product has not been set up on your account."
      />
    );
  }
  if (status === "error") {
    return <EmptyState icon={LifeBuoy} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  function finish(result: FinishResult, outcome: OutcomeKind) {
    setRunning(null);
    // Always an offer, never an automatic write. Somebody who opened
    // this to get one phone call done has not asked for a system, and
    // silently starting one for them is how a helpful product becomes
    // another list to feel behind on.
    if (result.offer) {
      setOffer(result.offer);
      return;
    }
    setClosing(outcome === "not-yet" ? null : "Recorded.");
  }

  async function keepOffer() {
    if (!instanceId || !offer) return;
    setPending(true);
    setErrorMessage(null);
    const result = await createItem(instanceId, {
      kind: offer.kind,
      title: offer.title,
      note: offer.note,
      nextAt: offer.nextAt,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    addItem(result.data);
    setOffer(null);
    setClosing("It is in Life now.");
  }

  if (running) {
    return (
      <CompanionRun
        instanceId={instanceId}
        playbook={running.playbook}
        item={null}
        run={running.run}
        directTitle={running.directTitle}
        onFinished={finish}
        onLeft={() => setRunning(null)}
      />
    );
  }

  async function startDirect(playbook: Playbook, title: string | null) {
    setStartError(null);
    setOpening(true);
    const started = await beginRun(instanceId as string, playbook, null);
    setOpening(false);
    if (!started.ok) {
      setStartError("Couldn't start that. Try again.");
      return;
    }
    setRunning({ playbook, run: started.data, directTitle: title });
  }

  if (opening) {
    return <p className="text-[13px] text-[var(--faint)]">Opening...</p>;
  }

  if (!closing && !offer && !errorMessage && !startError) {
    return <StartCompanion onStart={startDirect} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Help</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          What do you need to do?
        </h1>
      </header>

      {closing && <p className="text-[13px] text-[var(--muted)]">{closing}</p>}

      {offer && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-[15px] leading-6 text-[var(--text)]">Want me to hold on to this?</p>
          <p className="mt-1.5 text-[14px] leading-6 text-[var(--muted)]">{offer.title}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={keepOffer} disabled={pending}>
              Keep it
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOffer(null)} disabled={pending}>
              No need
            </Button>
          </div>
        </section>
      )}

      {startError && <p className="text-[13px] text-[var(--danger)]">{startError}</p>}
      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}

      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setClosing(null);
            setStartError(null);
          }}
        >
          Ask about something else
        </Button>
      </div>
    </div>
  );
}
