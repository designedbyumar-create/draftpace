import type { ReactNode } from "react";
import { MapPin } from "@/design-system/Icon";
import type { Stop } from "../today";

/**
 * Today, as a run of tickets.
 *
 * The product's signature object is the boarding pass: each stop is a
 * ticket, its time on the stub, a perforation, then what it is. Tickets
 * are joined by a dashed route so the day still reads as one journey, which
 * is the timeline this product was always about.
 *
 * Every mark is a stored fact. The time is the time that was recorded, the
 * title is the booking's own, and "Awaiting confirmation" is the status the
 * person set. There is no "you are here" marker, no countdown and no count
 * of what is left, because none of those is stored and this product does
 * not invent what it was not told.
 *
 * COLOUR IS SPENT SPARINGLY
 *
 * The deep accent belongs to the calls to action and the tab you are on.
 * Nothing on the tickets themselves uses it: the stub is a pale tint, the
 * titles are ink, and the rest is grey. A screen of tickets should read as
 * quiet paper with one obvious thing to press.
 *
 * Presentational only. Reading, deriving and starting a run stay in
 * TodayModule.
 */

export interface DayStop extends Stop {
  id: string;
  location: string | null;
  awaiting: boolean;
}

export interface DayGroup {
  label: string;
  stops: DayStop[];
}

export interface TodayViewProps {
  tripTitle: string;
  where: string | null;
  quiet: boolean;
  closingNote: string | null;
  today: DayStop[];
  /** Tomorrow's windows worth knowing about now (a hotel check-in, a pickup). */
  important: DayStop[];
  later: DayGroup[];
  waiting: { id: string; title: string }[];
  /** A stated fact about the trip when nothing is on today, such as when it starts, with a way to the whole trip. */
  note?: ReactNode;
  help: ReactNode;
}

const TICKET_SHADOW =
  "shadow-[0_1px_2px_rgba(0,0,0,0.05),0_10px_22px_-16px_rgba(0,0,0,0.3)]";

/** One stop: the time on a stub, a perforation with its two bites, then the booking. */
export function Ticket({ stop, later = false }: { stop: DayStop; later?: boolean }) {
  return (
    <div className={`relative flex rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${TICKET_SHADOW}`}>
      <div className="flex w-[84px] shrink-0 items-center justify-center py-4">
        {stop.time && (
          <span
            className={`rounded-md px-2 py-1 text-[15px] font-bold tabular-nums text-[var(--text)] ${
              later ? "bg-[var(--surface-strong)]" : "bg-[var(--product-wash)]"
            }`}
          >
            {stop.time}
          </span>
        )}
      </div>
      <div className="relative my-3 w-0 border-l-2 border-dashed border-[var(--border-strong)]">
        <span aria-hidden className="absolute -left-2 -top-[19px] h-4 w-4 rounded-full bg-[var(--app-bg)]" />
        <span aria-hidden className="absolute -bottom-[19px] -left-2 h-4 w-4 rounded-full bg-[var(--app-bg)]" />
      </div>
      <div className="min-w-0 flex-1 px-4 py-3.5">
        <p className={`text-[16px] font-semibold leading-snug ${later ? "text-[var(--muted)]" : "text-[var(--text)]"}`}>
          {stop.title}
        </p>
        {stop.note && <p className="mt-0.5 text-[13px] text-[var(--muted)]">{stop.note}</p>}
        {stop.location && <p className="mt-0.5 text-[13px] text-[var(--muted)]">{stop.location}</p>}
        {stop.awaiting && (
          <p className="mt-1.5 inline-block rounded-full bg-[var(--surface-strong)] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            Awaiting confirmation
          </p>
        )}
      </div>
    </div>
  );
}

/** The route between two tickets, centred on the stub. */
export function TicketLink() {
  return <div aria-hidden className="ml-[41px] h-3 w-0 border-l-2 border-dashed border-[var(--border-strong)]" />;
}

/** A run of tickets joined by the route. */
export function Tickets({ stops, later = false }: { stops: DayStop[]; later?: boolean }) {
  return (
    <ol className="flex flex-col">
      {stops.map((stop, index) => (
        <li key={stop.id} className="contents">
          {index > 0 && <TicketLink />}
          <Ticket stop={stop} later={later} />
        </li>
      ))}
    </ol>
  );
}

export function GroupLabel({ children }: { children: string }) {
  return <p className="mb-2 mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{children}</p>;
}

/** Something being waited on: a ticket that has not been issued yet, so it has no stub. */
export function WaitingCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-strong)] px-4 py-3.5 text-[15px] leading-snug text-[var(--muted)]">
      {title}
    </div>
  );
}

export default function TodayView({
  tripTitle,
  where,
  quiet,
  closingNote,
  today,
  important,
  later,
  waiting,
  note,
  help,
}: TodayViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{tripTitle}</p>
        <h1 className="mt-1.5 text-[38px] font-semibold leading-none tracking-[-0.02em] text-[var(--text)]">Today</h1>
        {where && (
          <p className="mt-2 flex items-center gap-1.5 text-[14px] text-[var(--muted)]">
            <MapPin size={15} aria-hidden />
            Currently in {where}
          </p>
        )}
      </header>

      {quiet && <p className="mt-6 text-[15px] leading-6 text-[var(--muted)]">Nothing scheduled for today, right now.</p>}
      {closingNote && (
        <p role="status" className="mt-6 text-[13px] text-[var(--muted)]">
          {closingNote}
        </p>
      )}
      {note && <div className="mt-6">{note}</div>}

      {today.length > 0 && (
        <div className="mt-6" aria-label="The day, in order" role="group">
          <Tickets stops={today} />
        </div>
      )}

      {important.length > 0 && (
        <>
          <GroupLabel>Tomorrow, worth knowing</GroupLabel>
          <Tickets stops={important} later />
        </>
      )}

      {later.map((group) => (
        <div key={group.label}>
          <GroupLabel>{group.label}</GroupLabel>
          <Tickets stops={group.stops} later />
        </div>
      ))}

      {waiting.length > 0 && (
        <>
          <GroupLabel>Waiting</GroupLabel>
          <div className="flex flex-col gap-2">
            {waiting.map((thread) => (
              <WaitingCard key={thread.id} title={thread.title} />
            ))}
          </div>
        </>
      )}

      <div className="mt-8">{help}</div>
    </div>
  );
}
