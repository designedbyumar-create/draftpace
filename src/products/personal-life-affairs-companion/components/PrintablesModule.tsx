"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Article } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findInOrderInstanceId } from "../instanceData";
import { loadItems, loadProfile, loadSteps } from "../domain/affairsData";
import { deriveReadiness, describeReadiness } from "../completion";
import { intakeComplete } from "../intake";
import type { AffairProfile, StepRecord } from "../sequencer";
import type { AffairItem } from "../lifeAffairs";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";
type Size = "LETTER" | "A4";

/**
 * Both paper paths, in one place.
 *
 * The blank copy is the one no binder can match: it contains only the
 * sections that apply to this person, because the intake answers already
 * decided that. Somebody who rents, has no children and no business gets
 * a genuinely short book rather than three hundred pages with most of it
 * crossed out.
 *
 * The current copy is whatever state they are actually in. It is never
 * gated on completeness, because done is declared and not calculated,
 * and it says plainly what is settled and what is not.
 */
export default function PrintablesModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<AffairProfile>({});
  const [records, setRecords] = useState<StepRecord[]>([]);
  const [items, setItems] = useState<AffairItem[]>([]);
  const [size, setSize] = useState<Size>("LETTER");
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(async () => {
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
    const [profileResult, stepsResult, itemsResult] = await Promise.all([
      loadProfile(found.id),
      loadSteps(found.id),
      loadItems(found.id),
    ]);
    if (!stepsResult.ok) {
      setErrorMessage(describeResultError(stepsResult.error));
      setStatus("error");
      return;
    }
    setProfile(profileResult.ok ? profileResult.data : {});
    setRecords(stepsResult.data);
    setItems(itemsResult.ok ? itemsResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function download(which: "blank" | "current") {
    setPending(which);
    setErrorMessage(null);
    try {
      const { downloadInOrderCopy } = await import("../printables/download");
      // A blank copy is the same document with nothing recorded, which is
      // why there is one generator rather than a template and an export.
      const readiness = deriveReadiness(
        which === "blank" ? { profile, records: [], items: [] } : { profile, records, items },
        new Date()
      );
      await downloadInOrderCopy({ size, preparedBy: "", readiness, summary: describeReadiness(readiness) });
    } catch {
      setErrorMessage("The copy could not be generated. Nothing was downloaded.");
    } finally {
      setPending(null);
    }
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Article} title="Nothing to print yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Article} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const readiness = deriveReadiness({ profile, records, items }, new Date());
  const personalised = intakeComplete(profile);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">On paper</p>
        <h1
          className="mt-2 text-[24px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          Two ways to put this on paper.
        </h1>
        <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
          Some people would rather sit at a table with a pen. Either copy contains only the sections that apply to you,
          and nothing that does not.
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-[var(--muted)]">Paper size</span>
        {(["LETTER", "A4"] as Size[]).map((option) => (
          <Button
            key={option}
            size="sm"
            variant={size === option ? "primary" : "secondary"}
            onClick={() => setSize(option)}
          >
            {option === "LETTER" ? "US Letter" : "A4"}
          </Button>
        ))}
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">A blank copy</h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Every prompt, with room to write, and a line explaining why each one matters.
          {personalised
            ? " Built from your answers, so it leaves out everything that does not apply to you."
            : " Answer the questions on the main screen first and this becomes shorter, covering only what applies to you."}
        </p>
        <div className="mt-4">
          <Button size="sm" disabled={pending !== null} onClick={() => download("blank")}>
            {pending === "blank" ? "Preparing..." : "Download the blank copy"}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">Where you are now</h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Everything you have recorded, in your own words, with the date you last confirmed each one. This is the copy
          you would hand to somebody.
        </p>
        <p className="mt-2 text-[12.5px] text-[var(--muted)]">{describeReadiness(readiness)}</p>
        <div className="mt-4">
          <Button size="sm" disabled={pending !== null} onClick={() => download("current")}>
            {pending === "current" ? "Preparing..." : "Download where you are now"}
          </Button>
        </div>
      </section>

      <p className="max-w-lg text-[12px] leading-relaxed text-[var(--faint)]">
        Both are made on your device, so nothing about your affairs is sent anywhere to produce them. Keep the filled
        copy somewhere private: it says where things are and who to speak to.
      </p>
    </div>
  );
}
