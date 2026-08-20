/**
 * Bespoke mobile mockups for Home Base's Shop page, following the exact
 * pattern personalFinanceCompanionVisuals.tsx established: real
 * recreations of the shipped product UI, not screenshots and not a
 * generic template.
 *
 * Rewritten for the v2 product. The previous set drew the retired v1:
 * a "Needs attention" list, a separate Attention inbox, a three-area
 * Records hub, and a Today/Attention/Records tab bar. None of those
 * destinations exist any more, and the hero mockup put the word
 * "overdue" on the sales page, which is the one thing this product's
 * voice is forbidden from saying.
 *
 * What is drawn here maps to what ships: HomeModule.tsx's narrative
 * headline and its Something's wrong / Worth taking care of / Coming up
 * bands with their Action and Snooze pair; CareActionSheet.tsx's record
 * of what actually happened; and SetupModule.tsx's tap-to-choose grid
 * over the twelve categories in homeKnowledge.ts.
 *
 * Sage (#4f7a5c, the real theme.accent from definition.ts) distinguishes
 * it from PFC's teal and MMR's clay. Names below are illustrative but
 * internally consistent, and never presented as real account data.
 */

const INK = "#1a2420";
const MUTED = "#6b7570";
const FAINT = "#8b9089";
const SAGE = "#4f7a5c";
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

/** Same phone chrome as PFC's mockups, glow tinted sage instead of teal so
 * the two paid Companions read as distinct products at a glance while
 * staying visually consistent as a family. */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 inset-y-8 -z-10 rounded-[3rem] bg-[#4f7a5c] opacity-[0.16] blur-3xl"
      />
      <div
        className="relative overflow-hidden rounded-[2.75rem] border-[6px] border-[#101312] bg-[#101312] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)]"
        style={{ aspectRatio: "9 / 19.5" }}
      >
        <div className="absolute left-1/2 top-2.5 z-10 h-[16px] w-[84px] -translate-x-1/2 rounded-full bg-[#101312]" aria-hidden />
        <div className="absolute inset-0 overflow-hidden rounded-[2.25rem]">{children}</div>
      </div>
    </div>
  );
}

/** The two tabs Home Base actually has. */
function TabBar({ current }: { current: "Home" | "History" }) {
  return (
    <div
      className="mt-auto flex items-center gap-6 rounded-xl border bg-white px-3 py-2.5 text-[8.5px] font-semibold"
      style={{ borderColor: LINE, color: FAINT }}
    >
      {(["Home", "History"] as const).map((tab) => (
        <span key={tab} style={tab === current ? { color: SAGE } : undefined}>
          {tab}
        </span>
      ))}
    </div>
  );
}

function BandLabel({ children }: { children: string }) {
  return (
    <p className="mt-3.5 text-[7.5px] font-bold uppercase tracking-[0.12em]" style={{ color: FAINT }}>
      {children}
    </p>
  );
}

/** A care row exactly as Home draws it: what the job is, when it was last
 * done and how often it comes round, then Action and Snooze. Never a
 * countdown, and never the word this product does not say. */
function CareRow({ title, status, actions = true }: { title: string; status: string; actions?: boolean }) {
  return (
    <div className="rounded-xl border bg-white p-2.5" style={{ borderColor: LINE }}>
      <p className="text-[10px] font-semibold" style={{ color: INK }}>
        {title}
      </p>
      <p className="mt-0.5 text-[8.5px] leading-relaxed" style={{ color: MUTED }}>
        {status}
      </p>
      {actions && (
        <div className="mt-2 flex gap-1.5">
          <span className="rounded-md px-2.5 py-1 text-[8px] font-semibold text-white" style={{ backgroundColor: SAGE }}>
            Action
          </span>
          <span className="rounded-md border px-2.5 py-1 text-[8px] font-semibold" style={{ borderColor: LINE, color: INK }}>
            Snooze
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Screen 1: Home, the one surface the product has. Mirrors
 * HomeModule.tsx: a sentence about the home's condition set in the
 * product's narrative serif, the Something's wrong entry point, then the
 * bands in their real order.
 */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
          Your home
        </p>
        <p
          className="mt-1 text-[15px] leading-tight"
          style={{ color: INK, fontFamily: "var(--font-newsreader), ui-serif, Georgia, serif" }}
        >
          A couple of things worth taking care of
        </p>

        <span
          className="mt-2.5 w-fit rounded-lg border bg-white px-2.5 py-1 text-[8.5px] font-semibold"
          style={{ borderColor: LINE, color: INK }}
        >
          Something&rsquo;s wrong
        </span>

        <BandLabel>Worth taking care of</BandLabel>
        <div className="mt-1.5 flex flex-col gap-1.5">
          <CareRow title="Flush the tank" status="Last done 2 years ago, usually every year" />
          <CareRow title="Shut off and drain before the freeze" status="Not logged yet, usually October" />
        </div>

        <BandLabel>Coming up</BandLabel>
        <div className="mt-1.5">
          <CareRow title="Test the alarm" status="Due in 3 weeks" actions={false} />
        </div>

        <TabBar current="Home" />
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
    <PhoneFrame>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: MUTED }}>
          Water heater
        </p>
        <p className="mt-1 text-[13px] font-semibold" style={{ color: INK }}>
          Flush the tank
        </p>

        <div className="mt-3 flex flex-col gap-1.5">
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
            ["What it cost", "$180.00"],
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
              Anything worth remembering?
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
          className="mt-auto rounded-lg px-3 py-2.5 text-center text-[8.5px] font-semibold"
          style={{ backgroundColor: "#e6ede2", color: SAGE }}
        >
          Saved to this home&rsquo;s history
        </div>
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 3: setup, which is tapping rather than typing. Mirrors
 * SetupModule.tsx's grid over the twelve categories in homeKnowledge.ts,
 * including the ones an appliance tracker would never ask about.
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
    <PhoneFrame>
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
