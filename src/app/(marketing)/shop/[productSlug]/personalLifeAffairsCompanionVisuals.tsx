/**
 * Bespoke mobile mockups for the Personal Life Affairs Companion's Shop
 * page, following the pattern personalFinanceCompanionVisuals.tsx
 * established and homeManagementCompanionVisuals.tsx repeated: real
 * recreations of the shipped product UI, not screenshots and not a
 * generic template.
 *
 * What is drawn here maps to what ships. WorkspaceModule.tsx's single
 * next step with its Start pair; CompanionCapture.tsx asking one
 * question with the earlier answers standing above it; and the My
 * Affairs book as PrintablesModule.tsx previews it. The bottom bar is
 * the real one: Next, Affairs, Book, History.
 *
 * Ink blue (#26374f, the real theme.accent from definition.ts) and brass
 * distinguish it from Home Base's sage and PFC's teal, so the three paid
 * Companions read as distinct products at a glance while staying
 * visually consistent as a family. Brass is spent only on what is
 * settled, the same rule the printed book follows.
 *
 * Two words never appear in these drawings, the same two the product
 * itself refuses: "estate" and "assets". Nor does any count, percentage
 * or progress bar, because the product does not have one and a sales
 * page that invents one is selling something else.
 *
 * Names below are illustrative but internally consistent, and never
 * presented as real account data.
 */

const INK = "#1a1d24";
const MUTED = "#4a5262";
const FAINT = "#8b93a1";
const DEEP = "#26374f";
const BRASS = "#9a7b3f";
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

/** Same phone chrome as its siblings, glow tinted ink instead of sage or teal. */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 inset-y-8 -z-10 rounded-[3rem] bg-[#26374f] opacity-[0.16] blur-3xl"
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

/**
 * The four destinations the product actually has, labelled. Never icons
 * alone: this is used twice a year by people who will not have memorised
 * them, which is exactly why the shipped bar keeps its labels too.
 */
function TabBar({ current }: { current: "Next" | "Affairs" | "Book" | "History" }) {
  return (
    <div
      className="mt-auto flex items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-[8.5px] font-semibold"
      style={{ borderColor: LINE, color: FAINT }}
    >
      {(["Next", "Affairs", "Book", "History"] as const).map((tab) => (
        <span key={tab} style={tab === current ? { color: DEEP } : undefined}>
          {tab}
        </span>
      ))}
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[7.5px] font-bold uppercase tracking-[0.14em]" style={{ color: DEEP }}>
      {children}
    </p>
  );
}

/**
 * Screen 1: Next. One thing on screen, which is the product's first
 * design law and the whole pitch. Mirrors WorkspaceModule.tsx: the
 * eyebrow, the state line, the instruction in the narrative serif, why
 * it matters, an honest estimate, then Start.
 *
 * Deliberately no count beside the estimate. The shipped screen dropped
 * it for the same reason: a number next to the one thing you should do
 * is a scoreboard however quietly it is set.
 */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />

        <div className="mt-5">
          <Eyebrow>Next</Eyebrow>
          <p className="mt-1.5 text-[8.5px]" style={{ color: MUTED }}>
            One thing worth taking care of.
          </p>
          <h3 className="mt-2.5 font-serif text-[17px] leading-[1.15]" style={{ color: INK }}>
            Write down who should be called first.
          </h3>
          <p className="mt-2 text-[8.5px] leading-relaxed" style={{ color: MUTED }}>
            Everything else assumes somebody knows to look. If nobody knows to call, nothing else on this list is ever
            found.
          </p>
          <p className="mt-3 text-[8px]" style={{ color: FAINT }}>
            About 2 minutes
          </p>

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            <span className="rounded-md px-3 py-1 text-[8px] font-semibold text-white" style={{ backgroundColor: DEEP }}>
              Start
            </span>
            <span className="rounded-md border px-2.5 py-1 text-[8px] font-semibold" style={{ borderColor: LINE, color: INK }}>
              Not relevant to me
            </span>
            <span className="rounded-md px-2 py-1 text-[8px] font-semibold" style={{ color: FAINT }}>
              Later
            </span>
          </div>
        </div>

        <TabBar current="Next" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 2: Companion Mode. The thing that makes it a companion rather
 * than a form. Mirrors CompanionCapture.tsx: what has been said stands
 * above with a way back to it, and exactly one question is live.
 *
 * The counter says "for this one thing" on purpose. It is scoped to a
 * single capture and never to the product, which is the difference
 * between orienting somebody and scoring them.
 */
export function CompanionScreenMockup() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />

        <div className="mt-5">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.14em]" style={{ color: DEEP }}>
            Write down who should be called first
          </p>
          <p className="mt-1 text-[8px]" style={{ color: FAINT }}>
            Question 3 of 4 for this one thing.
          </p>

          <div className="mt-3 flex flex-col gap-1.5">
            {["Sara Malik", "Wife"].map((answer) => (
              <div key={answer} className="flex items-start gap-1.5">
                <span className="mt-[3px] text-[8px]" style={{ color: DEEP }}>
                  &#10003;
                </span>
                <span className="flex-1 text-[9px]" style={{ color: MUTED }}>
                  {answer}
                </span>
                <span className="text-[7.5px] underline" style={{ color: FAINT }}>
                  Change
                </span>
              </div>
            ))}
          </div>

          <h3 className="mt-4 font-serif text-[15px] leading-[1.15]" style={{ color: INK }}>
            How would someone reach them?
          </h3>
          <p className="mt-1.5 text-[8px] leading-relaxed" style={{ color: MUTED }}>
            A phone number or an email. Nothing else is needed.
          </p>

          <div className="mt-2.5 rounded-lg border bg-white px-2.5 py-2" style={{ borderColor: DEEP }}>
            <span className="text-[9px]" style={{ color: INK }}>
              07700 900412
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-md px-3 py-1 text-[8px] font-semibold text-white" style={{ backgroundColor: DEEP }}>
              Continue
            </span>
            <span className="rounded-md px-2 py-1 text-[8px] font-semibold" style={{ color: FAINT }}>
              Skip this
            </span>
          </div>
        </div>

        <TabBar current="Next" />
      </div>
    </PhoneFrame>
  );
}

