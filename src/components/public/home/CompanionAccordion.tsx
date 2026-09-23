"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CaretDown, HandWaving } from "@/design-system/Icon";
import type { PosterData } from "./posterTypes";
import LiveDemo from "./LiveDemos";

/**
 * The eight Companions, as one accordion instead of eight full-height
 * sections in a row.
 *
 * Stacking every product at full length is a great way to show each one
 * off and a bad way to get through eight of them: by the sixth section a
 * reader has forgotten what the third one did, and the only way back is
 * to scroll. Here every product is a compact row (its icon, its name, two
 * or three lines on what it actually gets you, its price) until you
 * actually want it, and opening one closes whichever was open, so there
 * is only ever one full-length product on screen and the page stays a
 * fraction of the height.
 *
 * A collapsed row is a pitch, not a label: BUYER_BLURB below is written
 * for someone who already has a reason to want this, not a restatement
 * of the feature list a click away.
 *
 * Two separate controls, not one overloaded row: "View" is a real link to
 * the product page, styled like the hero's own CTA in that product's
 * colour, for a visitor who already knows what they want. The caret is
 * the only thing that opens or closes the demo in place. Clicking the row
 * itself does the same as the caret, so neither is required reading.
 */
const HINTS: Record<string, string> = {
  "personal-finance-companion": "Show the working, then drag the slider.",
  "home-management-companion": "Tap Action or Snooze on a job.",
  alongside: "Tap Do this with me.",
  "homeschooling-companion": "Tap a circle to mark it done.",
  "personal-life-affairs-companion": "Tap Start.",
  "travel-companion": "Tap The flight changed.",
  "vehicle-maintenance-companion": "Tap I had this done, or switch cars.",
  "family-health-binder": "Mark an allergy private.",
};

/**
 * What somebody already looking to buy this wants to read, in two or
 * three lines: the outcome, not the feature list. Every claim here is the
 * same one the beats below it make, just said the way a person thinks
 * about the problem rather than the way the product solves it.
 */
const BUYER_BLURB: Record<string, string> = {
  "personal-finance-companion":
    "Know what is actually safe to spend today, not just your balance. Watch your real debt-free date move as you pay extra. One number, never a dashboard to keep up with.",
  "home-management-companion":
    "Know what your home needs this week in one sentence, not a spreadsheet. A schedule for 122 kinds of job, tracked by season rather than a fixed date. Every repair recorded, so the next one starts with facts.",
  alongside:
    "One thing to do next, never a wall of everything undone. Real help getting through the calls and conversations you keep avoiding. Step away mid-task and it picks up exactly where you left off.",
  "homeschooling-companion":
    "Homeschool without losing track of what each child has covered. Every child kept separate, with their own plan, checks and printed record. A 30 page handbook, already matched against your state's requirements.",
  "personal-life-affairs-companion":
    "Make sure the people who depend on you could actually find everything. 46 things recorded across eight areas, answered one plain question at a time. A real book to hand over, not a folder someone has to guess through.",
  "family-health-binder":
    "Stop filling out the same camp or school form from memory every time. Each person kept as a card, allergies first and what is still missing. Mark anything private and it stays off every page you print.",
  "travel-companion":
    "Know exactly what a flight change actually affects, not just the flight. Authored help for the nine things that actually go wrong on a trip. Every booking on its own time zone, so nothing is called late by mistake.",
  "vehicle-maintenance-companion":
    "Say what you will pay before the shop starts the work. Every car you own on one strip, so you always know which one needs you. Full history, paperwork and a glove box card, always at hand.",
};

