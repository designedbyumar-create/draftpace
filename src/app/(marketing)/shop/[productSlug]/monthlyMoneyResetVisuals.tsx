import { monthlyMoneyResetThemeVars } from "@/products/monthly-money-reset/theme";

/**
 * Bespoke mobile mockups for Monthly Money Reset's Shop page: a real,
 * hand-built recreation of the actual product UI (same --mmr-* tokens as
 * the live app, same Safe-to-Spend/Quick-add copy and layout), rendered in
 * a phone frame instead of a single reused desktop screenshot. Three
 * distinct screens tell the actual product story in sequence: the overview
 * you land on, the moment you add something, and the breakdown that makes
 * the number trustworthy. Numbers are illustrative but internally
 * consistent (the breakdown actually sums to the headline figure), never
 * presented as real account data. This is marketing art, not the live
 * product surface CLAUDE.md's "no fabricated activity" rule governs.
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

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[280px]" style={LIGHT_VARS as React.CSSProperties}>
      <div className="pointer-events-none absolute inset-x-6 inset-y-8 -z-10 rounded-[3rem] bg-[var(--mmr-forest-900)] opacity-[0.1] blur-2xl" aria-hidden />
      <div
        className="relative overflow-hidden rounded-[2.75rem] border-[6px] border-[#141414] bg-[#141414] shadow-[shadow:var(--shadow-md)]"
        style={{ aspectRatio: "9 / 19.5" }}
      >
        <div className="absolute left-1/2 top-2.5 z-10 h-[16px] w-[84px] -translate-x-1/2 rounded-full bg-[#141414]" aria-hidden />
        <div className="absolute inset-0 overflow-hidden rounded-[2.25rem]">{children}</div>
      </div>
    </div>
  );
}

/** Screen 1: what you land on. Used in the hero. */
export function OverviewScreenMockup() {
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[var(--mmr-ivory)] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mmr-muted)]">Monthly Money Reset</p>

        <div className="mt-3 rounded-2xl bg-[var(--mmr-forest-900)] p-4 text-[var(--mmr-ivory)]">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] opacity-60">Safe to spend now</p>
          <p className="mt-1.5 font-serif text-[30px] font-semibold leading-none">$600.00</p>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
            <span className="text-[9px] uppercase tracking-wide opacity-60">This week, roughly</span>
            <span className="text-[12px] font-semibold">$150.00</span>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--mmr-line)] bg-[var(--mmr-paper)] p-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--mmr-muted)]">Your next move</p>
          <p className="mt-1 text-[11px] font-semibold text-[var(--mmr-ink)]">Complete this week&apos;s check-in</p>
          <p className="mt-0.5 text-[9px] leading-4 text-[var(--mmr-muted)]">Keeps this month&apos;s picture accurate.</p>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="rounded-xl bg-[var(--mmr-forest-900)] py-2.5 text-center text-[11px] font-semibold text-[var(--mmr-ivory)]">
            + Quick add
          </div>
          <p className="text-center text-[9px] font-semibold text-[var(--mmr-muted)]">Do a weekly check-in</p>
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Screen 2: adding something, mid-input. Used beside "How it works". */
export function AddInfoScreenMockup() {
  const types = [
    { label: "Spending", active: true },
    { label: "Income", active: false },
    { label: "Bill", active: false },
    { label: "Savings", active: false },
  ];
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[var(--mmr-paper)] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mmr-clay)]">Quick add</p>
        <p className="mt-1 text-[14px] font-semibold text-[var(--mmr-ink)]">What changed?</p>

        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {types.map((type) => (
            <div
              key={type.label}
              className={`rounded-lg border px-1 py-2 text-center text-[7px] font-semibold leading-tight ${
                type.active
                  ? "border-[var(--mmr-clay)] bg-[var(--mmr-clay-soft)] text-[var(--mmr-clay)]"
                  : "border-[var(--mmr-line)] text-[var(--mmr-muted)]"
              }`}
            >
              {type.label}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--mmr-muted)]">Amount</p>
          <div className="mt-1.5 flex items-center rounded-lg border border-[var(--mmr-line-strong)] bg-[var(--mmr-ivory-2)] px-3 py-2.5 text-[15px] font-semibold text-[var(--mmr-ink)]">
            $42.00
            <span className="ml-0.5 h-3.5 w-[1.5px] animate-pulse bg-[var(--mmr-ink)]" aria-hidden />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--mmr-muted)]">Note (optional)</p>
          <div className="mt-1.5 rounded-lg border border-[var(--mmr-line)] bg-[var(--mmr-ivory-2)] px-3 py-2.5 text-[10px] text-[var(--mmr-ink)]">
            Groceries
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-[var(--mmr-sage-pale)] p-2.5">
          <p className="text-[8px] leading-4 text-[var(--mmr-forest-900)]">
            Safe-to-Spend would change from $600.00 to $558.00.
          </p>
        </div>

        <div className="mt-auto rounded-xl bg-[var(--mmr-forest-900)] py-2.5 text-center text-[11px] font-semibold text-[var(--mmr-ivory)]">
          Save and update my month
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Screen 3: the breakdown behind the number. Used beside "What becomes easier". */
export function BreakdownScreenMockup() {
  const rows: [string, string][] = [
    ["Money available right now", "$1,850.00"],
    ["+ Income received", "$0.00"],
    ["- Bill payments made", "$0.00"],
    ["- Protected bills not yet paid", "$900.00"],
    ["- Reserve still held", "$350.00"],
  ];
  return (
    <PhoneFrame>
      <div className="flex h-full flex-col bg-[var(--mmr-forest-900)] px-4 pb-4 pt-9 text-[var(--mmr-ivory)]">
        <StatusBar tone="dark" />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] opacity-60">Safe to spend now</p>
        <p className="mt-1.5 font-serif text-[32px] font-semibold leading-none">$600.00</p>

        <div className="mt-4 flex flex-col divide-y divide-white/10 border-t border-white/10">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2 text-[9px]">
              <span className="opacity-70">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[8px] leading-relaxed opacity-60">
          Based on what&apos;s actually been added. Expected income doesn&apos;t count until it&apos;s received.
        </p>

        <div className="mt-auto rounded-lg bg-white/5 px-3 py-2.5 text-center text-[9px] font-semibold">
          Never a guess, always a real total
        </div>
      </div>
    </PhoneFrame>
  );
}
