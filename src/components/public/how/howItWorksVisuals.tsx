import { monthlyMoneyResetThemeVars } from "@/products/monthly-money-reset/theme";

/**
 * Six bespoke mini mockups for /how-it-works, one per step of the story
 * HowItWorksFlow tells. Same pattern as the Shop's
 * monthlyMoneyResetVisuals.tsx: a real, hand-built recreation of MMR's
 * actual UI (same --mmr-* tokens, same phone chrome), never a generic UI
 * kit card. Numbers are illustrative but internally consistent, never
 * presented as real account data - marketing art, not the live product
 * surface CLAUDE.md's "no fabricated activity" rule governs.
 */

const LIGHT_VARS = monthlyMoneyResetThemeVars("light");

function StatusBar({ tone = "light" }: { tone?: "light" | "dark" }) {
  const color = tone === "dark" ? "text-[var(--mmr-ivory)]" : "text-[var(--mmr-ink)]";
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

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[260px]" style={LIGHT_VARS as React.CSSProperties}>
      <div
        className="relative overflow-hidden rounded-[2.75rem] border-[6px] border-[#141414] bg-[#141414] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]"
        style={{ aspectRatio: "9 / 19.5" }}
      >
        <div className="absolute left-1/2 top-2.5 z-10 h-[16px] w-[84px] -translate-x-1/2 rounded-full bg-[#141414]" aria-hidden />
        <div className="absolute inset-0 overflow-hidden rounded-[2.25rem]">{children}</div>
      </div>
    </div>
  );
}

