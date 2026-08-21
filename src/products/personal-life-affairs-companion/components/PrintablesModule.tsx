"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { BookOpen, Download } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findInOrderInstanceId } from "../instanceData";
import { loadItems, loadProfile, loadSteps } from "../domain/affairsData";
import { deriveReadiness, describeReadiness, isBlankCopy } from "../completion";
import { intakeComplete } from "../intake";
import { AFFAIR_AREA_LABEL, AFFAIR_AREA_ORDER, type AffairArea } from "../affairsKnowledge";
import { describeItem, type AffairItem } from "../lifeAffairs";
import type { AffairProfile, StepRecord } from "../sequencer";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";
type Size = "LETTER" | "A4";

/**
 * The Book: what somebody would actually receive.
 *
 * WHY THIS SHOWS THE PAGES RATHER THAN JUST A DOWNLOAD BUTTON
 *
 * The whole product is aimed at a moment that has not happened yet, and
 * the only way to believe in that moment is to see the artifact. A
 * download button asks a person to take on faith that the file is worth
 * having. Showing the first pages, set the way they will print, answers
 * the question the person is actually asking, which is "is this any good
 * yet, and would it help anyone".
 *
 * NEVER GATED. Not on completeness, not on a percentage, not on a
 * minimum number of records. Somebody with two records can print, and
 * the pages will say plainly that there are two. Done is declared here,
 * never calculated.
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
    return <EmptyState icon={BookOpen} title="Nothing to print yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={BookOpen} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const readiness = deriveReadiness({ profile, records, items }, new Date());
  const personalised = intakeComplete(profile);
  const blank = isBlankCopy(readiness);

  const byArea = AFFAIR_AREA_ORDER.map((area) => ({
    area,
    entries: items.filter((i) => i.area === area),
  })).filter((group) => group.entries.length > 0);

  const lastUpdated = readiness.lastConfirmedAt
    ? new Date(readiness.lastConfirmedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">My affairs book</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {blank ? "Nothing in it yet, and you can still print it." : "What somebody would receive."}
        </h1>
        <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
          {blank
            ? "You have not established much yet. That is completely fine. The blank copy below has only the sections that apply to you, with room to write."
            : "A printable copy of everything you have established, in your own words. It is made on your device, so nothing about your affairs is sent anywhere to produce it."}
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      {/* ------------------------------------------------- the preview */}
      {byArea.length > 0 && (
        <section
          aria-label="Preview of your book"
          className="overflow-hidden rounded-xl border border-[var(--border)]"
          style={{ backgroundColor: "#fbfaf7" }}
        >
          <div className="border-b border-[#e3e0d8] px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: "#26374f" }}>
              In Order
            </p>
            <h2 className="mt-2 text-[22px] leading-tight" style={{ fontFamily: "var(--font-newsreader), serif", color: "#1a1d24" }}>
              My affairs
            </h2>
            {lastUpdated && (
              <p className="mt-1.5 text-[11.5px]" style={{ color: "#666b77" }}>
                Last updated {lastUpdated}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-5 px-6 py-5">
            {byArea.map(({ area, entries }) => (
              <div key={area}>
                <p className="text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: "#949aa6" }}>
                  {AFFAIR_AREA_LABEL[area as AffairArea]}
                </p>
                <div className="mt-2 flex flex-col gap-3">
                  {entries.map((item) => {
                    const detail = describeItem(item);
                    return (
                      <div key={item.id} className="border-l-2 pl-3" style={{ borderColor: "#e6eaf0" }}>
                        <p className="text-[13.5px]" style={{ color: "#1a1d24" }}>
                          {item.label}
                        </p>
                        {detail && detail !== item.label && (
                          <p className="mt-0.5 text-[12.5px] leading-relaxed" style={{ color: "#3b3f49" }}>
                            {detail}
                          </p>
                        )}
                        {item.notes && (
                          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "#666b77" }}>
                            {item.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <p className="border-t border-[#e3e0d8] px-6 py-3 text-[11.5px]" style={{ color: "#666b77" }}>
            The printed copy carries the date you last confirmed each entry, so whoever holds it can tell what is
            current.
          </p>
        </section>
      )}

      {/* --------------------------------------------------- the modes */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-[var(--muted)]">Paper size</span>
        {(["LETTER", "A4"] as Size[]).map((option) => (
          <Button key={option} size="sm" variant={size === option ? "primary" : "secondary"} onClick={() => setSize(option)}>
            {option === "LETTER" ? "US Letter" : "A4"}
          </Button>
        ))}
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">Your book as it stands</h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          {blank
            ? "There is nothing established yet, so this would print as a copy saying so. Worth coming back to once you have recorded a few things."
            : "Everything you have established, with the date you last confirmed each one. This is the copy you would hand to somebody."}
        </p>
        <p className="mt-2 text-[12.5px] text-[var(--muted)]">{describeReadiness(readiness)}</p>
        <div className="mt-4">
          <Button
            size="sm"
            disabled={pending !== null}
            iconLeft={<Download size={14} aria-hidden />}
            onClick={() => download("current")}
          >
            {pending === "current" ? "Preparing..." : "Save as PDF"}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">A blank copy to fill in by hand</h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          The same questions this product asks, with room to write, and a line explaining why each one matters.
          {personalised
            ? " Built from your answers, so it leaves out everything that does not apply to you."
            : " Answer the questions on Next first and this becomes shorter, covering only what applies to you."}
        </p>
        <div className="mt-4">
          <Button
            size="sm"
            variant="secondary"
            disabled={pending !== null}
            iconLeft={<Download size={14} aria-hidden />}
            onClick={() => download("blank")}
          >
            {pending === "blank" ? "Preparing..." : "Save the blank copy"}
          </Button>
        </div>
      </section>

      <p className="max-w-lg text-[12px] leading-relaxed text-[var(--faint)]">
        Nothing is invented. Where you have not told us something, the copy says so rather than filling in a plausible
        answer. Keep the filled copy somewhere private: it says where things are and who to speak to.
      </p>
    </div>
  );
}
