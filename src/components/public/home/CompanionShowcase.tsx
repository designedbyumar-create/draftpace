import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, HandWaving, Play } from "@/design-system/Icon";
import type { PosterData } from "./posterTypes";
import LiveDemo from "./LiveDemos";

/**
 * One Companion to a section, each with a working copy of itself beside the
 * words. The product's actual name is the biggest thing in its section; the
 * part of life it covers is only a small tag, because a visitor who has been
 * told "Money" still does not know what they are looking at.
 *
 * Each section takes the product's own ground, type and corner radius, so
 * scrolling down the page is scrolling through eight different identities,
 * which is the point of there being eight products.
 *
 * The demo is small on purpose (see LiveDemos.tsx): the copy beside it says
 * what to touch, and the four lines under that say what the product does
 * that the demo cannot show in one card.
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

function Section({ poster, flip }: { poster: PosterData; flip: boolean }) {
  const { theme } = poster;
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
    background: theme.bg,
    color: theme.text,
  } as CSSProperties;
  const label = theme.monoLabels ? "font-[family-name:var(--font-space-mono)] tracking-[0.12em]" : "tracking-[0.14em]";

  return (
    <section id={poster.productSlug} style={vars} aria-label={poster.title} className="scroll-mt-32 border-t border-[var(--poster-border)]">
      {/* On a phone the order is what it is called, what to touch, the demo, and only then what else it does. On a wide screen the words share one column and the demo takes the other. */}
      <div className="mx-auto grid max-w-[1180px] gap-x-16 gap-y-8 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-y-0 lg:py-24">
        <div className={`lg:row-start-1 lg:self-end ${flip ? "lg:col-start-2" : "lg:col-start-1"}`}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ backgroundColor: theme.soft, color: theme.accent }}>
              <Play size={11} aria-hidden /> Live demo
            </span>
            <span className={`text-[11px] font-bold uppercase text-[var(--poster-muted)] ${label}`}>{poster.area}</span>
          </div>

          <h3 className="mt-5 text-[40px] font-semibold leading-[1.02] tracking-[-0.025em] sm:text-[56px]" style={{ fontFamily: theme.headlineFont }}>
            {poster.title}
          </h3>
          <p className="mt-4 max-w-md text-[19px] leading-snug text-[var(--poster-muted)]">{poster.headline}</p>

          <p className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold" style={{ color: theme.accent }}>
            <HandWaving size={17} aria-hidden /> Try it: {HINTS[poster.productSlug]}
          </p>
        </div>

        <div className={`flex justify-center lg:row-span-2 lg:row-start-1 lg:self-center ${flip ? "lg:col-start-1" : "lg:col-start-2"}`}>
          <LiveDemo slug={poster.productSlug} hero={theme.hero} />
        </div>

        <div className={`lg:row-start-2 lg:self-start ${flip ? "lg:col-start-2" : "lg:col-start-1"}`}>
          <ul className="flex max-w-lg flex-col lg:mt-7" role="list">
            {poster.beats.map((beat) => (
              <li key={beat.lead} className="border-t border-[var(--poster-border)] py-3.5">
                <p className="text-[15.5px] font-semibold leading-snug">{beat.lead}</p>
                <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--poster-muted)]">{beat.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-[13px] text-[var(--poster-muted)]">
              <span className="text-[28px] font-semibold text-[var(--poster-text)]" style={{ fontFamily: theme.headlineFont }}>{poster.priceLabel}</span> once, yours for good
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
    </section>
  );
}

export default function CompanionShowcase({ posters }: { posters: PosterData[] }) {
  return (
    <div>
      {posters.map((poster, i) => (
        <Section key={poster.productSlug} poster={poster} flip={i % 2 === 1} />
      ))}
    </div>
  );
}
