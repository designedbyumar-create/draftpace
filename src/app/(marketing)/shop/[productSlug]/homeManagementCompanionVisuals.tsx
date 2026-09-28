/**
 * Bespoke mobile mockups for Home Base's Shop page, following the exact
 * pattern personalFinanceCompanionVisuals.tsx established: real
 * recreations of the shipped product UI, not screenshots and not a
 * generic template.
 *
 * Rewritten again for the current product. The set this replaces drew an
 * earlier redesign: a static four-band grid and a two-tab (Home/History)
 * bar. HomeView.tsx has since moved to a State Strip of jump-chips (Wrong
 * / To care for / Coming up / Handled), tag-shaped rows with a punched
 * eyelet, and a four-item bottom bar (Now, Seasons, History, Printables).
 * None of those destinations existed when this file was last drawn.
 *
 * What is drawn here maps to what ships: HomeView.tsx's headline, State
 * Strip and Something's wrong / Worth taking care of bands; CareActionSheet.tsx's
 * record of what actually happened; and SetupModule.tsx's tap-to-choose
 * grid over the categories in homeKnowledge.ts.
 *
 * Sage (#4f7a5c, the real theme.accent from definition.ts) distinguishes
 * it from PFC's teal and MMR's clay. Names below are illustrative but
 * internally consistent, and never presented as real account data.
 */
import PhoneFrame from "../PhoneFrame";

const INK = "#1a2420";
const MUTED = "#6b7570";
const FAINT = "#8b9089";
const SAGE = "#4f7a5c";
const WARNING = "#a85d37";
const WARNING_SOFT = "#f7ece4";
const PAPER = "#f4f2ec";
const LINE = "#e4e0d5";

