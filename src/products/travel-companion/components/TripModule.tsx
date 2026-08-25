"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Globe, Plus } from "@/design-system/Icon";
import { byStartTime, descendantsOf, type Booking } from "../trip";
import { useTravelCompanion } from "./useTravelCompanion";
import TripSetupForm from "./TripSetupForm";
import PlaceForm from "./PlaceForm";
import BookingForm from "./BookingForm";
import DocumentForm from "./DocumentForm";
import PreparationForm from "./PreparationForm";
import RecordChangeForm from "./RecordChangeForm";
import CompanionRun from "./CompanionRun";
import { findResumableRun, beginRun } from "./useResumableRun";
import { playbooksForBooking, PLAYBOOK_BY_KEY } from "../playbooks";
import { setPreparationCompletion, createPreparationItem, loadRecordEntriesForPlaceNames, type RunRecord } from "../domain/travelData";
import type { Playbook } from "@/components/product-shell/companion/steps";
import PlaybookChooser from "@/components/product-shell/companion/PlaybookChooser";
import type { Place, PreparationCategory, RecordCategory, RecordEntry } from "../trip";

/**
 * Where a past trip's own record entry lands on this trip's preparation
 * list. Not load-bearing: whichever bucket it starts in, moving it is
 * one edit, and nothing about the match itself depends on getting this
 * right.
 */
function toPreparationCategory(category: RecordCategory): PreparationCategory {
  if (category === "transport") return "transport";
  if (category === "reservation") return "bookings";
  return "packing";
}

const SOMETHING_CHANGED = PLAYBOOK_BY_KEY["something-changed"];

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/**
 * Trip.
 *
 * The whole connected trip: destinations, and the bookings anchored to
 * them, each showing the one relationship the product is built around,
 * what it depends on, when there is one, rather than a flat list of
 * reservations with no memory of how they fit together.
 */
