"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "@/design-system/Logo";
import Button from "@/design-system/Button";
import { ArrowRight } from "@/design-system/Icon";
import { EASE_OUT, useCombinedReducedMotion } from "./motion";

/**
 * Persistent card chrome shared by every onboarding moment. Only the inner
 * content crossfades between steps (keyed by `step`) — the card itself,
 * the logo, and the skip control never remount, so the whole flow reads as
 * one continuous surface instead of a page-by-page wizard.
 */
export default function StepShell({
  step,
  totalSteps,
  onSkip,
  onBack,
  onContinue,
  canGoBack,
  canContinue,
  continueLabel,
  children,
}: {
  step: number;
  totalSteps: number;
  onSkip: () => void;
  onBack: () => void;
  onContinue: () => void;
  canGoBack: boolean;
  canContinue: boolean;
  continueLabel: string;
  children: React.ReactNode;
}) {
  const reduceMotion = useCombinedReducedMotion();

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--text)] transition-colors duration-[var(--dur)] ease-[var(--ease-out)]">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-md flex-col">
        <div className="flex items-center justify-between">
          <LogoMark size={42} />
          <button
            type="button"
            onClick={onSkip}
            className="rounded px-1 text-[12px] font-semibold text-[var(--muted)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          >
            Skip
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2" aria-hidden>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-full transition-colors duration-[var(--dur)] ease-[var(--ease-out)] ${
                index === step ? "bg-[var(--primary)]" : "bg-[var(--surface-strong)]"
              }`}
            />
          ))}
        </div>

        <section className="mt-6 flex-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] transition-colors duration-[var(--dur)] ease-[var(--ease-out)] sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: EASE_OUT }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </section>

        <div className="mt-6 grid grid-cols-[auto_1fr] gap-3">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={onBack}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-[13px] font-semibold text-[var(--muted)] transition-colors duration-[var(--dur-fast)] disabled:opacity-40"
          >
            Back
          </button>
          <Button onClick={onContinue} disabled={!canContinue} size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
            {continueLabel}
          </Button>
        </div>
      </div>
    </main>
  );
}
