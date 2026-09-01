"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import { CheckCircle2, ShieldCheck } from "@/design-system/Icon";
import { deriveHandoff, describeHandoff, firstFix } from "../handoff";
import type { AffairProfile, StepRecord } from "../sequencer";
import type { AffairItem } from "../lifeAffairs";

/**
 * "Could another person actually use this?"
 *
 * Folded shut by default. Open, it lists what is unclear and offers one
 * thing to do about it, never four. That restraint is the same rule as
 * the main screen: seeing the list is useful, being handed the list as
 * work is not.
 *
 * No percentage, no grade, no ring. A person who reads "68% ready" learns
 * nothing they can act on and something they will feel bad about.
 */
export interface HandoffCheckPanelProps {
  profile: AffairProfile;
  records: StepRecord[];
  items: AffairItem[];
  /** Where questions get asked. Always Next, because there is only one place. */
  nextHref: string;
}

export default function HandoffCheckPanel({ profile, records, items, nextHref }: HandoffCheckPanelProps) {
  const [open, setOpen] = useState(false);
  const result = deriveHandoff({ profile, records, items });
  const fix = firstFix(result);

  return (
    <section
      aria-label="Handoff check"
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Handoff check</p>
          <h2 className="mt-1.5 text-[15px] font-semibold text-[var(--text)]">{describeHandoff(result)}</h2>
        </div>
        {result.allClear ? (
          <CheckCircle2 size={18} aria-hidden className="mt-1 shrink-0 text-[var(--primary)]" />
        ) : (
          <ShieldCheck size={18} aria-hidden className="mt-1 shrink-0 text-[var(--muted)]" />
        )}
      </div>

      {result.allClear ? (
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Every part of your affairs that applies to you has an answer somebody else could follow.
        </p>
      ) : (
        <>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            This looks at what you have recorded the way a stranger would: not step by step, but by what they would
            actually be trying to do.
          </p>

          {open && (
            <ul className="mt-4 flex flex-col gap-3">
              {result.unclear.map((finding) => (
                <li key={finding.scenario.key}>
                  <p className="text-[13.5px] font-semibold text-[var(--text)]">{finding.scenario.need}</p>
                  {/*
                    One per line, not comma joined. Several of these
                    instructions contain commas of their own, and run
                    together they read as one long sentence nobody
                    finishes.
                  */}
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {finding.missing.map((step) => (
                      <li key={step.key} className="flex gap-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
                        <span aria-hidden className="text-[var(--faint)]">
                          &middot;
                        </span>
                        <span>{step.instruction}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
              {open ? "Hide the list" : "Show what is unclear"}
            </Button>
            {fix && (
              /*
                Sends the person to Next rather than opening a capture
                here. Next decides what to ask using prerequisites and
                snoozes as well as consequence, so it may reasonably
                offer something other than the first row above. Promising
                a specific one here and then showing a different one is
                the kind of small lie that makes a product feel unreliable.
              */
              <Button size="sm" href={nextHref}>
                Take care of the first one
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
