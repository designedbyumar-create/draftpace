"use client";

import { useState } from "react";
import Select from "@/design-system/Select";
import Button from "@/design-system/Button";
import { Flag } from "@/design-system/Icon";
import {
  HOMESCHOOL_LEVEL_DESCRIPTION,
  HOMESCHOOL_STATE_NAMES,
  getHomeschoolStateRequirement,
} from "@/lib/homeschoolStateRequirements";

/**
 * The one household-level question this product asks: which state.
 *
 * WHY THIS EXISTS
 *
 * "Homeschool record keeping requirements, state by state" is the
 * strongest single query found across every guide this shelf has
 * written, and every competitor in this category, every Etsy printable,
 * every generic tracker, answers it the same way for everyone. This is
 * the one thing nothing else in the market does: pick a state once, and
 * the product tells you what it actually asks for.
 *
 * WHY IT LIVES HERE AND NOT IN ADD-CHILD SETUP
 *
 * State is a household fact, not a per-child one. Asking it again for a
 * second or third child would be exactly the redundant question
 * setup.ts's own doc comment says this product exists never to ask.
 *
 * WHY IT CAN BE SKIPPED
 *
 * Nothing here is forced, the same as every other question this product
 * asks. A parent who skips it loses nothing except the one summary line
 * below; the record keeping itself works identically either way.
 */
export default function HouseholdState({
  state,
  pending,
  onSave,
}: {
  state: string | null;
  pending: boolean;
  onSave: (state: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(state ?? "");

  const requirement = state ? getHomeschoolStateRequirement(state) : null;

  if (!open && state && requirement) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
        <Flag size={16} aria-hidden className="mt-0.5 shrink-0 text-[var(--primary)]" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[var(--text)]">
            {state} &middot; {requirement.level} regulation
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{requirement.note}</p>
          <p className="mt-1 text-[11px] text-[var(--faint)]">
            Laws change. Confirm with your state before relying on this.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDraft(state);
            setOpen(true);
          }}
          className="shrink-0 text-[12px] font-semibold text-[var(--primary)] hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-lg border border-dashed border-[var(--border-strong)] p-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[var(--text)]">Which state do you homeschool in?</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
            Optional. If you say, this tells you what your state actually asks you to keep, instead of a generic
            checklist.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          Add state
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3.5">
      <p className="text-[13px] font-semibold text-[var(--text)]">Which state do you homeschool in?</p>
      <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
        This only decides what record keeping note you see. It changes nothing else here.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Select
          containerClassName="w-full max-w-[260px]"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label="Your state"
        >
          <option value="">Choose a state</option>
          {HOMESCHOOL_STATE_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Button size="sm" disabled={!draft || pending} onClick={() => onSave(draft)}>
          {pending ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => setOpen(false)}>
          {state ? "Cancel" : "Skip for now"}
        </Button>
      </div>
      {draft && HOMESCHOOL_LEVEL_DESCRIPTION[getHomeschoolStateRequirement(draft)?.level ?? "None"] && (
        <p className="mt-2.5 text-[12px] leading-relaxed text-[var(--faint)]">
          {HOMESCHOOL_LEVEL_DESCRIPTION[getHomeschoolStateRequirement(draft)!.level]}
        </p>
      )}
    </div>
  );
}
