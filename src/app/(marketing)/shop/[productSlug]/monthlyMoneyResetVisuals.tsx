import { monthlyMoneyResetThemeVars } from "@/products/monthly-money-reset/theme";
import PhoneFrame from "../PhoneFrame";

/**
 * Bespoke mobile mockups for Monthly Money Reset's Shop page: a real,
 * hand-built recreation of the actual product UI (same --mmr-* tokens as
 * the live app), rendered in a phone frame instead of a single reused
 * desktop screenshot.
 *
 * Rewritten to match "The Number": SafeToSpendCard.tsx's redesign, where
 * the figure sits on a dark forest panel and a torn-paper receipt hangs
 * from a slot beneath it with the seven-term working always in view. The
 * previous set drew the pre-redesign rounded card with a plain "Quick add"
 * button and no receipt, which stopped matching the shipped product.
 *
 * Numbers are illustrative but internally consistent (the receipt actually
 * sums to the headline figure), never presented as real account data. This
 * is marketing art, not the live product surface CLAUDE.md's "no
 * fabricated activity" rule governs.
 */

const LIGHT_VARS = monthlyMoneyResetThemeVars("light");

const TEAR_MASK =
  "linear-gradient(#000 0 0) top / 100% calc(100% - 6px) no-repeat, conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) bottom / 12px 6px repeat-x";

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

