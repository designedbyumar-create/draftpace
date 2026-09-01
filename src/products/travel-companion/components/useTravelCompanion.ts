"use client";

import { useCallback, useEffect, useState } from "react";
import { describeResultError } from "@/product-framework/result";
import { findTravelCompanionInstanceId } from "../instanceData";
import {
  loadBookingParticipants,
  loadBookings,
  loadDocuments,
  loadPeople,
  loadPlaces,
  loadPreparation,
  loadRecordEntries,
  loadThreads,
  loadTrips,
  type BookingParticipant,
} from "../domain/travelData";
import type { Booking, Person, Place, PreparationItem, RecordEntry, Thread, Trip, TravelDocument } from "../trip";

export type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Loading the graph, shared by Today, Trip and People.
 *
 * All three screens read the same trip's people, places and bookings,
 * derived fresh rather than cached separately per screen, the same
 * reasoning as Alongside's useAlongside.
 *
 * WHICH TRIP IS "CURRENT"
 *
 * The most recently created trip that is not past or archived. Good
 * enough for a v1 with realistically one active trip at a time; a real
 * switcher for "several trips in flight, none obviously current" is
 * listed in the proposal's screen inventory and not built yet. `trips`
 * is exposed in full so that UI can be added later without changing
 * how data loads.
 */
export function useTravelCompanion() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [participants, setParticipants] = useState<BookingParticipant[]>([]);
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [preparation, setPreparation] = useState<PreparationItem[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [recordEntries, setRecordEntries] = useState<RecordEntry[]>([]);

  const currentTrip = trips.find((trip) => trip.status === "planning" || trip.status === "active") ?? null;

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
    setTrips(tripsResult.data);

    const active = tripsResult.data.find((trip) => trip.status === "planning" || trip.status === "active");
    if (!active) {
      setPeople([]);
      setPlaces([]);
      setBookings([]);
      setParticipants([]);
      setDocuments([]);
      setPreparation([]);
      setThreads([]);
      setRecordEntries([]);
      setStatus("ready");
      return;
    }

    const [
      peopleResult,
      placesResult,
      bookingsResult,
      participantsResult,
      documentsResult,
      preparationResult,
      threadsResult,
      recordEntriesResult,
    ] = await Promise.all([
      loadPeople(active.id),
      loadPlaces(active.id),
      loadBookings(active.id),
      loadBookingParticipants(active.id),
      loadDocuments(active.id),
      loadPreparation(active.id),
      loadThreads(active.id),
      loadRecordEntries(active.id),
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
    if (!preparationResult.ok) {
      setErrorMessage(describeResultError(preparationResult.error));
      setStatus("error");
      return;
    }
    if (!threadsResult.ok) {
      setErrorMessage(describeResultError(threadsResult.error));
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
    setPreparation(preparationResult.data);
    setThreads(threadsResult.data);
    setRecordEntries(recordEntriesResult.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTrip = useCallback((created: Trip) => {
    setTrips((current) => [created, ...current]);
  }, []);

  const replacePerson = useCallback((updated: Person) => {
    setPeople((current) => current.map((person) => (person.id === updated.id ? updated : person)));
  }, []);
  const addPerson = useCallback((created: Person) => {
    setPeople((current) => [...current, created]);
  }, []);

  const replacePlace = useCallback((updated: Place) => {
    setPlaces((current) => current.map((place) => (place.id === updated.id ? updated : place)));
  }, []);
  const addPlace = useCallback((created: Place) => {
    setPlaces((current) => [...current, created].sort((a, b) => a.ordinal - b.ordinal));
  }, []);

  const replaceBooking = useCallback((updated: Booking) => {
    setBookings((current) => current.map((booking) => (booking.id === updated.id ? updated : booking)));
  }, []);
  const addBooking = useCallback((created: Booking) => {
    setBookings((current) => [...current, created]);
  }, []);
  const addParticipants = useCallback((created: BookingParticipant[]) => {
    setParticipants((current) => [...current, ...created]);
  }, []);

  const addDocument = useCallback((created: TravelDocument) => {
    setDocuments((current) => [...current, created]);
  }, []);

  const addPreparationItem = useCallback((created: PreparationItem) => {
    setPreparation((current) => [...current, created]);
  }, []);
  const replacePreparationItem = useCallback((updated: PreparationItem) => {
    setPreparation((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  /** Opened or resolved, either way it either replaces its own row or is new. */
  const upsertThread = useCallback((thread: Thread) => {
    setThreads((current) => (current.some((t) => t.id === thread.id) ? current.map((t) => (t.id === thread.id ? thread : t)) : [...current, thread]));
  }, []);

  const addRecordEntry = useCallback((created: RecordEntry) => {
    setRecordEntries((current) => [created, ...current]);
  }, []);

  return {
    status,
    errorMessage,
    setErrorMessage,
    instanceId,
    trips,
    currentTrip,
    people,
    places,
    bookings,
    participants,
    documents,
    preparation,
    threads,
    recordEntries,
    load,
    addTrip,
    replacePerson,
    addPerson,
    replacePlace,
    addPlace,
    replaceBooking,
    addBooking,
    addParticipants,
    addDocument,
    addPreparationItem,
    replacePreparationItem,
    upsertThread,
    addRecordEntry,
  };
}
