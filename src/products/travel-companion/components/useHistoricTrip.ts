"use client";

import { useCallback, useEffect, useState } from "react";
import { describeResultError } from "@/product-framework/result";
import { findTravelCompanionInstanceId } from "../instanceData";
import {
  loadTrips,
  loadPeople,
  loadPlaces,
  loadBookings,
  loadBookingParticipants,
  loadDocuments,
  loadRecordEntries,
  type BookingParticipant,
} from "../domain/travelData";
import type { Booking, Person, Place, RecordEntry, Trip, TravelDocument } from "../trip";

export type HistoricTripLoadStatus = "loading" | "ready" | "no-instance" | "not-found" | "error";

/**
 * A single concluded trip, read only.
 *
 * Same "list everything, find by id" shape as the home item detail
 * screen: there is no single-trip load function, and adding one for a
 * page that only exists once per trip would be a second way to fetch a
 * trip for no real gain. A trip that is not past or archived redirects
 * back to Trip, its own live screen, rather than showing a read-only
 * copy of something still in progress.
 */
export function useHistoricTrip(tripId: string) {
  const [status, setStatus] = useState<HistoricTripLoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [participants, setParticipants] = useState<BookingParticipant[]>([]);
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [recordEntries, setRecordEntries] = useState<RecordEntry[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const found = await findTravelCompanionInstanceId();
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

    const tripsResult = await loadTrips(found.id);
    if (!tripsResult.ok) {
      setErrorMessage(describeResultError(tripsResult.error));
      setStatus("error");
      return;
    }
    const match = tripsResult.data.find((candidate) => candidate.id === tripId && candidate.status === "past");
    if (!match) {
      setStatus("not-found");
      return;
    }
    setTrip(match);

    const [peopleResult, placesResult, bookingsResult, participantsResult, documentsResult, recordEntriesResult] = await Promise.all([
      loadPeople(tripId),
      loadPlaces(tripId),
      loadBookings(tripId),
      loadBookingParticipants(tripId),
      loadDocuments(tripId),
      loadRecordEntries(tripId),
    ]);
    if (!peopleResult.ok) {
      setErrorMessage(describeResultError(peopleResult.error));
      setStatus("error");
      return;
    }
    if (!placesResult.ok) {
      setErrorMessage(describeResultError(placesResult.error));
      setStatus("error");
      return;
    }
    if (!bookingsResult.ok) {
      setErrorMessage(describeResultError(bookingsResult.error));
      setStatus("error");
      return;
    }
    if (!participantsResult.ok) {
      setErrorMessage(describeResultError(participantsResult.error));
      setStatus("error");
      return;
    }
    if (!documentsResult.ok) {
      setErrorMessage(describeResultError(documentsResult.error));
      setStatus("error");
      return;
    }
    if (!recordEntriesResult.ok) {
      setErrorMessage(describeResultError(recordEntriesResult.error));
      setStatus("error");
      return;
    }
    setPeople(peopleResult.data);
    setPlaces(placesResult.data);
    setBookings(bookingsResult.data);
    setParticipants(participantsResult.data);
    setDocuments(documentsResult.data);
    setRecordEntries(recordEntriesResult.data);
    setStatus("ready");
  }, [tripId]);

  useEffect(() => {
    load();
  }, [load]);

  const replaceTrip = useCallback((updated: Trip) => {
    setTrip((current) => (current && current.id === updated.id ? updated : current));
  }, []);

  return { status, errorMessage, instanceId, trip, people, places, bookings, participants, documents, recordEntries, load, replaceTrip };
}
