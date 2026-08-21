"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/design-system/EmptyState";
import { Clock } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findInOrderInstanceId } from "../instanceData";
import { loadItems, loadRevisions } from "../domain/affairsData";
import { AFFAIR_AREA_LABEL, type AffairArea } from "../affairsKnowledge";
import { describeItem, needsReview, type AffairChangeKind, type AffairItem } from "../lifeAffairs";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

interface Entry {
  id: string;
  changeKind: AffairChangeKind;
  summary: string | null;
  createdAt: string;
  label: string;
  area: AffairArea;
}

/**
 * What this product knows, and how it came to know it.
 *
 * Two halves, and the order matters. First what is currently true, since
 * that is what somebody actually came here to check. Then what changed
 * and when, which is the half a binder cannot have: after eight years
 * the useful question is not "is there an executor" but "when did I last
 * look at this, and what did it say before".
 *
 * Steps never addressed are deliberately not listed. A page of things
 * you have not done is the shaming list this product exists to avoid,
 * and the one surface already tells you what is next.
 */
const CHANGE_LABEL: Record<AffairChangeKind, string> = {
  established: "Recorded",
  updated: "Changed",
  confirmed: "Confirmed",
  markedNotApplicable: "Marked not applicable",
  archived: "Removed",
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function describeElapsed(iso: string, now: Date): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 24) return months === 1 ? "a month ago" : `${months} months ago`;
  return `${Math.round(months / 12)} years ago`;
}

export default function HistoryModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [items, setItems] = useState<AffairItem[]>([]);
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
    const [itemsResult, revisionsResult] = await Promise.all([loadItems(found.id), loadRevisions(found.id)]);
    if (!itemsResult.ok) {
      setErrorMessage(describeResultError(itemsResult.error));
      setStatus("error");
      return;
    }
    setItems(itemsResult.data);
    setEntries(revisionsResult.ok ? revisionsResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Clock} title="Nothing recorded yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Clock} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Nothing recorded yet"
        description="What you have told us, and when. It fills in as you go."
      />
    );
  }

  const now = new Date();
  const byArea = new Map<AffairArea, AffairItem[]>();
  for (const item of items) {
    byArea.set(item.area, [...(byArea.get(item.area) ?? []), item]);
  }

  const oldest = items
    .map((i) => i.lastConfirmedAt ?? i.establishedAt)
    .filter((d): d is string => Boolean(d))
    .sort()[0];

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">What is recorded</p>
        <h1
          className="mt-2 text-[24px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {items.length === 1 ? "One thing in order." : `${items.length} things in order.`}
        </h1>
        {oldest && (
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            The oldest of these was last looked at {describeElapsed(oldest, now)}. Anything that has been standing a
            long time comes back for a second look on its own.
          </p>
        )}
      </div>

      {[...byArea.entries()].map(([area, areaItems]) => (
        <section key={area} aria-label={AFFAIR_AREA_LABEL[area]}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
            {AFFAIR_AREA_LABEL[area]}
          </h2>
          <div className="mt-2 flex flex-col">
            {areaItems.map((item) => {
              const detail = describeItem(item);
              const stale = needsReview(item, now);
              return (
                <div key={item.id} className="border-b border-[var(--border)] py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[14px] font-semibold text-[var(--text)]">{item.label}</h3>
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: stale ? "var(--muted)" : "var(--primary)" }}
                    >
                      {stale
                        ? "Worth checking again"
                        : item.status === "incomplete"
                          ? "Partly recorded"
                          : "Recorded"}
                    </span>
                  </div>
                  {detail && detail !== item.label && (
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{detail}</p>
                  )}
                  {item.notes && <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">{item.notes}</p>}
                  {item.lastConfirmedAt && (
                    <p className="mt-1 text-[12px] text-[var(--faint)]">
                      Last confirmed {formatDate(item.lastConfirmedAt)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {entries.length > 0 && (
        <section aria-label="What has changed">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What has changed</h2>
          <div className="mt-2 flex flex-col">
            {entries.map((entry) => (
              <div key={entry.id} className="border-b border-[var(--border)] py-2.5">
                <p className="text-[13px] leading-relaxed text-[var(--text)]">
                  {entry.summary ?? `${CHANGE_LABEL[entry.changeKind]} ${entry.label}.`}
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                  {formatDate(entry.createdAt)} · {describeElapsed(entry.createdAt, now)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
