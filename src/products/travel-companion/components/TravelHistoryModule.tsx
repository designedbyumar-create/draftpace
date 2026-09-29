"use client";

import Link from "next/link";
import EmptyState from "@/design-system/EmptyState";
import { Clock, ChevronRight } from "@/design-system/Icon";
import { useTravelCompanion } from "./useTravelCompanion";

function rangeLabel(startsAt: string | null, endsAt: string | null): string | null {
  const format = (date: string) =>
    new Date(`${date.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  if (startsAt && endsAt) return `${format(startsAt)} to ${format(endsAt)}`;
  if (startsAt) return format(startsAt);
  if (endsAt) return format(endsAt);
  return null;
}

/**
 * Travel history.
 *
 * Every trip marked done, most recent first. A trip never disappears
 * once it is concluded: it moves here, still readable, still
 * printable, just no longer the one Today and Trip show by default.
 */
export default function TravelHistoryModule() {
  const { status, errorMessage, trips } = useTravelCompanion();

  if (status === "loading") return <p className="text-body-sm text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Clock} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Clock} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const past = trips.filter((trip) => trip.status === "past");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-eyebrow font-bold uppercase text-[var(--primary)]">Trip</p>
        <h1 className="mt-2 text-heading text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
          Travel history
        </h1>
      </header>

      {past.length === 0 ? (
        <EmptyState icon={Clock} title="Nothing here yet" description="A trip lands here once it is marked done." />
      ) : (
        <ul className="flex flex-col gap-2">
          {past.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/app/products/travel-companion/travel-history/${trip.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-strong)]"
              >
                <div>
                  <p className="text-body font-medium text-[var(--text)]">{trip.title}</p>
                  {(trip.startsAt || trip.endsAt) && (
                    <p className="mt-0.5 text-body-sm text-[var(--muted)]">{rangeLabel(trip.startsAt, trip.endsAt)}</p>
                  )}
                  {trip.destinationSummary && <p className="mt-0.5 text-body-sm text-[var(--muted)]">{trip.destinationSummary}</p>}
                </div>
                <ChevronRight size={18} className="shrink-0 text-[var(--faint)]" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
