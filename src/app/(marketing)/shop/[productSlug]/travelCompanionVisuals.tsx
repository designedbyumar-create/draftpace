/**
 * Bespoke mobile mockups for Travel Companion's Shop page, following the
 * pattern its siblings established: recreations of the shipped product UI,
 * not screenshots and not a generic template.
 *
 * What is drawn maps to what ships. Screen 1 is TodayView: the day as a run
 * of tickets, with its real Tomorrow and Waiting groups. Screen 2 is
 * ItineraryView: the whole trip, day by day, including a day with nothing
 * recorded, which says so. Screen 3 is TripModule's change-impact panel,
 * with its real "unchanged so far" wording and a way to deal with each
 * booking it points at. The bottom bar is the real one: Today, Itinerary,
 * Trip, People.
 *
 * Every colour comes from the product's own definition (Lagoon), so the
 * drawings cannot fall behind a re-theme. Every phrase drawn is asserted
 * against the component that renders it (travelCompanionVisuals.test.ts).
 *
 * The deep accent appears on the tab you are on and nowhere else, the same
 * rule the product follows: tickets, stubs and day headers carry none.
 *
 * Two things never appear in these drawings, because they never appear in
 * the product: any monetary amount, and any live external data such as a
 * flight status pulled from an airline. Every line drawn here is something a
 * traveller recorded themselves, and nothing counts down to anything.
 */
import type { ReactNode } from "react";
import { CalendarCheck, Compass, Globe, MapPin, User } from "@/design-system/Icon";
import { travelCompanionDefinition } from "@/products/travel-companion/definition";
import PhoneFrame from "../PhoneFrame";

const ground = travelCompanionDefinition.theme?.ground?.light;
const accent = travelCompanionDefinition.theme?.accentScale;
if (!ground || !accent) throw new Error("Travel Companion must declare its ground and accent scale.");

const DESK = ground.appBg;
const SURFACE = ground.surface;
const SUNKEN = ground.surfaceStrong;
const INK = ground.text;
const MUTED = ground.muted;
const RULE = ground.border;
const STRONG_RULE = ground.borderStrong;
const ACCENT = accent.base;
const STUB = accent.wash ?? accent.soft;
const TICKET_SHADOW = "0 1px 2px rgba(0, 0, 0, 0.05), 0 8px 14px -10px rgba(0, 0, 0, 0.3)";

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
function TabBar({ current }: { current: "Today" | "Itinerary" | "Trip" | "People" }) {
  const tabs = [
    { label: "Today", Icon: Compass },
    { label: "Itinerary", Icon: CalendarCheck },
    { label: "Trip", Icon: Globe },
    { label: "People", Icon: User },
  ] as const;
  return (
    <div className="-mx-4 -mb-4 mt-auto flex border-t" style={{ borderColor: RULE, backgroundColor: SURFACE }}>
      {tabs.map(({ label, Icon }) => (
        <span
          key={label}
          className="flex h-10 flex-1 flex-col items-center justify-center gap-px text-[7px] font-semibold"
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
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: DESK }}>
        <StatusBar />
        {children}
      </div>
    </PhoneFrame>
  );
}

function Heading({ trip, title }: { trip: string; title: string }) {
  return (
    <div className="mt-5">
      <p className="text-[6.5px] font-bold uppercase tracking-[0.16em]" style={{ color: MUTED }}>
        {trip}
      </p>
      <h3 className="mt-1 text-[22px] font-semibold leading-none tracking-[-0.02em]" style={{ color: INK }}>
        {title}
      </h3>
    </div>
  );
}

/** One stop as a ticket: the time on a stub, a perforation with its two bites, then the booking. */
function Ticket({
  time,
  title,
  note,
  awaiting = false,
  later = false,
}: {
  time: string;
  title: string;
  note?: string;
  awaiting?: boolean;
  later?: boolean;
}) {
  return (
    <div className="relative flex rounded-[10px] border" style={{ backgroundColor: SURFACE, borderColor: RULE, boxShadow: TICKET_SHADOW }}>
      <div className="flex w-[38px] shrink-0 items-center justify-center py-2.5">
        <span
          className="rounded-[4px] px-1 py-0.5 text-[7.5px] font-bold tabular-nums"
          style={{ backgroundColor: later ? SUNKEN : STUB, color: INK }}
        >
          {time}
        </span>
      </div>
      <div className="relative my-2 w-0 border-l border-dashed" style={{ borderColor: STRONG_RULE }}>
        <span aria-hidden className="absolute -left-[4px] -top-[10px] h-2 w-2 rounded-full" style={{ backgroundColor: DESK }} />
        <span aria-hidden className="absolute -bottom-[10px] -left-[4px] h-2 w-2 rounded-full" style={{ backgroundColor: DESK }} />
      </div>
      <div className="min-w-0 flex-1 px-2.5 py-2">
        <p className="text-[9.5px] font-semibold leading-tight" style={{ color: later ? MUTED : INK }}>
          {title}
        </p>
        {note && (
          <p className="mt-0.5 text-[7.5px]" style={{ color: MUTED }}>
            {note}
          </p>
        )}
        {awaiting && (
          <p
            className="mt-1 inline-block rounded-full px-1.5 py-[1px] text-[6px] font-bold uppercase tracking-[0.08em]"
            style={{ backgroundColor: SUNKEN, color: MUTED }}
          >
            Awaiting confirmation
          </p>
        )}
      </div>
    </div>
  );
}

const Link = () => (
  <div aria-hidden className="ml-[19px] h-2 w-0 border-l border-dashed" style={{ borderColor: STRONG_RULE }} />
);

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="mb-1.5 mt-4 text-[6.5px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
      {children}
    </p>
  );
}

