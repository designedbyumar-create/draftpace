/**
 * Bespoke mobile mockups for ADHD Life Companion's Shop page, following
 * the pattern its four siblings established: real recreations of the
 * shipped product UI, not screenshots and not a generic template.
 *
 * What is drawn maps to what ships: NowModule's derived attention
 * signals with their real reasons, CompanionRun's prepare step for the
 * phone call playbook, and LifeModule's shape grouping with its real
 * footnote line. The bottom bar is the real one: Now, Life, Help.
 *
 * Mulberry (#8d4a5c, the real theme.accent) distinguishes it from ink
 * blue, sage, teal, clay and plum. Warm rather than cool on purpose,
 * same reasoning as the product itself: this is opened when something
 * has been sitting undone for three weeks, and a cold palette on that
 * screen reads as clinical.
 *
 * Three things never appear in these drawings, because they never
 * appear in the product: a streak, a completion percentage, and any
 * word implying somebody failed at something.
 */
import PhoneFrame from "../PhoneFrame";

const INK = "#1a1d24";
const MUTED = "#4a5262";
const FAINT = "#8b93a1";
const MULBERRY = "#8d4a5c";
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

function TabBar({ current }: { current: "Now" | "Life" | "Help" }) {
  return (
    <div
      className="mt-auto flex items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-[8.5px] font-semibold"
      style={{ borderColor: LINE, color: FAINT }}
    >
      {(["Now", "Life", "Help"] as const).map((tab) => (
        <span key={tab} style={tab === current ? { color: MULBERRY } : undefined}>
          {tab}
        </span>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[7.5px] font-bold uppercase tracking-[0.14em]" style={{ color: MULBERRY }}>
      {children}
    </p>
  );
}

/**
 * Screen 1: Now. Two real attention reasons side by side, coming-up
 * (a date the person chose themselves) and left-off (a thread gone
 * quiet), so the drawing shows the derivation rather than a generic
 * task list. Neither card carries a due-date red flag: nothing in this
 * product uses red as a status colour.
 */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame accent={MULBERRY}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Now</Eyebrow>
          <h3 className="mt-2 font-serif text-[17px] leading-[1.15]" style={{ color: INK }}>
            Worth a look
          </h3>

          {[
            { tag: "You said you would come back to this", title: "Book the dentist" },
            { tag: "You left off here 20 days ago", title: "Sort the spare room", note: "Two of the four boxes are done" },
          ].map((row) => (
            <div key={row.title} className="mt-2.5 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
              <p className="text-[7px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
                {row.tag}
              </p>
              <p className="mt-1 text-[10px] font-semibold" style={{ color: INK }}>
                {row.title}
              </p>
              {row.note && (
                <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
                  {row.note}
                </p>
              )}
              <span
                className="mt-2 inline-block rounded-md border px-2.5 py-1 text-[8px] font-semibold"
                style={{ borderColor: MULBERRY, color: MULBERRY }}
              >
                Do this with me
              </span>
            </div>
          ))}

          <p className="mt-3 text-[8px] leading-relaxed" style={{ color: FAINT }}>
            Nothing else needs you right now.
          </p>
        </div>
        <TabBar current="Now" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 2: the Companion, mid phone call playbook, on the prepare
 * step. The heart of the product's trust claim, so it draws the thing
 * every to-do app skips: what to have in front of you before you dial,
 * not just a reminder that the call exists.
 */
export function CompanionScreenMockup() {
  return (
    <PhoneFrame accent={MULBERRY}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Make a phone call</Eyebrow>
          <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
            Sort out the mistake on the electricity bill
          </p>

          <div className="mt-3 flex items-center gap-1" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={i}
                className="h-[3px] flex-1 rounded-full"
                style={{ backgroundColor: i < 3 ? MULBERRY : LINE }}
              />
            ))}
          </div>

          <h3 className="mt-3.5 font-serif text-[15px] leading-[1.15]" style={{ color: INK }}>
            Worth having in front of you
          </h3>
          <p className="mt-1.5 text-[7.5px] leading-relaxed" style={{ color: FAINT }}>
            Not a list to memorise. Put these where you can see them while you talk.
          </p>

          <div className="mt-2.5 flex flex-col gap-1.5">
            {["Your account or reference number", "A pen and something to write on", "The dates involved"].map(
              (line) => (
                <div key={line} className="flex items-start gap-1.5 rounded-lg border bg-white px-2.5 py-2" style={{ borderColor: LINE }}>
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: MULBERRY }} />
                  <span className="text-[8.5px]" style={{ color: INK }}>
                    {line}
                  </span>
                </div>
              )
            )}
          </div>

          <span
            className="mt-3 inline-block rounded-md px-3 py-1.5 text-[8.5px] font-semibold text-white"
            style={{ backgroundColor: MULBERRY }}
          >
            I have these
          </span>
        </div>
        <TabBar current="Help" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 3: Life. Two shapes, never mixed: something to do and
 * something waiting on somebody else, with the waiting card carrying no
 * action button at all, drawn deliberately, because a waiting item
 * never gets one until its own check date arrives.
 */
export function LifeScreenMockup() {
  return (
    <PhoneFrame accent={MULBERRY}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <Eyebrow>Life</Eyebrow>
          <h3 className="mt-2 font-serif text-[16px] leading-[1.15]" style={{ color: INK }}>
            Everything you are holding
          </h3>

          <p className="mt-3 text-[7.5px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
            Something to do
          </p>
          <div className="mt-1.5 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
            <p className="text-[9.5px]" style={{ color: INK }}>
              Book the dentist
            </p>
            <span
              className="mt-2 inline-block rounded-md border px-2 py-1 text-[7.5px] font-semibold"
              style={{ borderColor: MULBERRY, color: MULBERRY }}
            >
              Do this with me
            </span>
          </div>

          <p className="mt-2.5 text-[7.5px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
            Waiting on someone
          </p>
          <div className="mt-1.5 rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
            <p className="text-[9.5px]" style={{ color: INK }}>
              Sort out the mistake on the electricity bill
            </p>
            <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
              Waiting on Octopus, they said 5 working days
            </p>
          </div>

          <p className="mt-2.5 text-[8px] leading-relaxed" style={{ color: FAINT }}>
            Somebody else has this one. Nothing here asks you to act on it before its own check date.
          </p>
        </div>
        <TabBar current="Life" />
      </div>
    </PhoneFrame>
  );
}
