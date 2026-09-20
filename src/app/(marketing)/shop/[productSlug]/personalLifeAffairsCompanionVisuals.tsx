/**
 * Bespoke mobile mockups for the Personal Life Affairs Companion's Shop
 * page, following the pattern its siblings established: recreations of the
 * shipped product UI, not screenshots and not a generic template.
 *
 * What is drawn maps to what ships. Screen 1 is NextStepPage: the one step,
 * on a page of the book with a ribbon marking the place. Screen 2 is Companion
 * Mode, CompanionCapture on the same page, asking exactly one question with
 * the earlier answers standing above it. Screen 3 is BookSpread: the cloth
 * cover, the index tabs and the open section. The bottom bar is the real
 * one: Next, Affairs, Book, History.
 *
 * Every colour comes from the product's own definition (its accent and its
 * paper ground), so the drawings cannot fall behind a re-theme. Every phrase
 * drawn is asserted against the component that renders it
 * (personalLifeAffairsCompanionVisuals.test.ts).
 *
 * Words that never appear in these drawings, the same ones the product
 * itself refuses: "estate", "assets" and "overdue". Nor does any count,
 * percentage or progress bar, because the product does not have one and a
 * sales page that invents one is selling something else.
 *
 * Names below are illustrative but internally consistent, and never
 * presented as real account data.
 */
import type { ReactNode } from "react";
import { BookOpen, Clock, Compass, Layers3 } from "@/design-system/Icon";
import { personalLifeAffairsCompanionDefinition } from "@/products/personal-life-affairs-companion/definition";
import PhoneFrame from "../PhoneFrame";

const ground = personalLifeAffairsCompanionDefinition.theme?.ground?.light;
const accent = personalLifeAffairsCompanionDefinition.theme?.accentScale;
if (!ground || !accent) throw new Error("Personal Life Affairs Companion must declare its ground and accent scale.");

const DESK = ground.appBg;
const PAPER = ground.surface;
const TAB = ground.surfaceStrong;
const INK = ground.text;
const MUTED = ground.muted;
const RULE = ground.border;
const STRONG_RULE = ground.borderStrong;
const COVER = accent.base;
const COVER_INK = accent.contrast;
const PAGE_SHADOW = `0 1px 0 ${RULE}, 0 4px 0 -1px ${PAPER}, 0 5px 0 -1px ${RULE}, 0 12px 18px -14px rgba(27, 31, 39, 0.4)`;
const RIBBON = "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)";

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

