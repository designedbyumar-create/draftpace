"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import EmptyState from "@/design-system/EmptyState";
import { textLinkClassName } from "@/design-system/textLinkStyles";
import { ArrowLeft, Clock } from "@/design-system/Icon";
import { useHistoricTrip } from "./useHistoricTrip";
import { deriveItinerary } from "../itinerary";
import { deriveTripRecord } from "../tripRecord";
import { updateTrip } from "../domain/travelData";
import ItineraryView, { dayLabel } from "./ItineraryView";
import { BOOKING_KIND_INFO, type BookingKind } from "../trip";

const KIND_LABEL = (kind: BookingKind): string => BOOKING_KIND_INFO[kind].label;

function rangeLabel(range: { from: string; to: string } | null): string | null {
  if (!range) return null;
  const format = (date: string) =>
    new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return range.from === range.to ? format(range.from) : `${format(range.from)} to ${format(range.to)}`;
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/**
 * One concluded trip, read only, plus its memories.
 *
 * Reuses the itinerary derivation and view wholesale (readOnly, no per
 * day Add), because a past trip's day-by-day shape is exactly what it
 * was while active. Travellers get a small hand-written list rather
 * than reusing PeopleModule, which is mutation-coupled to the current
 * trip and would need its own read-only fork to reuse safely here.
 * Documents and preparation are left out of this v1 detail view; the
 * printed trip record covers documents, the fuller list a person
 * would want on paper.
 */
export default function TravelHistoryDetailModule() {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;
  const { status, errorMessage, trip, people, places, bookings, documents, recordEntries, replaceTrip } = useHistoricTrip(tripId);
  const [editingMemory, setEditingMemory] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [linkDraft, setLinkDraft] = useState("");
  const [savingMemory, setSavingMemory] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  if (status === "loading") return <p className="text-body-sm text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Clock} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "not-found") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <EmptyState icon={Clock} title="Trip not found" description="This trip isn't in your travel history." />
        <Link href="/app/products/travel-companion/travel-history" className={textLinkClassName()}>
          Back to travel history
        </Link>
      </div>
    );
  }
  if (status === "error") {
    return <EmptyState icon={Clock} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!trip) return null;

  function startEditingMemory() {
    setNoteDraft(trip!.memoryNote ?? "");
    setLinkDraft(trip!.memoryLink ?? "");
    setMemoryError(null);
    setEditingMemory(true);
  }

  async function saveMemory() {
    setSavingMemory(true);
    setMemoryError(null);
    const result = await updateTrip(trip!.id, {
      memoryNote: noteDraft.trim() || null,
      memoryLink: linkDraft.trim() || null,
    });
    setSavingMemory(false);
    if (!result.ok) {
      setMemoryError("Couldn't save that. Try again.");
      return;
    }
    replaceTrip(result.data);
    setEditingMemory(false);
  }

  async function printRecord() {
    setPrinting(true);
    setPrintError(null);
    try {
      const { downloadTripRecord } = await import("../printables/download");
      const record = deriveTripRecord({ trip: trip!, people, places, bookings, documents, recordEntries });
      await downloadTripRecord({ record, size: /^en-(US|CA)/.test(navigator.language) ? "LETTER" : "A4" });
    } catch {
      setPrintError("The trip record could not be made. Nothing was downloaded.");
    } finally {
      setPrinting(false);
    }
  }

  const itinerary = deriveItinerary({ trip, bookings, places });
  const days = itinerary.days.map((day) => ({ date: day.date, label: dayLabel(day.date), place: day.place, stops: day.stops }));
  const range = rangeLabel(itinerary.range);
  const activePeople = people.filter((p) => p.status === "active");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7">
      <div>
        <Link href="/app/products/travel-companion/travel-history" className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-[var(--muted)] hover:text-[var(--text)]">
          <ArrowLeft size={14} aria-hidden />
          Travel history
        </Link>
        <header className="mt-3">
          <p className="text-eyebrow font-bold uppercase text-[var(--primary)]">Travel history</p>
          <h1 className="mt-2 text-heading text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
            {trip.title}
          </h1>
          {(range || trip.destinationSummary) && (
            <p className="mt-1 text-body-sm text-[var(--muted)]">{[range, trip.destinationSummary].filter(Boolean).join(" · ")}</p>
          )}
        </header>
      </div>

      <section>
        <p className="text-eyebrow font-bold uppercase text-[var(--muted)]">Memories</p>
        {editingMemory ? (
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div>
              <label htmlFor="memory-note" className="mb-1.5 block text-body-sm font-semibold text-[var(--text)]">
                A note
              </label>
              <textarea
                id="memory-note"
                rows={4}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="What you want to remember about this trip"
                className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-body-lg leading-relaxed text-[var(--text)] placeholder-[var(--faint)] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
              />
            </div>
            <Input
              label="A link"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              placeholder="A shared album, a drive folder, anything kept elsewhere"
            />
            {memoryError && <p className="text-body-sm text-[var(--danger)]">{memoryError}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="commit" size="sm" disabled={savingMemory} onClick={saveMemory}>
                {savingMemory ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" size="sm" disabled={savingMemory} onClick={() => setEditingMemory(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : trip.memoryNote || trip.memoryLink ? (
          <div className="mt-2 flex flex-col items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            {trip.memoryNote && <p className="whitespace-pre-line text-body-sm leading-6 text-[var(--text)]">{trip.memoryNote}</p>}
            {trip.memoryLink && (
              <a href={trip.memoryLink} target="_blank" rel="noreferrer" className={textLinkClassName()}>
                {trip.memoryLink}
              </a>
            )}
            <button type="button" onClick={startEditingMemory} className={textLinkClassName()}>
              Edit
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-body-sm text-[var(--muted)]">Nothing saved yet.</p>
            <button type="button" onClick={startEditingMemory} className={textLinkClassName({ className: "mt-1" })}>
              Add a memory
            </button>
          </div>
        )}
      </section>

      {activePeople.length > 0 && (
        <section>
          <p className="text-eyebrow font-bold uppercase text-[var(--muted)]">Travellers</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {activePeople.map((person) => (
              <li key={person.id} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-body-sm text-[var(--text)]">
                {person.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recordEntries.length > 0 && (
        <section>
          <p className="text-eyebrow font-bold uppercase text-[var(--muted)]">What happened</p>
          <ul className="mt-2 flex flex-col gap-2">
            {[...recordEntries]
              .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
              .map((entry) => (
                <li key={entry.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">
                    {dateLabel(entry.createdAt)} · {entry.category}
                  </p>
                  <p className="mt-1 text-body-sm leading-6 text-[var(--text)]">
                    {entry.placeName ? `${entry.body} (${entry.placeName})` : entry.body}
                  </p>
                </li>
              ))}
          </ul>
        </section>
      )}

      <ItineraryView
        tripTitle={trip.title.toUpperCase()}
        rangeLabel={range}
        days={days}
        undated={itinerary.undated.map((booking) => ({ id: booking.id, title: booking.title, kindLabel: KIND_LABEL(booking.kind) }))}
        compact={itinerary.compact}
        onAdd={() => {}}
        readOnly
        actions={
          <Button variant="secondary" size="sm" disabled={printing} onClick={printRecord}>
            {printing ? "Preparing..." : "Print this trip's record"}
          </Button>
        }
      />
      {printError && <p className="text-body-sm text-[var(--danger)]">{printError}</p>}
    </div>
  );
}
