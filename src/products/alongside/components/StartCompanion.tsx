"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import type { Playbook } from "../playbook";
import { PLAYBOOKS } from "../playbooks";

/**
 * The front door to the Companion when nothing has been recorded yet.
 *
 * "I need to call my landlord" is how somebody actually arrives, not
 * "open the make-a-phone-call playbook". This is the one place that
 * mental model gap gets closed, and it stays deliberately small: a place
 * to say what it is, in your own words, and a list of situations to pick
 * from underneath.
 *
 * The situation list is not routed by reading what was typed. There is
 * no language model anywhere in this codebase and this is not the
 * exception: matching free text to a playbook by guessing would be a
 * worse, unpredictable version of the person just picking, and picking
 * takes one tap. Typing first is optional and never required to
 * continue.
 */
export default function StartCompanion({
  onStart,
  onCancel,
}: {
  onStart: (playbook: Playbook, title: string | null) => void;
  /** Omit when this is already the top-level screen with nowhere else to cancel to. */
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState("");

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Help</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          What do you need to do?
        </h1>
      </div>

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Call the landlord about the leak"
        hint="Optional. In your own words, if it helps to write it down first."
      />

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Or, what's going on?</p>
        <ul className="mt-3 flex flex-col gap-2">
          {PLAYBOOKS.map((playbook) => (
            <li key={playbook.key}>
              <button
                type="button"
                onClick={() => onStart(playbook, title.trim() || null)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left transition-colors hover:border-[var(--primary)]"
              >
                <p className="text-[15px] leading-6 text-[var(--text)]">{playbook.situation}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {onCancel && (
        <div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Not now
          </Button>
        </div>
      )}
    </section>
  );
}