/**
 * Screen 1: Today, as a run of tickets. Every stop is a booking with the
 * time it was recorded for, and the groups under it are the ones the
 * product derives: tomorrow, and what is still being waited on. No "you are
 * here" marker and no countdown, because neither is stored.
 */
export function OverviewScreenMockup() {
  return (
    <Screen>
      <Heading trip="JAPAN" title="Today" />
      <p className="mt-1.5 flex items-center gap-1 text-[8px]" style={{ color: MUTED }}>
        <MapPin size={9} aria-hidden />
        Currently in Kyoto
      </p>
      <div className="mt-3.5 flex flex-col">
        <Ticket time="09:05" title="Shinkansen to Osaka" note="Kyoto Station" />
        <Link />
        <Ticket time="12:30" title="Lunch at Nishiki Market" awaiting />
        <Link />
        <Ticket time="15:00" title="Kyoto Ryokan" note="Check-in begins" />
      </div>
      <GroupLabel>Tomorrow</GroupLabel>
      <Ticket time="10:00" title="Rental car" note="Pickup begins" later />
      <GroupLabel>Waiting</GroupLabel>
      <div
        className="rounded-[10px] border border-dashed px-2.5 py-2 text-[8.5px] leading-snug"
        style={{ borderColor: STRONG_RULE, color: MUTED }}
      >
        Rebooking the transfer
      </div>
      <span
        className="mt-3 inline-block self-start rounded-[6px] border px-2.5 py-1.5 text-[7.5px] font-semibold"
        style={{ borderColor: STRONG_RULE, color: INK, backgroundColor: SURFACE }}
      >
        Need help with something?
      </span>
      <TabBar current="Today" />
    </Screen>
  );
}

/**
 * Screen 2: the whole trip, day by day. A day with nothing recorded says so
 * in a dashed outline where a ticket would be, and offers to add something,
 * which is where the gaps in a trip show, with no suggestion of what should
 * fill them. A hotel gets its check-out on the day it ends.
 */
export function ItineraryScreenMockup() {
  const Day = ({ date, place, children }: { date: string; place: string; children: ReactNode }) => (
    <div className="mt-4">
      <div className="mb-2 flex items-end justify-between border-b pb-1.5" style={{ borderColor: STRONG_RULE }}>
        <div>
          <p className="text-[11px] font-semibold leading-none" style={{ color: INK }}>
            {date}
          </p>
          <p className="mt-1 flex items-center gap-0.5 text-[7px]" style={{ color: MUTED }}>
            <MapPin size={7} aria-hidden />
            {place}
          </p>
        </div>
        <span className="text-[7.5px] font-semibold" style={{ color: INK }}>
          Add
        </span>
      </div>
      {children}
    </div>
  );
  return (
    <Screen>
      <Heading trip="JAPAN" title="Itinerary" />
      <p className="mt-1.5 text-[8px]" style={{ color: MUTED }}>
        8 Oct to 21 Oct
      </p>
      <Day date="Wed 8 Oct" place="Kyoto">
        <div className="flex flex-col">
          <Ticket time="14:00" title="Airport transfer" />
          <Link />
          <Ticket time="15:00" title="Kyoto Ryokan" note="Check-in begins" />
        </div>
      </Day>
      <Day date="Thu 9 Oct" place="Kyoto">
        <p className="rounded-[10px] border border-dashed px-2.5 py-2 text-[8px]" style={{ borderColor: STRONG_RULE, color: MUTED }}>
          Nothing recorded for this day.
        </p>
      </Day>
      <Day date="Fri 10 Oct" place="Osaka">
        <Ticket time="09:05" title="Shinkansen to Osaka" note="Kyoto Station" />
      </Day>
      <TabBar current="Itinerary" />
    </Screen>
  );
}

/**
 * Screen 3: the change-impact walk, the one thing this product does that
 * its category does not. Drawn after a change was recorded on a booking,
 * showing what depends on it, each with its own way in. The wording
 * "unchanged so far" is the real string: nothing is ever edited for you.
 */
export function ChangeImpactScreenMockup() {
  return (
    <Screen>
      <Heading trip="JAPAN" title="Trip" />
      <div className="mt-3 rounded-[10px] border p-2.5" style={{ backgroundColor: SURFACE, borderColor: RULE, boxShadow: TICKET_SHADOW }}>
        <p className="text-[6.5px] font-bold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
          flight
        </p>
        <p className="mt-0.5 text-[10.5px] font-semibold" style={{ color: INK }}>
          Flight PK123
        </p>
        <div className="mt-2 flex flex-wrap gap-3 text-[7.5px] font-semibold" style={{ color: MUTED }}>
          <span>Sort out a problem with this</span>
          <span>Record a change</span>
        </div>
        <div className="mt-2.5 rounded-[7px] border border-dashed p-2" style={{ borderColor: STRONG_RULE, backgroundColor: DESK }}>
          <p className="text-[7.5px] font-semibold leading-[1.35]" style={{ color: INK }}>
            This might affect these 2, unchanged so far:
          </p>
          {[
            { title: "Airport transfer", time: "14:00" },
            { title: "Kyoto Ryokan", time: "15:00" },
          ].map((row) => (
            <div key={row.title} className="mt-1.5 flex flex-wrap items-center justify-between gap-1">
              <span className="text-[8px]" style={{ color: INK }}>
                {row.title}
                <span style={{ color: MUTED }}> · {row.time}</span>
              </span>
              <span className="text-[7px] font-semibold" style={{ color: INK }}>
                Deal with what changed
              </span>
            </div>
          ))}
        </div>
      </div>
      <TabBar current="Trip" />
    </Screen>
  );
}
