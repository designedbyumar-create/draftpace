"use client";

import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

/**
 * Input's multi-line counterpart: same border, radius, focus treatment,
 * and body-lg (16.5px) floor so iOS doesn't auto-zoom the page on focus,
 * the exact bug Input.tsx's own comment documents for the single-line
 * case. Not resizable horizontally — only vertical growth makes sense
 * inside a form column that already owns its own width.
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, containerClassName = "", id, className = "", rows = 4, ...rest },
  ref
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-body-sm font-semibold text-[var(--text)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={[
          "w-full resize-y rounded-lg border bg-[var(--surface)] px-3.5 py-2.5 text-body-lg text-[var(--text)] placeholder-[var(--faint)] transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
          error ? "border-[var(--danger)]" : "border-[var(--border-strong)] focus:border-[var(--primary)]",
          className,
        ].join(" ")}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-caption leading-5 text-[var(--muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-caption leading-5 text-[var(--danger)]">
          {error}
        </p>
      )}
    </div>
  );
});

export default Textarea;