function StatusBar({ tone = "light" }: { tone?: "light" | "dark" }) {
  const color = tone === "dark" ? "text-white" : "text-[#1a2420]";
  return (
    <div className={`flex items-center justify-between px-1 text-[10px] font-semibold ${color}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[1px] border border-current" />
        <span className="h-2 w-2 rounded-full border border-current" />
      </div>
    </div>
  );
}

/** The real four-item bottom bar: Now, Seasons, History, Printables. */
function TabBar({ current }: { current: "Now" | "Seasons" | "History" | "Printables" }) {
  return (
    <div
      className="mt-auto flex items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-[7.5px] font-semibold"
      style={{ borderColor: LINE, color: FAINT }}
    >
      {(["Now", "Seasons", "History", "Printables"] as const).map((tab) => (
        <span key={tab} style={tab === current ? { color: SAGE } : undefined}>
          {tab}
        </span>
      ))}
    </div>
  );
}

/** The State Strip: a row of jump-chips, lit when that band has something to say. */
function StateStrip({ lit }: { lit: boolean[] }) {
  const cells = [
    { label: "Wrong", tone: WARNING },
    { label: "To care for", tone: SAGE },
    { label: "Coming up", tone: MUTED },
    { label: "Handled", tone: "#3f7a53" },
  ];
  return (
    <div className="-mx-0.5 mt-2.5 flex gap-1">
      {cells.map((cell, i) => (
        <span
          key={cell.label}
          className="rounded-full px-2 py-1 text-[7px] font-semibold"
          style={
            lit[i]
              ? { backgroundColor: `color-mix(in srgb, ${cell.tone} 14%, white)`, color: cell.tone }
              : { color: FAINT }
          }
        >
          {cell.label}
        </span>
      ))}
    </div>
  );
}

/** The tag: a plain card with a punched eyelet, cut more on the side it would hang from. */
function TagRow({ title, detail, warning = false }: { title: string; detail: string; warning?: boolean }) {
  return (
    <div
      className="relative rounded-l-[6px] rounded-r-[16px] border py-2.5 pl-[30px] pr-3"
      style={warning ? { borderColor: "#e3c4ab", backgroundColor: WARNING_SOFT } : { borderColor: LINE, backgroundColor: "#fff" }}
    >
      <span
        aria-hidden
        className="absolute left-[10px] top-[13px] h-[8px] w-[8px] rounded-full border"
        style={{ borderColor: warning ? WARNING : "#c7c2b4", backgroundColor: PAPER }}
      />
      {warning && (
        <p className="mb-0.5 text-[7px] font-bold uppercase tracking-[0.1em]" style={{ color: WARNING }}>
          Needs a look
        </p>
      )}
      <p className="text-[10px] font-semibold" style={{ color: INK }}>
        {title}
      </p>
      <p className="mt-0.5 text-[8.5px] leading-relaxed" style={{ color: MUTED }}>
        {detail}
      </p>
    </div>
  );
}

/**
 * Screen 1: Now, the one surface the product has. Mirrors HomeView.tsx: a
 * narrative headline, the State Strip, and the bands in their real order.
 */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame accent={SAGE}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em]" style={{ color: SAGE }}>
              Your home
            </p>
            <p
              className="mt-1 text-[15px] leading-tight"
              style={{ color: INK, fontFamily: "var(--font-newsreader), ui-serif, Georgia, serif" }}
            >
              A few things need a look
            </p>
          </div>
          <span
            className="mt-0.5 shrink-0 rounded-lg border bg-white px-2 py-1 text-[7.5px] font-semibold"
            style={{ borderColor: LINE, color: INK }}
          >
            Something&rsquo;s wrong
          </span>
        </div>

        <StateStrip lit={[true, true, true, false]} />

        <p className="mt-3.5 text-[7.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: FAINT }}>
          Something&rsquo;s wrong
        </p>
        <div className="mt-1.5 flex flex-col gap-1.5">
          <TagRow title="Washing machine pipe is leaking" detail="Reported as a problem" warning />
        </div>

        <p className="mt-3.5 text-[7.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: FAINT }}>
          Worth taking care of
        </p>
        <div className="mt-1.5 flex flex-col gap-1.5">
          <TagRow title="Flush the tank" detail="Last done 2 years ago, usually every year" />
          <TagRow title="Shut off and drain before the freeze" detail="Not logged yet, usually October" />
        </div>

        <TabBar current="Now" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 2: what happens when you act on something. Mirrors
 * CareActionSheet.tsx. This is the difference between a checkbox and a
 * record: acting captures who did it and what it cost, so the history and
 * the provider's page are real afterwards.
 */
export function ActionRecordScreenMockup() {
  return (
    <PhoneFrame accent={SAGE}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
          Water heater
        </p>
        <p className="mt-1 text-[13px] font-semibold" style={{ color: INK }}>
          Flush the tank
        </p>
        <p className="mt-1 text-[8.5px]" style={{ color: MUTED }}>
          What happened?
        </p>

        <div className="mt-1.5 flex flex-col gap-1.5">
          <div
            className="rounded-lg border-2 bg-white px-2.5 py-2 text-[9px] font-semibold"
            style={{ borderColor: SAGE, color: INK }}
          >
            I took care of it
          </div>
          <div className="rounded-lg border bg-white px-2.5 py-2 text-[9px]" style={{ borderColor: LINE, color: MUTED }}>
            Skipping this round
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {[
            ["When", "14 Aug 2026"],
            ["Who did it?", "Ace Plumbing"],
            ["What it cost (optional)", "$180.00"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[7.5px] font-bold uppercase tracking-[0.1em]" style={{ color: FAINT }}>
                {label}
              </p>
              <div
                className="mt-1 rounded-lg border bg-white px-2.5 py-1.5 text-[9px]"
                style={{ borderColor: LINE, color: INK }}
              >
                {value}
              </div>
            </div>
          ))}
          <div>
            <p className="text-[7.5px] font-bold uppercase tracking-[0.1em]" style={{ color: FAINT }}>
              Anything worth remembering? (optional)
            </p>
            <div
              className="mt-1 rounded-lg border bg-white px-2.5 py-1.5 text-[8.5px] leading-relaxed"
              style={{ borderColor: LINE, color: MUTED }}
            >
              Anode rod is due next time
            </div>
          </div>
        </div>

        <div
          className="mt-auto rounded-lg px-3 py-2.5 text-center text-[8.5px] font-semibold text-white"
          style={{ backgroundColor: SAGE }}
        >
          Save
        </div>
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 3: setup, which is tapping rather than typing. Mirrors
 * SetupModule.tsx's "what's here" step, over the categories in
 * homeKnowledge.ts, including the ones an appliance tracker would never
 * ask about.
 */
export function SetupScreenMockup() {
  const picks: [string, boolean][] = [
    ["Water heater", true],
    ["Furnace", true],
    ["Gutters", true],
    ["Smoke alarm", false],
    ["Lawn", true],
    ["Dishwasher", false],
  ];
  return (
    <PhoneFrame accent={SAGE}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
          Setting up
        </p>
        <p
          className="mt-1 text-[14px] leading-tight"
          style={{ color: INK, fontFamily: "var(--font-newsreader), ui-serif, Georgia, serif" }}
        >
          What&rsquo;s in your home?
        </p>
        <p className="mt-1 text-[8.5px] leading-relaxed" style={{ color: MUTED }}>
          Tap what you have. Skip anything you are not sure about.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {picks.map(([label, selected]) => (
            <div
              key={label}
              className="rounded-xl border px-2 py-2.5 text-[8.5px] font-semibold"
              style={
                selected
                  ? { borderColor: SAGE, backgroundColor: "#e6ede2", color: INK }
                  : { borderColor: LINE, backgroundColor: "#ffffff", color: MUTED }
              }
            >
              <span
                className="mb-1.5 block h-4 w-4 rounded-md"
                style={{ backgroundColor: selected ? SAGE : "#e6ede2" }}
                aria-hidden
              />
              {label}
            </div>
          ))}
        </div>

        <p className="mt-3 text-[8px] leading-relaxed" style={{ color: FAINT }}>
          Kitchen · Laundry · Heating · Water · Power · Safety · Structure · Garden · Pests · Everyday · Papers ·
          Renting
        </p>

        <div
          className="mt-auto rounded-lg px-3 py-2.5 text-center text-[8.5px] font-semibold text-white"
          style={{ backgroundColor: SAGE }}
        >
          Continue
        </div>
      </div>
    </PhoneFrame>
  );
}
