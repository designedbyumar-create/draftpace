import type { ReactNode } from "react";
import { MapPin } from "@/design-system/Icon";
import { GroupLabel, Tickets, WaitingCard, type DayStop } from "./TodayView";

/**
 * The whole trip, day by day, as tickets under a date.
 *
 * Today's tickets, stretched across every day of the trip. Each day is a
 * bold date with where the person is, then a ticket for everything recorded
 * on it. A day with nothing recorded says exactly that, in a dashed outline
 * where a ticket would be, and offers to add something: that is where the
 * gaps in a trip show, without telling anyone what should fill them.
 *
 * The day headers carry no fill and no accent. The deep colour belongs to
 * the calls to action.
 *
 * Deliberately absent, as everywhere in this product: a countdown, a count
 * of what is left, a "you should" and any suggestion. Every mark is
 * something the person recorded.
 *
 * Presentational only. Reading, adding and printing stay in ItineraryModule.
 */

export interface ItineraryViewDay {
  date: string;
  /** "Mon 12 Oct", already formatted. */
  label: string;
  place: string | null;
  stops: DayStop[];
}

export interface ItineraryViewProps {
  tripTitle: string;
  /** "12 Oct to 15 Oct", already formatted, or null when the trip has no dates yet. */
  rangeLabel: string | null;
  days: ItineraryViewDay[];
  undated: { id: string; title: string; kindLabel: string }[];
  compact: boolean;
  onAdd: (date: string) => void;
  actions: ReactNode;
}

const ADD =
  "min-h-9 shrink-0 rounded-full px-3 text-[13px] font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]";

export function dayLabel(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export default function ItineraryView({ tripTitle, rangeLabel, days, undated, compact, onAdd, actions }: ItineraryViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{tripTitle}</p>
        <h1 className="mt-1.5 text-[38px] font-semibold leading-none tracking-[-0.02em] text-[var(--text)]">Itinerary</h1>
        {rangeLabel && <p className="mt-2 text-[14px] text-[var(--muted)]">{rangeLabel}</p>}
      </header>

      {days.length === 0 ? (
        <p className="mt-6 max-w-[46ch] text-[15px] leading-6 text-[var(--muted)]">
          Give the trip its dates, or add a booking with a time, and it is laid out here day by day.
        </p>
      ) : (
        <ol aria-label="The trip, day by day" className="flex flex-col">
          {days.map((day) => (
            <li key={day.date} aria-label={day.label} className="mt-8 first:mt-6">
              <div className="mb-3 flex items-end justify-between gap-3 border-b border-[var(--border-strong)] pb-2">
                <div className="min-w-0">
                  <h2 className="text-[20px] font-semibold leading-tight text-[var(--text)]">{day.label}</h2>
                  {day.place && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[var(--muted)]">
                      <MapPin size={13} aria-hidden />
                      {day.place}
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => onAdd(day.date)} className={ADD} aria-label={`Add something on ${day.label}`}>
                  Add
                </button>
              </div>
              {day.stops.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--border-strong)] px-4 py-3.5 text-[14px] text-[var(--muted)]">
                  Nothing recorded for this day.
                </p>
              ) : (
                <Tickets stops={day.stops} />
              )}
            </li>
          ))}
        </ol>
      )}

      {undated.length > 0 && (
        <>
          <GroupLabel>Not on a day yet</GroupLabel>
          <div className="flex flex-col gap-2">
            {undated.map((booking) => (
              <WaitingCard key={booking.id} title={`${booking.title} · ${booking.kindLabel}`} />
            ))}
          </div>
        </>
      )}

      {compact && (
        <p className="mt-6 text-[13px] leading-5 text-[var(--muted)]">
          This trip is long, so days with nothing recorded are not shown.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
