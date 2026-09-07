"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";

export type TourStep = {
  /**
   * Matches an element's `id`, or a `data-tour-id` when the same thing is
   * rendered more than once responsively. A step whose target is absent,
   * or present but not visible, is skipped.
   */
  targetId: string;
  title: string;
  body: string;
};

/**
 * The visible element for a target.
 *
 * A responsive shell renders the same destination twice — the product
 * rail has a desktop column and a mobile bottom bar, both in the DOM at
 * once with one hidden by CSS. `id` must be unique, and getElementById
 * would happily return the hidden one, whose rect is all zeroes, so the
 * spotlight would land in the corner of the screen. Marking both with
 * `data-tour-id` and picking the one that actually has a box is what
 * makes a tour step work at every width.
 */
function resolveTarget(targetId: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const candidates = document.querySelectorAll<HTMLElement>(`#${CSS.escape(targetId)}, [data-tour-id="${targetId}"]`);
  for (const el of candidates) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return el;
  }
  return null;
}

/**
 * A contextual first-use tour: it spotlights a real element on the page and
 * anchors a short popover to it, one step at a time. Skippable at every step
 * (Skip, Escape, or finishing), non-blocking (the highlighted element stays
 * interactive), and respects reduced motion. The good kind of tour from the
 * Product Experience Playbook (Part 4.3), not a carousel of slides.
 *
 * WHY THIS LIVES HERE
 *
 * It was written inside Monthly Money Reset with a note saying it was
 * "written so it can be lifted into a shared guidance primitive later".
 * That lift never happened, so Personal Finance Companion imported it
 * across a product boundary, and the other seven products got no tour at
 * all. This is the lift.
 *
 * THE BUG THIS FIXES
 *
 * A step whose target element is not on the page used to fall back to
 * dimming the whole screen and centring the popover, so it described a
 * surface the reader could not see. That is not hypothetical: Monthly
 * Money Reset's first step spotlights "Since you were last here", which
 * computeSinceLastHere() returns null for whenever there is no prior
 * confirmed check-in, which is *always* true on a first visit. Every new
 * owner's very first tour step pointed at nothing.
 *
 * A first-run tour runs against an empty product by definition, so absent
 * targets are the normal case, not an edge case. Steps whose target is
 * missing are now skipped, and a tour with nothing left to show finishes
 * itself rather than opening on an empty spotlight.
 */
export default function GuidedTour({
  steps,
  onFinish,
  labelPrefix = "tour",
}: {
  steps: TourStep[];
  onFinish: () => void;
  /** Distinguishes the dialog's label id when more than one tour exists in a tree. */
  labelPrefix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `${labelPrefix}-tour-title`;

  useEffect(() => setMounted(true), []);

  /**
   * Only the steps whose target is actually on the page. Resolved once the
   * component has mounted, so it sees the rendered tree rather than the
   * server's idea of it.
   */
  const liveSteps = useMemo(() => {
    if (!mounted || typeof document === "undefined") return [];
    return steps.filter((s) => resolveTarget(s.targetId) !== null);
  }, [mounted, steps]);

  const step = liveSteps[index];
  const isLast = index === liveSteps.length - 1;

  // Nothing on this screen to point at: finish rather than dim the page.
  useEffect(() => {
    if (mounted && liveSteps.length === 0) onFinish();
  }, [mounted, liveSteps.length, onFinish]);

  const goNext = useCallback(() => {
    if (isLast) onFinish();
    else setIndex((i) => Math.min(i + 1, liveSteps.length - 1));
  }, [isLast, liveSteps.length, onFinish]);

  useEffect(() => {
    if (!step) return;
    const el = resolveTarget(step.targetId);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    const measure = () => setRect(el.getBoundingClientRect());
    measure();
    const settle = window.setTimeout(measure, reduceMotion ? 0 : 380);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [index, step, reduceMotion]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onFinish();
      } else if (event.key === "Enter") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, onFinish]);

  if (!mounted || !step || !rect) return null;

  const pad = 8;
  const spotlight: CSSProperties = {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };

  const placeBelow = window.innerHeight - rect.bottom > 230;
  const left = Math.min(Math.max(rect.left, 16), Math.max(window.innerWidth - 316, 16));
  const popStyle: CSSProperties = placeBelow
    ? { top: rect.bottom + 14, left }
    : { bottom: window.innerHeight - rect.top + 14, left };

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[200]">
      <div
        className={`fixed rounded-2xl ring-2 ring-[var(--primary)] ${reduceMotion ? "" : "transition-all duration-300 ease-out"}`}
        style={{ ...spotlight, boxShadow: "0 0 0 9999px rgba(10, 20, 16, 0.55)" }}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="pointer-events-auto fixed w-[300px] max-w-[calc(100vw-32px)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[shadow:var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        style={popStyle}
      >
        <p className="text-[11px] font-semibold text-[var(--faint)]">
          Step {index + 1} of {liveSteps.length}
        </p>
        <h3 id={titleId} className="mt-1.5 text-[15px] font-semibold text-[var(--text)]">
          {step.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onFinish}
            className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            Skip
          </button>
          <Button variant="commit" size="sm" onClick={goNext}>
            {isLast ? "Got it" : "Next"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
