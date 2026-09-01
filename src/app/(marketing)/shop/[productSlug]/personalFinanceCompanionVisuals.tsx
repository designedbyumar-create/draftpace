/**
 * Bespoke mobile mockups for Personal Finance Companion's Shop page,
 * following the exact pattern monthlyMoneyResetVisuals.tsx established:
 * real recreations of the actual product UI (the same Available Money hero
 * treatment just shipped in WorkspaceModule.tsx, the same guided Companion
 * question format, the same Attention inbox pattern), not screenshots and
 * not a generic template. Three screens tell PFC's real story in sequence:
 * the picture you land on, the guided way you build it, and the honest
 * gaps it watches for you. Numbers are illustrative but internally
 * consistent, never presented as real account data.
 */

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

/** Same phone chrome as MMR's mockups, on a deeper charcoal backdrop glow
 * (distinct from MMR's warm cream): a paid product's page reads more
 * premium with a darker stage, while the screens themselves stay accurate
 * to the real light-mode product UI. */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 inset-y-8 -z-10 rounded-[3rem] bg-[#0e6e75] opacity-[0.16] blur-3xl"
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

/** Screen 1: the picture you land on. Used in the hero. */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[#f4f2ec] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#6b7570]">Personal Finance Companion</p>

        <div className="mt-3 rounded-2xl bg-[#0e6e75] p-4 text-white">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-70">Available Money</p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.08em] opacity-70">Ready</p>
          </div>
          <p className="mt-2 font-serif text-[30px] font-semibold leading-none">$2,614.01</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-[#e4e0d5] bg-white p-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#8b9089]">Expected Income</p>
            <p className="mt-1 text-[15px] font-semibold text-[#1a2420]">$7,450.00</p>
          </div>
          <div className="rounded-xl border border-[#e4e0d5] bg-white p-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#8b9089]">Upcoming Bills</p>
            <p className="mt-1 text-[15px] font-semibold text-[#1a2420]">$1,585.99</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[#e4e0d5] bg-white p-3.5">
          <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#8b9089]">Needs a look (3)</p>
          <p className="mt-1.5 text-[10px] font-semibold text-[#1a2420]">A bill is missing a due date.</p>
        </div>

        <div className="mt-auto flex items-center justify-between rounded-xl border border-[#e4e0d5] bg-white px-3 py-2.5 text-[8px] font-semibold text-[#8b9089]">
          <span className="text-[#0e6e75]">Today</span>
          <span>Companion</span>
          <span>Attention</span>
          <span>Records</span>
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Screen 2: the guided way you build it, one question at a time. */
export function GuidedCompanionScreenMockup() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[#f4f2ec] px-4 pb-4 pt-9">
        <StatusBar />
        <div className="mt-3 flex gap-1">
          {[true, true, true, true, false, false, false].map((done, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${done ? "bg-[#0e6e75]" : "bg-[#e4e0d5]"}`} />
          ))}
        </div>

        <div className="mt-5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#dce7e6] text-[#0e6e75]">
          <span className="text-[13px]">↻</span>
        </div>
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#0e6e75]">Transactions</p>
        <p className="mt-1 text-[14px] font-semibold leading-snug text-[#1a2420]">
          What actually happened: the basis for spending awareness.
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-[#6b7570]">
          You already have 1 transaction in Draftpace. Would you like to review it or continue?
        </p>

        <div className="mt-4 flex gap-2">
          <div className="flex-1 rounded-lg border border-[#dcd7ca] bg-white py-2.5 text-center text-[10px] font-semibold text-[#1a2420]">
            Review existing
          </div>
          <div className="flex-1 rounded-lg border border-[#dcd7ca] bg-white py-2.5 text-center text-[10px] font-semibold text-[#1a2420]">
            Add another
          </div>
        </div>

        <div className="mt-auto rounded-xl bg-[#0e6e75] py-2.5 text-center text-[11px] font-semibold text-white">
          Looks right, continue
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Screen 3: the honest gaps it watches for you, never a fabricated task. */
export function AttentionScreenMockup() {
  const items: [string, "warning" | "faint"][] = [
    ["Rent is missing a due date.", "warning"],
    ["Checking account balance is 9 days stale.", "faint"],
    ["Visa card has no interest rate set.", "faint"],
  ];
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[#f4f2ec] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#6b7570]">Attention</p>
        <p className="mt-1 text-[14px] font-semibold text-[#1a2420]">Needs a look</p>
        <p className="mt-1 text-[10px] leading-relaxed text-[#6b7570]">
          Only real gaps in your own records. Fix the record and the item clears itself.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {items.map(([text, tone]) => (
            <div key={text} className="flex items-start gap-2 rounded-lg border border-[#e4e0d5] bg-white p-3">
              <span
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ${tone === "warning" ? "bg-[#b8663f]" : "bg-[#c7c2b3]"}`}
                aria-hidden
              />
              <p className="flex-1 text-[10px] leading-relaxed text-[#1a2420]">{text}</p>
              <span className="shrink-0 text-[8px] font-semibold uppercase tracking-wide text-[#8b9089]">Snooze</span>
            </div>
          ))}
        </div>

        <div className="mt-auto rounded-lg bg-[#dce7e6] px-3 py-2.5 text-center text-[9px] font-semibold text-[#0e6e75]">
          Never a fabricated to-do, always a real gap
        </div>
      </div>
    </PhoneFrame>
  );
}
