import type { OutcomeKind } from "@/components/product-shell/companion/steps";
import type { Booking, BookingStatus } from "./trip";

/**
 * What a finished Companion run does to the booking it was opened on,
 * and, per proposal §12's "outcome → trip update", to any thread that
 * concerns it.
 *
 * Same rule Alongside proved and this engine now carries for every
 * product built on it: "did not get to it" changes nothing, not a
 * status, not a note, not a timestamp, not a thread. A booking problem
 * that somebody did not get to today is not a booking that failed;
 * recording it as one would be exactly the invented-urgency mistake the
 * founder's own product principles rule out.
 *
 * This file stays pure: it decides what should happen, never performs a
 * write. The domain layer (applyOutcomeToBooking in travelData.ts) is
 * what actually opens or resolves a thread, using the thread field
 * below as its instruction.
 */

export interface OutcomeInput {
  outcome: OutcomeKind;
  detail: string | null;
  now: Date;
}

export type BookingPatch = Partial<Pick<Booking, "bookingStatus" | "notes">>;

/**
 * "open": no open thread exists yet for this booking, start one with
 * this title. "resolve": if an open thread exists for this booking,
 * close it with this line; if none exists, this is a no-op, never an
 * invented thread to resolve. null: neither.
 */
export type ThreadEffect = { kind: "open"; title: string } | { kind: "resolve"; closingLine: string } | null;

export interface OutcomeEffect {
  patch: BookingPatch;
  thread: ThreadEffect;
}

function withNote(existing: string | null, addition: string): string {
  return existing ? `${existing}\n${addition}` : addition;
}

export function applyOutcome(booking: Booking, input: OutcomeInput): OutcomeEffect {
  switch (input.outcome) {
    case "resolved":
      return {
        patch: { bookingStatus: "confirmed" as BookingStatus, notes: withNote(booking.notes, "Sorted.") },
        thread: { kind: "resolve", closingLine: "Sorted." },
      };

    case "progress":
      return {
        patch: input.detail ? { notes: withNote(booking.notes, `Made progress: ${input.detail}`) } : {},
        thread: null,
      };

    case "waiting":
      return {
        patch: {
          bookingStatus: "waiting" as BookingStatus,
          notes: withNote(booking.notes, input.detail ? `Waiting on ${input.detail}.` : "Waiting on a reply."),
        },
        thread: { kind: "open", title: input.detail ? `Waiting on ${input.detail}` : `Waiting on a reply about ${booking.title}` },
      };

    case "next-step":
      return {
        patch: input.detail ? { notes: withNote(booking.notes, `Next: ${input.detail}`) } : {},
        thread: null,
      };

    // Nothing. No status change, no note, no timestamp, no thread. See
    // the file header: this is the rule that matters most, carried over
    // from this engine's first product rather than reinvented here.
    case "not-yet":
      return { patch: {}, thread: null };

    case "other":
      return {
        patch: input.detail ? { notes: withNote(booking.notes, input.detail) } : {},
        thread: null,
      };
  }
}
