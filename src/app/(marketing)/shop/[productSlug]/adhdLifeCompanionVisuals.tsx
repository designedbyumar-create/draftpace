/**
 * Bespoke mobile mockups for ADHD Life Companion's Shop page, following
 * the pattern its siblings established: recreations of the shipped product
 * UI, not screenshots and not a generic template.
 *
 * What is drawn maps to what ships. Screen 1 is NowView's One Card. Screen
 * 2 is the "while you are on the call" step, with the person's own words
 * shown back from CompanionRun's recall panel. Screen 3 is LifeModule's
 * shapes, with the collapsed Sorted list. The bottom bar is the real one:
 * Now and Life.
 *
 * Every colour comes from the product's own definition (Dusk, the theme's
 * accent and ground), not from a second copy of the hex codes, so the
 * drawings cannot fall behind a re-theme. Every phrase drawn is asserted
 * against the component that really renders it (adhdLifeCompanionVisuals
 * .test.ts), so a screen cannot keep drawing a control the product no
 * longer has. That is how the old Help tab survived here after it was gone.
 *
 * Three things never appear in these drawings, because they never appear
 * in the product: a streak, a count of what is waiting or done, and any word
 * implying somebody failed at something.
 */
import type { ReactNode } from "react";
import { Compass, Layers3 } from "@/design-system/Icon";
import { alongsideDefinition } from "@/products/alongside/definition";
import PhoneFrame from "../PhoneFrame";

const ground = alongsideDefinition.theme?.ground?.light;
const accent = alongsideDefinition.theme?.accentScale;
if (!ground || !accent) throw new Error("ADHD Life Companion must declare its ground and accent scale.");

const PAGE = ground.appBg;
const SURFACE = ground.surface;
const SUNKEN = ground.surfaceMuted;
const INK = ground.text;
const MUTED = ground.muted;
const LINE = ground.border;
const ACCENT = accent.base;
const ACCENT_LABEL = accent.contrast;
const CARD_SHADOW = "0 10px 20px -12px rgba(36, 30, 33, 0.38)";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-1 text-[10px] font-semibold" style={{ color: INK }}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[1px] border border-current" />
        <span className="h-2 w-2 rounded-full border border-current" />
      </div>
    </div>
  );
}