/**
 * Screen 3: the Book. The artifact the whole product is aimed at, drawn
 * the way PrintablesModule.tsx previews it and the way the printed page
 * actually sets: the attribution small above, My Affairs carrying the
 * size, and entries labelled as facts rather than as instructions.
 *
 * No count on the cover, matching the printed book, which says what the
 * copy is rather than how complete it is.
 */
export function BookScreenMockup() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col px-4 pb-4 pt-9" style={{ backgroundColor: PAPER }}>
        <StatusBar />

        <div className="mt-5">
          <Eyebrow>My affairs book</Eyebrow>
          <h3 className="mt-2 font-serif text-[15px] leading-[1.15]" style={{ color: INK }}>
            What somebody would receive.
          </h3>

          <div className="mt-3 overflow-hidden rounded-lg border bg-white" style={{ borderColor: LINE }}>
            <div className="border-b px-3 py-2.5" style={{ borderColor: LINE }}>
              <p className="text-[6.5px] font-bold uppercase tracking-[0.14em]" style={{ color: DEEP }}>
                Personal Life Affairs Companion
              </p>
              <p className="mt-1 font-serif text-[13px]" style={{ color: INK }}>
                My Affairs
              </p>
            </div>

            <div className="flex flex-col gap-2.5 px-3 py-2.5">
              <div>
                <p className="text-[6.5px] font-bold uppercase tracking-[0.14em]" style={{ color: FAINT }}>
                  Who decides, and who to call
                </p>
                <div className="mt-1.5 border-l-2 pl-2" style={{ borderColor: "#e6eaf0" }}>
                  <p className="text-[9px]" style={{ color: INK }}>
                    Who to contact first
                  </p>
                  <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
                    Sara Malik, wife
                  </p>
                  <p className="mt-0.5 text-[7.5px]" style={{ color: FAINT }}>
                    Last confirmed 22 August 2026
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[6.5px] font-bold uppercase tracking-[0.14em]" style={{ color: FAINT }}>
                  Where the paperwork is
                </p>
                <div className="mt-1.5 border-l-2 pl-2" style={{ borderColor: "#e6eaf0" }}>
                  <p className="text-[9px]" style={{ color: INK }}>
                    The will, and where it is
                  </p>
                  <p className="mt-0.5 text-[8px]" style={{ color: MUTED }}>
                    Study, grey filing cabinet
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md px-3 py-1 text-[8px] font-semibold text-white" style={{ backgroundColor: BRASS }}>
              Save as PDF
            </span>
            <span className="rounded-md border px-2.5 py-1 text-[8px] font-semibold" style={{ borderColor: LINE, color: INK }}>
              Blank copy
            </span>
          </div>
        </div>

        <TabBar current="Book" />
      </div>
    </PhoneFrame>
  );
}
