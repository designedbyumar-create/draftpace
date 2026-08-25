"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import type { Booking, BookingKind, BookingStatus, Person, Place, Trip, TripStatus } from "../trip";
import { wouldCreateCycle } from "../trip";
import type { OutcomeKind } from "@/components/product-shell/companion/steps";
import { applyOutcome } from "../outcome";

/**
 * Everything this product reads from and writes to the database.
 *
 * One file per entity group would fragment the one thing Phase 1 is
 * actually building: the connected graph. A trip, its travellers, its
 * places and its bookings are read and written together far more often
 * than any one of them is read alone, so, same reasoning as Alongside
 * and Personal Life Affairs Companion, this stays one file.
 *
 * THE ONE RULE THIS FILE ENFORCES THAT THE SCHEMA CANNOT
 *
 * The database stops a booking depending on itself. It cannot stop A
 * depends on B depends on A. Every write that sets or changes
 * dependsOnBookingId below calls wouldCreateCycle first and refuses the
 * write rather than silently turning the tree into a graph.
 *
 * Nothing here deletes. Row level security has no delete policy on any
 * of these five tables; a row leaves by status, including
 * trv_booking_people, where a wrongly linked traveller is corrected by
 * archiving the link.
 */

async function currentUserId(): Promise<Result<string>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) return err({ kind: "network", message: error.message });
  if (!session) return err({ kind: "not-authenticated" });
  return ok(session.user.id);
}

// ------------------------------------------------------------------ trips

const TRIP_COLUMNS = "id, title, destination_summary, starts_at, ends_at, status, created_at";

function toTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as string,
    title: row.title as string,
    destinationSummary: (row.destination_summary as string | null) ?? null,
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    status: row.status as TripStatus,
    createdAt: row.created_at as string,
  };
}

export async function loadTrips(productInstanceId: string): Promise<Result<Trip[]>> {
  const { data, error } = await supabase
    .from("trv_trips")
    .select(TRIP_COLUMNS)
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (error) return err({ kind: "network", message: error.message });
  return ok(((data ?? []) as unknown as Record<string, unknown>[]).map(toTrip));
}

export interface NewTrip {
  title: string;
  destinationSummary?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export async function createTrip(productInstanceId: string, draft: NewTrip): Promise<Result<Trip>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data, error } = await supabase
    .from("trv_trips")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      title: draft.title.trim(),
      destination_summary: draft.destinationSummary?.trim() || null,
      starts_at: draft.startsAt ?? null,
      ends_at: draft.endsAt ?? null,
    })
    .select(TRIP_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not create that trip." });
  return ok(toTrip(data as unknown as Record<string, unknown>));
}

export type TripPatch = Partial<{
  title: string;
  destinationSummary: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: TripStatus;
}>;

const TRIP_PATCH_COLUMN: Record<keyof TripPatch, string> = {
  title: "title",
  destinationSummary: "destination_summary",
  startsAt: "starts_at",
  endsAt: "ends_at",
  status: "status",
};

export async function updateTrip(tripId: string, patch: TripPatch): Promise<Result<Trip>> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(patch)) {
    row[TRIP_PATCH_COLUMN[key as keyof TripPatch]] = value;
  }

  const { data, error } = await supabase.from("trv_trips").update(row).eq("id", tripId).select(TRIP_COLUMNS).single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });
  return ok(toTrip(data as unknown as Record<string, unknown>));
}

// ----------------------------------------------------------------- people

const PERSON_COLUMNS = "id, trip_id, name, is_child, relationship_note, requirements, status";

function toPerson(row: Record<string, unknown>): Person {
  return {
    id: row.id as string,
    tripId: row.trip_id as string,
    name: row.name as string,
    isChild: Boolean(row.is_child),
    relationshipNote: (row.relationship_note as string | null) ?? null,
    requirements: (row.requirements as string | null) ?? null,
    status: row.status as Person["status"],
  };
}

