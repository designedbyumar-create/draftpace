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
import { Check } from "@/design-system/Icon";

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

/** One task row from Today, the same markup the full screen uses, as its own floating piece. */
function TaskRow({
  subject,
  detail,
  source,
  status,
  flag,
}: {
  subject: string;
  detail: string;
  source: string;
  status: string;
  flag?: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-2.5" style={{ borderColor: LINE }}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full border" style={{ borderColor: "#c7c2cc" }} />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold" style={{ color: INK }}>
            {subject}
          </p>
          <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
            {detail}
          </p>
          {flag && (
            <div className="mt-1.5 rounded-md p-1.5" style={{ backgroundColor: PLUM_SOFT }}>
              <p className="text-[7.5px] leading-relaxed" style={{ color: PLUM }}>
                {flag}
              </p>
            </div>
          )}
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-[7px] font-semibold" style={{ color: PLUM }}>
              {source}
            </span>
            <span className="text-[7.5px] font-semibold" style={{ color: FAINT }}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The whole Today screen's content, shared by the full phone mockup below and anything that wants just the two task rows as floating pieces. */
function TodayContent() {
  return (
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
        <TaskRow subject="Reading" detail="Chapter 6" source="Your plan" status="Did not get to it" />
        <TaskRow
          subject="Math"
          detail="Fractions, Unit 4"
          source="Your curriculum"
          status="Did not get to it"
          flag="Worth going over again. Last time you said this was difficult."
        />
      </div>

      <p className="mt-3 font-serif text-[12px]" style={{ color: INK }}>
        Noah
      </p>
      <p className="mt-0.5 text-[8.5px]" style={{ color: MUTED }}>
        Nothing scheduled today.
      </p>
    </div>
  );
}

/** Just the Math task row, Today's own "worth going over again" callout, as a standalone floating card: no phone chrome, for a section that wants the interface without another whole bezel on the page. */
export function TaskRowCard() {
  return (
    <div className="w-full max-w-[280px] rounded-xl border bg-white p-3 shadow-[0_18px_32px_-16px_rgba(26,29,36,0.35)]" style={{ borderColor: LINE }}>
      <TaskRow
        subject="Math"
        detail="Fractions, Unit 4"
        source="Your curriculum"
        status="Did not get to it"
        flag="Worth going over again. Last time you said this was difficult."
      />
    </div>
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
        <TodayContent />
        <TabBar current="Today" />
      </div>
    </PhoneFrame>
  );
}

const CHECK_ROWS = [
  { line: "Multiplication looked solid.", tag: "Looked solid", ev: "5 of 5 answered questions." },
  { line: "Equivalent fractions is worth another look.", tag: "Worth another look", ev: "1 of 4 answered questions." },
  { line: "Not enough here to say anything about long division.", tag: "Not enough to say", ev: "2 answered questions." },
];

/**
 * The check result, as its own floating card: no phone chrome, no tab
 * bar, so a section that wants the interface without stacking another
 * whole phone bezel on the page can show just the result list.
 */
export function CheckResultCard() {
  return (
    <div className="w-full max-w-[300px] rounded-xl border bg-white p-4 shadow-[0_18px_32px_-16px_rgba(26,29,36,0.35)]" style={{ borderColor: LINE }}>
      <Eyebrow>What came back</Eyebrow>
      <h3 className="mt-2 font-serif text-[15px] leading-[1.2]" style={{ color: INK }}>
        One thing here is worth going over again.
      </h3>
      <div className="mt-3 flex flex-col gap-2.5">
        {CHECK_ROWS.map((row) => (
          <div key={row.tag} className="border-b pb-2.5 last:border-0 last:pb-0" style={{ borderColor: LINE }}>
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
    </div>
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
            {CHECK_ROWS.map((row) => (
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

const SCHOOLING_OPTIONS = ["Homeschool", "A mix of home and school", "Private school", "Public school"] as const;

function AddChildContent() {
  return (
    <>
      <Eyebrow>Adding Maya · Question 2 of 3</Eyebrow>
      <div className="mt-2 flex items-center gap-1.5 text-[8px]" style={{ color: FAINT }}>
        <Check size={10} style={{ color: PLUM }} aria-hidden />
        <span>Name: Maya</span>
      </div>
      <h3 className="mt-3 font-serif text-[16px] leading-[1.15]" style={{ color: INK }}>
        How is Maya schooled?
      </h3>
      <div className="mt-3.5 flex flex-col gap-1.5">
        {SCHOOLING_OPTIONS.map((label, i) => (
          <div
            key={label}
            className="rounded-lg border px-3 py-2.5 text-[10px] font-semibold"
            style={i === 0 ? { borderColor: PLUM, backgroundColor: PLUM_SOFT, color: PLUM } : { borderColor: LINE, color: INK }}
          >
            {label}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[7.5px] leading-relaxed" style={{ color: FAINT }}>
        Only ever an age is stored, never a birth date.
      </p>
    </>
  );
}

/** The add-a-child question, as its own floating card: no phone chrome, for a section that wants the interface without another whole bezel on the page. */
export function AddChildCard() {
  return (
    <div className="w-full max-w-[300px] rounded-xl border bg-white p-4 shadow-[0_18px_32px_-16px_rgba(26,29,36,0.35)]" style={{ borderColor: LINE }}>
      <AddChildContent />
    </div>
  );
}

/**
 * Screen 3: adding a child, drawn from AddChildFlow.tsx's real shape:
 * one question live at a time, what's answered standing above it, and
 * the real schooling-type options from learning.ts's SCHOOLING_LABEL.
 * Added for the bespoke /homeschooling-companion landing page, which
 * needed a fourth real screen to cover onboarding specifically; kept
 * here rather than one-off in that page so the Shop page and manual can
 * draw it too without a second drawing of the same screen existing.
 */
export function AddChildScreenMockup() {
  return (
    <PhoneFrame accent={PLUM}>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />
        <div className="mt-5">
          <AddChildContent />
        </div>
        <TabBar current="Kids" />
      </div>
    </PhoneFrame>
  );
}

/**
 * The book's own cover, drawn as the book actually sets it, presented as
 * a physical page rather than inside a phone: it is literally a printed
 * object, not a screen, and showing it in a phone bezel was the one
 * mockup on the landing page pretending the product is something it
 * isn't. A second, fainter sheet behind suggests the rest of the 30
 * pages without drawing them.
 */
export function BookCover() {
  return (
    <div className="relative w-full max-w-[260px]">
      <div
        className="absolute inset-0 translate-x-2 translate-y-2 rounded-lg border opacity-60"
        style={{ borderColor: LINE, backgroundColor: "#f5f1ea" }}
        aria-hidden
      />
      <div
        className="relative overflow-hidden rounded-lg border shadow-[0_26px_44px_-20px_rgba(26,29,36,0.4)]"
        style={{ borderColor: LINE, backgroundColor: "#f5f1ea" }}
      >
        <div className="px-5 pb-7 pt-5">
          <p className="text-[7px] font-bold uppercase tracking-[0.2em]" style={{ color: PLUM }}>
            Draftpace
          </p>
          <div className="mt-4 flex flex-wrap" style={{ width: 150 }}>
            {Array.from({ length: 18 }, (_, i) => (
              <span
                key={i}
                className="mb-1 mr-1 inline-block h-[11px] w-[11px] border"
                style={{
                  borderColor: PLUM,
                  opacity: i === 7 ? 1 : 0.3,
                  backgroundColor: i === 7 ? PLUM : "transparent",
                }}
              />
            ))}
          </div>
          <p className="mt-5 font-serif text-[19px] leading-[1.05]" style={{ color: INK }}>
            The
            <br />
            Homeschool
            <br />
            Year
          </p>
          <p className="mt-3 text-[9px]" style={{ color: MUTED }}>
            Undated, so it starts whenever you do.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Screen 4: the printed half. Drawn as the book actually sets, because
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