/** Screen 1: The Number. The hero panel and its receipt, exactly as SafeToSpendCard.tsx draws them. Used in the hero. */
export function OverviewScreenMockup() {
  const rows: [string, "+" | "-" | "=", string][] = [
    ["Money available right now", "=", "$1,850.00"],
    ["Income received", "+", "$0.00"],
    ["Bill payments made", "-", "$0.00"],
    ["Protected bills not yet paid", "-", "$900.00"],
    ["Reserve still held", "-", "$350.00"],
  ];
  return (
    <PhoneFrame accent="var(--mmr-forest-900)" bezelColor="#141414" style={LIGHT_VARS as React.CSSProperties}>
      <div className="flex h-full flex-col bg-[var(--mmr-paper)]">
        <div className="rounded-b-[10px] bg-[var(--mmr-hero)] px-4 pb-6 pt-9 text-[var(--mmr-hero-ink)]">
          <StatusBar tone="dark" />
          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.16em] opacity-60">Safe to spend now</p>
          <p className="mt-2 font-sans text-[38px] font-semibold leading-[0.95] tracking-[-0.04em] [font-feature-settings:'tnum'_1]">
            $600<span className="text-[0.5em] tracking-[-0.02em] opacity-55">.00</span>
          </p>
          <p className="mt-2 max-w-[26ch] text-[9.5px] leading-[1.5] opacity-70">
            Not your bank&apos;s balance. This already holds back what you&apos;ve told it about.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[9px] font-semibold ring-1 ring-inset ring-white/15">
              About $150.00 a week
            </span>
          </div>
        </div>

        {/* The receipt, hung from a slot cut in the panel above. */}
        <div className="relative px-2.5 [filter:drop-shadow(0_8px_8px_rgba(16,42,36,0.18))]">
          <div
            aria-hidden
            className="absolute inset-x-1 top-0 z-10 h-[8px] -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--mmr-hero)_45%,#000)]"
          />
          <div
            className="bg-[var(--mmr-paper)] px-3.5 pb-4 pt-5 text-[var(--mmr-ink)]"
            style={{ WebkitMask: TEAR_MASK, mask: TEAR_MASK }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--mmr-muted)]">The working</p>
              <p className="text-[8.5px] font-semibold text-[var(--mmr-forest-800)]">Hide</p>
            </div>
            <dl className="mt-1.5 font-mono text-[8.5px] tabular-nums">
              {rows.map(([label, sign, value]) => (
                <div key={label} className="flex items-baseline gap-1.5 py-[3px]">
                  <dt className="flex min-w-0 items-baseline gap-1.5 font-sans text-[8.5px] text-[color-mix(in_srgb,var(--mmr-ink)_82%,transparent)]">
                    <span className={`w-2.5 shrink-0 text-center ${sign === "+" ? "text-[var(--mmr-success)]" : "text-[var(--mmr-muted-2)]"}`}>
                      {sign === "=" ? "" : sign}
                    </span>
                    {label}
                  </dt>
                  <span className="mb-[2px] min-w-2 flex-1 self-end border-b border-dotted border-[color-mix(in_srgb,var(--mmr-muted-2)_70%,transparent)]" />
                  <dd className="shrink-0 text-[var(--mmr-ink)]">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-1.5 flex items-baseline justify-between gap-2 border-t-[2px] border-double border-[var(--mmr-ink)] pt-1.5">
              <p className="text-[9.5px] font-semibold text-[var(--mmr-ink)]">Safe to spend</p>
              <p className="font-mono text-[10.5px] font-bold tabular-nums text-[var(--mmr-ink)]">$600.00</p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 px-4 pb-4">
          <div className="rounded-xl bg-[var(--mmr-forest-900)] py-2.5 text-center text-[11px] font-semibold text-[var(--mmr-ivory)]">
            + Quick add
          </div>
          <p className="text-center text-[9px] font-semibold text-[var(--mmr-muted)]">Do a weekly check-in</p>
        </div>
      </div>
    </PhoneFrame>
  );
}

/** Screen 2: adding something, mid-input. Mirrors QuickAddModal.tsx's five real entry types. Used beside "How it works". */
export function AddInfoScreenMockup() {
  const types = [
    { label: "Spending", active: true },
    { label: "Income received", active: false },
    { label: "Bill paid", active: false },
    { label: "Savings set aside", active: false },
    { label: "Correction", active: false },
  ];
  return (
    <PhoneFrame accent="var(--mmr-forest-900)" bezelColor="#141414" style={LIGHT_VARS as React.CSSProperties}>
      <div className="flex h-full flex-col bg-[var(--mmr-paper)] px-4 pb-4 pt-9">
        <StatusBar />
        <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--mmr-clay)]">Quick add</p>
        <p className="mt-1 text-[14px] font-semibold text-[var(--mmr-ink)]">What changed?</p>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {types.map((type) => (
            <div
              key={type.label}
              className={`rounded-lg border px-1 py-2 text-center text-[6.5px] font-semibold leading-tight ${
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

/** Screen 3: the receipt on its own, expanded, so the working is legible at marketing size. Used beside "What becomes easier". */
export function BreakdownScreenMockup() {
  const rows: [string, "+" | "-" | "=", string][] = [
    ["Money available right now", "=", "$1,850.00"],
    ["+ Income received", "+", "$0.00"],
    ["- Bill payments made", "-", "$0.00"],
    ["- Protected bills not yet paid", "-", "$900.00"],
    ["- Reserve still held", "-", "$350.00"],
  ];
  return (
    <PhoneFrame accent="var(--mmr-forest-900)" bezelColor="#141414" style={LIGHT_VARS as React.CSSProperties}>
      <div className="relative flex h-full flex-col bg-[var(--mmr-hero)] px-4 pb-4 pt-9 text-[var(--mmr-hero-ink)] [filter:drop-shadow(0_0_0_transparent)]">
        <StatusBar tone="dark" />
        <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.16em] opacity-60">The working, in full</p>
        <p className="mt-2 font-sans text-[26px] font-semibold leading-[0.95] tracking-[-0.03em]">$600.00</p>

        <div
          className="mt-4 flex-1 rounded-t-[14px] bg-[var(--mmr-paper)] px-3.5 pb-4 pt-4 text-[var(--mmr-ink)]"
          style={{ WebkitMask: TEAR_MASK, mask: TEAR_MASK }}
        >
          <dl className="font-mono text-[9px] tabular-nums">
            {rows.map(([label, sign, value]) => (
              <div key={label} className="flex items-baseline gap-1.5 py-[4px]">
                <dt className="flex min-w-0 items-baseline gap-1.5 font-sans text-[9px] text-[color-mix(in_srgb,var(--mmr-ink)_82%,transparent)]">
                  <span className={`w-2.5 shrink-0 text-center ${sign === "+" ? "text-[var(--mmr-success)]" : "text-[var(--mmr-muted-2)]"}`}>
                    {sign === "=" ? "" : sign}
                  </span>
                  {label}
                </dt>
                <span className="mb-[2px] min-w-2 flex-1 self-end border-b border-dotted border-[color-mix(in_srgb,var(--mmr-muted-2)_70%,transparent)]" />
                <dd className="shrink-0 text-[var(--mmr-ink)]">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 flex items-baseline justify-between gap-2 border-t-[2px] border-double border-[var(--mmr-ink)] pt-2">
            <p className="text-[10px] font-semibold text-[var(--mmr-ink)]">Safe to spend</p>
            <p className="font-mono text-[11.5px] font-bold tabular-nums text-[var(--mmr-ink)]">$600.00</p>
          </div>
        </div>
        <p className="mt-2.5 text-[8px] leading-relaxed opacity-60">
          Every line is a real term. Nothing here is a guess, and nothing is hidden behind a tap.
        </p>
      </div>
    </PhoneFrame>
  );
}
