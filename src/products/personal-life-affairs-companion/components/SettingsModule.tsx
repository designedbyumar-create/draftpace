"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Settings } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findInOrderInstanceId } from "../instanceData";
import { loadProfile, saveProfileAnswer } from "../domain/affairsData";
import { INTAKE_QUESTIONS } from "../intake";
import type { AffairProfile } from "../sequencer";
import type { AffairGate } from "../affairsKnowledge";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Settings, which for this product means one thing above all: changing
 * an answer about your life.
 *
 * A life event is the whole reason a picture goes stale. Somebody
 * separates, has a child, buys a place, or winds up a business, and the
 * list that was right last year quietly stops being right. Letting them
 * correct an answer here is what turns a form into something that keeps
 * up, and it immediately changes what the product will and will not ask
 * about.
 *
 * Nothing here is destructive. Changing an answer to no silences a
 * branch; it never deletes what was already recorded, so an answer given
 * years ago survives and simply stops being asked about.
 */
export default function SettingsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AffairProfile>({});
  const [pending, setPending] = useState<AffairGate | null>(null);

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
    setInstanceId(found.id);
    const result = await loadProfile(found.id);
    setProfile(result.ok ? result.data : {});
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function change(gate: AffairGate, value: boolean) {
    if (!instanceId) return;
    setPending(gate);
    setErrorMessage(null);
    const result = await saveProfileAnswer(instanceId, gate, value);
    setPending(null);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setProfile(result.data);
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Settings} title="Nothing to change yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Settings} title="Couldn't load settings" description={errorMessage ?? "Try again."} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Settings</p>
        <h1
          className="mt-2 text-[24px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          If something in your life has changed.
        </h1>
        <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
          These answers decide what this product asks you about. Change one and it takes effect straight away. Nothing
          you have already recorded is deleted.
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      <section aria-label="Your answers" className="flex flex-col">
        {INTAKE_QUESTIONS.map((q) => {
          const answer = profile[q.gate];
          return (
            <div key={q.gate} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] py-3.5">
              <div className="min-w-0 flex-1">
                <h2 className="text-[14px] text-[var(--text)]">{q.question}</h2>
                {typeof answer !== "boolean" && (
                  <p className="mt-0.5 text-[12px] text-[var(--faint)]">Not answered yet</p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  variant={answer === true ? "primary" : "secondary"}
                  disabled={pending !== null}
                  onClick={() => change(q.gate, true)}
                >
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant={answer === false ? "primary" : "secondary"}
                  disabled={pending !== null}
                  onClick={() => change(q.gate, false)}
                >
                  No
                </Button>
              </div>
            </div>
          );
        })}
      </section>

      <section aria-label="How this keeps up" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">How this keeps up over the years</h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Some answers go out of date on their own. Who is named on a pension, who would raise your children, where the
          paperwork lives. When one has been standing long enough to be worth a second look, it comes back on the main
          screen as a question rather than as a task you failed to do.
        </p>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Nothing is sent to you yet. Reminders that reach you when the app is closed are not built for this product,
          and choosing how they should work is a decision that has not been made.
        </p>
      </section>
    </div>
  );
}