export async function loadPeople(tripId: string): Promise<Result<Person[]>> {
  const { data, error } = await supabase
    .from("trv_people")
    .select(PERSON_COLUMNS)
    .eq("trip_id", tripId)
    .neq("status", "archived")
    .order("created_at", { ascending: true });

  if (error) return err({ kind: "network", message: error.message });
  return ok(((data ?? []) as unknown as Record<string, unknown>[]).map(toPerson));
}

export interface NewPerson {
  name: string;
  isChild?: boolean;
  relationshipNote?: string | null;
  requirements?: string | null;
}

export async function createPerson(
  productInstanceId: string,
  tripId: string,
  draft: NewPerson
): Promise<Result<Person>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data, error } = await supabase
    .from("trv_people")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      trip_id: tripId,
      name: draft.name.trim(),
      is_child: draft.isChild ?? false,
      relationship_note: draft.relationshipNote?.trim() || null,
      requirements: draft.requirements?.trim() || null,
    })
    .select(PERSON_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not add that traveller." });
  return ok(toPerson(data as unknown as Record<string, unknown>));
}

export type PersonPatch = Partial<{
  name: string;
  isChild: boolean;
  relationshipNote: string | null;
  requirements: string | null;
  status: Person["status"];
}>;

const PERSON_PATCH_COLUMN: Record<keyof PersonPatch, string> = {
  name: "name",
  isChild: "is_child",
  relationshipNote: "relationship_note",
  requirements: "requirements",
  status: "status",
};

export async function updatePerson(personId: string, patch: PersonPatch): Promise<Result<Person>> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(patch)) {
    row[PERSON_PATCH_COLUMN[key as keyof PersonPatch]] = value;
  }

  const { data, error } = await supabase
    .from("trv_people")
    .update(row)
    .eq("id", personId)
    .select(PERSON_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });
  return ok(toPerson(data as unknown as Record<string, unknown>));
}

// ----------------------------------------------------------------- places

const PLACE_COLUMNS = "id, trip_id, name, ordinal, arrives_at, departs_at, status";

function toPlace(row: Record<string, unknown>): Place {
  return {
    id: row.id as string,
    tripId: row.trip_id as string,
    name: row.name as string,
    ordinal: row.ordinal as number,
    arrivesAt: (row.arrives_at as string | null) ?? null,
    departsAt: (row.departs_at as string | null) ?? null,
    status: row.status as Place["status"],
  };
}

export async function loadPlaces(tripId: string): Promise<Result<Place[]>> {
  const { data, error } = await supabase
    .from("trv_places")
    .select(PLACE_COLUMNS)
    .eq("trip_id", tripId)
    .neq("status", "archived")
    .order("ordinal", { ascending: true });

  if (error) return err({ kind: "network", message: error.message });
  return ok(((data ?? []) as unknown as Record<string, unknown>[]).map(toPlace));
}

export interface NewPlace {
  name: string;
  ordinal?: number;
  arrivesAt?: string | null;
  departsAt?: string | null;
}

export async function createPlace(
  productInstanceId: string,
  tripId: string,
  draft: NewPlace
): Promise<Result<Place>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data, error } = await supabase
    .from("trv_places")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      trip_id: tripId,
      name: draft.name.trim(),
      ordinal: draft.ordinal ?? 0,
      arrives_at: draft.arrivesAt ?? null,
      departs_at: draft.departsAt ?? null,
    })
    .select(PLACE_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not add that place." });
  return ok(toPlace(data as unknown as Record<string, unknown>));
}

export type PlacePatch = Partial<{
  name: string;
  ordinal: number;
  arrivesAt: string | null;
  departsAt: string | null;
  status: Place["status"];
}>;

const PLACE_PATCH_COLUMN: Record<keyof PlacePatch, string> = {
  name: "name",
  ordinal: "ordinal",
  arrivesAt: "arrives_at",
  departsAt: "departs_at",
  status: "status",
};

export async function updatePlace(placeId: string, patch: PlacePatch): Promise<Result<Place>> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(patch)) {
    row[PLACE_PATCH_COLUMN[key as keyof PlacePatch]] = value;
  }

  const { data, error } = await supabase
    .from("trv_places")
    .update(row)
    .eq("id", placeId)
    .select(PLACE_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });
  return ok(toPlace(data as unknown as Record<string, unknown>));
}

