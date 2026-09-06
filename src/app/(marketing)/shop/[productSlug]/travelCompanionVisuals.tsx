/**
 * Bespoke mobile mockups for Travel Companion's Shop page, following
 * the pattern its five siblings established: real recreations of the
 * shipped product UI, not screenshots and not a generic template.
 *
 * What is drawn maps to what ships: TodayModule's derived state with
 * its real Waiting section, TripModule's change-impact panel with its
 * real "unchanged so far" wording, and the Trip Brief card that sits at
 * the top of the Trip screen. The bottom bar is the real one: Today,
 * Trip, People.
 *
 * Amber (#a8611f, the real theme.accent) distinguishes it from ink
 * blue, sage, teal, clay, plum and mulberry. Deliberately not the
 * blue-and-cloud palette every mainstream travel app uses: this is
 * opened mid-trip, often mid-problem, and a tourist-brochure palette on
 * that screen is the wrong register.
 *
 * Two things never appear in these drawings, because they never appear
 * in the product: any monetary amount, and any live external data such
 * as a flight status pulled from an airline. Every line drawn here is
 * something a traveller recorded themselves.
 */
import PhoneFrame from "../PhoneFrame";

const INK = "#1a1d24";
const MUTED = "#4a5262";
const FAINT = "#8b93a1";
const AMBER = "#a8611f";
const PAPER = "#fbfaf7";
const LINE = "#e3e0d8";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-[#1a1d24]">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-3 rounded-[1px] border border-current" />
        <span className="h-2 w-2 rounded-full border border-current" />
      </div>
    </div>
  );
}

function TabBar({ current }: { current: "Today" | "Trip" | "People" }) {
  return (
    <div
      className="mt-auto flex items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-[8.5px] font-semibold"
      style={{ borderColor: LINE, color: FAINT }}
    >
      {(["Today", "Trip", "People"] as const).map((tab) => (
        <span key={tab} style={tab === current ? { color: AMBER } : undefined}>
          {tab}
        </span>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[7.5px] font-bold uppercase tracking-[0.14em]" style={{ color: AMBER }}>
      {children}
    </p>
  );
}

/**
 * Screen 1: Today. The real derived state, including the Waiting
 * section that only exists because an outcome opened a thread. Times
 * are shown exactly as stored, and no line carries a red alert colour:
 * nothing in this product is an alarm.
 */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame accent={AMBER}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Japan</Eyebrow>
          <h3 className="mt-2 font-serif text-[17px] leading-[1.15]" style={{ color: INK }}>
            Today
          </h3>
          <p className="mt-1 text-[8.5px]" style={{ color: MUTED }}>
            Currently in Kyoto
          </p>

          {[
            { title: "Shinkansen to Osaka, 09:05.", note: "Kyoto Station" },
            { title: "Hotel check-in begins at 15:00.", note: null },
          ].map((row) => (
            <div key={row.title} className="mt-2.5 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
              <p className="text-[9.5px] leading-[1.35]" style={{ color: INK }}>
                {row.title}
              </p>
              {row.note && (
                <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
                  {row.note}
                </p>
              )}
            </div>
          ))}

          <p className="mt-3 text-[7.5px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
            Waiting
          </p>
          <p className="mt-1 text-[8.5px] leading-relaxed" style={{ color: MUTED }}>
            Waiting on the transfer company to confirm the new pickup time
          </p>
        </div>
        <TabBar current="Today" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 2: the change-impact walk, the one thing this product does
 * that its category does not. Drawn mid-walk, after a flight time was
 * recorded as changed, showing the downstream booking as potentially
 * affected with its own unchanged time still on screen. The wording
 * "unchanged so far" is the real string: nothing is ever auto-edited.
 */
export function ChangeImpactScreenMockup() {
  return (
    <PhoneFrame accent={AMBER}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Trip</Eyebrow>
          <h3 className="mt-2 font-serif text-[15px] leading-[1.15]" style={{ color: INK }}>
            Something changed
          </h3>

          <div className="mt-3 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
            <p className="text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
              Flight
            </p>
            <p className="mt-1 text-[9.5px] font-semibold" style={{ color: INK }}>
              Flight PK123
            </p>
            <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
              Now 07:30, was 04:05
            </p>
          </div>

          <div className="mt-2.5 rounded-lg border p-2.5" style={{ borderColor: LINE, backgroundColor: "#f7ead9" }}>
            <p className="text-[8px] font-semibold leading-[1.35]" style={{ color: INK }}>
              This might affect these 2, unchanged so far:
            </p>

            {[
              { title: "Airport transfer", time: "Oct 8, 14:00" },
              { title: "Kyoto Ryokan check-in", time: "Oct 8, 15:00" },
            ].map((row) => (
              <div key={row.title} className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[8.5px]" style={{ color: INK }}>
                  {row.title}
                  <span style={{ color: MUTED }}> · {row.time}</span>
                </span>
              </div>
            ))}

            <span
              className="mt-2.5 inline-block rounded-md border px-2 py-1 text-[7.5px] font-semibold"
              style={{ borderColor: AMBER, color: AMBER }}
            >
              Deal with what changed
            </span>
          </div>

          <p className="mt-3 text-[8px] leading-relaxed" style={{ color: FAINT }}>
            Nothing was edited for you. You decide what actually needs doing.
          </p>
        </div>
        <TabBar current="Trip" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 3: the Trip Brief card at the top of the Trip screen,
 * expanded. Every line is derived from stored rows, and the counts are
 * real counts rather than a progress score: this product has no
 * completion percentage anywhere in it.
 */
export function TripBriefScreenMockup() {
  return (
    <PhoneFrame accent={AMBER}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Trip</Eyebrow>
          <h3 className="mt-2 font-serif text-[16px] leading-[1.15]" style={{ color: INK }}>
            Japan
          </h3>
          <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
            2026-10-08 to 2026-10-21
          </p>

          <div className="mt-2.5 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
            {["Currently in Kyoto", "2 things today", "Next: Osaka"].map((line) => (
              <p key={line} className="text-[9px] leading-[1.5]" style={{ color: INK }}>
                {line}
              </p>
            ))}

            <div className="mt-2 border-t pt-2" style={{ borderColor: LINE }}>
              <p className="text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
                Open
              </p>
              <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
                Waiting on the ryokan to confirm late check in
              </p>

              <p className="mt-2 text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
                Bookings
              </p>
              <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
                6 confirmed, 1 awaiting confirmation
              </p>

              <p className="mt-2 text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
                Important
              </p>
              <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
                Minha&rsquo;s passport, photo in Umar&rsquo;s phone
              </p>
            </div>
          </div>

          <p className="mt-2.5 text-[8px] leading-relaxed" style={{ color: FAINT }}>
            Every line here traces to something you recorded. Nothing is invented.
          </p>
        </div>
        <TabBar current="Trip" />
      </div>
    </PhoneFrame>
  );
}
