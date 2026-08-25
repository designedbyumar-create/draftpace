"use client";

import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import { Compass, Globe } from "@/design-system/Icon";
import { deriveToday, whereWeAre } from "../today";
import { useTravelCompanion } from "./useTravelCompanion";
import TripSetupForm from "./TripSetupForm";
import CompanionRun from "./CompanionRun";
import StartCompanion from "@/components/product-shell/companion/StartCompanion";
import { beginRun } from "./useResumableRun";
import { PLAYBOOKS } from "../playbooks";
import type { Playbook } from "@/components/product-shell/companion/steps";
import type { RunRecord } from "../domain/travelData";
import { useState } from "react";

/**
 * Today.
 *
 * The current operational state, derived on read from the current
 * trip's bookings, never a manual task list. Quiet is a real, honest
 * answer here, same as every Companion on this platform: a day with
 * nothing stored says so and stops.
 */
export default function TodayModule() {
  const { status, errorMessage, instanceId, trips, currentTrip, places, bookings, threads, addTrip, upsertThread } = useTravelCompanion();
  const [settingUp, setSettingUp] = useState(false);
  const [starting, setStarting] = useState(false);
  const [running, setRunning] = useState<{ playbook: Playbook; run: RunRecord; directTitle: string | null } | null>(null);
  const [opening, setOpening] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [closingNote, setClosingNote] = useState<string | null>(null);

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

  if (!currentTrip) {
    if (settingUp) {
      return (
        <div className="mx-auto w-full max-w-2xl">
          <TripSetupForm instanceId={instanceId} onCreated={addTrip} onCancel={() => setSettingUp(false)} />
        </div>
      );
    }
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <EmptyState
          icon={Globe}
          title={trips.length === 0 ? "No trip yet" : "Nothing currently in progress"}
          description="Set up a trip to see today's operational state here."
          action={
            <button
              type="button"
              onClick={() => setSettingUp(true)}
              className="text-[13px] font-semibold text-[var(--primary)] hover:underline"
            >
              Set up a trip
            </button>
          }
        />
      </div>
    );
  }

  async function startDirect(playbook: Playbook, title: string | null) {
    if (!instanceId) return;
    setStarting(false);
    setStartError(null);
    setOpening(true);
    const started = await beginRun(instanceId, playbook, null);
    setOpening(false);
    if (!started.ok) {
      setStartError("Couldn't start that. Try again.");
      return;
    }
    setRunning({ playbook, run: started.data, directTitle: title });
  }

  if (running && instanceId) {
    return (
      <CompanionRun
        instanceId={instanceId}
        playbook={running.playbook}
        booking={null}
        run={running.run}
        existingThreads={threads}
        directTitle={running.directTitle}
        onFinished={(result) => {
          if (result.thread) upsertThread(result.thread);
          setRunning(null);
          setClosingNote("Recorded.");
        }}
        onLeft={() => setRunning(null)}
      />
    );
  }

  if (starting) {
    return <StartCompanion playbooks={PLAYBOOKS} onStart={startDirect} onCancel={() => setStarting(false)} />;
  }

  if (opening) {
    return <p className="text-[13px] text-[var(--faint)]">Opening...</p>;
  }

  const now = new Date();
  const view = deriveToday(bookings, now, threads);
  const where = whereWeAre(places, now);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
          {currentTrip.title.toUpperCase()}
        </p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          Today
        </h1>
        {where && <p className="mt-1 text-[13px] text-[var(--muted)]">Currently in {where.name}</p>}
      </header>

      {view.quiet && (
        <p className="text-[14px] leading-6 text-[var(--muted)]">Nothing scheduled for today, right now.</p>
      )}

      {closingNote && <p className="text-[13px] text-[var(--muted)]">{closingNote}</p>}

      {view.now.length > 0 && (
        <section className="flex flex-col gap-2">
          {view.now.map((row) => (
            <div key={row.booking.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-[15px] leading-6 text-[var(--text)]">{row.line}</p>
              {row.booking.location && <p className="mt-1 text-[13px] text-[var(--muted)]">{row.booking.location}</p>}
              {row.booking.bookingStatus === "waiting" && (
                <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                  Awaiting confirmation
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {view.important.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Important</p>
          <div className="mt-2 flex flex-col gap-2">
            {view.important.map((row) => (
              <p key={row.booking.id} className="text-[14px] leading-6 text-[var(--text)]">
                {row.line}
              </p>
            ))}
          </div>
        </section>
      )}

      {view.later.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Later</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {view.later.map((row) => (
              <p key={row.booking.id} className="text-[13px] leading-6 text-[var(--muted)]">
                {row.line}
              </p>
            ))}
          </div>
        </section>
      )}

      {view.waiting.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Waiting</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {view.waiting.map((row) => (
              <p key={row.thread.id} className="text-[13px] leading-6 text-[var(--muted)]">
                {row.line}
              </p>
            ))}
          </div>
        </section>
      )}

      <div>
        <Button variant="ghost" size="sm" onClick={() => setStarting(true)}>
          Need help with something?
        </Button>
        {startError && <p className="mt-2 text-[13px] text-[var(--danger)]">{startError}</p>}
      </div>
    </div>
  );
}