// --------------------------------------------------------------- bookings

const BOOKING_COLUMNS =
  "id, trip_id, place_id, kind, title, provider, reference, starts_at, ends_at, location, booking_status, depends_on_booking_id, notes, status";

function toBooking(row: Record<string, unknown>): Booking {
  return {
    id: row.id as string,
    tripId: row.trip_id as string,
    placeId: (row.place_id as string | null) ?? null,
    kind: row.kind as BookingKind,
    title: row.title as string,
    provider: (row.provider as string | null) ?? null,
    reference: (row.reference as string | null) ?? null,
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    bookingStatus: row.booking_status as BookingStatus,
    dependsOnBookingId: (row.depends_on_booking_id as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    status: row.status as Booking["status"],
  };
}

export async function loadBookings(tripId: string): Promise<Result<Booking[]>> {
  const { data, error } = await supabase
    .from("trv_bookings")
    .select(BOOKING_COLUMNS)
    .eq("trip_id", tripId)
    .neq("status", "archived")
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (error) return err({ kind: "network", message: error.message });
  return ok(((data ?? []) as unknown as Record<string, unknown>[]).map(toBooking));
}

export interface NewBooking {
  placeId?: string | null;
  kind: BookingKind;
  title: string;
  provider?: string | null;
  reference?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  location?: string | null;
  bookingStatus?: BookingStatus;
  dependsOnBookingId?: string | null;
  notes?: string | null;
}

/**
 * Creates a booking. If dependsOnBookingId is set, the caller must pass
 * the trip's existing bookings so the cycle guard has something to
 * check against, a fresh booking can only ever be a leaf, so this
 * only matters when a new booking is created already pointing at an
 * existing one, which cannot itself form a cycle, but the check runs
 * anyway rather than special-casing "this can't happen yet."
 */
export async function createBooking(
  productInstanceId: string,
  tripId: string,
  draft: NewBooking,
  existingBookings: Booking[]
): Promise<Result<Booking>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  if (draft.dependsOnBookingId) {
    // A booking that doesn't exist yet has no id to collide with, so
    // the only real question is whether the parent chain is sound;
    // wouldCreateCycle handles that against a synthetic placeholder id
    // that cannot appear in existingBookings.
    const placeholderId = "__new__";
    if (wouldCreateCycle(existingBookings, placeholderId, draft.dependsOnBookingId)) {
      return err({ kind: "validation", message: "That dependency would create a cycle." });
    }
  }

  const { data, error } = await supabase
    .from("trv_bookings")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      trip_id: tripId,
      place_id: draft.placeId ?? null,
      kind: draft.kind,
      title: draft.title.trim(),
      provider: draft.provider?.trim() || null,
      reference: draft.reference?.trim() || null,
      starts_at: draft.startsAt ?? null,
      ends_at: draft.endsAt ?? null,
      location: draft.location?.trim() || null,
      booking_status: draft.bookingStatus ?? "confirmed",
      depends_on_booking_id: draft.dependsOnBookingId ?? null,
      notes: draft.notes?.trim() || null,
    })
    .select(BOOKING_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not add that booking." });
  return ok(toBooking(data as unknown as Record<string, unknown>));
}

export type BookingPatch = Partial<{
  placeId: string | null;
  title: string;
  provider: string | null;
  reference: string | null;
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  bookingStatus: BookingStatus;
  dependsOnBookingId: string | null;
  notes: string | null;
  status: Booking["status"];
}>;

const BOOKING_PATCH_COLUMN: Record<keyof BookingPatch, string> = {
  placeId: "place_id",
  title: "title",
  provider: "provider",
  reference: "reference",
  startsAt: "starts_at",
  endsAt: "ends_at",
  location: "location",
  bookingStatus: "booking_status",
  dependsOnBookingId: "depends_on_booking_id",
  notes: "notes",
  status: "status",
};