/** The four destinations the product actually has, an icon over a label, the accent only on the tab you are on. */
function TabBar({ current }: { current: "Next" | "Affairs" | "Book" | "History" }) {
  const tabs = [
    { label: "Next", Icon: Compass },
    { label: "Affairs", Icon: Layers3 },
    { label: "Book", Icon: BookOpen },
    { label: "History", Icon: Clock },
  ] as const;
  return (
    <div className="-mx-4 -mb-4 mt-auto flex border-t" style={{ borderColor: RULE, backgroundColor: PAPER }}>
      {tabs.map(({ label, Icon }) => (
        <span
          key={label}
          className="flex h-10 flex-1 flex-col items-center justify-center gap-px text-[7px] font-semibold"
          style={{ color: label === current ? COVER : MUTED }}
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
    <PhoneFrame accent={COVER}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: DESK }}>
        <StatusBar />
        {children}
      </div>
    </PhoneFrame>
  );
}

/** A page of the book, with the ribbon that marks the one being written. */
function Page({ head, children }: { head: string; children: ReactNode }) {
  return (
    <div className="relative mt-6">
      <div className="relative rounded-[3px] border px-3.5 pb-3.5 pt-4" style={{ backgroundColor: PAPER, borderColor: RULE, boxShadow: PAGE_SHADOW }}>
        <span
          aria-hidden
          className="absolute -top-1.5 right-3.5 block h-8 w-[10px]"
          style={{ backgroundColor: COVER, clipPath: RIBBON }}
        />
        <p
          className="border-b pb-1.5 pr-6 text-[6.5px] font-bold uppercase tracking-[0.14em]"
          style={{ borderColor: RULE, color: MUTED }}
        >
          {head}
        </p>
        {children}
      </div>
    </div>
  );
}

function FilledButton({ children }: { children: string }) {
  return (
    <span className="rounded-[3px] px-3 py-1.5 text-[8px] font-semibold" style={{ backgroundColor: COVER, color: COVER_INK }}>
      {children}
    </span>
  );
}

/**
 * Screen 1: Next. One thing on screen, which is the product's first design
 * law and the whole pitch: the area as the running head, why it matters, an
 * honest estimate, and what the answer becomes in the printed book. No count
 * beside the estimate, and none anywhere else.
 */
export function OverviewScreenMockup() {
  return (
    <Screen>
      <Page head="Who decides, and who to call">
        <p className="mt-2.5 font-serif text-[8.5px] italic" style={{ color: MUTED }}>
          One thing worth taking care of.
        </p>
        <h3 className="mt-1.5 font-serif text-[17px] leading-[1.12]" style={{ color: INK }}>
          Write down who should be called first.
        </h3>
        <p className="mt-2 text-[8px] leading-relaxed" style={{ color: MUTED }}>
          Everything else assumes somebody knows to look. If nobody knows to call, nothing else on this list is ever
          found.
        </p>
        <div
          className="mt-3 flex flex-wrap items-baseline gap-x-1.5 border-t border-dotted pt-2 text-[7.5px]"
          style={{ borderColor: STRONG_RULE, color: MUTED }}
        >
          <span>Goes in your book as</span>
          <span className="font-serif text-[9px] font-semibold" style={{ color: INK }}>
            Who to contact first
          </span>
        </div>
        <p className="mt-1 text-[7.5px]" style={{ color: MUTED }}>
          About 2 minutes
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <FilledButton>Start</FilledButton>
          <span className="rounded-[3px] border px-2.5 py-1.5 text-[8px] font-semibold" style={{ borderColor: STRONG_RULE, color: INK }}>
            Not relevant to me
          </span>
          <span className="px-1.5 py-1.5 text-[8px] font-semibold" style={{ color: MUTED }}>
            Later
          </span>
        </div>
      </Page>
      <TabBar current="Next" />
    </Screen>
  );
}

/**
 * Screen 2: Companion Mode. The thing that makes it a companion rather than
 * a form: what has been said stands above with a way back to it, and exactly
 * one question is live. The counter says "for this one thing" on purpose. It
 * is scoped to a single capture and never to the product, which is the
 * difference between orienting somebody and scoring them.
 */
export function CompanionScreenMockup() {
  return (
    <Screen>
      <Page head="Who decides, and who to call">
        <p className="mt-2.5 text-[7px] font-bold uppercase tracking-[0.12em]" style={{ color: MUTED }}>
          Write down who should be called first
        </p>
        <p className="mt-1 text-[7.5px]" style={{ color: MUTED }}>
          Question 3 of 4 for this one thing.
        </p>

        <div className="mt-2.5 flex flex-col gap-1.5">
          {["Sara Malik", "Wife"].map((answer) => (
            <div key={answer} className="flex items-start gap-1.5">
              <span className="mt-[2px] text-[8px]" style={{ color: COVER }}>
                &#10003;
              </span>
              <span className="flex-1 text-[8.5px]" style={{ color: MUTED }}>
                {answer}
              </span>
              <span className="text-[7px] underline" style={{ color: MUTED }}>
                Change
              </span>
            </div>
          ))}
        </div>

        <h3 className="mt-3 font-serif text-[14px] leading-[1.15]" style={{ color: INK }}>
          How would someone reach them?
        </h3>
        <p className="mt-1 text-[7.5px] leading-relaxed" style={{ color: MUTED }}>
          A phone number or an email. Nothing else is needed.
        </p>
        <div className="mt-2 rounded-[3px] border px-2.5 py-2" style={{ backgroundColor: PAPER, borderColor: COVER }}>
          <span className="text-[8.5px]" style={{ color: INK }}>
            07700 900412
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <FilledButton>Continue</FilledButton>
          <span className="px-1.5 py-1.5 text-[8px] font-semibold" style={{ color: MUTED }}>
            Skip this
          </span>
        </div>
      </Page>
      <TabBar current="Next" />
    </Screen>
  );
}

/**
 * Screen 3: the Book. The artifact the whole product is aimed at, drawn as
 * BookSpread sets it: a cloth cover, then index tabs for the areas that have
 * something in them, then the open section, in the person's own words with a
 * leader from the entry to where it is. No count on the cover, matching the
 * printed book, which says what the copy is rather than how complete it is.
 */
export function BookScreenMockup() {
  return (
    <Screen>
      <div
        className="relative mt-6 overflow-hidden rounded-[3px] py-5 pl-8 pr-4"
        style={{ backgroundColor: COVER, color: COVER_INK, boxShadow: "0 12px 18px -14px rgba(27, 31, 39, 0.55)" }}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-3.5" style={{ backgroundColor: "rgba(0, 0, 0, 0.22)" }} />
        <p className="text-[6px] font-bold uppercase tracking-[0.18em] opacity-75">Personal Life Affairs Companion</p>
        <p className="mt-3.5 font-serif text-[22px] leading-none">My Affairs</p>
        <div className="mt-3.5 h-px w-9" style={{ backgroundColor: COVER_INK, opacity: 0.55 }} />
        <p className="mt-2 text-[7.5px] opacity-80">Last updated 3 September 2026</p>
      </div>

      <div className="mt-3.5">
        <div className="-mb-px flex gap-0.5 pl-2">
          {[
            { label: "People", active: true },
            { label: "Important documents", active: false },
            { label: "Money", active: false },
          ].map((tab) => (
            <span
              key={tab.label}
              className="rounded-t-[3px] border border-b-0 px-2 pb-1 pt-1 text-[7px] font-semibold"
              style={
                tab.active
                  ? { backgroundColor: PAPER, borderColor: RULE, color: INK }
                  : { backgroundColor: TAB, borderColor: "transparent", color: MUTED }
              }
            >
              {tab.label}
            </span>
          ))}
        </div>
        <div className="rounded-[3px] border px-3 py-3" style={{ backgroundColor: PAPER, borderColor: RULE }}>
          <p className="border-b pb-1.5 text-[6.5px] font-bold uppercase tracking-[0.14em]" style={{ borderColor: RULE, color: MUTED }}>
            Who decides, and who to call
          </p>
          {[
            { label: "Who to contact first", detail: "Sara Malik, wife, 07700 900412" },
            { label: "Who would sort things out", detail: "Amir Malik, brother" },
          ].map((entry) => (
            <div key={entry.label} className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-[10px]" style={{ color: INK }}>
                  {entry.label}
                </span>
                <span aria-hidden className="min-w-2 flex-1 border-b border-dotted" style={{ borderColor: STRONG_RULE }} />
              </div>
              <p className="mt-0.5 text-[7.5px]" style={{ color: MUTED }}>
                {entry.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
      <TabBar current="Book" />
    </Screen>
  );
}
