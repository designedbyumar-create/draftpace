"use client";

import { useEffect, useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Clock, Plus } from "@/design-system/Icon";
import { useTravelCompanion } from "./useTravelCompanion";
import RecordEntryForm from "./RecordEntryForm";
import { loadResolvedThreadEvents, type ResolvedThreadLine } from "../domain/travelData";

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/**
 * Record.
 *
 * A dated, append-mostly log, not a duplicate of Today: this is
 * retrospective, what happened and what's worth knowing next time, per
 * proposal §16. Resolved threads land here automatically, their own
 * closing line, merged with whatever the traveller wrote by hand.
 *
 * SCOPED TO THE CURRENT TRIP, SAME AS TODAY/TRIP/PEOPLE
 *
 * useTravelCompanion only loads the trip that is planning or active,
 * so this screen's own log stays about the trip in progress. A past
 * trip's dated record is not lost, it moves to its own read-only page
 * once the trip is marked done: see TravelHistoryDetailModule, reached
 * from Travel history.
 */
export default function RecordModule() {
  const { status, errorMessage, instanceId, trips, currentTrip, recordEntries, addRecordEntry } = useTravelCompanion();
  const [addingNote, setAddingNote] = useState(false);
  const [resolvedThreadLines, setResolvedThreadLines] = useState<ResolvedThreadLine[]>([]);

  useEffect(() => {
    if (!currentTrip) return;
    let cancelled = false;
    loadResolvedThreadEvents(currentTrip.id).then((result) => {
      if (!cancelled && result.ok) setResolvedThreadLines(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [currentTrip]);

  if (status === "loading") return <p className="text-body-sm text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Clock} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Clock} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  if (!currentTrip) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header>
          <p className="text-eyebrow font-bold uppercase text-[var(--primary)]">Record</p>
        </header>
        <EmptyState
          icon={Clock}
          title={trips.length === 0 ? "Nothing recorded yet" : "Nothing currently in progress"}
          description="What happened on the trip, and what's worth knowing next time, appears here as it happens."
        />
      </div>
    );
  }

  type FeedItem = { id: string; occurredAt: string; kind: "note" | "resolved"; label: string; body: string };

  const feed: FeedItem[] = [
    ...recordEntries.map((entry) => ({
      id: entry.id,
      occurredAt: entry.createdAt,
      kind: "note" as const,
      label: entry.category,
      body: entry.placeName ? `${entry.body} (${entry.placeName})` : entry.body,
    })),
    ...resolvedThreadLines.map((line) => ({
      id: line.id,
      occurredAt: line.occurredAt,
      kind: "resolved" as const,
      label: "resolved",
      body: line.threadTitle,
    })),
  ].sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : a.occurredAt > b.occurredAt ? -1 : 0));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow font-bold uppercase text-[var(--primary)]">Record</p>
          <h1 className="mt-2 text-heading text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
            {currentTrip.title}
          </h1>
        </div>
        {!addingNote && (
          <Button size="sm" variant="ghost" onClick={() => setAddingNote(true)} iconLeft={<Plus size={14} aria-hidden />}>
            Add
          </Button>
        )}
      </header>

      {addingNote && (
        <RecordEntryForm
          instanceId={instanceId}
          tripId={currentTrip.id}
          onAdded={(entry) => {
            addRecordEntry(entry);
            setAddingNote(false);
          }}
          onCancel={() => setAddingNote(false)}
        />
      )}

      {feed.length === 0 && !addingNote && (
        <EmptyState
          icon={Clock}
          title="Nothing recorded yet"
          description="What happened on the trip, and what's worth knowing next time, appears here as it happens."
        />
      )}

      {feed.length > 0 && (
        <ul className="flex flex-col gap-2">
          {feed.map((item) => (
            <li key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">
                {dateLabel(item.occurredAt)} · {item.label}
              </p>
              <p className="mt-1 text-body-sm leading-6 text-[var(--text)]">{item.body}</p>
            </li>
          ))}
        </ul>
      )}

      {errorMessage && <p className="text-body-sm text-[var(--danger)]">{errorMessage}</p>}
    </div>
  );
}