/**
 * Updates a booking. When the patch changes dependsOnBookingId, the
 * caller must pass the trip's current bookings so the cycle guard has
 * real data to check against, this is the one write in the whole
 * product that could otherwise quietly turn the tree into a graph.
 */
export async function updateBooking(
  bookingId: string,
  patch: BookingPatch,
  existingBookings: Booking[]
): Promise<Result<Booking>> {
  if (patch.dependsOnBookingId) {
    if (wouldCreateCycle(existingBookings, bookingId, patch.dependsOnBookingId)) {
      return err({ kind: "validation", message: "That dependency would create a cycle." });
    }
  }

  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(patch)) {
    row[BOOKING_PATCH_COLUMN[key as keyof BookingPatch]] = value;
  }

  const { data, error } = await supabase
    .from("trv_bookings")
    .update(row)
    .eq("id", bookingId)
    .select(BOOKING_COLUMNS)
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not save that." });
  return ok(toBooking(data as unknown as Record<string, unknown>));
}

// --------------------------------------------------------- booking people

export interface BookingParticipant {
  linkId: string;
  bookingId: string;
  personId: string;
}

export async function loadBookingParticipants(tripId: string): Promise<Result<BookingParticipant[]>> {
  const { data, error } = await supabase
    .from("trv_booking_people")
    .select("id, booking_id, person_id, trv_bookings!inner(trip_id)")
    .eq("trv_bookings.trip_id", tripId)
    .eq("status", "active");

  if (error) return err({ kind: "network", message: error.message });
  return ok(
    ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => ({
      linkId: row.id as string,
      bookingId: row.booking_id as string,
      personId: row.person_id as string,
    }))
  );
}

export async function linkPersonToBooking(
  productInstanceId: string,
  bookingId: string,
  personId: string
): Promise<Result<BookingParticipant>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data, error } = await supabase
    .from("trv_booking_people")
    .upsert(
      {
        product_instance_id: productInstanceId,
        user_id: user.data,
        booking_id: bookingId,
        person_id: personId,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "booking_id,person_id" }
    )
    .select("id, booking_id, person_id")
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not link that traveller." });
  const row = data as unknown as Record<string, unknown>;
  return ok({ linkId: row.id as string, bookingId: row.booking_id as string, personId: row.person_id as string });
}

/** Corrects a mistaken link. Archives the row; nothing is ever deleted. */
export async function unlinkPersonFromBooking(linkId: string): Promise<Result<null>> {
  const { error } = await supabase
    .from("trv_booking_people")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", linkId);

  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

// ------------------------------------------------------------ companion

export interface RunRecord {
  id: string;
  bookingId: string | null;
  playbookKey: string;
  playbookTitle: string;
  status: "open" | "finished" | "left";
  answers: Record<string, string>;
  skipped: string[];
}

export async function startRun(
  productInstanceId: string,
  playbook: { key: string; title: string },
  bookingId: string | null
): Promise<Result<RunRecord>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { data, error } = await supabase
    .from("trv_runs")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.data,
      booking_id: bookingId,
      playbook_key: playbook.key,
      playbook_title: playbook.title,
    })
    .select("id, booking_id, playbook_key, playbook_title, status")
    .single();

  if (error || !data) return err({ kind: "network", message: error?.message ?? "Could not start that." });
  const row = data as unknown as Record<string, unknown>;
  return ok({
    id: row.id as string,
    bookingId: (row.booking_id as string | null) ?? null,
    playbookKey: row.playbook_key as string,
    playbookTitle: row.playbook_title as string,
    status: row.status as RunRecord["status"],
    answers: {},
    skipped: [],
  });
}

/**
 * Loads a run that was left open, with everything already answered.
 *
 * "left" is included deliberately, from the first version of this
 * function rather than added after the fact: leaving mid-run is not
 * treated as failure anywhere else in this product, and it must not be
 * treated as one here by silently becoming unresumable. This is the
 * exact fix Alongside's own build needed, applied here from day one.
 */
