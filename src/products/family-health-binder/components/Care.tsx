"use client";

import { useState, type ReactNode } from "react";
import Button from "@/design-system/Button";
import { WarningCircle } from "@/design-system/Icon";
import { initialOf, personMarkStyle } from "../personColors";

/**
 * This product's own visual vocabulary: a card someone fills in and reads at
 * a glance. Generous corners (the shape token), a warm paper ground, one
 * sans face, a small colour and initial for each person, and allergies set
 * first as a tag, the way they are on an alert bracelet.
 */

/** A soft card. Rounded by the shape token, a hairline, and the faintest lift. */
export const CARD = "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[0_1px_2px_color-mix(in_srgb,var(--text)_6%,transparent)]";

/** A person's colour and first letter. Colour labels the person and says nothing about their health. */
export function PersonMark({ index, name, size = 44 }: { index: number; name: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{ ...personMarkStyle(index), width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {initialOf(name)}
    </span>
  );
}

/** An allergy as a tag, or a quiet note. */
export function Tag({ children, tone = "allergy" }: { children: ReactNode; tone?: "allergy" | "quiet" }) {
  return tone === "allergy" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[13px] font-semibold text-[var(--primary-strong)]">
      <WarningCircle size={14} aria-hidden />
      {children}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[13px] font-medium text-[var(--muted)]">{children}</span>
  );
}

/** A screen's heading: the question it answers, small, above what it is. */
export function Heading({ kicker, title, action }: { kicker: string; title: string; action?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[13px] font-medium text-[var(--muted)]">{kicker}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--text)]">{title}</h1>
      </div>
      {action}
    </header>
  );
}

/** A titled group inside a card. The count is a fact about the list, never a score. */
export function Section({ title, count, action, children }: { title: string; count?: number; action?: ReactNode; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--text)]">
          {title}
          {count !== undefined && count > 0 && <span className="ml-2 text-[13px] font-medium text-[var(--faint)]">{count}</span>}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A pill-shaped choice between a few views of one thing. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 rounded-full bg-[var(--surface-muted)] p-1">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={`min-h-9 flex-1 rounded-full px-3 text-[14px] font-semibold transition-colors ${
              active ? "bg-[var(--surface)] text-[var(--text)] shadow-[0_1px_2px_color-mix(in_srgb,var(--text)_10%,transparent)]" : "text-[var(--muted)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Choosing whose card, shown only when there is more than one person. */
export function PersonPicker({
  people,
  activeId,
  onPick,
  trailing,
}: {
  people: { id: string; name: string }[];
  activeId: string;
  onPick: (id: string) => void;
  trailing?: ReactNode;
}) {
  return (
    <div role="group" aria-label="Person" className="flex flex-wrap gap-2">
      {people.map((person, index) => {
        const active = person.id === activeId;
        return (
          <button
            key={person.id}
            type="button"
            aria-pressed={active}
            onClick={() => onPick(person.id)}
            className={`flex min-h-10 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-[14px] font-semibold transition-colors ${
              active ? "border-[var(--text)] bg-[var(--text)] text-[var(--surface)]" : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text)]"
            }`}
          >
            <PersonMark index={index} name={person.name} size={30} />
            {person.name}
          </button>
        );
      })}
      {trailing}
    </div>
  );
}

/** Where a form opens: a tinted panel that sits inside the card it belongs to. */
export function FormPanel({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-[var(--radius)] bg-[var(--surface-muted)] p-4">{children}</div>;
}

/** One record in a list: what it is, a line beneath, and what can be done to it. */
export function RecordRow({ title, meta, note, actions }: { title: ReactNode; meta?: ReactNode; note?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 py-3 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-[var(--border)]">
      <p className="text-[15px] font-semibold leading-snug text-[var(--text)]">{title}</p>
      {meta && <p className="text-[13.5px] leading-snug text-[var(--muted)]">{meta}</p>}
      {note && <p className="text-[13.5px] leading-snug text-[var(--muted)]">{note}</p>}
      {actions && <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">{actions}</div>}
    </div>
  );
}

/** A small text action under a record. */
export function TextAction({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="min-h-8 text-[13.5px] font-semibold text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50">
      {children}
    </button>
  );
}

/**
 * Remove is two steps, and says what it does: the record leaves view and is
 * not erased. A slip of the thumb never removes anything.
 */
export function RemoveControl({ what, pending, onConfirm }: { what: string; pending: boolean; onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);
  if (!asking) return <TextAction onClick={() => setAsking(true)}>Remove</TextAction>;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px]">
      <span className="text-[var(--muted)]">Take {what} out of view?</span>
      <Button size="sm" variant="secondary" disabled={pending} onClick={onConfirm}>
        Yes, remove
      </Button>
      <TextAction onClick={() => setAsking(false)}>Keep it</TextAction>
    </span>
  );
}

/** The private checkbox every fact, symptom, shot and visit carries. */
export function PrivateField({ checked, onChange, leaves }: { checked: boolean; onChange: (next: boolean) => void; leaves: string }) {
  return (
    <label className="flex items-start gap-3 text-[14px] text-[var(--text)]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-[18px] w-[18px] accent-[var(--primary)]" />
      <span>
        Keep this private
        <span className="block text-[13px] font-normal text-[var(--muted)]">Stays in the app. Left off {leaves}.</span>
      </span>
    </label>
  );
}

/** Pill choices for a small closed set, as radio-like buttons. */
export function ChoiceRow<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-[var(--text)]">{label}</p>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.id)}
              className={`min-h-9 rounded-full border px-3.5 text-[14px] font-semibold ${
                active ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]" : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A labelled multi-line field, 16px so iOS does not zoom the page on focus. */
export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  const id = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-[16px] leading-relaxed text-[var(--text)] placeholder-[var(--faint)] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      />
      {hint && <p className="mt-1.5 text-[12px] leading-5 text-[var(--muted)]">{hint}</p>}
    </div>
  );
}