/** The real bottom bar: Now and Life, an icon over a label, the accent only on the tab you are on. */
function TabBar({ current }: { current: "Now" | "Life" }) {
  const tabs = [
    { label: "Now", Icon: Compass },
    { label: "Life", Icon: Layers3 },
  ] as const;
  return (
    <div
      className="-mx-4 -mb-4 mt-auto flex border-t"
      style={{ borderColor: LINE, backgroundColor: SURFACE }}
    >
      {tabs.map(({ label, Icon }) => (
        <span
          key={label}
          className="flex h-10 flex-1 flex-col items-center justify-center gap-px text-[7.5px] font-semibold"
          style={{ color: label === current ? ACCENT : MUTED }}
        >
          <Icon size={12} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  );
}

function Screen({ children }: { children: ReactNode }) {
  return (
    <PhoneFrame accent={ACCENT}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAGE }}>
        <StatusBar />
        {children}
      </div>
    </PhoneFrame>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[7px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
      {children}
    </p>
  );
}

/** The one filled control on any screen: the accent's only job. */
function CommitButton({ children }: { children: string }) {
  return (
    <span
      className="mt-3 block rounded-lg py-2 text-center text-[9px] font-semibold"
      style={{ backgroundColor: ACCENT, color: ACCENT_LABEL }}
    >
      {children}
    </span>
  );
}

/**
 * Screen 1: Now. One card, and nothing else competing with it: why it is
 * here, the thing in the person's own words, one button, two ways to set
 * it down. No "N more", because a count of what is waiting is exactly the
 * pile this product refuses to show.
 */
export function OverviewScreenMockup() {
  return (
    <Screen>
      <div className="flex flex-1 flex-col justify-center gap-3">
        <div
          className="rounded-2xl border p-3.5"
          style={{ backgroundColor: SURFACE, borderColor: LINE, boxShadow: CARD_SHADOW }}
        >
          <p className="text-[7.5px] font-semibold" style={{ color: MUTED }}>
            You said you would come back to this
          </p>
          <h3 className="mt-2 font-serif text-[18px] leading-[1.1]" style={{ color: INK }}>
            Call the clinic about the referral
          </h3>
          <CommitButton>Do this with me</CommitButton>
          <div className="mt-2.5 flex justify-center gap-4 text-[8px] font-medium" style={{ color: MUTED }}>
            <span>Not now</span>
            <span>It is sorted</span>
          </div>
        </div>
        <div className="flex justify-center gap-3 text-[7.5px] font-medium" style={{ color: MUTED }}>
          <span>Keep something</span>
          <span>Help me with something</span>
        </div>
      </div>
      <TabBar current="Now" />
    </Screen>
  );
}

/**
 * Screen 2: the call, at the moment it matters. The person's own words,
 * written earlier in the walkthrough, are shown back above the short
 * list, so what they decided to say is on the screen while they say it
 * instead of held in their head.
 */
export function CompanionScreenMockup() {
  return (
    <Screen>
      <div className="mt-4">
        <Eyebrow>Make a phone call</Eyebrow>
        <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
          Call the clinic about the referral
        </p>

        <div className="mt-2.5 flex items-center gap-1" aria-hidden>
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className="h-[3px] flex-1 rounded-full"
              style={{ backgroundColor: i < 6 ? ACCENT : LINE }}
            />
          ))}
        </div>

        <h3 className="mt-3 font-serif text-[15px] leading-[1.15]" style={{ color: INK }}>
          While you are on the call
        </h3>
        <p className="mt-1 text-[7px] leading-relaxed" style={{ color: MUTED }}>
          Short on purpose. Anything longer is unreadable while somebody is talking to you.
        </p>

        <div
          className="mt-2.5 flex flex-col gap-2 rounded-lg px-2.5 py-2"
          style={{ backgroundColor: SUNKEN, boxShadow: `inset 0 0 0 1px ${LINE}` }}
        >
          {[
            { label: "What a good result looks like", text: "A date for someone to come out" },
            { label: "Do not forget", text: "Ask if the fee is covered" },
          ].map((entry) => (
            <div key={entry.label}>
              <p className="text-[6.5px] font-semibold" style={{ color: MUTED }}>
                {entry.label}
              </p>
              <p className="font-serif text-[10px] leading-snug" style={{ color: INK }}>
                {entry.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-2 flex flex-col gap-1.5">
          {["Say what you need", "Ask your main question", "Ask what happens next"].map((line) => (
            <div
              key={line}
              className="flex items-start gap-1.5 rounded-lg border px-2.5 py-1.5"
              style={{ backgroundColor: SURFACE, borderColor: LINE }}
            >
              <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
              <span className="text-[8px]" style={{ color: INK }}>
                {line}
              </span>
            </div>
          ))}
        </div>

        <span
          className="mt-2.5 inline-block rounded-md px-3 py-1.5 text-[8px] font-semibold"
          style={{ backgroundColor: ACCENT, color: ACCENT_LABEL }}
        >
          Ready
        </span>
      </div>
      <TabBar current="Now" />
    </Screen>
  );
}

/**
 * Screen 3: Life. The shapes kept apart, and the things that are dealt
 * with kept reachable under a collapsed Sorted that carries no count. The
 * waiting card has no "Do this with me": somebody else has the ball until
 * its own check date.
 */
export function LifeScreenMockup() {
  return (
    <Screen>
      <div className="mt-4">
        <Eyebrow>Life</Eyebrow>
        <h3 className="mt-1.5 font-serif text-[16px] leading-[1.15]" style={{ color: INK }}>
          Everything you are holding
        </h3>

        <p className="mt-3 text-[6.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
          Something to do
        </p>
        <div className="mt-1.5 rounded-lg border p-2.5" style={{ backgroundColor: SURFACE, borderColor: LINE }}>
          <p className="text-[9.5px] font-medium" style={{ color: INK }}>
            Book the dentist
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="rounded-md border px-2 py-1 text-[7.5px] font-semibold"
              style={{ borderColor: LINE, color: INK, backgroundColor: SURFACE }}
            >
              Do this with me
            </span>
            <span className="text-[7.5px] font-medium" style={{ color: MUTED }}>
              It is sorted
            </span>
          </div>
        </div>

        <p className="mt-2.5 text-[6.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
          Waiting on someone
        </p>
        <div className="mt-1.5 rounded-lg border p-2.5" style={{ backgroundColor: SURFACE, borderColor: LINE }}>
          <p className="text-[9.5px] font-medium" style={{ color: INK }}>
            Sort out the mistake on the electricity bill
          </p>
          <p className="mt-1 text-[7.5px]" style={{ color: MUTED }}>
            Waiting on Octopus
          </p>
          <span className="mt-2 inline-block text-[7.5px] font-medium" style={{ color: MUTED }}>
            They came back to me
          </span>
        </div>

        <div
          className="mt-3 flex items-center justify-between rounded-lg border px-2.5 py-2"
          style={{ backgroundColor: SURFACE, borderColor: LINE }}
        >
          <span className="text-[8.5px] font-semibold" style={{ color: INK }}>
            Sorted
          </span>
          <span className="text-[7px] font-medium" style={{ color: MUTED }}>
            Show
          </span>
        </div>
      </div>
      <TabBar current="Life" />
    </Screen>
  );
}
