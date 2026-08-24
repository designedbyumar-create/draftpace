"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { LifeBuoy } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { PLAYBOOKS } from "../playbooks";
import type { OutcomeKind, Playbook } from "../playbook";
import { createItem, type FinishResult } from "../domain/alongsideData";
import CompanionRun from "./CompanionRun";
import { useAlongside } from "./useAlongside";

/**
 * Help.
 *
 * The library, offered by situation rather than by name. Somebody does
 * not arrive looking for "the phone call playbook", they arrive with a
 * call they have been avoiding for a week, so the list is written in
 * those terms.
 *
 * Starting from here creates no obligation. A run that begins with
 * nothing behind it only offers to remember something at the end, and
 * only when there is genuinely something worth keeping.
 */
export default function HelpModule() {
  const { status, errorMessage, instanceId, addItem, setErrorMessage } = useAlongside();
  const [running, setRunning] = useState<Playbook | null>(null);
  const [closing, setClosing] = useState<string | null>(null);
  const [offer, setOffer] = useState<NonNullable<FinishResult["offer"]> | null>(null);
  const [pending, setPending] = useState(false);

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
        playbook={running}
        item={null}
        existingRun={null}
        onFinished={finish}
        onLeft={() => setRunning(null)}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Help</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          What are you up against?
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

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}

      <ul className="flex flex-col gap-2">
        {PLAYBOOKS.map((playbook) => (
          <li key={playbook.key}>
            <button
              type="button"
              onClick={() => setRunning(playbook)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left transition-colors hover:border-[var(--primary)]"
            >
              <p className="text-[15px] leading-6 text-[var(--text)]">{playbook.situation}</p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">{playbook.title}</p>
            </button>
          </li>
        ))}
      </ul>

      {/* Honest about what exists. Seven more are written once this one
          has proved the shape, and saying so beats a greyed out list of
          things that are not there. */}
      <p className="text-[13px] leading-5 text-[var(--faint)]">
        More are being added. If what you are facing is not here, Life will still hold it for you.
      </p>
    </div>
  );
}
