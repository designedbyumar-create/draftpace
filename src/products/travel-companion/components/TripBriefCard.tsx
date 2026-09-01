"use client";

import { useState } from "react";
import type { TripBriefView } from "../tripBrief";

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
}

/**
 * The Trip Brief, proposal §14: a compact card, always visible, and an
 * expandable full view, both reading the one derived brief so they can
 * never disagree with each other or with Today's own screen.
 */
export default function TripBriefCard({ brief }: { brief: TripBriefView }) {
  const [expanded, setExpanded] = useState(false);

  const lines = {
    where: brief.whereWeAre ? `Currently in ${brief.whereWeAre.name}` : "Not currently at a recorded destination",
    today:
      brief.today.length === 0
        ? "Nothing scheduled today"
        : brief.today.length === 1
          ? `1 thing today: ${brief.today[0].title}`
          : `${brief.today.length} things today`,
    next: brief.next ? `Next: ${brief.next.name}` : "No further destination recorded",
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-col gap-1">
        <p className="text-[13px] text-[var(--text)]">{lines.where}</p>
        <p className="text-[13px] text-[var(--text)]">{lines.today}</p>
        <p className="text-[13px] text-[var(--text)]">{lines.next}</p>
      </div>

      {expanded && (
        <div className="mt-3 flex flex-col gap-3 border-t border-[var(--border)] pt-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">Open</p>
            {brief.openThreads.count === 0 ? (
              <p className="mt-1 text-[13px] text-[var(--muted)]">Nothing waiting on anyone.</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-0.5">
                {brief.openThreads.titles.map((title) => (
                  <li key={title} className="text-[13px] text-[var(--muted)]">
                    {title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">Bookings</p>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
              {brief.bookingCounts.confirmed} confirmed
              {brief.bookingCounts.waiting > 0 ? `, ${brief.bookingCounts.waiting} awaiting confirmation` : ""}
              {brief.bookingCounts.cancelled > 0 ? `, ${brief.bookingCounts.cancelled} cancelled` : ""}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">Important</p>
            {brief.important.length === 0 ? (
              <p className="mt-1 text-[13px] text-[var(--muted)]">Nothing flagged.</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-0.5">
                {brief.important.map((doc) => (
                  <li key={doc.id} className="text-[13px] text-[var(--muted)]">
                    {doc.label}
                    {doc.keptWhere ? `, ${doc.keptWhere}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {brief.today.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">Today, in full</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {brief.today.map((booking) => (
                  <li key={booking.id} className="text-[13px] text-[var(--muted)]">
                    {booking.title}
                    {booking.startsAt ? `, ${timeLabel(booking.startsAt)}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="mt-3 text-[12px] font-semibold text-[var(--primary)] hover:underline"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </section>
  );
}
