"use client";

import FirstRunTour from "@/components/platform/FirstRunTour";
import { TRAVEL_COMPANION_SLUG } from "../instanceData";
import type { TourStep } from "@/components/platform/GuidedTour";
import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import { Compass } from "@/design-system/Icon";
import { deriveToday, describeStop, whereWeAre } from "../today";
import type { Booking } from "../trip";
import { useTravelCompanion } from "./useTravelCompanion";
import TodayView, { type DayStop } from "./TodayView";
import TripStart from "./TripStart";
import CompanionRun from "./CompanionRun";
import StartCompanion from "@/components/product-shell/companion/StartCompanion";
import { beginRun } from "./useResumableRun";
import { PLAYBOOKS } from "../playbooks";
import type { Playbook } from "@/components/product-shell/companion/steps";
import type { RunRecord } from "../domain/travelData";
import { useState } from "react";

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "travel-tour-start",
    title: "Start with a name and dates",
    body:
      "That is all a trip needs to exist. You will see it laid out day by day straight away, and add what you have booked from there.",
  },
  {
    targetId: "rail-itinerary",
    title: "The whole trip, day by day",
    body:
      "Every booking on one line, with what you are still waiting on. A day with nothing recorded says so, and never fills it in for you.",
  },
  {
    targetId: "rail-trip",
    title: "Where the details live",
    body:
      "Destinations, bookings, documents. Say once what a booking depends on and it remembers the shape of your trip for you.",
  },
  {
    targetId: "rail-workspace",
    title: "Then come back here",
    body:
      "Today shows what is happening, what is worth knowing about, and what you are still waiting to hear back on.",
  },
  {
    targetId: "rail-people",
    title: "Who is travelling",
    body:
      "Their documents and requirements, so the answer at a desk is three seconds away.",
  },
];

/**
 * Today.
 *
 * The current operational state, derived on read from the current
 * trip's bookings, never a manual task list. Quiet is a real, honest
 * answer here, same as every Companion on this platform: a day with
 * nothing stored says so and stops.
 */
export default function TodayModule() {
  const { status, errorMessage, instanceId, currentTrip, places, bookings, threads, addTrip, upsertThread } = useTravelCompanion();
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
    return (
      <EmptyState icon={Compass} title="Couldn't load this" description={errorMessage ?? "Try again."} />
    );
  }
  if (!instanceId) return null;

  if (!currentTrip) {
    return (
      <>
        <FirstRunTour slug={TRAVEL_COMPANION_SLUG} steps={TOUR_STEPS} />
        <TripStart instanceId={instanceId} onCreated={addTrip} />
      </>
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
  const view = deriveToday(bookings, now, threads, places);
  const where = whereWeAre(places, now);

  const stop = (booking: Booking): DayStop => ({
    ...describeStop(booking),
    id: booking.id,
    location: booking.location,
    awaiting: booking.bookingStatus === "waiting",
  });
  const laterGroups = (["Tomorrow", "In two days"] as const)
    .map((label) => ({ label, stops: view.later.filter((row) => row.day === label).map((row) => stop(row.booking)) }))
    .filter((group) => group.stops.length > 0);

  const today = now.toISOString().slice(0, 10);
  const starts = currentTrip.startsAt ? currentTrip.startsAt.slice(0, 10) : null;
  const startsFact =
    starts && starts > today
      ? `Your trip starts ${new Date(`${starts}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}.`
      : null;

  return (
    <TodayView
      tripTitle={currentTrip.title.toUpperCase()}
      where={where?.name ?? null}
      quiet={view.quiet}
      closingNote={closingNote}
      today={view.now.map((row) => stop(row.booking))}
      important={view.important.map((row) => stop(row.booking))}
      later={laterGroups}
      waiting={view.waiting.map((row) => ({ id: row.thread.id, title: row.line }))}
      note={
        view.now.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            {startsFact && <p className="text-[15px] leading-6 text-[var(--text)]">{startsFact}</p>}
            <Button
              href={`/app/products/${TRAVEL_COMPANION_SLUG}/itinerary`}
              variant="secondary"
              size="sm"
            >
              See the trip, day by day
            </Button>
          </div>
        ) : null
      }
      help={
        <>
          <Button variant="ghost" size="sm" onClick={() => setStarting(true)}>
            Need help with something?
          </Button>
          {startError && <p className="mt-2 text-[13px] text-[var(--danger)]">{startError}</p>}
        </>
      }
    />
  );
}
