"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";
import { Plus } from "@/design-system/Icon";
import { QUIET_LINE } from "../attention";
import type { LifeItem } from "../life";

/**
 * The One Card. Now is one thing: a line saying why it is here, the thing in
 * the person's own words, one button, and two ways to set it down. Nothing
 * else competes for the screen, because for the people this is for, an
 * evaluation of several somewhat-urgent things costs the energy that the
 * one thing needed.
 *
 * "Not now" writes nothing. It only moves to the next thing for as long as
 * the screen is open, which is why there is no "N more" anywhere: a count of
 * what is waiting is exactly the pile this product refuses to show.
 *
 * Presentational only. Every write, run and form stays in NowModule.
 */

export interface NowViewProps {
  /** The one thing to show, or null when nothing is asking for anyone. */
  signal: { line: string; item: LifeItem } | null;
  /** True when things did want attention and every one has been set down for now. */
  setDown: boolean;
  /** Whether "Do this with me" applies: the item is open to work and has a walkthrough. */
  canWork: boolean;
  /** The playbook chooser, when "Do this with me" has more than one way in. Replaces the button. */
  chooser: ReactNode | null;
  closing: string | null;
  startError: string | null;
  sorting: boolean;
  onDoThis: () => void;
  onNotNow: () => void;
  onSorted: () => void;
  onShowAgain: () => void;
  onKeep: () => void;
  onHelp: () => void;
}

const QUIET_ACTION =
  "min-h-11 rounded-full px-4 text-[14px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-50";

export default function NowView({
  signal,
  setDown,
  canWork,
  chooser,
  closing,
  startError,
  sorting,
  onDoThis,
  onNotNow,
  onSorted,
  onShowAgain,
  onKeep,
  onHelp,
}: NowViewProps) {
  const reduceMotion = useReducedMotion();
  // A fade and nothing else. No slide, no scale: the screen changes without
  // moving anything toward the person.
  const fade = reduceMotion
    ? {
        initial: false as const,
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.24 },
      };

  return (
    <div
      id="alongside-tour-now"
      className="mx-auto flex min-h-[calc(100dvh-12rem)] w-full max-w-md flex-col gap-6 py-2"
    >
      <h1 className="sr-only">Now</h1>

      <div className="flex flex-1 flex-col justify-center gap-6">
        {closing && (
          <p
            role="status"
            className="text-center text-[13px] text-[var(--muted)]"
          >
            {closing}
          </p>
        )}
        {startError && (
          <p
            role="alert"
            className="text-center text-[13px] text-[var(--danger)]"
          >
            {startError}
          </p>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {signal ? (
            <motion.section
              key={signal.item.id}
              aria-label="The one thing"
              className="flex flex-col gap-5"
              {...fade}
            >
              <p className="text-[14px] font-semibold text-[var(--primary)]">
                {signal.line}
              </p>
              <h2
                className="text-[36px] leading-[1.08] tracking-[-0.015em] text-[var(--text)] [text-wrap:balance]"
                style={{
                  fontFamily: "var(--product-narrative-font, inherit)",
                  fontWeight: 500,
                }}
              >
                {signal.item.title}
              </h2>
              {signal.item.leftOffNote && (
                <p className="text-[15px] leading-relaxed text-[var(--muted)]">
                  {signal.item.leftOffNote}
                </p>
              )}
              {signal.item.nextStep && !signal.item.leftOffNote && (
                <p className="text-[15px] leading-relaxed text-[var(--muted)]">
                  Next: {signal.item.nextStep}
                </p>
              )}

              {/* A waiting item gets no button until the day it is worth
                chasing. Before then somebody else has the ball. */}
              {chooser ??
                (canWork && (
                  <Button
                    variant="commit"
                    size="lg"
                    fullWidth
                    className="mt-1 min-h-14 rounded-2xl text-[16px]"
                    onClick={onDoThis}
                  >
                    Do this with me
                  </Button>
                ))}

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onNotNow}
                  className={QUIET_ACTION}
                >
                  Not now
                </button>
                <button
                  type="button"
                  onClick={onSorted}
                  disabled={sorting}
                  className={QUIET_ACTION}
                >
                  {sorting ? "Saving..." : "It is sorted"}
                </button>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="quiet"
              aria-label="Nothing right now"
              className="flex flex-col gap-4"
              {...fade}
            >
              <h2
                className="text-[36px] leading-[1.08] tracking-[-0.015em] text-[var(--text)] [text-wrap:balance]"
                style={{
                  fontFamily: "var(--product-narrative-font, inherit)",
                  fontWeight: 500,
                }}
              >
                {setDown ? "That is all for now" : QUIET_LINE}
              </h2>
              <p className="text-[15px] leading-relaxed text-[var(--muted)]">
                {setDown
                  ? "Nothing else is asking for you. Everything you have recorded is still here in Life."
                  : "Anything you have recorded is still here in Life."}
              </p>
              {setDown && (
                <div>
                  <button
                    type="button"
                    onClick={onShowAgain}
                    className={`${QUIET_ACTION} -ml-4`}
                  >
                    Show them again
                  </button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto flex flex-col items-center gap-1 pt-2">
        {signal ? (
          <div className="flex items-center justify-center gap-2">
            <button type="button" onClick={onKeep} className={QUIET_ACTION}>
              Keep something
            </button>
            <button
              type="button"
              onClick={onHelp}
              data-tour-id="alongside-tour-help"
              className={QUIET_ACTION}
            >
              Help me with something
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              className="min-h-14 rounded-2xl text-[16px]"
              onClick={onKeep}
              iconLeft={<Plus size={16} aria-hidden />}
            >
              Keep something
            </Button>
            <button
              type="button"
              onClick={onHelp}
              data-tour-id="alongside-tour-help"
              className={`${QUIET_ACTION} self-center`}
            >
              Help me with something
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
