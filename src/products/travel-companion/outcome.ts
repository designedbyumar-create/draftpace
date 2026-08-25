import type { OutcomeKind } from "@/components/product-shell/companion/steps";
import type { Booking, BookingStatus } from "./trip";

/**
 * What a finished Companion run does to the booking it was opened on.
 *
 * Same rule Alongside proved and this engine now carries for every
 * product built on it: "did not get to it" changes nothing, not a
 * status, not a note, not a timestamp. A booking problem that somebody
 * did not get to today is not a booking that failed; recording it as
 * one would be exactly the invented-urgency mistake the founder's own
 * product principles rule out.
 *
 * No thread is created here. trv_threads does not exist yet (a later
 * phase); every outcome below writes directly to the booking it
 * concerns, never to a table that is not built.
 */

export interface OutcomeInput {
  outcome: OutcomeKind;
  detail: string | null;
  now: Date;
}

export type BookingPatch = Partial<Pick<Booking, "bookingStatus" | "notes">>;

export interface OutcomeEffect {
  patch: BookingPatch;
}

function withNote(existing: string | null, addition: string): string {
  return existing ? `${existing}\n${addition}` : addition;
}

export function applyOutcome(booking: Booking, input: OutcomeInput): OutcomeEffect {
  switch (input.outcome) {
    case "resolved":
      return { patch: { bookingStatus: "confirmed" as BookingStatus, notes: withNote(booking.notes, "Sorted.") } };

    case "progress":
      return {
        patch: input.detail ? { notes: withNote(booking.notes, `Made progress: ${input.detail}`) } : {},
      };

    case "waiting":
      return {
        patch: {
          bookingStatus: "waiting" as BookingStatus,
          notes: withNote(booking.notes, input.detail ? `Waiting on ${input.detail}.` : "Waiting on a reply."),
        },
      };

    case "next-step":
      return {
        patch: input.detail ? { notes: withNote(booking.notes, `Next: ${input.detail}`) } : {},
      };

    // Nothing. No status change, no note, no timestamp. See the file
    // header: this is the rule that matters most, carried over from
    // this engine's first product rather than reinvented here.
    case "not-yet":
      return { patch: {} };

    case "other":
      return {
        patch: input.detail ? { notes: withNote(booking.notes, input.detail) } : {},
      };
  }
}
