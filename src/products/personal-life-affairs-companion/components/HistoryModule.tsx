"use client";

import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/design-system/EmptyState";
import { Clock } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findInOrderInstanceId } from "../instanceData";
import { loadProfile, loadSteps } from "../domain/affairsData";
import { deriveReadiness, type StandingRow, type StepStanding } from "../completion";
import { AFFAIR_AREA_LABEL } from "../affairsKnowledge";
import type { AffairProfile, StepRecord } from "../sequencer";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * What has been settled, and when.
 *
 * This is the caretaker's view: not a feed of events, but the standing
 * of everything that applies to this person, newest confirmation first.
 * It answers the question somebody actually has after a long absence,
 * which is "what did I already deal with, and how long ago".
 *
 * Steps never addressed are deliberately not listed. A page of things
 * you have not done is the shaming list this product exists to avoid,
 * and the one surface already tells you what is next.
 */
const STANDING_LABEL: Record<StepStanding, string> = {
  confirmed: "Confirmed",
  worthRechecking: "Worth checking again",
  notApplicable: "Not applicable",
  leftOpen: "Left open",
  notAddressed: "Not yet started",
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
  const [profile, setProfile] = useState<AffairProfile>({});
  const [records, setRecords] = useState<StepRecord[]>([]);

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
    const [profileResult, stepsResult] = await Promise.all([loadProfile(found.id), loadSteps(found.id)]);
    if (!stepsResult.ok) {
      setErrorMessage(describeResultError(stepsResult.error));
      setStatus("error");
      return;
    }
    setProfile(profileResult.ok ? profileResult.data : {});
    setRecords(stepsResult.data);
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

  const now = new Date();
  const readiness = deriveReadiness({ profile, records }, now);

  // Everything the person has actually decided something about, most
  // recently confirmed first, with undated decisions after the dated.
  const settled: StandingRow[] = readiness.rows
    .filter((r) => r.standing !== "notAddressed")
    .sort((a, b) => {
      if (a.confirmedAt && b.confirmedAt) return a.confirmedAt < b.confirmedAt ? 1 : -1;
      if (a.confirmedAt) return -1;
      if (b.confirmedAt) return 1;
      return 0;
    });

  if (settled.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Nothing recorded yet"
        description="What you have confirmed, and when. It fills in as you go."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">What you have settled</p>
        <h1
          className="mt-2 text-[24px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {readiness.confirmed === 1 ? "One thing confirmed so far." : `${readiness.confirmed} things confirmed so far.`}
        </h1>
        {readiness.oldestConfirmedAt && (
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
            The oldest of those was confirmed {describeElapsed(readiness.oldestConfirmedAt, now)}. Anything that has
            been standing a long time will come back for a second look.
          </p>
        )}
      </div>

      <div className="flex flex-col">
        {settled.map((row) => {
          const date = formatDate(row.confirmedAt);
          return (
            <div key={row.step.key} className="border-b border-[var(--border)] py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-[14px] font-semibold text-[var(--text)]">{row.step.instruction}</h2>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: row.standing === "confirmed" ? "var(--primary)" : "var(--muted)" }}
                >
                  {STANDING_LABEL[row.standing]}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                {AFFAIR_AREA_LABEL[row.step.area]}
                {date ? ` · ${date}` : ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