export async function loadOpenRun(productInstanceId: string, bookingId: string): Promise<Result<RunRecord | null>> {
  const { data, error } = await supabase
    .from("trv_runs")
    .select("id, booking_id, playbook_key, playbook_title, status")
    .eq("product_instance_id", productInstanceId)
    .eq("booking_id", bookingId)
    .in("status", ["open", "left"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return err({ kind: "network", message: error.message });
  if (!data) return ok(null);

  const row = data as unknown as Record<string, unknown>;
  const answers = await supabase.from("trv_run_answers").select("step_key, answer, skipped").eq("run_id", row.id as string);
  if (answers.error) return err({ kind: "network", message: answers.error.message });

  const collected: Record<string, string> = {};
  const skipped: string[] = [];
  for (const answer of (answers.data ?? []) as unknown as Record<string, unknown>[]) {
    if (answer.skipped) skipped.push(answer.step_key as string);
    else if (answer.answer) collected[answer.step_key as string] = answer.answer as string;
  }

  return ok({
    id: row.id as string,
    bookingId: (row.booking_id as string | null) ?? null,
    playbookKey: row.playbook_key as string,
    playbookTitle: row.playbook_title as string,
    status: row.status as RunRecord["status"],
    answers: collected,
    skipped,
  });
}

/**
 * Saves one step's answer. Only what the person wrote or chose
 * themselves; suggested wording is never written here and never leaves
 * the browser, same rule as every playbook on this engine.
 */
export async function saveAnswer(
  productInstanceId: string,
  runId: string,
  stepKey: string,
  answer: string | null,
  skipped = false
): Promise<Result<null>> {
  const user = await currentUserId();
  if (!user.ok) return user;

  const { error } = await supabase.from("trv_run_answers").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: user.data,
      run_id: runId,
      step_key: stepKey,
      answer: skipped ? null : answer,
      skipped,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "run_id,step_key" }
  );

  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}

export interface FinishResult {
  booking: Booking | null;
}

async function applyOutcomeToBooking(
  booking: Booking,
  outcome: OutcomeKind,
  detail: string | null,
  now: Date
): Promise<Result<Booking>> {
  const effect = applyOutcome(booking, { outcome, detail, now });
  if (Object.keys(effect.patch).length === 0) return ok(booking);
  return updateBooking(booking.id, effect.patch, [booking]);
}

/**
 * Closes a run and applies its outcome to the booking it concerns.
 *
 * The one place the loop closes. In particular, "did not get to it"
 * reaches here like any other outcome and produces an empty patch, so
 * nothing in this function needs to special case it.
 */
export async function finishRun(
  productInstanceId: string,
  run: RunRecord,
  booking: Booking | null,
  outcome: OutcomeKind,
  detail: string | null
): Promise<Result<FinishResult>> {
  const now = new Date();

  const closed = await supabase
    .from("trv_runs")
    .update({ status: "finished", outcome, outcome_detail: detail, ended_at: now.toISOString(), updated_at: now.toISOString() })
    .eq("id", run.id);
  if (closed.error) return err({ kind: "network", message: closed.error.message });

  if (!booking) return ok({ booking: null });

  const updated = await applyOutcomeToBooking(booking, outcome, detail, now);
  if (!updated.ok) return updated;
  return ok({ booking: updated.data });
}

/**
 * The same outcome finishRun applies, without a Companion run behind
 * it, for a quick action on the Trip screen that does not need eight
 * questions first.
 */
export async function recordOutcome(booking: Booking, outcome: OutcomeKind, detail: string | null): Promise<Result<Booking>> {
  return applyOutcomeToBooking(booking, outcome, detail, new Date());
}

/** Leaving a run part way through is not a failure and is not recorded as one. */
export async function leaveRun(runId: string): Promise<Result<null>> {
  const { error } = await supabase
    .from("trv_runs")
    .update({ status: "left", updated_at: new Date().toISOString() })
    .eq("id", runId);

  if (error) return err({ kind: "network", message: error.message });
  return ok(null);
}