/** Step: "own" - you buy it once, it lands in your library. */
export function OwnScreen() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[var(--mmr-ivory)] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mmr-muted)]">Library</p>

        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--mmr-forest-700)] bg-[var(--mmr-sage-pale)] p-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--mmr-forest-900)] text-[13px] font-bold text-[var(--mmr-ivory)]">
            &#10003;
          </span>
          <div>
            <p className="text-[11px] font-semibold text-[var(--mmr-ink)]">Monthly Money Reset</p>
            <p className="text-[9px] text-[var(--mmr-muted)]">Added just now. Yours to keep.</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--mmr-line)] bg-[var(--mmr-paper)] p-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--mmr-muted)]">What that means</p>
          <p className="mt-1 text-[9.5px] leading-relaxed text-[var(--mmr-ink)]">
            No subscription to babysit. It does not expire if you step away.
          </p>
        </div>

        <div className="mt-auto rounded-xl bg-[var(--mmr-forest-900)] py-2.5 text-center text-[11px] font-semibold text-[var(--mmr-ivory)]">
          Open Monthly Money Reset
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Step: "setup" - a few questions that change what happens. */
export function SetupScreen() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[var(--mmr-paper)] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mmr-clay)]">Setup, step 2 of 4</p>
        <p className="mt-1 text-[13px] font-semibold text-[var(--mmr-ink)]">What is your income this month?</p>

        <div className="mt-3 flex items-center rounded-lg border border-[var(--mmr-line-strong)] bg-[var(--mmr-ivory-2)] px-3 py-2.5 text-[14px] font-semibold text-[var(--mmr-ink)]">
          $3,200.00
          <span className="ml-0.5 h-3.5 w-[1.5px] animate-pulse bg-[var(--mmr-ink)]" aria-hidden />
        </div>

        <div className="mt-3 rounded-lg bg-[var(--mmr-sage-pale)] p-2.5">
          <p className="text-[8px] leading-4 text-[var(--mmr-forest-900)]">Rough is fine. You can adjust this any time.</p>
        </div>

        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {[true, true, false, false].map((done, i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-full ${done ? "bg-[var(--mmr-forest-900)]" : "bg-[var(--mmr-line)]"}`}
            />
          ))}
        </div>

        <div className="mt-auto rounded-xl bg-[var(--mmr-forest-900)] py-2.5 text-center text-[11px] font-semibold text-[var(--mmr-ivory)]">
          Continue
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Step: "save" - nothing to remember to save, works everywhere. */
export function SaveScreen() {
  const devices = ["Phone", "Laptop", "Tablet"];
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[var(--mmr-ivory)] px-4 pb-4 pt-9">
        <StatusBar />
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--mmr-sage-pale)] px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--mmr-success)]" aria-hidden />
          <p className="text-[9.5px] font-semibold text-[var(--mmr-forest-900)]">Saved to your account just now</p>
        </div>

        <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mmr-muted)]">Everywhere you are</p>
        <div className="mt-2 flex flex-col gap-1.5">
          {devices.map((device) => (
            <div
              key={device}
              className="flex items-center justify-between rounded-lg border border-[var(--mmr-line)] bg-[var(--mmr-paper)] px-3 py-2.5"
            >
              <span className="text-[10.5px] font-medium text-[var(--mmr-ink)]">{device}</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--mmr-muted)]">Up to date</span>
            </div>
          ))}
        </div>

        <p className="mt-auto text-[9px] leading-relaxed text-[var(--mmr-muted)]">
          Lose connection and it keeps going, then syncs when you are back.
        </p>
      </div>
    </PhoneFrame>
  );
}

/** Step: "return" - opens exactly where you left off. */
export function ReturnScreen() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[var(--mmr-ivory)] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[13px] font-semibold text-[var(--mmr-ink)]">Welcome back.</p>
        <p className="text-[9.5px] text-[var(--mmr-muted)]">Week 3 of 4. Nothing to set up again.</p>

        <div className="mt-3 rounded-2xl bg-[var(--mmr-forest-900)] p-4 text-[var(--mmr-ivory)]">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-60">Safe to spend now</p>
          <p className="mt-1.5 font-serif text-[28px] font-semibold leading-none">$421.00</p>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--mmr-clay)] bg-[var(--mmr-clay-soft)] p-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--mmr-clay)]">Your next move</p>
          <p className="mt-1 text-[10.5px] font-semibold text-[var(--mmr-ink)]">Log this week&apos;s spending, then you are set.</p>
        </div>

        <div className="mt-auto rounded-xl bg-[var(--mmr-forest-900)] py-2.5 text-center text-[11px] font-semibold text-[var(--mmr-ivory)]">
          Take care of this
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Step: "adapt" - change one thing, the rest reworks around it. */
export function AdaptScreen() {
  const rows: [string, string][] = [
    ["Safe to spend, before", "$600.00"],
    ["Income dropped by", "$180.00"],
    ["Protected bills, unchanged", "$900.00"],
  ];
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[var(--mmr-forest-900)] px-4 pb-4 pt-9 text-[var(--mmr-ivory)]">
        <StatusBar tone="dark" />
        <div className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--mmr-clay)]" aria-hidden />
          <p className="text-[8px] font-semibold">Your income dropped this month</p>
        </div>

        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] opacity-60">Recalculated</p>
        <p className="mt-1.5 font-serif text-[30px] font-semibold leading-none">$420.00</p>

        <div className="mt-4 flex flex-col divide-y divide-white/10 border-t border-white/10">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2 text-[9px]">
              <span className="opacity-70">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>

        <p className="mt-auto text-[9px] leading-relaxed opacity-60">You changed one number. It reworked the rest.</p>
      </div>
    </PhoneFrame>
  );
}

/** Step: "rest" - coming back after a long gap is welcoming, not a wall of overdue. */
export function RestScreen() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[var(--mmr-ivory)] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[13px] font-semibold text-[var(--mmr-ink)]">It has been 3 weeks.</p>
        <p className="mt-1 text-[9.5px] leading-relaxed text-[var(--mmr-muted)]">
          A few things may have changed. Update what is different, or pick up right where you left off.
        </p>

        <div className="mt-4 flex flex-col gap-1.5">
          <div className="rounded-xl border border-[var(--mmr-forest-700)] bg-[var(--mmr-sage-pale)] p-3">
            <p className="text-[10px] font-semibold text-[var(--mmr-ink)]">Update what changed</p>
          </div>
          <div className="rounded-xl border border-[var(--mmr-line)] bg-[var(--mmr-paper)] p-3">
            <p className="text-[10px] font-semibold text-[var(--mmr-ink)]">Just pick up from here</p>
          </div>
        </div>

        <p className="mt-auto flex items-center gap-1.5 text-[9px] text-[var(--mmr-muted)]">
          <span className="text-[var(--mmr-success)]">&#10003;</span>
          No broken streak. Nothing marked overdue.
        </p>
      </div>
    </PhoneFrame>
  );
}
