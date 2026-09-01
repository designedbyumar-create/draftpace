"use client";

import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { CaretDown } from "./Icon";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

/**
 * The select counterpart to Input, same height, radius, padding,
 * typography, and focus treatment, so a form never mixes a styled text
 * field with a raw-browser-looking dropdown next to it. `appearance-none`
 * strips the native arrow; a CaretDown icon replaces it at a fixed position
 * so every select in the app has the same chevron regardless of platform.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, containerClassName = "", id, className = "", children, ...rest },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className={[
            "h-11 w-full appearance-none rounded-lg border bg-[var(--surface)] py-2.5 pl-3.5 pr-9 text-[14px] text-[var(--text)] transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
            error ? "border-[var(--danger)]" : "border-[var(--border-strong)] focus:border-[var(--primary)]",
            className,
          ].join(" ")}
          {...rest}
        >
          {children}
        </select>
        <CaretDown
          size={14}
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[12px] leading-5 text-[var(--muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[12px] leading-5 text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
