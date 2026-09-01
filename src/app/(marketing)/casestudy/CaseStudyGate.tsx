"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Lock } from "@/design-system/Icon";
import Button from "@/design-system/Button";

/**
 * A soft lock in front of the case study, not a real access control. The
 * code lives in this file's own JavaScript, so anyone who opens dev tools
 * can read it back out. That is an accepted trade for its actual job: keep
 * the page from being stumbled on by a casual visitor or a crawler while
 * it is unlisted, not withstand somebody determined to get in.
 *
 * Getting past it is remembered in sessionStorage rather than
 * localStorage, so it does not silently persist forever on a shared
 * machine: it clears itself when the tab closes.
 */
const CODE = "3330";
const STORAGE_KEY = "draftpace-casestudy-granted";

export default function CaseStudyGate({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState<boolean | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let stored = false;
    try {
      stored = window.sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      // Private browsing or storage disabled: falls through to the gate,
      // which is the safe direction to fail in.
    }
    setGranted(stored);
  }, []);

  useEffect(() => {
    if (granted === false) inputRef.current?.focus();
  }, [granted]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (value.trim() === CODE) {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Access still works for this render even if it cannot be
        // remembered for the next page load.
      }
      setGranted(true);
      setError(false);
    } else {
      setError(true);
      setValue("");
    }
  }

  // Undecided yet whether this tab already granted it: render nothing
  // rather than flashing the gate and then the content, or the reverse.
  if (granted === null) return null;

  if (granted) return <>{children}</>;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-muted)]">
          <Lock size={18} className="text-[var(--muted)]" aria-hidden />
        </div>
        <h1 className="mt-5 font-serif text-[22px] font-semibold tracking-tight text-[var(--text)]">
          This page is private for now
        </h1>
        <p className="mt-2.5 text-[14px] leading-relaxed text-[var(--muted)]">
          Enter the code to read the Draftpace case study.
        </p>

        <form onSubmit={handleSubmit} className="mt-7">
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(false);
            }}
            aria-label="Access code"
            aria-invalid={error || undefined}
            aria-describedby={error ? "casestudy-gate-error" : undefined}
            placeholder="Code"
            className={[
              "h-12 w-full rounded-lg border bg-[var(--surface)] px-4 text-center text-[18px] tracking-[0.3em] text-[var(--text)] placeholder-[var(--faint)] placeholder:tracking-normal transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]",
              error ? "border-[var(--danger)]" : "border-[var(--border-strong)] focus:border-[var(--primary)]",
            ].join(" ")}
          />
          {error && (
            <p id="casestudy-gate-error" role="alert" className="mt-2 text-[13px] text-[var(--danger)]">
              That code is not right.
            </p>
          )}
          <div className="mt-4">
            <Button type="submit" fullWidth>
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
