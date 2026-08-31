"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";

export type TourStep = { targetId: string; title: string; body: string };

/**
 * A contextual first-use tour: it spotlights a real element on the page and
 * anchors a short popover to it, one step at a time. It is skippable at every
 * step (Skip, Escape, or finishing), non-blocking (the highlighted element stays
 * interactive), and respects reduced motion. This is the good kind of tour from
 * the Product Experience Playbook (Part 4.3), not a carousel of slides. Built for
 * MMR first; written so it can be lifted into a shared guidance primitive later.
 */
export default function GuidedTour({ steps, onFinish }: { steps: TourStep[]; onFinish: () => void }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (!el) {
      setRect(null);
      return;
    }
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
        if (isLast) onFinish();
        else setIndex((i) => Math.min(i + 1, steps.length - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLast, steps.length, onFinish]);

  if (!mounted || !step) return null;

  const goNext = () => {
    if (isLast) onFinish();
    else setIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const pad = 8;
  const spotlight: CSSProperties | null = rect
    ? { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }
    : null;

  let popStyle: CSSProperties;
  if (rect) {
    const placeBelow = window.innerHeight - rect.bottom > 230;
    const left = Math.min(Math.max(rect.left, 16), Math.max(window.innerWidth - 316, 16));
    popStyle = placeBelow ? { top: rect.bottom + 14, left } : { bottom: window.innerHeight - rect.top + 14, left };
  } else {
    popStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[200]">
      {spotlight ? (
        <div
          className={`fixed rounded-2xl ring-2 ring-[var(--primary)] ${reduceMotion ? "" : "transition-all duration-300 ease-out"}`}
          style={{ ...spotlight, boxShadow: "0 0 0 9999px rgba(10, 20, 16, 0.55)" }}
        />
      ) : (
        <div className="fixed inset-0 bg-[var(--overlay)]" />
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="mmr-tour-title"
        tabIndex={-1}
        className="pointer-events-auto fixed w-[300px] max-w-[calc(100vw-32px)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[shadow:var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        style={popStyle}
      >
        <p className="text-[11px] font-semibold text-[var(--faint)]">
          Step {index + 1} of {steps.length}
        </p>
        <h3 id="mmr-tour-title" className="mt-1.5 text-[15px] font-semibold text-[var(--text)]">
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
          <Button size="sm" onClick={goNext}>
            {isLast ? "Got it" : "Next"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