function Row({ poster, isOpen, onToggle }: { poster: PosterData; isOpen: boolean; onToggle: () => void }) {
  const { theme } = poster;
  const reduceMotion = useReducedMotion();
  const label = theme.monoLabels ? "font-[family-name:var(--font-space-mono)] tracking-[0.12em]" : "tracking-[0.14em]";
  // The same --poster-* custom properties CompanionShowcase used to set per
  // section: LiveDemo (LiveDemos.tsx) is styled entirely through these, so
  // without them every open row would render its demo in the generic
  // fallback teal from globals.css instead of that product's own accent.
  const vars = {
    "--poster-bg": theme.bg,
    "--poster-surface": theme.surface,
    "--poster-text": theme.text,
    "--poster-muted": theme.muted,
    "--poster-border": theme.border,
    "--poster-accent": theme.accent,
    "--poster-accent-contrast": theme.accentContrast,
    "--poster-soft": theme.soft,
    "--poster-radius": `${theme.radius}px`,
  } as CSSProperties;

  return (
    <div
      id={poster.productSlug}
      className="scroll-mt-32 transition-colors duration-300"
      style={{ ...vars, background: isOpen ? theme.bg : undefined, color: isOpen ? theme.text : undefined }}
    >
      <div className="flex items-start gap-3 px-5 py-6 sm:gap-4 sm:px-6">
        {/*
          Clicking the row is a convenience, not the accessible control:
          the caret button below is the one real toggle, with its own
          aria-expanded/aria-controls, so this can be a plain div and the
          "View" link inside it never ends up nested inside a <button>
          (invalid HTML, and unreachable for a screen reader either way).
        */}
        <div onClick={onToggle} className="flex min-w-0 flex-1 cursor-pointer items-start gap-4">
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl" style={{ backgroundColor: theme.soft }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a static per-product PWA icon, not an optimizable content image */}
            <img src={`/logo/products/${poster.productSlug}/icon-192.png`} alt="" className="h-8 w-8 rounded-lg object-contain" width={32} height={32} />
            {isOpen && (
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 animate-pulse rounded-full ring-2"
                style={{ backgroundColor: theme.accent, ["--tw-ring-color" as string]: theme.soft }}
                aria-hidden
              />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <span id={`header-${poster.productSlug}`} className="text-[17px] font-semibold leading-tight sm:text-[19px]" style={{ fontFamily: theme.headlineFont }}>
                {poster.title}
              </span>
              <span className={`text-[10.5px] font-bold uppercase text-[var(--faint)] ${label}`} style={isOpen ? { color: theme.muted } : undefined}>
                {poster.area}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed" style={{ color: isOpen ? theme.muted : "var(--muted)" }}>
              {BUYER_BLURB[poster.productSlug]}
            </p>

            {/* Price and View sit under the pitch while the row is
                collapsed, so a visitor who is already sold never has to
                open anything to reach the product's own page. Once open,
                the expanded panel below ends with its own price and CTA,
                so this doesn't repeat it. */}
            {!isOpen && (
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="text-[16px] font-semibold" style={{ fontFamily: theme.headlineFont }}>
                  {poster.priceLabel}
                </span>
                <Link
                  href={`/shop/${poster.productSlug}`}
                  aria-label={`View ${poster.title}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
                  style={{ backgroundColor: theme.accent, color: theme.accentContrast }}
                >
                  View <ArrowRight size={13} aria-hidden />
                </Link>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`panel-${poster.productSlug}`}
          className="flex shrink-0 items-center gap-1.5 rounded-full py-1.5 pl-2.5 pr-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          style={isOpen ? { color: theme.muted } : undefined}
        >
          {isOpen ? "Collapse this" : "Interact with this"}
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: theme.soft }}>
            <CaretDown
              size={14}
              aria-hidden
              className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              style={{ color: theme.accent }}
            />
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`panel-${poster.productSlug}`}
            role="region"
            aria-labelledby={`header-${poster.productSlug}`}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-x-16 gap-y-8 px-5 pb-10 pt-2 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-y-0 lg:pb-14">
              <div className="lg:row-start-1 lg:self-end">
                <p className="inline-flex items-center gap-2 text-[14px] font-semibold" style={{ color: theme.accent }}>
                  <HandWaving size={17} aria-hidden /> Try it: {HINTS[poster.productSlug]}
                </p>
              </div>

              <div className="flex justify-center lg:row-span-2 lg:row-start-1 lg:self-center">
                <LiveDemo slug={poster.productSlug} hero={theme.hero} />
              </div>

              <div className="lg:row-start-2 lg:self-start">
                <ul className="flex max-w-lg flex-col" role="list">
                  {poster.beats.map((beat) => (
                    <li key={beat.lead} className="border-t py-3.5" style={{ borderColor: theme.border }}>
                      <p className="text-[15px] font-semibold leading-snug">{beat.lead}</p>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed" style={{ color: theme.muted }}>
                        {beat.text}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <p className="text-[13px]" style={{ color: theme.muted }}>
                    <span className="text-[26px] font-semibold" style={{ fontFamily: theme.headlineFont }}>
                      {poster.priceLabel}
                    </span>{" "}
                    once, yours for good
                  </p>
                  <Link
                    href={`/shop/${poster.productSlug}`}
                    aria-label={`See ${poster.title} in full`}
                    className="inline-flex items-center gap-2 px-5 py-3 text-[14px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2"
                    style={{ backgroundColor: theme.accent, color: theme.accentContrast, borderRadius: theme.radius }}
                  >
                    See it in full <ArrowRight size={15} aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CompanionAccordion({ posters }: { posters: PosterData[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(posters[0]?.productSlug ?? null);

  // A hero or "Tell it once" link (#productSlug) should open that product
  // and bring it into view, not just scroll to a collapsed row. Handles
  // both the initial load and a later click, since those are ordinary
  // same-page anchor navigations and fire hashchange without a reload.
  useEffect(() => {
    const openFromHash = () => {
      const slug = window.location.hash.slice(1);
      if (!slug || !posters.some((p) => p.productSlug === slug)) return;
      setOpenSlug(slug);
      requestAnimationFrame(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById(slug)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [posters]);

  return (
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {posters.map((poster) => (
        <Row
          key={poster.productSlug}
          poster={poster}
          isOpen={poster.productSlug === openSlug}
          onToggle={() => setOpenSlug((current) => (current === poster.productSlug ? null : poster.productSlug))}
        />
      ))}
    </div>
  );
}
