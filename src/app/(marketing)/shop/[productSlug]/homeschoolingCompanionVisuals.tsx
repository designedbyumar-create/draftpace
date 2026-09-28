/**
 * Bespoke mobile mockups for the Homeschooling Companion's Shop page,
 * following the pattern its siblings established: real recreations of the
 * shipped product UI, not screenshots and not a generic template.
 *
 * Rewritten to match TodayView.tsx's current shape: a per-child header
 * with an initial avatar and a "N of M recorded" count linking to their
 * page, and task rows built around a tap-to-mark circle rather than a
 * Done/Did-not-get-to-it button pair, with an occasional "worth going
 * over again" callout surfaced from what was recorded last time. The
 * bottom bar is still the real one: Today, Kids, Record.
 *
 * Plum (#6a4a72, the real theme.accent) distinguishes it from ink blue,
 * sage, teal and clay. Deliberately not a childish palette: the person
 * buying this is a parent doing serious work, and every competitor in
 * the category signals the opposite with primaries and cartoons.
 *
 * Three things never appear in these drawings, because they never
 * appear in the product: a score, a percentage, and any word about a
 * child being behind or ahead.
 */
import PhoneFrame from "../PhoneFrame";

const INK = "#1a1d24";
const MUTED = "#4a5262";
const FAINT = "#8b93a1";
const PLUM = "#6a4a72";
const PLUM_SOFT = "#f1ebf2";
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

function TabBar({ current }: { current: "Today" | "Kids" | "Record" }) {
  return (
    <div
      className="mt-auto flex items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-[8.5px] font-semibold"
      style={{ borderColor: LINE, color: FAINT }}
    >
      {(["Today", "Kids", "Record"] as const).map((tab) => (
        <span key={tab} style={tab === current ? { color: PLUM } : undefined}>
          {tab}
        </span>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[7.5px] font-bold uppercase tracking-[0.14em]" style={{ color: PLUM }}>
      {children}
    </p>
  );
}

/**
 * Screen 1: Today. Grouped by child, each with its own recorded count and
 * a link to their page, and every row a tap-to-mark circle rather than a
 * button pair. A row that was flagged last time surfaces the reason.
 */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame accent={PLUM}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-4">
          <Eyebrow>Today</Eyebrow>
          <h3 className="mt-1.5 font-serif text-[16px] leading-[1.15]" style={{ color: INK }}>
            What we are doing today.
          </h3>

          <div className="mt-3 flex items-center gap-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold"
              style={{ backgroundColor: PLUM_SOFT, color: PLUM }}
            >
              E
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[12px]" style={{ color: INK }}>
                Emma
              </p>
              <p className="text-[8px]" style={{ color: FAINT }}>
                0 of 4 recorded
              </p>
            </div>
            <span className="text-[8px] font-semibold" style={{ color: PLUM }}>
              Their page ›
            </span>
          </div>

          <div className="mt-1.5 flex flex-col gap-1.5">
            <div className="rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full border" style={{ borderColor: "#c7c2cc" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold" style={{ color: INK }}>
                    Reading
                  </p>
                  <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
                    Chapter 6
                  </p>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-[7px] font-semibold" style={{ color: PLUM }}>
                      Your plan
                    </span>
                    <span className="text-[7.5px] font-semibold" style={{ color: FAINT }}>
                      Did not get to it
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full border" style={{ borderColor: "#c7c2cc" }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold" style={{ color: INK }}>
                    Math
                  </p>
                  <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
                    Fractions, Unit 4
                  </p>
                  <div className="mt-1.5 rounded-md p-1.5" style={{ backgroundColor: PLUM_SOFT }}>
                    <p className="text-[7.5px] leading-relaxed" style={{ color: PLUM }}>
                      Worth going over again. Last time you said this was difficult.
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-[7px] font-semibold" style={{ color: PLUM }}>
                      Your curriculum
                    </span>
                    <span className="text-[7.5px] font-semibold" style={{ color: FAINT }}>
                      Did not get to it
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 font-serif text-[12px]" style={{ color: INK }}>
            Noah
          </p>
          <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
            Nothing scheduled today.
          </p>
        </div>
        <TabBar current="Today" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 2: a check result. The heart of the product's trust claim, so
 * it draws the thing every competitor gets wrong: a topic with too few
 * answers, reported as such rather than guessed at.
 */
export function CheckScreenMockup() {
  return (
    <PhoneFrame accent={PLUM}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>What came back</Eyebrow>
          <h3 className="mt-2 font-serif text-[16px] leading-[1.15]" style={{ color: INK }}>
            One thing here is worth going over again.
          </h3>

          <div className="mt-3.5 flex flex-col gap-2.5">
            {[
              { line: "Multiplication looked solid.", tag: "Looked solid", ev: "5 of 5 answered questions." },
              { line: "Equivalent fractions is worth another look.", tag: "Worth another look", ev: "1 of 4 answered questions." },
              { line: "Not enough here to say anything about long division.", tag: "Not enough to say", ev: "2 answered questions." },
            ].map((row) => (
              <div key={row.tag} className="border-b pb-2.5" style={{ borderColor: LINE }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex-1 text-[9.5px]" style={{ color: INK }}>
                    {row.line}
                  </span>
                  <span className="shrink-0 text-[7px] font-semibold uppercase tracking-[0.08em]" style={{ color: PLUM }}>
                    {row.tag}
                  </span>
                </div>
                <p className="mt-0.5 text-[7.5px]" style={{ color: FAINT }}>
                  {row.ev}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-2.5 text-[8px] leading-relaxed" style={{ color: FAINT }}>
            This is a short check you ran at home, not an assessment. It says what came back from these questions on
            this day, and nothing about Emma.
          </p>
        </div>
        <TabBar current="Kids" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 3: the printed half. Drawn as the book actually sets, because
 * the claim on this listing is that it would be worth buying alone.
 */
export function BookScreenMockup() {
  return (
    <PhoneFrame accent={PLUM}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Included, and yours to keep</Eyebrow>
          <h3 className="mt-2 font-serif text-[16px] leading-[1.15]" style={{ color: INK }}>
            The Homeschool Year
          </h3>

          <div className="mt-3 overflow-hidden rounded-lg border" style={{ borderColor: LINE, backgroundColor: "#f5f1ea" }}>
            <div className="px-3 pb-4 pt-3">
              <p className="text-[6px] font-bold uppercase tracking-[0.2em]" style={{ color: PLUM }}>
                Draftpace
              </p>
              <div className="mt-3 flex flex-wrap" style={{ width: 120 }}>
                {Array.from({ length: 18 }, (_, i) => (
                  <span
                    key={i}
                    className="mb-1 mr-1 inline-block h-[9px] w-[9px] border"
                    style={{
                      borderColor: PLUM,
                      opacity: i === 7 ? 1 : 0.3,
                      backgroundColor: i === 7 ? PLUM : "transparent",
                    }}
                  />
                ))}
              </div>
              <p className="mt-4 font-serif text-[15px] leading-[1.05]" style={{ color: INK }}>
                The
                <br />
                Homeschool
                <br />
                Year
              </p>
              <p className="mt-2 text-[7.5px]" style={{ color: MUTED }}>
                Undated, so it starts whenever you do.
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex flex-col gap-1">
            {["Six chapters of method", "Undated working pages", "Photocopiable check sheets"].map((line) => (
              <p key={line} className="text-[8.5px]" style={{ color: MUTED }}>
                {line}
              </p>
            ))}
          </div>
        </div>
        <TabBar current="Record" />
      </div>
    </PhoneFrame>
  );
}
