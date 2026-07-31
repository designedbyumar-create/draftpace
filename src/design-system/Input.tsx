"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, containerClassName = "", id, className = "", ...rest },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={[
          "h-11 w-full rounded-lg border bg-[var(--surface)] px-3.5 text-[14px] text-[var(--text)] placeholder-[var(--faint)] transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
          error ? "border-[var(--danger)]" : "border-[var(--border-strong)] focus:border-[var(--primary)]",
          className,
        ].join(" ")}
        {...rest}
      />
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

export default Input;