export default function TripModule() {
  const {
    status,
    errorMessage,
    instanceId,
    trips,
    currentTrip,
    places,
    bookings,
    people,
    participants,
    documents,
    preparation,
    threads,
    recordEntries,
    addTrip,
    addPlace,
    addBooking,
    addParticipants,
    replaceBooking,
    addDocument,
    addPreparationItem,
    replacePreparationItem,
    upsertThread,
  } = useTravelCompanion();
  const [settingUp, setSettingUp] = useState(false);
  const [addingPlace, setAddingPlace] = useState(false);
  const [addingBooking, setAddingBooking] = useState(false);
  const [addingDocument, setAddingDocument] = useState(false);
  const [addingPreparation, setAddingPreparation] = useState(false);
  const [running, setRunning] = useState<{ playbook: Playbook; booking: Booking; run: RunRecord } | null>(null);
  const [choosingFor, setChoosingFor] = useState<Booking | null>(null);
  const [recordingChangeFor, setRecordingChangeFor] = useState<Booking | null>(null);
  const [impact, setImpact] = useState<{ source: Booking; affected: Booking[] } | null>(null);
  const [placeMatches, setPlaceMatches] = useState<{ place: Place; entries: RecordEntry[] } | null>(null);
  const [addedFromMatch, setAddedFromMatch] = useState<Set<string>>(new Set());
  const [bookSize, setBookSize] = useState<"LETTER" | "A4">("LETTER");
  const [makingBook, setMakingBook] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Globe} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Globe} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
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
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Trip</p>
        </header>
        <EmptyState
          icon={Globe}
          title={trips.length === 0 ? "No trip yet" : "Nothing currently in progress"}
          description="Set up a trip to start connecting the people, places and bookings it depends on."
          action={
            <button type="button" onClick={() => setSettingUp(true)} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
              Set up a trip
            </button>
          }
        />
      </div>
    );
  }

  /**
   * Opening the Companion for a booking with an open run already picks
   * it back up instead of asking again what is in the way. Only when
   * nothing is in progress does the chooser appear, filtered to the
   * situations that make sense for this booking's own kind.
   */
  async function openCompanionFor(booking: Booking) {
    if (!instanceId) return;
    setStartError(null);
    setOpening(true);
    const resumable = await findResumableRun(instanceId, booking.id);
    setOpening(false);
    if (resumable) {
      setRunning({ playbook: resumable.playbook, booking, run: resumable.run });
      return;
    }
    setChoosingFor(booking);
  }

  async function pickPlaybook(booking: Booking, playbook: Playbook) {
    if (!instanceId) return;
    setChoosingFor(null);
    setImpact(null);
    setOpening(true);
    const started = await beginRun(instanceId, playbook, booking.id);
    setOpening(false);
    if (!started.ok) {
      setStartError("Couldn't start that. Try again.");
      return;
    }
    setRunning({ playbook, booking, run: started.data });
  }

  /**
   * The change-impact walk (proposal §13), step 2 and 3: once a change
   * is saved, walk descendantsOf from the updated booking and show every
   * downstream booking as "potentially affected," never auto-edited.
   * Nothing is walked upward, same rule as trip.ts's own descendantsOf.
   */
  function onBookingChanged(updated: Booking) {
    replaceBooking(updated);
    setRecordingChangeFor(null);
    const updatedBookings = bookings.map((booking) => (booking.id === updated.id ? updated : booking));
    const affected = descendantsOf(updatedBookings, updated.id);
    setImpact(affected.length > 0 ? { source: updated, affected } : null);
  }

  async function togglePreparationDone(itemId: string, currentlyDone: boolean) {
    const result = await setPreparationCompletion(itemId, currentlyDone ? "open" : "done");
    if (result.ok) replacePreparationItem(result.data);
  }

  /**
   * My Trip Book, made from exactly what this screen already shows.
   * Dynamically imported so @react-pdf/renderer never reaches the main
   * bundle, same discipline as every sibling's own printable.
   */
  async function generateTripBook() {
    if (!currentTrip) return;
    setMakingBook(true);
    setBookError(null);
    try {
      const { downloadTripBook } = await import("../printables/download");
      await downloadTripBook({
        trip: currentTrip,
        people,
        places,
        bookings,
        documents,
        preparation,
        threads,
        recordEntries,
        generatedAt: new Date(),
        size: bookSize,
      });
    } catch {
      // A failed generation must never look like a saved download.
      setBookError("The book could not be made. Nothing was downloaded.");
    } finally {
      setMakingBook(false);
    }
  }

  /**
   * Proposal §16's future-trip surfacing: deterministic, case-insensitive
   * matching only, never fuzzy, never a model call. Runs once a
   * destination is added; offers what a past trip recorded about the
   * same place, and adds nothing until the traveller explicitly clicks.
   */
  async function onPlaceAdded(place: Place) {
    addPlace(place);
    setAddingPlace(false);
    if (!instanceId || !currentTrip) return;
    const matched = await loadRecordEntriesForPlaceNames(instanceId, currentTrip.id, [place.name]);
    if (matched.ok && matched.data.length > 0) {
      setPlaceMatches({ place, entries: matched.data });
    }
  }

  async function addMatchToPreparation(entry: RecordEntry) {
    if (!instanceId || !currentTrip) return;
    const result = await createPreparationItem(instanceId, currentTrip.id, {
      category: toPreparationCategory(entry.category),
      title: entry.body,
    });
    if (result.ok) {
      addPreparationItem(result.data);
      setAddedFromMatch((current) => new Set(current).add(entry.id));
    }
  }

  if (running && instanceId) {
    return (
      <CompanionRun
        instanceId={instanceId}
        playbook={running.playbook}
        booking={running.booking}
        run={running.run}
        existingThreads={threads}
        onFinished={(result) => {
          if (result.booking) replaceBooking(result.booking);
          if (result.thread) upsertThread(result.thread);
          setRunning(null);
        }}
        onLeft={() => setRunning(null)}
      />
    );
  }

  if (opening) {
    return <p className="text-[13px] text-[var(--faint)]">Opening...</p>;
  }

  const byId = new Map(bookings.map((booking) => [booking.id, booking]));
  const participantsByBooking = new Map<string, string[]>();
  for (const link of participants) {
    const names = participantsByBooking.get(link.bookingId) ?? [];
    const person = people.find((p) => p.id === link.personId);
    if (person) names.push(person.name);
    participantsByBooking.set(link.bookingId, names);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Trip</p>
        <h1 className="mt-2 text-[26px] leading-tight text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
          {currentTrip.title}
        </h1>
        {(currentTrip.startsAt || currentTrip.endsAt) && (
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            {currentTrip.startsAt ?? "?"} – {currentTrip.endsAt ?? "?"}
          </p>
        )}
      </header>

      <section>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Destinations</p>
          {!addingPlace && (
            <Button size="sm" variant="ghost" onClick={() => setAddingPlace(true)} iconLeft={<Plus size={14} aria-hidden />}>
              Add
            </Button>
          )}
        </div>
        {addingPlace && (
          <div className="mt-2">
            <PlaceForm
              instanceId={instanceId}
              tripId={currentTrip.id}
              nextOrdinal={places.length}
              onAdded={onPlaceAdded}
              onCancel={() => setAddingPlace(false)}
            />
          </div>
        )}
        {places.length === 0 && !addingPlace && (
          <p className="mt-2 text-[13px] text-[var(--faint)]">No destinations recorded yet.</p>
        )}
        {places.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {places.map((place) => (
              <li
                key={place.id}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[13px] text-[var(--text)]"
              >
                {place.name}
              </li>
            ))}
          </ul>
        )}
        {placeMatches && (
          <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3.5">
            <p className="text-[12px] font-semibold text-[var(--text)]">From a past trip to {placeMatches.place.name}:</p>
            <ul className="mt-2 flex flex-col gap-2">
              {placeMatches.entries.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] text-[var(--text)]">{entry.body}</span>
                  {addedFromMatch.has(entry.id) ? (
                    <span className="text-[12px] text-[var(--faint)]">Added.</span>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => addMatchToPreparation(entry)}>
                      Add to preparation
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setPlaceMatches(null)}
              className="mt-2 text-[12px] font-semibold text-[var(--faint)] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Bookings</p>
          {!addingBooking && (
            <Button size="sm" variant="ghost" onClick={() => setAddingBooking(true)} iconLeft={<Plus size={14} aria-hidden />}>
              Add
            </Button>
          )}
        </div>

        {addingBooking && (
          <div className="mt-2">
            <BookingForm
              instanceId={instanceId}
              tripId={currentTrip.id}
              places={places}
              existingBookings={bookings}
              people={people}
              onAdded={(booking, links) => {
                addBooking(booking);
                addParticipants(links);
                setAddingBooking(false);
              }}
              onCancel={() => setAddingBooking(false)}
            />
          </div>
        )}

        {bookings.length === 0 && !addingBooking && (
          <p className="mt-2 text-[13px] text-[var(--faint)]">No bookings recorded yet.</p>
        )}

        <ul className="mt-2 flex flex-col gap-2">
          {byStartTime(bookings).map((booking) => {
            const dependsOn = booking.dependsOnBookingId ? byId.get(booking.dependsOnBookingId) : null;
            const names = participantsByBooking.get(booking.id) ?? [];
            const place = places.find((p) => p.id === booking.placeId);
            return (
              <li key={booking.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">{booking.kind}</p>
                    <p className="mt-0.5 text-[15px] font-medium text-[var(--text)]">{booking.title}</p>
                  </div>
                  {booking.bookingStatus === "waiting" && (
                    <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                      Awaiting confirmation
                    </span>
                  )}
                </div>
                {booking.startsAt && <p className="mt-1 text-[13px] text-[var(--muted)]">{timeLabel(booking.startsAt)}</p>}
                {place && <p className="mt-0.5 text-[13px] text-[var(--muted)]">{place.name}</p>}
                {booking.reference && <p className="mt-0.5 text-[12px] text-[var(--faint)]">Ref: {booking.reference}</p>}
                {dependsOn && (
                  <p className="mt-1.5 text-[12px] text-[var(--faint)]">Depends on {dependsOn.title}</p>
                )}
                {names.length > 0 && <p className="mt-1.5 text-[12px] text-[var(--faint)]">{names.join(", ")}</p>}
                {booking.notes && <p className="mt-1.5 whitespace-pre-line text-[13px] leading-5 text-[var(--muted)]">{booking.notes}</p>}
                {choosingFor?.id === booking.id ? (
                  <div className="mt-3">
                    <PlaybookChooser
                      available={playbooksForBooking(booking.kind)}
                      onPick={(playbook) => pickPlaybook(booking, playbook)}
                      onCancel={() => setChoosingFor(null)}
                    />
                  </div>
                ) : recordingChangeFor?.id === booking.id ? (
                  <div className="mt-3">
                    <RecordChangeForm
                      booking={booking}
                      existingBookings={bookings}
                      onChanged={onBookingChanged}
                      onCancel={() => setRecordingChangeFor(null)}
                    />
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-4">
                    <Button size="sm" variant="ghost" onClick={() => openCompanionFor(booking)}>
                      Sort out a problem with this
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setRecordingChangeFor(booking)}>
                      Record a change
                    </Button>
                  </div>
                )}
                {impact?.source.id === booking.id && (
                  <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3.5">
                    <p className="text-[12px] font-semibold text-[var(--text)]">
                      This might affect {impact.affected.length === 1 ? "this" : `these ${impact.affected.length}`}, unchanged so far:
                    </p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {impact.affected.map((affected) => (
                        <li key={affected.id} className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[13px] text-[var(--text)]">
                            {affected.title}
                            {affected.startsAt && <span className="text-[var(--muted)]"> · {timeLabel(affected.startsAt)}</span>}
                          </span>
                          {SOMETHING_CHANGED && (
                            <Button size="sm" variant="ghost" onClick={() => pickPlaybook(affected, SOMETHING_CHANGED)}>
                              Deal with what changed
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setImpact(null)}
                      className="mt-2 text-[12px] font-semibold text-[var(--faint)] hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Documents</p>
          {!addingDocument && (
            <Button size="sm" variant="ghost" onClick={() => setAddingDocument(true)} iconLeft={<Plus size={14} aria-hidden />}>
              Add
            </Button>
          )}
        </div>

        {addingDocument && (
          <div className="mt-2">
            <DocumentForm
              instanceId={instanceId}
              tripId={currentTrip.id}
              people={people}
              onAdded={(document) => {
                addDocument(document);
                setAddingDocument(false);
              }}
              onCancel={() => setAddingDocument(false)}
            />
          </div>
        )}

        {documents.length === 0 && !addingDocument && (
          <p className="mt-2 text-[13px] text-[var(--faint)]">Nothing recorded yet.</p>
        )}

        {documents.length > 0 && (
          <ul className="mt-2 flex flex-col gap-2">
            {documents.map((document) => {
              const person = document.personId ? people.find((p) => p.id === document.personId) : null;
              return (
                <li key={document.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">{document.kind}</p>
                  <p className="mt-0.5 text-[14px] font-medium text-[var(--text)]">{document.label}</p>
                  {person && <p className="mt-0.5 text-[13px] text-[var(--muted)]">{person.name}</p>}
                  {document.keptWhere && <p className="mt-0.5 text-[13px] text-[var(--muted)]">{document.keptWhere}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Preparation</p>
          {!addingPreparation && (
            <Button size="sm" variant="ghost" onClick={() => setAddingPreparation(true)} iconLeft={<Plus size={14} aria-hidden />}>
              Add
            </Button>
          )}
        </div>

        {addingPreparation && (
          <div className="mt-2">
            <PreparationForm
              instanceId={instanceId}
              tripId={currentTrip.id}
              onAdded={(item) => {
                addPreparationItem(item);
                setAddingPreparation(false);
              }}
              onCancel={() => setAddingPreparation(false)}
            />
          </div>
        )}

        {preparation.length === 0 && !addingPreparation && (
          <p className="mt-2 text-[13px] text-[var(--faint)]">Nothing on the list yet.</p>
        )}

        {preparation.length > 0 && (
          <ul className="mt-2 flex flex-col gap-2">
            {preparation.map((item) => {
              const done = item.completionStatus === "done";
              return (
                <li key={item.id} className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => togglePreparationDone(item.id, done)}
                    className="mt-0.5 accent-[var(--primary)]"
                  />
                  <div>
                    <p className={`text-[14px] ${done ? "text-[var(--faint)] line-through" : "text-[var(--text)]"}`}>{item.title}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">{item.category}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">My Trip Book</p>
        <p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">
          A printable copy of this trip, plus method chapters on travelling with less held in your head. Everything on
          this screen, gathered onto paper.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(["LETTER", "A4"] as const).map((option) => (
            <Button key={option} size="sm" variant={bookSize === option ? "primary" : "secondary"} onClick={() => setBookSize(option)}>
              {option === "LETTER" ? "US Letter" : "A4"}
            </Button>
          ))}
          <Button size="sm" disabled={makingBook} onClick={generateTripBook}>
            {makingBook ? "Preparing..." : "Generate My Trip Book"}
          </Button>
        </div>
        {bookError && <p className="mt-2 text-[13px] text-[var(--danger)]">{bookError}</p>}
      </section>

      {startError && <p className="text-[13px] text-[var(--danger)]">{startError}</p>}
      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
    </div>
  );
}
