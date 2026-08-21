"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/design-system/EmptyState";
import { Clock } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findInOrderInstanceId } from "../instanceData";
import { loadRevisions } from "../domain/affairsData";
import { AFFAIR_DOMAIN_LABEL, type AffairArea } from "../affairsKnowledge";
import type { AffairChangeKind, AffairItemRevision } from "../lifeAffairs";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";
type Entry = AffairItemRevision & { label: string; area: AffairArea };

/**
 * How your affairs got to where they are.
 *
 * NOT the current state, which is what Affairs is for. The distinction
 * is the whole reason both exist: after a long absence a person asks two
 * different questions, "what does this say about me now" and "what have
 * I changed since". A single screen answering both answers neither well.
 *
 * NOT a completion log either. "Completed step 23" is a fact about using
 * software. "Who to contact first changed from Tom to Jane" is a fact
 * about somebody's life, and it is the only kind of entry here.
 *
 * Grouped by day, newest first, because that is how a person remembers
 * doing things: an afternoon when they sat down and dealt with several,
 * not a stream of individual timestamps.
 */
const CHANGE_LABEL: Record<AffairChangeKind, string> = {
  established: "Established",
  updated: "Changed",
  confirmed: "Confirmed",
  markedNotApplicable: "Marked not applicable",
  archived: "Removed",
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatDay(iso: string, now: Date): string {
  const d = new Date(iso);
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  if (days <= 0) return `Today, ${date}`;
  if (days === 1) return `Yesterday, ${date}`;
  return date;
}

export default function HistoryModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    const found = await findInOrderInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    const result = await loadRevisions(found.id, 200);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setEntries(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Clock} title="Nothing has changed yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Clock} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Nothing has changed yet"
        description="Once you record something, every change to it is kept here, so you can always see what it used to say."
      />
    );
  }

  const now = new Date();
  const days: { key: string; entries: Entry[] }[] = [];
  for (const entry of entries) {
    const key = dayKey(entry.createdAt);
    const last = days[days.length - 1];
    if (last && last.key === key) last.entries.push(entry);
    else days.push({ key, entries: [entry] });
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">History</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          What has changed.
        </h1>
        <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
          Every change is kept, so when something is no longer true you can still see what it said before. Nothing here
          is ever overwritten.
        </p>
      </div>

      {days.map((day) => (
        <section key={day.key} aria-label={formatDay(day.entries[0].createdAt, now)}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
            {formatDay(day.entries[0].createdAt, now)}
          </h2>
          <div className="mt-2 flex flex-col">
            {day.entries.map((entry) => (
              <div key={entry.id} className="border-b border-[var(--border)] py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-[14px] font-semibold text-[var(--text)]">{entry.label}</h3>
                  <span className="text-[11px] font-semibold text-[var(--primary)]">
                    {CHANGE_LABEL[entry.changeKind]}
                  </span>
                </div>
                {entry.summary && (
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{entry.summary}</p>
                )}
                <p className="mt-0.5 text-[12px] text-[var(--faint)]">{AFFAIR_DOMAIN_LABEL[entry.area]}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
