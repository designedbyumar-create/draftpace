"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Settings } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import PauseProductControl from "@/components/product-shell/PauseProductControl";
import { findInOrderInstanceId } from "../instanceData";
import { loadItems, loadProfile, recordLifeEvent, saveProfileAnswer } from "../domain/affairsData";
import { INTAKE_QUESTIONS } from "../intake";
import { affectedItems, describeAftermath, LIFE_EVENTS, type LifeEvent } from "../lifeEvents";
import type { AffairItem } from "../lifeAffairs";
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
  const [items, setItems] = useState<AffairItem[]>([]);
  const [pending, setPending] = useState<AffairGate | null>(null);
  const [eventPending, setEventPending] = useState<string | null>(null);
  /** What the companion says after a life event is recorded. */
  const [aftermath, setAftermath] = useState<string | null>(null);

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
    const [result, itemsResult] = await Promise.all([loadProfile(found.id), loadItems(found.id)]);
    setProfile(result.ok ? result.data : {});
    setItems(itemsResult.ok ? itemsResult.data : []);
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

  /**
   * Somebody says their life changed.
   *
   * Two writes and no list. The event is recorded, and every record the
   * change could have made untrue has its review brought forward to now,
   * so it comes back through the ordinary next-step path rather than as
   * a pile of work. Where the event settles an intake answer on its own,
   * that is saved too: recording that you bought a place and then being
   * asked whether you own your home would be the product not listening.
   */
  async function markLifeEvent(event: LifeEvent) {
    if (!instanceId) return;
    setEventPending(event.kind);
    setErrorMessage(null);
    setAftermath(null);

    const affected = affectedItems(event, items);
    const result = await recordLifeEvent(
      instanceId,
      event.kind,
      affected.map((i) => i.id)
    );
    if (!result.ok) {
      setEventPending(null);
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setItems(result.data);

    if (event.implies) {
      const profileResult = await saveProfileAnswer(instanceId, event.implies.gate, event.implies.value);
      if (profileResult.ok) setProfile(profileResult.data);
    }

    setEventPending(null);
    setAftermath(describeAftermath(event, affected));
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance" || !instanceId) {
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

      <section aria-label="Pause" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <PauseProductControl instanceId={instanceId} />
      </section>

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

      <section aria-label="If your life has changed" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">Has something changed?</h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          A picture of your affairs does not go out of date slowly. It goes out of date all at once, the week something
          happens. Tell us and we will work out what is worth a second look.
        </p>

        {aftermath && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[13px] leading-relaxed text-[var(--text)]"
          >
            {aftermath}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {LIFE_EVENTS.map((event) => (
            <Button
              key={event.kind}
              size="sm"
              variant="secondary"
              disabled={eventPending !== null}
              onClick={() => markLifeEvent(event)}
            >
              {eventPending === event.kind ? "Recording..." : event.label}
            </Button>
          ))}
        </div>

        <p className="mt-3 max-w-lg text-[12px] leading-relaxed text-[var(--faint)]">
          Nothing is deleted and nothing is marked wrong. Anything affected simply comes back on the main screen as a
          question, one at a time.
        </p>
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
